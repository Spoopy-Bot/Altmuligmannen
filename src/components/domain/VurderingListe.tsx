import { dato } from '../../lib/format'
import { ratingFor } from '../../lib/matching'
import { finnPerson } from '../../lib/utvalg'
import { useDemo } from '../../store/context'
import { RatingLinje, Stjerner } from '../ui/Stjerner'

/** Snitt og alle vurderinger en person har fått, nyeste først. */
export function VurderingListe({ id }: { id: string }) {
  const { state } = useDemo()
  const rating = ratingFor(id, state.ratings)
  const vurderinger = state.ratings.filter((r) => r.til === id)
  return (
    <section aria-labelledby="mine-vurderinger">
      <div data-mork className="rounded-3xl bg-navy p-5 text-white">
        <h2 id="mine-vurderinger" className="text-lg font-bold">
          Dine vurderinger
        </h2>
        <div className="mt-2 [&_*]:text-white">
          <RatingLinje snitt={rating.snitt} antall={rating.antall} />
        </div>
      </div>
      <ul className="mt-3 flex flex-col gap-2.5">
        {vurderinger.length === 0 && <li className="rounded-2xl bg-white p-4 text-sm text-ink-3 ring-1 ring-line">Ingen vurderinger ennå.</li>}
        {vurderinger.map((r) => (
          <li key={r.id} className="rounded-2xl bg-white p-4 ring-1 ring-line">
            <div className="flex items-center justify-between gap-2">
              <Stjerner verdi={r.stjerner} storrelse={14} />
              <span className="text-xs text-ink-3">{dato(r.dato)}</span>
            </div>
            {r.kommentar && <p className="mt-2 text-sm text-ink">«{r.kommentar}»</p>}
            <p className="mt-1.5 text-xs text-ink-3">
              {finnPerson(state, r.fra).navn} · {r.oppdragTittel}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}
