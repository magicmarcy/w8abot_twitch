import {constants} from "../settings/botsettings.js"
import tmi from "tmi.js";

export function createClient(channels) {

    return new tmi.Client({
        options: {
            debug: constants.DEBUG,
            messagesLogLevel: constants.MESSAGES_LOGLEVEL
        },
        connection: {
            reconnect: constants.RECONNECT,
            secure: constants.SECURE
        },
        identity: {
            username: process.env['USERNAME'],
            password: process.env['OAUTH']
        },
        channels: channels
    });
}
