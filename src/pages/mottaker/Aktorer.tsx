import { List, Map as KartIkon, SearchX } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { AktorKort } from '../../components/domain/AktorKort'
import { MockKart } from '../../components/domain/MockKart'
import { Velger } from '../../components/ui/Felt'
import { Knapp } from '../../components/ui/Knapp'
import { Sidehode } from '../../components/ui/Sidehode'
import { SkjelettListe } from '../../components/ui/Skjelett'
import { TomTilstand } from '../../components/ui/TomTilstand'
import { KATEGORIER } from '../../data/kategorier'
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
  const visning = sok.get('vis') === 'kart' ? 'kart' : 'liste'
  const filter = {
    kategori: sok.get('kategori') ?? '',
    avstand: Number(sok.get('avstand')) || 0,
    rating: Number(sok.get('rating')) || 0,
    pris: Number(sok.get('pris')) || 0,
  }

  function sett(nokkel: string, verdi: string) {
    const neste = new URLSearchParams(sok)
    if (verdi) neste.set(nokkel, verdi)
    else neste.delete(nokkel)
    settSok(neste, { replace: true })
  }

  const treff = useMemo(
    () =>
      state.aktorer
        .map((a) => ({ aktor: a, avstand: fra ? avstandKm(a.sted, fra) : 0, rating: ratingFor(a.id, state.ratings) }))
        .filter(
          (t) =>
            (!filter.kategori || t.aktor.kategorier.some((k) => k === filter.kategori)) &&
            (!filter.avstand || t.avstand <= filter.avstand) &&
            (!filter.rating || t.rating.snitt >= filter.rating) &&
            (!filter.pris || t.aktor.timepris <= filter.pris),
        )
        .sort((a, b) => a.avstand - b.avstand),
    [state.aktorer, state.ratings, fra, filter.kategori, filter.avstand, filter.rating, filter.pris],
  )

  const aktivFilter = filter.kategori || filter.avstand || filter.rating || filter.pris
  const lenke = (id: string) => `/aktorer/${id}${oppdrag ? `?oppdrag=${oppdrag.id}` : ''}`
  const valgt = treff.find((t) => t.aktor.id === valgtId) ?? treff[0]

  return (
    <div>
      <Sidehode
        tittel="Finn hjelp"
        handlinger={
          <div role="group" aria-label="Visning" className="flex rounded-xl bg-white p-1 ring-1 ring-line">
            {(['liste', 'kart'] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={visning === v}
                onClick={() => sett('vis', v === 'kart' ? 'kart' : '')}
                className={`flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition-colors ${
                  visning === v ? 'bg-navy text-cream' : 'text-ink-2 hover:text-navy'
                }`}
              >
                {v === 'kart' ? <KartIkon size={16} aria-hidden /> : <List size={16} aria-hidden />}
                {v === 'kart' ? 'Kart' : 'Liste'}
              </button>
            ))}
          </div>
        }
      />

      <form aria-label="Filter" className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4" onSubmit={(e) => e.preventDefault()}>
        <Velger etikett="Kategori" value={filter.kategori} onChange={(e) => sett('kategori', e.target.value)}>
          <option value="">Alle</option>
          {KATEGORIER.map((k) => (
            <option key={k.id} value={k.id}>
              {k.navn}
            </option>
          ))}
        </Velger>
        <Velger etikett="Avstand" value={filter.avstand || ''} onChange={(e) => sett('avstand', e.target.value)}>
          <option value="">Alle</option>
          {AVSTANDER.map((a) => (
            <option key={a} value={a}>
              Innen {a} km
            </option>
          ))}
        </Velger>
        <Velger etikett="Vurdering" value={filter.rating || ''} onChange={(e) => sett('rating', e.target.value)}>
          <option value="">Alle</option>
          {RATINGER.map((r) => (
            <option key={r} value={r}>
              {r.toLocaleString('nb-NO')} eller mer
            </option>
          ))}
        </Velger>
        <Velger etikett="Timepris" value={filter.pris || ''} onChange={(e) => sett('pris', e.target.value)}>
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
      ) : visning === 'kart' ? (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,34rem)_1fr] lg:items-start">
          <MockKart
            aktorer={treff.map((t) => t.aktor)}
            valgtId={valgt?.aktor.id}
            onVelg={settValgtId}
            oppdragSted={oppdrag?.sted}
          />
          {valgt && (
            <div aria-live="polite" className="lg:sticky lg:top-24">
              <AktorKort aktor={valgt.aktor} avstand={valgt.avstand} rating={valgt.rating} lenke={lenke(valgt.aktor.id)} valgt />
            </div>
          )}
        </div>
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
