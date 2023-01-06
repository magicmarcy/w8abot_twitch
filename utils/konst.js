export const PARAMKONST = Object.freeze({
    COMMAND: 'COMMAND',
    DUELL_ACTIVE: 'DUELL_ACTIVE',
    EVENTS_ACTIVE: 'EVENTS_ACTIVE',
    GAMBLE_ACTIVE: 'GAMBLE_ACTIVE',
    GAMBLE_CHANCE_TO_WIN: 'GAMBLE_CHANCE_TO_WIN',
    HOT_ACTIVE: 'HOT_ACTIVE',
    HUG_ACTIVE: 'HUG_ACTIVE',
    MULTIPLY_SLOTS_SPECIAL: 'MULTIPLY_SLOTS_SPECIAL',
    MULTIPLY_SLOTS_THREE_OF_A_KIND: 'MULTIPLY_SLOTS_THREE_OF_A_KIND',
    MULTIPLY_SLOTS_TWO_OF_A_KIND: 'MULTIPLY_SLOTS_TWO_OF_A_KIND',
    POINTS_PER_MSG: 'POINTS_PER_MSG',
    POINTS_PER_MSG_ACTIVE: 'POINTS_PER_MSG_ACTIVE',
    POINTS_PER_MSG_MULTI: 'POINTS_PER_MSG_MULTI',
    POINTS_PER_RAID: 'POINTS_PER_RAID',
    POINTS_PER_RAIDER: 'POINTS_PER_RAIDER',
    POINTS_PER_RESUB: 'POINTS_PER_RESUB',
    POINTS_PER_SUB: 'POINTS_PER_SUB',
    POINTS_PER_SUBGIFT: 'POINTS_PER_SUBGIFT',
    SCHNEEBALL_ACTIVE: 'SCHNEEBALL_ACTIVE',
    SLOTS_ACTIVE: 'SLOTS_ACTIVE',
    TICKET_ACTIVE: 'TICKET_ACTIVE',
    FORBIDDEN_COMMAND_NAMES: 'hi,givepoints,setpoints,updateparam,addevent,startevent,deleteevent,raidoffer,addsocial,editsocial,startquiz,stopquiz,pickwinner,addliste,addlist,removeliste,removelist,addtolist,addtoliste,removefromlist,removefromliste,killbot,hug,points,punkte,top,gamble,translate,trans,slap,schneeball,modcheck,ask,hot,slots,duell,accept,deny,socials,commands,map,answer,antwort,support,botinfo,help,info,liste,list,wetter,weather,catfact'
});

export const TEXTKONST = Object.freeze({
    LEERSTRING: '',
    NO_DATA: 'Keine Daten vorhanden',
    ERR_ADDEVENT_COMMAND: 'Um ein Event hinzuzufügen schreibe %saddEvent NAME MAXENTRIES PRICEPERTICKET (z.B. %saddEvent CoolEvent 1 100)',
    ADDEVENT_SUCCESS: 'Dein Event mit dem Namen "%s" wurde erfolgreich angelegt. MaxEntries: %s, PricePerTicket: %s. Du musst das Event mit "%sstartEvent NAME" aktivieren bevor Einträge zugelassen werden.',
    EVENT_ALREADY_ACTIVE: 'Das Event ist bereits aktiv',
    EVENT_NOT_FOUND: 'Es wurde kein Event mit dem Namen "%s" gefunden.',
    EVENT_STARTED: 'Das Event "%s" wurde gestartet!',
    EVENT_STARTED_USER_MSG: 'Schreibe "%sticket" und die Anzahl der Tickets, die du einsetzen möchtest (z.B. ticket 2, oder ticket max). Ein Ticket kostet %s Punkte und du kannst maximal %s Tickets kaufen.',
    EVENT_DELETED: 'Event "%s" gelöscht'
});

export const HOTTEXT = Object.freeze({
    LEVEL_0: 'Ooookay, man muss halt auch nicht immer alles kommentieren... vielleicht mal die Heizung anmachen?',
    LEVEL_0_TO_10: 'Das ist wohl nicht mehr als ein warmes Lüftchen, würde ich mal sagen.',
    LEVEL_10_TO_25: 'Das ist zwar nicht ganz so heiß aber für eine Kerze könnte es reichen',
    LEVEL_25_TO_50: 'Das ist schon hot, aber vielleicht drehst du die Heizung etwas höher?',
    LEVEL_50_TO_75: 'Das ist schon gut hot! Für ein kleines Feuer wird\'s reichen.',
    LEVEL_75_TO_90: 'Wow, das ist schon sehr heiß!',
    LEVEL_90_TO_100: 'Wow, du bist wirklich sehr heiß und damit unter den Heißesten der Heißesten in %s\'s Channel! Ich rieche quasi schon das Feuer!'
});

export const SNOWTEXT = Object.freeze({
    // Texte mit 1 Replacement
    RANDTEXT_1_01: '@%s? Bist du\'s wirklich?',
    RANDTEXT_1_02: '@%s scheitert kläglich einen Schneeball zu werfen - der fällt einfach direkt auf den Boden. Enttäuschend.',
    RANDTEXT_1_03: 'Ich weiß nicht wohin @%s werfen wollte aber irgendwie sieht das nach der falschen Richtung aus.',
    RANDTEXT_1_04: 'Also ehrlich @%s das Ding da in deiner Hand soll ein Schneeball sein? Dir ist schon klar, dass die auch rund sein müssen?',

    // Texte mit 2 Replacements
    RANDTEXT_2_01: '@%s schmeißt den Schneeball in die Richtung von @%s - der kann aber ausweichen und macht sich erstmal lang xD',
    RANDTEXT_2_02: 'Der Schneeball von @%s kommt echt scharf geflogen und trifft @%s voll im Gesicht - das tut schon beim zusehen weh! AUA!',
    RANDTEXT_2_03: 'Der Schneeball von @%s kommt echt scharf geflogen und trifft @%s voll im Gesicht - ob das die Absicht war?',
    RANDTEXT_2_04: '@%s\'s Schneeball sieht wie ein Eisball aus. So wie @%s das Gesicht beim Einschlag auf den Oberschnenkel verzieht war er es auch. Autsch!',
    RANDTEXT_2_05: '@%s\'s Schneeball sieht wie ein Eisball aus. Durch einen heftigen Windstoss wird aber @%s heftig am Oberschenkel getroffen. Autsch!',
    RANDTEXT_2_06: '@%s wirft einen perfekte Schneeball in Richtung %s und verfehlt nur knapp das Ziel',
    RANDTEXT_2_07: '@%s wirft einen labbrigen Schneeball nach %s doch der Schnellball zwefällt direkt im Flug',
    RANDTEXT_2_08: '@%s\'s Schneeball verfehlt %s nur um ein paar Zentimeter - das war echt knapp!',
    RANDTEXT_2_09: 'Kaum zu glauben, @%s schmeisst den Schneeball mit voller Wucht @%s an den Kopf... ob das Absicht war?',
    RANDTEXT_2_10: 'Kaum zu glauben, @%s schmeisst den Schneeball mit voller Wucht @%s an den Kopf! Das tut schon beim zusehen weh!',
    RANDTEXT_2_11: '@%s hat echt alles versucht aber der Schneeball bleibt einfach vor @%s\'s Füßen liegen.',
    RANDTEXT_2_12: '@%s hat echt alles versucht aber der Schneeball bleibt irgendwie vor @%s\'s Füßen liegen.',

    // Texte mit 3 Replacements
    RANDTEXT_3_01: '@%s schmeißt den Schneeball in die Richtung von @%s - der kann aber ausweichen und jetzt wird @%s getroffen.. oh oh',
    RANDTEXT_3_02: 'Schon legendär wie @%s sich dazwischen schmeisst damit @%s nicht von @%s\'s Schneeball getroffen wird',
    RANDTEXT_3_03: '@%s holt aus und versucht %s zu treffen. Mit rund 100km/h trifft der Schneeball %s Schulter - hat jemand nen Splint?',

    // Texte mit 4 Replacements
    RANDTEXT_4_01: 'Schon legendär wie @%s sich dazwischen schmeisst damit @%s nicht von @%s\'s Schneeball getroffen wird. Dabei wollte er doch eigentlich @%s treffen. Verwirrend.',
});
