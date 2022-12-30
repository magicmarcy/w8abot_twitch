import fetch from "node-fetch";
import {reformatChannelname, reformatUsername} from "../utils/utils.js";

export async function performModCheck(client, channel, tags, splittedMsg) {
    let commandFrom = reformatUsername(channel, tags.username.toLowerCase());
    let channelName = reformatChannelname(channel);

    const response = await fetch('https://tmi.twitch.tv/group/user/' + channelName + '/chatters');
    const data = await response.json();

    client.say(channel, `Hey ${commandFrom}, es sind folgende Mods hier: ${data.chatters.moderators}`)
}
