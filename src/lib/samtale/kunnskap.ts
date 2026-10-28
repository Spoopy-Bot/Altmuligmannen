import type { KategoriId, Oppdrag } from '../../types'

/** Fagkunnskap per kategori, skrevet i aktørens stemme (og noen fakta fra mottakerens side). */
export interface Fag {
  materialer: string
  forberede: string
  /** Praktisk: tørketid, støy, vann av osv. */
  praktisk: string
  /** Kan du gjøre det selv? */
  selv: string
  sporsmal: string[]
  /** Mottakerens svar på «hvor er …?» */
  hvor: string
  /** Mottakerens svar på «har du …?» */
  harSelv: string
  /** Diagnose ut fra beskrivelsen: [mønster, forklaring]. Første treff vinner. */
  diagnoser: [RegExp, string][]
  standardDiagnose: string
  /** Er været avgjørende? */
  vaer?: string
}

export const FAG: Record<KategoriId, Fag> = {
  ror: {
    materialer: 'Jeg tar med pakninger, koblinger og vanlige reservedeler. Skal en kran eller et blandebatteri byttes, må du ha kjøpt det på forhånd.',
    forberede: 'Tøm skapet under vasken så jeg kommer til, og legg frem et håndkle eller to.',
    praktisk: 'Vannet må være av i omtrent en time mens jeg jobber.',
    selv: 'En pakning kan du bytte selv hvis du stenger vannet først. Lekker det fra rør i veggen, bør en fagperson se på det, ellers kan det bli vannskade forsikringen ikke dekker.',
    sporsmal: [
      'Hvor mye drypper det, og har det blitt verre siden du la inn oppdraget?',
      'Vet du hvor stoppekranen sitter?',
      'Er røret av kobber, plast eller en flettet slange? Et bilde hjelper meg å ta med riktig del.',
    ],
    hvor: 'Stoppekranen sitter i skapet under vasken, bak rørene.',
    harSelv: 'Jeg har ikke reservedeler selv, så ta gjerne med det du trenger.',
    diagnoser: [
      [/under (vasken|servanten)|vannlås|skapet .* vått/, 'Drypp under vasken kommer oftest fra vannlåsen eller en løs kobling. Det er vanligvis en rask jobb.'],
      [/kran|blandebatteri|tut/, 'Drypper det fra tuten, er det nesten alltid en slitt patron eller pakning.'],
      [/avløp|tett|sluk|renner sakte/, 'Tette avløp skyldes oftest hår og såperester i vannlåsen. Unngå kjemiske avløpsåpnere, de kan skade rørene.'],
      [/toalett|do|wc|sisterne/, 'Renner toalettet hele tiden, er det oftest flottøren eller pakningen i sisternen.'],
    ],
    standardDiagnose: 'Det høres ut som en lekkasje ved en kobling. Jeg finner kilden først, så sier jeg hva det blir.',
  },
  el: {
    materialer: 'Jeg tar med skrutrekkere, spenningsprøver og noen ekstra dekkplater. Lamper og andre ting som skal henges opp må du ha kjøpt selv.',
    forberede: 'Legg frem lampene og sørg for at jeg kommer til stikkontakten eller takkroken.',
    praktisk: 'Jeg tar bare det som kobles med støpsel eller kroneklemme, så strømmen trenger sjelden å være av.',
    selv: 'Dekkplater, støpsler og lamper med ledning kan du lovlig bytte selv. Alt som er koblet fast i veggen krever registrert elektroforetak.',
    sporsmal: [
      'Henger lampen i en takkrok, eller er den koblet rett i taket?',
      'Har lampen støpsel, eller må den kobles til faste ledninger?',
      'Hvor mange lamper eller dekkplater gjelder det?',
    ],
    hvor: 'Lampene ligger i gangen, ved siden av stigen.',
    harSelv: 'Ja, lampene er kjøpt og ligger klare.',
    diagnoser: [
      [/dekkplate|deksel|brytere?/, 'Å bytte dekkplate er en enkel jobb. Selve bryteren eller stikkontakten i veggen rører jeg ikke.'],
      [/takkrok|krok|støpsel|stikkontakt/, 'Lamper i takkrok med støpsel er greit å henge opp selv, og det tar sjelden lang tid.'],
      [/fast|skjult|i veggen|sikring|varmekabel/, 'Det er arbeid på fast installasjon, og det må en registrert elektroforetak ta.'],
    ],
    standardDiagnose: 'Det høres ut som en enkel jobb med støpsel eller dekkplate. Jeg ser på det når jeg kommer.',
  },
  maling: {
    materialer: 'Jeg tar med pensler, ruller, teip, dekkplast og sparkel. Malingen kjøper du selv, ellers sier jeg fra hva den koster.',
    forberede: 'Tøm rommet for småting og dra større møbler til midten. Jeg dekker til resten.',
    praktisk: 'Malingen tørker på 2–4 timer mellom strøkene. Lukten er borte etter et døgn med god lufting.',
    selv: 'Du kan gjerne sparkle små hull selv, men et jevnt resultat i to strøk er der jeg gjør mest forskjell.',
    sporsmal: [
      'Er det fuktskader eller sprekker som må utbedres før jeg maler?',
      'Er det vegg- eller takmaling du har kjøpt, og hvilken glansgrad?',
      'Hvor høyt er det under taket?',
    ],
    hvor: 'Malingen står i boden, ved siden av stigen.',
    harSelv: 'Ja, malingen er kjøpt og står i boden.',
    diagnoser: [
      [/gjerde|utvendig|kledning|terrasse/, 'Ute må treverket skrapes, vaskes og være helt tørt før det males. Da holder det mange år.'],
      [/sparkl|hull|sprekk/, 'Hull sparkles, slipes og flekkmales før to strøk. Da blir flaten helt jevn.'],
      [/tak/, 'Taket tar jeg først, så slipper vi søl på ferdigmalte vegger.'],
    ],
    standardDiagnose: 'To strøk gir best og mest holdbart resultat.',
    vaer: 'Utendørs må det være tørt i minst ett døgn. Blir det regn, flytter vi en dag.',
  },
  montering: {
    materialer: 'Jeg har verktøy, vater og festemidler til gips og mur. Du trenger bare pakkene og bruksanvisningen.',
    forberede: 'La pakkene stå i rommet der det skal monteres, og sjekk at ingenting mangler.',
    praktisk: 'Det blir litt boring, men lite støv. Emballasjen tar jeg med meg.',
    selv: 'Enkle møbler klarer de fleste selv. Høye skap og ting på vegg vil jeg anbefale at noen med riktig festemiddel tar.',
    sporsmal: ['Er det gips, mur eller bindingsverk bak veggen?', 'Har du sjekket at alle delene ligger i pakkene?', 'Skal noe festes i veggen, eller står det fritt?'],
    hvor: 'Pakkene står i stua, med bruksanvisningene oppå.',
    harSelv: 'Ja, jeg har alle pakkene og bruksanvisningene.',
    diagnoser: [
      [/mur/, 'Murvegg krever slagbor og riktige plugger. Det har jeg med.'],
      [/garderobe|skap|høy/, 'Høye skap skal alltid festes til veggen med vippesikring. Det er inkludert.'],
      [/tv/, 'TV på vegg krever et feste som tåler vekten, og at vi finner stender eller bruker riktige plugger.'],
      [/hylle/, 'Hyller på vegg må festes i stender eller med plugger som passer veggen.'],
    ],
    standardDiagnose: 'Jeg følger monteringsanvisningen og fester alt som kan velte.',
  },
  hage: {
    materialer: 'Jeg har hekksaks, grensaks og rake. Hageavfallet kan enten kjøres bort eller legges i en haug, du bestemmer.',
    forberede: 'Flytt hagemøbler og ting som står i veien, og si fra hvis noe ikke skal klippes.',
    praktisk: 'Hekksaksen bråker litt, men jeg holder meg til vanlige tider.',
    selv: 'Løv kan du fint rake selv. Hekk og beskjæring er det lett å gjøre for hardt, så der hjelper jeg gjerne.',
    sporsmal: ['Omtrent hvor lang og hvor høy er hekken?', 'Skal avfallet kjøres bort, eller kan det ligge i en haug?', 'Er det planter jeg må ta hensyn til?'],
    hvor: 'Rake og hageposer står i garasjen.',
    harSelv: 'Jeg har hageposer, men ikke henger til bortkjøring.',
    diagnoser: [
      [/tuja|thuja|hekk/, 'Tuja tåler ikke å klippes inn i gammelt ved, så jeg klipper bare i det grønne.'],
      [/epletre|beskjær|frukttre/, 'Frukttrær beskjæres best på senvinteren, men døde greiner kan jeg fjerne nå.'],
      [/løv|storm/, 'Løv bør rakes før frosten, ellers kveler det plenen.'],
    ],
    standardDiagnose: 'Jeg rydder og klipper, og tar med meg det du ikke vil ha liggende.',
    vaer: 'Hagearbeid går fint i litt regn, men ikke i storm. Da avtaler vi en ny dag.',
  },
  reparasjon: {
    materialer: 'Jeg tar med lister, hengsler, fugemasse og vanlige festemidler. Spesialdeler må vi avtale først.',
    forberede: 'Frigjør området rundt det som skal repareres, så kommer jeg til.',
    praktisk: 'Det blir litt støv der jeg sager, men jeg dekker til og støvsuger etterpå.',
    selv: 'Små justeringer kan du prøve selv med en skrutrekker, men lister og fuger blir fort synlig skjeve.',
    sporsmal: ['Kan du legge ved et bilde av det som er skadet?', 'Hvor lenge har det vært sånn?', 'Er det flere steder enn det du har beskrevet?'],
    hvor: 'Jeg har ikke noe utstyr selv, så ta med det du trenger. Jeg viser deg hvor det gjelder når du kommer.',
    harSelv: 'Nei, jeg har ikke kjøpt noe. Ta gjerne med det som trengs.',
    diagnoser: [
      [/subber|dør|hengsel|håndtak/, 'Dører som subber skyldes oftest løse hengsler eller at huset har satt seg. Det løses vanligvis med justering.'],
      [/trekk|tetning|kald luft|vindu/, 'Trekk kommer som regel av flate tetningslister. Nye lister gjør stor forskjell på strømregningen.'],
      [/lampe|lys/, 'Lamper med fast tilkobling må en elektriker koble til. Jeg kan henge opp og montere resten.'],
      [/fuge|silikon/, 'Gammel fuge må skjæres helt ut før ny legges, ellers slipper den.'],
    ],
    standardDiagnose: 'Jeg ser på det først og sier fra før jeg gjør noe som koster ekstra.',
  },
  flytting: {
    materialer: 'Jeg har bærestropper, tepper og transportsele. Du må bare sørge for at trapp og dører er frie.',
    forberede: 'Mål dørene og trappa, og tøm skuffer og hyller først, så blir det lettere å løfte.',
    praktisk: 'Vi beskytter vegger og dørkarmer med tepper.',
    selv: 'Lette ting kan du bære selv, men tunge møbler i trapp er der folk skader seg.',
    sporsmal: ['Er det heis, eller bare trapp?', 'Hvor tung er den tyngste tingen, omtrent?', 'Hvor langt er det å bære?'],
    hvor: 'Trappa er smal, så mål gjerne før du kommer.',
    harSelv: 'Nei, men jeg kan hjelpe til med det lette.',
    diagnoser: [[/trapp|piano|tung|heltre/, 'Tunge ting i smal trapp krever to personer. Jeg tar med en hjelper hvis det trengs.']],
    standardDiagnose: 'Vi planlegger veien ut før vi løfter noe.',
  },
  vask: {
    materialer: 'Jeg tar med alt av utstyr og vaskemidler.',
    forberede: 'Ta bort verdisaker og småting fra overflatene, så rekker jeg over mer.',
    praktisk: 'Jeg bruker svanemerkede vaskemidler, så det lukter lite.',
    selv: 'Vanlig vask klarer du selv, men vinduer ute og flyttevask sparer du mye tid på å sette bort.',
    sporsmal: ['Hvor mange rom eller m² er det?', 'Er det flekker eller overflater jeg må være ekstra forsiktig med?', 'Skal vinduene vaskes både inne og ute?'],
    hvor: 'Vaskemidlene står under vasken, og stigen i boden.',
    harSelv: 'Jeg har vanlige vaskemidler, men ta med det du trenger.',
    diagnoser: [
      [/salg|fotograf|visning/, 'Før fotografering er vinduer og speil det som synes mest, så de tar jeg grundigst.'],
      [/flyttevask/, 'Flyttevask følger en sjekkliste, så det blir godkjent ved overtakelse.'],
    ],
    standardDiagnose: 'Jeg følger en fast rekkefølge, ovenfra og ned.',
    vaer: 'Vinduer ute vasker jeg ikke i sterk sol eller regn. Da blir det striper.',
  },
}

export function diagnose(o: Oppdrag): string {
  const tekst = `${o.tittel} ${o.beskrivelse}`.toLowerCase()
  const fag = FAG[o.kategori]
  return fag.diagnoser.find(([re]) => re.test(tekst))?.[1] ?? fag.standardDiagnose
}
