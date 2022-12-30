import sqlite3 from 'sqlite3';
import {reformatUsername, reformatChannelname} from "../utils/utils.js";
import {createStatement, getParam} from "../utils/databaseUtils.js";
import {ltrace} from "../utils/logger.js";
import {constants} from "../settings/botsettings.js"
import {PARAMKONST} from "../utils/konst.js";

export async function gamble(client, channel, tags, splittedMsg) {
    if (splittedMsg && splittedMsg[1] == null || splittedMsg[1] === '') {
        return;
    }

    let channelName = reformatChannelname(channel);
    let gambleActive = await getParam(channelName, PARAMKONST.GAMBLE_ACTIVE, "0");

    if ("1" === gambleActive) {
        ltrace(channel, `gamble() -> Entry`);

        let commandFrom = reformatUsername(channel, tags.username.toLowerCase());

        let statement = createStatement("SELECT POINTS FROM POINTS WHERE LOWER(CHANNEL) = :1 AND LOWER(USERNAME) = :2", [channelName, commandFrom]);
        ltrace(channel, `gamble()= -> ${statement}`);
        let db = new sqlite3.Database('./' + constants.DATABASENAME);

        let amount = splittedMsg[1];
        let gambleAll = false;

        db.get(statement, async (error, row) => {
            if (error) {
                error(channel, `gamble()= -> Fehler beim Selet aufgetreten!`);
            } else {
                if (row) {
                    let userPoints = parseInt(row['POINTS']);
                    ltrace(channel, `gamble()= -> UserPoints: ${userPoints}`);

                    if (amount.includes("%")) {
                        let prozent = 0;
                        prozent = amount.replace("%", "");

                        if (isNaN(prozent) || prozent == 0) {
                            ltrace(channel, `gamble() -> Sry @${commandFrom}, aber was soll denn da gegambled werden?`);
                            client.say(channel, `Sry @${commandFrom}, aber was soll denn da gegambled werden?`);
                        }

                        amount = Math.round(userPoints * prozent / 100);

                        ltrace(channel, `gamble()= -> User-Punkte: ${userPoints} Prozent: ${prozent} entspricht ${amount}`);
                    }

                    if (isNaN(amount) && amount.toLowerCase() === 'all') {
                        amount = userPoints;
                        gambleAll = true;

                        ltrace(channel, `gamble()= -> Amount: ${statement}, GambleAll: ${gambleAll}`);

                    } else if (isNaN(amount) && amount.toLowerCase() !== 'all') {
                        ltrace(channel, `gamble() -> Sry @${commandFrom}, aber was soll denn da gegambled werden?`);
                        client.say(channel, `Sry @${commandFrom}, aber was soll denn da gegambled werden?`);
                        return;
                    }

                    if (userPoints <= 0) {
                        ltrace(channel, `gamble() -> @${commandFrom} du hast keine Punkte zum gamblen :-(`);
                        client.say(channel, `@${commandFrom} du hast keine Punkte zum gamblen :-(`);
                        return;
                    }

                    if (amount <= 0) {
                        ltrace(channel, `gamble() -> Sry @${commandFrom}, was versuchst du hier? Anzeige ist raus! Kappa`);
                        client.say(channel, `Sry @${commandFrom}, was versuchst du hier? Anzeige ist raus! Kappa`);
                        return;
                    }

                    if (amount > userPoints) {
                        ltrace(channel, `gamble() -> Sry @${commandFrom}, du kannst nicht mehr setzen als du hast! (Deine Punkte: ${userPoints})`);
                        client.say(channel, `Sry @${commandFrom}, du kannst nicht mehr setzen als du hast! (Deine Punkte: ${userPoints})`);
                        return;
                    }

                    let gewinn = await getParam(channel, PARAMKONST.GAMBLE_CHANCE_TO_WIN, "100");
                    const gewinnChance = parseInt(gewinn);
                    const verlustChance = 100 - gewinnChance;
                    ltrace(channel, `gamble() -> Gewinnchance: ${gewinnChance}%, Verlustcchance: ${verlustChance}%`);
                    const possibilities = [{result: true, pct: gewinnChance}, {result: false, pct: verlustChance}];
                    let expanded = possibilities.flatMap(possibility => Array(possibility.pct).fill(possibility));
                    let winner = expanded[Math.floor(Math.random() * expanded.length)];
                    ltrace(channel, `gamble() -> winner: ` + winner.result);

                    if (winner.result === false) {
                        let newResult = userPoints - parseInt(amount);
                        let statement = createStatement("UPDATE POINTS SET POINTS = :1 WHERE LOWER(CHANNEL) = :2 AND LOWER(USERNAME) = :3", [newResult, channelName, commandFrom]);
                        ltrace(channel, `gamble() -> ${statement}`);
                        db.exec(statement);

                        if (gambleAll) {
                            ltrace(channel, `gamble() -> @${commandFrom} hat es geschafft ${amount} Punkte zu verlieren obwohl es nur eine ${verlustChance}%igee Chance zu verlieren gab NotLikeThis`);
                            client.say(channel, `@${commandFrom} hat es geschafft ${amount} Punkte zu verlieren obwohl es nur eine ${verlustChance}%ige Chance zu verlieren gab NotLikeThis`);
                        } else {
                            ltrace(channel, `gamble() -> @${commandFrom} hat es geschafft ${amount} Punkte zu verlieren obwohl es nur eine ${verlustChance}%ige Chance zu verlieren gab und hat nun ${newResult} Punkte NotLikeThis`);
                            client.say(channel, `@${commandFrom} hat es geschafft ${amount} Punkte zu verlieren obwohl es nur eine ${verlustChance}%ige Chance zu verlieren gab und hat nun ${newResult} Punkte NotLikeThis`);
                        }
                    } else if (winner.result === true) {
                        let newResult = userPoints + parseInt(amount);
                        let statement = createStatement("UPDATE POINTS SET POINTS = :1 WHERE LOWER(CHANNEL) = :2 AND LOWER(USERNAME) = :3", [newResult, channelName, commandFrom]);
                        ltrace(channel, `gamble() -> ${statement}`);
                        db.exec(statement);
                        ltrace(channel, `gamble() -> Geil, @${commandFrom} hat gewonnen und nun ${newResult} Punkte!`)
                        client.say(channel, `Geil, @${commandFrom} hat gewonnen und nun ${newResult} Punkte!`)
                    }
                } else {
                    ltrace(channel, `gamble() -> ${commandFrom} leider konnte keine Daten zu deine Punkten abgerufen werden, sry :-(`);
                    client.say(channel, `${commandFrom} leider konnte keine Daten zu deine Punkten abgerufen werden, sry :-(`);
                }
            }
        });
    }
}
