# Produkt

<!-- impeccable:product-schema 1 -->

## Plattform

Web. Mobilførst (390 px), men skal også fungere fint på desktop.

## Teknologi

Vite, React, TypeScript, Tailwind og React Router. Ingen backend. Demodata ligger som JSON, og tilstanden lagres i localStorage.

## Brukere

- **Mottaker** er en privatperson med et praktisk problem hjemme, som en lekkasje, maling, møbelmontering, hagearbeid eller en liten reparasjon. Hen har ikke kunnskapen eller tiden selv, synes det er vanskelig å finne hjelp og er redd for å velge feil eller betale for mye. Det hen egentlig vil, er å få problemet løst og føle seg trygg på valget.
- **Aktør** er en altmuligmann eller håndverker i nærområdet, enten selvstendig eller i en liten bedrift. Aktøren vil ha betalte jobber i nærheten, bli kjent som pålitelig, ha litt fleksibilitet og slippe rot i rutinene. Det viktigste er å være sikker på å få betalt.

Personene i demoen er oppdiktede: aktørene Kai Fredriksen og Ingrid Solberg, og mottakerne Emma Haugen og Thomas Bakke.

## Formål

Altmuligmannen skal gjøre det enkelt å få praktisk hjelp ved å koble mottakere med aktører i nærheten. Dette er en klikkbar prototype laget i et studentprosjekt, til investorpresentasjon og UX-dokumentasjon. Den er ikke et produksjonssystem.

## Posisjonering

Tryggheten ligger i måten appen virker på. Pengene reserveres når mottakeren sender forespørselen, aktøren ser «Betaling reservert» før hen takker ja, og pengene frigis først når mottakeren har godkjent jobben. Matchingen forklarer også hvorfor en aktør passer.

## Bruk i demoen

Prototypen vises live, og man bytter rolle med demoknappen i toppmenyen. «Nullstill demo» setter alt tilbake. Hele flyten fra behov til vurdering er beskrevet i [DOKUMENTASJON.md](DOKUMENTASJON.md).

## Muligheter og begrensninger

- All tekst i appen er på norsk bokmål.
- Ingen ekte innlogging, ingen ekte API-kall og ingen hemmeligheter. Kartet er en illustrasjon.
- Ingen ekte personer, telefonnumre eller adresser. Avatarene er initialer i fargede sirkler.
- Pengene reserveres når forespørselen sendes (avgjort).

## Merkevare

Navnet er Altmuligmannen. Det skal føles ryddig og pålitelig, og trygghet er den viktigste følelsen. Vi bruker én rolig hovedfarge, god kontrast og tydelige knapper.

Appikonet (en kremfarget figur med kappe og en gull hammer på en blå, avrundet firkant) og ordmerket «Altmuligmannen» er levert av oss og skal brukes som de er. Fargene er hentet fra ikonet: blå #17334C, krem #FBF6E8 og gul #FDAF1C. Filene ligger i `public/brand/` (favicon og touch-ikon) og `src/assets/` (ikon og ordmerke i lys og mørk versjon).

## Dokumentasjon og bevis

Ingen. Aktører, vurderinger og jobber er laget til demoen og skal aldri fremstilles som ekte kunder eller statistikk.

## Produktprinsipper

1. Trygghet vises i stedet for å bare påstås. Betalingsstatus og kontraktstatus skal alltid synes der man tar en avgjørelse.
2. Hver anbefaling skal ha en begrunnelse.
3. Vanlig språk for folk som ikke er fagfolk. Fagord skal forklares.
4. Begge sidene er like viktige. Aktørens behov for sikker betaling teller like mye som mottakerens behov for trygghet.

## Tilgjengelighet og inkludering

Semantisk HTML, ledetekst på alle skjemafelt, synlig fokus og kontrast på WCAG AA-nivå. Mottakere kan være eldre og lite teknisk vante.