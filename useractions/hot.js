import {formatString, getRandomInt, isModOrStreamer, reformatChannelname, reformatUsername} from "../utils/utils.js";
import {ltrace} from "../utils/logger.js";
import {getParam} from "../utils/databaseUtils.js";
import {HOTTEXT, PARAMKONST} from "../utils/konst.js";

export async function performHot(client, channel, tags, splittedMsg) {
    let channelName = reformatChannelname(channel);
    let hotActive = await getParam(channelName, PARAMKONST.HOT_ACTIVE, "0");

    if ("1" === hotActive) {
        let hotlevel = 0;
        let debugCommand = false;

        if (isModOrStreamer(tags) && splittedMsg && !isNaN(splittedMsg[1])) {
            hotlevel = splittedMsg[1];
            debugCommand = true;
        }

        // wie hot ist entweder der User selbst (wenn nichts uebergeben wurde) oder der uebergebene User
        let commandFrom = reformatUsername(channel, tags.username.toLowerCase());
        let commandTo;

        if (splittedMsg) {
            // okay, wir haben eine Nachricht... jetzt schauen wir, ob nach dem Command noch was kommt
            if (splittedMsg.length > 1) {
                // 0 ist der command, 1 evtl. ein Username
                if (splittedMsg[1].startsWith("@")) {
                    commandTo = reformatUsername(channel, splittedMsg[1]);
                }
            }
        }

        // jetzt brauchen wir noch nen Randomizer der uns zwischen 0 und 100% ausgibt
        if (!debugCommand) {
            hotlevel = getRandomInt(0, 100);
        }
        let hotmsg;

        if (hotlevel == 0) {
            hotmsg = HOTTEXT.LEVEL_0;
        } else if (hotlevel > 0 && hotlevel < 10) {
            hotmsg = HOTTEXT.LEVEL_0_TO_10;
        } else if (hotlevel >= 10 && hotlevel < 25) {
            hotmsg = HOTTEXT.LEVEL_10_TO_25;
        } else if (hotlevel >= 25 && hotlevel < 50) {
            hotmsg = HOTTEXT.LEVEL_25_TO_50;
        } else if (hotlevel >= 50 && hotlevel < 75) {
            hotmsg = HOTTEXT.LEVEL_50_TO_75;
        } else if (hotlevel >= 75 && hotlevel < 90) {
            hotmsg = HOTTEXT.LEVEL_75_TO_90;
        } else if (hotlevel >= 90) {
            hotmsg = formatString(HOTTEXT.LEVEL_90_TO_100, [channelName]);
        }

        if (commandTo) {
            client.say(channel, `@${commandTo} ist zu ${hotlevel}% hot! ${hotmsg}`);
        } else {
            client.say(channel, `@${commandFrom} ist zu ${hotlevel}% hot! ${hotmsg}`);
        }
    }
}
