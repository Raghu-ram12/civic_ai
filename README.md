# SmartCivic

A complete, browser-based SmartCivic demo for the AI-driven civic grievance platform. It is hackathon-ready and works without credentials or external services.

## Run locally

Use Node 20+ and pnpm:

```bash
pnpm install
pnpm dev
```

Create a production build with `pnpm build`.

## Included experience

- Citizen and officer portals, switchable from the top navigation
- Citizen dashboard, report form, photo preview, category selection, GPS-style location capture, and complaint tracking
- Automatic department/severity routing simulation, ticket generation, toast confirmation, and persisted data via browser local storage
- Complaint details with an end-to-end status timeline
- Officer dashboard, workload analytics, status filters, assignment/start-work controls, and mark-resolved workflow
- Responsive desktop and mobile layouts

## Important demo note

The full interaction flow runs locally in the browser; data is saved in local storage so reports and status changes remain after refresh. A production deployment would replace this local store with a secured backend, real authentication, image storage, GPS/maps, and a server-side AI service. Never put an OpenAI key in `VITE_OPENAI_API_KEY`, because browser variables are public.

## Deployment

For Vercel, import the repository and use the default Vite build settings: build command `pnpm build`, output directory `dist`.
