import { Link, useLocation } from 'react-router-dom';
import { BookOpen, History, Sparkles } from 'lucide-react';

const Header = () => {
  const location = useLocation();
  
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-xl font-display font-semibold text-primary-600 hover:text-primary-700 transition-colors"
          >
            <div className="p-2 bg-primary-100 rounded-lg">
              <Sparkles className="h-6 w-6" />
            </div>
            <span>StoryMaker PNG</span>
          </Link>
          
          {/* Navigation */}
          <nav className="flex items-center space-x-1">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                location.pathname === '/'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Générateur</span>
            </Link>
            
            <Link
              to="/history"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                location.pathname === '/history'
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Historique</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;