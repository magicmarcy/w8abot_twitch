import * as dotenv from 'dotenv';
dotenv.config();

/**
 * Settings fuer die Authorization und globale Einstellungen
 * @BOTNAME {string} ist hier lediglich fuer Textausgaben!!
 * Deine Credentials muessen in der .env-Datei als USERNAME und OAUTH liegen!
 * Ansonsten die Datei bitte nicht veraendern!
 */
export const constants = Object.freeze({
    BOTNAME: 'w8abot',
    MOD: 'moderator',
    STREAMER: 'broadcaster',
    BOT_USERNAME: process.env.USERNAME,
    BOT_OAUTH: process.env.OAUTH,
    DEBUG: true,
    RECONNECT: true,
    SECURE: true,
    MESSAGES_LOGLEVEL: 'info',
    DATABASENAME: './data/botdata.db',
    PARAMDATABASE: './data/settings.db',
    BOTVERSION: '0.5.45 beta',
    GITHUBURL: 'https://bit.ly/3WScD11'
});
