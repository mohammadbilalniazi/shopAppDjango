# AFMIS VPP Web

AFMIS VPP Web is the private TPMS/AFMIS frontend application. It is built with React, TypeScript, Vite, Redux Toolkit, Redux Saga, and a mixed enterprise UI stack that includes Bootstrap/Reactstrap, Material UI, PrimeReact, and AG Grid.

## Quick Start

```bash
git clone https://github.com/afmis-dev/Afmis.VPP.Web.git
cd Afmis.VPP.Web

corepack enable
yarn install
yarn dev
```

The development server runs at:

```text
http://localhost:3000
```

## Requirements

- Node.js 20 LTS or newer
- Git
- Corepack
- Yarn 4.0.0, provided by this repository

The Docker build uses `node:20.18.0-alpine`, so Node 20 is the recommended local version for the least surprise.

## Package Manager

This project uses Yarn 4.0.0. Do not use `npm install`.

Yarn is pinned in `package.json`:

```json
"packageManager": "yarn@4.0.0"
```

The repository also includes the Yarn release file and uses the `node_modules` linker:

```yml
yarnPath: .yarn/releases/yarn-4.0.0.cjs
nodeLinker: node-modules
```

Use Corepack so each developer gets the same Yarn version from the project configuration:

```bash
corepack enable
yarn --version
```

Expected:

```text
4.0.0
```

### Windows Setup Notes

If `yarn` is not recognized after enabling Corepack, close and reopen the terminal first.

If the machine has an old global Yarn installation, remove it and enable Corepack again:

```bash
npm uninstall -g yarn pnpm
corepack enable
```

If Corepack is installed but the Yarn shim still fails, use the checked-in Yarn release directly:

```bash
node .yarn/releases/yarn-4.0.0.cjs --version
node .yarn/releases/yarn-4.0.0.cjs install
node .yarn/releases/yarn-4.0.0.cjs dev
```

Avoid `npm install -g yarn`; it usually installs Yarn Classic and can bypass the pinned Yarn 4 workflow.

## Installation

Install dependencies:

```bash
yarn install
```

For CI or a clean reproducible install:

```bash
yarn install --immutable
```

## Environment

The repository includes a `.env` file. Current variables:

```env
PUBLIC_URL=""
REACT_APP_API_URL=""
REACT_APP_DEFAULTAUTH=fake
REACT_APP_API_KEY=
REACT_APP_AUTHDOMAIN=
REACT_APP_DATABASEURL=
REACT_APP_PROJECTID=
REACT_APP_STORAGEBUCKET=
REACT_APP_MESSAGINGSENDERID=
REACT_APP_APPID=
REACT_APP_MEASUREMENTID=
GENERATE_SOURCEMAP=false
```

Set `REACT_APP_API_URL` and any environment-specific values before connecting to a real backend.

## Available Scripts

| Command | Description |
| --- | --- |
| `yarn dev` | Start the Vite development server on port `3000`. |
| `yarn build` | Run TypeScript checking and create a production build. |
| `yarn preview` | Preview the production build locally. |
| `yarn lint` | Run ESLint across `src`. |
| `yarn lint:fix` | Run ESLint with automatic fixes. |
| `yarn format` | Run Prettier across supported project files. |

## Build Output

Default production builds output to:

```text
dist/
```

When Vite runs with mode `afmis`, the output directory is:

```text
Z:
```

## Docker

Included Docker files:

- `Dockerfile`
- `docker-composeyml`
- `nginx/default.conf`

The Dockerfile uses the checked-in Yarn release directly:

```bash
node .yarn/releases/yarn-4.0.0.cjs install --immutable
node .yarn/releases/yarn-4.0.0.cjs build
```

The compose file currently expects the frontend repo to exist at `./Afmis.VPP.Web` relative to the directory where Docker Compose is run. From the parent directory of this repository:

```bash
docker compose -f Afmis.VPP.Web/docker-composeyml up --build
```

Exposed services:

| Service | URL |
| --- | --- |
| Frontend | `http://localhost:3000` |
| Backend | `http://localhost:5000` |
| Redis | `localhost:6379` |
| RedisInsight | `http://localhost:5540` |

## Project Structure

```text
src/
  Components/
  Layouts/
  hooks/
  pages/
  routes/
  services/
  store/
  utilities/
  validations/
```

## Development Notes

- This is a Vite application, not Create React App.
- Dependencies are managed by Yarn 4 and `yarn.lock`.
- The project uses `nodeLinker: node-modules`, so `node_modules/` is expected after install.
- Use `yarn add`, `yarn remove`, and `yarn up` for dependency changes.
- Prefer existing shared components, layout patterns, and SCSS variables before introducing new UI patterns.

## Troubleshooting

Check Node:

```bash
node --version
```

Check Yarn:

```bash
yarn --version
```

Refresh Corepack shims:

```bash
corepack enable
```

Use the pinned Yarn release directly:

```bash
node .yarn/releases/yarn-4.0.0.cjs --version
```

Reinstall dependencies cleanly:

```bash
yarn install --immutable
```

If PowerShell blocks package-manager scripts, open a fresh terminal after enabling Corepack. For one-off Windows tooling fallbacks, `npm.cmd` avoids the `npm.ps1` execution-policy wrapper.

If the dev server cannot start, make sure port `3000` is free.

## Maintainers

AFMIS Dev Team

## License

Private project for internal use.
