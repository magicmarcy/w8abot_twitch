import {getRandomInt, reformatUsername} from "../utils/utils.js";
import {botsay} from "../start.js";

export async function performSlap(client, channel, tags, splittedMsg) {
    let commandFrom = reformatUsername(channel, tags.username);

    if (splittedMsg.length === 2) {
        let commandTo = splittedMsg[1];

        const answers = [
            `@${commandFrom} haut ${commandTo} eine runter. Patsch! Das muss weh getan haben!`,
            `@${commandFrom} gibt ${commandTo} einen fetten Nackenklatscher! Das hat richtig geklatscht!`,
            `@${commandFrom} zögert nicht lang und gibt ${commandTo} ne solide Backpfeife!`,
            `@${commandFrom} dreht sich um, holt für ne saftige Schelle aus und liefert sie direkt bei ${commandTo} ab! Respekt!`,
            `@${commandFrom} verpasst ${commandTo} einen dicken Arschtritt! Der hat gesessen!`,
            `@${commandFrom} haut ${commandTo} ne dicke Forelle um die Ohren! Patsch! Patsch! Patsch!`,
            `${commandTo} holt sich von @${commandFrom} erstmal ne dicke Respektschelle ab!`
        ];

        let randomAnswerNumber = getRandomInt(0, answers.length);
        let finalAnswer = answers[randomAnswerNumber];

        try {
            await botsay(channel, finalAnswer);
        } catch (err) {
            // nix machen
        }
    } else {
        await botsay(channel, `@${commandFrom} du musst "?slap @USERNAME" schreiben ;-)`);
    }
}
