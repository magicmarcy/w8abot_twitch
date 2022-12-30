import * as fs from "fs";
import {reformatChannelname} from "./utils.js";

let date = new Date();
let filedate = date.toISOString().replace(/T/, ' ').replace(/\..+/, '').substring(0, 10);
let printdate = date.toISOString().replace(/T/, ' ').replace(/Z/, '')

export function lerror(channel, message) {
    log(channel, '[ERROR]', message);
}

export function ltrace(channel, message) {
    log(channel, '[TRACE]', message);
}

export function lwarn(channel, message) {
    log(channel, '[WARN]', message);
}

export function linfo(channel, message) {
    log(channel, '[INFO]', message);
}

function log(channel, level, message) {
    const log = fs.createWriteStream(`./log/log_${filedate}.log`, {flags: 'a'});
    log.write(`${printdate} [${channel}] ${level}: ${message}\n`);
    log.end();
}

export function msglog(channel, username, message) {
    let channelName = reformatChannelname(channel);

    if (!fs.existsSync(`./msglog/${channelName}/${filedate}`)) {
        fs.mkdirSync(`./msglog/${channelName}/${filedate}`, { recursive: true });
    }

    const log = fs.createWriteStream(`./msglog/${channelName}/${filedate}/${channelName}_${filedate}.log`, {flags: 'a'});
    log.write(`${printdate} [${channel}/${username}]: ${message}\n`);
    log.end();
}

export function logClientInfos(client) {
    linfo("", `Client-ID: ${client.clientId}`);
    linfo("", `Channels: ${client.channels}`);
    linfo("", `Current Latency: ${client.currentLatency}`);
    linfo("", `Channels: ${client.getChannels()}`);
    linfo("", `Username: ${client.getUsername()}`);
    linfo("", `Moderators: ${JSON.stringify(client.moderators)}`);
    linfo("", `LastJoined: ${client.lastJoined}`);
    linfo("", `Server: ${client.server}`);
    linfo("", `GlobalUserState: ${JSON.stringify(client.globaluserstate)}`);
}
