import { Bell } from 'lucide-react'
import { useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import ikon from '../../assets/ikon-160.png'
import wordmark from '../../assets/wordmark-lys.png'
import { uleste } from '../../lib/utvalg'
import { useDemo } from '../../store/context'
import { DemoPanel } from './DemoPanel'
import { HJEM, NAV } from './navigasjon'

function Varselbjelle() {
  const { state, megId } = useDemo()
  const antall = uleste(state, megId)
  return (
    <NavLink
      to="/varsler"
      aria-label={antall ? `Varsler, ${antall} uleste` : 'Varsler'}
      className={({ isActive }) =>
        `relative grid size-10 place-items-center rounded-xl text-cream ring-1 transition-colors hover:bg-white/14 ${
          isActive ? 'bg-white/14 ring-white/30' : 'ring-white/15'
        }`
      }
    >
      <Bell size={20} strokeWidth={1.9} aria-hidden />
      {antall > 0 && (
        <span
          key={antall}
          className="animer-stempel absolute -top-1.5 -right-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-feil px-1 text-[0.6875rem] font-bold text-white ring-2 ring-navy"
          aria-hidden
        >
          {antall > 9 ? '9+' : antall}
        </span>
      )}
    </NavLink>
  )
}

export function AppSkall() {
  const { state } = useDemo()
  const { pathname } = useLocation()
  const rolle = state.rolle ?? 'mottaker'
  const punkter = NAV[rolle]

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="min-h-dvh">
      <a
        href="#innhold"
        className="sr-only z-[60] rounded-lg bg-amber px-4 py-2 font-semibold text-navy-950 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Hopp til innhold
      </a>
      <header data-mork className="sticky top-0 z-40 bg-navy text-cream shadow-[0_1px_0_rgb(0_0_0/0.2)]">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Link to={HJEM[rolle]} className="flex shrink-0 items-center gap-2.5 rounded-lg" aria-label="Altmuligmannen, til forsiden">
            <img src={ikon} alt="" className="size-9 rounded-[22%] ring-1 ring-white/10" />
            <img src={wordmark} alt="" className="h-7 w-auto" />
          </Link>

          <nav aria-label="Hovedmeny" className="ml-4 hidden flex-1 md:block">
            <ul className="flex items-center gap-1">
              {punkter.map((p) => (
                <li key={p.til}>
                  <NavLink
                    to={p.til}
                    className={({ isActive }) =>
                      `relative flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors ${
                        isActive
                            ? 'bg-white/12 text-cream'
                            : 'text-navy-200 hover:bg-white/8 hover:text-cream'
                      }`
                    }
                  >
                    <p.ikon size={17} aria-hidden />
                    {p.tekst}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Varselbjelle />
            <DemoPanel />
          </div>
        </div>
      </header>

      <main id="innhold" className="mx-auto max-w-6xl px-4 pt-6 pb-32 sm:px-6 sm:pt-8 md:pb-16">
        <Outlet />
      </main>

      <nav
        aria-label="Hovedmeny"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        <ul className="mx-auto flex max-w-lg">
          {punkter.map((p) => (
            <li key={p.til} className="flex-1">
              <NavLink
                to={p.til}
                className={({ isActive }) =>
                  `flex h-16 flex-col items-center justify-center gap-1 text-[0.6875rem] font-semibold transition-colors ${
                    isActive ? 'text-navy' : 'text-ink-3 hover:text-navy'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`grid h-8 w-12 place-items-center rounded-xl transition-colors ${
                        p.fremhevet ? 'bg-navy text-cream' : isActive ? 'bg-navy-100' : ''
                      }`}
                    >
                      <p.ikon size={20} strokeWidth={isActive ? 2.2 : 1.8} aria-hidden />
                    </span>
                    <span className="leading-none">{p.tekst}</span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
