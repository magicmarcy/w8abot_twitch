import {constants} from "../settings/botsettings.js"
import {formatString, reformatChannelname, reformatUsername} from "../utils/utils.js";
import {lerror, linfo, ltrace, lwarn} from "../utils/logger.js";
import {getDatabase, createStatement, getParam, getSingleParam} from "../utils/databaseUtils.js";
import {PARAMKONST} from "../utils/konst.js";

export function getPointsForUser(channel, username) {
    const commandFrom = reformatUsername(channel, username.toLowerCase());
    const channelName = reformatChannelname(channel);

    const statement = createStatement("SELECT POINTS FROM POINTS WHERE LOWER(CHANNEL) = :1 AND LOWER(USERNAME) = :2", [channelName, commandFrom]);
    const db = getDatabase();

    db.get(statement, (error, row) => {
        if (error) {
            lerror(channel, "Fehler beim Select...")
            return 0;
        } else {
            if (row) {
                return parseInt(row['POINTS']);
            } else {
                return 0;
            }
        }
    });
}

function callBack(points) {
    return points;
}

export async function addOrUpdateChannelPoints(message, channel, tags) {
    let command = await getParam(channel, PARAMKONST.COMMAND, "?");
    let pointsPerMsgActive = await getParam(channel, PARAMKONST.POINTS_PER_MSG_ACTIVE, "0");

    if (pointsPerMsgActive === "1" &&
        !message.startsWith(command) &&
        tags.username &&
        tags.username.toLowerCase() !== constants.BOT_USERNAME.toLowerCase() &&
        tags.username.toLowerCase() !== 'streamelements') {

        ltrace(channel, `addOrUpdateChannelPoints() -> Entry`)

        const commandFrom = reformatUsername(channel, tags.username.toLowerCase());
        const channelName = reformatChannelname(channel);

        ltrace(channel, formatString(`addOrUpdateChannelPoints() -> CommandFrom=%s, ChannelName=%s`, [commandFrom, channelName]));

        const statement = createStatement("SELECT POINTS FROM POINTS WHERE LOWER(CHANNEL) = :1 AND LOWER(USERNAME) = :2", [channelName, commandFrom]);
        const db = getDatabase();

        ltrace(channel, formatString(`addOrUpdateChannelPoints() -> Statement=%s`, [statement]));

        let pointsPerMsg = await getParam(channel, PARAMKONST.POINTS_PER_MSG, "0");
        let pointsPerMsgMulti = await getParam(channel, PARAMKONST.POINTS_PER_MSG_MULTI, "1");

        db.get(statement, (error, row) => {
            if (error) {
                lerror(channel, "Fehler beim Select...")
            } else {
                if (row) {
                    let actualPoints = parseInt(row['POINTS']);
                    let newPoints = actualPoints + (parseInt(pointsPerMsgMulti) * parseInt(pointsPerMsg));

                    linfo(channel, `User=${commandFrom}: ActualPoints=${actualPoints}, NewPoints=${newPoints}`);

                    const statement = createStatement("UPDATE POINTS SET POINTS = :1 WHERE LOWER(CHANNEL) = :2 AND LOWER(USERNAME) = :3", [newPoints, channelName, commandFrom]);
                    db.exec(statement);
                } else {
                    const statement = createStatement("INSERT INTO POINTS ('CHANNEL', 'USERNAME', 'POINTS') VALUES (:1, :2, :3)", [channelName, commandFrom, parseInt(pointsPerMsg)]);
                    db.exec(statement);
                }
            }
        });
    }
}

export async function showPoints(client, channel, tags, splittedMsg) {
    let commandFrom = reformatUsername(channel, tags.username.toLowerCase());
    let channelName = reformatChannelname(channel);
    let resultlist = [];

    ltrace(channel, `showPoints() -> Enter: channel=${channel} username=${commandFrom}`);

    if (commandFrom && channelName) {
        let statement = createStatement("SELECT USERNAME username, POINTS points FROM POINTS WHERE LOWER(CHANNEL) = :1 ORDER BY 2 DESC", [channelName]);
        ltrace(channel, "showPoints() -> Folgender SQL wird ausgefuehrt: " + statement);

        let db = getDatabase();

        db.all(statement, (error, row) => {
            if (error) {
                lerror(channel, "showPoints() -> Fehler beim Select-Statement!");
                lerror(channel, "showPoints() -> Es tut mir leid, ich kann momentan keine Verbindung zur Datenbank herstellen :-(")
                client.say(channel, `sry, @${commandFrom}, leider ist da etwas schiefgegangen. Ich habe dazu einen Error-Report erstellt.`);
            } else {
                if (row) {
                    // Alle Ergebnisse in die Liste packen
                    row.forEach((singlerow) => {
                        resultlist.push([singlerow.username, singlerow.points])
                    });
                } else {
                    lwarn(channel, "showPoints() -> Keine Daten vorhanden")
                }
            }

            let userInList = false;

            for (let i = 0; i < resultlist.length; i++) {
                if (resultlist[i][0] === commandFrom) {
                    userInList = true;

                    ltrace(channel, `User ${commandFrom} in Liste gefunden Punkte: ${resultlist[i][1]}, Platz ${i + 1}/${resultlist.length}`);

                    client.say(channel, `@${commandFrom} du hast ${resultlist[i][1]} Punkte und belegst damit Platz ${i + 1}/${resultlist.length}`);

                    return;
                }
            }

            if (!userInList && resultlist && resultlist.length > 0) {
                lwarn(channel, "showPoints() -> User nicht in Liste gefunden!");

                client.say(channel, `Leider hast du noch keine Punkte @${commandFrom}. Bleib am Ball denn für jede Chatnachricht die du schreibst (außer Commands) erhälst du 10 Punkte!`)
            }
        });
    } else {
        lwarn(channel, "showPoints() -> Entry: not enogh data submittet")
    }
}

export function showTopPoints(client, channel, tags, splittedMsg) {
    let commandFrom = reformatUsername(channel, tags.username.toLowerCase());
    let channelName = reformatChannelname(channel);
    let resultlist = [];
    let numberOfResults = 5;

    if (!isNaN(splittedMsg[1])) {
        let number =  splittedMsg[1];

        if (number > 20) {
            numberOfResults = 20;
        } else if (number > 0) {
            numberOfResults = number;
        }
    }

    ltrace(channel, `showTopPoints() -> Enter: channel=${channel} username=${commandFrom}`);

    if (commandFrom && channelName) {
        let statement = createStatement("SELECT USERNAME username, POINTS points FROM POINTS WHERE LOWER(CHANNEL) = :1 ORDER BY 2 DESC LIMIT :2", [channelName, numberOfResults]);
        ltrace(channel, "showTopPoints() -> Folgender SQL wird ausgefuehrt: " + statement);

        let db = getDatabase();

        db.all(statement, (error, row) => {
            if (error) {
                lerror(channel, "showTopPoints() -> Fehler beim Select-Statement!");
                lerror(channel, "showTopPoints() -> Es tut mir leid, ich kann momentan keine Verbindung zur Datenbank herstellen :-(")
                client.say(channel, `sry, @${commandFrom}, leider ist da etwas schiefgegangen. Ich habe dazu einen Error-Report erstellt.`);
            } else {
                if (row) {
                    // Alle Ergebnisse in die Liste packen
                    row.forEach((singlerow) => {
                        resultlist.push([singlerow.username, singlerow.points])
                    });
                } else {
                    ltrace(channel, "Keine Daten vorhanden")
                }
            }

            let result = "Top-Points: ";

            for (let i = 0; i < resultlist.length; i++) {
                let position = i + 1;
                result += `${position}: @${resultlist[i][0]} (${resultlist[i][1]}), `;
            }

            result = result.substring(0, result.length - 2);

            ltrace(channel, `showTopPoints() -> Result=${result}`);

            client.say(channel, result);
        });
    } else {
        lwarn(channel, "showTopPoints() -> Entry: not enogh data submittet")
    }
}

// ?givepoints 1000 @w8abit_de
export async function givePoints(client, channel, tags, splittedMsg) {
    let commandTo = splittedMsg[2] ? reformatUsername(channel, splittedMsg[2]) : "";
    let channelName = reformatChannelname(channel);
    let amount = splittedMsg[1];

    ltrace(channel, `givePoints() -> ${splittedMsg}`);

    if (isNaN(amount)) {
        lwarn(channel, "givePoints() -> Sry, hier muss ne Zahl stehen!");
        client.say(channel, "Sry, hier muss ne Zahl stehen!");
        return;
    }

    if (commandTo === "") {
        lwarn(channel, "givePoints() -> du muss '?givepoints WERT USER eingeben!");
        client.say(channel, "du muss '?setpoints WERT USER eingeben!");
        return;
    }

    let statement = createStatement("SELECT POINTS FROM POINTS WHERE LOWER(CHANNEL) = :1 AND LOWER(USERNAME) = :2", [channelName, commandTo]);
    ltrace(channel, `givePoints() -> ${statement}`);

    if (amount > 0) {
        let db = getDatabase();
        db.get(statement, (error, row) => {
            if (error) {
                lerror(channel, `givePoints() -> Fehler beim Ausführen des SELECT Statements`);
                client.say(channel, `Hier ist leider etwas schiefgegangen... sry`);
            } else {
                if (row) {
                    let userPoints = parseInt(row['POINTS']);
                    let newPoints = userPoints + parseInt(amount);
                    let statement = createStatement("UPDATE POINTS SET POINTS = :1 WHERE LOWER(CHANNEL) = :2 AND LOWER(USERNAME) = :3", [newPoints, channelName, commandTo]);
                    ltrace(channel, `givePoints() -> ${statement}`);
                    db.exec(statement);

                    let selectStatement = createStatement("SELECT POINTS FROM POINTS WHERE LOWER(CHANNEL) = :1 AND LOWER(USERNAME) = :2", [channelName, commandTo]);
                    ltrace(channel, `givePoints() -> ${selectStatement}`);
                    db.get(selectStatement, (error, row) => {
                        if (!error && row) {
                            ltrace(channel, `givePoints() -> Es wurden ${amount} Punkte dem Punktestand von @${commandTo} hinzugefügt. Damit hat @${commandTo} nun ${newPoints} Punkte.`);
                            client.say(channel, `Es wurden ${amount} Punkte dem Punktestand von @${commandTo} hinzugefügt. Damit hat @${commandTo} nun ${newPoints} Punkte.`);
                        }
                    });
                } else {
                    let statement = createStatement("INSERT INTO POINTS ('CHANNEL', 'USERNAME', 'POINTS') VALUES (:1, :2, :3)", [channelName, commandTo, amount]);
                    ltrace(channel, `givePoints() -> ${statement}`);
                    db.exec(statement);

                    ltrace(channel, `givePoints() -> Es wurden ${amount} Punkte dem Punktestand von @${commandTo} hinzugefügt. Damit hat @${commandTo} nun ${amount} Punkte.`);
                    client.say(channel, `Es wurden ${amount} Punkte dem Punktestand von @${commandTo} hinzugefügt. Damit hat @${commandTo} nun ${amount} Punkte.`);
                }
            }
        });
    }
}

export async function setPoints(client, channel, tags, splittedMsg) {
    let commandFrom = reformatUsername(channel, tags.username.toLowerCase());
    let commandTo = splittedMsg[2] ? reformatUsername(channel, splittedMsg[2]) : "";
    let channelName = reformatChannelname(channel);
    let amount = splittedMsg[1];
    let command = await getParam(channel, PARAMKONST.COMMAND, "?");

    ltrace(channel, `setPoints() -> ${splittedMsg}`);

    if (splittedMsg.length === 1) {
        ltrace(channel, `setPoints() -> @${commandFrom} schreibe \"${command}setpoints ANZAHL @USER\" um die Anzahl der Punkte zu setzen.`);
        client.say(channel, `@${commandFrom} schreibe \"${command}setpoints ANZAHL @USER\" um die Anzahl der Punkte zu setzen.`);
        return;
    }

    if (isNaN(amount)) {
        ltrace(channel, `setPoints() -> Sry, @${commandFrom} hier muss ne Zahl stehen!`);
        client.say(channel, `Sry, @${commandFrom} hier muss ne Zahl stehen!`);
        return;
    }

    if (commandTo === "") {
        ltrace(channel, "setPoints() -> @${commandFrom} du muss '?setpoints WERT USER eingeben!");
        client.say(channel, `@${commandFrom} du muss '?setpoints WERT USER eingeben!`);
        return;
    }

    if (amount < 0) {
        ltrace(channel, `setPoints() -> @${commandFrom} du kannst hier nur eine Ganzzahl eingeben!`);
        client.say(channel, `@${commandFrom} du kannst hier nur eine Ganzzahl eingeben!`);
        return;
    }

    let db = getDatabase();

    let statement = createStatement("UPDATE POINTS SET POINTS = :1 WHERE LOWER(CHANNEL) = :2 AND LOWER(USERNAME) = :3", [amount, channelName, commandTo]);
    ltrace(channel, `setPoints() -> ${statement}`);
    db.exec(statement);

    client.say(channel, `@${commandFrom} hat die Punkte von @${commandTo} auf ${amount} geändert.`)
}
