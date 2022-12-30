import {constants} from "../settings/botsettings.js"
import tmi from "tmi.js";

export function createClient() {
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
            username: constants.BOT_USERNAME,
            password: constants.BOT_OAUTH
        },
        channels: constants.JOINED_CHANNELS
    });
}
