// eine To-Do Liste fuer den Streamer. Hier koennen Mods und der Streamer etwas hinzufuegen
// oder generell ein Listensystem...
//
// ?liste 1 new
// Fuegt eine neue Liste mit dem Namen 1 hinzu

// ?liste 2 add "Hier was adden"
// Fuegt der Liste 2 einen neuen Eintrag hinzu

// ?liste 2
// zeigt die Liste 2 an: 1. ABC, 2. DEF, 3. GHI, usw

// ?liste 2 delete 1
// loescht Eintrag 1 aus Liste 2

// danach ?liste 2
// zeigt die Liste 2 an: 1. ABC, 2. GHI, usw

import {reformatChannelname, splitAndResolveString} from "../utils/utils.js";
import {lerror, ltrace, lwarn} from "../utils/logger.js";
import {createStatement, getDatabase} from "../utils/databaseUtils.js";
import {botsay} from "../start.js";

const db = getDatabase();

// Command: ?liste NAME, bzw. ?liste "Cooler Name"
export async function performShowList(client, channel, message) {
    let splittedMsg = splitAndResolveString(message);
    let listName;

    if (splittedMsg.length === 2) {
        listName = splittedMsg[1];

        // [0] = CHANNEL, [1] = LISTNAME, [2] = LISTENTRY, [3] = CONTENT
        const resultList = await selectList(channel, listName);

        if (resultList.length >= 1) {
            let resultString = "Liste " + resultList[0][1].toUpperCase() + ": ";

            for (const item of resultList) {
                resultString += item[2] + ". " + item[3] + " ";
            }

            await botsay(channel, resultString);
        } else {
            await botsay(channel, `Ich konnte keine Liste mit dem Namen "${listName}" finden.`);
        }
    }
}

export async function addList(client, channel, tags, splittedMsg) {
    let channelName = reformatChannelname(channel);
    let listName = splittedMsg[1];

    if (splittedMsg.length >= 3) {

        let listContent = "";

        for (let i = 2; i < splittedMsg.length; i++) {
            listContent += splittedMsg[i] + " ";
        }

        // pruefen ob es bereits eine Liste mit diesem Namen gibt!
        const resultList = await selectList(channel, listName);

        if (!resultList || resultList.length === 0) {
            const insertStatement = createStatement("INSERT INTO LISTS(CHANNEL, LISTNAME, LISTENTRY, CONTENT) VALUES(:1, :2, 1, :3)", [channelName, listName.toLowerCase(), listContent]);
            db.exec(insertStatement);

            await botsay(channel, `Liste ${listName} angelegt`);
        } else {
            await botsay(channel, `Es ist bereits eine Liste mit dem Namen ${listName} vorhanden.`);
        }
    } else {
        await botsay(channel, `Eine neue Liste muss beim Erzeugen einen Eintrag enthalten. Schreibe dazu "?addliste LISTENNAME CONTENT"`);
    }
}

export async function removeList(channel, splittedMsg) {
    let channelName = reformatChannelname(channel);
    let listName = splittedMsg[1];

    if (splittedMsg.length === 2) {

        // pruefen ob es diese Liste mit diesem Namen gibt!
        const resultList = await selectList(channel, listName);

        if (!resultList || resultList.length === 0) {
            await botsay(channel, `Es existiert keine Liste mit dem Namen ${listName}`);
        } else {
            await deleteList(channel, channelName, listName);

            await botsay(channel, `Liste gelöscht`);
        }
    } else {
        await botsay(channel, `Um eine Liste zu löschen schreibe "?removelist LISTENNAME"`);
    }
}

// ?removeFromList LISTNAME NUMMER
export async function removeFromList(channel, splittedMsg) {
    // Das schwierige ist hier, dass wir, wenn ein Eintrag gelöscht wird, alle Nummern updaten müssen!
    let channelName = reformatChannelname(channel);
    let listName = splittedMsg[1];
    console.log("listName: " + listName);

    console.log("SplittedMsg: " + splittedMsg);

    if (splittedMsg.length === 3) {
        if (isNaN(splittedMsg[2])) {
            await botsay(channel, `Du musst die Nummer des zu löschenden Eintrags angeben`);
            return;
        }

        let numberToDelete = splittedMsg[2]

        console.log("numbereToDelete: " + numberToDelete);

        // pruefen ob es diese Liste mit diesem Namen gibt!
        const resultList = await selectList(channel, listName);

        if (!resultList || resultList.length === 0) {
            await botsay(channel, `Es existiert keine Liste mit dem Namen ${listName}`);
        } else {
            console.log("Jop, sind hier beim Delete angekommen...");

            await removeSatzFromList(channel, channelName, listName.toLowerCase(), numberToDelete);

            await botsay(channel, `Eintrag gelöscht`);

            // Ja und jetzt neu selektieren und neu Nummerieren
            const listEntries = await selectList(channel, listName);

            for (let i = 0; i < listEntries.length; i++) {
                console.log("ChannelName=" + channelName + ", ListName=" + listName, "EntryNo to update=" + (i + 1), "Content=" + listEntries[i][3]);
                let entryToUpdate = (i + 1);
                let content = listEntries[i][3];

                await updateListEntry(channel, channelName, listName, entryToUpdate, content);
            }


        }
    } else {
        await botsay(channel, `Um eine Eintrag aus einer Liste zu entfernen schreibe "?removefromlist LISTENNAME EINTRAGSNUMMER"`);
    }
}

// ?addtolist LISTNAME CONTENT
export async function addToList(channel, splittedMsg) {
    let channelName = reformatChannelname(channel);
    let listName = splittedMsg[1];

    if (splittedMsg.length >= 3) {

        // pruefen ob es diese Liste mit diesem Namen gibt!
        const resultList = await selectList(channel, listName);

        if (!resultList || resultList.length === 0) {
            await botsay(channel, `Es existiert keine Liste mit dem Namen ${listName}`);
        } else {
            // den letzten Satz aus der Liste holen, damit wir wissen, welchen wir danach einfuegen koenne
            let lastNumber = resultList[resultList.length - 1][2];
            let newNumber = lastNumber + 1;

            let listContent = "";

            for (let i = 2; i < splittedMsg.length; i++) {
                listContent += splittedMsg[i] + " ";
            }

            await insertIntoList(channel, channelName, listName.toLowerCase(), newNumber, listContent);

            await botsay(channel, `Eintrag hinzugefügt`);
        }
    } else {
        await botsay(channel, `Um eine Eintrag hinzuzufügen schreibe "?addtolist LISTENNAME CONTENT"`);
    }
}

// -----------------------------------------------------------
// DATABASE FUNCTIONS
// -----------------------------------------------------------

export async function selectList(channel, listname) {
    return await new Promise((resolve) => {
        const channelName = reformatChannelname(channel);

        const resultlist = [];

        const statement = createStatement("SELECT CHANNEL channel, LISTNAME listname, LISTENTRY listentry, CONTENT content FROM LISTS WHERE LOWER(CHANNEL) = :1 AND LOWER (LISTNAME) = :2 ORDER BY LISTENTRY", [channelName, listname.toLowerCase()]);

        db.all(statement, (error, row) => {
            if (error) {
                lerror(channel, "getAllAnswers() -> Fehler beim Select-Statement!");
            } else {
                if (row) {
                    // Alle Ergebnisse in die Liste packen
                    row.forEach((singlerow) => {
                        resultlist.push([singlerow.channel, singlerow.listname, singlerow.listentry, singlerow.content])
                    });

                    resolve(resultlist);
                } else {
                    lwarn(channel, "getAllAnswers() -> Keine Daten vorhanden")
                }
            }
        });
    });
}

export async function deleteList(channel, channelName, listName) {
    const deleteStatement = createStatement("DELETE FROM LISTS WHERE LOWER(CHANNEL) = :1 AND LOWER(LISTNAME) = :2", [channelName, listName]);
    ltrace(channel, `Folgender SQL wird ausgefuehrt: ${deleteStatement}`);
    db.exec(deleteStatement);
}

export async function insertIntoList(channel, channelName, listName, listNumber, content) {
    const insertStatement = createStatement("INSERT INTO LISTS(CHANNEL, LISTNAME, LISTENTRY, CONTENT) VALUES(:1, :2, :3, :4)", [channelName, listName.toLowerCase(), listNumber, content]);
    ltrace(channel, `Folgender SQL wird ausgefuehrt: ${insertStatement}`);
    db.exec(insertStatement);
}

export async function removeSatzFromList(channel, channelName, listName, numberToDelete) {
    const removeStatement = createStatement("DELETE FROM LISTS WHERE LOWER(CHANNEL) = :1 AND LOWER(LISTNAME) = :2 AND LISTENTRY = :3", [channelName, listName, numberToDelete]);
    ltrace(channel, `Folgender SQL wird ausgefuehrt: ${removeStatement}`);
    db.exec(removeStatement);
}

export async function updateListEntry(channel, channelName, listName, listEntry, content) {
    const updateStatement = createStatement("UPDATE LISTS SET LISTENTRY = :1 WHERE LOWER(CHANNEL) = :2 AND LOWER(LISTNAME) = :3 AND LOWER(CONTENT) = :4", [listEntry, channelName, listName, content.toLowerCase()]);
    ltrace(channel, `Folgender SQL wird ausgefuehrt: ${updateStatement}`);
    db.exec(updateStatement);
}
