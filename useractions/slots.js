import {getRandomInt, reformatChannelname, reformatUsername} from "../utils/utils.js";
import {createStatement, getDatabase, getParam} from "../utils/databaseUtils.js";
import {lerror, linfo, ltrace} from "../utils/logger.js";
import {PARAMKONST} from "../utils/konst.js";

export async function performSlots(client, channel, tags, splittedMsg) {
    let channelName = reformatChannelname(channel);

    let slotsActive = await getParam(channel, PARAMKONST.SLOTS_ACTIVE, "0");

    if (slotsActive == "1") {
        ltrace(channel, `performSlots() -> Entry`);

        let commandFrom = reformatUsername(channel, tags.username.toLowerCase());
        let command = await getParam(channel, PARAMKONST.COMMAND, "?");

        let threeOfAKind =  await getParam(channel, PARAMKONST.MULTIPLY_SLOTS_THREE_OF_A_KIND, "0");
        let twoOfAKind = await getParam(channel, PARAMKONST.MULTIPLY_SLOTS_TWO_OF_A_KIND, "0");
        let specialResult = await getParam(channel, PARAMKONST.MULTIPLY_SLOTS_SPECIAL, "0");

        let threeOfAKind_multiply = parseInt(threeOfAKind);
        let twoOfAKind_multiply = parseInt(twoOfAKind);
        let specialResult_multiply = parseInt(specialResult);

        if (splittedMsg && splittedMsg.length === 1) {
            linfo(channel, `performSlots() -> ${commandFrom} ruft Slots-Info ab`);

            client.say(channel, `@${commandFrom} schreibe ${command}slots gefolgt von den Punkten, die du pro Spin einsetzen möchtest. Du erhälst deinen Einsatz x${twoOfAKind_multiply} wenn du ein Pärchen hast, x${threeOfAKind_multiply} wenn du einen Drilling hast und x${specialResult_multiply} wenn du ein ganz bestimmte Kombination erzielst. Viel Glück!`);
        }

        if (splittedMsg !== null && splittedMsg.length === 2 && !isNaN(splittedMsg[1])) {
            ltrace(channel, `performSlots() -> ${commandFrom} fuehrt Slots aus mit ${splittedMsg[1]} Punkten`);

            const statement = createStatement("SELECT POINTS FROM POINTS WHERE LOWER(CHANNEL) = :1 AND LOWER(USERNAME) = :2", [channelName, commandFrom]);
            const db = getDatabase();

            db.get(statement, (error, row) => {
                if (error) {
                    lerror(channel, "performSlots() -> Fehler beim Select...")
                } else {
                    if (row) {
                        let actualPoints = parseInt(row['POINTS']);
                        let amount = parseInt(splittedMsg[1]);
                        let newPoints = 0;

                        if (amount > actualPoints) {
                            ltrace(channel, `performSlots() -> ${commandFrom} versucht ${amount} Pkt. zu setzen, hat aber nur ${actualPoints} Pkt.`);

                            client.say(channel, `Sorry @${commandFrom}, du hast leider nicht genug Punkte`);
                            return;
                        }

                        let threeOfAKind = false;
                        let twoOfAKind = false;
                        let specialResult = false;

                        const possibilities = [
                            "Butchkappa",
                            "DanceR3",
                            "PeepoNoob",
                            "PepoDance",
                            "PETTHEBROADCASTER",
                            "PETTHEBROADCASTER",
                            "PETTHEMODS",
                            "pressF",
                            "ResidentSleeper",
                            "catJAM",
                            "DanceinDancein",
                            "PeepoGG",
                            "monkaO",
                            "SHAKERS"
                        ];

                        let pick1 = getRandomInt(0, possibilities.length - 1);
                        let pick2 = getRandomInt(0, possibilities.length - 1);
                        let pick3 = getRandomInt(0, possibilities.length - 1);

                        const result = [
                            possibilities[pick1],
                            possibilities[pick2],
                            possibilities[pick3]
                        ];

                        // Wenn dreimal das Gleiche Symbol da ist, dann
                        threeOfAKind = isThreeOfAKind(result);
                        twoOfAKind = isTwoOfAKind(result);
                        specialResult = isSpecialResult(result);

                        let resultMsg = `${result[0]} | ${result[1]} | ${result[2]}`;

                        ltrace(channel, `performSlots() -> ${resultMsg}`)

                        client.say(channel, `${resultMsg}`);

                        if (threeOfAKind) {
                            let price = amount * threeOfAKind_multiply;
                            newPoints = actualPoints + price;
                            client.say(channel, `Geil! @${commandFrom} du hast einen Drilling und erhälst ${price} Punkte! (${amount} Punkte x ${threeOfAKind_multiply})`);
                        } else if (!threeOfAKind && specialResult) {
                            let price = amount * specialResult_multiply;
                            newPoints = actualPoints + price;
                            client.say(channel, `Geil! @${commandFrom} du hast ein Special Result erzielt und erhälst ${price} Punkte! (${amount} Punkte x ${specialResult_multiply})`);
                        } else if (!threeOfAKind && twoOfAKind && !specialResult) {
                            let price = amount * twoOfAKind_multiply;
                            newPoints = actualPoints + price;
                            client.say(channel, `Geil! @${commandFrom} du hast ein Pärchen und erhälst ${price} Punkte! (${amount} Punkte x ${twoOfAKind_multiply})`);
                        } else {
                            newPoints = actualPoints - amount;
                            const statement = createStatement("UPDATE POINTS SET POINTS = :1 WHERE LOWER(CHANNEL) = :2 AND LOWER(USERNAME) = :3", [newPoints, channelName, commandFrom]);
                            db.exec(statement);
                            return;
                        }

                        const statement = createStatement("UPDATE POINTS SET POINTS = :1 WHERE LOWER(CHANNEL) = :2 AND LOWER(USERNAME) = :3", [newPoints, channelName, commandFrom]);
                        db.exec(statement);
                    }
                }
            });
        }
    }
}

function isThreeOfAKind(resultArray) {
    let result = false;

    if (resultArray) {
        if (resultArray[0] === resultArray[1] &&
            resultArray[1] === resultArray[2] &&
            resultArray[0] === resultArray[2]) {
            result = true;
        }
    }

    return result;
}

function isTwoOfAKind(resultArray) {
    let result = false;

    if (resultArray) {
        if (resultArray[0] === resultArray[1] ||
            resultArray[0] === resultArray[2] ||
            resultArray[1] === resultArray[2]) {
            result = true;
        }
    }

    return result;
}

function isSpecialResult(resultArray) {
    let result = false;

    if (resultArray) {
        if ((resultArray[0] === "PETTHEMODS" && resultArray[1] === "PETTHEBROADCASTER" && resultArray[2] === "PETTHEMODS") ||
            (resultArray[0] === "PETTHEMODS" && resultArray[1] === "PETTHEMODS" && resultArray[2] === "PETTHEBROADCASTER") ||
            (resultArray[0] === "PETTHEBROADCASTER" && resultArray[1] === "PETTHEMODS" && resultArray[2] === "PETTHEMODS")) {
            result = true;
        }
    }

    return result;
}

