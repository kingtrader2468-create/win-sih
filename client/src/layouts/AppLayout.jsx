import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-surface-container-lowest text-on-surface antialiased">
      <Navbar />
      <main className="w-full pt-[106px] sm:pt-[110px] lg:pt-20 bg-surface-container-lowest min-h-[calc(100vh-280px)] flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default AppLayout;
