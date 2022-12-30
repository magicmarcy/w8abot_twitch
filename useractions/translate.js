import translate from "translate";
import {ltrace} from "../utils/logger.js";
import {getParam} from "../utils/databaseUtils.js";
import {PARAMKONST} from "../utils/konst.js";

/**
 * Wegen dem Async muss das hier in eigenen Methoden sein... bisschen probieren, evtl. muss da auch ein .than() an
 * die aufrufende Methode oder so
 */
export async function translatee(client, channel, tags, splittedMsg) {
    ltrace(channel, `translatee() -> User=${tags.username.trim()}, Msg=${splittedMsg}`);

    let command = await getParam(channel, PARAMKONST.COMMAND, "?");

    if (splittedMsg && splittedMsg.length === 2 && (splittedMsg[1].trim().toLowerCase() === 'help' || splittedMsg[1].trim() === '?')) {
        client.say(channel, `Ich kann dir helfen deinen Text zu übersetzen. Schreibe einfach "${command}translate" gefolgt 
        von der Sprach-ID die du schreibst und der Sprach-ID in die du übersetzen möchtest. Beispiel: "${command}translate de en 
        Hallo chat!". Momentan funktioniert das in alle Richtungen mit de (deutsch), en (englisch), ko (koreanisch), ru (russisch), es 
        (spanisch), it (italienisch), pl (polnisch) und vielen anderen.`);
    }

    if (splittedMsg.length >= 4) {
        let langFrom = validateLang(splittedMsg[1]);
        let langTo = validateLang(splittedMsg[2]);

        if (langFrom === '' || langTo === '' || langFrom === langTo || splittedMsg[3].trim() === '') { return; }

        let textToTranslate= "";

        for (let i = 3; i < splittedMsg.length; i++) {
            textToTranslate += splittedMsg[i] + " ";
        }

        translate.from = langFrom;
        let translated = await translate(textToTranslate, { to: langTo });
        client.say(channel, `@${tags.username.trim()}: ${translated}`);
    }
}

function validateLang(lang) {
    let result = '';

    if (lang && lang !== '' && lang.length === 2) {
        // erstmal davon ausgehen, dass alles korrekt ist und alle Sprachen unterstuetzt werden
        result = lang.toLowerCase();
    }

    return result;
}
