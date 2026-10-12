import { SearchX } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { AktorKort } from '../../components/domain/AktorKort'
import { MockKart, type KartPin } from '../../components/domain/MockKart'
import { OmradeVelger } from '../../components/domain/OmradeVelger'
import { Velger } from '../../components/ui/Felt'
import { Knapp } from '../../components/ui/Knapp'
import { Sidehode } from '../../components/ui/Sidehode'
import { SkjelettListe } from '../../components/ui/Skjelett'
import { TomTilstand } from '../../components/ui/TomTilstand'
import { VisningVelger } from '../../components/ui/VisningVelger'
import { KATEGORIER } from '../../data/kategorier'
import { STEDER, stedNavn } from '../../data/steder'
import { initialer } from '../../lib/format'
import { useOmradeSok } from '../../hooks/useOmradeSok'
import { useSimulertLasting } from '../../hooks/useSimulertLasting'
import { avstandKm } from '../../lib/geo'
import { ratingFor } from '../../lib/matching'
import { finnMottaker } from '../../lib/utvalg'
import { useDemo } from '../../store/context'

const AVSTANDER = [5, 10, 20, 40]
const RATINGER = [4, 4.5]
const PRISER = [500, 650, 800]

export function Aktorer() {
  const { state } = useDemo()
  const [sok, settSok] = useSearchParams()
  const laster = useSimulertLasting()
  const [valgtId, settValgtId] = useState<string>()

  const oppdrag = state.oppdrag.find((o) => o.id === sok.get('oppdrag'))
  const fra = oppdrag?.sted ?? finnMottaker(state, state.aktivMottakerId)?.sted
  const omrade = useOmradeSok(fra ?? STEDER[1])
  const visning = sok.get('vis') === 'kart' ? 'kart' : 'liste'
  const filter = {
    kategori: sok.get('kategori') ?? '',
    rating: Number(sok.get('rating')) || 0,
    pris: Number(sok.get('pris')) || 0,
  }

  function sett(endringer: Record<string, string>) {
    const neste = new URLSearchParams(sok)
    for (const [nokkel, verdi] of Object.entries(endringer)) {
      if (verdi) neste.set(nokkel, verdi)
      else neste.delete(nokkel)
    }
    settSok(neste, { replace: true })
  }

  const treff = useMemo(
    () =>
      state.aktorer
        .map((a) => ({ aktor: a, avstand: fra ? avstandKm(a.sted, fra) : 0, rating: ratingFor(a.id, state.ratings) }))
        .filter(
          (t) =>
            (!filter.kategori || t.aktor.kategorier.some((k) => k === filter.kategori)) &&
            omrade.innenfor(t.aktor.sted) &&
            (!filter.rating || t.rating.snitt >= filter.rating) &&
            (!filter.pris || t.aktor.timepris <= filter.pris),
        )
        .sort((a, b) => a.avstand - b.avstand),
    [state.aktorer, state.ratings, fra, omrade.sentrum, omrade.radiusKm, filter.kategori, filter.rating, filter.pris],
  )

  const aktivFilter = filter.kategori || omrade.radiusKm || filter.rating || filter.pris
  const lenke = (id: string) => `/aktorer/${id}${oppdrag ? `?oppdrag=${oppdrag.id}` : ''}`
  const valgt = treff.find((t) => t.aktor.id === valgtId) ?? treff[0]
  const pinner = useMemo<KartPin[]>(
    () =>
      treff.map((t) => ({
        id: t.aktor.id,
        navn: `${t.aktor.navn}, ${stedNavn(t.aktor.sted)}`,
        sted: t.aktor.sted,
        innhold: initialer(t.aktor.navn),
        radiusKm: t.aktor.radiusKm,
      })),
    [treff],
  )

  return (
    <div>
      <Sidehode
        tittel="Finn hjelp"
        handlinger={
          <VisningVelger visning={visning} onVelg={(v) => sett({ vis: v === 'kart' ? 'kart' : '' })} />
        }
      />

      <form aria-label="Filter" className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4" onSubmit={(e) => e.preventDefault()}>
        <Velger etikett="Kategori" value={filter.kategori} onChange={(e) => sett({ kategori: e.target.value })}>
          <option value="">Alle</option>
          {KATEGORIER.map((k) => (
            <option key={k.id} value={k.id}>
              {k.navn}
            </option>
          ))}
        </Velger>
        <Velger
          etikett={omrade.flyttet ? 'Avstand fra punkt' : 'Avstand'}
          value={omrade.radiusKm || ''}
          onChange={(e) => omrade.settRadius(Number(e.target.value))}
        >
          <option value="">Alle</option>
          {[...new Set([...AVSTANDER, omrade.radiusKm].filter(Boolean))].sort((a, b) => a - b).map((a) => (
            <option key={a} value={a}>
              Innen {a} km
            </option>
          ))}
        </Velger>
        <Velger etikett="Vurdering" value={filter.rating || ''} onChange={(e) => sett({ rating: e.target.value })}>
          <option value="">Alle</option>
          {RATINGER.map((r) => (
            <option key={r} value={r}>
              {r.toLocaleString('nb-NO')} eller mer
            </option>
          ))}
        </Velger>
        <Velger etikett="Timepris" value={filter.pris || ''} onChange={(e) => sett({ pris: e.target.value })}>
          <option value="">Alle</option>
          {PRISER.map((p) => (
            <option key={p} value={p}>
              Under {p} kr
            </option>
          ))}
        </Velger>
      </form>

      <p className="mb-3 text-sm text-ink-3" aria-live="polite">
        {laster ? 'Søker …' : `${treff.length} ${treff.length === 1 ? 'aktør' : 'aktører'}`}
      </p>

      {laster ? (
        <SkjelettListe antall={4} hoyde="h-36" etikett="Laster aktører" />
      ) : visning === 'kart' ? (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,34rem)_1fr] lg:items-start">
          <div className="flex flex-col gap-3">
            <OmradeVelger sok={omrade} />
            <MockKart
              pinner={pinner}
              pinEtikett="Aktør"
              valgtId={valgt?.aktor.id}
              onVelg={settValgtId}
              hjem={oppdrag ? { sted: oppdrag.sted, etikett: 'Ditt oppdrag' } : undefined}
              omrade={omrade.omrade}
              onFlyttOmrade={omrade.flytt}
            />
          </div>
          <div aria-live="polite" className="lg:sticky lg:top-24">
            {valgt ? (
              <AktorKort aktor={valgt.aktor} avstand={valgt.avstand} rating={valgt.rating} lenke={lenke(valgt.aktor.id)} valgt />
            ) : (
              <TomTilstand ikon={<SearchX size={24} aria-hidden />} tittel="Ingen i området">
                Gjør området større eller flytt det.
              </TomTilstand>
            )}
          </div>
        </div>
      ) : treff.length === 0 ? (
        <TomTilstand
          ikon={<SearchX size={24} aria-hidden />}
          tittel="Ingen treff"
          handling={
            aktivFilter ? (
              <Knapp variant="sekundar" onClick={() => settSok(new URLSearchParams(oppdrag ? { oppdrag: oppdrag.id } : {}))}>
                Fjern filter
              </Knapp>
            ) : undefined
          }
        >
          Prøv færre filter.
        </TomTilstand>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {treff.map((t) => (
            <li key={t.aktor.id}>
              <AktorKort aktor={t.aktor} avstand={t.avstand} rating={t.rating} lenke={lenke(t.aktor.id)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
