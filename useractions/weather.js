import fetch from "node-fetch";
import translate from "translate";
import {botsay} from "../start.js";
import {ltrace} from "../utils/logger.js";
import {isEmpty} from "../utils/utils.js";

export async function getWeather(channel, splittedMsg) {

    if (splittedMsg.length >= 2 && isNaN(splittedMsg[1])) {

        let location = "";

        for (let i = 1; i < splittedMsg.length; i++) {
            location += splittedMsg[i] + " ";
        }

        location = location.substring(0, location.length - 1);

        if (!isEmpty(location)) {
            let url = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/%s?unitGroup=metric&key=3HDQKARBX3JB3CH6SHRMFYVZD&contentType=json';
            let completeUrl = url.replace("%s", location);

            // RATSCHLAG
            const response = await fetch(completeUrl, {headers: {'Accept': 'application/json'}});

            const json = await response.json();

            if (!isEmpty(json)) {
                let resultString = 'Aktuell beträgt die Temperatur in ' + json.resolvedAddress + ' ' + json.days[0].temp + '°C ';
                let wetterbedingung;

                let wetterbedingungEN = json.days[0].conditions;

                translate.from = 'en';
                let wetterbedingungDE = await translate(wetterbedingungEN, {to: 'de'});

                if (!isEmpty(wetterbedingungDE)) {
                    wetterbedingung = wetterbedingungDE;
                } else {
                    wetterbedingung = wetterbedingungEN;
                }

                resultString += '(' + wetterbedingung + ')';

                resultString += ' Luftfeuchtigkeit ' + json.days[0].humidity + '%,';
                resultString += ' Bewölkung ' + json.days[0].cloudcover + ' %,';
                resultString += ' Regenwahrscheinlichkeit ' + json.days[0].precipprob + '%,';
                resultString += ' Luftdruck ' + json.days[0].pressure + ' Hektopascal';

                ltrace(channel, resultString);

                await botsay(channel, resultString);
            }
        }
    } else {
        await botsay(channel, `Um das aktuelle Wetter abzurufen schreibe "?wetter STADTNAME" (Name, keine Postleitzahl)`);
    }
}
