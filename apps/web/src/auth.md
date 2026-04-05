# ArogyaVault Authentication Architecture

Complete reference for the authentication system used across ArogyaVault.

---

## Design Principles

1. **Single source of truth** — the httpOnly cookies set by the backend are the ONLY authority for auth state.
2. **Zero client-side token storage** — no sessionStorage, no localStorage, no cookies readable by JavaScript.
3. **In-memory Zustand** — the client stores only the user profile for UI rendering; repopulated on every fresh page load via `/api/auth/me`.
4. **Server-side proxy** — all authenticated API calls go through a Next.js API proxy that extracts the JWT from the httpOnly cookie and forwards it as a `Bearer` token.
5. **Transparent token refresh** — the proxy handles 401 → refresh → retry automatically; the client never knows about token lifecycle.

---

## Token Strategy

| Token | Storage | Lifetime | Purpose |
|-------|---------|----------|---------|
| `access_token` | httpOnly cookie (Secure, SameSite=Strict, Path=/) | 15 minutes | Authenticate API requests |
| `refresh_token` | httpOnly cookie (Secure, SameSite=Strict, Path=/) | 7 days | Obtain new access_token when expired |
| Redis session | Backend Redis cache keyed by user ID | 7 days (matches refresh) | Server-side session validation, revocation |

Both cookies are set by the **backend** on successful OTP verification. The frontend JavaScript **never** sees or handles these tokens.

---

## Authentication Flows

### 1. Login (OTP Verification)

```
┌──────────┐                  ┌──────────────┐                  ┌──────────┐
│  Browser  │                  │   Next.js    │                  │ Backend  │
│  (React)  │                  │   Server     │                  │ (Python) │
└─────┬─────┘                  └──────┬───────┘                  └────┬─────┘
      │                               │                               │
      │  POST /auth/verify-otp ───────┼──────── (direct call) ──────▶│
      │  { phone, code }              │                               │
      │  credentials: "include"       │                               │
      │                               │                               │
      │                               │          ┌───────────────────┐│
      │                               │          │ 1. Validate OTP   ││
      │                               │          │ 2. Create JWT     ││
      │                               │          │    access_token   ││
      │                               │          │ 3. Create JWT     ││
      │                               │          │    refresh_token  ││
      │                               │          │ 4. Store session  ││
      │                               │          │    in Redis       ││
      │                               │          │ 5. Set-Cookie:    ││
      │                               │          │    access_token   ││
      │                               │          │    refresh_token  ││
      │                               │          └───────────────────┘│
      │                               │                               │
      │◀──── 200 { user } + Set-Cookie (httpOnly) ───────────────────│
      │                               │                               │
      │  ┌──────────────────┐         │                               │
      │  │ setUser(data.user)│        │                               │
      │  │ router.push(     │         │                               │
      │  │   "/community")  │         │                               │
      │  └──────────────────┘         │                               │
```

**Key points:**
- `verifyOtp` calls the backend **directly** (not through the proxy) because the user has no token yet.
- `credentials: "include"` ensures the browser accepts the `Set-Cookie` headers from the backend.
- The JSON response body contains only `{ message, user }` — tokens are **not** in the response body.
- The Zustand store saves only the user profile (in-memory, not persisted).

### 2. Authenticated API Call

```
┌──────────┐                  ┌──────────────┐                  ┌──────────┐
│  Browser  │                  │   Next.js    │                  │ Backend  │
│  (React)  │                  │  /api/proxy  │                  │ (Python) │
└─────┬─────┘                  └──────┬───────┘                  └────┬─────┘
      │                               │                               │
      │  GET /api/proxy/community/    │                               │
      │      posts                    │                               │
      │  Cookie: access_token=jwt     │                               │
      │  (auto-attached by browser)   │                               │
      │                               │                               │
      │                      ┌────────┴────────┐                      │
      │                      │ Read cookie      │                      │
      │                      │ Extract JWT      │                      │
      │                      │ Add header:      │                      │
      │                      │ Authorization:   │                      │
      │                      │   Bearer <jwt>   │                      │
      │                      └────────┬────────┘                      │
      │                               │                               │
      │                               │  GET /community/posts ──────▶│
      │                               │  Authorization: Bearer <jwt> │
      │                               │                               │
      │                               │◀───── 200 { posts } ─────────│
      │                               │                               │
      │◀──── 200 { posts } ──────────│                               │
```

**Key points:**
- `apiClient("/community/posts")` calls `/api/proxy/community/posts` (not the backend directly).
- The browser auto-attaches the httpOnly cookie because it's a same-origin request.
- The proxy extracts the JWT from the cookie and adds `Authorization: Bearer <token>`.
- The client code never sees or handles the token.

### 3. Token Refresh (Transparent)

```
┌──────────┐                  ┌──────────────┐                  ┌──────────┐
│  Browser  │                  │   Next.js    │                  │ Backend  │
│  (React)  │                  │  /api/proxy  │                  │ (Python) │
└─────┬─────┘                  └──────┬───────┘                  └────┬─────┘
      │                               │                               │
      │  GET /api/proxy/vault/files   │                               │
      │  Cookie: access_token=expired │                               │
      │                               │                               │
      │                               │  GET /vault/files ──────────▶│
      │                               │  Authorization: Bearer <exp> │
      │                               │                               │
      │                               │◀───── 401 Unauthorized ──────│
      │                               │                               │
      │                      ┌────────┴────────┐                      │
      │                      │ Read refresh_    │                      │
      │                      │ token cookie     │                      │
      │                      └────────┬────────┘                      │
      │                               │                               │
      │                               │  POST /auth/refresh ────────▶│
      │                               │  { refresh_token }           │
      │                               │                               │
      │                               │◀── 200 { access_token, ─────│
      │                               │     refresh_token? }         │
      │                               │                               │
      │                      ┌────────┴────────┐                      │
      │                      │ Set new cookies  │                      │
      │                      │ Retry original   │                      │
      │                      │ request          │                      │
      │                      └────────┬────────┘                      │
      │                               │                               │
      │                               │  GET /vault/files ──────────▶│
      │                               │  Authorization: Bearer <new> │
      │                               │                               │
      │                               │◀───── 200 { files } ─────────│
      │                               │                               │
      │◀── 200 { files } + ──────────│                               │
      │    Set-Cookie: new tokens     │                               │
```

**Key points:**
- The client sees a normal 200 response — it never knows a refresh happened.
- The proxy updates the httpOnly cookies in the response so subsequent requests use the new token.
- If refresh also fails → proxy returns 401 → `apiClient` calls `clearUser()` → AuthGuard redirects to `/sign-in`.

### 4. Page Load / Navigation (Auth Check)

```
┌──────────┐                  ┌──────────────┐                  ┌──────────┐
│  Browser  │                  │   Next.js    │                  │  /api/   │
│           │                  │  Middleware   │                  │ auth/me  │
└─────┬─────┘                  └──────┬───────┘                  └────┬─────┘
      │                               │                               │
      │  Navigate to /community       │                               │
      │  Cookie: access_token=jwt     │                               │
      │                               │                               │
      │                      ┌────────┴────────┐                      │
      │                      │ Read cookie      │                      │
      │                      │ Cookie present?  │                      │
      │                      │ YES → allow      │                      │
      │                      └────────┬────────┘                      │
      │                               │                               │
      │◀── Serve /community page ────│                               │
      │                               │                               │
      │  (React mounts AuthGuard)     │                               │
      │                               │                               │
      │  GET /api/auth/me ────────────┼──────────────────────────────▶│
      │  Cookie: access_token=jwt     │                               │
      │                               │                      ┌───────┴───────┐
      │                               │                      │ Decode JWT    │
      │                               │                      │ Extract user  │
      │                               │                      └───────┬───────┘
      │                               │                               │
      │◀── 200 { user } ─────────────┼───────────────────────────────│
      │                               │                               │
      │  ┌──────────────────┐         │                               │
      │  │ setUser(user)    │         │                               │
      │  │ Render children  │         │                               │
      │  └──────────────────┘         │                               │
```

**Key points:**
- **Middleware** (edge, fast): just checks if the cookie EXISTS — no decoding, no backend call. Blocks or allows the route.
- **AuthGuard** (client, on mount): calls `/api/auth/me` to get the actual user profile and populate Zustand.
- If Zustand is already hydrated (navigating between protected pages), the guard skips the fetch.

### 5. Logout

```
┌──────────┐                  ┌──────────────┐                  ┌──────────┐
│  Browser  │                  │   Next.js    │                  │ Backend  │
│  (React)  │                  │/api/auth/    │                  │ (Python) │
│           │                  │  logout      │                  │          │
└─────┬─────┘                  └──────┬───────┘                  └────┬─────┘
      │                               │                               │
      │  POST /api/auth/logout        │                               │
      │  Cookie: access_token,        │                               │
      │          refresh_token        │                               │
      │                               │                               │
      │                               │  POST /auth/logout ─────────▶│
      │                               │  Authorization: Bearer <jwt> │
      │                               │  { refresh_token }           │
      │                               │                               │
      │                               │          ┌───────────────────┐│
      │                               │          │ Delete Redis      ││
      │                               │          │ session           ││
      │                               │          └───────────────────┘│
      │                               │                               │
      │                               │◀───── 200 { message } ───────│
      │                               │                               │
      │                      ┌────────┴────────┐                      │
      │                      │ Set-Cookie:      │                      │
      │                      │  access_token="" │                      │
      │                      │  Max-Age=0       │                      │
      │                      │ Set-Cookie:      │                      │
      │                      │  refresh_token=""│                      │
      │                      │  Max-Age=0       │                      │
      │                      └────────┬────────┘                      │
      │                               │                               │
      │◀── 200 + clear cookies ──────│                               │
      │                               │                               │
      │  ┌──────────────────┐         │                               │
      │  │ clearUser()      │         │                               │
      │  │ queryClient.     │         │                               │
      │  │   clear()        │         │                               │
      │  │ router.push(     │         │                               │
      │  │   "/sign-in")    │         │                               │
      │  └──────────────────┘         │                               │
```

### 6. Heartbeat (Session Liveness Check)

```
┌──────────┐                  ┌──────────────┐                  ┌──────────┐
│  Browser  │                  │   Next.js    │                  │ Backend  │
│  (React)  │                  │  /api/proxy  │                  │ /auth/   │
│           │                  │              │                  │ heartbeat│
└─────┬─────┘                  └──────┬───────┘                  └────┬─────┘
      │                               │                               │
      │  (every 4 min, or on tab      │                               │
      │   becoming visible)           │                               │
      │                               │                               │
      │  POST /api/proxy/auth/        │                               │
      │       heartbeat               │                               │
      │  Cookie: access_token         │                               │
      │                               │                               │
      │                      ┌────────┴────────┐                      │
      │                      │ Extract cookie   │                      │
      │                      │ Add Bearer header│                      │
      │                      └────────┬────────┘                      │
      │                               │                               │
      │                               │  POST /auth/heartbeat ──────▶│
      │                               │  Authorization: Bearer <jwt> │
      │                               │                               │
      │                               │          ┌───────────────────┐│
      │                               │          │ 1. Decode JWT     ││
      │                               │          │ 2. Redis SCARD    ││
      │                               │          │    user_sessions  ││
      │                               │          │ 3. Calc expires_in││
      │                               │          └───────────────────┘│
      │                               │                               │
      │◀── 200 { status: "alive",  ──│◀───────────────────────────── │
      │         user_id, expires_in } │                               │
      │                               │                               │
      │  ┌──────────────────┐         │                               │
      │  │ Session healthy  │         │                               │
      │  │ (no action)      │         │                               │
      │  └──────────────────┘         │                               │
```

**When the heartbeat detects session death:**

```
      │  POST /api/proxy/auth/        │                               │
      │       heartbeat               │                               │
      │  Cookie: access_token=expired │                               │
      │                               │                               │
      │                      ┌────────┴────────┐                      │
      │                      │ 401 from backend │                      │
      │                      │ Try refresh...   │                      │
      │                      │ Refresh FAILS    │                      │
      │                      └────────┬────────┘                      │
      │                               │                               │
      │◀── 401 ──────────────────────│                               │
      │                               │                               │
      │  ┌──────────────────┐         │                               │
      │  │ clearUser()      │         │                               │
      │  │ AuthGuard sees   │         │                               │
      │  │ isAuthenticated  │         │                               │
      │  │ = false          │         │                               │
      │  │ → redirect to    │         │                               │
      │  │   /sign-in       │         │                               │
      │  └──────────────────┘         │                               │
```

**Key design decisions:**

- **4-minute interval** — well within the 15-minute access_token lifetime. Ensures at least 3 heartbeats per token lifecycle, catching session revocations quickly.
- **Pauses when tab is hidden** — no wasted network calls when user isn't looking. Immediately checks when they return.
- **Initial 5-second delay** — avoids racing with the `/api/auth/me` call that AuthGuard fires on mount.
- **Tolerates network errors** — doesn't clear the session if the request fails due to connectivity. Only clears on a definitive 401.
- **Cost** — 1 JWT decode + 1 Redis `SCARD` check per heartbeat. No database queries.

---

## Auth Case Coverage Audit

Every auth scenario and where it's handled:

| Case | Where Handled | What Happens |
|------|---------------|--------------|
| **Fresh login (OTP)** | Backend `POST /auth/verify-otp` | Sets 2 httpOnly cookies, stores session in Redis, returns user profile |
| **Page load (first visit)** | Middleware → AuthGuard → `GET /api/auth/me` | Middleware checks cookie exists; AuthGuard decodes JWT to get user |
| **Page navigation (between protected routes)** | AuthGuard `isHydrated` check | Skips `/api/auth/me` call, uses cached Zustand user |
| **API call (authenticated)** | `apiClient` → `/api/proxy/` | Proxy reads cookie, adds Bearer, forwards to backend |
| **Access token expired during API call** | Proxy 401 handler | Proxy reads refresh_token cookie → calls `/auth/refresh` → retries → updates cookies |
| **Access token expired during heartbeat** | Proxy 401 handler + `useHeartbeat` | Same proxy refresh flow; if refresh fails → `clearUser()` → redirect |
| **Refresh token expired** | Proxy returns 401 → `apiClient` | `clearUser()` → AuthGuard redirects to `/sign-in` |
| **Session revoked in Redis (admin action)** | Backend heartbeat/API check | Redis `SCARD` returns 0 → 401 → proxy can't refresh → `clearUser()` |
| **Token reuse attack (replay old refresh)** | Backend `/auth/refresh` | Redis session doesn't exist (already rotated) → revokes ALL user sessions |
| **Logout** | Frontend `useLogout` → `/api/auth/logout` → Backend | Clears both cookies + deletes Redis session + clears Zustand |
| **Tab goes idle then returns** | `useHeartbeat` visibility listener | Immediate heartbeat on tab visible → catches stale sessions |
| **Network offline** | `useHeartbeat` catch block | Silently ignores — doesn't clear session (user might be on a plane) |
| **Backend down** | Proxy returns 503 | Client shows error but doesn't clear session — backend might recover |
| **Guest visiting /sign-in while logged in** | Middleware + GuestGuard | Middleware redirects to `/community`; GuestGuard confirms via `/api/auth/me` |
| **Multiple tabs** | Redis session shared | All tabs share the same httpOnly cookies; heartbeat in each tab independently validates |

---

## File Reference

### Core Auth Files

| File | Purpose |
|------|---------|
| `stores/auth-store.ts` | Zustand store — in-memory only, holds `user` + `isAuthenticated` + `isHydrated` |
| `middleware.ts` | Edge middleware — reads `access_token` cookie, protects routes |
| `components/shared/auth-guard.tsx` | Client guard for protected routes — calls `/api/auth/me` on mount |
| `components/shared/guest-guard.tsx` | Client guard for guest routes — redirects authenticated users |
| `lib/api/client.ts` | API client — routes all calls through `/api/proxy/` |
| `lib/api/auth.ts` | Auth API wrappers — direct backend calls for OTP flow |
| `hooks/api/use-auth.ts` | React Query hooks — login, logout, OTP mutations |
| `hooks/use-heartbeat.ts` | Periodic session liveness check (every 4 min) |

### Next.js API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/me` | GET | Decode `access_token` cookie → return user profile |
| `/api/auth/logout` | POST | Call backend logout + clear both httpOnly cookies |
| `/api/proxy/[...path]` | ALL | Cookie-to-Bearer proxy: reads cookie, adds `Authorization` header, forwards to backend. Handles token refresh transparently on 401. |

### Cookie Configuration

| Cookie | Attributes |
|--------|------------|
| `access_token` | `HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=900` |
| `refresh_token` | `HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800` |

**Notes:**
- `HttpOnly` — not accessible to JavaScript (prevents XSS token theft)
- `Secure` — only sent over HTTPS (in production; omitted in dev)
- `SameSite=Strict` — not sent on cross-origin requests (prevents CSRF)
- `Path=/` — both cookies available to all routes (proxy needs access to both)

---

## Zustand Store Shape

```typescript
interface AuthState {
  user: AuthUser | null;       // User profile from JWT or /auth/me
  isAuthenticated: boolean;    // true when user is populated
  isHydrated: boolean;         // true after initial /api/auth/me check
}

interface AuthActions {
  setUser: (user: AuthUser) => void;   // After login or /api/auth/me
  clearUser: () => void;               // After logout or 401
  setHydrated: () => void;             // Mark initial check done
}
```

**No persist middleware.** On page refresh, the store starts empty. AuthGuard/GuestGuard call `/api/auth/me` to repopulate. The httpOnly cookie is the persistence layer.

---

## Backend Contract

The backend must implement the following for this architecture to work:

### POST /auth/verify-otp
- **Request:** `{ phone, code, invite_token?, clinic_ref? }`
- **Response body:** `{ message, user: { id, phone, name, role, created_at } }`
- **Response cookies:**
  - `Set-Cookie: access_token=<jwt>; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=900`
  - `Set-Cookie: refresh_token=<jwt>; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800`
- **Redis:** Store session keyed by user ID

### JWT Payload (access_token)
```json
{
  "sub": "user-uuid",
  "phone": "+919876543210",
  "name": "Kumar",
  "role": "member",
  "created_at": "2025-01-01T00:00:00Z",
  "exp": 1714000000,
  "iat": 1714000000
}
```

### POST /auth/refresh
- **Request:** `{ refresh_token }`
- **Response body:** `{ access_token, refresh_token?, expires_in }`
- **Redis:** Validate session exists, optionally rotate refresh token

### POST /auth/logout
- **Request:** `{ refresh_token }` + `Authorization: Bearer <access_token>`
- **Response:** `{ message }`
- **Redis:** Delete session

### GET /auth/me
- **Request:** `Authorization: Bearer <access_token>`
- **Response:** `{ id, phone, name, role, created_at }`
- Primary endpoint for AuthGuard/GuestGuard hydration
- Also used as fallback if JWT decoding in Next.js `/api/auth/me` fails

### POST /auth/heartbeat
- **Request:** `Authorization: Bearer <access_token>` (no body needed)
- **Response:** `{ status: "alive", user_id, expires_in }`
- **Redis:** `SCARD user_sessions:{user_id}` — checks at least one session exists
- **Cost:** 1 JWT decode + 1 Redis command. No DB queries.
- Returns 401 if token expired or no active sessions in Redis
- Called by frontend every 4 minutes via `useHeartbeat` hook

---

## Security Considerations

### What this architecture prevents

1. **XSS token theft** — JavaScript cannot access httpOnly cookies. Even if an attacker injects a script, they cannot read the JWT.

2. **CSRF attacks** — `SameSite=Strict` ensures cookies are only sent on same-origin requests. Combined with the proxy pattern, cross-origin sites cannot trigger authenticated requests.

3. **Stale token loops** — The old architecture had sessionStorage ↔ cookie mismatch causing infinite redirects. This architecture has a single source of truth (httpOnly cookie) with no client-side persistence.

4. **Token exposure in JS bundle** — The token never appears in React state, Redux, Zustand, or any client-side store. Network tab shows the cookie header but it's not extractable by scripts.

### Token refresh security

- Refresh tokens are stored in Redis with a TTL matching the cookie Max-Age.
- The proxy is the only code that reads the refresh_token cookie (server-side Next.js route).
- If the backend rotates refresh tokens, the proxy updates the cookie in the response.
- Failed refresh → both cookies cleared → user redirected to sign-in.

### CORS requirements (backend)

The backend must allow credentials from the Next.js origin:

```python
# FastAPI example
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,                    # Required for Set-Cookie
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Important:** `allow_origins` must be explicit (not `"*"`) when `allow_credentials=True`.

---

## Migration Checklist (from old architecture)

- [x] Remove `zustand/middleware` persist from auth-store
- [x] Remove `sessionStorage` / `createJSONStorage` usage
- [x] Remove `tokens` / `AuthTokens` from client-side state
- [x] Remove `setAuth(user, tokens)` → use `setUser(user)`
- [x] Remove `setAccessToken` action
- [x] Remove `useRefreshToken` hook
- [x] Remove client-side refresh logic from `apiClient`
- [x] Remove `Authorization: Bearer` from `apiClient` (proxy handles it)
- [x] Create `/api/auth/me` route
- [x] Create `/api/auth/logout` route
- [x] Create `/api/proxy/[...path]` route with refresh logic
- [x] Update AuthGuard to call `/api/auth/me` instead of hydrating from sessionStorage
- [x] Update GuestGuard to call `/api/auth/me` instead of hydrating from sessionStorage
- [x] Update middleware to read `access_token` cookie (was `arogyavault-auth-token`)
- [x] Update middleware matcher to exclude `api/` routes
- [x] Update `useVerifyOtp` to store only user (not tokens)
- [x] Update `useLogout` to call `/api/auth/logout` route
- [x] Update `stores/index.ts` barrel — remove `AuthTokens` export
- [x] Update `hooks/api/index.ts` barrel — remove `useRefreshToken` export
- [x] **Backend:** Update `/auth/verify-otp` to set TWO httpOnly cookies (access_token + refresh_token)
- [x] **Backend:** Remove tokens from VerifyOtpResponse JSON body
- [x] **Backend:** Add user claims to JWT payload (sub, phone, name, role, created_at)
- [x] **Backend:** Ensure CORS allows credentials from Next.js origin
- [x] **Backend:** Implement Redis session manager (`app/core/redis.py`)
- [x] **Backend:** Add `POST /auth/heartbeat` endpoint (JWT decode + Redis SCARD)
- [x] **Frontend:** Create `useHeartbeat` hook (4-min interval, visibility-aware)
- [x] **Frontend:** Integrate heartbeat into AuthGuard
- [x] **Backend:** Migrate REFRESH_TOKEN_STORE from in-memory dict to Redis with TTL
- [x] **Backend:** Add `GET /auth/me` endpoint (Bearer → user profile)
- [x] **Backend:** Add Redis startup/shutdown lifecycle in `main.py`
- [x] **Backend:** Update `/auth/refresh` to read refresh_token from body or cookie
- [x] **Backend:** Update `/auth/logout` to clear both cookies + revoke Redis session
- [x] **Backend:** Add `/health` endpoint with Redis connectivity check

---

## Development Notes

### Testing locally

- In development, cookies use `Secure: false` (set conditionally via `process.env.NODE_ENV`).
- The backend at `localhost:8000` and Next.js at `localhost:3000` are different origins. The proxy pattern ensures cookies work correctly.
- To inspect cookies: Chrome DevTools → Application → Cookies → `localhost`.

### Adding new authenticated API calls

```typescript
// Just use apiClient — everything is handled automatically
const posts = await apiClient<Post[]>("/community/posts");

// The proxy:
// 1. Reads access_token from httpOnly cookie
// 2. Adds Authorization: Bearer header
// 3. Forwards to backend
// 4. On 401: refreshes token, retries, updates cookie
// 5. Returns response to client
```

### Why not put the Bearer token in middleware?

Middleware runs on the edge and can set headers on the response, but it cannot modify the request headers that go to API route handlers in a way that's reliable across all deployment targets. The proxy pattern is simpler and more portable.

---

## Backend File Reference

| File | Purpose |
|------|---------|
| `app/core/redis.py` | Redis session manager — store, validate, revoke sessions with TTL |
| `app/core/config.py` | Settings including `redis_url`, JWT secrets, token expiry config |
| `app/api/routes/auth.py` | All auth endpoints — OTP, verify, refresh, logout, /me |
| `app/api/schemas/auth.py` | Pydantic request/response models (no tokens in VerifyOtpResponse) |
| `app/api/store.py` | In-memory user/OTP data (refresh tokens moved to Redis) |
| `main.py` | FastAPI app with Redis lifecycle (connect on startup, disconnect on shutdown) |

### Redis Key Schema

| Key Pattern | Type | TTL | Content |
|-------------|------|-----|---------|
| `session:{jti}` | STRING | 7 days (refresh token lifetime) | `{ user_id, phone, created_at }` |
| `user_sessions:{user_id}` | SET | 7 days | Set of active `jti` values |
| `otp:{phone}` | STRING | 5 minutes | `{ code, created_at, attempts }` |

### Running Redis locally

```bash
# Docker (recommended)
docker run -d --name arogyavault-redis -p 6379:6379 redis:7-alpine

# Or install natively
# macOS: brew install redis && brew services start redis
# Ubuntu: sudo apt install redis-server && sudo systemctl start redis
```

Backend `.env`:
```
REDIS_URL=redis://localhost:6379
```
