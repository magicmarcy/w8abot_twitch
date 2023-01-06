import fetch from "node-fetch";
import translate from "translate";
import {ltrace} from "../utils/logger.js";
import {botsay} from "../start.js";
import {isEmpty} from "../utils/utils.js";

export async function randomCatfact(channel) {
    try {
        const response = await fetch('https://catfact.ninja/fact');
        const json = await response.json();

        if (!isEmpty(json)) {
            const stringToTranslate = json.fact;
            console.log("Original Answer: " + stringToTranslate);

            if (!isEmpty(stringToTranslate)) {
                let langFrom = 'en';
                let langTo = 'de';

                translate.from = langFrom;
                let translated = await translate(stringToTranslate, {to: langTo});

                if (!isEmpty(translated)) {
                    ltrace(channel, "Translated: " + translated);
                    await botsay(channel, translated);
                } else {
                    await botsay(channel, stringToTranslate);
                }
            }
        }
    } catch (err) {
        ltrace("#w8abit_de", `Fehler beim Abruf der RandomCatFact API...`)
        await botsay(channel, `Leider konnte ich keine Verbindung zur API herstellen... sry`);
    }
}
