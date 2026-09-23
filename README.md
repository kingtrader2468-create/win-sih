# 🇮🇳 Polar India Hub

> **Empirical Research · Scientific Provenance · Polar Geospatial Education**  
> An open-source sovereign research and education portal representing India's polar scientific endeavors across Antarctica, the Arctic, and the Himalayas under the **Ministry of Earth Sciences (MoES)** and the **National Centre for Polar and Ocean Research (NCPOR)**.

---

## 🧭 Project Overview

**Polar India Hub** bridges the gap between deep polar field science and public education. The platform prioritizes **strict empirical grounding**, ensuring every headline, learning module, and communication story is traceable back to verified research papers, in-situ station moorings, and expedition datasets.

### The Polar Triad
India maintains a continuous research presence across Earth's three poles:
1. **Antarctica (South Pole)**:
   - **Bharati Station** (69.41°S, 76.19°E, Larsemann Hills) — High-tech year-round research facility with high-speed satellite telemetry.
   - **Maitri Station** (70.77°S, 11.73°E, Schirmacher Oasis) — Year-round observatory conducting atmospheric and geological investigations.
   - **Dakshin Gangotri** (70.09°S, 12.00°E) — India's historical first Antarctic base, now functioning as a key transit and supply depot.
2. **Arctic (North Pole)**:
   - **Himadri Station** (78.92°N, 11.93°E, Ny-Ålesund, Svalbard, Norway) — Long-term atmospheric, biological, and glaciological monitoring.
   - **IndARC Mooring** (79.01°N, 11.58°E, Kongsfjorden) — India's sovereign underwater multi-sensor moored observatory.
3. **Himalayas (The Third Pole)**:
   - **Himansh Station** (32.41°N, 77.62°E, Sutri Dhaka, Spiti Valley, Himachal Pradesh, 4,080m) — Dedicated high-altitude research facility monitoring Himalayan cryosphere dynamics, glacier mass balance, and runoff hydrology.

---

## 🏗️ Architecture & Tech Stack

```text
polar-india-hub/
├── client/                      # React 19 + Vite + Leaflet frontend application
│   ├── src/
│   │   ├── assets/              # Icons, station images, SVG marks
│   │   ├── components/          # Navbar, NotificationDropdown, SearchModal, QuizCard
│   │   ├── context/             # AuthContext, ThemeContext
│   │   ├── layouts/             # AppLayout, Footer
│   │   ├── pages/               # HomePage, PolarMapPage, MysteryPage, AuthPage, MorePage, etc.
│   │   └── services/            # apiClient.js (unified REST client)
│   ├── .env.example             # Frontend configuration template
│   └── package.json             # Frontend dependencies
└── server/                      # Express 5 + Node.js + Mongoose 9 REST API
    ├── src/
    │   ├── config/              # MongoDB connection & index sync
    │   ├── controllers/         # Auth, notifications, map, media, mystery, contact, etc.
    │   ├── middleware/          # JWT protect, optionalAuth, errorMiddleware
    │   ├── models/              # User, Notification, Mystery, ContactMessage, Station, etc.
    │   ├── routes/              # Express API endpoints
    │   ├── seed/                # Sovereign polar research dataset & demo data
    │   └── services/            # emailService (Nodemailer OTP), progressService, geminiService
    ├── test/                    # Node test runner suite (19 unit/integration tests)
    ├── .env.example             # Backend configuration template
    └── package.json             # Backend dependencies
```

### Core Technologies
- **Frontend**: React 19, Vite, Leaflet (interactive geospatial mapping with CartoDB Voyager & Dark Matter tiles), Recharts, Lucide React icons, Tailwind CSS / Vanilla CSS design tokens.
- **Backend**: Node.js, Express 5, MongoDB / Mongoose 9, Nodemailer (OTP verification & password reset), JSON Web Tokens (JWT), Google Identity Services OAuth 2.0.

---

## ⚡ Quick Start Guide (From Scratch)

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (`node -v`)
- **npm**: v9.0.0 or higher (`npm -v`)
- **MongoDB**: Either a local instance running on port `27017` or a [MongoDB Atlas](https://www.mongodb.com/atlas) cluster URI.

---

### 2. Backend Setup (`/server`)

1. Open your terminal and navigate to the `server` directory:
   ```bash
   cd server
   ```

2. Copy the environment configuration template:
   ```bash
   cp .env.example .env
   ```

3. Configure your `.env` variables:
   ```env
   NODE_ENV=development
   PORT=5000
   CLIENT_URL=http://localhost:5173
   MONGODB_URI=mongodb://localhost:27017/polar_india_hub_dev
   JWT_SECRET=polar-india-hub-sovereign-secret-key-2026-secure-token

   # Nodemailer SMTP Configuration (optional: falls back to in-memory preview if omitted)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-gmail-app-password
   EMAIL_FROM="Polar India Hub · NCPOR" <no-reply@polar-india-hub.gov.in>

   # Google OAuth 2.0 (optional)
   GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   ```

4. Install backend dependencies:
   ```bash
   npm install
   ```

5. Seed the sovereign polar scientific database:
   ```bash
   npm run seed
   ```
   *This seeds all 6 Indian polar research stations, live weather telemetry history, 1,400+ research papers, datasets, expeditions, publications, media assets, and deductive mystery dossiers.*

6. Start the Express API server:
   ```bash
   npm run dev
   ```
   *The backend will be running at `http://localhost:5000` (Healthcheck: `http://localhost:5000/api/health`).*

7. Run the automated test suite:
   ```bash
   npm test
   ```
   *(Verifies all 19 tests pass).*

---

### 3. Frontend Setup (`/client`)

1. In a new terminal window, navigate to the `client` directory:
   ```bash
   cd client
   ```

2. Copy the frontend environment configuration template:
   ```bash
   cp .env.example .env
   ```

3. Configure your `.env` variables:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
   ```

4. Install frontend dependencies:
   ```bash
   npm install
   ```

5. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The client application will start at `http://localhost:5173`.*

6. Build for production (optional check):
   ```bash
   npm run build
   ```

---

## 🌟 Key Features & Updates

### 🗺️ Interactive Leaflet Polar Map (`/map`)
- Powered by the **Leaflet** library (`leaflet: ^1.9.4`).
- Real-time station markers for all 6 Indian polar stations (Bharati, Maitri, Dakshin Gangotri, Himadri, IndARC, Himansh) with pulsing radar beacons.
- Dynamic theme switching: Automatically switches between **CartoDB Positron/Voyager** (light) and **CartoDB Dark Matter** (polar dark mode).
- Domain Fly-To Navigation: Smooth fly-to transitions for **Antarctica**, **Arctic**, **Himalayas**, and **Global View**.
- Dynamic environmental layers: **Climate Telemetry**, **Ocean Currents**, **Ice Sheets & Glaciers**, **Thermal Isotherms**, and **Atmosphere & Ozone** with Antarctic/Arctic boundary overlays.
- Live station inspector drawer with 24-hour temperature curve line charts (Recharts) and sensor telemetry.

### 🔔 Authenticated Scholar Notifications
- Persistent notification model in MongoDB (`Notification.js`) with REST API (`/api/notifications`).
- **Gated Display**: The notification bell is rendered **ONLY when the user is authenticated**.
- Notification dropdown includes:
  - Real-time unread count badge.
  - Formatted relative timestamps ("Just now", "15m ago", "2h ago").
  - Categorized icon badges (Telemetry, Mystery, Expedition, Badge).
  - Single-click mark as read + navigate to source.
  - "Mark all read" action.

### 🔍 Polar Mystery Dossiers (`/mystery`)
- Interactive cryospheric anomaly investigations (e.g. *The Prydz Bay Thermal Pulse Mystery*).
- Graceful fallback: Directly accessible via `/mystery` with automatic resolution of available mysteries, ensuring zero 404 errors.
- Step-by-step deductive clue verification, evidence graphs, and scientific conclusions.

### 🎬 Polar Media Catalog (`/media`)
- Filterable multimedia archive with documentary footage, ice core photographs, and expedition logs.
- Multi-dimensional filters for regions, types, and operational statuses.

### 🏛️ About Us & Contact Us (`/about`, `/contact`, `/more/about`, `/more/contact`)
- Prominently visible and directly accessible in the secondary navigation bar.
- Institutional mission, research infrastructure, leadership, and MoES charter.
- Dynamic contact form submitting validated inquiries directly to the MongoDB `ContactMessage` collection with automated ticket ID generation (`POL-TKT-XXXX`).

### 🔐 Split-Screen Authentication Portal (`/auth`)
- **Left Side**: Institutional science charter, public data guarantee (100% open public access to papers, datasets, telemetry without login), and scholar benefits.
- **Right Side**: Streamlined authentication process:
  - Unified Google Sign-In button (`Sign in with Google`).
  - Scholar Registration with **Nodemailer 6-digit OTP email validation** and resend countdown timer.
  - **Forgot Password with OTP verification** and password reset workflow.
  - Default demo credentials helper (`demo@polar-india-hub.local` / `polar2026`).

### 🌓 Polar Dark Mode & Light Mode
- One-click toggle in the navbar with persistent local storage theme preference.
- Tailored polar color palette (`#07101c` night mode, `#f4f6fa` daylight mode).

---

## 🧪 Testing & Verification

Run the comprehensive test suite from the `server` folder:
```bash
cd server
npm test
```

Expected output:
```text
✔ health: getHealth returns 503 when disconnected and 200 when connected
✔ evidence graph calculation: produces valid nodes and directed edge IDs
✔ geminiService: handles empty key or service failure with clean prototype fallback
✔ auth: password hashing and verification works with bcrypt
✔ auth: JWT token minting and decoding preserves scholar identity
✔ authMiddleware: protect rejects unauthenticated request with 401
✔ authMiddleware: optionalAuth allows guest request with req.user = null
✔ sovereign access policy: public catalogs require no auth
✔ map: getMapStations returns 6 polar stations with telemetry
✔ map: getMapLayers returns climate, ocean, ice, temperature, and atmosphere layers
✔ contact: submitContactMessage validates required fields
ℹ tests 19 | pass 19 | fail 0
```

---

## 📜 Sovereign Accreditation & License

Maintained in accordance with the **Indian Antarctic Act (2022)**, National Centre for Polar and Ocean Research (NCPOR), Ministry of Earth Sciences (MoES), Government of India.

Licensed under the [Apache License 2.0](LICENSE).

# Polar-India-Hub