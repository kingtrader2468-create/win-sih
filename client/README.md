# Polar India Hub — Frontend Client

The frontend client for **Polar India Hub**, an institutional scientific research and educational platform representing Indian polar research across Antarctica, the Arctic, and the Himalayas under the Ministry of Earth Sciences (MoES) and National Centre for Polar and Ocean Research (NCPOR).

---

## ❄️ Key Features

- **Modern Ice-Tinted Theme**: Designed with an institutional polar palette, glassmorphic header surfaces, telemetry indicators, and subtle cards.
- **Two-Tier Responsive Navigation**:
  - **Top Bar (64px)**: Official brand logo, global repository search with `⌘K` shortcut, scholar profile/sign-in status, and notifications.
  - **Sub-Navbar (42px)**: Horizontal swipeable sub-navigation bar with 9 direct sections:
    `Explore`, `Research`, `Expeditions`, `Datasets`, `Publications`, `Media`, `Learning`, `Mystery`, `Outreach`.
  - **Mobile Drawer**: Responsive drawer supporting full navigation and search on mobile viewports.
- **Interactive Polar Evidence Graph**: Interactive node-based provenance visualization using `@xyflow/react` to trace scientific claims back to expedition field observations, research stations, and datasets.
- **Docked AI Research Assistant**: Contextual research companion providing grounded summaries, key findings extraction, plain-language explanations, and Q&A powered by original source documents.
- **Comprehensive Catalog Pages**: Multi-faceted list and detail views for expeditions, stations, datasets, publications, and media with filtering and provenance breadcrumbs.
- **Polar Mystery Dossiers**: Interactive investigative scientific cases (`intro`, `investigate`, `result`) turning field anomalies into educational guided inquiries.
- **Science Communication Studio**: 5-step outreach drafting tool transforming peer-reviewed polar science into accessible school presentations, infographics, and social drafts with citation guarantees.
- **Authentication**: Scholar registration with `Confirm Password` validation, session persistence, and Google OAuth login integration.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/)
- **Routing**: [React Router 7](https://reactrouter.com/)
- **Graph & Flow Visualization**: [@xyflow/react](https://reactflow.dev/) (React Flow)
- **Charts & Telemetry**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/) & Google Material Symbols
- **Typography**: Plus Jakarta Sans (Headings), Inter (Body), Space Mono (Coordinates & Telemetry)
- **Styling**: Vanilla CSS + Tailwind utility classes with custom polar design tokens

---

## 📁 Project Structure

```text
client/
├── index.html                   # HTML template with fonts and Tailwind tokens
├── package.json                 # Dependencies and build scripts
├── vite.config.js               # Vite configuration and plugins
├── public/                      # Static public files
└── src/
    ├── assets/                  # Logos and static vector graphics (logo-icon.svg)
    ├── components/              # Reusable UI components
    │   ├── CatalogCard.jsx      # Generic catalog entity card
    │   ├── CatalogFilters.jsx   # Filter sidebar for collections
    │   ├── EvidenceDrawer.jsx   # Inspector drawer for selected graph nodes
    │   ├── Footer.jsx           # 5-column institutional footer
    │   ├── Navbar.jsx           # 2-tier responsive navbar & sub-navbar
    │   ├── ResearchCard.jsx     # Modernized research resource card
    │   └── SearchModal.jsx      # Quick search popup (⌘K)
    ├── context/
    │   └── AuthContext.jsx      # Global scholar auth state & JWT persistence
    ├── layouts/
    │   └── AppLayout.jsx        # Application shell with dual-navbar clearance
    ├── pages/                   # Application route views
    │   ├── AdminPage.jsx        # Directorate console, stations, QA/QC, & analytics
    │   ├── AuthPage.jsx         # Scholar sign in, registration, & Google OAuth
    │   ├── CatalogPages.jsx     # List & detail views for 5 catalog collections
    │   ├── EvidenceGraphPage.jsx# Interactive ReactFlow provenance graph
    │   ├── HomePage.jsx         # Polar portal landing page with live station telemetry
    │   ├── LearningHubPage.jsx  # Methodology tracks, modules, & interactive quizzes
    │   ├── MysteryPage.jsx      # 3-stage polar mystery investigation dossier
    │   ├── NotFoundPage.jsx     # Polar compass 404 page
    │   ├── OutreachPage.jsx     # Science communication story generator
    │   ├── ProfilePage.jsx      # Scholar accreditation seal & saved journey
    │   ├── ProgressPage.jsx     # Academic milestones, metrics grid, & timeline
    │   ├── ResearchExplorerPage.jsx # Filterable research library
    │   └── ResearchResourcePage.jsx # Full paper reader & docked AI assistant
    ├── services/
    │   └── apiClient.js         # Centralized HTTP REST client for backend API
    ├── index.css                # Global design tokens, resets, & typography
    └── main.jsx                 # Client entry point
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Backend API**: The Polar India Hub Express server running on `http://localhost:5000` (see `server/README.md`)

### Installation

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development Server

Start Vite with hot module replacement:
```bash
npm run dev
```
The application will be accessible at: `http://localhost:5173`

### Production Build

Compile and optimize the frontend for production:
```bash
npm run build
```
The compiled output is saved in the `dist/` directory.

To preview the production build locally:
```bash
npm run preview
```

---

## 🎨 Design System & Color Tokens

| Token | Hex / HSL | Semantic Role |
| :--- | :--- | :--- |
| `--color-navy` / `on-surface` | `#0b1f33` | Deep Polar Navy for titles and high-emphasis text |
| `--color-primary` | `#1ea7e8` | Ice Cyan for active indicators and links |
| `--color-primary-container` | `#00658f` | Glacier Blue for primary buttons and high-contrast actions |
| `--color-teal` | `#07b0a0` | Aurora Teal for positive status and science links |
| `--color-surface` | `#ffffff` | Pure white cards and reading surfaces |
| `--color-surface-low` | `#f0f4f9` | Subtle glacier surface for backgrounds and chips |
| `--color-border` | `#e2e8f0` | Hairline border for clean structural division |

---

## 🔒 Authentication Flow

- **Registration**: Form includes `Name`, `Email`, `Password`, and `Confirm Password`. Password confirmation is validated client-side and verified server-side.
- **Login**: Email + Password with JWT tokens stored in `localStorage`.
- **Google OAuth**: One-tap and button authentication integrating with backend endpoint `POST /api/auth/google`.
