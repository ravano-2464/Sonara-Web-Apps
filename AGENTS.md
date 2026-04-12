# Repository Guidelines

## Project Structure and Module Organization

- `src/app`: route configuration and workspace pages.
- `src/components`: app-level React components (filenames are lower camel, exports are PascalCase), e.g. `src/components/appLogin.tsx`.
- `src/components/ui`: shadcn/ui building blocks (kebab-case filenames), e.g. `src/components/ui/dropdown-menu.tsx`.
- `src/redux`: Redux store setup and slice reducers in `src/redux/reducer`.
- `src/hooks`: custom hooks (prefix with `use`).
- `src/lib` and `src/utils`: shared utilities (e.g. `src/utils/version.json`).
- `src/assets` and `public`: static assets.
- `src/index.css`: Tailwind v4 and theme tokens.

## Build, Test, and Development Commands

- `npm install`: install dependencies.
- `npm run dev`: start Vite dev server on localhost.
- `npm run build`: typecheck (`tsc -b`) and build for production.
- `npm run preview`: preview the production build.
- `npm run lint`: run ESLint across the project.
- `npm run lint:fix`: run ESLint with auto-fix.
- `npm run format`: format files with Prettier.
- `npm run format:check`: check formatting without writing changes.

## Coding Style and Naming Conventions

- TypeScript + React (TSX) with Tailwind CSS utilities.
- Match existing 4-space indentation and file layout.
- Use `@/` alias for imports from `src` (configured in Vite/TS).
- Components are PascalCase exports; hooks are `useX`; Redux actions/thunks are camelCase.
- Prefer `cn` helper for conditional class names.

## Testing Guidelines

No automated test framework is configured in this repo at the moment.
If you add tests, place them under `src/__tests__` or alongside modules as `*.test.ts(x)` and document how to run them.

## Commit and Pull Request Guidelines

Recent history follows Conventional Commits (e.g. `feat:`, `fix:`). Keep commits small and scoped.
Pull requests should include:

- A short summary of changes and impact.
- Repro/verify steps (or `npm run lint` output if relevant).
- Screenshots for UI changes.
- Linked issues or tickets when applicable.

## CI and Deployment Notes

GitHub Actions are defined in `.github/workflows/main.yml` and handle Docker build/push and K3s deploy. Secrets are required for registry and Telegram notifications.
