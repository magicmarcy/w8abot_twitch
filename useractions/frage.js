import {reformatChannelname, reformatUsername} from "../utils/utils.js";
import {ltrace, lwarn} from "../utils/logger.js";

let werFrage = false;
let wasFrage = false;
let wannFrage = false;
let woFrage = false;
let warumFrage = false;
let wieFrage = false;
let wozuFrage = false;

const infoText = 'Deine Frage muss mit "Wer, Was, Wamn, Wo, Warum, Wie" und "Wozu" anfangen und natürlich mit einem Fragezeichen enden. Versuch\'s einfach nochmal.';

export function performFrage(client, channel, tags, splittedMsg) {
    ltrace(channel, `performFrage() -> Entry`)

    let commandFrom = reformatUsername(channel, tags.username.toLowerCase());
    let channelName = reformatChannelname(channel);
    let commandTo = "";

    let frage = "";

    for (let i = 1; i < splittedMsg.length; i++) {
        frage += splittedMsg[i] + " ";
    }

    //  Leerzeichen am Ende entfernen
    frage = frage.substring(0, frage.length - 1);

    ltrace(channel, `Frage=${frage}`);

    if (!frage.includes('?')) {
        lwarn(channel, `Sorry, @${commandFrom}, ich kann hier keine Frage erkennen. ${infoText}`);
        client.say(channel, `Sorry, @${commandFrom}, ich kann hier keine Frage erkennen. ${infoText}`);
        return;
    }

    if (!hatFragewort(channel, frage)) {
        lwarn(channel, `Puh, da kann ich dir nicht weiterhelfen, @${commandFrom}. ${infoText}`);
        client.say(channel, `Puh, da kann ich dir nicht weiterhelfen, @${commandFrom}. ${infoText}`);
        return;
    }

    if (frage.includes("@")) {
        for (let anAt in splittedMsg) {
            if (anAt.startsWith("@")) {
                commandTo = anAt;
            }
        }
    }

    ltrace(channel,`Frage: ${frage}`);
}

function getPossibleAnswers(frage) {
    if (frage) {

    }
}

function hatFragewort(channel, frage) {
    if (frage.toLowerCase().startsWith('wer') && frage.endsWith("?")) {
        ltrace(channel, `Wer-Frage korrekt formuliert`);
        werFrage = true;
        return true;
    } else if (frage.toLowerCase().startsWith('was') && frage.endsWith("?")) {
        ltrace(channel, `Was-Frage korrekt formuliert`);
        wasFrage = true;
        return true;
    } else if (frage.toLowerCase().startsWith('wann') && frage.endsWith("?")) {
        ltrace(channel, `Wann-Frage korrekt formuliert`);
        wannFrage = true;
        return true;
    } else if (frage.toLowerCase().startsWith('wo') && frage.endsWith("?")) {
        ltrace(channel, `Wo-Frage korrekt formuliert`);
        woFrage = true;
        return true;
    } else if (frage.toLowerCase().startsWith('warum') && frage.endsWith("?")) {
        ltrace(channel, `Warum-Frage korrekt formuliert`);
        warumFrage = true;
        return true;
    } else if (frage.toLowerCase().startsWith('wie') && frage.endsWith("?")) {
        ltrace(channel, `Wie-Frage korrekt formuliert`);
        wieFrage = true;
        return true;
    } else if (frage.toLowerCase().startsWith('wozu') && frage.endsWith("?")) {
        ltrace(channel, `Wozu-Frage korrekt formuliert`);
        wozuFrage = true;
        return true;
    }

    return false;
}

const werAntworten = [
    'Die Antwort liegt doch auf der Hand: Chuck Norris natürlich!'
];
const wasAntworten = [
    'Ich denke, was du du wissen willst ist Nutella!'
];
const wannAntworten = [
    'Nun, ich hab mal nachgesehen, ich denke in 30 Jahren etwa.',
    'Also ehrlich, ich denke nie'
];
const woAntworten = [
    'Es ist nicht ganz eindeutig, aber ich denke die Lösung ist Berlin.'
];
const warumAntworten = [
    'Weil isso!'
];
const wieAntworten = [
    'Darauf möchte ich nicht antworten.'
];
const wozuAntworten = [
    'Damit ich dich besser sehen kann!',
    'Wahrscheinlich ist es einfach nur, damit man was zu lachen hat.'
];
