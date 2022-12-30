import {getRandomInt, reformatChannelname, reformatUsername} from "../utils/utils.js";
import {lerror, ltrace, lwarn} from "../utils/logger.js";
import {createStatement, getDatabase, getParam} from "../utils/databaseUtils.js";
import {PARAMKONST} from "../utils/konst.js";

// 2 Min = 120 Sekunden = 120000 ms;
const timeToAnswer = 120000; // ms
const timeToAnswerInMin = 120000 / 1000 / 60;

export async function performDuell(client, channel, tags, splittedMsg) {
    let channelName = reformatChannelname(channel);

    let duellAcvtive = await getParam(channelName, PARAMKONST.DUELL_ACTIVE, "0");
    let command = await getParam(channel, PARAMKONST.COMMAND, "?");

    if (duellAcvtive === "1") {
        ltrace(channel, `performDuell() -> Entry`);

        let challenger = reformatUsername(channel, tags.username);

        let db = getDatabase();

        // Zu beginn loeschen wir erstmal alle abgelaufenen Duelle aus der Datenbank
        let deleteDate = (Date.now() / 1000) - (timeToAnswer / 1000);
        const deleteStatement = createStatement("DELETE FROM DUELL WHERE LOWER(CHANNEL) = :1 AND CREATED < :2", [channelName, deleteDate]);
        db.exec(deleteStatement);

        if (splittedMsg.length !== 3 || isNaN(splittedMsg[1])) {
            ltrace(channel, `performDuell() -> Message: ${splittedMsg}`);

            client.say(channel, `Du kannst einen anderen Spieler zu einem Duell herausfordern. Schreibe dazu einfach "${command}duell EINSATZ @USERNAME" in de Chat. Dein Kontrahent hat dann ${timeToAnswerInMin} Minuten Zeit die Herausforderung mit "${command}accept" anzunehmen. Gewinnst du, erhälst du deine Punkte zurück und die gleiche Anzahl an Punkten deines Kontrahenten.`);

            return;
        }

        if (challenger === reformatUsername(channel, splittedMsg[2].toLowerCase())) {
            ltrace(channel, `performDuell() -> Message: ${splittedMsg}`);

            client.say(channel, `Hey @${challenger}, du kannst kein Duell gegen dich selbst spielen.`);

            return;
        }

        const statement = createStatement("SELECT POINTS FROM POINTS WHERE LOWER(CHANNEL) = :1 AND LOWER(USERNAME) = :2", [channel, challenger]);

        db.get(statement, (error, row) => {
            if (error) {
                lerror(channel, "getPoints() -> Fehler beim Select...")
                return 0;
            } else {
                if (row) {
                    let userPoints = row['POINTS'];
                    let amount = parseInt(splittedMsg[1]);
                    let opponent = reformatUsername(channel, splittedMsg[2]);

                    ltrace(channel, "Amount: " + amount + " UserPoints: " + userPoints);

                    if (amount > userPoints) {
                        client.say(channel, `@${challenger}, du hast nicht genügend Punkte für dieses Duell!`)
                    } else {
                        const statement = createStatement("SELECT CHANNEL, CHALLENGER, OPPONENT, AMOUNT, CREATED FROM DUELL WHERE LOWER(CHANNEL) = :1 AND LOWER(CHALLENGER) = :2 AND LOWER(OPPONENT) = :3", [channelName, challenger, opponent])

                        ltrace(channel, `Folgender SQL wird ausgefuehrt: ${statement}`);

                        db.get(statement, (error, row) => {
                            if (error) {
                                lerror(channel, `Fehler beim Selektieren nach einem bestehenden Duell`);
                            } else {
                                ltrace(channel, `Kein Error, gibt es ein Result?`);

                                if (row) {
                                    // Das bedeutet, es gibt bereits einen Eintrag - jetzt muessen wir pruefen, ob die Zeit abgelaufen ist...
                                    // https://www.unixtimestamp.com/
                                    let currentTimestamp = Math.trunc(Date.now() / 1000); // in SEKUNDEN!

                                    if (currentTimestamp > (parseInt(row['CREATED']) + (timeToAnswer / 1000))) {
                                        ltrace(channel, `Current Timestamp: ${currentTimestamp}, Timestamp from DB: ${row['CREATED']}, TimeToAnswer: ${timeToAnswer}`);
                                        ltrace(channel, `Current Timestamp: ${currentTimestamp}, From DB + Wait ${parseInt(row['CREATED']) + timeToAnswer}`);

                                        // gab ein Duell, ist aber schon abgelaufen - also löschen wir das
                                        const statement = createStatement("DELETE FROM DUELL WHERE LOWER(CHANNEL) = :1 AND LOWER(CHALLENGER) = :2 AND LOWER(OPPONENT) = :3", [channelName, challenger, opponent]);
                                        // TODO: Just for Dev - momentan noch nix löschen!
                                        // db.exec(statement);

                                        ltrace(channel, `Folgender SQL wird ausgefuehrt: ${statement}`);

                                        ltrace(channel, "gab ein Duell, hab ich gelöscht^^");
                                        ltrace(channel, "Jetzt ein neues Einfügen...");

                                        addNewDuell(db, client, channel, challenger, opponent, amount, command);
                                    } else {
                                        ltrace(channel, `Jo, hier gibts ein Ergebnis: Channel: ${row['CHANNEL']}, Challenger: ${row['CHALLENGER']}, Opponent: ${row['OPPONENT']}, Amount: ${row['AMOUNT']}, Created: ${row['CREATED']}, Current: ${Math.trunc(Date.now() / 1000)}`);

                                        client.say(channel, `Es gibt noch ein offenes Duell zwischen @${challenger} und @${opponent}. Dieses muss erst durchgeführt werden oder die Zeit muss abgelaufen sein.`);

                                        return;
                                    }
                                } else {
                                    ltrace(channel, `Kein offenes Duell ... dann einfügen ;-)`);
                                    addNewDuell(db, client, channel, challenger, opponent, amount, command);
                                }
                            }
                        })


                    }
                } else {
                    lwarn(channel, `Es konnte keine Punkte ermittelt werden, SQL liefert kein Result!`);
                    client.say(channel, `Hey @${challenger}, leider gab es Probleme beim Ermitteln deiner Punkte o_O`);
                }
            }
        });
    }
}

function addNewDuell(db, client, channel, challenger, opponent, amount, command) {
    let channelName = reformatChannelname(channel);
    let dateNow = Math.trunc(Date.now() / 1000);

    const statement = createStatement(
        "INSERT INTO DUELL (CHANNEL, CHALLENGER, OPPONENT, AMOUNT, CREATED) VALUES (:1, :2, :3, :4, :5)",
        [channelName, challenger, opponent, amount, dateNow]);
    db.exec(statement);

    client.say(channel, `@${challenger} fordert @${opponent} zu einem Duell heraus! Es geht um ${amount} Punkte! @${opponent}, du kannst das Duell mit ${command}accept annehmen und dich der Herausforderung stellen (wenn du genügend Punkte hast). Du hast dafür nur ${timeToAnswerInMin} Min Zeit! Viel Glück!`);
}

export async function acceptDuell(client, channel, tags, splittedMsg) {
    let channelName = reformatChannelname(channel);

    let duellAcvtive = await getParam(channelName, PARAMKONST.DUELL_ACTIVE, "0");

    if (duellAcvtive === "1") {
        let opponent = reformatUsername(channel, tags.username);

        let db = getDatabase();

        // Zu beginn loeschen wir erstmal alle abgelaufenen Duelle aus der Datenbank
        let deleteDate = (Date.now() / 1000) - (timeToAnswer / 1000);
        const deleteStatement = createStatement("DELETE FROM DUELL WHERE LOWER(CHANNEL) = :1 AND CREATED < :2", [channelName, deleteDate]);
        db.exec(deleteStatement);


        const statement = createStatement("SELECT CHANNEL, CHALLENGER, OPPONENT, AMOUNT, CREATED FROM DUELL WHERE LOWER(CHANNEL) = :1 AND LOWER(OPPONENT) = :2 AND CREATED >= :3", [channelName, opponent, ((Date.now() / 1000) - (timeToAnswer / 1000))]);

        db.get(statement, (error, row) => {
            if (error) {
                lerror(channel, `Fehler beim Selektieren nach einem bestehenden Duell`);
            } else {
                if (row) {
                    let amount = parseInt(row['AMOUNT']);
                    let challenger = row['CHALLENGER'];
                    let created = row['CREATED'];

                    // Punkte des Opponent bestimmen
                    const statement = createStatement("SELECT POINTS FROM POINTS WHERE LOWER(CHANNEL) = :1 AND LOWER(USERNAME) = :2", [channel, opponent]);
                    db.get(statement, (error, row) => {
                        if (error) {
                            lerror(channel, `Fehler beim Ausfuehren des SELECTs`);
                        } else {
                            if (row) {
                                let userPoints = parseInt(row['POINTS']);

                                if (amount > userPoints) {
                                    client.say(channel, `Sorry @${opponent}, du hast nicht genug Punkte`);

                                } else {
                                    // genug Punkte vorhande, Duell vorhanden, jetzt kanns losgehen
                                    const possibleResult = [challenger, opponent, challenger, opponent, challenger, opponent, challenger, opponent, challenger, opponent];

                                    let winner = possibleResult[getRandomInt(0, possibleResult.length)];

                                    // Falls es hier mal zu einem Fehler kommen sollte gewinnt immer der Herausgeforderte
                                    if (!winner) {
                                        winner = opponent;
                                    }

                                    ltrace(channel, `Winner is ${winner}`);

                                    if (winner === opponent) {
                                        ltrace(channel, `Der Opponent hat gewonnen!`);

                                        client.say(channel, `@${opponent} hat gewonnen und gewinnt ${amount} Punkte von @${challenger}!`);

                                        updatePoints(client, db, channel, opponent, amount);
                                        updatePoints(client, db, channel, challenger, (amount * -1));
                                    } else if (winner === challenger) {
                                        ltrace(channel, `Der Challenger hat gewonnen!`);

                                        client.say(channel, `@${challenger} hat gewonnen und gewinnt ${amount} Punkte von @${opponent}`);

                                        updatePoints(client, db, channel, challenger, amount);
                                        updatePoints(client, db, channel, opponent, (amount * -1));
                                    }

                                    deleteDuell(db, channelName, challenger, opponent, created);
                                }
                            }
                        }
                    });
                } else {
                    // Kein aktuelles Duell mehr  gefunden
                    client.say(channel, `Es gibt aktuell keinen der dich zu einem Duell herausgefordert hat, @${opponent}.`);
                }
            }
        });
    }
}

function deleteDuell(db, channel, challenger, opponent, created) {
    console.log(`channel:${channel}, challenger:${challenger}, opponent:${opponent}, created:${created}`);

    const statement = createStatement("DELETE FROM DUELL WHERE LOWER(CHANNEL) = :1 AND LOWER(CHALLENGER) = :2 AND LOWER(OPPONENT) = :3 AND CREATED = :4", [channel, challenger, opponent, created]);
    db.exec(statement);
}

function updatePoints(client, db, channel, username, pointsToAdd) {
    const statement = createStatement("SELECT POINTS FROM POINTS WHERE LOWER(CHANNEL) = :1 AND LOWER(USERNAME) = :2", [channel, username]);

    db.get(statement, (error, row) => {
        if (error) {
            lerror(channel, `Fehler beim Ermitteln der Punkte`);
        } else {
            if (row) {
                ltrace(channel, `Punkte von ${username} ermittelt: ${row['POINTS']}`);

                let userPointsOld = parseInt(row['POINTS']);
                let newPoints = userPointsOld + pointsToAdd;

                ltrace(channel, `Neue Punkte: ${newPoints} (+/- ${pointsToAdd})`);

                const statement = createStatement("UPDATE POINTS SET POINTS = :1 WHERE LOWER(CHANNEL) = :2 AND LOWER(USERNAME) = :3", [newPoints, channel, username]);
                db.exec(statement);
            } else {
                client.say(channel, `Leider konnten keine Punkte ermittelt werden.`);
            }
        }
    })
}
