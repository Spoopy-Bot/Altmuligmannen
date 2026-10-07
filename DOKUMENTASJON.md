# Altmuligmannen: dokumentasjon

Dette dokumentet forklarer ideen bak appen og hva prototypen kan. Hvordan du kjører den står i [README.md](README.md). Designet er beskrevet i [DESIGN.md](DESIGN.md) og bakgrunnen for produktet i [PRODUCT.md](PRODUCT.md).

Prototypen er laget med god hjelp fra AI-verktøyet Claude Code, slik at vi fikk noe å vise raskt og kunne bruke tiden på selve prosjektet.

---

## Ideen

Appen har to roller:

- **Mottaker** er en privatperson som trenger hjelp, for eksempel med en lekkasje, maling eller å sette sammen møbler. Hen vil løse problemet og føle seg trygg på hvem hen slipper inn i huset.
- **Aktør** er en altmuligmann eller håndverker som vil ha betalte oppdrag, bygge omdømme og være sikker på å få pengene sine.

Det viktigste i hele appen er betalingssikkerheten. Når mottakeren sender inn oppdraget, blir beløpet reservert. Aktøren ser at pengene allerede er satt av før hen sier ja, og de blir først utbetalt når mottakeren har godkjent jobben. Da slipper mottakeren å betale for noe som ikke er gjort, og aktøren slipper å jage etter betaling.

Personene i demoen er oppdiktede. Det er 13 aktører og 6 mottakere, og stedene er ekte tettsteder i Østfold.

---

## Hva appen kan

**Som mottaker kan du:**
- beskrive problemet i et guidet skjema med seks steg (kategori, beskrivelse og bilder, hvor fort det haster, sted, budsjett og oppsummering)
- få forslag til tre aktører som passer, med en kort begrunnelse for hver
- bla i alle aktører i en liste eller på et kart, og filtrere på kategori, avstand, vurdering og pris
- se profilen til en aktør med bio, erfaring, vurderinger og tidligere jobber
- følge oppdragene dine, chatte med aktøren, godkjenne jobben og gi vurdering

**Som aktør kan du:**
- få en liste med jobber som passer profilen din
- se at betalingen er reservert før du takker ja
- holde oversikt over jobbene dine (nye, pågående og ferdige), avtaler og utbetalinger
- se kontrakten for hver jobb
- redigere profilen din og se vurderingene du har fått
- chatte og få varsler

---

## Slik går en jobb gjennom appen

1. Mottakeren beskriver problemet, og beløpet blir reservert.
2. Mottakeren får tre forslag og sender en forespørsel til en av dem.
3. Aktøren får varsel, åpner oppdraget og ser «Betaling reservert».
4. Aktøren trykker «Takk ja». Da blir kontrakten laget og chatten åpnet.
5. Aktøren starter jobben og melder den ferdig når den er gjort.
6. Mottakeren godkjenner, og betalingen frigis.
7. Begge gir hverandre stjerner og en kommentar.

Hvis aktøren sier nei, blir oppdraget åpent igjen, aktøren utelukkes og pengene står fortsatt reservert.

For å prøve begge sider i demoen finnes en «Vis som»-lenke på oppdragssiden som hopper til den andre parten i samme sak.

---

## Litt om hvordan det henger sammen

Matchingen er enkel og kan forklares. Aktøren må jobbe med riktig kategori. Så gir vi poeng for ferdigheter, erfaring, vurderinger, avstand, om prisen passer budsjettet og om aktøren har ledig tid, og viser de tre med høyest poengsum. Er prisen over budsjettet, sier vi det rett ut i stedet for å skjule det. Samme tankegang brukes den andre veien for å sortere jobber til aktøren.

Varslene lages automatisk når noe skjer, for eksempel ny forespørsel, at noen takker ja, at en jobb er ferdig eller at en betaling er frigitt. Chatten svarer automatisk etter et par sekunder, så den føles levende i demoen.

Designet bygger på fargene fra appikonet: mørk blå, en gul farge som bare brukes på penger som er holdt tilbake og den ene viktigste handlingen på en side, og en lys kremfarge i bakgrunnen. Betalingen vises med et lite segl som er gult når pengene er reservert og blått med hake når de er frigitt.

Teknisk er det en React-app med TypeScript og Tailwind, bygget med Vite. Vi har lagt vekt på at den skal være brukbar for alle, med riktige skjemafelt, synlig fokus og støtte for de som har slått av animasjoner.

---

## Begrensninger

- Det finnes ingen backend, ingen ekte innlogging, betaling, e-post eller push-varsler.
- All data er fiktiv og blir bare lagret i den enkelte nettleseren.
- Kartet er en tegnet illustrasjon, ikke ekte kartdata.
- Bildeopplasting er bare en etterligning.
- Chat-svarene er automatiske.
- Pengene reserveres allerede når mottakeren sender inn skjemaet, ikke først når forespørselen går til en bestemt aktør. Det gjør at åpne jobber også viser «Betaling reservert» hos aktørene. Det er et valg vi ikke har landet endelig på.

## Hva som kunne kommet videre

- Ekte backend med innlogging og en betalingsleverandør som støtter escrow
- Reservere pengene først når forespørselen sendes til én aktør
- Ekte kart og søk på område
- Push- og e-postvarsler
- Hva som skjer når mottakeren ikke vil godkjenne jobben
- Brukertesting av hele flyten og eksport til Figma