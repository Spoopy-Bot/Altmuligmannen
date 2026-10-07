import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router'

type Variant = 'primar' | 'aksent' | 'sekundar' | 'tekst' | 'tekstMork' | 'fare'
type Storrelse = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-[background-color,box-shadow,transform,color] duration-150 ease-out active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 disabled:active:translate-y-0 select-none whitespace-nowrap'

const varianter: Record<Variant, string> = {
  primar: 'bg-navy text-cream shadow-[0_1px_0_rgb(255_255_255/0.08)_inset,0_2px_6px_-2px_rgb(12_28_43/0.5)] hover:bg-navy-700',
  aksent: 'bg-amber text-navy-950 shadow-[0_2px_6px_-2px_rgb(92_59_0/0.45)] hover:bg-amber-600',
  sekundar: 'bg-white text-navy ring-1 ring-inset ring-navy-200 hover:bg-navy-50 hover:ring-navy-600/40',
  tekst: 'text-navy hover:bg-navy-50',
  tekstMork: 'text-cream ring-1 ring-inset ring-white/20 hover:bg-white/10',
  fare: 'bg-white text-feil ring-1 ring-inset ring-feil/30 hover:bg-feil-50',
}

const storrelser: Record<Storrelse, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-[0.9375rem]',
  lg: 'h-13 px-6 text-base',
}

function klasser(variant: Variant, storrelse: Storrelse, bred?: boolean, ekstra?: string) {
  return [base, varianter[variant], storrelser[storrelse], bred ? 'w-full' : '', ekstra ?? ''].join(' ')
}

interface Felles {
  variant?: Variant
  storrelse?: Storrelse
  bred?: boolean
  ikon?: ReactNode
}

export function Knapp({
  variant = 'primar',
  storrelse = 'md',
  bred,
  ikon,
  className,
  children,
  laster,
  ...rest
}: Felles & ButtonHTMLAttributes<HTMLButtonElement> & { laster?: boolean }) {
  return (
    <button
      type="button"
      className={klasser(variant, storrelse, bred, className)}
      aria-busy={laster || undefined}
      disabled={rest.disabled || laster}
      {...rest}
    >
      {laster ? (
        <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden />
      ) : (
        ikon
      )}
      {children}
    </button>
  )
}

export function KnappLenke({ variant = 'primar', storrelse = 'md', bred, ikon, className, children, ...rest }: Felles & LinkProps) {
  return (
    <Link className={klasser(variant, storrelse, bred, className)} {...rest}>
      {ikon}
      {children}
    </Link>
  )
}
