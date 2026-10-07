export function SkjelettListe({ antall = 3, hoyde = 'h-28', etikett = 'Laster' }: { antall?: number; hoyde?: string; etikett?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-3">
      <span className="sr-only">{etikett} …</span>
      {Array.from({ length: antall }, (_, i) => (
        <div key={i} className={`skjelett rounded-2xl ${hoyde}`} aria-hidden />
      ))}
    </div>
  )
}
