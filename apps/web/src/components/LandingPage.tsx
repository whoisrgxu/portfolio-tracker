import React from 'react';
import { Button } from './ui/button';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Shield, 
  Zap, 
  Globe,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
  onSignUp: () => void;
}

export function LandingPage({ onLogin, onSignUp }: LandingPageProps) {
  const features = [
    {
      icon: TrendingUp,
      title: "Real-time Tracking",
      description: "Monitor your portfolio performance with live market data and instant updates."
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Get detailed insights with comprehensive charts and performance metrics."
    },
    {
      icon: PieChart,
      title: "Portfolio Diversification",
      description: "Visualize your asset allocation and optimize your investment strategy."
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your financial data is protected with enterprise-grade security."
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Experience blazing-fast performance with our optimized platform."
    },
    {
      icon: Globe,
      title: "Global Markets",
      description: "Track stocks from major exchanges worldwide in one unified dashboard."
    }
  ];

  const benefits = [
    "Track unlimited stocks and portfolios",
    "Real-time market data and quotes",
    "Advanced portfolio analytics",
    "Historical performance tracking",
    "Mobile-responsive design",
    "Free to use with no hidden fees"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 lg:py-20">
        <div className="text-center space-y-6 lg:space-y-8 max-w-6xl mx-auto">
          <div className="space-y-4 lg:space-y-6">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              Professional Portfolio Management
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
              Track Your Investments
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Monitor your portfolio performance, analyze market trends, and make informed investment decisions with our comprehensive portfolio tracking platform.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700"
              onClick={onSignUp}
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="text-center space-y-4 mb-16 lg:mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">Everything You Need</h2>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto">
            Powerful tools and features to help you manage your investments effectively
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="bg-white p-6 lg:p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="text-center">
                  <div className="mx-auto w-14 h-14 lg:w-16 lg:h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                    <Icon className="h-7 w-7 lg:h-8 lg:w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl lg:text-2xl font-semibold mb-3 lg:mb-4">{feature.title}</h3>
                  <p className="text-gray-600 text-sm lg:text-base leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-white py-16 lg:py-24 mt-16 lg:mt-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 xl:gap-20 items-center max-w-7xl mx-auto">
            <div className="space-y-6 lg:space-y-8">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
                Why Choose Portfolio Tracker?
              </h2>
              <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 leading-relaxed">
                Join thousands of investors who trust our platform to manage their portfolios and make better investment decisions.
              </p>
              <div className="space-y-4 lg:space-y-5">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3 lg:gap-4">
                    <CheckCircle className="h-5 w-5 lg:h-6 lg:w-6 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 text-sm lg:text-base">{benefit}</span>
                  </div>
                ))}
              </div>
              <div className="pt-4 lg:pt-6">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700"
                  onClick={onSignUp}
                >
                  Start Your Free Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 lg:p-8 xl:p-10">
                <div className="space-y-6 lg:space-y-8">
                  <div className="text-center">
                    <h3 className="text-xl lg:text-2xl xl:text-3xl font-bold mb-2 lg:mb-3">Sample Portfolio</h3>
                    <p className="text-blue-100 text-sm lg:text-base">Total Value: $125,430.50</p>
                    <p className="text-green-300 text-sm lg:text-base">+$2,340.25 (+1.89%)</p>
                  </div>
                  
                  <div className="space-y-3 lg:space-y-4">
                    <div className="flex justify-between items-center bg-white/20 rounded-lg p-3 lg:p-4">
                      <span className="font-medium text-sm lg:text-base">AAPL</span>
                      <span className="text-green-300 text-sm lg:text-base">+2.4%</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/20 rounded-lg p-3 lg:p-4">
                      <span className="font-medium text-sm lg:text-base">GOOGL</span>
                      <span className="text-green-300 text-sm lg:text-base">+1.8%</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/20 rounded-lg p-3 lg:p-4">
                      <span className="font-medium text-sm lg:text-base">MSFT</span>
                      <span className="text-red-300 text-sm lg:text-base">-0.5%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-16 lg:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-6 lg:space-y-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
              Ready to Take Control of Your Investments?
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-blue-100 max-w-3xl mx-auto">
              Join our community of successful investors and start tracking your portfolio today.
            </p>
            <div className="flex justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                className="text-lg px-8 py-6 bg-white text-blue-600 hover:bg-gray-100"
                onClick={onSignUp}
              >
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
