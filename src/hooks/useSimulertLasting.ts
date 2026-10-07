import { useEffect, useState } from 'react'

/** Gir en kort, kunstig lastetid slik at skjelett-tilstander kan vises i demoen. */
export function useSimulertLasting(ms = 450): boolean {
  const [laster, settLaster] = useState(true)
  useEffect(() => {
    const t = window.setTimeout(() => settLaster(false), ms)
    return () => window.clearTimeout(t)
  }, [ms])
  return laster
}
