import { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { Analytics } from './components/Analytics';
import { History } from './components/History';
import { getCurrentUser } from './auth/login';

export default function App() {

  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<any>(null);
    useEffect(() => {
    async function loadUser() {
      const u = await getCurrentUser();
      setUser(u.user);
    }

    loadUser();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
      case 'portfolio':
        return <Dashboard />;
      case 'analytics':
        return <Analytics userId={user.id}/>;
      case 'history':
        return <History />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="container mx-auto px-4 py-6">
        {renderContent()}
      </main>
    </div>
  );
}