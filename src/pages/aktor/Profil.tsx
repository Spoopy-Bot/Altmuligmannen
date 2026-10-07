import { Check, ExternalLink, Plus, X } from 'lucide-react'
import { useState } from 'react'
import { KategoriIkon } from '../../components/domain/KategoriIkon'
import { Avatar } from '../../components/ui/Avatar'
import { TekstFelt, TekstOmrade, Velger } from '../../components/ui/Felt'
import { Knapp, KnappLenke } from '../../components/ui/Knapp'
import { Sidehode } from '../../components/ui/Sidehode'
import { RatingLinje, Stjerner } from '../../components/ui/Stjerner'
import { KATEGORIER } from '../../data/kategorier'
import { STEDER, stedNavn } from '../../data/steder'
import { dato } from '../../lib/format'
import { ratingFor } from '../../lib/matching'
import { finnAktor, finnPerson } from '../../lib/utvalg'
import { useDemo } from '../../store/context'
import type { Aktor, KategoriId } from '../../types'

const RADIUSER = [10, 15, 20, 25, 30, 40, 50]

type Feil = Partial<Record<'bio' | 'kategorier' | 'timepris' | 'tilgjengelighet', string>>

export function Profil() {
  const { state } = useDemo()
  const aktor = finnAktor(state, state.aktivAktorId)
  if (!aktor) return null
  return <ProfilSkjema key={aktor.id} aktor={aktor} />
}

function ProfilSkjema({ aktor }: { aktor: Aktor }) {
  const { state, dispatch } = useDemo()
  const [utkast, settUtkast] = useState({ ...aktor, timepris: String(aktor.timepris) })
  const [nyFerdighet, settNyFerdighet] = useState('')
  const [feil, settFeil] = useState<Feil>({})
  const [lagret, settLagret] = useState(false)
  const [lagrer, settLagrer] = useState(false)
  const rating = ratingFor(aktor.id, state.ratings)
  const vurderinger = state.ratings.filter((r) => r.til === aktor.id)
  const stedIndeks = Math.max(0, STEDER.findIndex((s) => s.by === utkast.sted.by && s.omrade === utkast.sted.omrade))
  const endret = JSON.stringify({ ...utkast, timepris: Number(utkast.timepris) }) !== JSON.stringify(aktor)

  function endre(e: Partial<typeof utkast>) {
    settUtkast((u) => ({ ...u, ...e }))
    settLagret(false)
  }

  function vekslKategori(k: KategoriId) {
    endre({ kategorier: utkast.kategorier.includes(k) ? utkast.kategorier.filter((x) => x !== k) : [...utkast.kategorier, k] })
    settFeil((f) => ({ ...f, kategorier: undefined }))
  }

  function leggTil() {
    const f = nyFerdighet.trim()
    if (f && !utkast.ferdigheter.includes(f)) endre({ ferdigheter: [...utkast.ferdigheter, f] })
    settNyFerdighet('')
  }

  function lagre() {
    const f: Feil = {}
    const pris = Number(utkast.timepris)
    if (utkast.bio.trim().length < 20) f.bio = 'Skriv minst 20 tegn.'
    if (!utkast.kategorier.length) f.kategorier = 'Velg minst én kategori.'
    if (!pris || pris < 200 || pris > 2000) f.timepris = 'Mellom 200 og 2 000 kr.'
    if (!utkast.tilgjengelighet.trim()) f.tilgjengelighet = 'Skriv når du kan jobbe.'
    settFeil(f)
    if (Object.keys(f).length) return
    settLagrer(true)
    window.setTimeout(() => {
      dispatch({ type: 'oppdater-profil', aktor: { ...utkast, bio: utkast.bio.trim(), timepris: pris } })
      settLagrer(false)
      settLagret(true)
    }, 500)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
      <div>
        <Sidehode
          tittel="Din profil"
          handlinger={
            <KnappLenke to={`/aktorer/${aktor.id}`} variant="sekundar" storrelse="sm" ikon={<ExternalLink size={16} aria-hidden />}>
              Se som kunde
            </KnappLenke>
          }
        />
        <form
          noValidate
          className="flex flex-col gap-6 rounded-3xl bg-white p-5 ring-1 ring-line sm:p-7"
          onSubmit={(e) => {
            e.preventDefault()
            lagre()
          }}
        >
          <div className="flex items-center gap-4">
            <Avatar navn={aktor.navn} farge={aktor.farge} storrelse="lg" />
            <div>
              <p className="font-display text-xl font-bold text-navy">{aktor.navn}</p>
              <p className="text-sm text-ink-2">{aktor.tittel}</p>
            </div>
          </div>

          <TekstOmrade etikett="Om deg" value={utkast.bio} maxLength={600} onChange={(e) => endre({ bio: e.target.value })} feil={feil.bio} />

          <fieldset aria-describedby={feil.kategorier ? 'kat-feil' : undefined}>
            <legend className="mb-2 text-sm font-semibold text-ink">Kategorier</legend>
            <div className="flex flex-wrap gap-2">
              {KATEGORIER.map((k) => {
                const valgt = utkast.kategorier.includes(k.id)
                return (
                  <label
                    key={k.id}
                    className={`flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ring-1 transition-colors has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-navy-600 ${
                      valgt ? 'bg-navy text-cream ring-navy' : 'bg-white text-ink ring-line hover:ring-line-strong'
                    }`}
                  >
                    <input type="checkbox" className="sr-only" checked={valgt} onChange={() => vekslKategori(k.id)} />
                    {valgt ? <Check size={15} className="text-amber" aria-hidden /> : <KategoriIkon kategori={k.id} size={15} />}
                    {k.navn}
                  </label>
                )
              })}
            </div>
            {feil.kategorier && (
              <p id="kat-feil" className="mt-1.5 text-sm font-medium text-feil">
                {feil.kategorier}
              </p>
            )}
          </fieldset>

          <div>
            <p className="mb-2 text-sm font-semibold text-ink" id="ferdigheter-tittel">
              Ferdigheter
            </p>
            <ul className="flex flex-wrap gap-2" aria-labelledby="ferdigheter-tittel">
              {utkast.ferdigheter.map((f) => (
                <li key={f} className="flex items-center gap-1 rounded-lg bg-cream-200 py-1 pr-1 pl-3 text-sm text-ink">
                  {f}
                  <button
                    type="button"
                    onClick={() => endre({ ferdigheter: utkast.ferdigheter.filter((x) => x !== f) })}
                    className="grid size-6 place-items-center rounded-md text-ink-3 hover:bg-cream-300 hover:text-ink"
                    aria-label={`Fjern ${f}`}
                  >
                    <X size={14} aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex items-end gap-2">
              <div className="flex-1">
                <TekstFelt
                  etikett="Ny ferdighet"
                  value={nyFerdighet}
                  onChange={(e) => settNyFerdighet(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      leggTil()
                    }
                  }}
                />
              </div>
              <Knapp variant="sekundar" onClick={leggTil} disabled={!nyFerdighet.trim()} className="h-12" ikon={<Plus size={18} aria-hidden />}>
                Legg til
              </Knapp>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Velger etikett="Base" value={stedIndeks} onChange={(e) => endre({ sted: STEDER[Number(e.target.value)] })}>
              {STEDER.map((s, i) => (
                <option key={`${s.by}-${s.omrade}`} value={i}>
                  {stedNavn(s)}
                </option>
              ))}
            </Velger>
            <Velger etikett="Tjenesteområde" value={utkast.radiusKm} onChange={(e) => endre({ radiusKm: Number(e.target.value) })}>
              {RADIUSER.map((r) => (
                <option key={r} value={r}>
                  Innen {r} km
                </option>
              ))}
            </Velger>
            <div className="relative">
              <TekstFelt
                etikett="Timepris"
                inputMode="numeric"
                value={utkast.timepris}
                onChange={(e) => endre({ timepris: e.target.value.replace(/[^\d]/g, '') })}
                feil={feil.timepris}
                className="tall pr-12"
              />
              <span className="pointer-events-none absolute top-[2.4rem] right-4 text-ink-3" aria-hidden>
                kr
              </span>
            </div>
            <TekstFelt
              etikett="Tilgjengelighet"
              value={utkast.tilgjengelighet}
              onChange={(e) => endre({ tilgjengelighet: e.target.value })}
              feil={feil.tilgjengelighet}
            />
          </div>

          <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl bg-cream p-4">
            <span className="font-semibold text-ink">Ledig denne uken</span>
            <input
              type="checkbox"
              role="switch"
              aria-checked={utkast.ledigDenneUken}
              checked={utkast.ledigDenneUken}
              onChange={(e) => endre({ ledigDenneUken: e.target.checked })}
              className="peer sr-only"
            />
            <span
              className="relative h-7 w-12 shrink-0 rounded-full bg-line-strong transition-colors peer-checked:bg-navy peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-navy-600 after:absolute after:top-1 after:left-1 after:size-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5"
              aria-hidden
            />
          </label>

          <div className="flex items-center gap-3 border-t border-line pt-5">
            <Knapp type="submit" laster={lagrer} disabled={!endret}>
              Lagre
            </Knapp>
            <p aria-live="polite" className="text-sm font-semibold text-ok">
              {lagret && (
                <span className="inline-flex items-center gap-1">
                  <Check size={16} aria-hidden /> Lagret
                </span>
              )}
            </p>
          </div>
        </form>
      </div>

      <section aria-labelledby="mine-vurderinger" className="lg:sticky lg:top-24">
        <div data-mork className="rounded-3xl bg-navy p-5 text-cream">
          <h2 id="mine-vurderinger" className="text-lg font-bold">
            Dine vurderinger
          </h2>
          <div className="mt-2 [&_*]:text-cream">
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
    </div>
  )
}
