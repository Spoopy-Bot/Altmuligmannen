import { BatteryFull, Signal, Wifi } from 'lucide-react'
import { useEffect, useState } from 'react'

/** iPhone 15 i logiske punkter. */
const SKJERM_B = 393
const SKJERM_H = 852
const RAMME = 12
const TOTAL_B = SKJERM_B + RAMME * 2
const TOTAL_H = SKJERM_H + RAMME * 2

function bregnSkala() {
  return Math.min(1, (window.innerWidth - 24) / TOTAL_B, (window.innerHeight - 24) / TOTAL_H)
}

/** Viser appen inne i en iPhone 15. Appen kjører i en iframe, så den får ekte mobilbredde og -breakpoints. */
export function Telefonramme() {
  const [skala, settSkala] = useState(bregnSkala)
  // Bare første adresse brukes som src. Appen i rammen oppdaterer adressefeltet selv.
  const [src] = useState(() => window.location.pathname + window.location.search + window.location.hash)

  useEffect(() => {
    const oppdater = () => settSkala(bregnSkala())
    window.addEventListener('resize', oppdater)
    return () => window.removeEventListener('resize', oppdater)
  }, [])

  return (
    <div className="grid min-h-dvh place-items-center overflow-hidden bg-[radial-gradient(ellipse_at_50%_30%,#234a6b_0%,#0c1c2b_70%)]">
      <div style={{ width: TOTAL_B * skala, height: TOTAL_H * skala }}>
        <div className="relative origin-top-left" style={{ width: TOTAL_B, height: TOTAL_H, transform: `scale(${skala})` }}>
          {/* Sideknapper */}
          {[
            { side: '-left-[3px]', topp: 118, h: 30 },
            { side: '-left-[3px]', topp: 178, h: 56 },
            { side: '-left-[3px]', topp: 248, h: 56 },
            { side: '-right-[3px]', topp: 200, h: 92 },
          ].map((k) => (
            <span key={k.topp} className={`absolute ${k.side} w-[4px] rounded-sm bg-[#2b2b2e]`} style={{ top: k.topp, height: k.h }} aria-hidden />
          ))}

          <div className="size-full rounded-[68px] bg-[#1c1c1e] p-[12px] shadow-[0_0_0_1.5px_#3a3a3c_inset,0_30px_60px_-20px_rgb(0_0_0/0.7)]">
            <div className="relative overflow-hidden rounded-[56px] bg-cream" style={{ width: SKJERM_B, height: SKJERM_H }}>
              <iframe src={src} title="Altmuligmannen" className="size-full border-0" />

              <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[54px] text-white" aria-hidden>
                <span className="absolute top-[18px] left-[50px] text-[17px] leading-none font-semibold tracking-tight">9:41</span>
                <span className="absolute top-[17px] right-[44px] flex items-center gap-1.5">
                  <Signal size={17} strokeWidth={2.4} />
                  <Wifi size={17} strokeWidth={2.4} />
                  <BatteryFull size={24} strokeWidth={1.8} />
                </span>
                <span className="absolute top-[11px] left-1/2 h-[37px] w-[126px] -translate-x-1/2 rounded-full bg-black" />
              </div>

              <span
                className="pointer-events-none absolute bottom-2 left-1/2 z-10 h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-ink/85"
                aria-hidden
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
