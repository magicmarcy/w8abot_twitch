import {createStatement, existsSocialEntry, existsTable, getDatabase} from "../utils/databaseUtils.js";
import {lerror, ltrace, lwarn} from "../utils/logger.js";
import {reformatChannelname} from "../utils/utils.js";

export async function showSocials(client, channel, tags, message) {
    let channelName = reformatChannelname(channel);

    let exists = "1" === await existsTable(channel, "SOCIALS");

    // Wenn die Tabelle nicht existiert oder keine Eintraege vorhanden sind, geben wir auch nichts aus!
    if (exists) {
        let db = getDatabase();
        const statement = createStatement("SELECT NAME, LINK FROM SOCIALS WHERE LOWER(CHANNEL) = :1", [channelName]);

        let resultString = '';

        db.all(statement, (error, row) => {
            if (error) {
                lerror(channel, "showSocials() -> Fehler beim Select-Statement!");
            } else {
                if (row) {
                    row.forEach((singlerow) => {
                        resultString += singlerow['NAME'] + ": " + singlerow['LINK'] + " | ";
                    });

                    if (resultString.length > 3) {
                        client.say(channel, `Meine Socials: ${resultString.substring(0, resultString.length - 3)}`);
                    }
                } else {
                    lwarn(channel, "showSocials() -> Keine Daten vorhanden");
                }
            }
        });
    } else {
        lerror(channel, `showSocials() -> Tabelle existiert nicht`);
    }
}

// ?addSocial NAME LINK
export async function addSocial(client, channel, tags, message) {
    let channelName = reformatChannelname(channel);
    let splittedmsg = message.split(" ");

    console.log(message);

    if (splittedmsg.length === 3) {
        let socialName = splittedmsg[1];
        let socialLink = splittedmsg[2];

        // pruefen ob die Tabelle ueberhaupt schon existiert
        let exists = "1" === await existsTable(channel, "SOCIALS");

        if (!exists) {
            ltrace(channel, `addSocial() ->Tabelle SOCIALS existiert noch nicht, lege Tabelle an`);
            let result = await createTableSocials(channel);

            if (!result) {
                client.say(channel, `Leider gab es einen Fehler beim Anlegen der Daten.`);
                return;
            }
        }

        // jetzt pruefen ob es bereits einen Eintrag gibt mit dem Namen
        let existsEntry = "1" === await existsSocialEntry(channel, socialName);

        if (!existsEntry) {
            let db = getDatabase();

            // Der Link darf nicht ueber das createStatement hinzugefuegt werden da sonst Zeichen verschwinden
            const statement = createStatement(`INSERT INTO SOCIALS ('CHANNEL', 'NAME', 'LINK') VALUES (:1, :2, '${socialLink}')`, [channelName, socialName]);
            db.exec(statement);

            client.say(channel, `Eintrag erfolgreich hinzugefügt`);

        } else {
            client.say(channel, `Es existiert bereits ein Eintrag mit dem Namen ${socialName}`);
        }
    } else {
        client.say(channel, `Du musst einen Namen und einen Link eingeben! Beispiel: addSocial INSTA LINK`);
    }

}

// ?editSocial NAME LINK
export async function editSocial(client, channel, tags, message) {
    let splittedMsg = message.split(" ");

    if (splittedMsg.length === 3) {
        let channelName = reformatChannelname(channel);
        let socialName = splittedMsg[1];
        let socialLink = splittedMsg[2];

        // pruefen ob die Tabelle ueberhaupt existiert
        let existTable = "1" === await existsTable(channel, "SOCIALS");
        let existEntry = "1" === await existsSocialEntry(channel, socialName);

        if (!existTable || !existEntry) {
            client.say(channel, `Es wurde kein Eintrag gefunden`);
        } else {
            let db = getDatabase();
            const statement = createStatement(`UPDATE SOCIALS SET LINK = '${socialLink}' WHERE LOWER(CHANNEL) = :1 AND LOWER(NAME) = :2`, [channelName, socialName.toLowerCase()]);
            try {
                db.exec(statement);
            } catch (err) {
                client.say(channel, `Leider ist ein Fehler beim Aktualisieren des Eintrags aufgetreten`);

                return;
            }

            client.say(channel, `Eintrag aktualisiert`);
        }
    } else {
        client.say(channel, `Um einen SoccialEntry zu bearbeiten schreibe editSocial NAME LINK`);
    }
}

// ?removeSocial NAME
export async function removeSocial(client, channel, tags, message) {
    let splittedMsg = message.split(" ");

    if (splittedMsg.length === 2) {
        let channelName = reformatChannelname(channel);
        let socialName = splittedMsg[1];

        // pruefen ob die Tabelle ueberhaupt existiert
        let existTable = "1" === await existsTable(channel, "SOCIALS");
        let existEntry = "1" === await existsSocialEntry(channel, socialName);

        if (!existTable || !existEntry) {
            client.say(channel, `Es wurde kein Eintrag gefunden`);
        } else {
            let db = getDatabase();
            const statement = createStatement(`DELETE FROM SOCIALS WHERE LOWER(CHANNEL) = :1 AND LOWER(NAME) = :2`, [channelName, socialName.toLowerCase()]);
            try {
                db.exec(statement);
            } catch (err) {
                client.say(channel, `Leider ist ein Fehler beim Löschen des Eintrags aufgetreten`);

                return;
            }

            client.say(channel, `Eintrag gelöscht`);
        }
    } else {
        client.say(channel, `Um einen SoccialEntry zu löschen schreibe removeSocial NAME`);
    }
}

async function createTableSocials(channel) {
    let db = getDatabase();
    const statement = "CREATE TABLE 'SOCIALS' ('CHANNEL' TEXT, 'NAME' TEXT, 'LINK' TEXT)";
    db.exec(statement);

    let exists = "1" === await existsTable(channel, "SOCIALS");

    if (exists) {
        ltrace(channel, `Tabelle SOCIALS erfolgreich angelegt`);
        return true;
    } else {
        ltrace(channel, `Tabbele SOCIALS konnte nicht angelegt werden`);
        return false;
    }
}
