# Detaillierte Funktionsbeschreibung

Der Bot bietet ein paar coole Commands. Welches Präfix für Commands gilt, wird global festgelegt und kann über den Parameter ```COMMAND``` pro Channel geändert werden. Per Default ist es aber das ```?```-Zeichen.

Der Bot verfügt auch über ein eigenes Punktesystem. Jeder Nutzer erhält pro Chatnachricht (die KEIN Command ist!) Punkte. Diese Punkte können für verschiedene Aktionen verwendet werden. Details dazu im Abschnitt "Punkte".

## General Commands

### &star; HUG
Hier kannst du einen anderen User virtuell umarmen. Dabei wird sich gemerkt, wie oft das bereits gemacht wurde und entsprechend ausgegeben.

VERWENDUNG          | BEISPIEL                   | ERGEBNIS                                                             |
--------------------|----------------------------|----------------------------------------------------------------------|
```?hug USERNAME``` | ```?hug @StreamElements``` | [13:37] w8abot: @w8abit_de umarmt @streamelements schon zum 3 Mal <3 

### &star; DUELL
Mit diesem Spiel kannst du einen anderen User zu einem Duell um Punkte herausfordern. Dein Kontrahent hat zwei Minuten Zeit um deine Duell-Anfrage anzunehmen. Tut er das nicht, verfällt die Anfrage.

VERWENDUNG                   | BEISPIEL                         | ERGEBNIS |
-----------------------------|----------------------------------|----------|
```?duell PUNKTE USERNAME``` | ```?duell 100 @StreamElements``` | [13:37] w8abot: @w8abit_de fordert @streamelements zu einem Duell heraus! Es geht um 100 Punkte! @streamelements, du kannst das Duell mit ?accept annehmen und dich der Herausforderung stellen (wenn du genügend Punkte hast). Du hast dafür nur 2 Min Zeit! Viel Glück!
```?accept```                | ```?accept```                    | [13:37] w8abot: @w8abit_de hat gewonnen und gewinnt 100 Punkte von @streamelements

**In Arbeit**
- Möglichkeit ein Duell abzulehnen statt es verfallen zu lassen
- Duell-Ergebnisse anhand von Skills statt Random erzielen

### &star; GAMBLE
Mit diesem Spiel kannst du das Schicksal über deine Punkte entscheiden lassen. Der Zufall entscheidet, ob du deine eingesetzten Punkte verdoppelst oder verlierst (je nach eingestellte Gewinnchance). Du hast die Möglickeit eine bestimmte Anzahl von Punkten zu setzen, einen Prozentwert oder alles.

VERWENDUNG            | BEISPIEL          | ERGEBNIS |
----------------------|-------------------|----------|
```?gamble PUNKTE```  | ```?gamble 100``` | [13:37] w8abot: Geil, @w8abit_de hat gewonnen und nun 41570 Punkte!
```?gamble PROZENT``` | ```?gamble 10%``` | [13:37] w8abot: Geil, @w8abit_de hat gewonnen und nun 45727 Punkte!
```?gamble all```     | ```?gamble all``` | [13:37] w8abot: @w8abit_de hat es geschafft 45727 Punkte zu verlieren obwohl es nur eine 35%ige Chance zu verlieren gab NotLikeThis

### &star; SCHNEEBALL
Mit diesem Spiel kannst du einen anderen User mit einem Schneeball bewerfen. Es gibt allerdings keine Garantie, dass das auch erfolgreich verlaufen wird. Es kann auch passieren, dass unbeteiligte getroffen werden!
Bei manchen Lösungsmöglichkeiten, wird ein zufälliger User oder VIP aus dem Chat hinzugezogen. Fällt die Wahl auf einen VIP und es ist kein VIP anwesend, wird ein zufälliger Moderator gewählt.

VERWENDUNG                  | BEISPIEL                          | ERGEBNIS |
----------------------------|-----------------------------------|----------|
```?schneeball USERNAME```  | ```?schneeball @streamelements``` | [13:37] w8abot: Kaum zu glauben, @w8abit_de schmeisst den Schneeball mit voller Wucht @streamelements an den Kopf!

**In Arbeit**
- Viel mehr Lösungsmöglichkeiten

### &star; HOT
Mit diesem Spiel lässt sich einfach feststellen, wie heiß jemand ist. Ohne Angabe eines Usernamens wird das Command für den Aufrufer ausgeführt.

VERWENDUNG                  | BEISPIEL                   | ERGEBNIS |
----------------------------|----------------------------|----------|
```?hot```  | ```?hot```                 | [13:37] w8abot: @w8abit_de ist zu 77% hot! Wow, das ist schon sehr heiß!
```?hot USERNAME```  | ```?hot @StreamElements``` | [13:37] w8abot: @streamelements ist zu 31% hot! Das ist schon hot, aber vielleicht drehst du die Heizung etwas höher?

**In Arbeit**
- Mehr Lösungsmöglichkeiten: Momentan sind nur Bereiche definiert
- Speichern der Ergebnisse und neu Auslosung nur einmal pro Tag möglich

### &star; SLOTS
Mit diesem Command startest du ein einfaches Slots Spiel (Einarmiger Bandit). Es werden immer drei zufällige Emotes angezeigt (Better Twitch TV erforderlich um die Emotes statt des Textes zu sehen). Ergebnisse mit denen du gewinnst: 2 Gleiche Emotes, 3 gleiche Emotes, Special Result (2x PETTHEMODS, 1x PETTHEBROADCASTER).

VERWENDUNG                  | BEISPIEL         | ERGEBNIS                                                                                                             |
----------------------------|------------------|----------------------------------------------------------------------------------------------------------------------|
```?slots PUNKTE```  | ```?slots 100``` | [13:37] w8abot: PETTHEBROADCASTER PETTHEBROADCASTER catJAM
 _  | _                | [13:37] w8abot: Geil! @w8abit_de du hast ein Pärchen und erhälst 200 Punkte! (100 Punkte x 2)

**In Arbeit**
- Limitierung der Aufrufe und Suchtprävention

### &star; TRANSLATE
Der Bot hat eine Übersetzungsfunktion. Dies ermöglicht allen Usern einen beliebigen Text in eine andere Sprache übersetzen zu lassen. Hier branötigt man lediglich das Sprachkennzeichen.
Als erstes muss die Ausgangssprache angegeben werden, dann die Zielsprache

VERWENDUNG                  | BEISPIEL                                             | ERGEBNIS |
----------------------------|------------------------------------------------------|----------|
```?trans```      | ```?trans de en Hallo und willkommen im Chat```      | [13:37] w8abot: @w8abit_de: Hello everyone and welcome to the chat
```?translate```  | ```?translate en de Hello and welcome to the chat``` | [13:37] w8abot: @w8abit_de: Hallo und willkommen im Chat

**Sprachkennzeichen (Auszug)**
- de (deutsch), en (englisch), ko (koreanisch), pl (polnisch), ru (russisch), cz (tschechisch), es (spanisch) usw.

### &star; PUNKTE
Der Bot verwendet ein eigenes Punktesystem. Pro Nachricht erhälst du eine festgelegte Anzahl an Punkten (wenn die Nachricht KEIN Command ist). Die Punkte kannst du für die verschiedenen Spiele einsetzen.

VERWENDUNG     | BEISPIEL      | ERGEBNIS |
---------------|---------------|----------|
```?points```  | ```?points``` | [13:37] w8abot: @w8abit_de du hast 91454 Punkte und belegst damit Platz 1/5
```?punkte```  | ```?punkte``` | [13:37] w8abot: @w8abit_de du hast 91454 Punkte und belegst damit Platz 1/5
```?top```     | ```?top```    | [13:37] w8abot: Top-Points: 1: @w8abit_de (91454), 2: @jw8abit:_de (2915), 3: @w8abit_de (1500), 4: @w8abit_de (550), 5: @w8abit_de (440)

### &star; MODCHECK
Hier kannst du einfach die abwesenden Mods abfragen

VERWENDUNG       | BEISPIEL        | ERGEBNIS |
-----------------|-----------------|----------|
```?modcheck```  | ```?modcheck``` | [13:37] w8abot: Hey w8abit_de, es sind folgende Mods hier: streamelements,w8abot

## WORK IN PROGRESS

Prioritätenorder:
- &star;&star;&star;&star;&star; (super wichtig)
- &star;&star;&star;&star; (wichtig)
- &star;&star;&star; (kann warten)
- &star;&star; (hat länger Zeit)
- &star; (vernachlässigbar)

Priorität       | Fortschritt | Beschriebung |
----------------|-------------|--------------|
&star;&star;&star;&star;    | 60%         | Ablehnen einer Duell-Anfrage (?deny) 
&star;                      | 0%          | slap-Command - Einfach jemandem was um die Ohren hauen
&star;&star;&star;          | 25%         | Ticket-System fuer das Einrichten von Gewinnspielen und Give-a-ways


# Mod & Broadcaster
Der Bot ist so aufgebaut, dass sich nahezu alle Einstellungen direkt über den Chat verwalten lassen. Alle Aktionen und Einstellungen sind über Parameter realisiert, die sich per Command einstellen lassen. Diese Aktion lassen sich nur mit den Rollen "Moderator" oder "Broadcaster" durchführen!

Aktiv ist in der Regel der Wert 1, deaktiviert der Wert 0.

## Parameter
Alle Parameter für den jeweiligen Channel lassen sich mit folgendem Command einstellen ```updateparam PARAMETERNAME PARAMETERWERT```. Du kannst sämtliche Parameter im Live-Betrieb ändern ohne den Bot neustarten zu müssen. Der geänderte Wert greift sofort nach Umstellung.

**Momentan gibt es hier noch keine Absicherung von Fehleingaben. Bitte verwendet diese Funktion ausschließlich wie beschrieben! Der entsprechende Parameter muss genau so eingegeben werden, wie in der Liste beschrieben!**

Wichtig: Die Default-Einstellungen greifen immer. Ist der eingestellte Wert für dich in Ordnung, musst du nichts unternehmen.

### Parameterdokumentation
PARAMETERNAME | BESCHREIBUNG | DEFAULTWERT
-------- |--------------|---------|
**COMMAND** | Das Präfix welches die Commands triggert. | ?
**POINTS_PER_MSG_ACTIVE** | Steuert, ob es für die User Punkte pro gesendeter Nachricht geben soll. Mögliche Werte: 1, 0 | 0
**POINTS_PER_MSG** | Legt fest, wieviele Punkte ein User pro Nachricht erhält | 0
**POINTS_PER_MSG_MULTI** | Multiplikator-Option für jede Nachricht. | 0
**DUELL_ACTIVE** | Erlaubt die Nutzund des Spiels "Duell" mit welchem sich zwei Spieler gegenseitig heraufordern können | 0
**GAMBLE_ACTIVE** | Erlaubt die Nutzung des Spiels "Gamble". | 0
**GAMBLE_CHANCE_TO_WIN** | Legt die Gewinnchance in Prozent fest | 100
**HOT_ACTIVE** | Erlaubt die Nutzung des Spiels "Hot" | 0
**HUG_ACTIVE** | Erlaubt die Nutzung des Spiels "Hug" | 0
**SCHNEEBALL_ACTIVE** | Erlaubt die Nutzung des Spiels "Schneeball" | 0
**SLOTS_ACTIVE** | Erlaubt die Nutzung des Spiels "Slots" | 0
**MULTIPLY_SLOTS_THREE_OF_A_KIND** | Multiplikator bei Gewinn "Three of a kind" | 3
**MULTIPLY_SLOTS_TWO_OF_A_KIND** | Multiplikator bei Gewinn "Two of a kind" | 2
**MULTIPLY_SLOTS_SPECIAL** | Multiplikator für Gewinn "Special" | 5
**POINTS_PER_RAID** | Legt fest, wieviele Punkte der Raidanführer erhält | 1000
**POINTS_PER_RAIDER** | Legt fest, wieviele Punkte der Raidanführer für jeden mitgebrachten User erhält | 50
**POINTS_PER_SUB** | Legt die Anzahl an Punkten fest, die der User für einen Sub erhält | 1000
**POINTS_PER_RESUB** | Legt die Anzahl an Punkten fest, die der User für einen Resub erhält | 1000
**POINTS_PER_SUBGIFT** | Legt die Anzahl an Punkten fest, die der User für einen verschenkten Sub erhält | 1000
**TICKET_ACTIVE** | Erlaubt die Nutzung des Ticket-Systems (für Auslosungen) | 0

## Mod & Broadcaster Commands

### &star; GIVEPOINTS / SETPOINTS
GIVEPOINTS erlaubt es einem User eine bestimmte Anzahl an Punkte zu geben (ohne Belastung des eigenen Punktekontos). SETPOINTS setzt die Punkte des Users auf den übergebenen Wert unabhängig von seinen bisherigen Punkten.

VERWENDUNG         | BEISPIEL                              | ERGEBNIS |
-------------------|---------------------------------------|----------|
```?givepoints PUNKTE USERNAME```  | ```?givepoints 100 @StreamElements``` | [13:37] w8abot: Es wurden 100 Punkte dem Punktestand von @streamelements hinzugefügt. Damit hat @streamelements nun 100 Punkte.
```?setpoints PUNKTE USERNAME```  | ```?setpoints 500 @StreamElements```  | [13:37] w8abot: @w8abit_de hat die Punkte von @streamelements auf 500 geändert.

### &star; UPDATEPARAM
Ermöglicht das Aktualisieren eines Parameters (siehe Beschreibung #Parameterdokumentation).

VERWENDUNG         | BEISPIEL                             | ERGEBNIS |
-------------------|--------------------------------------|----------|
```?updateparam PARAMETERNAME PARAMETERWERT```  | ```?updateparam SLOTS_ACTIVE 0```    | [13:37] w8abot: Parameter erfolgreich aktualisiert

### &star; IN ARBEIT: EVENTS (ADD, START, CLOSE, DELETE)
Hier wird es die Möglichkeit für ein Ticketsystem geben. Es muss zunächst ein Event angelegt werden worin bestimmt wird, welche Vorrasussetzungen gelten. 
