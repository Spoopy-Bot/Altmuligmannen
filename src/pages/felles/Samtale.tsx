import { ArrowLeft, SendHorizontal } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'
import { EscrowMerke } from '../../components/domain/EscrowSegl'
import { Avatar } from '../../components/ui/Avatar'
import { dato, klokkeslett } from '../../lib/format'
import { finnPerson } from '../../lib/utvalg'
import { useDemo } from '../../store/context'
import { IkkeFunnet } from './IkkeFunnet'

const MAKS = 500

export function Samtale() {
  const { id } = useParams()
  const { state, dispatch, megId, sendMelding, skriver } = useDemo()
  const [tekst, settTekst] = useState('')
  const [feil, settFeil] = useState<string>()
  const bunn = useRef<HTMLDivElement>(null)
  const oppdrag = state.oppdrag.find((o) => o.id === id)
  const meldinger = state.meldinger.filter((m) => m.oppdragId === id)
  const lenke = `/meldinger/${id}`
  const harUlest = state.varsler.some((v) => v.til === megId && !v.lest && v.lenke === lenke)

  useEffect(() => {
    if (harUlest) dispatch({ type: 'les-varsler', til: megId, lenke })
  }, [harUlest, dispatch, megId, lenke])

  useEffect(() => {
    bunn.current?.scrollIntoView({ block: 'end' })
  }, [meldinger.length, skriver])

  if (!oppdrag || !oppdrag.aktorId || (oppdrag.mottakerId !== megId && oppdrag.aktorId !== megId)) return <IkkeFunnet hva="Samtalen" />

  const motpart = finnPerson(state, oppdrag.mottakerId === megId ? oppdrag.aktorId : oppdrag.mottakerId)

  return (
    <div className="flex min-h-[calc(100dvh-13rem)] max-w-2xl flex-col md:min-h-[calc(100dvh-10rem)]">
      <header className="sticky top-16 z-20 -mx-4 flex items-center gap-3 border-b border-line bg-cream/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-t-2xl sm:border sm:bg-white sm:px-5">
        <Link to="/meldinger" className="grid size-9 place-items-center rounded-lg text-navy hover:bg-navy-50" aria-label="Til meldinger">
          <ArrowLeft size={20} aria-hidden />
        </Link>
        <Avatar navn={motpart.navn} farge={motpart.farge} storrelse="sm" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-base font-bold text-navy">{motpart.navn}</h1>
          <Link to={`/oppdrag/${oppdrag.id}`} className="block truncate text-xs font-medium text-ink-3 hover:underline">
            {oppdrag.tittel}
          </Link>
        </div>
        <span className="hidden sm:block">
          <EscrowMerke betaling={oppdrag.betaling} />
        </span>
      </header>

      <ol className="flex flex-1 flex-col gap-2 py-5 sm:rounded-b-2xl sm:border-x sm:border-b sm:border-line sm:bg-white sm:px-5" aria-label="Meldinger" aria-live="polite">
        {meldinger.length === 0 && <li className="m-auto text-sm text-ink-3">Si hei til {motpart.navn.split(' ')[0]}.</li>}
        {meldinger.map((m, i) => {
          const min = m.fra === megId
          const nyDag = i === 0 || dato(meldinger[i - 1].tid) !== dato(m.tid)
          return (
            <li key={m.id} className="flex flex-col">
              {nyDag && <p className="my-2 text-center text-xs font-semibold text-ink-3">{dato(m.tid)}</p>}
              <div className={`animer-inn flex max-w-[82%] flex-col ${min ? 'items-end self-end' : 'items-start self-start'}`}>
                <p
                  className={`rounded-2xl px-3.5 py-2.5 text-[0.9375rem] leading-snug ${
                    min ? 'rounded-br-md bg-navy text-cream' : 'rounded-bl-md bg-white text-ink ring-1 ring-line sm:bg-cream'
                  }`}
                >
                  <span className="sr-only">{min ? 'Du' : motpart.navn}: </span>
                  {m.tekst}
                </p>
                <time dateTime={m.tid} className="tall mt-0.5 px-1 text-[0.6875rem] text-ink-3">
                  {klokkeslett(m.tid)}
                </time>
              </div>
            </li>
          )
        })}
        {skriver[oppdrag.id] && (
          <li className="self-start rounded-2xl rounded-bl-md bg-white px-4 py-3 ring-1 ring-line sm:bg-cream">
            <span className="sr-only">{motpart.navn} skriver …</span>
            <span className="flex gap-1" aria-hidden>
              {[0, 1, 2].map((d) => (
                <span key={d} className="size-1.5 animate-pulse rounded-full bg-ink-3" style={{ animationDelay: `${d * 120}ms` }} />
              ))}
            </span>
          </li>
        )}
      </ol>
      <div ref={bunn} />

      <form
        noValidate
        className="sticky bottom-[4.5rem] -mx-4 mt-2 border-t border-line bg-cream/95 px-4 pt-3 pb-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 md:bottom-0"
        onSubmit={(e) => {
          e.preventDefault()
          const t = tekst.trim()
          if (!t) {
            settFeil('Skriv en melding først.')
            return
          }
          sendMelding(oppdrag.id, t)
          settTekst('')
          settFeil(undefined)
        }}
      >
        <label htmlFor="ny-melding" className="sr-only">
          Melding til {motpart.navn}
        </label>
        <div className="flex items-end gap-2">
          <textarea
            id="ny-melding"
            rows={1}
            value={tekst}
            maxLength={MAKS}
            placeholder="Skriv en melding"
            aria-invalid={feil ? true : undefined}
            aria-describedby={feil ? 'melding-feil' : undefined}
            onChange={(e) => {
              settTekst(e.target.value)
              if (feil) settFeil(undefined)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                e.currentTarget.form?.requestSubmit()
              }
            }}
            className="max-h-32 min-h-12 flex-1 resize-none rounded-xl border border-line-strong bg-white px-3.5 py-3 text-[0.9375rem] focus:border-navy focus:ring-3 focus:ring-navy/15 focus:outline-none"
          />
          <button
            type="submit"
            className="grid size-12 shrink-0 place-items-center rounded-xl bg-navy text-cream transition-colors hover:bg-navy-700"
            aria-label="Send melding"
          >
            <SendHorizontal size={20} aria-hidden />
          </button>
        </div>
        {feil && (
          <p id="melding-feil" role="alert" className="mt-1.5 text-sm font-medium text-feil">
            {feil}
          </p>
        )}
      </form>
    </div>
  )
}
