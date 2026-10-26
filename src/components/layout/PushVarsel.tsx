import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import ikon from '../../assets/ikon-160.png'
import { innstillingerFor, minevarsler } from '../../lib/utvalg'
import { useDemo } from '../../store/context'
import type { Varsel } from '../../types'

/** Simulert push: nye varsler til den som er innlogget vises som et iOS-banner øverst. */
export function PushVarsel() {
  const { state, dispatch, megId } = useDemo()
  const navigate = useNavigate()
  const sett = useRef<{ id: string; ider: Set<string> }>({ id: megId, ider: new Set(state.varsler.map((v) => v.id)) })
  const [vis, settVis] = useState<Varsel>()
  const { push } = innstillingerFor(state, megId)

  useEffect(() => {
    if (sett.current.id !== megId) sett.current = { id: megId, ider: new Set(state.varsler.map((v) => v.id)) }
    const nye = minevarsler(state, megId).filter((v) => !sett.current.ider.has(v.id))
    for (const v of state.varsler) sett.current.ider.add(v.id)
    if (push && nye.length) settVis(nye[0])
  }, [state, megId, push])

  useEffect(() => {
    if (!vis) return
    const t = window.setTimeout(() => settVis(undefined), 5000)
    return () => window.clearTimeout(t)
  }, [vis])

  if (!vis) return null
  return (
    <button
      key={vis.id}
      type="button"
      role="alert"
      onClick={() => {
        dispatch({ type: 'les-varsel', id: vis.id })
        settVis(undefined)
        navigate(vis.lenke)
      }}
      className="animer-inn fixed inset-x-3 top-[calc(var(--sikker-topp,0px)+0.5rem)] z-[70] mx-auto flex max-w-md items-start gap-3 rounded-3xl bg-white/95 p-3.5 text-left shadow-loft ring-1 ring-black/10 backdrop-blur"
    >
      <img src={ikon} alt="" className="size-9 shrink-0 rounded-[22%]" />
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2 text-xs text-ink-3">
          <span className="font-semibold tracking-wide uppercase">Altmuligmannen</span>
          <span>nå</span>
        </span>
        <span className="block truncate text-[0.9375rem] font-semibold text-ink">{vis.tittel}</span>
        <span className="block truncate text-sm text-ink-2">{vis.tekst}</span>
      </span>
    </button>
  )
}
