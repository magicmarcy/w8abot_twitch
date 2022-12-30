import {reformatChannelname, reformatUsername} from "../utils/utils.js";
import {updateParamValue} from "../utils/databaseUtils.js";

export function performUpdateParamvalue(client, channel, tags, splittedMsg) {
    if (splittedMsg.length === 3) {
        let param = splittedMsg[1].toUpperCase();
        let paramValue = splittedMsg[2];

        updateParamValue(client, channel, param, paramValue);
    }
}
