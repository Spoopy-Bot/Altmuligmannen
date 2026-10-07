export function nyId(prefiks: string): string {
  return `${prefiks}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}
