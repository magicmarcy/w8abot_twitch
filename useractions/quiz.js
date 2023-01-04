import {
    createStatement,
    getActiveQuiz,
    getAllAnswers,
    getAllQuizzes, getDatabase,
    getQuizById,
    getQuizRunFromChannel,
    insertQuizRun,
    stopQuizRun
} from "../utils/databaseUtils.js";
import {getRandomInt, reformatChannelname, reformatUsername, splitAndResolveString, timeConverter} from "../utils/utils.js";
import {lerror, linfo, ltrace, lwarn} from "../utils/logger.js";
import {botsay, sleep} from "../start.js";
import {TEXTKONST} from "../utils/konst.js";
import {givePoints} from "./points.js";

export async function startQuiz(client, channel, tags, message) {
    let sender = reformatUsername(channel, tags.username.toLowerCase());
    // 1. SELECT QUIZRUN um zu schauen, ob da ein aktives Quiz laeuft
    let quiz = await getActiveQuiz(channel);

    console.log(quiz)

    if ("1" === quiz['ACTIVE'] || 1 === quiz['ACTIVE']) {
        lwarn(channel, `Es bereits ein Quiz aktiv! QUIZ=${quiz}`);
        client.say(channel, `@${sender} es ist bereits ein Quiz vom ${timeConverter(quiz['TIMESTAMP'])} aktiv. Um ein neues zu starten muss dieses erst beendet werden.`)
        return;
    }

    let quizzes = await getAllQuizzes(channel);
    let randmomNumber = getRandomInt(0, quizzes.length);

    let quizfrage = quizzes[randmomNumber];

    await insertQuizRun(quizfrage, channel);

    client.say(channel, `Es wurde ein neues Quiz gestartet! Lies die Frage aufmerksam. Googlen zählt nicht! Der, der am nächsten an der Antwort ist gewinnt 1000 Punkte , der, der die Antwort genau nennt gewinnt 5000 Punkte! Tippe deine Antwort mit "?answer DEINEANTWORT" - Du kannst nur einmal antworten! Mach dich bereit, in 20 Sekunden geht's los!`);

    sleep(20000);

    client.say(channel, `+++ QUIZFRAGE +++ ${quizfrage[1]} | Antwort mit "?answer DEINEANTWORT"`);

}

export async function pickWinnerAndDeleteQuiz(client, channel, tags, message) {
    // Das Quiz aus QUIZRUN holen - Es KANN hier nur eins geben mit dem Channelname
    let quizrun = await getQuizRunFromChannel(channel);
    console.log("QUIZRUN: " + quizrun);

    // Die QUIZID aus QUIZRUN brauchen wir zum selektieren der QUIZ_ANSWERS
    let answers = await getAllAnswers(channel);
    console.log("Answers: " + answers);

    // Zu guter letzt noch das Quiz damit wir auch die korrekte Antwort wissen
    let quiz = await getQuizById(channel, quizrun[0][1]);
    console.log("QUIZ: " + quiz);

    let correctanswer = quiz[0][2];
    console.log("Korrekte Antwort: " + correctanswer);

    await pickWinner(client, channel, tags, message, answers, correctanswer);

    // Am Ende auf jeden Fall alle Eintraege fuer den Channel aus QUIZ_ANSWERS loeschen und den Eintrag aus QUIZRUN

}

// Channel = [0], QUIZID = [1], Username = [2], Answer = [3], Timestamp = [4]
// Korrekte Antwort gibt 5000 Punkte
// keine korrekte Antwort aber am nächsten dran gibt 1000 Punkte
export async function pickWinner(client, channel, tags, message, answers, correctanswer) {
    console.log("Hier startet die pickWinner Methode");

    let winnerName = "";
    let allUserAnswers = answers;

    // Liste nach Timestamp sortieren
    allUserAnswers.sort(function (a, b) {
        return a.timestamp - b.timestamp
    });

    // Jetzt mal die Liste durchgehen und schauen ob jemand die korrekte Antwort hat
    let correctAnswers = [];
    for (let i = 0; i < allUserAnswers.length; i++) {
        if (allUserAnswers[i][3] == correctanswer) {
            console.log(`Korrekte Antwort gefunden von ${allUserAnswers[i][2]}`)
            correctAnswers.push(allUserAnswers[i]);
        }
    }

    // Wenn in correctAnswers was drin steht, haben wir mindestens einen Gewinner
    if (correctAnswers.length > 0) {
        console.log("Wir haben mindestens einen, der eine korrekte Antwort abgegeben hat!");

        if (correctAnswers.length === 1) {
            console.log(`Es gibt nur EINEN der eine korrekte Antwort abgegeben hat: ${correctAnswers[0][2]}`)
            winnerName = correctAnswers[0][2];

            await botsay(channel, `Geil! @${winnerName} hat gewonnen! Die richtige Antwort war ${correctanswer}. Glückwunsch!`);

            await givePoints(client, channel, tags, ['?givePoints', 5000, `@${winnerName}`]);
        } else {
            console.log("Wir haben mehrere, die eine korrekte Antwort gegeben haben. Jetzt schauen wir, wer schneller war");
            // Wir haben also mehrere, die die korrekte Antwort gegeben haben. Jetzt muessen wir schauen, wer die korrekte Antwort zuerst eingegeben hat
            // Wir nehmen den ersten Eintrag, iterieren dann ueber alle und schauen, wer den niedrigsten Timestamp hat
            let temporaryWinnner = correctAnswers[0];

            for (let i = 1; i < correctAnswers.length; i++) {
                // Timestamp vergleichen
                if (correctAnswers[i][4] < temporaryWinnner[4]) {
                    temporaryWinnner = correctAnswers[i];
                }
            }

            winnerName = temporaryWinnner[2];

            await botsay(channel, `Die richtige Antwort war ${correctanswer} und @${winnerName} hat die korrekte Antwort als erstes eingegeben und gewinnt 5000 Punkte! Glückwunsch`);

            await givePoints(client, channel, tags, ['?givePoints', 5000, `@${winnerName}`]);
        }
    } else {
        console.log("Keinen gefunden, der eine korrekte Antwort gegeben hat");
        // Also haben wir keinen, der die korrekte Antwort hat. Jetzt muessen wir schauen, wer am naechsten dran ist
        console.log("Wir schauen nun, wer am nächsten an der richtigen Antwort dran ist");
        if (allUserAnswers.length === 1) {
            winnerName = allUserAnswers[0][2];

            // Wenn uns nur einen Teilnehmer gibt, dann lösen wir nicht auf und ermitteln keinen Gewinner
            await botsay(channel, `Es müssen mindestens zwei Antworten eingereicht werden, damit ein Gewinner ermittelt werden kann.`);
        } else {
            // Wenn es meherer Teilnehmer gibt und keiner die korrekte Antwort gegeben hat, gewinnt der, der am naechsten dran ist
            // jetzt muessen wir zweimal suchen: Einmal wer die naechst niedrigere und die naechst hoehere Antwort hat
            // Dann die beiden Differenzen vergleichen und der mit der niedrigsten Differenz gewinnt
            // hier wird's nun tricky...
            // Channel = [0], QUIZID = [1], Username = [2], Answer = [3], Timestamp = [4]

            let overAnswers = [];
            let underAnswers = [];

            // Alle Antworten in zwei Listen aufteilen
            for (let i = 0; i < answers.length; i++) {
                if (answers[i][3] > correctanswer) {
                    overAnswers.push(answers[i]);
                } else {
                    underAnswers.push(answers[i]);
                }
            }




            // nun die kleinste Antwort aus den Antworten ueber der korrekten Antwort
            let minFromOver = null;
            if (overAnswers.length > 0) {
                minFromOver = overAnswers[0];
                for (let i = 0; i < overAnswers.length; i++) {
                    if (overAnswers[i][3] < minFromOver[3]) {
                        minFromOver = overAnswers[i];
                    }
                }
            }

            console.log("minFromOver=" + minFromOver);

            // nun die groesste Antwort als den Antworten unter der korrekten Antwort
            let maxFromUnder = null;
            if (underAnswers.length > 0) {
                maxFromUnder = underAnswers[0];
                for (let i = 0; i < underAnswers.length; i++) {
                    if (underAnswers[i][3] > maxFromUnder[3]) {
                        maxFromUnder = underAnswers[i];
                    }
                }
            }

            console.log("maxFromUnder=" + maxFromUnder);

            // wenn eine der beiden Listen leer ist, dann MUSS die naheliegenste Antwort in der anderen liegen. Beide können nicht leer sein aber beide gefuellt
            // das heißt, dass entweder minFromOver oder maxFromUnder null, bzw. undefined sein kann
            if (minFromOver === null && maxFromUnder !== null) {
                winnerName = maxFromUnder[2];
            } else if (minFromOver !== null && maxFromUnder === null) {
                winnerName = minFromOver[2];
            } else {
                // Channel = [0], QUIZID = [1], Username = [2], Answer = [3], Timestamp = [4]
                let diffFromOverToAnswer = minFromOver[3] - correctanswer;
                console.log("diffFromOverToAnswer=" + diffFromOverToAnswer);

                let diffFromUnderToAnswer = correctanswer - maxFromUnder[3];
                console.log("diffFromUnderToAnswer=" + diffFromUnderToAnswer);

                if (diffFromOverToAnswer < diffFromUnderToAnswer) {
                    winnerName = minFromOver[2];
                } else if (diffFromOverToAnswer > diffFromUnderToAnswer) {
                    winnerName = maxFromUnder[2];
                } else {
                    // hier muss dann der Timestamp beider Antworten vergleichen werden. Kleinerer Timestamp = frueher geantwortet
                    if (minFromOver[4] > maxFromUnder[4]) {
                        winnerName = maxFromUnder[2];
                    } else if (minFromOver[4] < maxFromUnder[4]) {
                        winnerName = minFromOver[2];
                    } else {
                        // in diesem unwahrscheinlichen Fall muessten eigentlich beide gewinnen - da das aber nicht vorgesehen darum nehmen wir den, der weniger getippt hat
                        winnerName = maxFromUnder[2];
                    }
                }
            }

            await botsay(channel, `Die Lösung lautet ${correctanswer} und damit hat @${winnerName} 1000 Punkte gewonnen da die nahliegendste Antwort zuerst eingegeben wurde! Glückwunsch!`);

            await givePoints(client, channel, tags, ['?givePoints', 1000, `@${winnerName}`]);
        }
    }

    // Jetzt alle Lösungen loeschen und den Eintrag aus QUIZ_RUN
    let db = getDatabase();
    let channelName = reformatChannelname(channel);
    const deleteAnswersStatement = createStatement("DELETE FROM QUIZ_ANSWERS WHERE LOWER(CHANNEL) = :1", [channelName]);
    db.exec(deleteAnswersStatement);

    const deleteQuizRunEntry = createStatement("DELETE FROM QUIZRUN WHERE LOWER(CHANNEL) = :1", [channelName]);
    db.exec(deleteQuizRunEntry);


}

export async function stopQuiz(client, channel, tags, message) {
    await stopQuizRun(channel);
}


export async function performQuizAnswer(client, channel, tags, message) {
    let splittedMsg = message.split(" ");
    let channelName = reformatChannelname(channel);
    let username = reformatUsername(channel, tags.username.toLowerCase());
    let userAnswer;

    if (splittedMsg.length >= 2) {
        // wir muessen zunaechst pruefen, ob der User nicht schon geantwortet hat
        let db = getDatabase();
        const statement = createStatement("SELECT CHANNEL channel, QUIZID quizid, USERNAME username, ANSWER answer, TIMESTAMP timestamp FROM QUIZ_ANSWERS WHERE LOWER(CHANNEL) = :1 AND LOWER(USERNAME) = :2", [channelName, username]);

        db.get(statement, (error, row) => {
            if (error) {
                lerror(channel, "Fehler beim Select...")
            } else {
                if (row) {
                    client.say(channel, `Sry @${username}, du hast bereits eine Antwort gesendet.`);
                } else {
                    // Jetzt kann die Antwort angenommen werden
                    let timestamp = (new Date() * 1000) / 1000;
                    userAnswer = splittedMsg[1];
                    const insertStatement = createStatement("INSERT INTO QUIZ_ANSWERS(CHANNEL, QUIZID, USERNAME, ANSWER, TIMESTAMP) VALUES(:1, 0, :2, :3, :4)", [channelName, username, userAnswer, timestamp]);

                    db.exec(insertStatement);
                }
            }
        });
    } else {
        client.say(channel, `Sry @${username}, du musst "?answer ANTWORT" sschreiben. Etwas anderes ist keine gültige Eingabe.`);
    }
}
