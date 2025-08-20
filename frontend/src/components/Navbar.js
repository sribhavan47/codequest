import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from './ui/dropdown-menu';
import { 
  Code, 
  Home, 
  BookOpen, 
  Trophy, 
  User, 
  LogOut, 
  Menu, 
  X,
  Zap
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Challenges', href: '/challenges', icon: BookOpen },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  ];

  const isActivePath = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white">CodeQuest</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActivePath(item.href)
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {/* XP Display */}
            <div className="hidden sm:flex items-center space-x-2 bg-slate-800/50 rounded-full px-3 py-1">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-white">{user?.xp || 0} XP</span>
              <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 text-xs">
                Level {user?.level || 1}
              </Badge>
            </div>

            {/* Desktop User Menu */}
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-emerald-500 text-white text-sm">
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-slate-800 border-slate-700" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none text-white">{user?.username}</p>
                    <p className="text-xs leading-none text-slate-400">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem className="text-slate-300 focus:bg-slate-700 focus:text-white">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem 
                    className="text-red-400 focus:bg-red-500/10 focus:text-red-400"
                    onClick={logout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-slate-300"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-800/95 backdrop-blur-lg border-t border-slate-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* User Info */}
            <div className="flex items-center space-x-3 px-3 py-3 border-b border-slate-700">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-emerald-500 text-white">
                  {user?.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{user?.username}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-slate-400">{user?.xp || 0} XP</span>
                  <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 text-xs">
                    Level {user?.level || 1}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Navigation Links */}
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium ${
                    isActivePath(item.href)
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {/* Sign Out */}
            <button
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;