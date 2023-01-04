import {splitAndResolveString} from "../utils/utils.js";

export function showMapLink(client, channel, tags, message) {
    let splittedMsg = splitAndResolveString(message)

    if (splittedMsg.length === 2) {
        let map = splittedMsg[1].toLowerCase();

        let baseUrl = 'https://escapefromtarkov.fandom.com/wiki/'

        switch (map) {
            case 'streets':
            case 'strassen':
            case 'sot':
                client.say(channel, `Streets Map-Auswahl aus dem Tarkov-Wiki: https://bit.ly/3WX3BzR`);
                break;
            case 'interchange':
            case 'autobahnkreuz':
            case 'inter':
                client.say(channel, `Interchange Map-Auswahl aus dem Tarkov-Wiki: https://bit.ly/3WHyWGQ`);
                break;
            case 'customs':
            case 'zollgelaende':
            case 'zollgelände':
                client.say(channel, `Customs Map-Auswahl aus dem Tarkov-Wiki: https://bit.ly/3IeNZDL`);
                break;
            case 'factory':
            case 'fabrik':
                client.say(channel, `Factory Map-Auswahl aus dem Tarkov-Wiki: https://bit.ly/3jNCqJh`);
                break;
            case 'labs':
            case 'labor':
                client.say(channel, `Labs Map-Auswahl aus dem Tarkov-Wiki: https://bit.ly/3Q83fE6`);
                break;
            case 'reserve':
                client.say(channel, `Reserve Map-Auswahl aus dem Tarkov-Wiki: https://bit.ly/3WVhw9y`);
                break;
            case 'woods':
            case 'waelder':
            case 'wälder':
                client.say(channel, `Woods Map-Auswahl aus dem Tarkov-Wiki: https://bit.ly/3GdQq6Z`);
                break;
            case 'lighthouse':
            case 'leichtturm':
                client.say(channel, `Lighthouse Map-Auswahl aus dem Tarkov-Wiki: https://bit.ly/3Vz91Qo`);
                break;
            case 'shoreline':
            case 'kueste':
            case 'küste':
            case 'shore':
                client.say(channel, `Shoreline Map-Auswahl aus dem Tarkov-Wiki: https://bit.ly/3GyDRo5`);
                break;
        }
    }
}
