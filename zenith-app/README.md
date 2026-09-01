# Zenith

Zenith is a Next.js decision-support application for Indian rooftop-solar planning. It combines deterministic feasibility calculations, subsidy estimates, investment projections, AI explanations, bill-image parsing, and a rooftop visualization workflow.

## Launch status

The application is suitable for a controlled private beta when the required environment variables are configured. It is not yet a complete multi-tenant paid SaaS: billing, durable user accounts, installer lead routing, and persistent project storage still need to be connected before accepting public subscriptions.

The current deployment model is intentionally small and explicit:

- Next.js App Router with server API routes
- HMAC-signed, HTTP-only session cookie authentication
- Gemini API for optional AI-assisted parsing and explanations
- Browser session storage for the handoff between feasibility modules
- Deterministic TypeScript financial and solar calculations
- In-memory rate limits suitable for one instance, not a multi-region deployment

## Decision studio experience

- The public landing page includes a keyboard-operable bill slider and presets. Its outputs use the existing deterministic calculator, with fixed sample assumptions and no subsidy. The sample bill can be carried through sign-in into a new feasibility draft.
- A five-tool explorer supports arrow keys, Home and End. Workspace search opens with Ctrl/Cmd+K and closes with Escape. Dialogs use native modal focus management.
- `/dashboard` shares the server-protected workspace layout. The workspace includes browser-local project search, payback sorting, project focus and a six-destination mobile navigation bar.
- Backups are portable JSON. Restore deduplicates IDs, retains newer local versions and does not evict existing snapshots when the 12-project library is full. Snapshot deletion requires a separate confirmation and does not remove other tool drafts.
- Feasibility results explicitly flag changed inputs. Rebuild the estimate before forwarding changed assumptions to the investment model.
- Imported investment scenarios are identified separately from commercial presets, and fractional rooftop sizes are retained by the controls. The investment view explicitly distinguishes imported size/tariff inputs from its separate financing, tax and operating assumptions.
- Motion honors the reduced-motion media preference. The visual system uses local SVG/CSS artwork and system fonts, with no external font or image request needed for the landing experience.

## Requirements

- Node.js 20.9 or newer
- npm 10 or newer
- A Gemini API key for AI-assisted features (the deterministic calculators do not require it)

## Local setup

From this directory:

```bash
npm ci
cp .env.example .env.local
```

On PowerShell, use `Copy-Item .env.example .env.local` instead of `cp`.

Set these values in `.env.local`:

```env
GEMINI_API_KEY=your-gemini-key
ZENITH_AUTH_EMAIL=admin@example.com
ZENITH_AUTH_PASSWORD=use-a-long-random-password
ZENITH_SESSION_SECRET=use-at-least-32-random-characters
```

Generate a session secret with Node rather than reusing a password:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Start development mode:

```bash
npm run dev
```

Open `http://localhost:3000`. The dashboard and feature APIs require the configured account. There are no fallback credentials.

## Production verification

Run the same checks used before deployment:

```bash
npm run typecheck
npm run test:studio
npm run lint
npm run build
npm run audit:runtime
```

`typecheck` regenerates the current production route definitions before checking the app. Generated development route artifacts are excluded so a stale local dev cache cannot invalidate a route move; application source and the current production route validator remain checked.

`test:studio` covers the public slider range, handoff URL safety, storage failures, backup round-trips, duplicate/newer snapshot handling and full-library restore behavior. These deterministic tests complement, rather than replace, browser checks of sign-in, mobile layouts, keyboard navigation and the first-project flow.

Start the production server locally with:

```bash
npm start
```

`npm run audit:runtime` may return a non-zero exit code when upstream production dependencies have advisories. Treat that as a release decision, not as a check to suppress. Review the advisory, update the lockfile, and retest before a public launch.

## Vercel deployment

1. Configure the Vercel project root as `zenith-app`.
2. Add `GEMINI_API_KEY`, `ZENITH_AUTH_EMAIL`, `ZENITH_AUTH_PASSWORD`, and `ZENITH_SESSION_SECRET` to the Production environment.
3. Use a unique random session secret and a strong non-default password.
4. Deploy with the standard Next.js build command, `npm run build`.
5. Smoke-test login, bill parsing, each protected API, the Service 1 → Service 2 handoff, the subsidy explanation, and rooftop scanning.

Never put `ZENITH_AUTH_PASSWORD`, `ZENITH_SESSION_SECRET`, or `GEMINI_API_KEY` in client-side code, a committed `.env` file, screenshots, or support tickets.

## Product boundaries to resolve before public monetization

- Replace the single configured account with a real identity provider and durable user/project storage.
- Add a payment provider, subscription state, webhook handling, cancellation, tax invoices, and entitlement checks. The landing page currently previews the Pro workflow instead of pretending a payment was completed.
- Move rate limiting to a managed store such as Redis or an edge provider before scaling beyond one application instance.
- Replace the static subsidy registry with versioned policy data and show the policy effective date and source for each estimate.
- Treat rooftop video analysis as a preliminary estimate. It extracts one frame and must not be marketed as a structural or electrical site survey.
- Add installer lead consent, retention, deletion, and audit controls before routing customer data to third parties.

## Security controls currently in place

- No hardcoded login credentials
- Server-side dashboard redirect and protected feature APIs
- HTTP-only, Secure-in-production, SameSite session cookie
- Bounded and validated JSON inputs
- Image size/type validation and structured AI-output validation
- Per-IP in-memory request limits on authentication and expensive AI endpoints
- Same-origin checks on state-changing authentication and analysis requests
- Explicit failure responses instead of guessed bill amounts or simulated successful AI analysis

## Repository notes

The large `app/(dashboard)/service4/RooftopAnimations.tsx` file is a legacy visualization module and remains the main lint hotspot. The production build and TypeScript checks are the release gates while that module is gradually decomposed.
