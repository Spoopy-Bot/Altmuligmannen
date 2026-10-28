import { Check } from 'lucide-react'
import { useState } from 'react'
import { Avatar } from '../../components/ui/Avatar'
import { TekstFelt, TekstOmrade, Velger } from '../../components/ui/Felt'
import { Knapp } from '../../components/ui/Knapp'
import { Sidehode } from '../../components/ui/Sidehode'
import { STEDER, stedNavn } from '../../data/steder'
import { datoMedAr } from '../../lib/format'
import { finnMottaker } from '../../lib/utvalg'
import { useDemo } from '../../store/context'
import type { Mottaker } from '../../types'

type Feil = Partial<Record<'navn' | 'alder' | 'bio', string>>

export function MinProfil() {
  const { state } = useDemo()
  const mottaker = finnMottaker(state, state.aktivMottakerId)
  if (!mottaker) return null
  return <ProfilSkjema key={mottaker.id} mottaker={mottaker} />
}

function ProfilSkjema({ mottaker }: { mottaker: Mottaker }) {
  const { dispatch } = useDemo()
  const [utkast, settUtkast] = useState({ ...mottaker, alder: mottaker.alder === undefined ? '' : String(mottaker.alder), bio: mottaker.bio ?? '' })
  const [feil, settFeil] = useState<Feil>({})
  const [lagret, settLagret] = useState(false)
  const stedIndeks = Math.max(0, STEDER.findIndex((s) => s.by === utkast.sted.by && s.omrade === utkast.sted.omrade))
  const endret = JSON.stringify({ ...utkast, alder: Number(utkast.alder) }) !== JSON.stringify({ ...mottaker, bio: mottaker.bio ?? '' })

  function endre(e: Partial<typeof utkast>) {
    settUtkast((u) => ({ ...u, ...e }))
    settLagret(false)
  }

  function lagre() {
    const f: Feil = {}
    const alder = Number(utkast.alder)
    if (utkast.navn.trim().length < 2) f.navn = 'Skriv navnet ditt.'
    if (!alder || alder < 18 || alder > 110) f.alder = 'Mellom 18 og 110 år.'
    settFeil(f)
    if (Object.keys(f).length) return
    dispatch({ type: 'oppdater-mottaker', mottaker: { ...utkast, navn: utkast.navn.trim(), alder, bio: utkast.bio.trim() } })
    settLagret(true)
  }

  return (
    <div className="max-w-3xl">
      <Sidehode tittel="Din profil" />
      <form
        noValidate
        className="flex flex-col gap-6 rounded-3xl bg-white p-5 ring-1 ring-line sm:p-7"
        onSubmit={(e) => {
          e.preventDefault()
          lagre()
        }}
      >
        <div className="flex items-center gap-4">
          <Avatar navn={utkast.navn || mottaker.navn} farge={mottaker.farge} storrelse="lg" />
          <div>
            <p className="font-display text-xl font-bold text-navy">{utkast.navn || mottaker.navn}</p>
            <p className="text-sm text-ink-2">
              {utkast.alder && `${utkast.alder} år · `}Medlem siden {datoMedAr(mottaker.medlemSiden)}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TekstFelt etikett="Navn" value={utkast.navn} onChange={(e) => endre({ navn: e.target.value })} feil={feil.navn} />
          <TekstFelt
            etikett="Alder"
            inputMode="numeric"
            value={utkast.alder}
            onChange={(e) => endre({ alder: e.target.value.replace(/[^\d]/g, '') })}
            feil={feil.alder}
            className="tall"
          />
        </div>

        <TekstOmrade etikett="Om deg" value={utkast.bio} maxLength={400} onChange={(e) => endre({ bio: e.target.value })} feil={feil.bio} />

        <Velger etikett="Sted" value={stedIndeks} onChange={(e) => endre({ sted: STEDER[Number(e.target.value)] })}>
          {STEDER.map((s, i) => (
            <option key={`${s.by}-${s.omrade}`} value={i}>
              {stedNavn(s)}
            </option>
          ))}
        </Velger>

        <div className="flex items-center gap-3 border-t border-line pt-5">
          <Knapp type="submit" disabled={!endret}>
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
  )
}
