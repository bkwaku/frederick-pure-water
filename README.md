

A responsive website

## Run locally

Use Node 22.16+ and pnpm (the lockfile was produced with pnpm 11).

```sh
corepack enable
pnpm install
pnpm run build:render
node --env-file=.env server.mjs

corepack pnpm install
corepack pnpm dev
```


## Checks

```sh
pnpm run build:render
pnpm exec tsc --noEmit
node --test server.test.mjs
```

