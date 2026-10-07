import { ArrowLeft, ArrowRight, Check, ImagePlus, Info, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { KategoriIkon } from '../../components/domain/KategoriIkon'
import { Segl } from '../../components/domain/Segl'
import { Knapp } from '../../components/ui/Knapp'
import { TekstFelt, TekstOmrade, Velger } from '../../components/ui/Felt'
import { kategori, KATEGORIER } from '../../data/kategorier'
import { STEDER, stedNavn } from '../../data/steder'
import { lagMiniatyr } from '../../lib/bilde'
import { kr } from '../../lib/format'
import { finnMottaker, HASTEGRAD_TEKST } from '../../lib/utvalg'
import { useDemo } from '../../store/context'
import type { Hastegrad, KategoriId } from '../../types'

const STEG = ['Kategori', 'Beskrivelse', 'Hastegrad', 'Sted', 'Budsjett', 'Send'] as const

const HASTEGRADER: { id: Hastegrad; tekst: string }[] = [
  { id: 'snarest', tekst: 'I dag eller i morgen' },
  { id: 'denne-uken', tekst: 'Innen en uke' },
  { id: 'fleksibel', tekst: 'Når det passer' },
]

const MAKS_BILDER = 3

interface Utkast {
  kategori?: KategoriId
  tittel: string
  beskrivelse: string
  bilder: string[]
  hastegrad?: Hastegrad
  stedIndeks: number
  adresse: string
  budsjett: string
}

type Feil = Partial<Record<'kategori' | 'tittel' | 'beskrivelse' | 'hastegrad' | 'adresse' | 'budsjett' | 'bilder', string>>

function valider(steg: number, u: Utkast): Feil {
  const f: Feil = {}
  if (steg === 0 && !u.kategori) f.kategori = 'Velg en kategori.'
  if (steg === 1) {
    if (u.tittel.trim().length < 4) f.tittel = 'Skriv en kort overskrift.'
    if (u.beskrivelse.trim().length < 20) f.beskrivelse = 'Skriv minst 20 tegn.'
  }
  if (steg === 2 && !u.hastegrad) f.hastegrad = 'Velg et alternativ.'
  if (steg === 3 && u.adresse.trim().length < 3) f.adresse = 'Skriv gateadressen.'
  if (steg === 4) {
    const b = Number(u.budsjett)
    if (!u.budsjett || Number.isNaN(b)) f.budsjett = 'Skriv et beløp i hele kroner.'
    else if (b < 300) f.budsjett = 'Minste beløp er 300 kr.'
    else if (b > 100000) f.budsjett = 'Beløpet kan ikke være over 100 000 kr i denne demoen.'
  }
  return f
}

export function NyttBehov() {
  const { state, opprettOppdrag } = useDemo()
  const navigate = useNavigate()
  const meg = finnMottaker(state, state.aktivMottakerId)
  const startSted = Math.max(
    0,
    STEDER.findIndex((s) => meg && s.by === meg.sted.by && s.omrade === meg.sted.omrade),
  )
  const [steg, settSteg] = useState(0)
  const [utkast, settUtkast] = useState<Utkast>({
    tittel: '',
    beskrivelse: '',
    bilder: [],
    stedIndeks: startSted,
    adresse: '',
    budsjett: '',
  })
  const [feil, settFeil] = useState<Feil>({})
  const [sender, settSender] = useState(false)
  const overskrift = useRef<HTMLHeadingElement>(null)
  const forsteRender = useRef(true)

  useEffect(() => {
    if (forsteRender.current) {
      forsteRender.current = false
      return
    }
    overskrift.current?.focus()
  }, [steg])

  const prisintervall = useMemo(() => {
    if (!utkast.kategori) return null
    const kat = kategori(utkast.kategori)
    const priser = state.aktorer
      .filter((a) => a.kategorier.includes(kat.id))
      .map((a) => Math.round((a.timepris * kat.typiskeTimer) / 50) * 50)
      .sort((a, b) => a - b)
    if (!priser.length) return null
    return { min: priser[0], maks: priser[priser.length - 1], forslag: Math.round(priser[Math.floor(priser.length / 2)] / 100) * 100 }
  }, [utkast.kategori, state.aktorer])

  const oppdater = (endring: Partial<Utkast>) => {
    settUtkast((u) => ({ ...u, ...endring }))
    settFeil((f) => {
      const neste = { ...f }
      for (const k of Object.keys(endring)) delete neste[k as keyof Feil]
      if ('hastegrad' in endring) delete neste.hastegrad
      return neste
    })
  }

  function neste() {
    const f = valider(steg, utkast)
    settFeil(f)
    if (Object.keys(f).length) {
      document.querySelector<HTMLElement>('[aria-invalid="true"], [data-feilgruppe]')?.focus()
      return
    }
    if (steg === 3 && !utkast.budsjett && prisintervall) oppdater({ budsjett: String(prisintervall.forslag) })
    settSteg((s) => Math.min(s + 1, STEG.length - 1))
  }

  function send() {
    if (!utkast.kategori || !utkast.hastegrad) return
    settSender(true)
    const data = {
      kategori: utkast.kategori,
      tittel: utkast.tittel.trim(),
      beskrivelse: utkast.beskrivelse.trim(),
      bilder: utkast.bilder,
      hastegrad: utkast.hastegrad,
      sted: STEDER[utkast.stedIndeks],
      adresse: utkast.adresse.trim(),
      budsjett: Number(utkast.budsjett),
    }
    window.setTimeout(() => {
      const id = opprettOppdrag(data)
      navigate(`/hjelp/ny/${id}/anbefalt`)
    }, 700)
  }

  return (
    <div className="max-w-2xl">
      <Fremdrift steg={steg} onGaTil={(i) => i < steg && settSteg(i)} />

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          if (steg === STEG.length - 1) send()
          else neste()
        }}
        className="mt-6"
      >
        {steg === 0 && (
          <Steg tittel="Hva trenger du hjelp med?" refH={overskrift}>
            <fieldset data-feilgruppe={feil.kategori ? true : undefined} tabIndex={-1} aria-describedby={feil.kategori ? 'kat-feil' : undefined}>
              <legend className="sr-only">Kategori</legend>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {KATEGORIER.map((k) => {
                  const valgt = utkast.kategori === k.id
                  return (
                    <label
                      key={k.id}
                      className={`flex cursor-pointer items-center gap-3.5 rounded-2xl bg-white p-3.5 ring-1 transition-[box-shadow,background-color] has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-navy-600 ${
                        valgt ? 'ring-2 ring-navy' : 'ring-line hover:ring-line-strong'
                      }`}
                    >
                      <input
                        type="radio"
                        name="kategori"
                        value={k.id}
                        checked={valgt}
                        onChange={() => oppdater({ kategori: k.id })}
                        className="sr-only"
                      />
                      <span
                        className={`grid size-11 shrink-0 place-items-center rounded-[var(--radius-ikon)] transition-colors ${
                          valgt ? 'bg-navy text-amber' : 'bg-navy-50 text-navy'
                        }`}
                      >
                        <KategoriIkon kategori={k.id} size={21} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-ink">{k.navn}</span>
                        <span className="block text-sm text-ink-3">{k.eksempler}</span>
                      </span>
                      {valgt && <Check size={18} className="text-navy" aria-hidden />}
                    </label>
                  )
                })}
              </div>
            </fieldset>
            {feil.kategori && <FeilTekst id="kat-feil">{feil.kategori}</FeilTekst>}
          </Steg>
        )}

        {steg === 1 && (
          <Steg
            tittel="Beskriv problemet"
            undertekst="Med egne ord – ingen fagord nødvendig."
            refH={overskrift}
          >
            <div className="flex flex-col gap-5">
              <TekstFelt
                etikett="Kort overskrift"
                placeholder="F.eks. Drypper fra kjøkkenkranen"
                value={utkast.tittel}
                maxLength={70}
                onChange={(e) => oppdater({ tittel: e.target.value })}
                feil={feil.tittel}
              />
              <TekstOmrade
                etikett="Beskrivelse"
                placeholder="Det drypper fra kranen selv om den er skrudd helt igjen. Det startet i går …"
                value={utkast.beskrivelse}
                maxLength={800}
                onChange={(e) => oppdater({ beskrivelse: e.target.value })}
                feil={feil.beskrivelse}
              />
              <BildeOpplasting
                bilder={utkast.bilder}
                onEndre={(bilder) => oppdater({ bilder })}
                feil={feil.bilder}
                settFeil={(m) => settFeil((f) => ({ ...f, bilder: m }))}
              />
            </div>
          </Steg>
        )}

        {steg === 2 && (
          <Steg tittel="Hvor fort trenger du hjelp?" refH={overskrift}>
            <fieldset data-feilgruppe={feil.hastegrad ? true : undefined} tabIndex={-1}>
              <legend className="sr-only">Hastegrad</legend>
              <div className="flex flex-col gap-2.5">
                {HASTEGRADER.map((h) => {
                  const valgt = utkast.hastegrad === h.id
                  return (
                    <label
                      key={h.id}
                      className={`flex cursor-pointer items-center gap-3.5 rounded-2xl bg-white p-4 ring-1 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-navy-600 ${
                        valgt ? 'ring-2 ring-navy' : 'ring-line hover:ring-line-strong'
                      }`}
                    >
                      <input
                        type="radio"
                        name="hastegrad"
                        aria-label={HASTEGRAD_TEKST[h.id]}
                        checked={valgt}
                        onChange={() => oppdater({ hastegrad: h.id })}
                        className="size-5 accent-navy"
                      />
                      <span>
                        <span className="block font-semibold text-ink">{HASTEGRAD_TEKST[h.id]}</span>
                        <span className="block text-sm text-ink-3">{h.tekst}</span>
                      </span>
                    </label>
                  )
                })}
              </div>
            </fieldset>
            {feil.hastegrad && <FeilTekst>{feil.hastegrad}</FeilTekst>}
          </Steg>
        )}

        {steg === 3 && (
          <Steg tittel="Hvor skal jobben gjøres?" refH={overskrift}>
            <div className="flex flex-col gap-5">
              <Velger etikett="Område" value={utkast.stedIndeks} onChange={(e) => oppdater({ stedIndeks: Number(e.target.value) })}>
                {STEDER.map((s, i) => (
                  <option key={`${s.by}-${s.omrade}`} value={i}>
                    {stedNavn(s)}
                  </option>
                ))}
              </Velger>
              <TekstFelt
                etikett="Gateadresse"
                hjelp="Vises først når en aktør har takket ja."
                placeholder="F.eks. Demoveien 12"
                autoComplete="street-address"
                value={utkast.adresse}
                onChange={(e) => oppdater({ adresse: e.target.value })}
                feil={feil.adresse}
              />
            </div>
          </Steg>
        )}

        {steg === 4 && (
          <Steg tittel="Hva er budsjettet ditt?" refH={overskrift}>
            <div className="flex flex-col gap-4">
              <div className="relative">
                <TekstFelt
                  etikett="Beløp i kroner"
                  inputMode="numeric"
                  value={utkast.budsjett}
                  onChange={(e) => oppdater({ budsjett: e.target.value.replace(/[^\d]/g, '') })}
                  feil={feil.budsjett}
                  className="tall pr-12 text-lg font-semibold"
                />
                <span className="pointer-events-none absolute top-[2.4rem] right-4 text-ink-3" aria-hidden>
                  kr
                </span>
              </div>
              {prisintervall && (
                <div className="flex gap-3 rounded-2xl bg-navy-50 p-4 text-sm text-ink-2">
                  <Info size={18} className="mt-0.5 shrink-0 text-navy" aria-hidden />
                  <p>
                    Vanlig pris:{' '}
                    <strong className="tall text-ink">
                      {kr(prisintervall.min)}–{kr(prisintervall.maks)}
                    </strong>
                  </p>
                </div>
              )}
            </div>
          </Steg>
        )}

        {steg === 5 && utkast.kategori && utkast.hastegrad && (
          <Steg tittel="Se over og send" refH={overskrift}>
            <dl className="divide-y divide-line overflow-hidden rounded-2xl bg-white ring-1 ring-line">
              <Rad etikett="Kategori" onEndre={() => settSteg(0)}>
                {kategori(utkast.kategori).navn}
              </Rad>
              <Rad etikett="Oppdrag" onEndre={() => settSteg(1)}>
                <span className="font-semibold">{utkast.tittel}</span>
                <span className="mt-0.5 block text-ink-2">{utkast.beskrivelse}</span>
                {utkast.bilder.length > 0 && (
                  <span className="mt-2 flex gap-2">
                    {utkast.bilder.map((b, i) => (
                      <img key={i} src={b} alt={`Vedlagt bilde ${i + 1}`} className="size-14 rounded-lg object-cover" />
                    ))}
                  </span>
                )}
              </Rad>
              <Rad etikett="Hastegrad" onEndre={() => settSteg(2)}>
                {HASTEGRAD_TEKST[utkast.hastegrad]}
              </Rad>
              <Rad etikett="Sted" onEndre={() => settSteg(3)}>
                {stedNavn(STEDER[utkast.stedIndeks])} · {utkast.adresse}
              </Rad>
            </dl>
            <div className="mt-4 flex gap-4 rounded-2xl bg-amber-50 p-4 ring-1 ring-amber/50 sm:p-5">
              <Segl storrelse={48} />
              <div>
                <p className="text-sm font-semibold text-amber-ink">Reserveres nå</p>
                <p className="tall font-display text-2xl font-extrabold text-navy">{kr(Number(utkast.budsjett))}</p>
                <p className="mt-1 text-sm text-ink-2">
                  Utbetales først når du godkjenner jobben.{' '}
                  <button type="button" onClick={() => settSteg(4)} className="font-semibold text-navy underline">
                    Endre beløp
                  </button>
                </p>
              </div>
            </div>
          </Steg>
        )}

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
          {steg > 0 ? (
            <Knapp variant="tekst" onClick={() => settSteg((s) => s - 1)} ikon={<ArrowLeft size={18} aria-hidden />} disabled={sender}>
              Tilbake
            </Knapp>
          ) : (
            <span className="hidden sm:block" />
          )}
          {steg < STEG.length - 1 ? (
            <Knapp type="submit" storrelse="lg" className="w-full sm:w-auto">
              Neste <ArrowRight size={18} aria-hidden />
            </Knapp>
          ) : (
            <Knapp type="submit" variant="aksent" storrelse="lg" className="w-full sm:w-auto" laster={sender}>
              {sender ? 'Reserverer beløpet …' : `Send og reserver ${kr(Number(utkast.budsjett))}`}
            </Knapp>
          )}
        </div>
      </form>
    </div>
  )
}

function Fremdrift({ steg, onGaTil }: { steg: number; onGaTil: (i: number) => void }) {
  return (
    <nav aria-label="Fremdrift">
      <p className="text-sm font-semibold text-ink-3">
        Steg <span className="tall text-ink">{steg + 1}</span> av {STEG.length}
        <span className="sr-only">: {STEG[steg]}</span>
      </p>
      <ol className="mt-2 flex gap-1.5">
        {STEG.map((navn, i) => (
          <li key={navn} className="flex-1">
            <button
              type="button"
              onClick={() => onGaTil(i)}
              disabled={i >= steg}
              aria-current={i === steg ? 'step' : undefined}
              className="group block w-full py-1 disabled:cursor-default"
            >
              <span
                className={`block h-1.5 rounded-full transition-colors duration-300 ${
                  i < steg ? 'bg-navy group-hover:bg-navy-600' : i === steg ? 'bg-amber' : 'bg-cream-300'
                }`}
              />
              <span className={`mt-1.5 hidden text-left text-xs sm:block ${i === steg ? 'font-semibold text-ink' : 'text-ink-3'}`}>
                {navn}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  )
}

function Steg({
  tittel,
  undertekst,
  refH,
  children,
}: {
  tittel: string
  undertekst?: string
  refH: React.RefObject<HTMLHeadingElement | null>
  children: ReactNode
}) {
  return (
    <section className="animer-inn" aria-labelledby="steg-tittel">
      <h1 id="steg-tittel" ref={refH} tabIndex={-1} className="text-[1.75rem] leading-tight font-extrabold text-navy focus:outline-none sm:text-[2.125rem]">
        {tittel}
      </h1>
      {undertekst && <p className="mt-2 mb-6 text-[0.9375rem] text-ink-2">{undertekst}</p>}
      {!undertekst && <div className="mb-6" />}
      {children}
    </section>
  )
}

function FeilTekst({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} role="alert" className="mt-3 text-sm font-medium text-feil">
      {children}
    </p>
  )
}

function Rad({ etikett, onEndre, children }: { etikett: string; onEndre: () => void; children: ReactNode }) {
  return (
    <div className="flex gap-4 px-4 py-3.5 sm:px-5">
      <dt className="w-24 shrink-0 text-sm text-ink-3">{etikett}</dt>
      <dd className="min-w-0 flex-1 text-[0.9375rem] text-ink">{children}</dd>
      <dd>
        <button type="button" onClick={onEndre} className="text-sm font-semibold text-navy underline-offset-2 hover:underline">
          Endre<span className="sr-only"> {etikett.toLowerCase()}</span>
        </button>
      </dd>
    </div>
  )
}

function BildeOpplasting({
  bilder,
  onEndre,
  feil,
  settFeil,
}: {
  bilder: string[]
  onEndre: (b: string[]) => void
  feil?: string
  settFeil: (m?: string) => void
}) {
  const [laster, settLaster] = useState(false)
  const input = useRef<HTMLInputElement>(null)

  async function velg(filer: FileList | null) {
    if (!filer?.length) return
    const plass = MAKS_BILDER - bilder.length
    if (plass <= 0) {
      settFeil(`Maks ${MAKS_BILDER} bilder.`)
      return
    }
    settLaster(true)
    settFeil(undefined)
    try {
      const nye = await Promise.all(Array.from(filer).slice(0, plass).map((f) => lagMiniatyr(f)))
      onEndre([...bilder, ...nye])
      if (filer.length > plass) settFeil(`Maks ${MAKS_BILDER} bilder.`)
    } catch (e) {
      settFeil(e instanceof Error ? `${e.message}.` : 'Bildet kunne ikke leses.')
    } finally {
      settLaster(false)
      if (input.current) input.current.value = ''
    }
  }

  return (
    <div>
      <p className="text-sm font-semibold text-ink">
        Bilder <span className="font-normal text-ink-3">(valgfritt, maks {MAKS_BILDER})</span>
      </p>
      <div className="mt-2.5 flex flex-wrap gap-2.5">
        {bilder.map((b, i) => (
          <div key={i} className="relative">
            <img src={b} alt={`Vedlagt bilde ${i + 1}`} className="size-24 rounded-xl object-cover ring-1 ring-line" />
            <button
              type="button"
              onClick={() => onEndre(bilder.filter((_, j) => j !== i))}
              className="absolute -top-2 -right-2 grid size-7 place-items-center rounded-full bg-navy text-cream shadow-kort hover:bg-navy-700"
              aria-label={`Fjern bilde ${i + 1}`}
            >
              <X size={14} aria-hidden />
            </button>
          </div>
        ))}
        {bilder.length < MAKS_BILDER && (
          <label className="grid size-24 cursor-pointer place-items-center rounded-xl border-2 border-dashed border-line-strong bg-white text-navy transition-colors hover:border-navy-600 hover:bg-navy-50 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-navy-600">
            <input
              ref={input}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(e) => velg(e.target.files)}
              aria-describedby={feil ? 'bilde-feil' : undefined}
            />
            <span className="flex flex-col items-center gap-1 text-xs font-semibold">
              {laster ? (
                <span className="size-5 animate-spin rounded-full border-2 border-navy border-r-transparent" aria-hidden />
              ) : (
                <ImagePlus size={22} aria-hidden />
              )}
              {laster ? 'Laster …' : 'Legg til bilde'}
            </span>
          </label>
        )}
      </div>
      {feil && (
        <p id="bilde-feil" role="alert" className="mt-2 text-sm font-medium text-feil">
          {feil}
        </p>
      )}
    </div>
  )
}
