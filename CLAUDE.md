# Altmuligmannen

A clickable POC for a Norwegian home-help matching app (student project, investor demo). It connects Mottakere (people who need help) with Aktører (local handymen) in Østfold. This is not a production system.

## Stack
- Vite + React 19 + TypeScript (strict) + Tailwind CSS v4 (`@theme` tokens in `src/index.css`) + React Router v7
- No backend. Seed data lives in `src/data/*.json`, and state is kept in `localStorage` (key `altmuligmannen-demo`). Bump `STATE_VERSJON` in `src/store/seed.ts` when the seed shape changes.
- Lint: oxlint (`.oxlintrc.json`, with jsx-a11y)

## Commands
- `npm run dev`: dev server on http://localhost:5173
- `npm run build`: `tsc -b` + vite build. Must pass before you finish.
- `npm run lint`: must be clean before you finish

## Conventions
- All UI copy is Norwegian bokmål. Keep copy **short**: the user explicitly dislikes redundant text.
- Code identifiers are Norwegian (e.g. `oppdrag`, `aktor`, `mottaker`).
- All state changes go through the reducer in `src/store/reducer.ts`. Notifications (`Varsel`) are created there as side effects of actions.
- Matching logic lives in `src/lib/matching.ts` (explainable scores plus `grunner`).
- The escrow seal (`components/domain/EscrowSegl.tsx`) is the signature element. Show payment status wherever a decision is made.
- Brand: navy #17334C (primary), amber #FDAF1C (money held and the main CTA), cream #FBF6E8 (ground). The icon and wordmark are in `src/assets` and `public/brand`.
- Fictional data only: no real people, phone numbers or addresses (streets are named like "Demoveien").
- Product context: `PRODUCT.md`. Design system: `DESIGN.md`.
