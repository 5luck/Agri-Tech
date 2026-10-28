# Agri-Tech: Smart Farming Management System

Agri-Tech is an enterprise-grade full-stack smart farming management platform built on the MERN stack (MongoDB, Express.js, React.js, Node.js). It bridges traditional farming practices with modern digital tools, delivering real-time agro-climatic telemetry, farm and crop cycle monitoring, soil health analytics, automated pest advisories, an agricultural inputs marketplace, and a direct consultation network with verified agricultural scientists.

---

## 1. Project Overview & Key Features

- **Centralized Farm & Crop Management**: Register agricultural plots with GIS coordinates, soil classification, irrigation methods, phenological growth stages, and scheduled farming activity checklists.
- **Live Agro-Weather & Severe Risk Telemetry**: Integrated Open-Meteo weather forecasting with backend caching (30-min TTL), WMO condition mapping, 7-day temperature trends, and precipitation probability modeling.
- **Agronomic Soil Health Engine**: Transparent, agronomic rule-based interpretation of pH, Nitrogen, Phosphorus, Potassium (NPK), and Moisture metrics with actionable amendments.
- **Pest Alerts & Agricultural Advisories**: Community and scientist-reported pest threat bulletins with severity levels (Low, Moderate, High, Critical) and recommended control treatments.
- **Agricultural Resource Marketplace**: Catalog of certified seeds, bio-fertilizers, and drip equipment with real-time stock decrements and server-validated development mode checkout.
- **Expert Consultation Network**: Direct text-based consultation channel between farmers and verified agronomists, plant doctors, and irrigation engineers.
- **Farmer Community Forum**: Category-driven agricultural discussion boards with comment threads and moderation flags.
- **Administrator Control Portal**: Real-time aggregated database telemetry, user suspension/activation, expert verification, product approval, and security audit logs.
- **Multilingual Support**: Fully localized interface in English and Hindi (हिन्दी) via `react-i18next`.
- **Nature-Inspired Visual Design System**: Dedicated palette featuring Forest Green (`#244C3A`), Warm Ivory (`#F7F6EF`), Leaf Green, and Earth Brown accents.

---

## 2. Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Routing**: React Router DOM v6
- **Data Visualization**: Recharts (interactive 7-day weather trends, precipitation bars, NPK soil fertility bars)
- **Icons**: Lucide React
- **Internationalization**: i18next & react-i18next
- **HTTP Client**: Axios with JWT interceptors
- **Styling**: Nature-inspired CSS design system (`tokens.css`, `global.css`)

### Backend
- **Runtime**: Node.js (LTS v22+)
- **API Framework**: Express.js REST API (`/api/v1`)
- **Database Modeling**: Mongoose 8
- **Authentication**: JWT (JSON Web Tokens) & bcryptjs password hashing
- **Security**: Helmet, CORS, and Express Rate Limiting
- **Logging**: Morgan HTTP logger and structured audit logger
- **External API**: Open-Meteo Weather API

### Database
- **Primary**: MongoDB (Local daemon or MongoDB Atlas)
- **Automatic Fallback**: `mongodb-memory-server` embedded in-memory database automatically boots during development and testing if an external MongoDB daemon is not currently active, ensuring zero-configuration execution.

---

## 3. Architecture Overview

```text
                             AGRI-TECH PLATFORM
                                     |
              +----------------------+----------------------+
              |                                             |
         React Client                                  Express API
       (Vite Development)                              (/api/v1)
              |                                             |
     React Router v6                               JWT Authentication
     i18n (EN / HI)                                Role Authorization
     Recharts Visualizations                       Request Validation
     API Interceptors                              Agronomic Rule Engine
              |                                             |
              +--------------------------------------+      |
                                                     |      |
                                                  MongoDB / In-Memory
                                                            |
                                             External Integrations
                                                            |
                                                   Open-Meteo Weather
```

---

## 4. Installation & Quick Start

### Prerequisites
- Node.js v20.0.0 or higher (Tested on Node.js v24 LTS)
- npm v10+

### Clone & Install Dependencies
From the repository root:
```bash
# Install all workspace dependencies across client and server
npm install
```

### Environment Configuration
Both `server` and `client` have preconfigured `.env` and `.env.example` files:

#### Backend (`server/.env`):
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/agritech
JWT_ACCESS_SECRET=agritech_super_secret_jwt_access_key_2026_dev_seed
JWT_ACCESS_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
WEATHER_API_BASE_URL=https://api.open-meteo.com
LOG_LEVEL=debug
```

#### Frontend (`client/.env`):
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

---

## 5. Development & Running the Application

### Option A: Run Both Frontend and Backend Concurrently
```bash
npm run dev
```

### Option B: Run Services Independently

**Start the Backend Server (Port 5000):**
```bash
npm run dev:server
# or
node server/src/server.js
```

**Start the React Vite Client (Port 5173):**
```bash
npm run dev:client
# or
npm run dev --prefix client
```

Navigate to [http://localhost:5173](http://localhost:5173) in your browser.

---

## 6. Demonstration Seed Data & Credentials

If the database is empty on server startup, it will automatically populate with realistic agricultural demonstration data. You can also manually re-seed anytime:

```bash
npm run seed
```

### Pre-Seeded Demonstration Accounts:
| Role | Email | Password | Details |
|---|---|---|---|
| **Administrator** | `admin@agritech.demo` | `AdminPass123!` | System oversight, approvals, and audit logs |
| **Farmer (Primary)** | `rajesh@agritech.demo` | `FarmPass123!` | Owns farms in Gujarat & Maharashtra |
| **Farmer (Secondary)** | `harpreet@agritech.demo` | `FarmPass123!` | Owns basmati rice & wheat farms in Punjab |
| **Agricultural Expert** | `ananya.expert@agritech.demo` | `ExpertPass123!` | Ph.D. Agronomist, Soil Nutrition Specialist |
| **Agricultural Expert** | `vikram.expert@agritech.demo` | `ExpertPass123!` | Ph.D. Plant Protection, IPM Specialist |

*(Quick-login buttons are also provided on the `/login` screen for 1-click exploration.)*

---

## 7. Testing Suite

Run the automated backend test suites (unit, CRUD, authorization, and lifecycle workflows):

```bash
npm test
# or
npm run test --prefix server
```

**Test Coverage Summary:**
- **Health & Public**: Endpoint status, public marketplace catalog, verified expert directory.
- **Authentication**: Registration, duplicate rejection, role tampering protection, password hashing.
- **Authorization & Data Isolation**: Cross-farmer private record isolation (Farmer A cannot read or modify Farmer B's farms/crops).
- **Soil Engine**: Agronomic threshold evaluation, pH balancing, nitrogen/moisture stress triggers.
- **Marketplace**: Server-side price validation, inventory decrements, and development checkout.
- **Admin Control**: Route gating, account suspension, and verification.
- **Workflows**: Full consultation question/response lifecycle, post reporting & moderation, product submission & approval.

All 28 automated integration tests pass with 100% success.

---

## 8. REST API Specification Summary (`/api/v1`)

### Authentication & Profiles
- `POST /api/v1/auth/register` - Register a new farmer or agricultural expert.
- `POST /api/v1/auth/login` - Authenticate and retrieve JWT token.
- `GET /api/v1/auth/me` - Retrieve current active user profile.
- `PATCH /api/v1/auth/profile` - Update profile, language preference, or expert bio.

### Farms & Crops
- `GET /api/v1/farms` - List accessible farms.
- `POST /api/v1/farms` - Register a new agricultural plot.
- `GET /api/v1/farms/:id` - Farm details (enforces ownership).
- `PATCH /api/v1/farms/:id` - Update farm metadata.
- `GET /api/v1/farms/:farmId/summary` - Aggregated farm dashboard summary.
- `GET /api/v1/crops` - List crops with status filter.
- `POST /api/v1/crops` - Register crop on farm.
- `POST /api/v1/crops/:id/activities` - Schedule farming task.
- `PATCH /api/v1/crops/:id/activities/:activityId` - Toggle activity completion.

### Soil & Weather
- `GET /api/v1/soil-records/farm/:farmId` - Retrieve historical soil measurements.
- `POST /api/v1/soil-records/farm/:farmId` - Log soil test; runs rule-based analysis.
- `GET /api/v1/weather/farm/:farmId/current` - Live current weather conditions.
- `GET /api/v1/weather/farm/:farmId/forecast` - 7-day forecast & hourly precipitation.

### Marketplace & Orders
- `GET /api/v1/products` - Browse approved supplies with search and category filters.
- `POST /api/v1/products` - Submit product for approval.
- `POST /api/v1/orders` - Place order (server-side inventory validation).
- `GET /api/v1/orders` - View order history.
- `PATCH /api/v1/orders/:id/cancel` - Cancel order and restore inventory.

### Consultations & Community
- `GET /api/v1/consultations/experts` - Directory of verified agricultural scientists.
- `POST /api/v1/consultations` - Submit consultation inquiry.
- `POST /api/v1/consultations/:id/messages` - Send reply message in consultation thread.
- `PATCH /api/v1/consultations/:id/status` - Update consultation status.
- `GET /api/v1/posts` - Browse community forum posts.
- `POST /api/v1/posts` - Publish a new discussion.
- `POST /api/v1/posts/:id/comments` - Reply to discussion.
- `POST /api/v1/posts/:id/report` - Report inappropriate post to moderators.

### Administrative Control
- `GET /api/v1/admin/overview` - Aggregated platform counts and metrics.
- `GET /api/v1/admin/users` - Search and list all platform users.
- `PATCH /api/v1/admin/users/:id/status` - Suspend or reactivate account.
- `PATCH /api/v1/admin/experts/:id/verification` - Verify or reject expert.
- `PATCH /api/v1/admin/products/:id/approval` - Approve or reject product listing.
- `GET /api/v1/admin/reports` - Review flagged forum posts.
- `GET /api/v1/admin/audit-logs` - View platform security audit trail.

---

## 9. Production Build

To build the optimized client bundle:
```bash
npm run build
```
The production bundle is compiled into `client/dist` with manual chunk splitting for `vendor`, `charts`, `icons`, and `i18n`.

---

## 10. License

This project is licensed under the MIT License.
