// Hier soll ein Ticketsystem entstehen. Man soll mit !ticket ein Ticket fuer einen festgelegten Betrag (Anzahl Punkte) erhalten koennen.
// Der Streamer oder Mod muss in der Lage sein, diese Aktion zu starten und zu beenden. Am Ende muss aus den Eintraegen ein zufalliger Gewinner
// gezogen werden. Damit aber auch jeder, der mehr als ein Ticket kauft mehr Chancen erhaelt, muss quasi pro Ticket ein Eintrag erzeugt werden.
// Also !ticket erzeugt ein Ticket (ein Eintrag)
// !ticket 10 erzeugt 10 Tickets (also auch zehn Eintraege)
// !ticket max erzeugt so viele Tickets, wie der User sich leisten kann

// Was brauchen wir in der Datenbank dafür?
// Einmal einen Marker und eine Moeglichkeit uberhaupt ein Event anzulegen...
// Command: addEvent NAME DESCRIPTION MAXENTRIES COST
// Command: startEvent NAME -> ACTIVE = 1
// Command: stopEvent NAME -> Active = 0
// Command: chooseWinner NAME -> Random aus allen Entries
// Table: EVENTS
// ENTRY: ID CHANNEL NAME DESCRIPTION MAXENTRIES COST ACTIVE (Es kann immer nur 1 Entry pro Channel aktiv sein!)

// Table: EVENTENTRIES
// ENTRY: CHANNEL USERNAME EVENTID


import {formatString, reformatChannelname, splitAndResolveString} from "../utils/utils.js";
import {checkExistingEvent, createStatement, getDatabase, getParam} from "../utils/databaseUtils.js";
import {PARAMKONST, TEXTKONST} from "../utils/konst.js";
import {ltrace} from "../utils/logger.js";
import {format} from "winston";

/**
 * Command !addEvent NAME MAXENTRIES PRICEPERTICKET
 */
export async function addEvent(client, channel, tags, message) {
    let splittedMsg = splitAndResolveString(message);
    let channelName = reformatChannelname(channel);

    ltrace(channel, `addEvent() -> splittedMsg=${splittedMsg}`);

    if (await isTicketParamActive(channelName)) {
        let command = await getParam(channel, PARAMKONST.COMMAND, "?");

        if (splittedMsg.length === 1) {
            client.say(channel, formatString(TEXTKONST.ERR_ADDEVENT_COMMAND, [command, command]));
            return;
        }

        if (splittedMsg.length === 4) {
            let eventName = splittedMsg[1]
            let maxEntries = parseInt(splittedMsg[2]);
            let pricePerTicket = parseInt(splittedMsg[3]);

            // Wir pruefen erst mal, ob es ein Event mit dem Namen auf diesem Channel bereits gibt
            let eventCheckResult = await checkExistingEvent(channel, eventName);

            if (eventCheckResult && eventCheckResult['NAME'].toLowerCase() === eventName.toLowerCase()) {
                client.say(channel, `Es gibt bereits ein Event mit dem Namen "${eventName}". Du musst das bestehende Event löschen oder einen anderen Namen wählen.`);
                return;
            }

            let validationResult = validateAddCommand(splittedMsg);

            if (validationResult) {
                // Alles okay, jetzt das Event hinzufuegen
                let db = getDatabase();
                const statement = createStatement("INSERT INTO EVENT (CHANNEL, NAME, MAXENTRIES, COST) VALUES (:1, :2, :3, :4)", [channelName, eventName, maxEntries, pricePerTicket]);
                db.exec(statement);

                client.say(channel, formatString(TEXTKONST.ADDEVENT_SUCCESS, [eventName, maxEntries, pricePerTicket, command]));
            } else {
                client.say(channel, formatString(TEXTKONST.ERR_ADDEVENT_COMMAND, [command, command]));
            }
        } else {
            client.say(channel, formatString(TEXTKONST.ERR_ADDEVENT_COMMAND, [command, command]));
        }
    }
}

/**
 * Command !startEvent EVENTNAME
 */
export async function startEvent(client, channel, tags, message) {
    ltrace(channel, `startEvent() -> Entry`);

    let channelName = reformatChannelname(channel);
    let splittedMsg = splitAndResolveString(message);
    let command = await getParam(channel, PARAMKONST.COMMAND, "?");

    ltrace(channel, `startEvent() -> channelName=${channelName}, splittedMsg=${splittedMsg}, command=${command}`);

    if (await isTicketParamActive(channelName) && splittedMsg.length === 2) {

        let result = await checkExistingEvent(channel, splittedMsg[1].toLowerCase());
        let eventCheckResult = Object.values(JSON.parse(JSON.stringify(result)));
        const CHANNEL = 0;
        const NAME = 1;
        const MAXENTRIES = 2;
        const COST = 3;
        const ACTIVE = 4;
        const WINNER = 5;


        ltrace(channel, `startEvent() -> eventCheckResult=${eventCheckResult}`);

        if (eventCheckResult && eventCheckResult[ACTIVE] === 1) {
            ltrace(channel, "startEvent() -> " + TEXTKONST.EVENT_ALREADY_ACTIVE);
            client.say(channel, TEXTKONST.EVENT_ALREADY_ACTIVE);

        } else if (eventCheckResult && eventCheckResult[ACTIVE] === 0) {
            let db = getDatabase();
            const statement = createStatement("UPDATE EVENT SET ACTIVE = '1' WHERE LOWER(CHANNEL) = :1 AND LOWER(NAME) = :2", [channelName, splittedMsg[1].toLowerCase()]);
            db.exec(statement);

            ltrace(channel, "startEvent() -> " + formatString(TEXTKONST.EVENT_STARTED, [splittedMsg[1]]))
            ltrace(channel, "startEvent() -> " + formatString(TEXTKONST.EVENT_STARTED_USER_MSG, [command, eventCheckResult[COST], eventCheckResult[MAXENTRIES]]))

            client.say(channel, formatString(TEXTKONST.EVENT_STARTED, [splittedMsg[1]]));
            client.say(channel, formatString(TEXTKONST.EVENT_STARTED_USER_MSG, [command, eventCheckResult[COST], eventCheckResult[MAXENTRIES]]));
        } else {
            ltrace(channel, "startEvent() -> " + formatString(TEXTKONST.EVENT_NOT_FOUND, [splittedMsg[1]]))
            client.say(channel, formatString(TEXTKONST.EVENT_NOT_FOUND, [splittedMsg[1]]));
        }
    }
}

/**
 * Command !stopEvent EVENTNAME
 */
async function stopEvent(client, channel, tags, message) {
    let channelName = reformatChannelname(channel);

    if (await isTicketParamActive(channelName) && splittedMsg.length === 2) {

    }
}

/**
 * Command: !pickWinner EVENTNAME
 */
async function chooseWinner(client, channel, tags, splittedMsg) {
    let channelName = reformatChannelname(channel);

    if (await isTicketParamActive(channelName) && splittedMsg.length === 2) {

    }
}

/**
 * Command: !ticket oder !ticket 1 oder !ticket max
 */
async function enterEvent(client, channel, tags, splittedMsg) {
    let channelName = reformatChannelname(channel);

    if (await isTicketParamActive(channelName) && (splittedMsg.length === 1 || splittedMsg.length == 2)) {

    }
}

/**
 * Command !deleteEvent EVENTNAME
 * Hinweis, falls Event noch Active
 */
export async function deleteEvent(client, channel, tags, message) {
    ltrace(channel, `deleteEvent() -> Entry`);

    let channelName = reformatChannelname(channel);
    let splittedMsg = splitAndResolveString(message);
    let eventName = splittedMsg[1];
    let command = await getParam(channel, PARAMKONST.COMMAND, "?");

    ltrace(channel, `deleteEvent() -> channelName=${channelName}, splittedMsg=${splittedMsg}, command=${command}`);

    let result = await checkExistingEvent(channel, splittedMsg[1].toLowerCase());

    if (!result || result === TEXTKONST.LEERSTRING) {
        ltrace(channel, formatString(TEXTKONST.EVENT_NOT_FOUND, [splittedMsg[1]]));
        client.say(channel, formatString(TEXTKONST.EVENT_NOT_FOUND, [splittedMsg[1]]));

        return;
    }

    if (await isTicketParamActive(channelName) && splittedMsg.length == 2) {
        let db = getDatabase();
        const statement = createStatement("DELETE FROM EVENT WHERE LOWER(CHANNEL) = :1 AND LOWER(NAME) = :2", [channelName, splittedMsg[1].toLowerCase()]);
        ltrace(channel, `deleteEvent() -> Folgender SQL wird ausgefuehrt: ${statement}`);

        db.exec(statement);

        client.say(channel, formatString(TEXTKONST.EVENT_DELETED, [splittedMsg[1]]));
    }
}

/**
 * Command: !checkEvent EVENTNAME
 * Pruefen ob es ein Event mit dem Namen gibt und wenn ja, wie der Status ist (aktiv oder nicht, Anzahl der Eintragungen usw)
 */
async function checkEvent(client, channel, tags, splittedMsg) {
    let channelName = reformatChannelname(channel);

    if (await isTicketParamActive(channelName) && splittedMsg.length == 2) {

    }

}


async function isTicketParamActive(channel) {
    let channelName = reformatChannelname(channel);
    let ticketActive = await getParam(channelName, PARAMKONST.TICKET_ACTIVE, "0");

    return "1" === ticketActive;
}

/**
 * Command !addEvent NAME MAXENTRIES PRICEPERTICKET
 */
function validateAddCommand(msg) {
    let validationResult = true;

    if (!msg ||                                               // keine Message uebergeben
        msg.length !== 4 ||                                   // Command besteht nicht aus 4 Teilen
        msg[0].toLowerCase().substring(1) !== "addevent" ||   // Command faengt nicht mir addevent an
        isNaN(msg[2]) ||                                      // MAXENTRIES ist keine Zahl
        parseInt(msg[2]) < 0 ||                               // MAXENTRIES ist kleiner als 0
        isNaN(msg[3]) ||                                      // PRICEPERTICKET ist keine Zahl
        parseInt(msg[3]) < 0) {                               // PRICEPERTICKET ist kleiner als 0

        validationResult = false;
    }

    return validationResult;
}
