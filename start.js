/**
 * w8abot - Ein neuer Twitch Channel Bot fuer deine Community
 *
 * ------------------------------------------------------------------------
 * Quickstart:
 * - .env-Datei mit deinen Credentials im root des Projekts anlegen!
 *   - USERNAME: Dein Botname
 *   - OAUTH: Dein OAuth-Key
 * - In /settings/botsettings.js den Botname auf deinen Botnamen aendern
 * - Starten mit: node start.js CHANNELNAME
 * - Zur Einrichtung ?setup in den Chat (du MUSST der Broadcaster sein!)
 * ------------------------------------------------------------------------
 * 
 * Dieser Bot wurde geschrieben und entwickelt von @magicmarcy / @w8abit_de
 * Alle Ausgaben des Bots sind auf deutsch!
 * 
 * Dokumentation und Kommentare: deutsch
 * Codesprache: englisch
 * 
 * @see https://github.com/magicmarcy/w8abot_twitch/blob/main/README.md Dokumentation
 * @see https://github.com/magicmarcy/w8abot_twitch/blob/main/COMMANDS.md Command Uebersicht
 */

import {linfo, ltrace, lwarn, msglog} from "./utils/logger.js";
import {createClient} from "./utils/clientutils.js";
import {isBot, isBroadcaster, isModOrStreamer, splitAndResolveString} from "./utils/utils.js";
import {addOrUpdateChannelPoints, getPointsForUser, givePoints, setPoints, showPoints, showTopPoints} from "./useractions/points.js";
import {hugUser} from "./useractions/hug.js";
import {gamble} from "./useractions/gamble.js";
import {translatee} from "./useractions/translate.js";
import {performSchneeball} from "./useractions/schneeball.js";
import {performFrage} from "./useractions/frage.js";
import {performHot} from "./useractions/hot.js";
import {performSlots} from "./useractions/slots.js";
import {performModCheck} from "./useractions/modCheck.js";
import {constants} from "./settings/botsettings.js";
import {acceptDuell, performDuell} from "./useractions/duell.js";
import {performUpdateParamvalue} from "./useractions/modaction.js";
import {getParam} from "./utils/databaseUtils.js";
import {addEvent, deleteEvent, startEvent} from "./useractions/ticket.js";
import {PARAMKONST} from "./utils/konst.js";
import sqlite3 from "sqlite3";
import * as fs from "fs";
import {addSocial, editSocial, removeSocial, showSocials} from "./useractions/socials.js";
import {showMapLink} from "./useractions/maps.js";
import {performQuizAnswer, pickWinnerAndDeleteQuiz, startQuiz, stopQuiz} from "./useractions/quiz.js";
import {performSlap} from "./useractions/slap.js";
import {addList, addToList, performShowList, removeFromList, removeList} from "./useractions/todo.js";

// Client connection
const client = createClient(getChannels());

// Connection handler
client.on('connected', onConnectedHandler);
client.on('disconnected', onDisconnectedHandler);

client.connect().then(_r => console.log('Connected'));

client.on('message', async (channel, tags, message, self) => {
    msglog(channel, tags.username, message);

    if (message === '?setup' && isBroadcaster(tags)) {
        doSetup(client, channel);

        return;
    }

    let commandSign = await getParam(channel, PARAMKONST.COMMAND, "?");

    // wenn die Nachricht kein Command ist und auch nicht von einem Bot ist, bekommt der User X Punkte (siehe const.POINTS_PER_MSG)
    await addOrUpdateChannelPoints(message, channel, tags);

    // Nachrichten, die vom Bot selbst kommen oder nicht mit dem passendem Praefix beginnen, ignorieren wir
    if (self || isBot(tags)) return;

    let splittedMsg = splitAndResolveString(message);

    ltrace(channel, `initOnMsg() -> splittedMsg=${splittedMsg}, isModOrStreamer=${isModOrStreamer(tags)}`);

    if (splittedMsg != null && splittedMsg[0] != null) {
        // Das Command ohne das Prefix
        let command = splittedMsg[0].substring(1).toLowerCase();

        let isCommand = splittedMsg[0].startsWith(commandSign);

        ltrace(channel, `initOnMsg() -> MsgStartsWithCommand=${isCommand}`);

        if (isCommand) {
            ltrace(channel, `initOnMsg() -> command=${command}`);

            // Mod-Commands
            if (isModOrStreamer(tags)) {
                ltrace(channel, `initOnMsg() -> Command from Mod or Streamer!`)

                switch (command) {
                    case 'botinfo':
                    case 'help':
                    case 'info':
                        client.say(channel, 'Hi, ich bin der Twitch Channel Bot in Version ' + constants.BOTVERSION + '! Alle Infos auf GitHUb: ' + constants.GITHUBURL + ' Wenn du mich und meine Entwicklung unterstützen möchtest, freue ich mich sehr über einen Kaffee (Buy me a coffee): https://bit.ly/3IppTGj Vielen Dank! <3');
                        break;
                    case 'test':
                        client.say(channel, `Hi ${tags.username}, ich bin da ;-)`);
                        break;
                    case 'givepoints':
                        await givePoints(client, channel, tags, splittedMsg);
                        break;
                    case 'setpoints':
                        await setPoints(client, channel, tags, splittedMsg);
                        break;
                    case 'updateparam':
                        performUpdateParamvalue(client, channel, tags, splittedMsg);
                        break;
                    case 'addevent':
                        await addEvent(client, channel, tags, message);
                        break;
                    case 'startevent':
                        await startEvent(client, channel, tags, message);
                        break;
                    case 'deleteevent':
                        await deleteEvent(client, channel, tags, message);
                        break;
                    case 'raidoffer':
                        // IDEE: Aufzeichnen, wer uns geraided hat und daraus eine Art (Besten-)Liste
                        // erstellen um eine Empfehlung zu erstellen, wen man raiden kann
                        // Prueft dann auch, wer davon onine ist
                        performWhoToRaid(client, channel, tags, message);
                        break;
                    case 'addsocial':
                        await addSocial(client, channel, tags, message);
                        break;
                    case 'editsocial':
                        await editSocial(client, channel, tags, message);
                        break;
                    case 'removesocial':
                        await removeSocial(client, channel, tags, message);
                        break;
                    case 'startquiz':
                        await startQuiz(client, channel, tags, message);
                        break;
                    case 'stopquiz':
                        await stopQuiz(client, channel, tags, message);
                        break;
                    case 'pickwinner':
                        await pickWinnerAndDeleteQuiz(client, channel, tags, message);
                        break;
                    case 'addliste':
                    case 'addlist':
                        await addList(client, channel, tags, splittedMsg);
                        break;
                    case 'removelist':
                    case 'removeliste':
                        await removeList(channel, splittedMsg);
                        break;
                    case 'addtolist':
                    case 'addtoliste':
                        await addToList(channel, splittedMsg);
                        break;
                    case 'removefromlist':
                    case 'removefromliste':
                        await removeFromList(channel, splittedMsg);
                        break;
                    case 'killbot':
                        lwarn(channel, `Bot via Command gestoppt!`);
                        client.say(channel, `!lurk Ich bin dann mal weg... :wave:`);
                        process.exit(1);
                }
            }

            // Allgemeine-Commands
            if (command) {
                switch (command) {
                    case 'hug':
                        await hugUser(client, channel, tags, splittedMsg);
                        break;
                    case 'points':
                    case 'punkte':
                        await showPoints(client, channel, tags, splittedMsg);
                        break;
                    case 'top':
                        showTopPoints(client, channel, tags, splittedMsg);
                        break;
                    case 'gamble':
                        await gamble(client, channel, tags, splittedMsg);
                        break;
                    case 'translate':
                    case 'trans':
                        await translatee(client, channel, tags, splittedMsg);
                        break;
                    case 'slap':
                        await performSlap(client, channel, tags, splittedMsg);
                        break;
                    case 'schneeball':
                        await performSchneeball(client, channel, tags, splittedMsg);
                        break;
                    case 'modcheck':
                        await performModCheck(client, channel, tags, splittedMsg);
                        break;
                    case 'ask':
                        performFrage(client, channel, tags, splittedMsg);
                        break;
                    case 'hot':
                        await performHot(client, channel, tags, splittedMsg);
                        break;
                    case 'slots':
                        await performSlots(client, channel, tags, splittedMsg);
                        break;
                    case 'duell':
                        await performDuell(client, channel, tags, splittedMsg);
                        break;
                    case 'accept':
                        await acceptDuell(client, channel, tags, splittedMsg);
                        break;
                    case 'socials':
                        await showSocials(client, channel, tags, message);
                        break;
                    case 'commands':
                        client.say(channel, `@${tags.username.toLowerCase()} eine Übersicht all meiner Commands gibt's hier: https://bit.ly/3Vvgb8k`);
                        break;
                    case 'map':
                        showMapLink(client, channel, tags, message);
                        break;
                    case 'answer':
                    case 'antwort':
                        await performQuizAnswer(client, channel, tags, message);
                        break;
                    case 'support':
                        client.say(channel, `Wenn du mich und meine Entwicklung unterstützen möchtest, freue ich mich sehr über einen Kaffee (Buy me a coffee): https://bit.ly/3IppTGj Vielen Dank! <3`);
                        break;
                    case 'liste':
                    case 'list':
                        await performShowList(client, channel, message);
                        break;
                }
            }
        }
    }
});

client.on("raided", async (channel, username, viewers) => {
    // Hier sollte es nun fuer den Raidenden und fuer jeden mitgebrachten Zuschauer Punkte geben:
    // Beispiel: Raider -> 1000 Punkte plus 75 Zuschauer * 50 Punkte = 4750 Punkte
    let pointPerRaid = await getParam(channel, PARAMKONST.POINTS_PER_RAID, "0");
    let pointsPerRaider = await getParam(channel, PARAMKONST.POINTS_PER_RAIDER, "0");

    pointPerRaid = parseInt(pointPerRaid);
    pointsPerRaider = parseInt(pointsPerRaider);

    let pointsToAdd = pointPerRaid + (parseInt(viewers) * pointsPerRaider);
    let userPoints = getPointsForUser(channel, username);
    // ToDo: Die Funktion zum Updaten der Userpoints muss aufgeteilt werden! Ich brauche eine Funktion, die die aktuellen Punkte
    //  ausgibt (und den User anlegt falls es ihn noch nicht gibt) und eine extra Funktion, die eine uebergebenen Anzahl an Punkten
    //  dem User hinzufuegt.

    let eventsActive = await getParam(channel, PARAMKONST.EVENTS_ACTIVE, "0");

    if ("1" === eventsActive) {
        client.say(channel, `YEAH! ${username} besucht uns und bringt seine ${viewers} Zuschauer mit! Vielen Dank für den Raid und deinen Support, ${username}!`);
    }

    linfo(channel, `${channel}: YEAH! ${username} besucht uns und bringt seine ${viewers} Zuschauer mit! Vielen Dank für den Raid und deinen Support, ${username}!`);
    linfo(channel, `[+++ RAID-EVENT +++]: Username: ${username}, Viewers: ${viewers}, Channel: ${channel}`);
});

// special event when a raid happens
client.on('raid', (channel, user, raidInfo, msg) => {
    //console.log(`[+++ RAID-EVENT +++]: User: ${user}! Channel: ${channel}, RaidInfo: ${raidInfo}, Msg: ${msg}`);
    linfo(channel, `[+++ RAID-EVENT +++]: User: ${user}! Channel: ${channel}, RaidInfo: ${raidInfo}, Msg: ${msg}`);
});

// special event on a sub
client.on('sub', (channel, user) => {
    //console.log(`[+++ SUB-EVENT +++]: User: @${user} Channel: ${channel}`);
    linfo(channel, `[+++ SUB-EVENT +++]: User: @${user} Channel: ${channel}`);
});

// special event on a resub
client.on('resub', (channel, user, subInfo) => {
    //console.log(`[+++ RESUB-EVENT +++]: User: ${user}, Channel: ${channel}, SubInfo: ${subInfo}`);
    linfo(channel, `[+++ RESUB-EVENT +++]: User: ${user}, Channel: ${channel}, SubInfo: ${subInfo}`);
});

// special event on a gifted sub
client.on('subgift', (channel, user, subInfo) => {
    //console.log(`[+++ SUBGIFT-EVENT +++]: User: ${user}, Channel: ${channel}, SubInfo: ${subInfo}`);
    linfo(channel, `[+++ SUBGIFT-EVENT +++]: User: ${user}, Channel: ${channel}, SubInfo: ${subInfo}`);
});

/**
 * Anongiftpaidupgrade
 * Username is continuing the Gift Sub they got from an anonymous user in channel.
 *
 * Parameters:
 * channel: String - Channel name
 * username: String - Username
 * userstate: Object - Userstate object
 */
client.on("anongiftpaidupgrade", (channel, username, userstate) => {
    //console.log(`[+++ ANON-PAID-UPGRADE-EVENT +++]: Username: ${username}, Channel: ${channel}, Userstate: ${userstate}`);
    linfo(channel, `[+++ ANON-PAID-UPGRADE-EVENT +++]: Username: ${username}, Channel: ${channel}, Userstate: ${userstate}`);
});

/**
 * Cheer
 * Username has cheered to a channel.
 *
 * Parameters:
 * channel: String - Channel name
 * userstate: Object - Userstate object
 * message: String - Message
 */
client.on("cheer", (channel, userstate, message) => {
    // Hier weiss ich leider noch nicht genau, wie ich hier die Anzahl rausbekommen soll :-(
    //console.log(`[+++ CHEER-EVENT +++]: Userstate: ${userstate}, Channel: ${channel}, Message: ${message}`);
    linfo(channel, `[+++ CHEER-EVENT +++]: Userstate: ${userstate}, Channel: ${channel}, Message: ${message}`);
});


/**
 * Giftpaidupgrade
 * Username is continuing the Gift Sub they got from sender in channel.
 *
 * Parameters:
 * channel: String - Channel name
 * username: String - Username
 * sender: Integer - Sender username
 * userstate: Object - Userstate object
 */
client.on("giftpaidupgrade", (channel, username, sender, userstate) => {
    // Das hier muesste passieren, wenn nach einem geschenkten Abo man ein eigenes abschliesst
    //console.log(`[+++ GIFT-PAID-UPGRADE-EVENT +++]: Username: ${username}, Sender: ${sender}, Channel: ${channel}, Userstate: ${userstate}`);
    linfo(channel, `[+++ GIFT-PAID-UPGRADE-EVENT +++]: Username: ${username}, Sender: ${sender}, Channel: ${channel}, Userstate: ${userstate}`);
});

/**
 * Hosted
 * Channel is now hosted by another broadcaster. This event is fired only if you are logged in as the broadcaster.
 *
 * GIBTS NICHT MEHR!
 *
 * Parameters:
 * channel: String - Channel name being hosted
 * username: String - Username hosting you
 * viewers: Integer - Viewers count
 * autohost: Boolean - Auto-hosting
 */
client.on("hosted", (channel, username, viewers, autohost) => {
    //console.log(`[+++ HOST-EVENT +++]: Username: ${username}, Channel: ${channel}, Viewers: ${viewers}, AutoHost: ${autohost}`);
    linfo(channel, `[+++ HOST-EVENT +++]: Username: ${username}, Channel: ${channel}, Viewers: ${viewers}, AutoHost: ${autohost}`);
});

/**
 * FUNKTIONIERT!!!!
 *
 * Resub
 * Username has resubbed on a channel.
 * streakMonths will be 0 unless the user shares their streak. userstate will have a lot of other data pertaining to the message.
 *
 * Parameters:
 * channel: String - Channel name
 * username: String - Username
 * streakMonths: Integer - Streak months
 * message: String - Custom message
 * userstate: Object - Userstate object
 * userstate["msg-param-cumulative-months"]: String - Cumulative months
 * userstate["msg-param-should-share-streak"]: Boolean - User decided to share their sub streak
 * ...
 * methods: Object - Resub methods and plan (such as Prime)
 */
client.on("resub", (channel, username, months, message, userstate, methods) => {
    // Do your stuff.
    let cumulativeMonths = ~~userstate["msg-param-cumulative-months"];
    //console.log(`[+++ RESUB-EVENT +++]: Username: ${username}, Month: ${months}, Message: ${message}, Channel: ${channel}, Userstate: ${userstate}, Methods: ${methods}`);
    linfo(channel, `[+++ RESUB-EVENT +++]: Username: ${username}, Month: ${months}, Message: ${message}, Channel: ${channel}, Userstate: ${userstate}, Methods: ${methods}`);
    linfo(channel, `### RESUB ###: ${username} abonniert nun schon seit ${cumulativeMonths} die geile Sau!`);
});

/**
 * DAS HIER FUNKTIONIERT RICHTIG!!!
 *
 * Subgift
 * Username gifted a subscription to recipient in a channel.
 *
 * Parameters:
 * channel: String - Channel name
 * username: String - Sender username
 * streakMonths: Integer - Streak months
 * recipient: String - Recipient username
 * methods: Object - Methods and plan used to subscribe
 * userstate: Object - Userstate object
 * userstate["msg-param-recipient-display-name"]: String - The display name of the recipient
 * userstate["msg-param-recipient-id"]: String - The ID of the recipient
 * userstate["msg-param-recipient-user-name"]: String - The login of the recipient
 * userstate["msg-param-sender-count"]: Boolean or String - The count of giftsubs the sender has sent
 */
client.on("subgift", (channel, username, streakMonths, recipient, methods, userstate) => {
    // Do your stuff.
    let senderCount = ~~userstate["msg-param-sender-count"];
    //console.log(`[+++ SUBGIFT-EVENT +++]: Username: ${username}, StreakMonth: ${streakMonths}, Recipient: ${recipient}, Channel: ${channel}, Methods: ${methods}, Userstate: ${userstate}`);
    linfo(channel, `[+++ SUBGIFT-EVENT +++]: Username: ${username}, StreakMonth: ${streakMonths}, Recipient: ${recipient}, Channel: ${channel}, Methods: ${methods}, Userstate: ${userstate}`);
    linfo(channel, `### TEST-SUBGIFT ###: ${username} hat ${recipient} ein Abo geschenekt! Wie geil bist du denn? Damit hat ${username} schon ${senderCount} Abos auf diesem Kanal verschenkt!`);
});

/**
 * Submysterygift
 * Username is gifting a subscription to someone in a channel.
 *
 * Parameters:
 * channel: String - Channel name
 * username: String - Sender username
 * numbOfSubs: Integer - Number of subgifts given in this transaction
 * methods: Object - Methods and plan used to subscribe
 * userstate: Object - Userstate object
 * userstate["msg-param-sender-count"]: Boolean or String - The total numbers of giftsubs username has given in channel
 */
client.on("submysterygift", (channel, username, numbOfSubs, methods, userstate) => {
    let senderCount = ~~userstate["msg-param-sender-count"];
    //console.log(`[+++ SUB-MYSTERY-GIFT-EVENT +++]: Username: ${username}, NumbOfSubs: ${numbOfSubs}, Channel: ${channel}, Methods: ${methods}, Userstate: ${userstate}`);
    linfo(channel, `[+++ SUB-MYSTERY-GIFT-EVENT +++]: Username: ${username}, NumbOfSubs: ${numbOfSubs}, Channel: ${channel}, Methods: ${methods}, Userstate: ${userstate}`);
});

/**
 * Subscription
 * Username has subscribed to a channel.
 *
 * Parameters:
 * channel: String - Channel name
 * username: String - Username
 * methods: Object - Methods and plan used to subscribe
 * message: String - Custom message
 * userstate: Object - Userstate object
 */
client.on("subscription", (channel, username, method, message, userstate) => {
    //console.log(`[+++ SUBSCRIPTION-EVENT +++]: Username: ${username}, Method: ${method}, Message: ${message}, Userstate: ${userstate}, Channel: ${channel}`);
    linfo(channel, `[+++ SUBSCRIPTION-EVENT +++]: Username: ${username}, Method: ${method}, Message: ${message}, Userstate: ${userstate}, Channel: ${channel}`);
});

/**
 * Timeout
 * Username has been timed out on a channel. To get the reason and other data, use Twitch's PubSub topic "chat_moderator_actions".
 *
 * Parameters:
 * channel: String - Channel name
 * username: String - Username
 * reason: String - Deprecated, always null. See event description above
 * duration: Integer - Duration of the timeout
 * userstate: Object - Userstate object
 * userstate["target-user-id"]: string - User ID
 * userstate["room-id"]: string - Channel ID
 */
client.on("timeout", (channel, username, reason, duration, userstate) => {
    //console.log(`[+++ TIMEOUT-EVENT +++]: Username: ${username}, Reason: ${reason}, Duration: ${duration}, Userstate: ${userstate}, Channel: ${channel}`);
    linfo(channel, `[+++ TIMEOUT-EVENT +++]: Username: ${username}, Reason: ${reason}, Duration: ${duration}, Userstate: ${userstate}, Channel: ${channel}`);
});

/**
 * Emoteonly
 *
 * Channel enabled or disabled emote-only mode.
 *
 * Parameters:
 * channel: String - Channel name
 * enabled: Boolean - Returns true if mode is enabled or false if disabled
 */
client.on("emoteonly", (channel, enabled) => {
    //console.log(`[+++ EMOTEONLY-EVENT +++] Channel: ${channel}, Enabled: ${enabled}`);
    linfo(channel, `[+++ EMOTEONLY-EVENT +++] Channel: ${channel}, Enabled: ${enabled}`);
    // if (enabled) {
    //     client.say(channel, 'Alter echt jetzt? Emote only oder was?');
    // } else {
    //     client.say(channel, 'Puh, endlich wieder normal chatten!');
    // }
    // if (enabled === true) {
    //   client.say(channel, ":X :X :X");
    // }
});

// Enndlich ne vernuenftige Doku...
// https://github.com/tmijs/docs/blob/gh-pages/_posts/v1.4.2/2019-03-03-Events.md


// Called every time the bot connects to Twitch chat:
function onConnectedHandler(addr, port) {
    linfo("", `++++++++++++ NEW CONNECTION @ ${addr}:${port} ++++++++++++++`);
    printWelcomeMsgToConsole();
}

// Called every time the bot disconnects from Twitch (not if the scripts was stopped!)
function onDisconnectedHandler(reason) {
    linfo("", `Disconnected: ${reason}`)
    printLeaveMsgToChat(client);

    process.exit(1);
}

export function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}


// FUNCTIONS
function createSoText(splittetMsg) {
    const usernameFromCommand = splittetMsg[1];
    const userUrl = usernameFromCommand.toLowerCase().substring(1);

    return `/announce Schaut mal bei ${usernameFromCommand} vorbei & lasst doch n Follow da. ${userUrl} - Ihr werdet es nicht bereuen!!!`;
}

function printWelcomeMsgToConsole() {
    console.log("╔═══════════════════════════════════════════════════╗");
    console.log("║                                                   ║");
    console.log("║        Twitch Channel Bot                         ║");
    console.log("║        (c) 2022 by w8abit_de                      ║");
    console.log("║                                                   ║");
    console.log("║        Twitch: https://twitch.tv/w8abit_de        ║");
    console.log("║        GitHub: https://bit.ly/3WScD11             ║");
    console.log("║                                                   ║");
    console.log("╚═══════════════════════════════════════════════════╝");
}

function printWelcomeMsgToChat(client) {
    let channels = getChannels();

    linfo("", `Channels: ${channels}`);

    for (const element of channels) {
        linfo(element, `Da bin ich wieder! Habt ihr mich vermisst?^^`);
        client.say(element, `Da bin ich wieder! Habt ihr mich vermisst?^^`);
    }
}

function printLeaveMsgToChat(client) {
    let channels = getChannels();

    linfo("", `Channels: ${channels}`);

    for (const element of channels) {
        linfo(element, `Bin mal weg... Haut rein!`);
        client.say(element, `Bin mal weg... Haut rein!`);
    }
}

function getChannels() {
    let channels = [];

    for (let i = 2; i < process.argv.length; i++) {
        channels.push(process.argv[i]);
    }

    return channels;
}

function doSetup(client, channel) {
    const DB_botdata = './data/botdata.db';
    const DB_settings = './data/settings.db';

    if (fs.existsSync(DB_botdata) && fs.existsSync(DB_settings)) {
        client.say(channel, `Setup wurde bereits durchgeführt!`);
        return;
    }

    try {
        fs.mkdirSync('./data/', { recursive: true })


        if (fs.existsSync(DB_botdata)) {
            ltrace(channel, `File "${DB_botdata}" exists`);
        } else {
            ltrace(channel, `File "${DB_botdata}" does not exists, creating...`)

            fs.writeFile(DB_botdata, '', function (err) {
                if (err) {
                    client.say(channel, `2 Fehler beim Setup aufgetreten!`);
                    return;
                }
                console.log(`File "${DB_botdata}" is created successfully.`);
            });
        }

        if (fs.existsSync(DB_settings)) {
            ltrace(channel, `File "${DB_settings}" exists`)
        } else {
            ltrace(channel, `File "${DB_settings}" does not exists, creating...`)

            fs.writeFile(DB_settings, '', function (err) {
                if (err) {
                    client.say(channel, `3 Fehler beim Setup aufgetreten!`);
                    return;
                }
                console.log(`File "${DB_settings}" created successfully.`);
            });
        }

        if (fs.existsSync(DB_botdata) && fs.existsSync(DB_settings)) {
            createBotdata(DB_botdata);
            createSettings(DB_settings);
        }
    } catch (err) {
        console.log(err);

        client.say(channel, `4 Fehler beim Setup aufgetreten!`);

        return;
    }

    client.say(channel, `X Setup erfolgreich durchgeführt!`);

}

function createBotdata(DB_botdata) {
    let db = new sqlite3.Database(DB_botdata);

    let createDuellTable = 'CREATE TABLE "DUELL" ("CHANNEL" TEXT, "CHALLENGER" TEXT, "OPPONENT" TEXT,"AMOUNT" INTEGER, "CREATED" NUMERIC)';
    db.exec(createDuellTable);

    let createEventTable = 'CREATE TABLE "EVENT" ("CHANNEL" TEXT,"NAME" TEXT,"MAXENTRIES" INTEGER DEFAULT 1,"COST" INTEGER,"ACTIVE" INTEGER DEFAULT 0, "WINNER" TEXT)';
    db.exec(createEventTable);

    let createEventEntriesTable = 'CREATE TABLE "EVENTENTRIES" ("USERNAME" TEXT,"EVENTNAME" TEXT,"TIMESTAMP" INTEGER)';
    db.exec(createEventEntriesTable);

    let createHotTable = 'CREATE TABLE "HOT" ("CHANNEL" TEXT,"USERNAME" TEXT,"HOTLEVEL" INTEGER, "LASTCHECK" TEXT)';
    db.exec(createHotTable);

    let createHugTable = 'CREATE TABLE "HUG" ("CHANNEL" TEXT,"HUGGER" TEXT,"TOHUG" TEXT,"AMOUNT" INTEGER)';
    db.exec(createHugTable);

    let createPointsTable = 'CREATE TABLE "POINTS" ("CHANNEL" TEXT,"USERNAME" TEXT,"POINTS" NUMERIC)';
    db.exec(createPointsTable);

    let createListTable = 'CREATE TABLE "LISTS" ("CHANNEL" TEXT,"LISTNAME" TEXT,"LISTENTRY" NUMERIC, "CONTENT" TEXT)';
    db.exec(createListTable);
}

function createSettings(DB_settings) {
    let db = new sqlite3.Database(DB_settings);

    let createSettingsTable = 'CREATE TABLE "PARAMS" ("NAME" TEXT NOT NULL,"VALUE" TEXT NOT NULL,"CHANNEL" TEXT NOT NULL, PRIMARY KEY("NAME","VALUE","CHANNEL"))';
    db.exec(createSettingsTable);

    insertParams(DB_settings);
}

function insertParams(DB_settings) {
    let db = new sqlite3.Database(DB_settings);

    let insertCommand = 'INSERT INTO PARAMS ("NAME", "VALUE", "CHANNEL") VALUES ("COMMAND", "?", "####")';
    db.exec(insertCommand);

    let insertEventsActive = 'INSERT INTO PARAMS ("NAME", "VALUE", "CHANNEL") VALUES ("EVENTS_ACTIVE", "0", "####")';
    db.exec(insertEventsActive);

    let insertPointsPerMsg = 'INSERT INTO PARAMS ("NAME", "VALUE", "CHANNEL") VALUES ("POINTS_PER_MSG", "0", "####")';
    db.exec(insertPointsPerMsg);

    let insertPointsPerMsgActive = 'INSERT INTO PARAMS ("NAME", "VALUE", "CHANNEL") VALUES ("POINTS_PER_MSG_ACTIVE", "0", "####")';
    db.exec(insertPointsPerMsgActive);

    let insertPointsPerMsgMulti = 'INSERT INTO PARAMS ("NAME", "VALUE", "CHANNEL") VALUES ("POINTS_PER_MSG_MULTI", "1", "####")';
    db.exec(insertPointsPerMsgMulti);

    let insertGambleActive = 'INSERT INTO PARAMS ("NAME", "VALUE", "CHANNEL") VALUES ("GAMBLE_ACTIVE", "0", "####")';
    db.exec(insertGambleActive);

    let insertGambleChanceToWin = 'INSERT INTO PARAMS ("NAME", "VALUE", "CHANNEL") VALUES ("GAMBLE_CHANCE_TO_WIN", "100", "####")';
    db.exec(insertGambleChanceToWin);

    let insertPointsPerSub = 'INSERT INTO PARAMS ("NAME", "VALUE", "CHANNEL") VALUES ("POINTS_PER_SUB", "1000", "####")';
    db.exec(insertPointsPerSub);

    let insertPointsPerResub = 'INSERT INTO PARAMS ("NAME", "VALUE", "CHANNEL") VALUES ("POINTS_PER_RESUB", "1000", "####")';
    db.exec(insertPointsPerResub);

    let insertPointsPerSubgift = 'INSERT INTO PARAMS ("NAME", "VALUE", "CHANNEL") VALUES ("POINTS_PER_SUBGIFT", "1000", "####")';
    db.exec(insertPointsPerSubgift);

    let insertPointsPerRaid = 'INSERT INTO PARAMS ("NAME", "VALUE", "CHANNEL") VALUES ("POINTS_PER_RAID", "1000", "####")';
    db.exec(insertPointsPerRaid);

    let insertPointsPerRaider = 'INSERT INTO PARAMS ("NAME", "VALUE", "CHANNEL") VALUES ("POINTS_PER_RAIDER", "50", "####")';
    db.exec(insertPointsPerRaider);

    let insertSlotsActive = 'INSERT INTO PARAMS ("NAME", "VALUE", "CHANNEL") VALUES ("SLOTS_ACTIVE", "0", "####")';
    db.exec(insertSlotsActive);

    let insertMultiplySlotsTwoOfAKind = 'INSERT INTO PARAMS ("NAME", "VALUE", "CHANNEL") VALUES ("MULTIPLY_SLOTS_TWO_OF_A_KIND", "2", "####")';
    db.exec(insertMultiplySlotsTwoOfAKind);

    let insertMultiplySlotsThreeOfAKind = 'INSERT INTO PARAMS ("NAME", "VALUE", "CHANNEL") VALUES ("MULTIPLY_SLOTS_THREE_OF_A_KIND", "3", "####")';
    db.exec(insertMultiplySlotsThreeOfAKind);

    let insertMultiplySlotsSpecial = 'INSERT INTO PARAMS ("NAME", "VALUE", "CHANNEL") VALUES ("MULTIPLY_SLOTS_SPECIAL", "5", "####")';
    db.exec(insertMultiplySlotsSpecial);

    let insertSchneeballActive = 'INSERT INTO PARAMS ("NAME", "VALUE", "CHANNEL") VALUES ("SCHNEEBALL_ACTIVE", "0", "####")';
    db.exec(insertSchneeballActive);

    let insertHugActive = 'INSERT INTO PARAMS ("NAME", "VALUE", "CHANNEL") VALUES ("HUG_ACTIVE", "0", "####")';
    db.exec(insertHugActive);

    let insertDuellActive = 'INSERT INTO PARAMS ("NAME", "VALUE", "CHANNEL") VALUES ("DUELL_ACTIVE", "0", "####")';
    db.exec(insertDuellActive);

    let insertHotActive = 'INSERT INTO PARAMS ("NAME", "VALUE", "CHANNEL") VALUES ("HOT_ACTIVE", "0", "####")';
    db.exec(insertHotActive);

    let insertTicketActive = 'INSERT INTO PARAMS ("NAME", "VALUE", "CHANNEL") VALUES ("TICKET_ACTIVE", "0", "####")';
    db.exec(insertTicketActive);
}

export async function botsay(channel, msg) {
    try {
        client.say(channel, msg);
    } catch (err) {
        //  nope
    }
}
