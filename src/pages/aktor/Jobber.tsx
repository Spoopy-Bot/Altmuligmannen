import { Inbox, SearchX, SlidersHorizontal } from 'lucide-react'
import { useId, useMemo, useState, type ReactNode } from 'react'
import { useSearchParams } from 'react-router'
import { KategoriIkon } from '../../components/domain/KategoriIkon'
import { MockKart, type KartPin } from '../../components/domain/MockKart'
import { OmradeVelger } from '../../components/domain/OmradeVelger'
import { OppdragKort } from '../../components/domain/OppdragKort'
import { Knapp, KnappLenke } from '../../components/ui/Knapp'
import { Merke } from '../../components/ui/Merke'
import { Sidehode } from '../../components/ui/Sidehode'
import { SkjelettListe } from '../../components/ui/Skjelett'
import { TomTilstand } from '../../components/ui/TomTilstand'
import { VisningVelger } from '../../components/ui/VisningVelger'
import { STEDER, stedNavn } from '../../data/steder'
import { useOmradeSok } from '../../hooks/useOmradeSok'
import { useSimulertLasting } from '../../hooks/useSimulertLasting'
import { fornavn } from '../../lib/format'
import { kuraterJobber, type JobbMatch } from '../../lib/matching'
import { finnAktor } from '../../lib/utvalg'
import { useDemo } from '../../store/context'

export function Jobber() {
  const { state } = useDemo()
  const laster = useSimulertLasting()
  const [sok, settSok] = useSearchParams()
  const [valgtId, settValgtId] = useState<string>()
  const meg = finnAktor(state, state.aktivAktorId)
  const omrade = useOmradeSok(meg?.sted ?? STEDER[1])
  const visning = sok.get('vis') === 'kart' ? 'kart' : 'liste'

  const alle = useMemo(
    () => (meg ? kuraterJobber(meg, state.oppdrag).filter((m) => omrade.innenfor(m.oppdrag.sted)) : []),
    // omrade.innenfor avhenger bare av sentrum og radius.
    [meg, state.oppdrag, omrade.sentrum, omrade.radiusKm],
  )
  const pinner = useMemo<KartPin[]>(
    () =>
      alle.map((m) => ({
        id: m.oppdrag.id,
        navn: `${m.oppdrag.tittel}, ${stedNavn(m.oppdrag.sted)}`,
        sted: m.oppdrag.sted,
        innhold: <KategoriIkon kategori={m.oppdrag.kategori} size={15} strokeWidth={2.2} />,
      })),
    [alle],
  )
  if (!meg) return null

  const direkte = alle.filter((m) => m.oppdrag.status === 'forespurt')
  const naer = alle.filter((m) => m.oppdrag.status === 'apen' && m.innenforOmrade)
  const fjern = alle.filter((m) => m.oppdrag.status === 'apen' && !m.innenforOmrade)
  const valgt = alle.find((m) => m.oppdrag.id === valgtId) ?? alle[0]

  function settVisning(v: 'liste' | 'kart') {
    settSok(
      (forrige) => {
        const neste = new URLSearchParams(forrige)
        if (v === 'kart') neste.set('vis', 'kart')
        else neste.delete('vis')
        return neste
      },
      { replace: true },
    )
  }

  return (
    <div className={visning === 'kart' ? '' : 'max-w-3xl'}>
      <Sidehode
        tittel={`Jobber for deg, ${fornavn(meg.navn)}`}
        handlinger={
          <div className="flex items-center gap-2">
            <VisningVelger visning={visning} onVelg={settVisning} />
            <KnappLenke to="/aktor/profil" variant="sekundar" storrelse="sm" ikon={<SlidersHorizontal size={16} aria-hidden />}>
              Tilpass
            </KnappLenke>
          </div>
        }
      />
      {laster ? (
        <SkjelettListe antall={3} etikett="Finner jobber" />
      ) : visning === 'kart' ? (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,34rem)_1fr] lg:items-start">
          <div className="flex flex-col gap-3">
            <OmradeVelger sok={omrade} hjemTekst="Base" />
            <MockKart
              pinner={pinner}
              pinEtikett="Oppdrag"
              valgtId={valgt?.oppdrag.id}
              onVelg={settValgtId}
              hjem={{ sted: meg.sted, etikett: 'Din base', radiusKm: meg.radiusKm }}
              omrade={omrade.omrade}
              onFlyttOmrade={omrade.flytt}
            />
          </div>
          <div aria-live="polite" className="lg:sticky lg:top-24">
            {valgt ? (
              <JobbKort jobb={valgt} />
            ) : (
              <TomTilstand ikon={<SearchX size={24} aria-hidden />} tittel="Ingen jobber i området">
                Gjør området større eller flytt det.
              </TomTilstand>
            )}
          </div>
        </div>
      ) : alle.length === 0 ? (
        omrade.radiusKm ? (
          <TomTilstand
            ikon={<SearchX size={24} aria-hidden />}
            tittel="Ingen jobber i området"
            handling={
              <Knapp variant="sekundar" onClick={() => omrade.settRadius(0)}>
                Fjern område
              </Knapp>
            }
          >
            Gjør området større i kartet.
          </TomTilstand>
        ) : (
          <TomTilstand
            ikon={<Inbox size={24} aria-hidden />}
            tittel="Ingen jobber akkurat nå"
            handling={<KnappLenke to="/aktor/profil">Utvid området</KnappLenke>}
          >
            Du får varsel når noe passer.
          </TomTilstand>
        )
      ) : (
        <div className="flex flex-col gap-8">
          {omrade.radiusKm > 0 && (
            <p className="-mb-4 flex items-center gap-2">
              <Merke tone="amber">
                Innen {omrade.radiusKm} km{omrade.flyttet ? ' fra valgt punkt' : ''}
              </Merke>
              <Knapp variant="tekst" storrelse="sm" onClick={() => omrade.settRadius(0)}>
                Fjern
              </Knapp>
            </p>
          )}
          <Gruppe tittel="Forespørsler til deg" jobber={direkte} />
          <Gruppe tittel="I ditt område" jobber={naer} />
          <Gruppe tittel="Litt lenger unna" jobber={fjern} />
        </div>
      )}
    </div>
  )
}

function JobbKort({ jobb }: { jobb: JobbMatch }) {
  return (
    <OppdragKort
      oppdrag={jobb.oppdrag}
      perspektiv="aktor"
      ekstra={<span className="text-sm text-ink-3">{jobb.grunner.filter((g) => g !== 'Spurt deg direkte').join(' · ')}</span>}
    />
  )
}

function Gruppe({ tittel, jobber }: { tittel: string; jobber: JobbMatch[] }): ReactNode {
  const id = useId()
  if (!jobber.length) return null
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="mb-3 flex items-center gap-2 text-lg font-bold text-navy">
        {tittel}
        <span className="tall rounded-md bg-cream-200 px-1.5 font-sans text-xs font-semibold text-ink-2">{jobber.length}</span>
      </h2>
      <ul className="flex flex-col gap-3">
        {jobber.map((m) => (
          <li key={m.oppdrag.id}>
            <JobbKort jobb={m} />
          </li>
        ))}
      </ul>
    </section>
  )
}
