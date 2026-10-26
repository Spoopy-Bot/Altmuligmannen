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
                <span className="absolute top-0 left-0 flex h-[59px] w-[134px] items-center justify-center pt-[3px] text-[17px] leading-none font-semibold tracking-[-0.01em]">
                  9:41
                </span>
                <span className="absolute top-0 right-0 flex h-[59px] w-[134px] items-center justify-center gap-[6px] pt-[3px]">
                  <svg width="19" height="12" viewBox="0 0 19 12" fill="currentColor">
                    <rect x="0" y="7.5" width="3.2" height="4.5" rx="1" />
                    <rect x="5" y="5" width="3.2" height="7" rx="1" />
                    <rect x="10" y="2.5" width="3.2" height="9.5" rx="1" />
                    <rect x="15" y="0" width="3.2" height="12" rx="1" />
                  </svg>
                  <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor">
                    <path d="M8.5 2.3c2.3 0 4.4.9 6 2.4.1.1.3.1.4 0l1.1-1.1c.1-.1.1-.3 0-.4C13.9 1.2 11.3 0 8.5 0S3.1 1.2 1 3.2c-.1.1-.1.3 0 .4l1.1 1.1c.1.1.3.1.4 0 1.600-1.500 3.700-2.400 6-2.400Z" />
                    <path d="M8.5 6.100c1.200 0 2.300.4 3.200 1.200.1.1.3.1.4 0l1.100-1.100c.1-.1.1-.3 0-.4a7.400 7.400 0 0 0-9.400 0c-.1.1-.1.3 0 .4l1.100 1.100c.1.1.3.1.4 0 .9-.8 2-1.200 3.200-1.200Z" />
                    <path d="M8.500 9.800c.6 0 1.100.2 1.500.6.1.1.1.3 0 .4L8.700 12c-.1.1-.3.1-.4 0L7 10.800c-.1-.1-.1-.3 0-.4.400-.4.900-.6 1.500-.6Z" />
                  </svg>
                  <svg width="27" height="13" viewBox="0 0 27 13" fill="none">
                    <rect x="0.5" y="0.5" width="23" height="12" rx="3.800" stroke="currentColor" opacity="0.4" />
                    <rect x="2" y="2" width="20" height="9" rx="2.500" fill="currentColor" />
                    <path d="M25 4.500v4c.800-.3 1.500-1.100 1.500-2s-.7-1.700-1.500-2Z" fill="currentColor" opacity="0.5" />
                  </svg>
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
