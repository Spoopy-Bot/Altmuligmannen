import { CheckCircle2, FileSignature, MapPin, TriangleAlert, MessageCircle, Pencil, Play, Repeat, Search, ThumbsUp, Trash2, X } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { EscrowSegl } from '../../components/domain/EscrowSegl'
import { Hendelseslogg } from '../../components/domain/Hendelseslogg'
import { KategoriIkon } from '../../components/domain/KategoriIkon'
import { KontraktPdfKnapp } from '../../components/domain/KontraktPdfKnapp'
import { LeveringSkjema } from '../../components/domain/LeveringSkjema'
import { StatusMerke } from '../../components/domain/StatusMerke'
import { VurderingSkjema } from '../../components/domain/VurderingSkjema'
import { Avatar } from '../../components/ui/Avatar'
import { Knapp, KnappLenke } from '../../components/ui/Knapp'
import { Merke } from '../../components/ui/Merke'
import { Sidehode } from '../../components/ui/Sidehode'
import { RatingLinje, Stjerner } from '../../components/ui/Stjerner'
import { kategori } from '../../data/kategorier'
import { stedNavn } from '../../data/steder'
import { desimal, fornavn, km, kr } from '../../lib/format'
import { avstandKm } from '../../lib/geo'
import { ratingFor } from '../../lib/matching'
import { finnAktor, finnMottaker, finnOppdrag, HASTEGRAD_TEKST } from '../../lib/utvalg'
import { useDemo } from '../../store/context'
import type { Oppdrag } from '../../types'
import { IkkeFunnet } from './IkkeFunnet'

export function OppdragDetalj() {
  const { id } = useParams()
  const { state, megId } = useDemo()
  const oppdrag = finnOppdrag(state, id, megId)
  const rolle = state.rolle ?? 'mottaker'

  if (!oppdrag) return <IkkeFunnet hva="Oppdraget" />
  if (rolle === 'mottaker' && oppdrag.mottakerId !== megId) return <IkkeFunnet hva="Oppdraget" />

  const erMin = oppdrag.aktorId === megId
  const tattAvAnnen = rolle === 'aktor' && !!oppdrag.aktorId && !erMin && oppdrag.status !== 'apen'
  const visAdresse = rolle === 'mottaker' || (erMin && oppdrag.status !== 'forespurt')
  const meg = finnAktor(state, megId)
  const avstand = rolle === 'aktor' && meg ? avstandKm(meg.sted, oppdrag.sted) : undefined

  return (
    <div>
      <Sidehode
        tilbake={rolle === 'mottaker' ? { til: '/mine-oppdrag', tekst: 'Mine oppdrag' } : { til: erMin ? '/aktor/oversikt' : '/aktor/jobber', tekst: erMin ? 'Mine jobber' : 'Jobber' }}
        tittel={oppdrag.tittel}
        undertekst={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            <StatusMerke status={oppdrag.status} perspektiv={rolle === 'aktor' ? 'aktor' : undefined} />
            <span className="inline-flex items-center gap-1.5">
              <KategoriIkon kategori={oppdrag.kategori} size={15} />
              {kategori(oppdrag.kategori).navn}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin size={15} aria-hidden />
              {stedNavn(oppdrag.sted)}
              {avstand !== undefined && <span className="tall text-ink-3">· {km(avstand)}</span>}
            </span>
            {oppdrag.status !== 'godkjent' && (
              <Merke tone={oppdrag.hastegrad === 'snarest' ? 'feil' : 'noytral'}>{HASTEGRAD_TEKST[oppdrag.hastegrad]}</Merke>
            )}
          </span>
        }
      />

      {tattAvAnnen ? (
        <div className="rounded-2xl bg-white p-6 ring-1 ring-line">
          <p className="font-semibold text-ink">En annen aktør har tatt dette oppdraget.</p>
          <KnappLenke to="/aktor/jobber" variant="sekundar" className="mt-4" ikon={<Search size={18} aria-hidden />}>
            Se andre jobber
          </KnappLenke>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_23rem] lg:items-start">
          <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:col-start-2 lg:row-start-1">
            <EscrowSegl betaling={oppdrag.betaling} perspektiv={rolle} />
            <Motpart oppdrag={oppdrag} />
            <Handlinger oppdrag={oppdrag} />
          </aside>

          <div className="flex flex-col gap-6 lg:col-start-1 lg:row-start-1">
            <section aria-labelledby="beskrivelse" className="rounded-2xl bg-white p-5 ring-1 ring-line sm:p-6">
              <h2 id="beskrivelse" className="text-lg font-bold text-navy">
                Beskrivelse
              </h2>
              <p className="mt-2 max-w-prose leading-relaxed whitespace-pre-line text-ink">{oppdrag.beskrivelse}</p>
              {oppdrag.bilder.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-2.5">
                  {oppdrag.bilder.map((b, i) => (
                    <li key={i}>
                      <img src={b} alt={`Bilde ${i + 1} fra oppdragsgiver`} className="size-28 rounded-xl object-cover ring-1 ring-line" />
                    </li>
                  ))}
                </ul>
              )}
              <dl className="mt-5 grid gap-3 border-t border-line pt-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-ink-3">Adresse</dt>
                  <dd className="font-medium text-ink">{visAdresse ? `${oppdrag.adresse}, ${stedNavn(oppdrag.sted)}` : 'Vises når du har takket ja'}</dd>
                </div>
              </dl>
            </section>

            {oppdrag.levering && (
              <section aria-labelledby="utfort" className="rounded-2xl bg-white p-5 ring-1 ring-line sm:p-6">
                <h2 id="utfort" className="text-lg font-bold text-navy">
                  Utført arbeid
                </h2>
                <p className="mt-2 max-w-prose leading-relaxed text-ink">{oppdrag.levering.utfort}</p>
                <p className="tall mt-2 text-sm text-ink-3">{desimal(oppdrag.levering.timer)} timer</p>
                {oppdrag.levering.bilder.length > 0 && (
                  <ul className="mt-4 flex flex-wrap gap-2.5">
                    {oppdrag.levering.bilder.map((b, i) => (
                      <li key={i}>
                        <img src={b} alt={`Bilde ${i + 1} etter jobben`} className="size-28 rounded-xl object-cover ring-1 ring-line" />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}

            <section aria-labelledby="historikk" className="rounded-2xl bg-white p-5 ring-1 ring-line sm:p-6">
              <h2 id="historikk" className="mb-4 text-lg font-bold text-navy">
                Status
              </h2>
              <Hendelseslogg oppdrag={oppdrag} />
            </section>
          </div>
        </div>
      )}
    </div>
  )
}

function Panel({ children, tone = 'hvit' }: { children: ReactNode; tone?: 'hvit' | 'navy' }) {
  return (
    <section
      aria-label="Neste steg"
      data-mork={tone === 'navy' || undefined}
      className={`rounded-2xl p-5 ${tone === 'navy' ? 'bg-navy text-white' : 'bg-white ring-1 ring-line'}`}
    >
      {children}
    </section>
  )
}

function Handlinger({ oppdrag }: { oppdrag: Oppdrag }) {
  const { state, dispatch, megId } = useDemo()
  const navigate = useNavigate()
  const [laster, settLaster] = useState<string | null>(null)
  const [bekreft, settBekreft] = useState(false)
  const [slettBekreft, settSlettBekreft] = useState(false)
  const rolle = state.rolle ?? 'mottaker'
  const aktor = finnAktor(state, oppdrag.aktorId)
  const mottaker = finnMottaker(state, oppdrag.mottakerId)
  const minVurdering = state.ratings.find((r) => r.oppdragId === oppdrag.id && r.fra === megId)

  function utfor(navn: string, handling: () => void) {
    settLaster(navn)
    window.setTimeout(() => {
      handling()
      settLaster(null)
      settBekreft(false)
    }, 550)
  }

  function visSom(r: 'mottaker' | 'aktor', id: string, til = `/oppdrag/${oppdrag.id}`) {
    dispatch({ type: 'sett-persona', rolle: r, id })
    navigate(til)
  }

  const demoBytte =
    rolle === 'mottaker' && aktor ? (
      <DemoBytte navn={aktor.navn} onClick={() => visSom('aktor', aktor.id)} />
    ) : rolle === 'aktor' && mottaker && oppdrag.aktorId === megId ? (
      <DemoBytte navn={mottaker.navn} onClick={() => visSom('mottaker', mottaker.id)} />
    ) : null

  const chat = oppdrag.aktorId && ['akseptert', 'pagar', 'levert', 'godkjent'].includes(oppdrag.status) && (
    <KnappLenke to={`/meldinger/${oppdrag.id}`} variant="sekundar" bred ikon={<MessageCircle size={18} aria-hidden />}>
      Melding
    </KnappLenke>
  )
  const redigerSlett =
    rolle === 'mottaker' && (oppdrag.status === 'apen' || oppdrag.status === 'forespurt') ? (
      slettBekreft ? (
        <div className="mt-4 flex flex-col gap-2 border-t border-line pt-4" role="alert">
          <p className="text-sm text-ink-2">Slette oppdraget? Vipps-reservasjonen på {kr(oppdrag.betaling.belop)} frigjøres.</p>
          <Knapp
            variant="fare"
            bred
            laster={laster === 'slett'}
            ikon={<Trash2 size={18} aria-hidden />}
            onClick={() =>
              utfor('slett', () => {
                dispatch({ type: 'slett-oppdrag', oppdragId: oppdrag.id })
                navigate('/mine-oppdrag')
              })
            }
          >
            Ja, slett
          </Knapp>
          <Knapp variant="tekst" bred onClick={() => settSlettBekreft(false)}>
            Avbryt
          </Knapp>
        </div>
      ) : (
        <div className="mt-4 flex gap-2 border-t border-line pt-4">
          <KnappLenke to={`/oppdrag/${oppdrag.id}/rediger`} variant="sekundar" storrelse="sm" className="flex-1" ikon={<Pencil size={16} aria-hidden />}>
            Rediger
          </KnappLenke>
          <Knapp variant="fare" storrelse="sm" className="flex-1" ikon={<Trash2 size={16} aria-hidden />} onClick={() => settSlettBekreft(true)}>
            Slett
          </Knapp>
        </div>
      )
    ) : null
  const kontraktData = state.kontrakter.find((k) => k.id === oppdrag.kontraktId)
  const slettFullfort =
    oppdrag.status === 'godkjent' ? (
      slettBekreft ? (
        <div className="mt-4 flex flex-col gap-3 border-t border-line pt-4" role="alert">
          <p className="flex gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-ink ring-1 ring-amber/50">
            <TriangleAlert size={18} className="mt-0.5 shrink-0" aria-hidden />
            <span>
              <strong>Last ned kontrakten før du sletter.</strong> Du mister tilgang til jobben, kontrakten og chatten. {rolle === 'aktor' ? 'Kunden' : 'Aktøren'} beholder sin kopi.
            </span>
          </p>
          {kontraktData && <KontraktPdfKnapp kontrakt={kontraktData} />}
          <Knapp
            variant="fare"
            bred
            laster={laster === 'skjul'}
            ikon={<Trash2 size={18} aria-hidden />}
            onClick={() =>
              utfor('skjul', () => {
                dispatch({ type: 'skjul-oppdrag', oppdragId: oppdrag.id, personId: megId })
                navigate(rolle === 'aktor' ? '/aktor/oversikt' : '/mine-oppdrag')
              })
            }
          >
            Slett fra min side
          </Knapp>
          <Knapp variant="tekst" bred onClick={() => settSlettBekreft(false)}>
            Avbryt
          </Knapp>
        </div>
      ) : (
        <div className="mt-4 border-t border-line pt-4">
          <Knapp variant="fare" storrelse="sm" bred ikon={<Trash2 size={16} aria-hidden />} onClick={() => settSlettBekreft(true)}>
            Slett fra min side
          </Knapp>
        </div>
      )
    ) : null
  const kontrakt = oppdrag.kontraktId && (
    <KnappLenke to={`/kontrakter/${oppdrag.kontraktId}`} variant="tekst" bred ikon={<FileSignature size={18} aria-hidden />}>
      Se kontrakt
    </KnappLenke>
  )

  if (rolle === 'mottaker') {
    switch (oppdrag.status) {
      case 'apen':
        return (
          <Panel>
            <p className="font-semibold text-ink">Velg hvem som skal gjøre jobben</p>
            <KnappLenke to={`/hjelp/ny/${oppdrag.id}/anbefalt`} variant="aksent" bred className="mt-3">
              Se anbefalte aktører
            </KnappLenke>
            {redigerSlett}
          </Panel>
        )
      case 'forespurt':
        return (
          <Panel>
            <p className="font-semibold text-ink">Venter på svar fra {aktor && fornavn(aktor.navn)}</p>
            <p className="mt-1 text-sm text-ink-3">{aktor?.svartid}</p>
            {redigerSlett}
            {demoBytte}
          </Panel>
        )
      case 'akseptert':
      case 'pagar':
        return (
          <Panel>
            <p className="font-semibold text-ink">{oppdrag.status === 'pagar' ? 'Jobben pågår' : 'Avtalt med ' + (aktor ? fornavn(aktor.navn) : '')}</p>
            <div className="mt-3 flex flex-col gap-2">
              {chat}
              {kontrakt}
            </div>
            {demoBytte}
          </Panel>
        )
      case 'levert':
        return (
          <Panel tone="navy">
            <p className="font-display text-lg font-bold">Er du fornøyd med jobben?</p>
            <p className="mt-1 text-sm text-navy-200">Når du godkjenner, får {aktor && fornavn(aktor.navn)} {kr(oppdrag.betaling.belop)}.</p>
            {oppdrag.kategori === 'ror' && (
              <p className="mt-2 text-sm font-semibold text-amber">Få dokumentasjon på arbeidet før du godkjenner.</p>
            )}
            {bekreft ? (
              <div className="mt-4 flex flex-col gap-2" role="alert">
                <Knapp
                  variant="aksent"
                  bred
                  laster={laster === 'godkjenn'}
                  ikon={<ThumbsUp size={18} aria-hidden />}
                  onClick={() => utfor('godkjenn', () => dispatch({ type: 'godkjenn', oppdragId: oppdrag.id }))}
                >
                  Ja, frigi {kr(oppdrag.betaling.belop)}
                </Knapp>
                <Knapp variant="tekstMork" bred onClick={() => settBekreft(false)}>
                  Avbryt
                </Knapp>
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-2">
                <Knapp variant="aksent" bred ikon={<ThumbsUp size={18} aria-hidden />} onClick={() => settBekreft(true)}>
                  Godkjenn jobben
                </Knapp>
                <KnappLenke to={`/meldinger/${oppdrag.id}`} variant="tekstMork" bred>
                  Noe er ikke i orden
                </KnappLenke>
                {oppdrag.kontraktId && (
                  <KnappLenke to={`/kontrakter/${oppdrag.kontraktId}`} variant="tekstMork" bred ikon={<FileSignature size={18} aria-hidden />}>
                    Se kontrakt
                  </KnappLenke>
                )}
              </div>
            )}
          </Panel>
        )
      case 'godkjent':
        return (
          <Panel>
            {minVurdering ? (
              <MinVurdering stjerner={minVurdering.stjerner} kommentar={minVurdering.kommentar} />
            ) : (
              aktor && <VurderingSkjema oppdragId={oppdrag.id} til={aktor.id} tilNavn={aktor.navn} />
            )}
            <div className="mt-3">{kontrakt}</div>
            {slettFullfort}
            {demoBytte}
          </Panel>
        )
    }
  }

  // Aktør
  const meg = finnAktor(state, megId)
  switch (oppdrag.status) {
    case 'apen':
    case 'forespurt':
      return (
        <Panel tone="navy">
          <p className="font-display text-lg font-bold">
            {oppdrag.status === 'forespurt' ? `${mottaker ? fornavn(mottaker.navn) : 'Kunden'} spør deg` : 'Vil du ta jobben?'}
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <Knapp
              variant="aksent"
              bred
              laster={laster === 'aksepter'}
              disabled={laster !== null}
              ikon={<CheckCircle2 size={18} aria-hidden />}
              onClick={() => utfor('aksepter', () => meg && dispatch({ type: 'aksepter', oppdragId: oppdrag.id, aktorId: meg.id }))}
            >
              Takk ja
            </Knapp>
            <Knapp
              variant="tekstMork"
              bred
              laster={laster === 'avsla'}
              disabled={laster !== null}
              ikon={<X size={18} aria-hidden />}
              onClick={() =>
                utfor('avsla', () => {
                  if (!meg) return
                  dispatch({ type: 'avsla', oppdragId: oppdrag.id, aktorId: meg.id })
                  navigate('/aktor/jobber')
                })
              }
            >
              Ikke aktuelt
            </Knapp>
          </div>
        </Panel>
      )
    case 'akseptert':
      return (
        <Panel>
          <p className="font-semibold text-ink">Klar til å starte?</p>
          <div className="mt-3 flex flex-col gap-2">
            <Knapp
              bred
              laster={laster === 'start'}
              ikon={<Play size={18} aria-hidden />}
              onClick={() => utfor('start', () => dispatch({ type: 'start', oppdragId: oppdrag.id }))}
            >
              Start jobben
            </Knapp>
            {chat}
            {kontrakt}
          </div>
          {demoBytte}
        </Panel>
      )
    case 'pagar':
      return (
        <Panel>
          <p className="mb-4 font-semibold text-ink">Ferdig med jobben?</p>
          <LeveringSkjema
            laster={laster === 'lever'}
            onLever={(levering) => utfor('lever', () => dispatch({ type: 'lever', oppdragId: oppdrag.id, levering }))}
          />
          <div className="mt-2 flex flex-col gap-2">
            {chat}
            {kontrakt}
          </div>
          {demoBytte}
        </Panel>
      )
    case 'levert':
      return (
        <Panel>
          <p className="font-semibold text-ink">Venter på godkjenning fra {mottaker && fornavn(mottaker.navn)}</p>
          <div className="mt-3 flex flex-col gap-2">
            {chat}
            {kontrakt}
          </div>
          {demoBytte}
        </Panel>
      )
    case 'godkjent':
      return (
        <Panel>
          {minVurdering ? (
            <MinVurdering stjerner={minVurdering.stjerner} kommentar={minVurdering.kommentar} />
          ) : (
            mottaker && <VurderingSkjema oppdragId={oppdrag.id} til={mottaker.id} tilNavn={mottaker.navn} />
          )}
          <div className="mt-3">{kontrakt}</div>
          {slettFullfort}
          {demoBytte}
        </Panel>
      )
  }
}

function MinVurdering({ stjerner, kommentar }: { stjerner: number; kommentar: string }) {
  return (
    <div className="animer-inn">
      <p className="text-sm font-semibold text-ink-3">Din vurdering</p>
      <div className="mt-1">
        <Stjerner verdi={stjerner} storrelse={20} />
      </div>
      {kommentar && <p className="mt-2 text-[0.9375rem] text-ink">«{kommentar}»</p>}
    </div>
  )
}

function DemoBytte({ navn, onClick }: { navn: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold opacity-75 hover:opacity-100"
    >
      <Repeat size={14} aria-hidden /> Demo: vis som {fornavn(navn)}
    </button>
  )
}

function Motpart({ oppdrag }: { oppdrag: Oppdrag }) {
  const { state } = useDemo()
  const rolle = state.rolle ?? 'mottaker'
  if (rolle === 'mottaker') {
    const aktor = finnAktor(state, oppdrag.aktorId)
    if (!aktor) return null
    const r = ratingFor(aktor.id, state.ratings)
    return (
      <Link
        to={`/aktorer/${aktor.id}`}
        className="flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-line transition-shadow hover:shadow-kort"
      >
        <Avatar navn={aktor.navn} farge={aktor.farge} storrelse="md" />
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-ink">{aktor.navn}</span>
          <RatingLinje snitt={r.snitt} antall={r.antall} />
        </span>
      </Link>
    )
  }
  const mottaker = finnMottaker(state, oppdrag.mottakerId)
  if (!mottaker) return null
  const r = ratingFor(mottaker.id, state.ratings)
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-line">
      <Avatar navn={mottaker.navn} farge={mottaker.farge} storrelse="md" />
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-ink">{mottaker.navn}</span>
        {r.antall > 0 ? <RatingLinje snitt={r.snitt} antall={r.antall} /> : <span className="text-sm text-ink-3">Ny kunde</span>}
      </span>
    </div>
  )
}
