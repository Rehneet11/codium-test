# MyRestaurantApi Hooks — Test Description

---

## Overview

This document describes the unit tests created for the custom React Query hooks in `src/api/MyRestaurantApi.tsx`.

Hooks covered:
- `useGetMyRestaurant`
- `useCreateMyRestaurant`
- `useUpdateMyRestaurant`
- `useGetMyOrdersForRestaurant`
- `useUpdateMyRestaurantOrder`

Test file:
- `src/api/__tests__/MyRestaurantApi.test.tsx`

Test framework:
- Vitest + jsdom + Testing Library

---

## Behaviors Tested

1. Fetch "my restaurant" successfully and include Authorization header.
2. Handle error when fetching "my restaurant" (result is undefined, no crash).
3. Create restaurant via POST with FormData and show success toast.
4. Show error toast when creating restaurant fails.
5. Update restaurant via PUT with FormData and show success toast.
6. Show error toast when updating restaurant fails.
7. Fetch orders for the restaurant with correct headers.
8. Handle error when fetching orders (result is undefined, no crash).
9. Update order status via PUT with JSON body and show success toast.
10. Show error toast when updating order status fails.

---

## Mocks Used (and Why)

- Auth0 (`@auth0/auth0-react`):
  - Mocked `useAuth0().getAccessTokenSilently` to return a static token (`"test-access-token"`).
  - Reason: Avoid hitting Auth0 and ensure deterministic Authorization header checks.

- Fetch (global `fetch`):
  - Mocked to control status codes, JSON payloads, and request inspection.
  - Reason: Avoid real network calls; assert URLs, methods, headers, and bodies.

- Toast (`sonner`):
  - Mocked `toast.success` and `toast.error` to verify user messaging without UI.
  - Reason: Avoid UI side effects while asserting notifications.

- React Query environment:
  - Each test renders hooks inside a fresh `QueryClientProvider` to prevent cache bleed and retries.

---

## Project Configuration for Tests

Files modified/added to enable testing:

- `package.json` (scripts):
  - `"test": "vitest"`
  - `"test:run": "vitest run"`

- `vite.config.ts` (Vitest + env):
  - `test.environment = "jsdom"`
  - `test.setupFiles = "./src/test/setup.ts"`
  - Inline env var for API base URL so tests can resolve `import.meta.env.VITE_API_BASE_URL`:
    - `define: { 'import.meta.env.VITE_API_BASE_URL': '"http://api.test"' }`

- `src/test/setup.ts`:
  - Imports `@testing-library/jest-dom` to extend matchers.

---

## How to Run Tests

- Interactive/watch mode:
```bash
npm run test
```

- Single run (CI-friendly):
```bash
npm run test:run
```

If you see failures about `import.meta.env.VITE_API_BASE_URL` being `undefined`, ensure the inline `define` block exists in `vite.config.ts`.

---

## How to Push This Documentation

Stage and commit this file and push your branch:

```bash
# From the project root
git add docs/tests/MyRestaurantApi-tests.md
git commit -m "docs(tests): add MyRestaurantApi hooks test description"

# Push current branch (sets upstream if not set)
git push -u origin HEAD
```

To include all changes you made earlier (tests + config) in a single push:
```bash
git add -A
git commit -m "test: add Vitest setup and MyRestaurantApi hooks tests + docs"
git push -u origin HEAD
```

---

## Maintenance Tips

- If API base URL changes for tests:
  - Update the `define` section in `vite.config.ts` with the new value for `VITE_API_BASE_URL`.

- If toast messages change:
  - Update the expected strings in the tests (e.g., `toast.success('Restaurant created!')`).

- Avoid resetting core mocks unintentionally:
  - Do not call `vi.restoreAllMocks()` between tests if it resets the Auth0 mock implementation.
  - `vi.clearAllMocks()` is used to clear call counts while keeping implementations.

- React Query retries:
  - Tests disable retries so failures surface immediately and deterministically.

---

## Troubleshooting

- Push rejected due to remote history:
  - Pull/rebase and re-push:
    ```bash
    git pull --rebase origin main  # or your default branch
    git push
    ```
- Authentication:
  - For HTTPS remotes, use a GitHub Personal Access Token as your password when prompted.
  - For SSH, ensure your keys are configured with GitHub.

---

## References

- Test file: `src/api/__tests__/MyRestaurantApi.test.tsx`
- Source hooks: `src/api/MyRestaurantApi.tsx`
- Setup file: `src/test/setup.ts`
- Vite config: `vite.config.ts`
- Package scripts: `package.json`
