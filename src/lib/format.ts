const kroner = new Intl.NumberFormat('nb-NO', { maximumFractionDigits: 0 })

export function kr(belop: number): string {
  return `${kroner.format(belop)} kr`
}

const datoKort = new Intl.DateTimeFormat('nb-NO', { day: 'numeric', month: 'short' })
const datoLang = new Intl.DateTimeFormat('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' })
const klokke = new Intl.DateTimeFormat('nb-NO', { hour: '2-digit', minute: '2-digit' })

export function dato(iso: string): string {
  return datoKort.format(new Date(iso))
}

export function datoMedAr(iso: string): string {
  return datoLang.format(new Date(iso))
}

export function klokkeslett(iso: string): string {
  return klokke.format(new Date(iso))
}

/** «nå», «12 min siden», «i går», ellers dato. */
export function relativTid(iso: string, na: Date = new Date()): string {
  const diffMin = Math.round((na.getTime() - new Date(iso).getTime()) / 60000)
  if (diffMin < 1) return 'nå'
  if (diffMin < 60) return `${diffMin} min siden`
  const diffTimer = Math.round(diffMin / 60)
  if (diffTimer < 24) return `${diffTimer} t siden`
  if (diffTimer < 48) return 'i går'
  return dato(iso)
}

export function km(avstand: number): string {
  return `${avstand.toLocaleString('nb-NO', { maximumFractionDigits: 1, minimumFractionDigits: avstand < 10 ? 1 : 0 })} km`
}

export function initialer(navn: string): string {
  const deler = navn.trim().split(/\s+/)
  return ((deler[0]?.[0] ?? '') + (deler.length > 1 ? deler[deler.length - 1][0] : '')).toUpperCase()
}

export function fornavn(navn: string): string {
  return navn.split(' ')[0]
}

export function snitt(tall: number[]): number {
  return tall.length ? tall.reduce((a, b) => a + b, 0) / tall.length : 0
}

export function desimal(tall: number): string {
  return tall.toLocaleString('nb-NO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
}
