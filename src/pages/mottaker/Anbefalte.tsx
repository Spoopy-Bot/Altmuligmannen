import { ArrowRight, Check, Info, Repeat, Search, Send, UsersRound } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { AktorKort } from '../../components/domain/AktorKort'
import { EscrowMerke } from '../../components/domain/EscrowSegl'
import { Knapp, KnappLenke } from '../../components/ui/Knapp'
import { Sidehode } from '../../components/ui/Sidehode'
import { SkjelettListe } from '../../components/ui/Skjelett'
import { TomTilstand } from '../../components/ui/TomTilstand'
import { useSimulertLasting } from '../../hooks/useSimulertLasting'
import { fornavn, kr } from '../../lib/format'
import { anbefalAktorer } from '../../lib/matching'
import { finnAktor } from '../../lib/utvalg'
import { useDemo } from '../../store/context'
import { IkkeFunnet } from '../felles/IkkeFunnet'

export function Anbefalte() {
  const { id } = useParams()
  const { state, dispatch } = useDemo()
  const navigate = useNavigate()
  const laster = useSimulertLasting(900)
  const [sender, settSender] = useState<string | null>(null)
  const oppdrag = state.oppdrag.find((o) => o.id === id)

  if (!oppdrag || oppdrag.mottakerId !== state.aktivMottakerId) return <IkkeFunnet hva="Oppdraget" />

  const sendtTil = oppdrag.status === 'forespurt' ? finnAktor(state, oppdrag.aktorId) : undefined
  const topp = anbefalAktorer(oppdrag, state.aktorer, state.ratings, oppdrag.avslattAv).slice(0, 3)

  function send(aktorId: string) {
    settSender(aktorId)
    window.setTimeout(() => {
      dispatch({ type: 'send-foresporsel', oppdragId: oppdrag!.id, aktorId })
      settSender(null)
    }, 600)
  }

  if (sendtTil) {
    return (
      <div className="max-w-xl">
        <div className="animer-inn rounded-3xl bg-white p-6 text-center shadow-kort ring-1 ring-line sm:p-10">
          <span className="animer-stempel mx-auto grid size-16 place-items-center rounded-[var(--radius-ikon)] bg-navy text-amber">
            <Check size={32} strokeWidth={2.6} aria-hidden />
          </span>
          <h1 className="mt-5 text-[1.75rem] leading-tight font-extrabold text-navy">Sendt til {fornavn(sendtTil.navn)}</h1>
          <p className="mt-2 text-ink-2">{fornavn(sendtTil.navn)} har fått varsel og ser at pengene er reservert.</p>
          <div className="mt-4 flex justify-center">
            <EscrowMerke betaling={oppdrag.betaling} />
          </div>
          <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
            <KnappLenke to={`/oppdrag/${oppdrag.id}`} variant="sekundar">
              Se oppdraget
            </KnappLenke>
            <Knapp
              ikon={<Repeat size={18} aria-hidden />}
              onClick={() => {
                dispatch({ type: 'sett-persona', rolle: 'aktor', id: sendtTil.id })
                navigate('/varsler')
              }}
            >
              Vis som {fornavn(sendtTil.navn)}
            </Knapp>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <Sidehode
        tittel="Anbefalt for deg"
        undertekst={
          <span className="flex flex-wrap items-center gap-2">
            <Link to={`/oppdrag/${oppdrag.id}`} className="font-semibold text-ink hover:underline">
              {oppdrag.tittel}
            </Link>
            <EscrowMerke betaling={oppdrag.betaling} />
          </span>
        }
      />

      {laster ? (
        <SkjelettListe antall={3} hoyde="h-56" etikett="Finner aktører i nærheten" />
      ) : topp.length === 0 ? (
        <TomTilstand
          ikon={<UsersRound size={24} aria-hidden />}
          tittel="Ingen ledige i denne kategorien"
          handling={<KnappLenke to="/aktorer" ikon={<Search size={18} aria-hidden />}>Se alle aktører</KnappLenke>}
        >
          Pengene er fortsatt reservert.
        </TomTilstand>
      ) : (
        <ol className="flex flex-col gap-4">
          {topp.map((m, i) => (
            <li key={m.aktor.id} className="animer-inn" style={{ animationDelay: `${i * 70}ms` }}>
              <AktorKort
                aktor={m.aktor}
                avstand={m.avstand}
                rating={{ snitt: m.ratingSnitt, antall: m.antallVurderinger }}
                lenke={`/aktorer/${m.aktor.id}?oppdrag=${oppdrag.id}`}
                valgt={i === 0}
                kompakt
              >
                <ul className="flex flex-col gap-1 border-t border-line pt-3" aria-label={`Hvorfor ${fornavn(m.aktor.navn)} passer`}>
                  {m.grunner.slice(0, 3).map((g) => (
                    <li key={g} className="flex gap-2 text-sm text-ink">
                      <Check size={16} className="mt-0.5 shrink-0 text-ok" strokeWidth={2.5} aria-hidden />
                      {g}
                    </li>
                  ))}
                  {m.overBudsjett && (
                    <li className="flex gap-2 text-sm text-ink-3">
                      <Info size={16} className="mt-0.5 shrink-0" aria-hidden />
                      Vanlig pris ca. {kr(m.estimertPris)}, over budsjettet
                    </li>
                  )}
                </ul>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Knapp
                    variant={i === 0 ? 'aksent' : 'primar'}
                    onClick={() => send(m.aktor.id)}
                    laster={sender === m.aktor.id}
                    disabled={sender !== null}
                    ikon={<Send size={17} aria-hidden />}
                  >
                    Send forespørsel
                  </Knapp>
                  <KnappLenke variant="tekst" to={`/aktorer/${m.aktor.id}?oppdrag=${oppdrag.id}`}>
                    Se profil <ArrowRight size={16} aria-hidden />
                  </KnappLenke>
                </div>
              </AktorKort>
            </li>
          ))}
        </ol>
      )}

      {!laster && topp.length > 0 && (
        <p className="mt-6 text-center text-sm">
          <Link to={`/aktorer?oppdrag=${oppdrag.id}&kategori=${oppdrag.kategori}`} className="font-semibold text-navy underline">
            Se alle aktører
          </Link>
        </p>
      )}
    </div>
  )
}
