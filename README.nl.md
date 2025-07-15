# Novy InTouch

Bestuur je Novy InTouch afzuigkap met Homey.

**🇬🇧 [English version](README.md)**

## Functies

- Bestuur afzuigkap ventilatorsnelheid (0-4 niveaus)
- Bestuur afzuigkap verlichting
- Ontvang feedback van afzuigkap afstandsbediening
- Ondersteuning voor naloopstand
- Flow kaarten voor automatisering

## Ondersteunde Apparaten

- Novy InTouch afzuigkap met 433MHz afstandsbediening

## Installatie

Installeer deze app vanuit de Homey Community Store of installeer handmatig door de app naar je Homey te uploaden.

## Koppelen

1. Ga naar Apparaten → Apparaat Toevoegen
2. Selecteer Novy InTouch
3. Selecteer het Novy InTouch afzuigkap apparaat
4. Volg de koppel instructies om je afstandsbediening te koppelen

## Gebruik

Na het koppelen kun je je afzuigkap besturen via:
- De Homey mobiele app
- Spraakopdrachten (indien ondersteund)
- Flows

## Instellingen

### Algemene Instellingen
- **Aan/uit actie**: Kies wat er gebeurt wanneer je de aan/uit knop indrukt
  - Afzuiging & Lampen: Bestuurt zowel afzuiging als lampen
  - Alleen lampen: Bestuurt alleen de lampen
  - Alleen afzuiging: Bestuurt alleen de afzuiging
- **Uitschakelen met naloopstand**: Wanneer ingeschakeld, zal de afzuiging 10 minuten draaien voordat deze uitschakelt

### Huidige Status
- **Lampen aan**: Geeft aan of de lampen momenteel aan zijn
- **Huidige afzuigkap snelheid**: Toont het huidige snelheidsniveau (0-4)

## Flow Kaarten

### Triggers
- **Commando ontvangen**: Geactiveerd wanneer een commando wordt ontvangen van de afstandsbediening

### Acties
- **Stuur commando naar de afzuigkap**: Stuur verschillende commando's naar de afzuigkap

## Changelog

### v3.0.0 [2025-07-13]
- **Grote update**: Volledige migratie naar Homey SDK v3
- Bijgewerkt naar moderne JavaScript async/await patronen
- homey-rfdriver geüpgraded naar v3.3.2
- Verbeterde app manifest structuur en validatie
- Verbeterde flow kaarten met juiste titleFormatted ondersteuning
- Gemoderniseerde apparaat capability afhandeling
- Schone code architectuur volgens SDK v3 best practices
- Verouderde SDK v2 functies verwijderd
- Volledige compatibiliteit met Homey v5.0.0+

### Eerdere versies (SDK v2)
- **V2.0.3** [2019-02-03]: Snelheidsniveau BUG opgelost
- **V2.0.2** [2018-09-05]: App store crash opgelost
- **V2.0.1** [2018-09-04]: Bug fixes
- **V2.0.0** [2018-08-26]: Eerste release

## Ondersteuning

Voor ondersteuning, bezoek de [GitHub repository](https://github.com/TheLostHomeyAppRepositories/nl.novy.intouch).

## Licentie

Dit project is gelicenseerd onder de ISC Licentie.

### Instellingen
De app stelt je in staat om de volgende apparaat instellingen te besturen:
- `Aan/uit` actie: `afzuiging & lamp` | `alleen lamp` | `alleen afzuiging`
- `Naloopstand`: `ingeschakeld`/`uitgeschakeld`
- `Lamp` status: `aan/uit` (*zie uitleg hieronder*)
- `Snelheidsniveau`: Huidig motorsnelheidsniveau (*zie uitleg hieronder*)

### Flow ondersteuning

*Commando's*

- Apparaat: `aan`, `uit`, `omschakelen` & `uit met naloopstand` (10 min.)
- Lamp: `aan`, `uit` & `omschakelen` 
- Motorsnelheid: `verhogen`, `verlagen`, `uit`, `niveau 1`, `niveau 2`, `niveau 3`, `POWER niveau`

*Triggers*  
Er zijn triggers gedefinieerd voor alle bovenstaande commando's

*Condities*  
Nog geen condities gedefinieerd (*binnenkort beschikbaar...*)

*Acties*  
Er zijn acties gedefinieerd voor alle bovenstaande commando's

### Interne status
**Belangrijk:** Novy Intouch specificeert geen aparte signalen voor `aan` en `uit` acties (alleen een `omschakelen` signaal is beschikbaar).
Daarom moet Homey een interne `status` bijhouden voor `aan/uit`, `lamp` & `motorsnelheidsniveau`. Deze interne `status` wordt gebruikt om aparte commando's te kunnen sturen voor `aan`, `uit` & `snelheidsniveau`.  

De interne `status` wordt *bijgewerkt* bij:
1. Knoppen indrukken op de Novy Intouch afstandsbediening (Homey ontvangt een *signaal*).
2. Triggers vanuit de app (*Mobiele kaart*)
3. Flow triggers & acties
4. Handmatige overschrijving via Instellingen

De interne `status` wordt **NIET** bijgewerkt wanneer:
1. Knoppen indrukken op het apparaat (d.w.z. afzuigkap)
2. Afstandsbediening signaal wordt niet gedetecteerd
3. Apparaat veiligheidsmaatregelen (bijv. oververhitting)
4. Time-outs (voorlopig...*nog te implementeren*)
5. Andere onbekende redenen...

### TODO
- Ondersteuning voor aanvullende signalen
- Maak standalone lamp apparaat
- Flow condities
- Houd `Auto-Stop` timeout bij (veiligheidsmaatregel, afzuiging (niet lamp) wordt uitgezet na 3 uur inactiviteit)
- Houd `POWER niveau` timeout bij => verminderd naar snelheidsniveau 3 na 6 minuten
- Instelling om `naloopstand` timeout te overschrijven (< 10 minuten)
- Instelling om `auto-stop` timeout te overschrijven (< 3 uur)
- Instelling om `power` timeout te overschrijven (<6 minuten)
- Afhandelen van `lamp` dimmen (continue indrukken)
- Maak apart apparaat voor de Intouch Afstandsbediening
