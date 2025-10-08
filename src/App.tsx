import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Reviews from './pages/Reviews';
import Analytics from './pages/Analytics';
import Rewards from './pages/Rewards';
import Integrations from './pages/Integrations';
import Settings from './pages/Settings';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const pageConfig: Record<string, { title: string; subtitle: string; component: JSX.Element }> = {
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Overview of your review management system',
      component: <Dashboard />,
    },
    reviews: {
      title: 'Reviews Management',
      subtitle: 'Manage and moderate customer reviews',
      component: <Reviews />,
    },
    analytics: {
      title: 'Analytics',
      subtitle: 'Track review performance and sentiment trends',
      component: <Analytics />,
    },
    rewards: {
      title: 'Rewards',
      subtitle: 'Create and manage reward campaigns',
      component: <Rewards />,
    },
    integrations: {
      title: 'Integrations',
      subtitle: 'Connect with third-party platforms',
      component: <Integrations />,
    },
    settings: {
      title: 'Settings',
      subtitle: 'Configure your ReviewPool installation',
      component: <Settings />,
    },
  };

  const currentConfig = pageConfig[currentPage];

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="flex-1 flex flex-col">
        <Header title={currentConfig.title} subtitle={currentConfig.subtitle} />
        <main className="flex-1 p-8">
          {currentConfig.component}
        </main>
      </div>
    </div>
  );
}

export default App;
