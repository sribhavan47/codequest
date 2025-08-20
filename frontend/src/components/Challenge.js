import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../App';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Code, 
  Play, 
  CheckCircle, 
  XCircle, 
  Zap, 
  Trophy,
  ArrowLeft,
  Loader2,
  Brain,
  Target
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Challenge = () => {
  const { id } = useParams();
  const { user, token, refreshUser } = useAuth();
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [code, setCode] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    fetchChallenge();
  }, [id]);

  const fetchChallenge = async () => {
    try {
      const response = await axios.get(`${API}/challenges/${id}`);
      const challengeData = response.data;
      setChallenge(challengeData);
      
      // Set initial code for coding challenges
      if (challengeData.type === 'coding' && challengeData.starter_code) {
        setCode(challengeData.starter_code);
      }
    } catch (error) {
      console.error('Error fetching challenge:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmission = async () => {
    if (!code.trim()) return;
    
    setSubmitting(true);
    setShowResult(false);
    
    try {
      const response = await axios.post(
        `${API}/submit/code`,
        {
          challenge_id: id,
          code: code,
          language: challenge.language
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setResult(response.data);
      setShowResult(true);
      
      // Refresh user data if XP was earned
      if (response.data.xp_earned > 0) {
        refreshUser();
      }
    } catch (error) {
      console.error('Error submitting code:', error);
      setResult({
        success: false,
        result: { error: 'Failed to submit code. Please try again.' }
      });
      setShowResult(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMultipleChoiceSubmission = async () => {
    if (!selectedAnswer) return;
    
    setSubmitting(true);
    setShowResult(false);
    
    try {
      const response = await axios.post(
        `${API}/submit/multiple-choice`,
        {
          challenge_id: id,
          answer: selectedAnswer
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setResult(response.data);
      setShowResult(true);
      
      // Refresh user data if XP was earned
      if (response.data.xp_earned > 0) {
        refreshUser();
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      setResult({
        success: false,
        correct_answer: null
      });
      setShowResult(true);
    } finally {
      setSubmitting(false);
    }
  };

  const isCompleted = challenge && user?.completed_challenges?.includes(challenge.id);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="skeleton h-64 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-slate-900 p-4 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Challenge not found</h2>
          <p className="text-slate-400 mb-4">The challenge you're looking for doesn't exist.</p>
          <Link to="/challenges">
            <Button>Back to Challenges</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link to="/challenges" className="inline-flex items-center text-slate-400 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Challenges
          </Link>
          
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  isCompleted ? 'bg-emerald-500/20' : 'bg-slate-700'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                  ) : challenge.type === 'coding' ? (
                    <Code className="w-6 h-6 text-slate-400" />
                  ) : (
                    <Brain className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">{challenge.title}</h1>
                  <div className="flex items-center space-x-3 mt-1">
                    <Badge 
                      variant="secondary" 
                      className={`${
                        challenge.difficulty === 'easy' ? 'difficulty-easy' :
                        challenge.difficulty === 'medium' ? 'difficulty-medium' :
                        'difficulty-hard'
                      }`}
                    >
                      {challenge.difficulty}
                    </Badge>
                    <Badge variant="outline" className="border-slate-600 text-slate-400">
                      {challenge.type === 'coding' ? 'Coding Challenge' : 'Multiple Choice'}
                    </Badge>
                    {challenge.language && (
                      <Badge variant="outline" className="border-slate-600 text-slate-400 capitalize">
                        {challenge.language}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 bg-slate-800 rounded-lg px-3 py-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-white">+{challenge.xp_reward} XP</span>
              </div>
              {isCompleted && (
                <div className="flex items-center space-x-1 bg-emerald-500/20 rounded-lg px-3 py-2">
                  <Trophy className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-400">Completed</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Challenge Description */}
          <div className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Challenge Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {challenge.description}
                </p>
              </CardContent>
            </Card>

            {/* Results */}
            {showResult && (
              <Card 
                className={`border-2 ${
                  result.success 
                    ? 'bg-emerald-500/5 border-emerald-500/50' 
                    : 'bg-red-500/5 border-red-500/50'
                }`}
              >
                <CardHeader>
                  <CardTitle className={`flex items-center ${
                    result.success ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 mr-2" />
                    ) : (
                      <XCircle className="w-5 h-5 mr-2" />
                    )}
                    {result.success ? 'Success!' : 'Try Again'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* XP Notification */}
                  {result.xp_earned > 0 && (
                    <Alert className="bg-emerald-500/10 border-emerald-500/20">
                      <Trophy className="w-4 h-4 text-emerald-400" />
                      <AlertDescription className="text-emerald-400">
                        Congratulations! You earned {result.xp_earned} XP and reached level {result.new_level}!
                        {result.new_badges?.length > 0 && (
                          <div className="mt-2">
                            New badges: {result.new_badges.join(', ')}
                          </div>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Code execution result */}
                  {challenge.type === 'coding' && result.result && (
                    <div>
                      <h4 className="font-medium text-white mb-2">Output:</h4>
                      <div className={`p-3 rounded-lg code-font text-sm ${
                        result.success ? 'output-success' : 'output-error'
                      }`}>
                        {result.result.output || result.result.error || 'No output'}
                      </div>
                    </div>
                  )}

                  {/* Multiple choice result */}
                  {challenge.type === 'multiple_choice' && (
                    <div>
                      {!result.success && result.correct_answer && (
                        <p className="text-red-400">
                          Correct answer: {result.correct_answer}
                        </p>
                      )}
                    </div>
                  )}

                  {result.message && (
                    <p className="text-slate-400 text-sm">{result.message}</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Challenge Interface */}
          <div>
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">
                  {challenge.type === 'coding' ? 'Code Editor' : 'Select Your Answer'}
                </CardTitle>
                <CardDescription className="text-slate-400">
                  {challenge.type === 'coding' 
                    ? `Write your ${challenge.language} solution below`
                    : 'Choose the correct answer from the options below'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {challenge.type === 'coding' ? (
                  <>
                    <Textarea
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="code-editor min-h-[300px]"
                      placeholder={`// Write your ${challenge.language} code here...`}
                    />
                    <Button
                      onClick={handleCodeSubmission}
                      disabled={submitting || !code.trim()}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 btn-hover-lift"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Running Code...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Run Code
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="space-y-3">
                      {challenge.options?.map((option, index) => (
                        <label
                          key={index}
                          className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            selectedAnswer === option
                              ? 'border-emerald-500 bg-emerald-500/10'
                              : 'border-slate-600 hover:border-slate-500'
                          }`}
                        >
                          <input
                            type="radio"
                            name="answer"
                            value={option}
                            checked={selectedAnswer === option}
                            onChange={(e) => setSelectedAnswer(e.target.value)}
                            className="sr-only"
                          />
                          <span className="text-white">{option}</span>
                        </label>
                      ))}
                    </div>
                    <Button
                      onClick={handleMultipleChoiceSubmission}
                      disabled={submitting || !selectedAnswer}
                      className="w-full bg-emerald-500 hover:bg-emerald-600 btn-hover-lift"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Answer'
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Challenge;