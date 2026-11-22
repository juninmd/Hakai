# AGENTS.md

Hakai: CLI in Node that deletes directories with a visual animation ("utilitário para apagar aqueles diretórios chatos"). Exposed as the `hakai` binary (`app.js`).

## Stack

- Node modules (`src/`, `app.js`, `require`). No build step.
- Tests: `node --test` (`test/**/*.test.js`).
- Lockfiles: `package-lock.json` and `yarn.lock` are both committed.

## Commands

```bash
npm install
npm test             # node --test "test/**/*.test.js"
node app.js        # run the CLI from source
npm install -g hakai # install the published CLI (README)
```

## Structure

- `app.js`: CLI entry (the `bin` target).
- `src/animator.js`: draws the animation on a TTY and falls back to a plain logger otherwise. `src/hakaiFrame.js`: renders one ANSI frame. `src/deleter.js`: removes a tree, shortening deep paths first.
- `test/`: unit tests per module, `cli.test.js`, and `test/fixtures/failUnlink.js` (preload that makes `unlinkSync` fail with EACCES on `locked.txt`).
- `docs/hakai.gif`: demo used by the README.

## Conventions

- Owner rules: DRY, KISS, SOLID, YAGNI. Each file at most 180 lines. Comments explain why, not what.
- Test coverage target: 80% per module. Mocks and stubs are for tests only; the real implementations stay in `src/`.
- No linter is configured in the repo.

<!-- base-actions-main-policy -->
## GitHub Actions — padrão obrigatório (@main)

- Referencie as actions internas sempre pelo branch, nunca por SHA:
  - `uses: juninmd/base-actions/<action>@main`
  - `uses: juninmd/base-actions/.github/workflows/<arquivo>.yml@main`
- Não fixe `@<sha>` em `juninmd/base-actions`: a atualização é centralizada no
  `main` e passa a valer no próximo run.
- PRs cujos checks não iniciam por billing/spending limit são mesclados pelo bot central
  `juninmd/base-actions/.github/workflows/auto-merge-billing-blocked.yml`.
  Para impedir o merge automático de um PR, aplique a label `do-not-merge`.

## Gotchas

- `deleter.js` is destructive. It uses `lstat`, so symlinks are unlinked and never followed. Keep that behavior.
- `test/fixtures/failUnlink.js` patches `fs` for tests only. Keep it out of `src/`.
