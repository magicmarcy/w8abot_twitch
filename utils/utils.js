import {constants} from "../settings/botsettings.js"

export function reformatUsername(channel, username) {
    if (username && username.startsWith("@")) {
        return username.substring(1).toLowerCase();
    } else if (username) {
        return username.toLowerCase();
    } else {
        return "";
    }
}

export function reformatChannelname(channelnane) {
    if (channelnane && channelnane.startsWith("#")) {
        return channelnane.substring(1).toLowerCase();
    } else {
        return channelnane.toLowerCase();
    }
}

export function getCurrentDateTimeString() {
    let current = new Date();
    let month = (current.getMonth() + 1) < 10 ? '0' + (current.getMonth() + 1) : (current.getMonth() + 1);
    let date = current.getDate() < 10 ? '0' + current.getDate() : current.getDate();

    let cDate = current.getFullYear() + '-' +  month + '-' + date;

    let hours = current.getHours() < 10 ? '0' + current.getHours() : current.getHours();
    let minutes = current.getMinutes() < 10 ? '0' + current.getMinutes() : current.getMinutes();
    let seconds = current.getSeconds() < 10 ? '0' + current.getSeconds(): current.getSeconds();

    let cTime = hours + ':' + minutes + ':' + seconds;

    return cDate + ' ' + cTime + ' ';
}

export function formatString(message, replacements) {
    let result = message;
    let count = (result.match(/%s/g) || []).length;

    for (let i = 0; i < count; i++) {
        result = result.replace("%s", replacements[i]);
    }

    return result;
}

export function isModOrStreamer(tags) {
    let result = false;

    if (tags != null && tags.badges != null) {
        result = tags.badges.hasOwnProperty(constants.MOD) || tags.badges.hasOwnProperty(constants.STREAMER);
    }

    return result;
}

export function isBot(tags) {
    let result = false;

    if (tags != null && tags.username != null) {
        result = tags.username.toLowerCase() === constants.BOT_USERNAME.toLowerCase()
    }

    return result;
}

export function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Mit dieser Split-Methode wird der String zwar am Leerzeichen getrennt, Zusammengehoerige Teile in " bleiben aber zusammen.
 * Beispiel: ?addEvent "Mein cooles Event" 1 0 wird zu ['?addEvent', 'Mein cooles Event', '1', '0']
 */
export function splitAndResolveString(str) {
    return str.match(/"[^"]*"|\S+/g).map(m => m.slice(0, 1) === '"'? m.slice(1, -1): m);
}
