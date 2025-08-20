import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../App';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Code, 
  CheckCircle, 
  Clock, 
  Zap, 
  Search,
  Filter,
  BookOpen,
  Brain
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ChallengeList = () => {
  const { user, token } = useAuth();
  const [challenges, setChallenges] = useState([]);
  const [filteredChallenges, setFilteredChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchChallenges();
  }, []);

  useEffect(() => {
    filterChallenges();
  }, [challenges, searchTerm, difficultyFilter, typeFilter, statusFilter, user]);

  const fetchChallenges = async () => {
    try {
      const response = await axios.get(`${API}/challenges`);
      setChallenges(response.data);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterChallenges = () => {
    let filtered = challenges;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(challenge =>
        challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        challenge.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Difficulty filter
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(challenge => challenge.difficulty === difficultyFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(challenge => challenge.type === typeFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      const isCompleted = (challengeId) => user?.completed_challenges?.includes(challengeId) || false;
      
      if (statusFilter === 'completed') {
        filtered = filtered.filter(challenge => isCompleted(challenge.id));
      } else if (statusFilter === 'not-completed') {
        filtered = filtered.filter(challenge => !isCompleted(challenge.id));
      }
    }

    setFilteredChallenges(filtered);
  };

  const getChallengeIcon = (type) => {
    return type === 'coding' ? Code : Brain;
  };

  const isCompleted = (challengeId) => {
    return user?.completed_challenges?.includes(challengeId) || false;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-slate-800 border-slate-700">
                <CardContent className="p-6">
                  <div className="skeleton h-32 rounded"></div>
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Coding Challenges</h1>
          <p className="text-slate-400">
            Master your skills with our interactive challenges. Earn XP and unlock badges!
          </p>
        </div>

        {/* Filters */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search challenges..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Difficulty</label>
                <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="All difficulties" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="all">All Difficulties</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="coding">Coding</SelectItem>
                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="All challenges" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="all">All Challenges</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="not-completed">Not Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-slate-400">
            Showing {filteredChallenges.length} of {challenges.length} challenges
          </p>
          <div className="flex items-center space-x-2 text-sm text-slate-400">
            <span>Completed: {user?.completed_challenges?.length || 0}</span>
            <span>•</span>
            <span>Total XP: {user?.xp || 0}</span>
          </div>
        </div>

        {/* Challenge Grid */}
        {filteredChallenges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChallenges.map((challenge) => {
              const Icon = getChallengeIcon(challenge.type);
              const completed = isCompleted(challenge.id);
              
              return (
                <Card 
                  key={challenge.id} 
                  className={`bg-slate-800 border-slate-700 hover:border-emerald-500/50 transition-all duration-300 ${
                    completed ? 'ring-2 ring-emerald-500/30' : ''
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          completed ? 'bg-emerald-500/20' : 'bg-slate-700'
                        }`}>
                          {completed ? (
                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <Icon className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-lg text-white">{challenge.title}</CardTitle>
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
                            <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                              {challenge.type === 'coding' ? 'Coding' : 'Quiz'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-slate-400 mb-4 line-clamp-2">
                      {challenge.description}
                    </CardDescription>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-slate-400">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        <span>+{challenge.xp_reward} XP</span>
                        {challenge.language && (
                          <>
                            <span>•</span>
                            <span className="capitalize">{challenge.language}</span>
                          </>
                        )}
                      </div>
                      
                      <Link to={`/challenge/${challenge.id}`}>
                        <Button 
                          size="sm" 
                          className={`${
                            completed 
                              ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' 
                              : 'bg-emerald-500 hover:bg-emerald-600'
                          }`}
                        >
                          {completed ? 'Review' : 'Start'}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-12 text-center">
              <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No challenges found</h3>
              <p className="text-slate-400 mb-4">
                Try adjusting your filters to see more challenges.
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm('');
                  setDifficultyFilter('all');
                  setTypeFilter('all');
                  setStatusFilter('all');
                }}
                variant="outline" 
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ChallengeList;