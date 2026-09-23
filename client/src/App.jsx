import { Route, Routes } from 'react-router-dom';
import AppLayout from './layouts/AppLayout.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import HomePage from './pages/HomePage.jsx';
import PolarMapPage from './pages/PolarMapPage.jsx';
import MorePage from './pages/MorePage.jsx';
import LearningHubPage from './pages/LearningHubPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ResearchExplorerPage from './pages/ResearchExplorerPage.jsx';
import ResearchResourcePage from './pages/ResearchResourcePage.jsx';
import EvidenceGraphPage from './pages/EvidenceGraphPage.jsx';
import MysteryPage from './pages/MysteryPage.jsx';
import ProgressPage from './pages/ProgressPage.jsx';
import { CatalogDetailPage, CatalogListPage } from './pages/CatalogPages.jsx';
import OutreachPage from './pages/OutreachPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import AuthPage from './pages/AuthPage.jsx';

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/map" element={<PolarMapPage />} />
        <Route path="/more" element={<MorePage defaultTab="about" />} />
        <Route path="/more/about" element={<MorePage defaultTab="about" />} />
        <Route path="/more/contact" element={<MorePage defaultTab="contact" />} />
        <Route path="/about" element={<MorePage defaultTab="about" />} />
        <Route path="/contact" element={<MorePage defaultTab="contact" />} />
        <Route path="/research" element={<ResearchExplorerPage />} />
        <Route path="/research/:id" element={<ResearchResourcePage />} />
        <Route path="/evidence/:id" element={<EvidenceGraphPage />} />
        <Route path="/expeditions" element={<CatalogListPage collection="expeditions" />} />
        <Route path="/expeditions/:id" element={<CatalogDetailPage collection="expeditions" />} />
        <Route path="/stations" element={<CatalogListPage collection="stations" />} />
        <Route path="/stations/:id" element={<CatalogDetailPage collection="stations" />} />
        <Route path="/datasets" element={<CatalogListPage collection="datasets" />} />
        <Route path="/datasets/:id" element={<CatalogDetailPage collection="datasets" />} />
        <Route path="/publications" element={<CatalogListPage collection="publications" />} />
        <Route path="/publications/:id" element={<CatalogDetailPage collection="publications" />} />
        <Route path="/media" element={<CatalogListPage collection="media" />} />
        <Route path="/media/:id" element={<CatalogDetailPage collection="media" />} />
        <Route path="/learning" element={<LearningHubPage />} />
        <Route path="/mystery" element={<MysteryPage mode="intro" />} />
        <Route path="/mystery/:id" element={<MysteryPage mode="intro" />} />
        <Route path="/mystery/:id/investigate" element={<MysteryPage mode="investigate" />} />
        <Route path="/mystery/:id/result" element={<MysteryPage mode="result" />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/outreach" element={<OutreachPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/telemetry" element={<AdminPage section="telemetry" />} />
        <Route path="/admin/resources" element={<AdminPage section="resources" />} />
        <Route path="/admin/expeditions" element={<AdminPage section="expeditions" />} />
        <Route path="/admin/datasets" element={<AdminPage section="datasets" />} />
        <Route path="/admin/publications" element={<AdminPage section="publications" />} />
        <Route path="/admin/mysteries" element={<AdminPage section="mysteries" />} />
        <Route path="/admin/analytics" element={<AdminPage section="analytics" />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
