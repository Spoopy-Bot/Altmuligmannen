import { BadgeCheck, CalendarClock, Check, IdCard, MapPin, PlusCircle, Send, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useParams, useSearchParams } from 'react-router'
import { KategoriIkon } from '../../components/domain/KategoriIkon'
import { EscrowMerke } from '../../components/domain/EscrowSegl'
import { Avatar } from '../../components/ui/Avatar'
import { Velger } from '../../components/ui/Felt'
import { Knapp, KnappLenke } from '../../components/ui/Knapp'
import { RatingLinje, Stjerner } from '../../components/ui/Stjerner'
import { Merke } from '../../components/ui/Merke'
import { stedNavn } from '../../data/steder'
import { dato, fornavn, km, kr } from '../../lib/format'
import { avstandKm } from '../../lib/geo'
import { ratingFor } from '../../lib/matching'
import { finnMottaker, finnPerson } from '../../lib/utvalg'
import { useDemo } from '../../store/context'
import type { Aktor } from '../../types'
import { IkkeFunnet } from '../felles/IkkeFunnet'

export function AktorProfil() {
  const { id } = useParams()
  const { state } = useDemo()
  const aktor = state.aktorer.find((a) => a.id === id)
  if (!aktor) return <IkkeFunnet hva="Aktøren" />

  const rating = ratingFor(aktor.id, state.ratings)
  const vurderinger = state.ratings.filter((r) => r.til === aktor.id)
  const meg = finnMottaker(state, state.aktivMottakerId)
  const avstand = meg ? avstandKm(aktor.sted, meg.sted) : undefined

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
      <div className="flex flex-col gap-6">
        <section className="rounded-3xl bg-white p-5 shadow-kort ring-1 ring-line sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Avatar navn={aktor.navn} farge={aktor.farge} storrelse="xl" />
            <div className="min-w-0">
              <h1 className="text-[1.75rem] leading-tight font-extrabold sm:text-[2.125rem] text-navy">{aktor.navn}</h1>
              <p className="text-ink-2">
                {aktor.tittel}
                {aktor.firma && ` · ${aktor.firma}`}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-2">
                <RatingLinje snitt={rating.snitt} antall={rating.antall} />
                <span className="inline-flex items-center gap-1">
                  <MapPin size={15} className="text-ink-3" aria-hidden />
                  {stedNavn(aktor.sted)}
                  {avstand !== undefined && <span className="tall text-ink-3">· {km(avstand)}</span>}
                </span>
              </div>
            </div>
          </div>

          <ul className="mt-5 flex flex-wrap gap-2" aria-label="Verifisering">
            {aktor.verifisert.id && (
              <li>
                <Merke tone="lys" ikon={<IdCard size={14} aria-hidden />}>
                  ID-verifisert
                </Merke>
              </li>
            )}
            {aktor.verifisert.forsikring && (
              <li>
                <Merke tone="lys" ikon={<ShieldCheck size={14} aria-hidden />}>
                  Forsikret
                </Merke>
              </li>
            )}
            {aktor.verifisert.fagbrev && (
              <li>
                <Merke tone="navy" ikon={<BadgeCheck size={14} className="text-amber" aria-hidden />}>
                  {aktor.verifisert.fagbrev}
                </Merke>
              </li>
            )}
          </ul>

          <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-line ring-1 ring-line sm:grid-cols-4">
            {[
              ['Timepris', kr(aktor.timepris)],
              ['Erfaring', `${aktor.erfaringAar} år`],
              ['Fullførte jobber', String(aktor.fullforteJobber)],
              ['Dekker', `${aktor.radiusKm} km`],
            ].map(([k, v]) => (
              <div key={k} className="bg-cream px-4 py-3">
                <dt className="text-xs text-ink-3">{k}</dt>
                <dd className="tall font-display text-lg font-bold text-navy">{v}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-5 max-w-prose leading-relaxed text-ink">{aktor.bio}</p>

          <p className="mt-4 flex items-center gap-2 text-sm text-ink-2">
            <CalendarClock size={16} className="text-ink-3" aria-hidden />
            {aktor.tilgjengelighet} · {aktor.svartid.replace('Svarer vanligvis ', 'svarer ')}
          </p>
        </section>

        <section aria-labelledby="ferdigheter" className="px-1">
          <h2 id="ferdigheter" className="text-lg font-bold text-navy">
            Ferdigheter
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {aktor.ferdigheter.map((f) => (
              <li key={f} className="rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-ink ring-1 ring-line">
                {f}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="tidligere" className="px-1">
          <h2 id="tidligere" className="text-lg font-bold text-navy">
            Tidligere jobber
          </h2>
          <ul className="mt-3 divide-y divide-line rounded-2xl bg-white ring-1 ring-line">
            {aktor.tidligereJobber.map((j) => (
              <li key={j.tittel} className="flex items-center gap-3 px-4 py-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-[var(--radius-ikon)] bg-navy-50 text-navy">
                  <KategoriIkon kategori={j.kategori} size={17} />
                </span>
                <span className="flex-1 text-[0.9375rem] text-ink">{j.tittel}</span>
                <span className="tall text-sm text-ink-3">{j.ar}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="vurderinger" className="px-1">
          <h2 id="vurderinger" className="text-lg font-bold text-navy">
            Vurderinger <span className="tall font-sans text-base font-medium text-ink-3">({vurderinger.length})</span>
          </h2>
          {vurderinger.length === 0 ? (
            <p className="mt-3 text-ink-3">Ingen vurderinger ennå.</p>
          ) : (
            <ul className="mt-3 flex flex-col gap-3">
              {vurderinger.map((r) => {
                const fra = finnPerson(state, r.fra)
                return (
                  <li key={r.id} className="rounded-2xl bg-white p-4 ring-1 ring-line">
                    <div className="flex items-center gap-3">
                      <Avatar navn={fra.navn} farge={fra.farge} storrelse="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-ink">{fra.navn}</p>
                        <p className="text-xs text-ink-3">
                          {r.oppdragTittel} · {dato(r.dato)}
                        </p>
                      </div>
                      <Stjerner verdi={r.stjerner} storrelse={14} />
                    </div>
                    {r.kommentar && <p className="mt-3 text-[0.9375rem] text-ink">«{r.kommentar}»</p>}
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>

      <aside className="lg:sticky lg:top-24">
        {state.rolle === 'mottaker' && <Foresporsel aktor={aktor} />}
      </aside>
    </div>
  )
}

function Foresporsel({ aktor }: { aktor: Aktor }) {
  const { state, dispatch } = useDemo()
  const [sok] = useSearchParams()
  const aktuelle = state.oppdrag.filter(
    (o) =>
      o.mottakerId === state.aktivMottakerId &&
      (o.status === 'apen' || (o.status === 'forespurt' && o.aktorId === aktor.id)) &&
      aktor.kategorier.includes(o.kategori),
  )
  const forvalgt = aktuelle.find((o) => o.id === sok.get('oppdrag'))?.id ?? aktuelle[0]?.id ?? ''
  const [valgtId, settValgtId] = useState(forvalgt)
  const [sender, settSender] = useState(false)
  const valgt = aktuelle.find((o) => o.id === valgtId)

  if (aktuelle.length === 0) {
    return (
      <div data-mork className="rounded-3xl bg-navy p-6 text-cream">
        <p className="font-display text-xl font-bold">Trenger du hjelp av {fornavn(aktor.navn)}?</p>
        <KnappLenke to="/hjelp/ny" variant="aksent" bred className="mt-4" ikon={<PlusCircle size={18} aria-hidden />}>
          Beskriv problemet
        </KnappLenke>
      </div>
    )
  }

  const sendt = valgt?.status === 'forespurt' && valgt.aktorId === aktor.id

  return (
    <div data-mork className="rounded-3xl bg-navy p-5 text-cream sm:p-6">
      <p className="font-display text-xl font-bold">Send forespørsel</p>
      <div className="mt-4 [&_label]:text-cream">
        <Velger etikett="Oppdrag" value={valgtId} onChange={(e) => settValgtId(e.target.value)}>
          {aktuelle.map((o) => (
            <option key={o.id} value={o.id}>
              {o.tittel}
            </option>
          ))}
        </Velger>
      </div>
      {valgt && (
        <div className="mt-3">
          <EscrowMerke betaling={valgt.betaling} />
        </div>
      )}
      {sendt ? (
        <p role="status" className="mt-4 flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 text-sm font-semibold">
          <Check size={18} className="text-amber" aria-hidden /> Sendt til {fornavn(aktor.navn)}
        </p>
      ) : (
        <Knapp
          variant="aksent"
          bred
          className="mt-4"
          laster={sender}
          ikon={<Send size={18} aria-hidden />}
          onClick={() => {
            settSender(true)
            window.setTimeout(() => {
              dispatch({ type: 'send-foresporsel', oppdragId: valgtId, aktorId: aktor.id })
              settSender(false)
            }, 600)
          }}
        >
          Send til {fornavn(aktor.navn)}
        </Knapp>
      )}
    </div>
  )
}
