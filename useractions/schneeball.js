import {formatString, getRandomInt, reformatChannelname, reformatUsername} from "../utils/utils.js";
import fetch from "node-fetch";
import {ltrace} from "../utils/logger.js";
import {getParam} from "../utils/databaseUtils.js";
import {PARAMKONST, SNOWTEXT} from "../utils/konst.js";

export async function performSchneeball(client, channel, tags, splittedMsg) {
    let channelName = reformatChannelname(channel);
    let schneeballActive = await getParam(channelName, PARAMKONST.SCHNEEBALL_ACTIVE, "0");

    if ("1" === schneeballActive) {
        let commandFrom = reformatUsername(channel, tags.username.toLowerCase());
        let commandTo = reformatUsername(channel, splittedMsg[1]);
        let randomVip = await getRandomVip(channelName);
        let randomMod = await getRandomMod(channelName);

        if (!randomVip) {
            randomVip = randomMod;
        }

        ltrace(channel, `performSchneeball() -> randomUser=${randomVip}`);

        const answers = [
            formatString(SNOWTEXT.RANDTEXT_1_01, [commandFrom]),
            formatString(SNOWTEXT.RANDTEXT_1_02, [commandFrom]),
            formatString(SNOWTEXT.RANDTEXT_1_03, [commandFrom]),
            formatString(SNOWTEXT.RANDTEXT_2_01, [commandFrom, commandTo]),
            formatString(SNOWTEXT.RANDTEXT_3_01, [commandFrom, commandTo, randomVip]),
            formatString(SNOWTEXT.RANDTEXT_2_02, [commandFrom, commandTo]),
            formatString(SNOWTEXT.RANDTEXT_2_03, [commandFrom, randomVip]),
            formatString(SNOWTEXT.RANDTEXT_2_04, [commandFrom, commandTo]),
            formatString(SNOWTEXT.RANDTEXT_2_05, [commandFrom, randomVip]),
            formatString(SNOWTEXT.RANDTEXT_3_02, [randomMod, commandTo, commandFrom]),
            formatString(SNOWTEXT.RANDTEXT_4_01, [randomMod, randomVip, commandFrom, commandTo]),
            formatString(SNOWTEXT.RANDTEXT_2_06, [commandFrom, commandTo]),
            formatString(SNOWTEXT.RANDTEXT_2_07, [commandFrom, commandTo]),
            formatString(SNOWTEXT.RANDTEXT_3_03, [commandFrom, commandTo, commandTo]),
            formatString(SNOWTEXT.RANDTEXT_2_08, [commandFrom, commandTo]),
            formatString(SNOWTEXT.RANDTEXT_2_09, [commandFrom, randomVip]),
            formatString(SNOWTEXT.RANDTEXT_2_10, [commandFrom, commandTo]),
            formatString(SNOWTEXT.RANDTEXT_1_04, [commandFrom]),
            formatString(SNOWTEXT.RANDTEXT_2_11, [commandFrom, commandTo]),
            formatString(SNOWTEXT.RANDTEXT_2_12, [commandFrom, randomVip])
        ];

        const size = answers.length;
        let randomNumber = getRandomInt(0, size);

        ltrace(channel, `performSchneeball() -> Antwort: ${answers[randomNumber]}`);
        client.say(channel, answers[randomNumber]);
    }
}

async function getRandomVip(channel) {
    const response = await fetch('https://tmi.twitch.tv/group/user/' + channel + '/chatters');
    const data = await response.json();

    let user = data.chatters.vips;

    let listSize = 0;

    for (const element of user) {
        listSize++;
    }

    let number = getRandomInt(0, listSize);

    return user[number];
}

async function getRandomMod(channel) {
    const response = await fetch('https://tmi.twitch.tv/group/user/' + channel + '/chatters');
    const data = await response.json();

    let user = data.chatters.moderators;

    let listSize = 0;

    for (const element of user) {
        listSize++;
    }

    let number = getRandomInt(0, listSize);

    return user[number];
}

async function soso(channel) {
    const response = await fetch('https://tmi.twitch.tv/group/user/' + channel + '/chatters');
    const data = await response.json();

    let user = data.chatters.viewers;
    user.push.apply(data.chatters.moderators);
    user.push.apply(data.chatters.vips);

    let listSize = 0;

    for (const element of user) {
        listSize++;
    }

    let number = getRandomInt(0, listSize);

    return user[number];
}


