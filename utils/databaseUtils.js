import sqlite3 from "sqlite3";
import {constants} from "../settings/botsettings.js";
import {lerror, ltrace} from "./logger.js";
import {reformatChannelname, reformatUsername} from "./utils.js";
import {TEXTKONST} from "./konst.js";

export function getDatabase() {
    return new sqlite3.Database('./' + constants.DATABASENAME);
}

/**
 * Ersetzt alle :ZAHL im Statement mit den uebergebene Params und gibt das korrigierte Statement wieder zurueck
 * @param sql
 * @param params
 */
export function createStatement(sql, params) {
    // alle Params pruefen ob evtl. verbotene Zeichen drin sind!
    for (let i = 0; i < params.length; i++) {
        if (isNaN(params[i])) {
            params[i] = params[i].replace(/[^0-9a-zA-Z_ ]/g, "");
        }
    }

    for (let i = 0; i < params.length; i++) {
        let param = isNaN(params[i]) ? '\'' + params[i] + '\'' : params[i];

        sql = sql.replace(':' + (i + 1), param);
    }

    return sql;
}


/**
 * Wie immer:
 * Ein Parameter mit #### angelegt, gilt grundsaetzlich fuer alle Channel. Gibt es allerdings den Identischen Parameter mit einem
 * Channelnamen statt ####, gilt dieser fuer den betroffenen Channel!
 *
 * Datenbankmodell (Beispiel):
 * PARAMNAME     | VALUE | CHANNEL
 * GAMBLE_ACTIVE |   1   | w8abit_de
 * GAMBLE_ACTIVE |   0   | ####
 * @param paramName
 */
export function getParameterDefaultValue(paramName) {
    return getParameterValue(paramName, "####");
}

export function getParameterValue(paramName, channel) {
    let db = new sqlite3.Database('./' + constants.PARAMDATABASE);
    let statement = createStatement("SELECT VALUE FROM PARAMS WHERE NAME = :1 AND CHANNEL = :2", [paramName, channel]);
}

// **********************************************************************************************************************************
//             AB HIER NEUE METHODEN - BESSER ;-)
// **********************************************************************************************************************************

/**
 * Gibt die Value eines uebergebenen Parameters zurueck. Im Fehlerfall oder wenn kein Wert fuer den Channel oder Global gefunden werden kann,
 * wird die uebergebene DefaultValue zurueckgeliefert.
 * Die Methode MUSS mit await aufgerufen werden!
 *
 * let points = await getSingleParam("w8abit_de", "POINTS_PER_SUBGIFT", "0");
 * console.log(points);
 *
 * @example let points = await getSingleParam("w8abit_de", "POINTS_PER_SUBGIFT", "0");
 * @param {string} channel Der Channelname (ohne #)
 * @param {string} param Der zu selektierende Parameter (z.B. POINTS_PER_SUBGIFT)
 * @param {string} defaultValue Die defaultValue die im Fehlerfall oder bei keinem Ergebnis zurueckgeliefert wird
 * @returns {Promise<unknown>}
 */
export async function getParam(channel, param, defaultValue) {
    channel = reformatChannelname(channel);

    return await new Promise((resolve) => {
        let db = new sqlite3.Database('./' + constants.PARAMDATABASE);
        const statement = createStatement("SELECT VALUE FROM PARAMS WHERE LOWER(CHANNEL) = :1 AND LOWER(NAME) = :2", [channel, param.toLowerCase()]);
        ltrace(channel, `getParam() -> Folgender SQL wird ausgefuehrt: ${statement}`);

        db.get(statement, [], (err, row) => {
            if (err) {
                ltrace(channel, `1. getParam() -> Channel: ${channel}, Param: ${param}, Value: ${defaultValue}`);
                resolve(defaultValue);
            }
            if (row && row['VALUE']) {
                ltrace(channel, `2. getParam() -> Channel: ${channel}, Param: ${param}, Value: ${row['VALUE']}`);
                resolve(row['VALUE']);
            } else {
                const statement = createStatement("SELECT VALUE FROM PARAMS WHERE CHANNEL = '####' AND LOWER(NAME) = :1", [param.toLowerCase()]);
                ltrace(channel, `getParam() -> Folgender SQL wird ausgefuehrt: ${statement}`);

                db.get(statement, [], (err, row) => {
                    if (err) {
                        ltrace(channel, `3. getParam() -> hannel: ${channel}, Param: ${param}, Value: ${defaultValue}`);
                        resolve(defaultValue);
                    }
                    if (row && row['VALUE']) {
                        ltrace(channel, `4. getParam() -> Channel: ${channel}, Param: ${param}, Value: ${row['VALUE']}`);
                        resolve(row['VALUE']);
                    } else {
                        ltrace(channel, `5. getParam() -> Channel: ${channel}, Param: ${param}, Value: ${defaultValue}`);
                        resolve(defaultValue);
                    }
                });
            }
        });
    });
}

export async function getSingleParam(channel, param, isDefaultParam) {
    return await new Promise((resolve) => {
        let db = new sqlite3.Database('./' + constants.PARAMDATABASE);
        let statement;

        if (isDefaultParam) {
            statement = createStatement("SELECT VALUE FROM PARAMS WHERE CHANNEL = '####' AND LOWER(NAME) = :1", [param.toLowerCase()]);
        } else {
            statement = createStatement("SELECT VALUE FROM PARAMS WHERE LOWER(CHANNEL) = :1 AND LOWER(NAME) = :2", [channel, param.toLowerCase()]);
        }
        ltrace(channel, `getSingleParam() -> Folgender SQL wird ausgefuehrt: ${statement}`);

        db.get(statement, [], (err, row) => {
            if (err) {
                ltrace(channel, `getSingleParam() -> Fehler beim Select, gebe -1 zurueck!`);
                resolve("-1");
            }
            if (row && row['VALUE']) {
                ltrace(channel, `getSingleParam() -> Satz gefunden: Channel: ${channel}, Param: ${param}, Value: ${row['VALUE']}`);
                resolve(row['VALUE']);
            } else {
                ltrace(channel, `getSingleParam() -> Keine Daten gefunden, gebe .1 zurueck.`);
                resolve("-1");
            }
        });
    });
}

export async function getUserPoints(channel, user) {
    let channelName = reformatChannelname(channel);
    let userName = reformatUsername(channel, user);

    return await new Promise((resolve) => {
        let db = getDatabase();
        const statement = createStatement("SELECT POINTS FROM POINTS WHERE LOWER(CHANNEL) = :1 AND LOWER(USERNAME) = :2", [channelName, userName]);
        db.get(statement, [], (err, row) => {
            if (err) {
                ltrace(channel, `getUserPoints() -> Fehler beim Select aufgetreten! Es konnte keine Punkte fuer ${userName} bestimmt werden`);
                resolve(0);
            }
            if (row && row['POINTS']) {
                ltrace(channel, `2. getUserPoints() -> Channel: ${channelName}, Username: ${userName}, Punkte: ${row['POINTS']}`);
                resolve(parseInt(row['POINTS']));
            } else {
                ltrace(channel, `getUserPoints() -> Es konnte keine Punkte fuer ${userName} bestimmt werden`);
                resolve(0);
            }
        });
    });
}

export async function updateParamValue(client, channel, param, paramValue) {
    let channelName = reformatChannelname(channel);
    let db = new sqlite3.Database('./' + constants.PARAMDATABASE);

    let singleParamDefault = await getSingleParam(channel, param, true);
    ltrace(channel, `updateParamValue() -> singleParamDefault: ${singleParamDefault}`);

    if (singleParamDefault === "-1") {
        client.say(channel, `Sorry, den Parameter gibt es nicht!`);
        return;
    }

    let channelParam = await getSingleParam(channel, param, false);
    ltrace(channel, `updateParamValue() -> singleParamDefault: ${channelParam}`);

    if (channelParam === "-1") {
        const statement = createStatement("INSERT INTO PARAMS (NAME, VALUE, CHANNEL) VALUES (:1, :2, :3)", [param.toUpperCase(), paramValue, channelName]);
        ltrace(channel, `updateParamValue() -> Folgender SQL wird ausgefuehrt: ${statement}`);

        db.exec(statement);
    } else {
        const statement = createStatement("UPDATE PARAMS SET VALUE = :1 WHERE LOWER(CHANNEL) = :2 AND LOWER(NAME) = :3", [paramValue, channelName, param.toLowerCase()]);
        ltrace(channel, `updateParamValue() -> Folgender SQL wird ausgefuehrt: ${statement}`);

        db.exec(statement);
    }

    client.say(channel, `Parameter erfolgreich aktualisiert`);
}

/**
 * Wenn es das Event bereits gibt, wird der Eventname zurueckgeliefert. Wenn nicht, kommt ein LEERSTRING zurueck
 */
export async function checkExistingEvent(channel, eventname) {
    let channelName = reformatChannelname(channel);

    return await new Promise((resolve) => {
        let db = getDatabase();
        const statement = createStatement("SELECT CHANNEl, NAME, MAXENTRIES, COST, ACTIVE, WINNER FROM EVENT WHERE LOWER(CHANNEL) = :1 AND LOWER(NAME) = :2", [channelName, eventname.toLowerCase()]);

        ltrace(channel, `checkExistingEvent() -> Folgender SQL wird ausgefuehrt: ${statement}`);

        db.get(statement, [], (err, row) => {
            if (err) {
                ltrace(channel, `checkExistingEvent() -> Fehler beim Select aufgetreten!`);
                resolve(TEXTKONST.LEERSTRING);
            }
            if (row && row['NAME']) {
                ltrace(channel, `checkExistingEvent() -> Channel: ${channelName}, Eventname: ${eventname}`);
                resolve(row);
            } else {
                ltrace(channel, `checkExistingEvent() -> Es konnte keine Event mit dem Namen ${eventname} gefunden werden`);
                resolve(TEXTKONST.LEERSTRING);
            }
        });
    });
}

export async function existsTable(channel, tablename) {
    return await new Promise((resolve) => {
        let db = new sqlite3.Database('./' + constants.DATABASENAME);

        let statement = createStatement("SELECT name FROM sqlite_schema WHERE type='table' AND name= :1", [tablename]);

        ltrace(channel, `existsTable() -> Folgender SQL wird ausgefuehrt: ${statement}`);

        db.get(statement, [], (err, row) => {
            if (err) {
                ltrace(channel, `existsTable() -> Fehler beim Select, gebe 0 zurueck!`);
                resolve("0");
            }
            if (row) {
                ltrace(channel, `existsTable() -> Tabelle vorhanden!`);
                resolve("1");
            } else {
                ltrace(channel, `existsTable() -> Tabelle nicht gefunden, gebe 0 zurueck!`);
                resolve("0");
            }
        });
    });
}

export async function existsSocialEntry(channel, name) {
    return await new Promise((resolve) => {
        let channelName = reformatChannelname(channel);

        let db = new sqlite3.Database('./' + constants.DATABASENAME);
        let statement = createStatement("SELECT NAME FROM SOCIALS WHERE LOWER(NAME) = :1 AND LOWER(CHANNEL) = :2", [name.toLowerCase(), channelName]);

        ltrace(channel, `existsSocialEntry() -> Folgender SQL wird ausgefuehrt: ${statement}`);

        db.get(statement, [], (err, row) => {
            if (err) {
                ltrace(channel, `existsSocialEntry() -> Fehler beim Select, gebe 0 zurueck!`);
                resolve("0");
            }
            if (row) {
                ltrace(channel, `existsSocialEntry() -> Eintrag bereits vorhanden!`);
                resolve("1");
            } else {
                ltrace(channel, `existsSocialEntry() -> Kein Eintrag gefunden, gebe 0 zurueck!`);
                resolve("0");
            }
        });
    });
}
