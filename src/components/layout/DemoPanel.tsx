import { Check, Presentation, RotateCcw, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { useDemo } from '../../store/context'
import { finnPerson } from '../../lib/utvalg'
import type { Rolle } from '../../types'
import { Avatar } from '../ui/Avatar'
import { Knapp } from '../ui/Knapp'
import { DEMO_PERSONER, HJEM } from './navigasjon'

const ROLLE_TEKST: Record<Rolle, { tittel: string; under: string }> = {
  mottaker: { tittel: 'Trenger hjelp', under: 'Mottaker' },
  aktor: { tittel: 'Tilbyr hjelp', under: 'Aktør' },
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
        onClick={() => {
          settApen((a) => !a)
          settBekreft(false)
        }}
        className="flex h-10 items-center gap-2 rounded-xl bg-white/8 py-1 pr-3 pl-1 text-left ring-1 ring-white/15 transition-colors hover:bg-white/14"
      >
        <Avatar navn={meg.navn} farge={meg.farge} storrelse="xs" />
        <span className="hidden leading-tight sm:block">
          <span className="block text-sm font-semibold text-cream">{meg.navn.split(' ')[0]}</span>
          <span className="block text-[0.6875rem] text-navy-200">{ROLLE_TEKST[rolle].under}</span>
        </span>
        <span className="rounded-md bg-cream px-1.5 py-0.5 text-[0.6875rem] font-bold text-navy">Demo</span>
      </button>

      {apen && (
        <div
          ref={panel}
          id="demo-panel"
          role="dialog"
          aria-label="Demomodus"
          className="animer-inn fixed inset-x-3 top-[4.25rem] z-50 rounded-2xl bg-white p-5 text-ink shadow-loft ring-1 ring-line sm:absolute sm:inset-x-auto sm:top-12 sm:right-0 sm:w-[23rem]"
        >
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="flex items-center gap-2 font-display text-lg font-bold text-navy">
                <Presentation size={18} aria-hidden /> Demomodus
              </p>
              <p className="mt-0.5 text-sm text-ink-3">Bytt rolle og person.</p>
            </div>
            <button
              type="button"
              onClick={() => settApen(false)}
              className="grid size-9 shrink-0 place-items-center rounded-lg text-ink-3 hover:bg-cream-200 hover:text-ink"
              aria-label="Lukk demomodus"
            >
              <X size={18} aria-hidden />
            </button>
          </div>

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
                        valgt ? 'bg-navy text-cream ring-navy' : 'bg-white text-ink ring-line hover:bg-cream'
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
