# Repository Guidelines

## Project Structure & Module Organization
The monorepo hosts three publishable packages: `js/` contains the Solid-based web component runtime, `react/` exposes React wrappers (`Standard`, `Bubble`, `Popup`), and `nextjs/` provides Next.js helpers around the same primitives. Each package keeps its source in `src/` and emits distributable assets to `dist/` via Rollup; avoid editing generated files directly. Tests, regression plans, and docs for the runtime live in `js/src/__tests__`, `js/src/__rules__`, and `js/docs`, so place new coverage there alongside related code.

## Build, Test, and Development Commands
From the repo root run `npm install` once, then `npm run build` to clean and sequentially build all packages (`js`, `react`, `nextjs`). For iterative work run `cd js && npm run dev` (Solid widgets), `cd react && npm run dev` (React bindings), or `cd nextjs && npm run dev`; each command starts Rollup in watch mode. Publish-ready bundles should always be produced through `npm run build` inside the target package after linting and tests pass.

## Coding Style & Naming Conventions
Code is TypeScript-first with ES modules, single quotes, and 2-space indentation as enforced by `eslint-config-custom` (invoked via `npm run lint`). Prefer small functional components/hooks, keep exported names PascalCase for components and camelCase for utilities, and colocate CSS or theme helpers next to the component they style. New file names should mirror the component or hook they house, e.g., `FixedBottomInput.tsx` + `FixedBottomInput.test.tsx` to keep the regression folders organized.

## Testing Guidelines
Add tests only when asked to.

## Commit & Pull Request Guidelines
Don't commit or make pull requests, the developer handles that.