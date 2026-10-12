import { kategori } from '../../data/kategorier'
import { stedNavn } from '../../data/steder'
import type { Aktor, Kontrakt, Melding, Mottaker, Oppdrag } from '../../types'
import { fornavn, km, kr } from '../format'
import { avstandKm } from '../geo'
import { foreslaTid, forskyv, lesTilgjengelighet, MOTTAKER_VINDU, passer, type Vindu } from './kalender'
import { diagnose, FAG, type Fag } from './kunnskap'
import { harSagt, lesMinne, type Minne } from './minne'
import { fyll, stilFor, type Stil } from './persona'
import { erEngelsk, finnDag, finnTid, hash, klokke, naar, normaliser, ord, pick, stor, type Tid } from './tekst'

/**
 * Lokal samtalemodell som lar de fiktive personene svare nesten som en KI.
 *
 * 1. Teksten normaliseres (dialekt, slang, skrivefeil).
 * 2. Alle intensjoner i meldingen finnes og besvares i den rekkefølgen de ble skrevet.
 * 3. Svarene bygger på ekte data: oppdrag, kontrakt, aktørens tilgjengelighet, pris,
 *    erfaring og avstand, pluss det som allerede er avtalt i tråden (minne).
 * 4. Hver person har sin egen stemme, og lange svar deles i flere meldinger.
 *
 * Alt er deterministisk og kjører lokalt. Ingen nettverk.
 */

export interface SamtaleKontekst {
  oppdrag: Oppdrag
  kontrakt?: Kontrakt
  aktor: Aktor
  mottaker: Mottaker
  /** Er det aktøren som svarer (og mottakeren som skriver)? */
  svarerErAktor: boolean
  /** Tråden før de nye meldingene. */
  historikk: Melding[]
  /** Ubesvarte meldinger fra brukeren, slått sammen. */
  tekst: string
  na?: Date
}

export interface Boble {
  tekst: string
  ventMs: number
}

interface Ctx {
  o: Oppdrag
  kontrakt?: Kontrakt
  aktor: Aktor
  mottaker: Mottaker
  svarer: Aktor | Mottaker
  motpart: Aktor | Mottaker
  erAktor: boolean
  t: string
  na: Date
  seed: number
  dag?: { dag: number; navn: string }
  tid?: Tid
  vindu: Vindu
  aktorVindu: Vindu
  fag: Fag
  stil: Stil
  minne: Minne
  /** Settes når et tidspunkt ble bekreftet i dette svaret. */
  bekreftet?: boolean
}

type Handler = (c: Ctx) => string | undefined

interface Intensjon {
  id: string
  re?: RegExp
  finn?: (c: Ctx) => number | undefined
  unntar?: string[]
  aktor?: Handler
  mottaker?: Handler
}

// ───────── Hjelpere ─────────

const pris = (c: Ctx) => c.kontrakt?.pris ?? c.o.betaling.belop
const timer = (c: Ctx) => kategori(c.o.kategori).typiskeTimer
const estimat = (c: Ctx) => Math.round((c.aktor.timepris * timer(c)) / 50) * 50
const tilg = (c: Ctx) => c.aktor.tilgjengelighet.toLowerCase()
const avtaleNar = (c: Ctx) => (c.minne.avtale ? naar(c.minne.avtale.dagNavn, c.minne.avtale.tid) : undefined)
const forslag = (c: Ctx, onsket?: Parameters<typeof foreslaTid>[2]) => {
  const f = foreslaTid(c.aktorVindu, c.na, onsket)
  return naar(f.navn, f.tid)
}
const liten = (s: string) => s.charAt(0).toLowerCase() + s.slice(1)

function bekreft(c: Ctx, nar: string): string {
  c.bekreftet = true
  return fyll(pick(c.stil.bekreft, c.seed), { nar, navn: fornavn(c.motpart.navn) })
}

/** Svar på et konkret tidspunkt, sett fra den som svarer. */
function svarPaTid(c: Ctx): string | undefined {
  const { dag, tid } = c
  if (!dag && !tid) return

  if (!c.erAktor) {
    const nar = dag ? naar(dag.navn, tid) : klokke(tid!)
    if (tid && (tid.h < 8 || tid.h >= 21)) {
      return `${stor(nar)} blir litt ${tid.h < 8 ? 'tidlig' : 'sent'} for meg. Går det an å ta det ${tid.h < 8 ? 'kl. 9' : 'kl. 18'}?`
    }
    return bekreft(c, nar)
  }

  const iDagPassert = dag && dag.dag === c.na.getDay() && dag.navn === 'i dag' && tid && tid.h <= c.na.getHours()
  if (dag && tid) {
    if (!iDagPassert && passer(c.aktorVindu, dag.dag, tid)) return bekreft(c, naar(dag.navn, tid))
    return `${stor(naar(dag.navn, tid))} går dessverre ikke, jeg er tilgjengelig ${tilg(c)}. Passer ${forslag(c, { dag: dag.dag, tid })} i stedet?`
  }
  if (dag) {
    if (!c.aktorVindu(dag.dag)) {
      return `${stor(dag.navn)} har jeg dessverre ikke ledig, jeg jobber ${tilg(c)}. Passer ${forslag(c, { dag: dag.dag })}?`
    }
    const f = foreslaTid(c.aktorVindu, c.na, { dag: dag.dag })
    if (f.dag !== dag.dag) return `${stor(dag.navn)} er dessverre fullt. Passer ${naar(f.navn, f.tid)}?`
    return `${stor(dag.navn)} passer. Er ${klokke(f.tid)} greit?`
  }
  // Bare klokkeslett: knytt det til dagen vi allerede har snakket om.
  const a = c.minne.avtale
  if (a) {
    if (passer(c.aktorVindu, a.dag, tid!)) return bekreft(c, naar(a.dagNavn, tid))
    return `${stor(klokke(tid!))} på ${a.dagNavn} rekker jeg dessverre ikke. Passer ${forslag(c, { dag: a.dag, tid })}?`
  }
  const noenDag = [1, 2, 3, 4, 5, 6].some((d) => passer(c.aktorVindu, d, tid!))
  if (!noenDag) return `${stor(klokke(tid!))} er utenfor arbeidstiden min, jeg jobber ${tilg(c)}. Passer ${forslag(c)}?`
  return `${stor(klokke(tid!))} går fint. Hvilken dag passer best for deg?`
}

// ───────── Intensjoner ─────────

const JA = /^(ja|jepp|japp|ok|fint|supert|perfekt|deal|kjør|det passer|passer (fint|bra)|går (fint|bra)|høres bra ut|avtale)/

const INTENSJONER: Intensjon[] = [
  {
    id: 'avlys',
    re: /avlys|avbestill|kanseller|trenger ikke (hjelp|deg|det) likevel|droppe (det|jobben)/,
    unntar: ['tid', 'utsett'],
    aktor: () =>
      'Helt greit, takk for at du sier fra. Beløpet er bare reservert og ikke utbetalt, så du betaler ikke for noe som ikke er gjort.',
    mottaker: () => 'Så synd, men takk for at du sier fra tidlig.',
  },
  {
    id: 'utsett',
    re: /utsett|flytte (det|avtalen|timen|jobben|besøket)|passer ikke likevel|kan ikke (komme|likevel|den dagen|da)|må (dessverre )?flytte|blitt syk|er syk|noe kom i veien/,
    unntar: ['tid', 'forsinket'],
    aktor: (c) => {
      if ((c.dag || c.tid) && c.dag && c.tid && passer(c.aktorVindu, c.dag.dag, c.tid)) {
        c.bekreftet = true
        return `Ingen problem, vi flytter til ${naar(c.dag.navn, c.tid)}.`
      }
      const nesteUke = c.t.includes('neste uke')
      return `Det går fint, takk for at du sier fra. Pengene ligger trygt reservert i mellomtiden. Passer ${forslag(c, { dag: c.dag?.dag, tid: c.tid, nesteUke })} i stedet?`
    },
    mottaker: (c) =>
      c.dag || c.tid
        ? `Helt greit, takk for beskjed. ${stor(svarPaTid(c) ?? '')}`.trim()
        : 'Helt greit, takk for beskjed. Foreslå et nytt tidspunkt, så sier jeg om det passer.',
  },
  {
    id: 'forsinket',
    re: /forsinket|blir (litt |noen min(utter)? )?sen|kommer (litt )?senere|\d+ min(utter)? (sen|forsinket|senere)|står i kø|kø på/,
    unntar: ['tid', 'utsett', 'flytteLitt'],
    aktor: () => 'Ingen stress. Jeg tar en liten ting i mellomtiden, si fra når du er hjemme.',
    mottaker: () => 'Helt greit, jeg er hjemme uansett. Kjør forsiktig!',
  },
  {
    id: 'akutt',
    re: /blitt verre|verre nå|renner nå|flommer|oversvøm|vann (på|over) (hele )?gulvet|lekker mer|spruter|akutt|nødsituasjon|vannskade/,
    unntar: ['haster', 'tid', 'status'],
    aktor: (c) => {
      const ror = c.o.kategori === 'ror'
      const deler = [
        ror ? 'Steng vannet ved stoppekranen med en gang, så blir det ikke mer skade.' : '',
        `Jeg flytter deg først i køen. Tidligste jeg kan komme er ${forslag(c, { dag: c.na.getDay() })}.`,
        ror ? 'Ta bilder av skaden til forsikringen.' : '',
      ]
      return deler.filter(Boolean).join(' ')
    },
  },
  {
    id: 'naarKommer',
    re: /når kommer du|når er du her|når sees vi|hva (var|ble) avtalt|hva avtalte vi|når var det|hvilken dag (var det|kommer du)|står avtalen|gjelder avtalen|er vi fortsatt|husker du (når|tid)|når (skal|starter) (du|vi)|når passer det/,
    unntar: ['tid', 'status'],
    aktor: (c) => {
      const a = c.minne.avtale
      if (a?.bekreftet) return `Som avtalt kommer jeg ${naar(a.dagNavn, a.tid)}. Jeg gir beskjed her når jeg er på vei.`
      if (a) return `Vi har snakket om ${naar(a.dagNavn, a.tid)}, men ikke bekreftet. Skal vi si det?`
      return `Vi har ikke satt et tidspunkt ennå. Passer ${forslag(c)}?`
    },
    mottaker: (c) => {
      const a = c.minne.avtale
      if (a?.bekreftet) return `Vi sa ${naar(a.dagNavn, a.tid)}. Det står fortsatt.`
      if (a) return `Du nevnte ${naar(a.dagNavn, a.tid)}. Det passer meg fint.`
      return 'Vi har ikke avtalt noe ennå. Når passer det for deg?'
    },
  },
  {
    id: 'flytteLitt',
    re: /(komme|ta det|starte|begynne|møtes|være her) (litt |en time |en halvtime |noe )?(tidligere|senere|før|etter)(?![\s]*(kl|\d))/,
    unntar: ['tid'],
    aktor: (c) => {
      const a = c.minne.avtale
      if (!a?.tid) return `Det kan vi godt. Hva tenker du? Jeg er tilgjengelig ${tilg(c)}.`
      const retning = /tidligere|før/.test(c.t) ? -1 : 1
      const ny = forskyv(c.aktorVindu, a.dag, a.tid, retning)
      if (ny) {
        c.bekreftet = true
        return `Det går fint. Da sier vi ${naar(a.dagNavn, ny)} i stedet.`
      }
      return `Dessverre, ${klokke(a.tid)} er det ${retning < 0 ? 'tidligste' : 'seneste'} jeg rekker på ${a.dagNavn}.`
    },
    mottaker: () => 'Ja, det går fint. Jeg er hjemme.',
  },
  {
    id: 'bekreft',
    finn: (c) => {
      const a = c.minne.avtale
      return a && !a.bekreftet && a.fra === c.svarer.id && JA.test(c.t) && !c.dag && !c.tid ? 0 : undefined
    },
    aktor: (c) => bekreft(c, avtaleNar(c)!),
    mottaker: (c) => bekreft(c, avtaleNar(c)!),
  },
  {
    id: 'tid',
    finn: (c) => {
      const d = c.dag ? c.t.indexOf(c.dag.navn) : -1
      const t = finnTid(c.t)?.pos ?? -1
      const pos = [d, t].filter((p) => p >= 0)
      return pos.length ? Math.min(...pos) : undefined
    },
    aktor: svarPaTid,
    mottaker: svarPaTid,
  },
  {
    id: 'rabatt',
    re: /rabatt|billigere|for dyrt|litt dyrt|prisen ned|gå ned (i pris|på prisen)|prute|kutte (i )?pris|studentrabatt|pensjonistrabatt/,
    unntar: ['pris'],
    aktor: (c) =>
      `Jeg ligger nær timeprisen min på ${kr(c.aktor.timepris)}, så det er ikke mye å gå på. Kjøper du materialer selv, eller er fleksibel på dag, blir det litt rimeligere.`,
  },
  {
    id: 'prisforklaring',
    re: /hva (inngår|er inkludert|består)|inkludert|hvorfor (er det )?(så )?(dyrt|koster)|kjøring|timepris|hvordan (regner|beregner)/,
    unntar: ['pris'],
    aktor: (c) =>
      `Det er ${kr(c.aktor.timepris)} i timen for ca. ${timer(c)} timer. Kjøring, verktøy og rydding er inkludert, og materialer avtaler vi separat.`,
  },
  {
    id: 'svart',
    re: /kontant|vipps|svart|uten kvittering|under bordet|betale (deg )?direkte|utenom appen|faktura (direkte|utenom)/,
    unntar: ['pris', 'betaling'],
    aktor: () => 'Jeg tar bare betaling gjennom appen. Da er pengene trygge for oss begge, og du har kvittering og kontrakt hvis noe skulle skje.',
    mottaker: () => 'Jeg vil helst betale gjennom appen, da har vi begge kvittering og kontrakt.',
  },
  {
    id: 'pris',
    re: /koster?|pris|betale|dyrt|tilbud|faktura|regning|totalt|hva blir det|hvor mye/,
    aktor: (c) => {
      if (c.kontrakt) {
        return `Avtalt pris er ${kr(pris(c))}. Beløpet ligger reservert i appen og utbetales først når du godkjenner. Blir det noe ekstra, sier jeg fra før jeg gjør det.`
      }
      const e = estimat(c)
      const vurdering = e <= c.o.budsjett ? 'det holder godt' : 'det kan bli litt stramt'
      return `Jeg anslår ca. ${kr(e)} (${kr(c.aktor.timepris)} i timen, rundt ${timer(c)} timer). Du har satt av ${kr(c.o.budsjett)}, så ${vurdering}.`
    },
    mottaker: (c) => `Jeg har satt av ${kr(c.o.betaling.belop)}. Det er greit så lenge vi blir enige før noe legges til.`,
  },
  {
    id: 'betaling',
    re: /utbetal|frigi|escrow|reservert|trygg|sikker|pengene|når (får du|får jeg|betaler)|betalt/,
    aktor: () => 'Beløpet er reservert i appen. Jeg ser det før jeg starter, men får det først når du har godkjent jobben.',
    mottaker: () => 'Jeg godkjenner så fort jeg har sett over, da frigis pengene til deg.',
  },
  {
    id: 'telefon',
    re: /telefon|nummer|ring meg|sms|mobil|messenger|whatsapp|snap/,
    aktor: (c) => `La oss holde praten her i appen, så har vi alt samlet. ${c.aktor.svartid}.`,
    mottaker: () => 'Vi tar det gjerne her i appen, jeg følger med.',
  },
  {
    id: 'avstand',
    re: /hvor bor du|hvor holder du til|hvor kommer du fra|langt (å kjøre|unna|borte|hit)|avstand|kjøretid|adresse/,
    aktor: (c) =>
      /adresse/.test(c.t) && !/din/.test(c.t)
        ? 'Adressen ser jeg i oppdraget når jeg har takket ja, så den trenger du ikke sende her.'
        : `Jeg holder til på ${c.aktor.sted.omrade === 'Sentrum' ? c.aktor.sted.by : c.aktor.sted.omrade}, ca. ${km(avstandKm(c.aktor.sted, c.o.sted))} unna. Kjøring er inkludert.`,
    mottaker: (c) =>
      c.o.status === 'forespurt' ? 'Adressen ser du i oppdraget når du har takket ja.' : `Det er ${c.o.adresse}, ${stedNavn(c.o.sted)}.`,
  },
  {
    id: 'materialer',
    re: /materiale|må jeg (kjøpe|ha|skaffe)|ta med|verktøy|utstyr|reservedel|trenger du (noe|noen)|skal jeg kjøpe|har du (kjøpt|med|malingen|delene|pakkene)|har dere|deler/,
    aktor: (c) => c.fag.materialer,
    mottaker: (c) => c.fag.harSelv,
  },
  {
    id: 'forberede',
    re: /forbered|klargjør|tømme|rydde (før|unna)|hva må jeg (gjøre|ha klart)|må jeg gjøre noe|gjøre klart|før du kommer/,
    aktor: (c) => (harSagt(c.minne, c.fag.forberede) ? `Som jeg nevnte: ${liten(c.fag.forberede)}` : c.fag.forberede),
  },
  {
    id: 'tilgang',
    re: /nøkkel|ikke hjemme|må jeg være hjemme|skal jeg være hjemme|er du hjemme|komme inn|ringeklokke|på jobb (da|når)/,
    aktor: () => 'Du trenger ikke være hjemme hele tiden. Er du borte, kan du skrive her hvordan jeg kommer inn.',
    mottaker: () => 'Jeg er hjemme, så bare ring på.',
  },
  {
    id: 'parkering',
    re: ord('parkere|parkering|parkeringsplass|innkjørsel|innkjørselen'),
    aktor: () => 'Jeg finner parkering. Er det plass i innkjørselen, tar jeg gjerne den.',
    mottaker: () => 'Du kan parkere i innkjørselen.',
  },
  {
    id: 'varighet',
    finn: (c) => (/tørk/.test(c.t) ? undefined : /hvor lenge|hvor lang tid|tar det|hvor mange timer|rekker du|ferdig (til|innen|samme dag)|hele dagen/.exec(c.t)?.index),
    aktor: (c) => {
      const t = timer(c)
      const a = c.minne.avtale
      const slutt = a?.tid ? ` Starter jeg ${klokke(a.tid)}, er jeg ferdig rundt ${klokke({ h: a.tid.h + t, m: a.tid.m })}.` : ''
      return `Jeg regner med ${t}–${t + 1} timer.${slutt} Blir det mer, sier jeg fra før.`
    },
  },
  {
    id: 'praktisk',
    re: /tørk|lukt|støy|bråk|støv|vannet (av|stengt)|uten vann|søl|hjemmekontor|sove|barna/,
    aktor: (c) => c.fag.praktisk,
  },
  {
    id: 'dyr',
    re: ord('hund|hunden|katt|katten|kjæledyr|dyr|dyrene|allergi|allergisk'),
    aktor: (c) =>
      /allergi/.test(c.t)
        ? 'Takk for at du sier fra. Jeg har ingen dyr selv, og bruker parfymefrie produkter.'
        : 'Det går fint, jeg er vant til dyr. Lukk dem gjerne inne der jeg ikke jobber.',
    mottaker: () => 'Vi har en katt, men hun holder seg unna.',
  },
  {
    id: 'rydde',
    re: /skotrekk|ta av (deg )?skoa?|rydde (etter|opp)|søppel|emballasje|skitne|avfall/,
    aktor: () => 'Jeg bruker skotrekk inne og rydder alltid etter meg. Emballasje og avfall tar jeg med.',
  },
  {
    id: 'klage',
    re: /ikke fornøyd|misfornøyd|skuffet|ikke bra|ikke helt bra|dårlig|(lekker|drypper|trekker|subber) (fortsatt|igjen|fremdeles)|mangel|reklamer|ødelagt|riper?|skjev|ikke riktig|feil (farge|sted)/,
    unntar: ['ros', 'ferdig', 'akutt'],
    aktor: () =>
      'Det er jeg lei meg for å høre. Kan du sende et bilde? Jeg kommer tilbake og retter det uten ekstra kostnad. Betalingen holdes tilbake til du er fornøyd, så du er trygg.',
    mottaker: () => 'Takk for at du er ærlig om det. Hva foreslår du at vi gjør?',
  },
  {
    id: 'ros',
    re: /flink|bra jobb|bra jobba|fornøyd|fantastisk|kjempefint|kjempebra|nydelig|strålende|ser (veldig |kjempe)?(bra|fint) ut|imponert|knallbra|supert gjort/,
    aktor: (c) =>
      c.o.status === 'godkjent'
        ? 'Så hyggelig å høre, takk! Ta kontakt hvis du trenger hjelp igjen.'
        : 'Så hyggelig å høre, takk! Når du godkjenner i appen, betyr en vurdering mye for meg.',
    mottaker: () => 'Takk, det var hyggelig sagt!',
  },
  {
    id: 'ferdig',
    re: /ferdig(?! til)|levert|fullført|gjort nå|klar for godkjenning|kan du godkjenne|godkjenn|godkjent/,
    unntar: ['status', 'varighet'],
    aktor: (c) => {
      if (c.o.status === 'godkjent') return 'Tusen takk! Betalingen er frigitt, og jobben er ferdig.'
      if (c.o.status === 'levert') return 'Takk! Trykk «Godkjenn» i appen når du har sett over, så frigis betalingen.'
      return 'Jeg sier fra her og markerer jobben som levert i appen når jeg er ferdig.'
    },
    mottaker: (c) => {
      if (c.o.status === 'levert') return 'Så bra! Jeg tar en titt og godkjenner i appen.'
      if (c.o.status === 'pagar') return 'Supert! Marker den som levert i appen, så ser jeg over og godkjenner.'
      if (c.o.status === 'godkjent') return 'Ja, den er godkjent. Takk for jobben!'
      return 'Takk for beskjed!'
    },
  },
  {
    id: 'status',
    re: /status|hvordan går det|hvor langt (har du kommet|er du)|er du ferdig|kommer du (i dag|snart)|går det bra med|hvor er du|er du på vei/,
    aktor: (c) => {
      if (/hvor er du|på vei/.test(c.t) && (c.o.status === 'akseptert' || c.o.status === 'pagar')) {
        return 'Jeg er på vei og er der om ca. 15 minutter.'
      }
      switch (c.o.status) {
        case 'forespurt':
          return 'Jeg har fått forespørselen din og ser på den nå. Du får svar i dag.'
        case 'akseptert':
          return avtaleNar(c) ? `Alt er klart. Vi sees ${avtaleNar(c)}.` : 'Jobben er avtalt, vi trenger bare å sette et tidspunkt.'
        case 'pagar':
          return 'Det går fint. Jeg ligger an til å bli ferdig som planlagt.'
        case 'levert':
          return 'Jeg er ferdig og har markert jobben som levert. Se over og godkjenn i appen når du er fornøyd.'
        default:
          return 'Jobben er ferdig og godkjent. Takk for oppdraget!'
      }
    },
  },
  {
    id: 'forsikring',
    re: /forsikr|garanti|reklamasjon|fagbrev|sertifis|autoris|svennebrev|mesterbrev|seriøs|verifisert/,
    aktor: (c) => {
      const v = c.aktor.verifisert
      return [
        v.forsikring ? 'Ja, jeg har ansvarsforsikring, og den er verifisert på profilen min.' : 'Jeg har ikke ansvarsforsikring registrert ennå.',
        v.fagbrev ? `Jeg har ${liten(v.fagbrev)}.` : '',
        'Er noe feil, sier du fra før du godkjenner, så retter jeg det.',
      ]
        .filter(Boolean)
        .join(' ')
    },
  },
  {
    id: 'erfaring',
    re: /erfaring|gjort (dette|det|sånt|slikt|noe lignende|sånne) før|hvor lenge har du|referanse|hvem er du|om deg selv|kan du (dette|sånt)|er du flink/,
    aktor: (c) => {
      const a = c.aktor
      const relevant = a.tidligereJobber.find((j) => j.kategori === c.o.kategori) ?? a.tidligereJobber[0]
      return `Jeg har ${a.erfaringAar} års erfaring og ${a.fullforteJobber} fullførte jobber gjennom appen.${
        relevant ? ` Senest ${liten(relevant.tittel)} i ${relevant.ar}.` : ''
      }`
    },
  },
  {
    id: 'tillegg',
    re: /i tillegg|samtidig|kan du også|også (ta|se på|fikse|male|montere|henge)|(kan|vil|rekker) du [^.?!]* også|ekstra jobb|en ting til|mens du (er|først er) her|fant|oppdaget|mer arbeid|større enn/,
    aktor: (c) =>
      c.o.status === 'godkjent'
        ? 'Gjerne! Legg det inn som et nytt oppdrag i appen og send forespørselen til meg, så får du pris med en gang.'
        : 'Ja, det kan vi ta samtidig. Beskriv det kort, så sier jeg hva det blir ekstra. Vi avtaler det her før jeg starter.',
    mottaker: () => 'Takk for at du sier fra. Hva blir det ekstra? Skriv det her, så avtaler vi det før du setter i gang.',
  },
  {
    id: 'bilde',
    re: ord('bilde|bilder|bildet|foto|video'),
    aktor: () => 'Takk! Et bilde gjør det lettere å ta med riktig del.',
    mottaker: () => 'Jeg tar et bilde og legger det i oppdraget i kveld.',
  },
  {
    id: 'diagnose',
    re: /hva (tror du )?(det|kan det) (er|være)|hva skyldes|hvorfor (drypper|lekker|subber|trekker|renner|skjer)|tips|råd|anbefal|kan jeg (gjøre|fikse|prøve) (det )?selv|gjøre det selv|farlig|bør jeg|hva gjør jeg/,
    aktor: (c) => [diagnose(c.o), /selv|bør jeg/.test(c.t) ? c.fag.selv : ''].filter(Boolean).join(' '),
  },
  {
    id: 'vaer',
    re: ord('regn|regner|regnet|vær|været|vind|storm|snø|kaldt|kulde|sol|minusgrader|frost'),
    aktor: (c) => c.fag.vaer ?? 'Jobben er innendørs, så været spiller ingen rolle.',
    mottaker: () => 'Vi får se an været. Si fra hvis du vil flytte.',
  },
  {
    id: 'kontrakt',
    re: /kontrakt|vilkår|skriftlig|står i avtalen/,
    aktor: (c) =>
      c.kontrakt
        ? `Kontrakten gjelder: ${liten(c.kontrakt.arbeid)} Pris ${kr(c.kontrakt.pris)}. Endringer avtaler vi skriftlig her i chatten.`
        : 'Når jeg takker ja, lages en kontrakt med pris og vilkår automatisk i appen.',
  },
  {
    id: 'haster',
    finn: (c) => (c.dag || c.tid ? undefined : /haster|snarest|så fort|fortest|asap|raskt som mulig|kjapt/.exec(c.t)?.index),
    aktor: (c) =>
      c.aktor.ledigDenneUken
        ? `Jeg er ledig denne uken. Tidligste jeg kan er ${forslag(c, { dag: c.na.getDay() })}.`
        : `Jeg er dessverre booket denne uken. Tidligste jeg kan er ${forslag(c, { nesteUke: true })}.`,
  },
  {
    id: 'hvor',
    unntar: ['materialer'],
    re: /hvor (er|står|finner|sitter|ligger) (stoppekranen|malingen|pakkene|utstyret|nøkkelen|det|den|stigen|delene|tingene)/,
    mottaker: (c) => c.fag.hvor,
  },
  {
    id: 'takkJobb',
    re: /takk for at du (tok|sa ja|takket ja|kom|hjalp|svarte)|takk for (rask|kjapt) svar|glad (for at|du kunne)/,
    aktor: () => 'Bare hyggelig! Jeg ser frem til å ta tak i det.',
    mottaker: () => 'Takk selv, fint at du kunne!',
  },
  {
    id: 'kaffe',
    re: ord('kaffe|kaffi|vaffel|vafler|kake|boller'),
    aktor: () => 'Jeg takker ikke nei til en kopp kaffe!',
    mottaker: () => 'Kaffen står klar!',
  },
]

// ───────── Småprat og reserve ─────────

const HILSEN = /^(hei|hallo|heisann|hei hei|halla|god (dag|morgen|kveld|ettermiddag)|morn)/
const TAKK_FOR_SIST = /takk for sist/
const TAKK = /^(takk|supert|flott|perfekt|topp|bra|ok|fint|kjempebra|herlig|nice|deal)[\s!.,a-zæøå]{0,25}$/
const HADET = /(ha det|snakkes|vi snakkes|vi sees|ha en fin)/

/** Handler spørsmålet om selve oppdraget? */
function omJobben(c: Ctx): boolean {
  const ord = [...kategori(c.o.kategori).nokkelord, ...`${c.o.tittel} ${c.o.beskrivelse}`.toLowerCase().split(/[^a-zæøå]+/).filter((o) => o.length > 4)]
  return ord.some((o) => c.t.includes(o.slice(0, 5)))
}

function reserve(c: Ctx): string {
  const ubesvart = c.minne.apentSporsmal
  const sporsmal = c.t.includes('?')
  if (c.erAktor) {
    const nyttSporsmal = c.fag.sporsmal.find((s) => !harSagt(c.minne, s))
    if (sporsmal) {
      if (!omJobben(c)) return 'Det har jeg ikke noe godt svar på her. Lurer du på noe om jobben, svarer jeg gjerne.'
      return `Det må jeg se på stedet før jeg svarer sikkert.${avtaleNar(c) ? ` Jeg ser på det ${avtaleNar(c)}.` : ''}`
    }
    if (ubesvart) return `Takk, det er nyttig å vite.${nyttSporsmal ? ` ${nyttSporsmal}` : ''}`
    return `${pick(['Notert.', 'Takk for info.', 'Skjønner.'], c.seed)}${nyttSporsmal ? ` ${nyttSporsmal}` : ''}`
  }
  if (sporsmal) return 'Det er jeg usikker på. Kan vi se på det sammen når du er her?'
  return pick(['Takk for beskjed, det går fint for meg.', 'Notert! Si fra hvis noe endrer seg.', 'Supert, da gjør vi det sånn.'], c.seed)
}

function engelsk(c: Ctx): string {
  const navn = fornavn(c.motpart.navn)
  if (!c.erAktor) return `Hi ${navn}! Sure, English is fine. That works for me, just let me know when you're coming.`
  const nar = avtaleNar(c)
  return `Hi ${navn}! Sure, we can write in English. The price is ${kr(pris(c))}, held safely in the app until you approve the job.${
    nar ? '' : ' When would suit you?'
  }`
}

// ───────── Hovedfunksjon ─────────

function ventetid(tekst: string, forste: boolean): number {
  const ms = (forste ? 900 : 700) + tekst.length * (forste ? 14 : 20)
  return Math.min(3600, Math.max(1200, ms))
}

export function lagSvar(k: SamtaleKontekst): Boble[] {
  const na = k.na ?? new Date()
  const svarer = k.svarerErAktor ? k.aktor : k.mottaker
  const motpart = k.svarerErAktor ? k.mottaker : k.aktor
  const t = normaliser(k.tekst)
  const aktorVindu = lesTilgjengelighet(k.aktor.tilgjengelighet)
  const c: Ctx = {
    o: k.oppdrag,
    kontrakt: k.kontrakt,
    aktor: k.aktor,
    mottaker: k.mottaker,
    svarer,
    motpart,
    erAktor: k.svarerErAktor,
    t,
    na,
    seed: hash(t) + k.historikk.length,
    dag: finnDag(t, na)?.verdi,
    tid: finnTid(t)?.verdi,
    vindu: k.svarerErAktor ? aktorVindu : MOTTAKER_VINDU,
    aktorVindu,
    fag: FAG[k.oppdrag.kategori],
    stil: stilFor(svarer.id, k.svarerErAktor),
    minne: lesMinne(k.historikk, svarer.id),
  }
  const navn = fornavn(motpart.navn)
  const hilsen = fyll(pick(c.stil.hei, c.seed), { navn })
  const forsteSvar = !k.historikk.some((m) => m.fra === svarer.id)

  if (erEngelsk(t)) return [{ tekst: engelsk(c), ventMs: 2200 }]

  // Finn alle intensjoner, i den rekkefølgen brukeren skrev dem.
  const rolle = k.svarerErAktor ? 'aktor' : 'mottaker'
  const treff = INTENSJONER.flatMap((i) => {
    if (!i[rolle]) return []
    const pos = i.re ? i.re.exec(t)?.index : i.finn?.(c)
    return pos === undefined ? [] : [{ i, pos }]
  })
  const unntatt = new Set(treff.flatMap((x) => x.i.unntar ?? []))
  const deler: string[] = []
  for (const { i } of treff.filter((x) => !unntatt.has(x.i.id)).sort((a, b) => a.pos - b.pos)) {
    const svar = i[rolle]!(c)
    if (svar && !deler.includes(svar)) deler.push(svar)
    if (deler.length === 3) break
  }

  // Småprat når meldingen ikke inneholder noe konkret.
  if (!deler.length) {
    if (HILSEN.test(t) && t.length < 25) {
      return [
        {
          tekst: c.erAktor
            ? `${hilsen} Jeg har «${liten(c.o.tittel)}» på lista. Hva lurer du på?`
            : `${hilsen} Hyggelig å høre fra deg.`,
          ventMs: 1400,
        },
      ]
    }
    if (HADET.test(t)) return [{ tekst: fyll(pick(c.stil.hadet, c.seed), { navn }), ventMs: 1200 }]
    if (TAKK.test(t)) return [{ tekst: pick(c.stil.takk, c.seed), ventMs: 1200 }]
    deler.push(reserve(c))
  }

  // Proaktivt: én ekstra, nyttig opplysning som ikke er sagt før i tråden.
  let ekstra: string | undefined
  if (c.erAktor && c.bekreftet && !harSagt(c.minne, c.fag.forberede)) {
    ekstra = `Før jeg kommer: ${liten(c.fag.forberede)}`
  } else if (c.erAktor && forsteSvar && !deler.some((d) => d.includes(diagnose(c.o)))) {
    ekstra = diagnose(c.o)
  }

  const innledning = `${HILSEN.test(t) || forsteSvar ? `${hilsen} ` : ''}${TAKK_FOR_SIST.test(t) ? 'Takk for sist! ' : ''}`
  const bobler: string[] = []
  const hele = innledning + deler.join(' ')
  if (hele.length > 180 && deler.length > 1) {
    bobler.push(innledning + deler[0], deler.slice(1).join(' '))
  } else {
    bobler.push(hele)
  }
  if (ekstra) bobler.push(ekstra)

  return bobler.map((tekst, i) => ({ tekst, ventMs: ventetid(tekst, i === 0) }))
}

/** Forslag til hurtigsvar, tilpasset rolle, status og hva som er avtalt. */
export function hurtigsvar(oppdrag: Oppdrag, erMottaker: boolean, historikk: Melding[]): string[] {
  const avtalt = lesMinne(historikk, '').avtale?.bekreftet
  if (erMottaker) {
    if (oppdrag.status === 'levert') return ['Ser kjempebra ut, takk!', 'Noe er ikke helt bra']
    if (oppdrag.status === 'godkjent') return ['Takk for jobben!']
    if (oppdrag.status === 'pagar') return ['Hvordan går det?', 'Hvor lang tid tar det?', 'Kan du også se på noe annet?']
    if (avtalt) return ['Når kommer du?', 'Hva må jeg gjøre før du kommer?', 'Kan du komme litt tidligere?']
    return ['Passer det i morgen kl. 16?', 'Hva tror du problemet er?', 'Hva blir totalprisen?']
  }
  if (oppdrag.status === 'levert') return ['Ferdig! Kan du godkjenne?']
  if (oppdrag.status === 'godkjent') return ['Takk for oppdraget!']
  if (avtalt) return ['Jeg blir 10 min forsinket', 'Hvor står utstyret?', 'Fant mer som må fikses']
  return ['Passer det i morgen kl. 16?', 'Har du kjøpt det som trengs?', 'Hvor står utstyret?']
}
