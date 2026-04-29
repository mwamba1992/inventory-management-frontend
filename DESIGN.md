# POS Admin Portal — Design Specification

> A design specification intended as a single-file handoff to Claude. Paste this into a new conversation and ask Claude to design/rebuild the frontend described here. Everything Claude needs (product scope, domain model, API surface, module specs, UX conventions, auth flow, build setup) is contained below. No external links are required.

---

## 1. Product overview

**Name:** POS Admin Portal (internal: `pos-admin-portal`).
**Type:** Web application (SPA) — admin/back-office portal for a retail Point-of-Sale + Inventory system, multi-tenant by `businessId`.
**Primary users:** Business owners, store managers, inventory clerks, cashiers, accountants.
**Primary value:** One portal to manage items, stock, sales, invoices, expenses, customers, suppliers, accounts, users, brands, categories, warehouses, and reporting (including PDF catalogues and balance sheets), with lightweight WhatsApp order intake.

### Goals
1. Manage the full lifecycle of inventory (items, prices, stock, accounts mapping) across multiple warehouses.
2. Record and review sales (POS-style entry + invoices) and expenses.
3. Provide business-intelligence style dashboards and reports (sales trends, top products, retention, shelf time, inventory valuation, balance sheet, catalogue PDF).
4. Configure the business: brands, item/color categories, suppliers, warehouses, accounts, users/roles, common lookup values, businesses themselves.
5. Track WhatsApp-sourced orders as a parallel intake channel.

### Non-goals (for v1)
- Mobile app (web-responsive only).
- Customer-facing storefront.
- Real-time POS hardware integration (receipt printers, cash drawers).
- Complex ERP GL postings beyond single-entry account mappings.

---

## 2. Tech stack & conventions

The existing app uses this stack — the rebuild should keep it unless the user overrides.

| Concern | Choice |
|---|---|
| Framework | Vue 3 (Composition API, `<script setup>`) |
| Build | Vite 5 |
| Language | TypeScript for types/router; JavaScript is tolerated for services/stores/views. Prefer `.ts` in new code. |
| State | Pinia 2 (`persist: true` for the user store) |
| Routing | Vue Router 4 (history mode) |
| HTTP | Axios (single configured instance with interceptors) |
| Styling | Tailwind CSS 3 + `@tailwindcss/forms`; custom `brand` + `neutral` palettes |
| Icons | `@heroicons/vue` (primary) and `lucide-vue-next` (secondary) |
| Charts | Chart.js 4 |
| Alerts/dialogs | SweetAlert2 wrapped as `<SwalAlert />` |
| Auth | JWT (access + refresh), Bearer token via Axios interceptor |

### Directory layout (target)
```
src/
  assets/                 # global CSS (main.css with Tailwind layer defs)
  components/
    common/               # SwalAlert and other shared bits
    layouts/              # AppLayout, AppHeader, AppSidebar
    items/                # ItemsTable and other item-scoped components
    icons/                # (optional) custom SVG icons
  router/index.ts         # all routes + auth guard
  services/               # Axios wrappers, one file per resource
    Api.js                # configured Axios instance + interceptors
    LoginService.js
    brandService.js
    colorCategoryService.js
    stockDistributionService.js
    businessService.js
    ...
  stores/                 # Pinia stores (user, items, ...)
  types/                  # TS interfaces for domain (brand, item, ...)
  utils/Configs.js        # API_BASE_URL, REPORT_BASE_URL
  views/                  # page components, grouped by feature folder
    items/                # Items, ItemPrice, Inventory, ItemAccount
    sales/                # Sales, Invoices
    expense/              # Expense
    reports/              # BalanceSheet, CataloguePDF (Reports.vue is top-level)
    settings/             # Brands, ColorCategories, ItemCategories, Suppliers, Warehouses, Businesses, Accounts, CommonConfigs, Customer, Users
    Dashboard.vue
    Reports.vue
    Settings.vue
    WhatsAppOrders.vue
    Login.vue
  App.vue
  main.ts
```

### Global styling tokens (`tailwind.config.js`)
- `brand` palette is a sky-blue ramp (`50..900`, primary `brand-600 = #0284c7`).
- `neutral` palette is a grayscale ramp (`50..900`).
- Font: `Inter, system-ui, sans-serif`.
- Custom shadows: `shadow-soft`, `shadow-soft-lg`.
- Rounded corners trend large: `rounded-xl` (cards), `rounded-2xl` (hero cards).
- Reusable utility classes (declared in `src/assets/main.css` as Tailwind `@apply` layers): `card`, `btn-primary`, `btn-secondary`, `input-field`, `input-label`, `sidebar-item`, `sidebar-item-active`, `sidebar-item-inactive`.

---

## 3. Authentication & session

### Flow
1. User submits email + password to `POST /auth/login`.
2. Server returns `{ access_token, refresh_token }`. Both are JWTs.
3. Client decodes the access token payload (base64url-decode the middle segment) to extract: `sub` (user id), `username`, `permissions: [{name}]`, `businessId`.
4. Client writes to Pinia `user` store: `{ id, name, token, refreshToken, permissions: string[], businessId, businessName }`.
5. Client fetches `GET /business/:businessId` to resolve `businessName` and stores it.
6. Router pushes to `/` (Dashboard).

### Axios interceptors
- **Request:** if `userStore.token` is set, attach `Authorization: Bearer <token>`. If absent, hard-redirect to `/login`.
- **Response:** on 401, attempt `POST /auth/refresh` with `{ refreshTokenDto: { refreshToken, userId } }`. On success, update store and retry original request. On failure, clear store and redirect to `/login`.

### Router guard
- Login route is outside the authenticated layout.
- All other routes live under a parent that has `meta.requiresAuth: true`.
- The guard reads `useUserStore().token`. Missing → `/login`. Present and path is `/login` → redirect to `/`.
- Wildcard `/:pathMatch(.*)*` redirects to `/login`.

### User store (Pinia, `persist: true`)
State: `id, name, token, refreshToken, permissions[], businessId, businessName`.
Actions: `setUser(user)`, `clearUser()`.
Getters: `getId, getName, getToken, getRefreshToken, getPermissions, getBusinessId, getBusinessName`.

### Authorization (permissions)
Permissions are string names carried on the JWT. The frontend reads `userStore.permissions` for conditional UI (gate buttons, menu entries). No centralized permission list is enforced today; treat permission names as opaque strings and gate routes/UI where the user requests.

---

## 4. Application shell

### `AppLayout.vue`
Three-part chrome: `AppHeader` on top, `AppSidebar` on the left, `<router-view />` in `<main class="flex-1 p-6">`. Background `bg-neutral-50`.

### `AppHeader.vue`
- Full-width bar, `bg-brand-600 text-white`.
- Left: logo svg + business name (from store) or "Inventory Portal" fallback.
- Right: quick search input (`lg:` only), notifications bell with badge, user profile dropdown (name, email, role, profile link, settings link, sign-out).
- Sign-out clears the user store and `router.push('/login')`.

### `AppSidebar.vue`
- `w-64`, white card with soft shadow.
- Sections (in order): **Dashboard**, **Sales**, **Expenses**, **Customers**, **Items** (sub), **Settings** (sub), **User Management** (sub), **Reports** (sub), **WhatsApp Orders**, **Help and Support**.
- Submenus expand on click; active submenu auto-opens when a child route matches.
- Active state: `bg-brand-50 text-brand-700 border-l-4 border-brand-600`.

---

## 5. Routing

All authenticated routes are children of the `AppLayout` parent (`path: '/'`).

| Path | Name | Component |
|---|---|---|
| `/login` | `Login` | `Login.vue` |
| `/` | `Dashboard` | `Dashboard.vue` |
| `/items/item` | `Items-Stored` | `items/Items.vue` |
| `/items/item-price` | `Items-Price` | `items/ItemPrice.vue` |
| `/items/inventory` | `Items-Inventory` | `items/Inventory.vue` |
| `/items/account-mappings` | `Items-Accounts` | `items/ItemAccount.vue` |
| `/settings` | `Settings` | `Settings.vue` |
| `/settings/common` | `Settings-Common` | `settings/CommonConfigs.vue` |
| `/settings/suppliers` | `Settings-suppliers` | `settings/Suppliers.vue` |
| `/settings/item-categories` | `Settings-item-categories` | `settings/ItemCategories.vue` |
| `/settings/color-categories` | `Settings-color-categories` | `settings/ColorCategories.vue` |
| `/settings/brands` | `Settings-brands` | `settings/Brands.vue` |
| `/settings/warehouses` | `Settings-warehouses` | `settings/WareHouses.vue` |
| `/settings/businesses` | `Settings-businesses` | `settings/Businesses.vue` |
| `/settings/accounts` | `Settings-accounts` | `settings/Accounts.vue` |
| `/customers` | `customer` | `settings/Customer.vue` |
| `/users/user` | `Settings-Users` | `settings/Users.vue` |
| `/invoices` | `invoices` | `sales/Invoices.vue` |
| `/pos-sales` | `pos-sales` | `sales/Sales.vue` |
| `/expense` | `expense` | `expense/Expense.vue` |
| `/reports` | `Reports` | `Reports.vue` |
| `/reports/balance-sheet` | `BalanceSheet` | `reports/BalanceSheet.vue` |
| `/reports/catalogue` | `CataloguePDF` | `reports/CataloguePDF.vue` |
| `/whatsapp-orders` | `WhatsAppOrders` | `WhatsAppOrders.vue` |
| `/*` | — | redirect to `/login` |

---

## 6. Domain model

All entities are multi-tenant-scoped by `businessId` (derived from the JWT; not a form field).

### Item
```ts
interface Item {
  id: number;
  name: string;
  description?: string;
  stockcode: string;        // SKU
  price: number;
  defaultQty: number;
  tax?: string;
  category?: string;        // id or code from /item-categories
  supplier?: string;        // id from /item-suppliers
  brandId?: number;
  brand?: Brand;            // populated on GET
  createdAt?: string;
  updatedAt?: string;
}
```

### Brand
```ts
interface Brand {
  id: number;
  name: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### ColorCategory
```ts
interface ColorCategory {
  id: number;
  name: string;
  hexCode?: string;         // e.g. "#FF0000"
  description?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### ItemStockDistribution
Represents how a given stock lot is distributed across colors.
```ts
interface ItemStockDistribution {
  id: number;
  quantity: number;
  itemStock?: { id: number; ... };   // reverse reference
  colorCategory?: ColorCategory;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
interface StockDistributionSummary {
  colorName: string;
  colorHex?: string;
  quantity: number;
  percentage: number;       // of parent stock
}
```

### Other entities (inferred from API surface — Claude should flesh these out)
- **ItemCategory** — hierarchical (parent + subcategory). Used for filter dropdowns in Items and Reports.
- **ItemPrice** — history or variant pricing attached to an item.
- **ItemStock** — stock row per item per warehouse, with quantity and (optionally) color distributions.
- **AccountMapping** — links an `Item` to a GL `Account` (used for double-entry-ish bookkeeping).
- **Account** — chart-of-accounts entry.
- **Warehouse** — `{ id, name, address, ... }`.
- **Business** — tenant record (`name`, contact, logo, currency, etc.).
- **Supplier** — `{ id, name, contact, ... }`.
- **Customer** — `{ id, name, phone, email, ... }`.
- **Sale** — POS transaction header + lines; ties to customer, warehouse, items.
- **Invoice** — invoice view of sales (may be 1:1 with Sale or grouped).
- **Expense** — `{ id, date, category, amount, description, account }`.
- **User** — `{ id, username, email, roles[], permissions[], businessId }`.
- **Role** — `{ id, name, permissions[] }`.
- **Common** — generic lookup table; records are typed by `type` (e.g. `ITEM_CATEGORY`). Endpoint: `/common/type/:TYPE`.
- **WhatsAppOrder** — order intake from WhatsApp channel with status progression.

---

## 7. API surface

Base URL: `Configs.API_BASE_URL` (currently `https://business.mwendavano.com/api`, togglable to `http://localhost:3000`).
Reports PDF base URL: `Configs.REPORT_BASE_URL`.
All endpoints require `Authorization: Bearer <jwt>` except `/auth/login` and `/auth/refresh`.

### Auth
- `POST /auth/login` — body `{ username, password }` → `{ access_token, refresh_token }`.
- `POST /auth/refresh` — body `{ refreshTokenDto: { refreshToken, userId } }` → `{ newToken }`.

### Catalog & masters
- `GET/POST/PUT/DELETE /brands` (+ `/brands/active`, `/brands/total`, `/brands/active/count`, `/brands/:id`).
- `GET/POST/PUT/DELETE /color-categories` (+ `/color-categories/:id`).
- `GET/POST/PUT/DELETE /item-categories`.
- `GET /common`, `POST /common`, `GET /common/type/:TYPE` (generic lookup).
- `GET/POST/PUT/DELETE /item-suppliers`.
- `GET/POST/PUT/DELETE /warehouses`.
- `GET/POST/PUT/DELETE /business` (plus `GET /business/:id`).
- `GET/POST/PUT/DELETE /customers`.
- `GET/POST/PUT/DELETE /account` (chart of accounts).

### Items
- `GET/POST/PUT/DELETE /items`.
- `POST /items/:itemId/upload-image` — multipart `formData`.
- `GET/POST/PUT/DELETE /items/item-prices`.
- `GET/POST/PUT/DELETE /items/item-stocks`.
- `GET /items/item-stocks/available` — count of items with stock.
- `GET /items/item-stocks/actual-value` — total stock valuation.
- `GET /items/item-stocks/low-stock` — count of items below threshold.
- `GET/POST/PUT/DELETE /items/item-stock-distributions` (+ `/:id`).
- `GET/POST/PUT/DELETE /items/account-mappings`.

### Sales
- `GET/POST/PUT/DELETE /sales`.
- `GET /sales/recent-sales`.
- `GET /sales/total-sales` → current-period aggregate.
- `GET /sales/total-sales-count`.
- `GET /sales/total-sales-by-week` → time-series for dashboard chart.
- `GET /sales/top-products`.
- `POST /sales/sales-by-days` → body with date range; returns bucketed sales.

### Expenses
- `GET/POST/PUT/DELETE /expenses`.

### Reports
- `GET /reports/retention` — customer retention.
- `GET /reports/shelf-time` — time items spend on shelves.
- `GET /reports/inventory` — inventory valuation/position.
- Balance sheet & product catalogue are rendered client-side (PDF export on catalogue page).

### Users & roles
- `GET/POST/PUT/DELETE /users`.
- `GET /roles`.

### Integrations
- `GET /whatsapp/orders`, `GET /whatsapp/stats/orders`.
- `GET /meta-ads/recommendations`, `POST /meta-ads/sync`.

### Conventions
- REST, JSON over HTTPS.
- Timestamps: ISO-8601 strings (`createdAt`, `updatedAt`).
- Money fields: plain numbers; format in the UI (TZS currency is default: `TZS{{ n.toLocaleString() }}`).
- Error shape: non-2xx with a text/JSON body; interceptor surfaces via SweetAlert.

### Service layer convention
Each resource gets a small object in `src/services/<resource>Service.js` exposing `{ getAll, getById, create, update, delete }` and resource-specific reads. Files use `import api from './Api'` and wrap every call in `try/catch` with a console error then re-throw. Views call these services; views MUST NOT call Axios directly (the few that use `api.get` inline are legacy and should be migrated in the rebuild).

Views also use a shared `apiCall(url, opts?)` helper (to be extracted into `services/Api.js` or `utils/apiCall.js`) that wraps fetch-style calls with the auth token. Standardize on the Axios service pattern.

---

## 8. Module specifications

Each section lists: **purpose**, **primary endpoints**, **key UI**, **state**, **notable behaviors**.

### 8.1 Dashboard (`/`)
- **Purpose:** Business-intelligence summary for the signed-in business.
- **Endpoints:** `/sales/total-sales`, `/sales/recent-sales`, `/sales/total-sales-count`, `/sales/total-sales-by-week`, `/sales/top-products`, `/items/item-stocks/available`, `/items/item-stocks/actual-value`, `/items/item-stocks/low-stock`, `/items/item-stocks`.
- **UI:** Hero header (business title, live "System Online" indicator, transactions-loaded counter, Refresh). 4 KPI cards: Total Revenue (with MoM growth bar), Total Stocks, Stock Value, Low-Stock Count. Charts (Chart.js): weekly sales line/bar, top-products bar. Recent transactions list.
- **State:** numbers (totalRevenue, totalProducts, totalStockValues, lowStockCount, totalTransactions), chart datasets, recentTransactions list, isRefreshing flag, lastUpdated relative time.
- **Behavior:** All cards render optimistically with skeletons while loading. Refresh re-fetches every endpoint in parallel.

### 8.2 Items (`/items/item`)
- **Purpose:** Full item catalog management.
- **Endpoints:** `/items` (CRUD), `/brands`, `/warehouses`, `/item-suppliers`, `/item-categories`, `/items/item-prices`, `/items/item-stocks`, `/items/:id/upload-image`.
- **UI:** Page header with Refresh, Export, Add Item. Filter row with dropdowns: Category → Subcategory (dependent), Warehouse, Brand. Search box. Paginated table (`ItemsTable.vue`) with columns for image, name, stockcode, category, price, stock, brand, actions (edit/delete). Add/Edit modal with image upload.
- **State:** `items[]`, `parentCategories[]`, subcategory derivation, filters (`selectedCategory`, `selectedSubcategory`, `selectedWarehouse`, `selectedBrand`, searchQuery), pagination (`currentPage`, `pageSize`), loading, modalOpen, currentItem.
- **Behavior:** Changing category resets subcategory and page. Changing any filter resets page to 1. Image upload posts multipart after item create.

### 8.3 Item Prices (`/items/item-price`)
- **Purpose:** Manage per-item price history or variants.
- **Endpoints:** `/items/item-prices` (CRUD), `/items` (for item dropdown).
- **UI:** Table + Add/Edit modal with item selector, price, effective date, currency.
- **State:** `prices[]`, `items[]`, editing state, filters.

### 8.4 Inventory (`/items/inventory`)
- **Purpose:** Manage `ItemStock` — quantity of an item at a warehouse, optionally broken down by color.
- **Endpoints:** `/items/item-stocks` (CRUD), `/items`, `/warehouses`, `/items/item-stock-distributions` (CRUD).
- **UI:** Table of stock rows grouped by item/warehouse, with expandable color distribution subtable. Add stock modal includes item, warehouse, total quantity, and a repeatable color-distribution input set (color + quantity); UI should enforce sum of distributions ≤ total quantity.
- **State:** `itemStocks[]`, `items[]`, `warehouses[]`, `colorCategories[]`, distribution draft rows, modal state.
- **Behavior:** Distributions are created after the parent stock exists (sequential POSTs). A `StockDistributionSummary` view shows per-color percentages.

### 8.5 Item Account Mapping (`/items/account-mappings`)
- **Purpose:** Map each item to a GL account (e.g. revenue/COGS).
- **Endpoints:** `/items/account-mappings` (CRUD), `/items`, `/account`.
- **UI:** Table of (item → account) pairs; modal to add/edit.

### 8.6 Sales / POS (`/pos-sales`)
- **Purpose:** Record sales transactions.
- **Endpoints:** `/sales` (CRUD), `/customers`, `/items`, `/warehouses`.
- **UI:** Header (Refresh, Export, Bulk Actions, Add Sale). Filters: customer, date range, warehouse, status. Paginated table. Add Sale modal with customer selector, warehouse, line-item editor (item search, qty, unit price), totals, payment method, notes.
- **State:** `sales[]`, `customers[]`, `items[]`, `warehouses[]`, pagination, filters, draft sale with lines.
- **Behavior:** Totals recompute live as lines change. After save, append to list and clear draft.

### 8.7 Invoices (`/invoices`)
- **Purpose:** List and view invoice documents (derived from sales).
- **UI:** Filterable table of invoices; row actions for View / Print / Download PDF / Email.

### 8.8 Expenses (`/expense`)
- **Purpose:** Record operating expenses.
- **Endpoints:** `/expenses` (CRUD).
- **UI:** Table, filters (date range, category), Add/Edit modal with date, category, amount, description, linked account.

### 8.9 Customers (`/customers`)
- **Endpoints:** `/customers` (CRUD).
- **UI:** Table, search, Add/Edit modal (name, phone, email, address, notes).

### 8.10 Reports (`/reports`)
- **Endpoints:** `/sales/sales-by-days` (POST), `/reports/retention`, `/reports/shelf-time`, `/reports/inventory`, `/brands`, `/common/type/ITEM_CATEGORY`, `/whatsapp/orders`, `/whatsapp/stats/orders`, `/meta-ads/recommendations`, `/meta-ads/sync`.
- **UI:** Hub view with report cards; each card opens a detailed panel (sales trends over custom date range, retention cohorts, shelf-time distribution, inventory valuation, WhatsApp order stats, Meta Ads recommendations). Filters: brand, category/subcategory.
- **Sub-routes:**
  - `/reports/balance-sheet` — client-rendered balance sheet with assets/liabilities/equity; print/PDF export.
  - `/reports/catalogue` — loads `/item-categories` and renders a printable PDF catalogue of items grouped by category.

### 8.11 Settings
The **Settings** hub route (`/settings`) is a landing page that links to each sub-setting. Sub-modules all follow the same CRUD table + modal pattern.

| Route | Resource | Notes |
|---|---|---|
| `/settings/common` | `/common` | Generic lookup table (type + key + value). |
| `/settings/suppliers` | `/item-suppliers` | Supplier master. |
| `/settings/item-categories` | `/item-categories` | Parent/child hierarchy. |
| `/settings/color-categories` | `/color-categories` | `name`, `hexCode`, swatch preview. |
| `/settings/brands` | `/brands` | Logo upload, website, active toggle. |
| `/settings/warehouses` | `/warehouses` | Name, address. |
| `/settings/businesses` | `/business` | Tenant-level config. |
| `/settings/accounts` | `/account` | Chart of accounts. |
| `/users/user` | `/users`, `/roles` | User invite, role assignment, permission view. |

### 8.12 WhatsApp Orders (`/whatsapp-orders`)
- **Endpoints:** `/whatsapp/orders`, `/whatsapp/stats/orders`.
- **UI:** Stats cards (Total Orders, Pending, Delivered, Total Revenue TZS). Status breakdown grid (Pending/Confirmed/Processing/Shipped/Delivered/Cancelled). Orders table with filter-by-status, click-through to order detail. Refresh button.

### 8.13 Login (`/login`)
- Centered card on gradient background. Email + password (password toggle). "Remember me" checkbox. "Forgot password?" link (stub). Inline error banner on failure. Success sets the user store and redirects to `/`.

---

## 9. UX conventions

### Page skeleton
Every authenticated page starts with:
```vue
<SwalAlert ref="swalAlert" />
<div class="min-h-screen bg-neutral-50 p-6">
  <div class="max-w-full mx-auto">
    <!-- Breadcrumb -->
    <div class="flex items-center text-sm text-neutral-500 mb-6">
      <HomeIcon class="w-4 h-4 mr-2" />
      <span>Home</span>
      <ChevronRightIcon class="w-4 h-4 mx-2" />
      <span class="text-neutral-900 font-medium">{{ pageTitle }}</span>
    </div>

    <!-- Header card -->
    <div class="card mb-6">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between p-6">
        <div>
          <h1 class="text-3xl font-bold text-neutral-900">{{ pageTitle }}</h1>
          <p class="text-neutral-600 mt-2">{{ subtitle }}</p>
        </div>
        <div class="flex items-center space-x-3 mt-4 lg:mt-0">
          <!-- Refresh / Export / Primary action -->
        </div>
      </div>
    </div>

    <!-- Filter card -->
    <!-- Data card with table + pagination -->
    <!-- Modal(s) -->
  </div>
</div>
```

### Cards
All content lives inside `.card` (white, rounded-xl/2xl, soft shadow). Filter rows are inside their own card.

### Buttons
- **Primary:** `btn-primary` — `bg-brand-600 hover:bg-brand-700 text-white rounded-xl px-4 py-2 shadow-soft`.
- **Secondary:** `btn-secondary` — white with neutral border, hover fills to white.
- Icons always use Heroicons outline at `w-4 h-4 mr-2`.

### Tables
- Header row `text-xs uppercase text-neutral-500 tracking-wider`.
- Rows: `text-sm text-neutral-700`, hover `bg-neutral-50`.
- Actions column with edit/delete icon buttons.
- Pagination below: page size selector + numbered pager + "Showing X of Y" count.

### Filters
- Inline pill row at top of data card: label + `<select>` or input. Changing any filter resets `currentPage = 1`. Dependent dropdowns (Category → Subcategory) hide the child until the parent has a value and clear it on parent change.

### Forms & modals
- Modals are full-screen-on-mobile, centered dialog on desktop (`max-w-2xl`), with sticky footer containing Cancel (secondary) + Save (primary).
- Inputs use `input-field` class; labels `input-label`.
- Client-side validation happens on submit; errors render below each field in `text-sm text-red-600`.

### Feedback
- All destructive actions (Delete) confirm through SweetAlert2 (`<SwalAlert />`).
- Success toasts after create/update/delete.
- Server errors surface as SweetAlert error dialogs with the server message if present.

### Currency & formatting
- Display currency as `TZS{{ n.toLocaleString() }}` unless the business config overrides — accept this as the v1 default but make it a constant.
- Dates: `toLocaleDateString()`; times: `toLocaleString()`.

### Empty states
Every table has an empty state: centered icon + heading + subtitle + CTA (e.g. "Add your first item").

### Loading states
- Spinners use `border-4 border-neutral-200 border-t-brand-600 rounded-full animate-spin`.
- Buttons disable during in-flight actions and show an inline spinner.

---

## 10. Non-functional requirements

- **Responsiveness:** All pages work from 1280px+ (primary target) down to 768px (tablet). Sidebar collapses into a drawer below `lg`.
- **Accessibility:** Keyboard-navigable menus and modals; labels tied to inputs; focus rings visible.
- **Performance:** Lazy-load heavy routes (`Reports`, `CataloguePDF`, `Invoices`) via dynamic `import()` in the router. Paginate all tables; default page size 20.
- **Error handling:** Global Axios interceptor catches 401 and refreshes. All other errors bubble to the calling view which must render a SweetAlert.
- **Persistence:** Only the user store is persisted (localStorage) so session survives reload.
- **Security:**
  - Never log tokens.
  - Redirect to `/login` on any auth failure.
  - Do not store `businessId` in component state only — always read from the user store.
  - All write operations are permission-gated on the server; the UI should ADDITIONALLY hide actions the user lacks permission for.
- **Build:** `npm run dev` (Vite dev server), `npm run build` (production), `npm run preview`.
- **Env:** `src/utils/Configs.js` holds `API_BASE_URL` and `REPORT_BASE_URL`. Rebuild should move these into `.env` / `import.meta.env.VITE_API_BASE_URL`.

---

## 11. What Claude should produce

When handed this document, Claude should:

1. Ask the user only if these are unclear: target browsers/devices, localization/currency beyond TZS, whether to migrate `.js` files to `.ts`, whether to keep the existing backend contract verbatim.
2. Produce a `README.md` describing setup.
3. Scaffold the directory layout from §2.
4. Implement the app shell (`AppLayout`, `AppHeader`, `AppSidebar`), Tailwind theme, and auth flow end-to-end first.
5. Implement the service layer for every resource in §7 using the Axios pattern from §2/§7.
6. Implement each module in §8 in this order: **Dashboard → Items → Inventory → Sales → Customers → Settings/Brands → Settings/Color Categories → Settings/Item Categories → Settings/Suppliers → Settings/Warehouses → Settings/Businesses → Settings/Accounts → Settings/Common → Users → Expenses → Invoices → Item Prices → Item Accounts → Reports → Balance Sheet → Catalogue PDF → WhatsApp Orders**.
7. After each module, run `npm run build` to ensure type/compile errors are zero before moving on.
8. Defer: tests, i18n, offline mode (unless the user asks).

---

## 12. Open questions for the user to answer before build

1. Should this rebuild keep the exact backend contract (as documented in §7), or is the backend also being rewritten?
2. Is TypeScript mandatory across all new code (services, stores, views) or is `.js` still acceptable in the service/store layer?
3. Currency/locale: default `TZS` and `en-GB`-ish formatting — correct for all tenants, or per-business config?
4. Are `permissions` strings authoritative for gating UI? If so, a list of known permission names would help.
5. Should reports render PDFs client-side (jsPDF/pdfmake) or call a server endpoint on `REPORT_BASE_URL`?
