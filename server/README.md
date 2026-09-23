# Polar India Hub — Backend API Server

The backend REST API server for **Polar India Hub**, powering scientific research metadata, evidence provenance chains, educational learning tracks, and AI-assisted contextual research analysis.

---

## ❄️ Key Capabilities

- **Strict Evidence Provenance**: Stores and serves scientific findings linked directly to source research papers, expedition field campaigns, monitoring stations, and observational datasets.
- **Contextual AI Research Assistant**: Integrates Google Gemini (`@google/genai` gemini-2.5-flash) to provide source-grounded summaries, key findings extraction, and contextual chat with fallback logic.
- **Robust Authentication & Security**:
  - Email/Password authentication using `bcryptjs` salt hashing and signed `jsonwebtoken` (JWT) bearer tokens.
  - User registration enforced with `confirmPassword` equality verification.
  - Google OAuth identity endpoint (`/api/auth/google`) creating verified scholar accounts and issuing JWTs.
  - Security headers enforced with `helmet` and strict CORS restrictions.
- **Science Dissemination Engine**: Generates grounded outreach drafts (presentation slides, scripts, infographics) with guaranteed NCPOR citation attribution.
- **Telemetry & QA/QC Governance**: Tracks Antarctic, Arctic, and Himalayan station mooring status and enforces scientific metadata conventions (NetCDF-4, TEOS-10, EPSG projections).

---

## 🛠️ Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/) (v18+)
- **Web Framework**: [Express 5](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose 9](https://mongoosejs.com/)
- **Authentication**: JWT (`jsonwebtoken`) & `bcryptjs`
- **Security & Utilities**: `helmet`, `cors`, `morgan`, `dotenv`
- **AI Integration**: [@google/genai](https://www.npmjs.com/package/@google/genai) (Google Gemini SDK)

---

## 📁 Project Structure

```text
server/
├── package.json                 # Server dependencies and npm scripts
├── .env.example                 # Template for required environment variables
├── test/                        # Automated unit and integration tests
└── src/
    ├── server.js                # Express app entry point & MongoDB connection
    ├── config/                  # Configuration loaders (env, database)
    ├── controllers/             # Request handlers
    │   ├── adminController.js   # Directorate dashboard and record moderation
    │   ├── authController.js    # Registration (with confirmPassword), login, OAuth
    │   ├── catalogController.js # Expeditions, stations, datasets, publications
    │   ├── evidenceController.js# Provenance graph node & edge generator
    │   ├── learningController.js# Quizzes and educational track progression
    │   ├── mysteryController.js # Polar mystery investigation states
    │   ├── outreachController.js# AI-assisted science communication studio
    │   └── researchController.js# Research catalog, paper reader, Gemini AI
    ├── models/                  # Mongoose data schemas
    │   ├── Dataset.js
    │   ├── EvidenceLink.js
    │   ├── Expedition.js
    │   ├── Finding.js
    │   ├── Media.js
    │   ├── Mystery.js
    │   ├── OutreachDraft.js
    │   ├── Publication.js
    │   ├── ResearchResource.js
    │   ├── Station.js
    │   └── User.js
    ├── routes/                  # Express route definitions
    │   ├── adminRoutes.js
    │   ├── authRoutes.js
    │   ├── catalogRoutes.js
    │   ├── evidenceRoutes.js
    │   ├── learningRoutes.js
    │   ├── mysteryRoutes.js
    │   ├── outreachRoutes.js
    │   └── researchRoutes.js
    ├── middleware/              # Auth guard, error handler, rate limiters
    ├── seed/                    # Database seeding scripts
    │   └── seedDatabase.js      # Populates prototype scientific datasets & stations
    └── services/                # External API adapters & Gemini AI client
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the `server/` directory based on `.env.example`:

```env
# Server Runtime
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# Database Connection (Local MongoDB or MongoDB Atlas)
MONGODB_URI=mongodb://localhost:27017/polar-india-hub

# Authentication
JWT_SECRET=your_secure_jwt_secret_key_change_in_production

# Google Gemini Integration (Optional — falls back to deterministic prototype model if unset)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
GEMINI_ENABLED=true
GEMINI_TIMEOUT_MS=30000

# External Polar Data Adapters (Optional)
EXTERNAL_DATA_ENABLED=false
NASA_EARTHDATA_TOKEN=
NASA_CMR_BASE_URL=https://cmr.earthdata.nasa.gov/search
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB instance running on port `27017` or a MongoDB Atlas cluster URI

### Installation

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Seed the database with polar stations, expeditions, and research papers:
   ```bash
   npm run seed
   ```

### Running the Server

- **Development Mode** (auto-restart with Nodemon):
  ```bash
  npm run dev
  ```
- **Production Mode**:
  ```bash
  npm start
  ```
- **Run Tests**:
  ```bash
  npm test
  ```

Server will start listening on `http://localhost:5000`.

---

## 📡 API Reference

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new scholar account (`name`, `email`, `password`, `confirmPassword`) | No |
| `POST` | `/api/auth/login` | Login with email and password, returns JWT | No |
| `POST` | `/api/auth/google` | Google OAuth login/registration | No |
| `GET` | `/api/auth/me` | Fetch authenticated scholar profile | Yes (Bearer Token) |

### 2. Research Resources (`/api/research`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/research` | List research papers with pagination, search, region, and type filters |
| `GET` | `/api/research/:id` | Get research paper details, linked findings, and related resources |
| `POST` | `/api/research/:id/analyze` | Run AI contextual analysis (summary, key findings, simple explanation) |
| `POST` | `/api/research/:id/chat` | Contextual grounded Q&A on paper content |

### 3. Evidence Provenance Graph (`/api/evidence`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/evidence/:findingId` | Retrieve directed provenance graph (nodes & edges) for a scientific finding |

### 4. Catalog Collections (`/api/*`)
| Endpoint | Description |
| :--- | :--- |
| `/api/expeditions` | Indian polar field campaigns across Antarctica, Arctic, and Himalaya |
| `/api/stations` | Research stations: Bharati, Maitri, Himadri, and Himansh |
| `/api/datasets` | Verified cryospheric and oceanographic observational datasets |
| `/api/publications` | Peer-reviewed papers and institutional research reports |
| `/api/media` | Field photographs, video recordings, and historical documentation |

### 5. Learning & Mysteries (`/api/learning`, `/api/mystery`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/learning` | Fetch educational learning tracks and quiz modules |
| `GET` | `/api/mystery/:id` | Retrieve polar mystery investigation dossier |
| `POST` | `/api/mystery/:id/investigate`| Submit evidence hypothesis and verify scientific conclusions |

### 6. Science Communication Studio (`/api/outreach`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/outreach/generate` | Generate source-attributed story drafts (presentation, post, script) |

### 7. Administration Directorate (`/api/admin`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard` | Directorate operational metrics, evidence links, and outreach records |
| `GET` | `/api/admin/:section` | Paginated records with publication state controls |
| `PATCH`| `/api/admin/:section/:id` | Update publication state (`draft`, `published`, `archived`) |
