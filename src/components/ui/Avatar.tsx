import { initialer } from '../../lib/format'

const FARGER = [
  'bg-[#dce6f0] text-[#17334c]',
  'bg-[#fce8c2] text-[#5c3b00]',
  'bg-[#dfece3] text-[#1f5a3a]',
  'bg-[#f2e0da] text-[#7a2e1e]',
  'bg-[#e6e1f2] text-[#3d2f73]',
  'bg-[#dcebef] text-[#18525e]',
  'bg-[#f3e6cf] text-[#5e4214]',
  'bg-[#e8e3d8] text-[#4a4032]',
  'bg-[#e0e9dc] text-[#33502a]',
  'bg-[#f0dde6] text-[#6b2747]',
]

const STORRELSER = {
  xs: 'size-7 text-[0.6875rem]',
  sm: 'size-9 text-xs',
  md: 'size-12 text-sm',
  lg: 'size-16 text-lg',
  xl: 'size-24 text-2xl',
}

export function Avatar({ navn, farge, storrelse = 'md' }: { navn: string; farge: number; storrelse?: keyof typeof STORRELSER }) {
  return (
    <span
      className={`inline-grid shrink-0 place-items-center rounded-full font-display font-bold tracking-tight ${FARGER[farge % FARGER.length]} ${STORRELSER[storrelse]}`}
      aria-hidden
    >
      {initialer(navn)}
    </span>
  )
}
