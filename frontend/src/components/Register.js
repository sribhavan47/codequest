import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../App';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Code, Zap, Trophy, Users } from 'lucide-react';

const Register = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    const result = await register(email, username, password);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Brand section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500 rounded-2xl mb-4">
            <Code className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">CodeQuest</h1>
          <p className="text-slate-400">Begin your coding adventure today</p>
        </div>

        <Card className="glass border-slate-700">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-white">Create account</CardTitle>
            <CardDescription className="text-center text-slate-400">
              Join thousands of developers leveling up their skills
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/20">
                  <AlertDescription className="text-red-400">{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:border-emerald-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-300">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Choose a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:border-emerald-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:border-emerald-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-300">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 focus:border-emerald-500"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 btn-hover-lift"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  'Create account'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features preview */}
        <div className="mt-8 grid grid-cols-4 gap-3 text-center">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-emerald-400" />
            </div>
            <p className="text-xs text-slate-400">Code</p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-xs text-slate-400">Level Up</p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-xs text-slate-400">Compete</p>
          </div>
          <div className="flex flex-col items-center space-y-2">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-xs text-slate-400">Community</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;