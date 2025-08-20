import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../App';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Trophy, 
  Code, 
  Zap, 
  Target, 
  BookOpen,
  Award,
  TrendingUp,
  Clock
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const { user, token, refreshUser } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [challengesRes, leaderboardRes] = await Promise.all([
        axios.get(`${API}/challenges`),
        axios.get(`${API}/leaderboard`)
      ]);
      
      setChallenges(challengesRes.data);
      setLeaderboard(leaderboardRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const completedChallenges = user?.completed_challenges?.length || 0;
  const totalChallenges = challenges.length;
  const completionRate = totalChallenges > 0 ? (completedChallenges / totalChallenges) * 100 : 0;
  const xpToNextLevel = ((user?.level || 1) * 100) - (user?.xp || 0);
  const currentLevelProgress = ((user?.xp || 0) % 100);
  const userRank = leaderboard.findIndex(u => u.username === user?.username) + 1;

  const recentChallenges = challenges
    .filter(challenge => !user?.completed_challenges?.includes(challenge.id))
    .slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="skeleton h-16 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.username}! 👋
          </h1>
          <p className="text-slate-400">
            Ready to level up your coding skills? Let's continue your journey.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* XP Card */}
          <Card className="bg-slate-800 border-slate-700 hover:border-emerald-500/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Total XP</p>
                  <p className="text-2xl font-bold text-white">{user?.xp || 0}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-400">Level {user?.level || 1}</span>
                  <span className="text-slate-400">{xpToNextLevel} XP to next level</span>
                </div>
                <Progress value={currentLevelProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Challenges Completed */}
          <Card className="bg-slate-800 border-slate-700 hover:border-purple-500/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Challenges</p>
                  <p className="text-2xl font-bold text-white">{completedChallenges}/{totalChallenges}</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-400" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-400">Completion Rate</span>
                  <span className="text-slate-400">{completionRate.toFixed(1)}%</span>
                </div>
                <Progress value={completionRate} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Badges */}
          <Card className="bg-slate-800 border-slate-700 hover:border-yellow-500/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Badges Earned</p>
                  <p className="text-2xl font-bold text-white">{user?.badges?.length || 0}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
              <div className="mt-4">
                {user?.badges?.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {user.badges.slice(0, 2).map((badge, index) => (
                      <Badge key={index} variant="secondary" className="text-xs bg-yellow-500/20 text-yellow-400">
                        {badge}
                      </Badge>
                    ))}
                    {user.badges.length > 2 && (
                      <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-400">
                        +{user.badges.length - 2}
                      </Badge>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Complete challenges to earn badges</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Rank */}
          <Card className="bg-slate-800 border-slate-700 hover:border-blue-500/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-400">Global Rank</p>
                  <p className="text-2xl font-bold text-white">#{userRank || 'N/A'}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-xs text-slate-500">
                  {userRank <= 3 ? 'Amazing! You\'re in the top 3!' : 'Keep coding to climb the ranks!'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Continue Learning */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Continue Learning
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Pick up where you left off with these challenges
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentChallenges.length > 0 ? (
                  recentChallenges.map((challenge) => (
                    <div key={challenge.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                          <Code className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <h3 className="font-medium text-white">{challenge.title}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${
                                challenge.difficulty === 'easy' ? 'difficulty-easy' :
                                challenge.difficulty === 'medium' ? 'difficulty-medium' :
                                'difficulty-hard'
                              }`}
                            >
                              {challenge.difficulty}
                            </Badge>
                            <span className="text-xs text-slate-400">+{challenge.xp_reward} XP</span>
                          </div>
                        </div>
                      </div>
                      <Link to={`/challenge/${challenge.id}`}>
                        <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600">
                          Start
                        </Button>
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                    <p className="text-white font-medium">Congratulations!</p>
                    <p className="text-slate-400 text-sm">You've completed all available challenges!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Leaderboard Preview */}
          <div>
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Trophy className="w-5 h-5 mr-2" />
                  Leaderboard
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Top performers this week
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {leaderboard.slice(0, 5).map((player, index) => (
                  <div key={player.username} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-500 text-black' :
                        index === 1 ? 'bg-gray-400 text-black' :
                        index === 2 ? 'bg-orange-600 text-white' :
                        'bg-slate-700 text-slate-300'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className={`font-medium ${player.username === user?.username ? 'text-emerald-400' : 'text-white'}`}>
                          {player.username}
                        </p>
                        <p className="text-xs text-slate-400">Level {player.level}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-slate-300">{player.xp} XP</span>
                  </div>
                ))}
                <Link to="/leaderboard">
                  <Button variant="outline" className="w-full mt-4 border-slate-600 text-slate-300 hover:bg-slate-700">
                    View Full Leaderboard
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;