# Lumina Streaming Frontend

Production-oriented React and JavaScript client for the existing FastAPI video-streaming API. It includes member authentication, profiles, catalogue browsing, search, HTML5 playback with resume progress, watchlists, subscriptions, Razorpay checkout, account history, and a role-gated admin studio.

## Requirements

- Node.js 20.19+ or 22.12+
- npm 10+
- Python 3.11+ for the backend
- A running database configured for the FastAPI project
- Razorpay test credentials configured **only in the backend**

## Install and run

```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

The Vite development client starts at `http://localhost:5173` by default.

Start the backend in a separate terminal:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend needs its own `.env` values for `DATABASE_URL`, JWT settings, upload directories, and Razorpay keys. Those values are intentionally not copied into the frontend.

## Frontend environment

Create `frontend/.env` from `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=Streaming Platform
```

All request and media URLs are derived from `VITE_API_BASE_URL`. Never add `RAZORPAY_KEY_SECRET`, a JWT secret, database credentials, or other server secrets to a `VITE_` variable: Vite variables are public browser code.

## Payment flow

1. The member selects a backend-provided plan.
2. `POST /subscriptions/{user_id}` creates a provisional, non-active subscription.
3. `POST /payment/create-order` creates the Razorpay order for that subscription using the authenticated JWT.
4. The client opens Razorpay with the exact `amount`, `currency`, order ID, and public key returned by the backend. It does not multiply the amount.
5. Razorpay returns `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature` to its client callback.
6. The client sends those exact fields to `POST /payment/verify`.
7. Only a successful server verification activates the subscription and displays the success screen.

The checkout button is locked while an order is created or verified. Script-load errors, dismissed checkout, payment failure, timeouts, and verification failure are surfaced. A failed verification after apparent payment shows a warning instructing the member to check history before retrying.

### Razorpay test mode

1. Put Razorpay **test** key ID and secret in `backend/.env` as `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
2. Start both applications and sign in as a normal user.
3. Select a plan, continue to checkout, and use a payment method from Razorpay's current test-mode documentation.
4. Confirm success only after the app reaches `/payment/success` following backend verification.
5. Test failure by closing checkout, using a test failure case, stopping the backend before verification, or temporarily using invalid test credentials.
6. Inspect `/account/payments` before retrying when payment completed but verification did not.

Never use live credentials in local development and never commit the backend `.env`.

## Media upload and URLs

The shared upload component validates the selected MIME type and configurable size limit, previews images/video, reports progress, cancels through `AbortController`, prevents duplicate submission, and retries failures. Frontend limits live in `src/config/uploads.js`; backend validation remains authoritative.

Every multipart endpoint uses the exact form field name `file`. Returned filenames are stored in the relevant profile, video, or episode form. A completed upload filename remains in form state if metadata creation fails, allowing a retry without re-uploading.

URL normalization follows these rules:

- Full `http://` or `https://` URLs are used unchanged.
- Video filenames become `${VITE_API_BASE_URL}/stream/{filename}`.
- Thumbnails become `/uploads/thumbnails/{filename}`.
- Banners become `/uploads/banners/{filename}`.
- Profile images become `/uploads/profiles/{filename}`.
- Already-prefixed `/uploads/...` and `/stream/...` paths are not prefixed twice.

## Authentication and admin access

The backend returns a JWT in the login/register response. For this existing bearer-token architecture, the session is persisted in local storage by Zustand and attached by a centralized Axios interceptor. A `401` clears the session and returns the browser to login.

`ProtectedRoute` gates member pages. `AdminRoute` and navigation visibility check the backend-returned `ADMIN` role. This client-side role check is only a usability layer; it is not a security boundary. The backend must enforce ownership and admin authorization on every protected resource.

## Existing backend limitations

- The backend has no complete admin video-list endpoint. The admin library merges and deduplicates featured, latest, and trending results, so its totals and filters only cover visible catalogue data.
- Category update/delete and plan update/delete routes do not exist, so the UI deliberately omits those actions.
- Most user/profile/subscription routes, all admin routes, and uploads do not currently enforce JWT ownership or admin dependencies.
- Watchlist and continue-watching responses contain relationship IDs rather than embedded video details. The client resolves titles with existing detail endpoints.
- Video details do not embed category relationships, and the backend create/update response does not return `category_ids`.
- The current subscription enum has no `PENDING` value. A newly created checkout subscription is kept `CANCELLED` (non-active) until verified payment activates it. A future migration should add an explicit `PENDING` state.
- The stream route returns a file response but does not explicitly implement HTTP range handling; seeking behavior depends on the framework/server response behavior.
- Profile image URL construction assumes `PROFILE_PHOTO_DIR` maps to `uploads/profiles` under the mounted upload root.
- Backend upload validation is minimal and should enforce MIME type, extension, size, malware scanning, and safe storage rules.
- Development CORS is explicitly limited to `http://localhost:5173`. Production origins must be configured explicitly.

## Security improvements recommended

- Add authenticated-user dependencies and resource ownership checks to every user, subscription, and profile route.
- Add a reusable backend `ADMIN` dependency to every `/admin` route and appropriate authorization to uploads.
- Add an explicit `PENDING` subscription state plus a migration, expiry/cleanup for abandoned checkouts, and idempotency for subscription/order creation.
- Reject duplicate Razorpay verification safely and reconcile payments through signed Razorpay webhooks.
- Prefer short-lived access tokens plus secure, `HttpOnly`, `SameSite` refresh cookies over long-lived browser storage when the backend architecture is upgraded.
- Validate ratings, comments, URLs, plan values, and all identifiers server-side; frontend validation is not authoritative.
- Add rate limiting, audit logging, upload scanning, CSP/security headers, and production HTTPS.
- Remove backend configuration debug prints before production.

## Production deployment

Build the static client with:

```bash
npm run build
```

Deploy `frontend/dist` behind an HTTPS static host. Configure SPA fallback so unknown paths serve `index.html`, set `VITE_API_BASE_URL` to the HTTPS API origin at build time, and add that exact frontend origin to backend CORS. Keep uploads in durable object storage or a persistent volume; do not rely on an ephemeral application filesystem.

For better initial bundle size as the product grows, the admin and account route groups can be lazy-loaded in a future optimization.

## Source map

```text
frontend/
├── src/
│   ├── api/           # Endpoint modules and centralized Axios client
│   ├── components/    # Common states, cards, layout, player, uploads
│   ├── config/        # Changeable upload constraints
│   ├── layouts/       # Member and admin shells
│   ├── pages/         # Public, member, payment, and admin routes
│   ├── routes/        # ProtectedRoute and AdminRoute
│   ├── store/         # Persisted auth and active-profile state
│   ├── utils/         # Media and formatting utilities
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── package.json
└── vite.config.js
```
