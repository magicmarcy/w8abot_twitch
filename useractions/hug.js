import sqlite3 from 'sqlite3';
import {reformatUsername, reformatChannelname} from "../utils/utils.js";
import {lerror, ltrace, lwarn} from "../utils/logger.js";
import {constants} from "../settings/botsettings.js"
import {createStatement, getParam} from "../utils/databaseUtils.js";
import {PARAMKONST} from "../utils/konst.js";

export async function hugUser(client, channel, tags, splittedMsg) {
    let channelName = reformatChannelname(channel);

    let hugActive = await getParam(channelName, PARAMKONST.HUG_ACTIVE, "0");

    if ("1" === hugActive) {
        let commandFrom = reformatUsername(channel, tags.username.toLowerCase());
        let commandTo = reformatUsername(channel, splittedMsg[1]);


        ltrace(channel, `hugUser() -> Enter: channel=${channel} hugger=${commandFrom} toHug=${commandTo}`);

        if (commandFrom && commandTo && channelName) {
            let statement = createStatement("SELECT AMOUNT FROM HUG WHERE LOWER(CHANNEL) = :1 AND LOWER(HUGGER) = :2 AND LOWER(TOHUG) = :3", [channelName, commandFrom, commandTo]);
            ltrace(channel, "hugUser() -> Folgender SQL wird ausgefuehrt: " + statement);

            let db = new sqlite3.Database('./' + constants.DATABASENAME);

            db.get(statement, (error, row) => {
                if (error) {
                    lerror(channel, "hugUser() -> Fehler beim Select-Statement!");
                    ltrace(channel, "hugUser() -> Es tut mir leid, ich kann momentan keine Verbindung zur Datenbank herstellen :-(")
                    client.say(channel, `sry, @${commandFrom}, leider ist da etwas schiefgegangen. Ich habe dazu einen Error-Report erstellt.`);
                } else {
                    if (row) {
                        ltrace(channel, `hugUser() -> Current Amount from SELECT: ${row['AMOUNT']}`);
                        let currentAmount = parseInt(`${row['AMOUNT']}`);
                        let newAmount = currentAmount + 1;

                        let statement = createStatement("UPDATE HUG SET AMOUNT = :1 WHERE LOWER(CHANNEL) = :2 AND LOWER(HUGGER) = :3 AND LOWER(TOHUG) = :4", [newAmount, channelName, commandFrom, commandTo]);
                        db.exec(statement);

                        ltrace(channel, "hugUser() -> Folgender SQL wird ausgefuehrt: " + statement);
                        ltrace(channel, `hugUser() -> @${commandFrom} umarmt @${commandTo} schon zum ${newAmount} Mal <3`);
                        client.say(channel, `@${commandFrom} umarmt @${commandTo} schon zum ${newAmount} Mal <3`);
                    } else {
                        let statement = createStatement("INSERT INTO HUG ('CHANNEL', 'HUGGER', 'TOHUG', 'AMOUNT') VALUES (:1, :2, :3, 1)", [channelName, commandFrom, commandTo]);
                        db.exec(statement);

                        ltrace(channel, "hugUser() -> Folgender SQL wird ausgefuehrt: " + statement);
                        ltrace(channel, `hugUser() -> Wohoooo, @${commandFrom} hat @${commandTo} zum ersten Mal umarmt <3`)
                        client.say(channel, `Wohoooo, @${commandFrom} hat @${commandTo} zum ersten Mal umarmt <3`)
                    }
                }
            });
        } else {
            lwarn(channel, "hugUser() -> Entry: not enogh data submittet")
        }
    }
}
