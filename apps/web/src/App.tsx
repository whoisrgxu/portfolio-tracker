import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { Analytics } from './components/Analytics';
import { History } from './components/History';
import { LandingPage } from './components/LandingPage';
import { getCurrentUser } from './auth/login';
import { ChatbotWidget } from './components/ChatbotWidget';

export default function App() {

  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [triggerLogin, setTriggerLogin] = useState(0);
  const [triggerSignUp, setTriggerSignUp] = useState(0);

  const checkAuthentication = async () => {
    try {
      const { user: currentUser, error } = await getCurrentUser();
      if (currentUser && !error) {
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthentication();
  }, []);

  const handleLogin = () => {
    setTriggerLogin(prev => prev + 1);
  };

  const handleSignUp = () => {
    setTriggerSignUp(prev => prev + 1);
  };

  const renderContent = () => {
    if (!isAuthenticated) {
      return (
        <LandingPage 
          onLogin={handleLogin} 
          onSignUp={handleSignUp} 
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
      case 'portfolio':
        return <Dashboard />;
      case 'analytics':
        return <Analytics userId={user?.id}/>;
      case 'history':
        return <History />;
      default:
        return <Dashboard />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        isAuthenticated={isAuthenticated}
        onAuthChange={checkAuthentication}
        onLoginClick={triggerLogin}
        onSignUpClick={triggerSignUp}
      />
      <main className="container mx-auto px-4 py-6">
        {renderContent()}
      </main>
      <ChatbotWidget />
    </div>
  );
}