import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'

const kontroll =
  'w-full rounded-xl border bg-white px-3.5 text-[0.9375rem] text-ink placeholder:text-ink-3 transition-[border-color,box-shadow] duration-150 focus:outline-none focus-visible:outline-none focus:border-navy focus:ring-3 focus:ring-navy/15 aria-[invalid=true]:border-feil aria-[invalid=true]:ring-feil/15 disabled:bg-cream-200'

interface FeltRamme {
  etikett: string
  hjelp?: ReactNode
  feil?: string
  valgfri?: boolean
}

function Ramme({
  id,
  etikett,
  hjelp,
  feil,
  valgfri,
  children,
}: FeltRamme & { id: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {etikett}
        {valgfri && <span className="ml-1.5 font-normal text-ink-3">(valgfritt)</span>}
      </label>
      {hjelp && (
        <p id={`${id}-hjelp`} className="-mt-0.5 text-sm text-ink-3">
          {hjelp}
        </p>
      )}
      {children}
      {feil && (
        <p id={`${id}-feil`} className="text-sm font-medium text-feil">
          {feil}
        </p>
      )}
    </div>
  )
}

function beskrevet(id: string, hjelp?: ReactNode, feil?: string) {
  return [hjelp ? `${id}-hjelp` : '', feil ? `${id}-feil` : ''].filter(Boolean).join(' ') || undefined
}

export function TekstFelt({ etikett, hjelp, feil, valgfri, className, ...rest }: FeltRamme & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId()
  return (
    <Ramme id={id} etikett={etikett} hjelp={hjelp} feil={feil} valgfri={valgfri}>
      <input
        id={id}
        className={`${kontroll} h-12 ${feil ? 'border-feil' : 'border-line-strong'} ${className ?? ''}`}
        aria-invalid={feil ? true : undefined}
        aria-describedby={beskrevet(id, hjelp, feil)}
        {...rest}
      />
    </Ramme>
  )
}

export function TekstOmrade({ etikett, hjelp, feil, valgfri, ...rest }: FeltRamme & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId()
  return (
    <Ramme id={id} etikett={etikett} hjelp={hjelp} feil={feil} valgfri={valgfri}>
      <textarea
        id={id}
        className={`${kontroll} min-h-32 py-3 leading-relaxed ${feil ? 'border-feil' : 'border-line-strong'}`}
        aria-invalid={feil ? true : undefined}
        aria-describedby={beskrevet(id, hjelp, feil)}
        {...rest}
      />
    </Ramme>
  )
}

export function Velger({ etikett, hjelp, feil, valgfri, children, ...rest }: FeltRamme & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId()
  return (
    <Ramme id={id} etikett={etikett} hjelp={hjelp} feil={feil} valgfri={valgfri}>
      <select
        id={id}
        className={`${kontroll} h-12 appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%2317334c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m4 6 4 4 4-4'/%3E%3C/svg%3E")] bg-[position:right_0.9rem_center] bg-no-repeat pr-10 ${feil ? 'border-feil' : 'border-line-strong'}`}
        aria-invalid={feil ? true : undefined}
        aria-describedby={beskrevet(id, hjelp, feil)}
        {...rest}
      >
        {children}
      </select>
    </Ramme>
  )
}
