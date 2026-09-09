# Frederick Pure Water

A responsive website for Frederick homeowners, with six treatment services, consultation requests, customer reviews, FAQs, and prominent contact links. Built with React, TypeScript, and Vite. The original Sites/Vinext scaffold remains available; Render uses a dedicated portable build and a small Node server.

## Run locally

Use Node 22.16+ and pnpm (the lockfile was produced with pnpm 11).

```sh
corepack enable
pnpm install
pnpm run build:render
node --env-file=.env server.mjs
```

Copy `.env.example` to `.env` first. Open http://localhost:3001. You can leave the email values blank while reviewing the site; submissions will correctly report delivery unavailable.

For editing with hot reload, run `pnpm run dev:render` and run the Node server separately. Vite proxies `/api` to port 3001. The sample DEV_ORIGIN permits the local Vite origin.

## Deploy on Render

1. Push this folder's contents to a GitHub repository. Exclude node_modules, render-dist, and .env files. The repository root should contain render.yaml and package.json.
2. In Render, create a Blueprint from that repository. `render.yaml` configures the Node web service, build, start command, and health check.
3. Enter RESEND_API_KEY and LEAD_FROM_EMAIL when prompted. Verify your sending domain in Resend. LEAD_FROM_EMAIL should be a verified sender such as `Frederick Pure Water <website@frederickpurewater.com>`.
4. Deploy. Submit one real test inquiry yourself and verify receipt at contact@frederickpurewater.com before directing visitors to the website.
5. Add your custom domain in Render and follow its DNS instructions.

Manual Render Web Service settings: build command `corepack enable && pnpm install --frozen-lockfile && pnpm run build:render`; start command `node server.mjs`; health check `/health`. This is a Web Service, not a Static Site, because email delivery uses server-side credentials. Choose your preferred Render plan in the dashboard.

Official references: [Render Node deployment](https://render.com/docs/deploy-node-express-app), [Resend email API](https://resend.com/docs/api-reference/emails/send-email).

## Content to complete before launch

- Business phone: 202 356 2779. Edit `lib/content.ts` if this changes; click-to-call links appear in the header, consultation section, footer, and mobile contact bar.
- One supplied review is published without a name or star rating. Nine clearly labeled review slots remain. Replace slots with actual approved reviews and set `approved: true`. A second supplied review is retained in `pending-review.txt` until its business and location references are confirmed. Do not invent stars, customer names, or aggregate ratings.
- The first review contains a reference to plumbing; verify that this wording accurately represents the business's work.
- Confirm service descriptions and the brief privacy notice for your operating practices.
- Remove unfilled review slots from the public release if you launch before all reviews arrive.

## Email behavior

The server validates input, limits body size, uses a honeypot and a basic per-instance request limit, and rejects cross-origin browser requests. Requests go only to contact@frederickpurewater.com with the customer email set as reply-to. No inquiry is persisted locally. Provider failure produces an error with a direct email option. API keys remain server-side. Resend acceptance is not a guarantee of inbox delivery; monitor the provider's delivery events. The rate limit is in memory and resets on restart; use an edge rate limit if operating multiple instances or experiencing abuse.

## Checks

```sh
pnpm run build:render
pnpm exec tsc --noEmit
node --test server.test.mjs
```

The tests mock email delivery, so they do not send messages. They cover validation, missing configuration, provider success/failure, static serving, and request-origin rejection.

## Assets

`public/images/kitchen-water.png` is an original AI-generated illustrative kitchen image. It does not portray an actual installation or customer home. Review preview names and remote photo links are attributed to the reference site; review text is summarized.

## Current review preview
The review section temporarily shows eight attributed summaries from Raleigh Water Pros with names and remotely hosted profile photos, plus two unfilled slots. Every populated card is labeled design preview. These do not endorse Frederick Pure Water. Replace all reference content before public launch. The previously supplied review is retained in owner-supplied-review.txt. No profile photos are bundled; remote images may change or be unavailable.
