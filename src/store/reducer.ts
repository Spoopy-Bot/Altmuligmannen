import { fornavn, kr, km } from '../lib/format'
import { avstandKm } from '../lib/geo'
import { nyId } from '../lib/id'
import type { Aktor, DemoState, Hendelse, Kontrakt, Oppdrag, Rolle, Varsel } from '../types'
import { lagStartState, STANDARD_VILKAR } from './seed'

export type NyttOppdrag = Pick<
  Oppdrag,
  'tittel' | 'kategori' | 'beskrivelse' | 'bilder' | 'hastegrad' | 'sted' | 'adresse' | 'budsjett'
>

export type Handling =
  | { type: 'sett-rolle'; rolle: Rolle | null }
  | { type: 'sett-persona'; rolle: Rolle; id: string }
  | { type: 'opprett-oppdrag'; id: string; mottakerId: string; data: NyttOppdrag }
  | { type: 'send-foresporsel'; oppdragId: string; aktorId: string }
  | { type: 'aksepter'; oppdragId: string; aktorId: string }
  | { type: 'avsla'; oppdragId: string; aktorId: string }
  | { type: 'start'; oppdragId: string }
  | { type: 'lever'; oppdragId: string }
  | { type: 'godkjenn'; oppdragId: string }
  | { type: 'gi-rating'; oppdragId: string; fra: string; til: string; stjerner: number; kommentar: string }
  | { type: 'send-melding'; oppdragId: string; fra: string; tekst: string }
  | { type: 'les-varsel'; id: string }
  | { type: 'les-varsler'; til: string; lenke?: string }
  | { type: 'oppdater-profil'; aktor: Aktor }
  | { type: 'nullstill' }

const na = () => new Date().toISOString()

function varsel(v: Omit<Varsel, 'id' | 'tid' | 'lest'>): Varsel {
  return { ...v, id: nyId('v'), tid: na(), lest: false }
}

function navnPa(state: DemoState, personId: string): string {
  return (
    state.aktorer.find((a) => a.id === personId)?.navn ??
    state.mottakere.find((m) => m.id === personId)?.navn ??
    'Ukjent'
  )
}

function oppdaterOppdrag(
  state: DemoState,
  id: string,
  endring: (o: Oppdrag) => Partial<Oppdrag>,
  hendelse?: Omit<Hendelse, 'tid'>,
): DemoState {
  return {
    ...state,
    oppdrag: state.oppdrag.map((o) =>
      o.id === id
        ? { ...o, ...endring(o), hendelser: hendelse ? [...o.hendelser, { ...hendelse, tid: na() }] : o.hendelser }
        : o,
    ),
  }
}

export function reducer(state: DemoState, h: Handling): DemoState {
  const finn = (id: string) => state.oppdrag.find((o) => o.id === id)

  switch (h.type) {
    case 'sett-rolle':
      return { ...state, rolle: h.rolle }

    case 'sett-persona':
      return h.rolle === 'mottaker'
        ? { ...state, rolle: 'mottaker', aktivMottakerId: h.id }
        : { ...state, rolle: 'aktor', aktivAktorId: h.id }

    case 'opprett-oppdrag': {
      const tid = na()
      const nytt: Oppdrag = {
        ...h.data,
        id: h.id,
        mottakerId: h.mottakerId,
        opprettet: tid,
        status: 'apen',
        avslattAv: [],
        betaling: { belop: h.data.budsjett, status: 'reservert', reservert: tid },
        hendelser: [{ type: 'opprettet', tid }],
      }
      // Automatisk varsling til aktører som dekker kategori og område.
      const relevante = state.aktorer.filter(
        (a) => a.kategorier.includes(nytt.kategori) && avstandKm(a.sted, nytt.sted) <= a.radiusKm,
      )
      const tilAktorer = relevante.map((a) =>
        varsel({
          til: a.id,
          type: 'nytt-oppdrag',
          tittel: `Nytt oppdrag i ${nytt.sted.omrade === 'Sentrum' ? nytt.sted.by : nytt.sted.omrade} passer deg`,
          tekst: `${nytt.tittel} · ${kr(nytt.budsjett)} reservert · ${km(avstandKm(a.sted, nytt.sted))} unna`,
          lenke: `/oppdrag/${nytt.id}`,
          lenketekst: 'Se oppdrag',
        }),
      )
      const tilMottaker = varsel({
        til: h.mottakerId,
        type: 'betaling',
        tittel: `${kr(nytt.budsjett)} er reservert`,
        tekst: `Pengene for «${nytt.tittel}» holdes trygt til du godkjenner jobben.`,
        lenke: `/oppdrag/${nytt.id}`,
        lenketekst: 'Se oppdrag',
      })
      return { ...state, oppdrag: [nytt, ...state.oppdrag], varsler: [tilMottaker, ...tilAktorer, ...state.varsler] }
    }

    case 'send-foresporsel': {
      const o = finn(h.oppdragId)
      if (!o || (o.status !== 'apen' && o.status !== 'forespurt')) return state
      const neste = oppdaterOppdrag(state, o.id, () => ({ status: 'forespurt', aktorId: h.aktorId }), {
        type: 'forespurt',
        aktorId: h.aktorId,
      })
      return {
        ...neste,
        varsler: [
          varsel({
            til: h.aktorId,
            type: 'forespørsel',
            tittel: `Ny forespørsel fra ${navnPa(state, o.mottakerId)}`,
            tekst: `${o.tittel} · ${kr(o.betaling.belop)} er reservert`,
            lenke: `/oppdrag/${o.id}`,
            lenketekst: 'Se oppdrag',
          }),
          // Fjern det generelle «nytt oppdrag»-varselet, forespørselen erstatter det.
          ...neste.varsler.filter((v) => !(v.til === h.aktorId && v.type === 'nytt-oppdrag' && v.lenke === `/oppdrag/${o.id}`)),
        ],
      }
    }

    case 'aksepter': {
      const o = finn(h.oppdragId)
      if (!o || (o.status !== 'apen' && o.status !== 'forespurt')) return state
      const kontrakt: Kontrakt = {
        id: nyId('k'),
        oppdragId: o.id,
        aktorId: h.aktorId,
        mottakerId: o.mottakerId,
        opprettet: na(),
        pris: o.betaling.belop,
        arbeid: o.beskrivelse,
        vilkar: STANDARD_VILKAR,
        status: 'aktiv',
      }
      const neste = oppdaterOppdrag(
        state,
        o.id,
        () => ({ status: 'akseptert', aktorId: h.aktorId, kontraktId: kontrakt.id }),
        { type: 'akseptert', aktorId: h.aktorId },
      )
      const aktorNavn = navnPa(state, h.aktorId)
      return {
        ...neste,
        kontrakter: [kontrakt, ...neste.kontrakter],
        meldinger: [
          ...neste.meldinger,
          {
            id: nyId('msg'),
            oppdragId: o.id,
            fra: h.aktorId,
            tekst: `Hei ${fornavn(navnPa(state, o.mottakerId))}! Jeg har takket ja til oppdraget. Når passer det at jeg kommer?`,
            tid: na(),
          },
        ],
        varsler: [
          varsel({
            til: o.mottakerId,
            type: 'tilbud',
            tittel: `${aktorNavn} takket ja`,
            tekst: `Kontrakt for «${o.tittel}» er opprettet. Pengene er fortsatt trygt reservert.`,
            lenke: `/oppdrag/${o.id}`,
            lenketekst: 'Se kontrakt',
          }),
          ...neste.varsler,
        ],
      }
    }

    case 'avsla': {
      const o = finn(h.oppdragId)
      if (!o) return state
      const varDirekte = o.status === 'forespurt' && o.aktorId === h.aktorId
      const neste = oppdaterOppdrag(
        state,
        o.id,
        (gammel) => ({
          avslattAv: [...gammel.avslattAv, h.aktorId],
          ...(varDirekte ? { status: 'apen' as const, aktorId: undefined } : {}),
        }),
        varDirekte ? { type: 'avslatt', aktorId: h.aktorId } : undefined,
      )
      if (!varDirekte) return neste
      return {
        ...neste,
        varsler: [
          varsel({
            til: o.mottakerId,
            type: 'oppdatering',
            tittel: `${navnPa(state, h.aktorId)} har ikke kapasitet`,
            tekst: `Pengene er fortsatt reservert. Velg en annen aktør for «${o.tittel}».`,
            lenke: `/hjelp/ny/${o.id}/anbefalt`,
            lenketekst: 'Velg ny aktør',
          }),
          ...neste.varsler,
        ],
      }
    }

    case 'start': {
      const o = finn(h.oppdragId)
      if (!o || o.status !== 'akseptert' || !o.aktorId) return state
      const neste = oppdaterOppdrag(state, o.id, () => ({ status: 'pagar' }), { type: 'startet' })
      return {
        ...neste,
        varsler: [
          varsel({
            til: o.mottakerId,
            type: 'oppdatering',
            tittel: `${fornavn(navnPa(state, o.aktorId))} har startet jobben`,
            tekst: `${o.tittel} er nå i gang.`,
            lenke: `/oppdrag/${o.id}`,
            lenketekst: 'Se oppdrag',
          }),
          ...neste.varsler,
        ],
      }
    }

    case 'lever': {
      const o = finn(h.oppdragId)
      if (!o || o.status !== 'pagar' || !o.aktorId) return state
      const neste = oppdaterOppdrag(state, o.id, () => ({ status: 'levert' }), { type: 'levert' })
      return {
        ...neste,
        varsler: [
          varsel({
            til: o.mottakerId,
            type: 'oppdatering',
            tittel: `${fornavn(navnPa(state, o.aktorId))} melder at jobben er ferdig`,
            tekst: `Se over arbeidet og godkjenn for å frigi ${kr(o.betaling.belop)}.`,
            lenke: `/oppdrag/${o.id}`,
            lenketekst: 'Godkjenn jobben',
          }),
          ...neste.varsler,
        ],
      }
    }

    case 'godkjenn': {
      const o = finn(h.oppdragId)
      if (!o || o.status !== 'levert' || !o.aktorId) return state
      const neste = oppdaterOppdrag(
        state,
        o.id,
        (g) => ({ status: 'godkjent', betaling: { ...g.betaling, status: 'frigitt', frigitt: na() } }),
        { type: 'godkjent' },
      )
      return {
        ...neste,
        kontrakter: neste.kontrakter.map((k) => (k.id === o.kontraktId ? { ...k, status: 'fullfort' } : k)),
        varsler: [
          varsel({
            til: o.aktorId,
            type: 'betaling',
            tittel: `${kr(o.betaling.belop)} er frigitt til deg`,
            tekst: `${navnPa(state, o.mottakerId)} har godkjent «${o.tittel}». Utbetalingen er på vei.`,
            lenke: '/aktor/avtaler',
            lenketekst: 'Se utbetaling',
          }),
          ...neste.varsler,
        ],
      }
    }

    case 'gi-rating': {
      const o = finn(h.oppdragId)
      if (!o || o.status !== 'godkjent') return state
      if (state.ratings.some((r) => r.oppdragId === o.id && r.fra === h.fra)) return state
      const fraMottaker = h.fra === o.mottakerId
      const neste = fraMottaker ? oppdaterOppdrag(state, o.id, () => ({}), { type: 'vurdert' }) : state
      return {
        ...neste,
        ratings: [
          {
            id: nyId('r'),
            oppdragId: o.id,
            oppdragTittel: o.tittel,
            fra: h.fra,
            til: h.til,
            stjerner: h.stjerner,
            kommentar: h.kommentar,
            dato: na(),
          },
          ...neste.ratings,
        ],
        varsler: [
          varsel({
            til: h.til,
            type: 'vurdering',
            tittel: `${navnPa(state, h.fra)} ga deg ${h.stjerner} ${h.stjerner === 1 ? 'stjerne' : 'stjerner'}`,
            tekst: h.kommentar ? `«${h.kommentar}»` : o.tittel,
            lenke: fraMottaker ? '/aktor/profil' : `/oppdrag/${o.id}`,
            lenketekst: 'Se vurdering',
          }),
          ...neste.varsler,
        ],
      }
    }

    case 'send-melding': {
      const o = finn(h.oppdragId)
      if (!o || !o.aktorId) return state
      const til = h.fra === o.mottakerId ? o.aktorId : o.mottakerId
      return {
        ...state,
        meldinger: [...state.meldinger, { id: nyId('msg'), oppdragId: o.id, fra: h.fra, tekst: h.tekst, tid: na() }],
        varsler: [
          varsel({
            til,
            type: 'melding',
            tittel: `Ny melding fra ${navnPa(state, h.fra)}`,
            tekst: h.tekst,
            lenke: `/meldinger/${o.id}`,
            lenketekst: 'Svar',
          }),
          ...state.varsler,
        ],
      }
    }

    case 'les-varsel':
      return { ...state, varsler: state.varsler.map((v) => (v.id === h.id ? { ...v, lest: true } : v)) }

    case 'les-varsler':
      return {
        ...state,
        varsler: state.varsler.map((v) =>
          v.til === h.til && (!h.lenke || v.lenke === h.lenke) ? { ...v, lest: true } : v,
        ),
      }

    case 'oppdater-profil':
      return { ...state, aktorer: state.aktorer.map((a) => (a.id === h.aktor.id ? h.aktor : a)) }

    case 'nullstill':
      return lagStartState()
  }
}

