# Frontend Auth Flow

## Pieces and where they live

| Piece | File | Responsibility |
|---|---|---|
| Axios instance | `src/api/axiosClient.ts` | Attaches the access token to requests, silently refreshes on 401 |
| Access token holder | `src/api/tokenStore.ts` | Plain in-memory module, **not** Redux |
| API wrappers | `src/api/authApi.ts`, `src/api/userApi.ts` | Thin typed wrappers around the backend endpoints |
| State | `src/store/authSlice.ts`, `src/store/store.ts` | Redux Toolkit slice + store |
| Hook | `src/hooks/useAuth.ts` | What components actually use |
| Route guards | `src/routes/ProtectedRoute.tsx`, `src/routes/PublicOnlyRoute.tsx` | Redirect based on auth state |

## Why the access token isn't in Redux

It's non-visual state — no component needs to re-render when it changes — and keeping it out of the store avoids a circular import: `axiosClient` needs to read the token on every request, but `authSlice`'s thunks need `axiosClient` to make requests. Routing both through Redux would create `axiosClient → store → authSlice → axiosClient`. `tokenStore.ts` breaks that cycle: it's a leaf module with no imports of its own.

The refresh token never touches the frontend at all — it's an `httpOnly` cookie the browser manages automatically (`axiosClient` is created with `withCredentials: true` so it's sent/received transparently).

## The refresh flow (why a 401 doesn't just log you out)

1. A request goes out with `Authorization: Bearer <access token>`.
2. If the access token expired, the backend returns `401`.
3. `axiosClient`'s response interceptor catches that, and — if the failing request wasn't itself `/auth/login` or `/auth/refresh`, and hasn't already been retried — calls `POST /auth/refresh` (a bare `axios` call, not through `axiosClient`, to avoid re-triggering this same interceptor).
4. Concurrent 401s share a single in-flight refresh call (`refreshPromise` in `axiosClient.ts`) instead of firing multiple refresh requests.
5. On success, the new access token is stored and the original request is retried once with the new token.
6. On failure (refresh token also expired/invalid), `tokenStore.notifySessionExpired()` fires. `store.ts` wires that up to dispatch `authSlice`'s `sessionExpired` action at store-creation time — this clears `user` in Redux, which makes `ProtectedRoute` redirect to `/login` on the next render.

## App startup (silent session restore)

On every page load, `App.tsx` dispatches `bootstrapSession()` once (`useEffect` with an empty dependency array). That thunk calls `POST /auth/refresh` (using whatever cookie the browser already has) and, if it succeeds, `GET /auth/me` to populate the user. `App` renders nothing until `isInitializing` flips to `false`, so `AppRoutes` never mounts — and never redirects to `/login` — before we know whether a session actually exists. This is why route guards don't need to worry about the "don't know yet" state themselves; by the time they render, initialization has already finished.

## Extending to a new authenticated page

1. Add the page under `src/pages/`.
2. Add its route inside the `<Route element={<ProtectedRoute />}>` block in `src/routes/AppRoutes.tsx`.
3. Use `useAuth()` if the page needs `user` or `logout`.
4. For new authenticated API calls, add a wrapper in `src/api/` that goes through `axiosClient` — the bearer token and refresh handling are automatic; you don't need to think about auth in the page component itself.
