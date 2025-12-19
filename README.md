# Pawsville Prompt Frankensteiner (React)

Production-ready React port of the single-file HTML/CSS/JS prototype, built with **Vite + React** and ready to deploy on **Vercel**.

## Scripts

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`

## Project structure

- `src/components/`
  - `Layout.jsx`: sticky header + 2-column grid
  - `SetupPanel.jsx`: Global Settings, Prompt Structure ordering, Characters
  - `BuilderPanel.jsx`: Batch + Single prompt generation + result cards
  - `Accordion.jsx`: reusable collapsible UI
  - `SortableList.jsx`: move up/down ordering list
- `src/hooks/`
  - `usePawsvilleState.js`: reducer-driven state + localStorage (v4 → v5 migration)
  - `useToast.jsx`: toast notifications
- `src/utils/`
  - `promptBuilder.js`: assembles the final prompt (order-aware)
  - `clipboard.js`: copy-to-clipboard with fallback

## Vercel deployment

Deploy as a standard Vite SPA:
- **Build command**: `npm run build`
- **Output directory**: `dist`
