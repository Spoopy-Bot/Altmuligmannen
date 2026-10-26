import { Check, ChevronRight, Presentation, RotateCcw, Settings, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useDemo } from '../../store/context'
import { desimal, kr } from '../../lib/format'
import { ratingFor } from '../../lib/matching'
import { finnPerson } from '../../lib/utvalg'
import type { Rolle } from '../../types'
import { Avatar } from '../ui/Avatar'
import { Knapp } from '../ui/Knapp'
import { Merke } from '../ui/Merke'
import { Stjerner } from '../ui/Stjerner'
import { DEMO_PERSONER, HJEM } from './navigasjon'

const ROLLE_TEKST: Record<Rolle, { tittel: string; under: string }> = {
  mottaker: { tittel: 'Trenger hjelp', under: 'Mottaker' },
  aktor: { tittel: 'Tilbyr hjelp', under: 'Aktør' },
}

/** Snittvurdering og siste vurderinger for innlogget person. */
function MinVurdering({ id }: { id: string }) {
  const { state } = useDemo()
  const rating = ratingFor(id, state.ratings)
  const siste = state.ratings.filter((r) => r.til === id).slice(0, 3)
  return (
    <section aria-labelledby="min-vurdering" className="mb-4">
      <h2 id="min-vurdering" className="mb-2 text-sm font-semibold text-ink-3">
        Din vurdering
      </h2>
      {rating.antall === 0 ? (
        <p className="text-sm text-ink-3">Ingen vurderinger ennå.</p>
      ) : (
        <>
          <div className="flex items-center gap-3 rounded-xl bg-white p-3 ring-1 ring-line">
            <span className="tall font-display text-3xl font-extrabold text-navy">{desimal(rating.snitt)}</span>
            <span className="flex flex-col gap-0.5">
              <Stjerner verdi={rating.snitt} />
              <span className="text-xs text-ink-3">
                Snitt av {rating.antall} {rating.antall === 1 ? 'vurdering' : 'vurderinger'}
              </span>
            </span>
          </div>
          <ul className="mt-2 flex flex-col gap-2">
            {siste.map((r) => (
              <li key={r.id} className="rounded-xl p-3 ring-1 ring-line">
                <div className="flex items-center justify-between gap-2">
                  <Stjerner verdi={r.stjerner} storrelse={13} />
                  <span className="truncate text-xs text-ink-3">{finnPerson(state, r.fra).navn}</span>
                </div>
                {r.kommentar && <p className="mt-1.5 text-sm text-ink">«{r.kommentar}»</p>}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

/** Mottakerens kontrakter, nyeste først. */
function MineKontrakter({ id, lukk }: { id: string; lukk: () => void }) {
  const { state } = useDemo()
  const mine = state.kontrakter.filter((k) => k.mottakerId === id)
  return (
    <section aria-labelledby="mine-kontrakter" className="mb-4">
      <div className="mb-2 flex items-baseline justify-between">
        <h2 id="mine-kontrakter" className="text-sm font-semibold text-ink-3">
          Dine kontrakter
        </h2>
        {mine.length > 4 && (
          <Link to="/mine-oppdrag" onClick={lukk} className="text-sm font-semibold text-navy hover:underline">
            Se alle
          </Link>
        )}
      </div>
      {mine.length === 0 ? (
        <p className="text-sm text-ink-3">Ingen kontrakter ennå.</p>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-xl ring-1 ring-line">
          {mine.slice(0, 4).map((k) => {
            const oppdrag = state.oppdrag.find((o) => o.id === k.oppdragId)
            return (
              <li key={k.id}>
                <Link to={`/kontrakter/${k.id}`} onClick={lukk} className="flex items-center gap-2 px-3 py-2.5 transition-colors hover:bg-cream">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-navy">{oppdrag?.tittel ?? 'Kontrakt'}</span>
                    <span className="block truncate text-xs text-ink-3">
                      {finnPerson(state, k.aktorId).navn} · {kr(k.pris)}
                    </span>
                  </span>
                  {k.status === 'fullfort' ? <Merke tone="ok">Fullført</Merke> : <Merke tone="amber">Aktiv</Merke>}
                  <ChevronRight size={16} className="text-ink-3" aria-hidden />
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export function DemoPanel() {
  const { state, dispatch } = useDemo()
  const navigate = useNavigate()
  const [apen, settApen] = useState(false)
  const [bekreft, settBekreft] = useState(false)
  const panel = useRef<HTMLDivElement>(null)
  const knapp = useRef<HTMLButtonElement>(null)
  const rolle = state.rolle ?? 'mottaker'
  const megId = rolle === 'aktor' ? state.aktivAktorId : state.aktivMottakerId
  const meg = finnPerson(state, megId)

  useEffect(() => {
    if (!apen) return
    const lukkVedTast = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        settApen(false)
        knapp.current?.focus()
      }
    }
    const lukkVedKlikk = (e: MouseEvent) => {
      const mal = e.target as Node
      if (!panel.current?.contains(mal) && !knapp.current?.contains(mal)) settApen(false)
    }
    document.addEventListener('keydown', lukkVedTast)
    document.addEventListener('mousedown', lukkVedKlikk)
    panel.current?.querySelector<HTMLElement>('button')?.focus()
    return () => {
      document.removeEventListener('keydown', lukkVedTast)
      document.removeEventListener('mousedown', lukkVedKlikk)
    }
  }, [apen])

  function velgPerson(r: Rolle, id: string) {
    const byttetRolle = r !== state.rolle
    dispatch({ type: 'sett-persona', rolle: r, id })
    settApen(false)
    if (byttetRolle) navigate(HJEM[r])
  }

  function nullstill() {
    dispatch({ type: 'nullstill' })
    settBekreft(false)
    settApen(false)
    navigate('/')
  }

  return (
    <div className="relative">
      <button
        ref={knapp}
        type="button"
        aria-expanded={apen}
        aria-controls="demo-panel"
        aria-label={`Profil: ${meg.navn}`}
        onClick={() => {
          settApen((a) => !a)
          settBekreft(false)
        }}
        className="flex h-10 items-center gap-2 rounded-xl bg-white/8 py-1 pr-3 pl-1 text-left ring-1 ring-white/15 transition-colors hover:bg-white/14"
      >
        <Avatar navn={meg.navn} farge={meg.farge} storrelse="xs" />
        <span className="hidden leading-tight sm:block">
          <span className="block text-sm font-semibold text-white">{meg.navn.split(' ')[0]}</span>
          <span className="block text-[0.6875rem] text-navy-200">{ROLLE_TEKST[rolle].under}</span>
        </span>
        <span className="rounded-md bg-white px-1.5 py-0.5 text-[0.6875rem] font-bold text-navy">Demo</span>
      </button>

      {apen && (
        <div
          ref={panel}
          id="demo-panel"
          role="dialog"
          aria-label="Profil"
          className="animer-inn fixed inset-x-3 top-[calc(4.25rem+var(--sikker-topp,0px))] z-50 max-h-[calc(100dvh-5rem-var(--sikker-topp,0px))] overflow-y-auto rounded-2xl bg-white p-5 text-ink shadow-loft ring-1 ring-line sm:absolute sm:inset-x-auto sm:top-12 sm:right-0 sm:w-[23rem]"
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar navn={meg.navn} farge={meg.farge} storrelse="md" />
              <div>
                <p className="font-display text-lg font-bold text-navy">{meg.navn}</p>
                <p className="text-sm text-ink-3">{ROLLE_TEKST[rolle].under}</p>
              </div>
              <Link
                to="/innstillinger"
                onClick={() => settApen(false)}
                className="grid size-9 shrink-0 place-items-center rounded-lg text-navy ring-1 ring-line hover:bg-cream-200"
                aria-label="Innstillinger"
              >
                <Settings size={18} aria-hidden />
              </Link>
            </div>
            <button
              type="button"
              onClick={() => settApen(false)}
              className="grid size-9 shrink-0 place-items-center rounded-lg text-ink-3 hover:bg-cream-200 hover:text-ink"
              aria-label="Lukk profil"
            >
              <X size={18} aria-hidden />
            </button>
          </div>

          <MinVurdering id={megId} />
          {rolle === 'mottaker' && <MineKontrakter id={megId} lukk={() => settApen(false)} />}

          <p className="mb-3 flex items-center gap-2 border-t border-line pt-4 font-display font-bold text-navy">
            <Presentation size={17} aria-hidden /> Demomodus
          </p>

          {(['mottaker', 'aktor'] as Rolle[]).map((r) => (
            <fieldset key={r} className="mb-4">
              <legend className="mb-2 text-sm font-semibold text-ink-3">
                {ROLLE_TEKST[r].tittel} · {ROLLE_TEKST[r].under}
              </legend>
              <div className="grid grid-cols-2 gap-2">
                {DEMO_PERSONER[r].map((id) => {
                  const p = finnPerson(state, id)
                  const valgt = state.rolle === r && megId === id
                  return (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={valgt}
                      onClick={() => velgPerson(r, id)}
                      className={`flex items-center gap-2.5 rounded-xl p-2 text-left text-sm font-semibold ring-1 transition-colors ${
                        valgt ? 'bg-navy text-white ring-navy' : 'bg-white text-ink ring-line hover:bg-cream'
                      }`}
                    >
                      <Avatar navn={p.navn} farge={p.farge} storrelse="sm" />
                      <span className="min-w-0 flex-1 leading-tight">{p.navn}</span>
                      {valgt && <Check size={16} aria-hidden />}
                    </button>
                  )
                })}
              </div>
            </fieldset>
          ))}

          <div className="border-t border-line pt-4">
            {bekreft ? (
              <div role="alert">
                <p className="text-sm font-semibold text-ink">Tilbakestille all demo-data?</p>
                                <div className="mt-3 flex gap-2">
                  <Knapp variant="fare" storrelse="sm" onClick={nullstill}>
                    Ja, nullstill
                  </Knapp>
                  <Knapp variant="tekst" storrelse="sm" onClick={() => settBekreft(false)}>
                    Avbryt
                  </Knapp>
                </div>
              </div>
            ) : (
              <Knapp variant="sekundar" storrelse="sm" bred ikon={<RotateCcw size={16} aria-hidden />} onClick={() => settBekreft(true)}>
                Nullstill demo
              </Knapp>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
