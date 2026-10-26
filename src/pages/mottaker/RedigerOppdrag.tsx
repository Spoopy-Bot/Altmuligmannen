import { Save } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { BildeOpplasting } from '../../components/domain/BildeOpplasting'
import { Knapp } from '../../components/ui/Knapp'
import { TekstFelt, TekstOmrade, Velger } from '../../components/ui/Felt'
import { Sidehode } from '../../components/ui/Sidehode'
import { kr } from '../../lib/format'
import { HASTEGRAD_TEKST } from '../../lib/utvalg'
import { useDemo } from '../../store/context'
import type { Hastegrad, Oppdrag } from '../../types'
import { IkkeFunnet } from '../felles/IkkeFunnet'

type Feil = Partial<Record<'tittel' | 'beskrivelse' | 'adresse' | 'budsjett' | 'bilder', string>>

export function RedigerOppdrag() {
  const { id } = useParams()
  const { state, megId } = useDemo()
  const oppdrag = state.oppdrag.find((o) => o.id === id)
  if (!oppdrag || oppdrag.mottakerId !== megId || (oppdrag.status !== 'apen' && oppdrag.status !== 'forespurt')) {
    return <IkkeFunnet hva="Oppdraget" />
  }
  return <Skjema oppdrag={oppdrag} />
}

function Skjema({ oppdrag }: { oppdrag: Oppdrag }) {
  const { dispatch } = useDemo()
  const navigate = useNavigate()
  const [tittel, settTittel] = useState(oppdrag.tittel)
  const [beskrivelse, settBeskrivelse] = useState(oppdrag.beskrivelse)
  const [adresse, settAdresse] = useState(oppdrag.adresse)
  const [budsjett, settBudsjett] = useState(String(oppdrag.budsjett))
  const [hastegrad, settHastegrad] = useState<Hastegrad>(oppdrag.hastegrad)
  const [bilder, settBilder] = useState(oppdrag.bilder)
  const [feil, settFeil] = useState<Feil>({})
  const [lagrer, settLagrer] = useState(false)
  const belop = Number(budsjett)
  const justert = !Number.isNaN(belop) && belop !== oppdrag.budsjett

  function lagre() {
    const f: Feil = {}
    if (tittel.trim().length < 4) f.tittel = 'Skriv en kort overskrift.'
    if (beskrivelse.trim().length < 20) f.beskrivelse = 'Skriv minst 20 tegn.'
    if (adresse.trim().length < 3) f.adresse = 'Skriv gateadressen.'
    if (!budsjett || Number.isNaN(belop) || belop < 300 || belop > 100000) f.budsjett = 'Skriv et beløp mellom 300 og 100 000 kr.'
    settFeil(f)
    if (Object.keys(f).length) return
    settLagrer(true)
    window.setTimeout(() => {
      dispatch({
        type: 'rediger-oppdrag',
        oppdragId: oppdrag.id,
        endring: { tittel: tittel.trim(), beskrivelse: beskrivelse.trim(), adresse: adresse.trim(), budsjett: belop, hastegrad, bilder },
      })
      navigate(`/oppdrag/${oppdrag.id}`)
    }, 450)
  }

  return (
    <div className="max-w-2xl">
      <Sidehode tilbake={{ til: `/oppdrag/${oppdrag.id}`, tekst: 'Til oppdraget' }} tittel="Rediger oppdrag" />
      <form
        noValidate
        className="flex flex-col gap-5 rounded-3xl bg-white p-5 ring-1 ring-line sm:p-7"
        onSubmit={(e) => {
          e.preventDefault()
          lagre()
        }}
      >
        <TekstFelt etikett="Overskrift" value={tittel} onChange={(e) => settTittel(e.target.value)} feil={feil.tittel} />
        <TekstOmrade etikett="Beskrivelse" value={beskrivelse} onChange={(e) => settBeskrivelse(e.target.value)} feil={feil.beskrivelse} />
        <BildeOpplasting
          bilder={bilder}
          onEndre={settBilder}
          feil={feil.bilder}
          settFeil={(m) => settFeil((f) => ({ ...f, bilder: m }))}
        />
        <Velger etikett="Hastegrad" value={hastegrad} onChange={(e) => settHastegrad(e.target.value as Hastegrad)}>
          {(Object.keys(HASTEGRAD_TEKST) as Hastegrad[]).map((h) => (
            <option key={h} value={h}>
              {HASTEGRAD_TEKST[h]}
            </option>
          ))}
        </Velger>
        <TekstFelt etikett="Adresse" value={adresse} onChange={(e) => settAdresse(e.target.value)} feil={feil.adresse} />
        <TekstFelt
          etikett="Budsjett (kr)"
          inputMode="numeric"
          value={budsjett}
          onChange={(e) => settBudsjett(e.target.value)}
          feil={feil.budsjett}
          hjelp={justert ? `Vipps-reservasjonen justeres fra ${kr(oppdrag.budsjett)} til ${kr(belop)}.` : undefined}
        />
        <div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">
          <Knapp variant="tekst" onClick={() => navigate(`/oppdrag/${oppdrag.id}`)} disabled={lagrer}>
            Avbryt
          </Knapp>
          <Knapp type="submit" variant="aksent" laster={lagrer} ikon={<Save size={18} aria-hidden />}>
            Lagre endringer
          </Knapp>
        </div>
      </form>
    </div>
  )
}
