import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { 
  TrendingUp, 
  User, 
  Settings, 
  LogOut, 
  Menu,
  BarChart3,
  PieChart,
  History,
  Bell
} from 'lucide-react';
import {SignUpModal} from "./SignUpModal";
import { LoginModal } from './LoginModal';
import { getCurrentUser, logout } from '../auth/login';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  // Mock authentication state - in a real app this would come from auth context/state
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  // Login or Register modal state
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [displayName, setDisplayName] = useState<string | undefined>("");
  const [email, setEmail] = useState<string | undefined>("");
  
  useEffect(() => {
    const checkSession = async () => {
      const { user } = await getCurrentUser();
      if (user) {
        setDisplayName(user.user_metadata.display_name ?? "User");
        setEmail(user.email);
        setIsAuthenticated(true);
      }
    };
    checkSession();
  }, []);

  const handleLoginSuccess = async () => {
    const { user } = await getCurrentUser();
    if (user) {
      setIsAuthenticated(true);
      setDisplayName(user.user_metadata.display_name ?? "User");
      setEmail(user.email);
    }
  };

  const avatar: string = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face';

  const navigationTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'portfolio', label: 'Portfolio', icon: PieChart },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'history', label: 'History', icon: History },
  ];

  const handleLogin = ()=> {
    setLoginModalOpen(true);
  };

  const handleSignUpClick = () => {
    setRegisterModalOpen(true);
  };

  const handleLogout = async() => {
    await logout();
    setIsAuthenticated(false);
  };

  const AuthenticatedMenu = () => (
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="sm" className="relative">
        <Bell className="h-4 w-4" />
        <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
          3
        </span>
      </Button>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={avatar} alt={displayName} />
              <AvatarFallback>{displayName?.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{displayName}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  const UnauthenticatedMenu = () => (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" onClick={handleLogin}>
        Login
      </Button>
      <Button size="sm" onClick={handleSignUpClick}>
        Register
      </Button>
    </div>
  );

  return (
    <>
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Logo */}
        <div className="mr-4 hidden md:flex">
          <a className="mr-6 flex items-center space-x-2" href="/">
            <TrendingUp className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">
              Portfolio Tracker
            </span>
          </a>
        </div>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <div className="flex items-center space-x-2 mb-6">
              <TrendingUp className="h-6 w-6" />
              <span className="font-bold">Portfolio Tracker</span>
            </div>
            <nav className="flex flex-col space-y-3">
              {navigationTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => onTabChange(tab.id)}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {tab.label}
                  </Button>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Desktop Navigation */}
        <div className="mr-4 hidden md:flex">
          <nav className="flex items-center space-x-6">
            {navigationTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "secondary" : "ghost"}
                  size="sm"
                  className="flex items-center space-x-2"
                  onClick={() => onTabChange(tab.id)}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </Button>
              );
            })}
          </nav>
        </div>

        {/* Spacer */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search could go here */}
          </div>
          
          {/* Authentication Menu */}
          {isAuthenticated ? <AuthenticatedMenu /> : <UnauthenticatedMenu />}
        </div>
      </div>
    </header>
    <SignUpModal
      isOpen={registerModalOpen}
      onClose={() => setRegisterModalOpen(false)}
        // You can hook into Supabase or your API here
    />
    <LoginModal
      isOpen={loginModalOpen}
      onClose={() => setLoginModalOpen(false)}
      onLoginSuccess={handleLoginSuccess}
    />
    </>
  );
}