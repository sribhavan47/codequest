import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  Trophy, 
  Medal, 
  Crown,
  Zap,
  Target,
  TrendingUp,
  Award
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Leaderboard = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get(`${API}/leaderboard`);
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-orange-600" />;
      default:
        return <Trophy className="w-6 h-6 text-slate-400" />;
    }
  };

  const getRankBadgeColor = (rank) => {
    switch (rank) {
      case 1:
        return 'badge-gold';
      case 2:
        return 'badge-silver';
      case 3:
        return 'badge-bronze';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  const userRank = leaderboard.findIndex(u => u.username === user?.username) + 1;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="skeleton h-64 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
            <Trophy className="w-8 h-8 mr-3 text-yellow-400" />
            Global Leaderboard
          </h1>
          <p className="text-slate-400">
            Compete with developers worldwide and climb the ranks!
          </p>
        </div>

        {/* User's Current Position */}
        {userRank > 0 && (
          <Card className="bg-slate-800 border-emerald-500/50 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="level-ring w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-white">#{userRank}</span>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-white">Your Current Position</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-slate-400 flex items-center">
                        <Zap className="w-4 h-4 mr-1 text-yellow-400" />
                        {user?.xp || 0} XP
                      </span>
                      <Badge className="bg-emerald-500/20 text-emerald-400">
                        Level {user?.level || 1}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400">Keep coding to climb higher!</p>
                  <div className="flex items-center justify-end mt-1">
                    <TrendingUp className="w-4 h-4 mr-1 text-emerald-400" />
                    <span className="text-sm text-emerald-400">Rising</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Top 3 Podium */}
        {leaderboard.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* 2nd Place */}
            {leaderboard[1] && (
              <Card className="bg-slate-800 border-slate-600 md:order-1">
                <CardContent className="p-6 text-center">
                  <div className="mb-4">
                    <Avatar className="w-16 h-16 mx-auto mb-3 ring-2 ring-gray-400">
                      <AvatarFallback className="bg-gray-400 text-slate-900 text-xl font-bold">
                        {leaderboard[1].username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-slate-900 font-bold">2</span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-white mb-1">{leaderboard[1].username}</h3>
                  <p className="text-slate-400 text-sm mb-2">Silver Rank</p>
                  <div className="flex items-center justify-center space-x-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="font-medium text-white">{leaderboard[1].xp} XP</span>
                  </div>
                  <Badge className="mt-2 bg-gray-400/20 text-gray-400">
                    Level {leaderboard[1].level}
                  </Badge>
                </CardContent>
              </Card>
            )}

            {/* 1st Place */}
            <Card className="bg-slate-800 border-yellow-500/50 md:order-2 ring-2 ring-yellow-500/30">
              <CardContent className="p-6 text-center">
                <div className="mb-4">
                  <Avatar className="w-20 h-20 mx-auto mb-3 ring-4 ring-yellow-400">
                    <AvatarFallback className="bg-yellow-400 text-slate-900 text-2xl font-bold">
                      {leaderboard[0].username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Crown className="w-10 h-10 text-yellow-400 mx-auto mb-2" />
                </div>
                <h3 className="font-bold text-white text-lg mb-1">{leaderboard[0].username}</h3>
                <p className="text-yellow-400 text-sm mb-2 font-medium">Champion</p>
                <div className="flex items-center justify-center space-x-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="font-bold text-white text-lg">{leaderboard[0].xp} XP</span>
                </div>
                <Badge className="mt-2 bg-yellow-400/20 text-yellow-400 font-medium">
                  Level {leaderboard[0].level}
                </Badge>
              </CardContent>
            </Card>

            {/* 3rd Place */}
            {leaderboard[2] && (
              <Card className="bg-slate-800 border-slate-600 md:order-3">
                <CardContent className="p-6 text-center">
                  <div className="mb-4">
                    <Avatar className="w-16 h-16 mx-auto mb-3 ring-2 ring-orange-600">
                      <AvatarFallback className="bg-orange-600 text-white text-xl font-bold">
                        {leaderboard[2].username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-bold">3</span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-white mb-1">{leaderboard[2].username}</h3>
                  <p className="text-slate-400 text-sm mb-2">Bronze Rank</p>
                  <div className="flex items-center justify-center space-x-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="font-medium text-white">{leaderboard[2].xp} XP</span>
                  </div>
                  <Badge className="mt-2 bg-orange-600/20 text-orange-400">
                    Level {leaderboard[2].level}
                  </Badge>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Full Leaderboard */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Award className="w-5 h-5 mr-2" />
              All Rankings
            </CardTitle>
            <CardDescription className="text-slate-400">
              Complete leaderboard showing all active participants
            </CardDescription>
          </CardHeader>
          <CardContent>
            {leaderboard.length > 0 ? (
              <div className="space-y-3">
                {leaderboard.map((player, index) => {
                  const rank = index + 1;
                  const isCurrentUser = player.username === user?.username;
                  
                  return (
                    <div
                      key={player.username}
                      className={`flex items-center justify-between p-4 rounded-lg transition-colors ${
                        isCurrentUser 
                          ? 'bg-emerald-500/10 border border-emerald-500/30' 
                          : 'bg-slate-700/50 hover:bg-slate-700'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${getRankBadgeColor(rank)}`}>
                          {rank <= 3 ? (
                            getRankIcon(rank)
                          ) : (
                            <span className="text-sm">#{rank}</span>
                          )}
                        </div>
                        
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className={`text-white font-medium ${
                            rank === 1 ? 'bg-yellow-500' :
                            rank === 2 ? 'bg-gray-500' :
                            rank === 3 ? 'bg-orange-600' :
                            'bg-slate-600'
                          }`}>
                            {player.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div>
                          <p className={`font-medium ${isCurrentUser ? 'text-emerald-400' : 'text-white'}`}>
                            {player.username}
                            {isCurrentUser && <span className="ml-2 text-xs text-emerald-400">(You)</span>}
                          </p>
                          <p className="text-sm text-slate-400">Level {player.level}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="flex items-center">
                            <Zap className="w-4 h-4 mr-1 text-yellow-400" />
                            <span className="font-semibold text-white">{player.xp} XP</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400">No participants yet. Be the first to compete!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Leaderboard;