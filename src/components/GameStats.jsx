import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://56.228.33.77:3000/api';

const GameStats = () => {
  const [stats, setStats] = useState({
    totalGames: 0,
    totalRounds: 0,
    playerWins: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_URL}/games-stats`);
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load statistics');
      setStats({
        totalGames: 0,
        totalRounds: 0,
        playerWins: []
      });
    } finally {
      setLoading(false);
    }
  };

  const getWinCount = (playerId) => {
    const player = stats.playerWins?.find(p => p._id === playerId);
    return player ? player.count : 0;
  };

  const calculatePercentage = (count) => {
    if (stats.totalGames === 0) return 0;
    return Math.round((count / stats.totalGames) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Game Statistics
          </h1>
          <p className="text-gray-600">Overall game performance</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-3 text-gray-600">Loading statistics...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-6 rounded-lg text-center">
            <p className="mb-3">{error}</p>
            <button
              onClick={fetchStats}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overall Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Overall Statistics
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200">
                  <div className="text-3xl font-bold text-blue-600">
                    {stats.totalGames}
                  </div>
                  <div className="text-gray-600 mt-1">Total Games</div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200">
                  <div className="text-3xl font-bold text-green-600">
                    {stats.totalRounds}
                  </div>
                  <div className="text-gray-600 mt-1">Total Rounds</div>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4 text-center border border-purple-200">
                  <div className="text-3xl font-bold text-purple-600">
                    {getWinCount('player1')}
                  </div>
                  <div className="text-gray-600 mt-1">Player 1 Wins</div>
                </div>
                
                <div className="bg-red-50 rounded-lg p-4 text-center border border-red-200">
                  <div className="text-3xl font-bold text-red-600">
                    {getWinCount('player2')}
                  </div>
                  <div className="text-gray-600 mt-1">Player 2 Wins</div>
                </div>
              </div>
            </div>

            {/* Win Distribution */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Win Distribution
              </h2>
              <div className="space-y-4">
                {[
                  { id: 'player1', label: 'Player 1 Wins', color: 'bg-blue-600', count: getWinCount('player1') },
                  { id: 'player2', label: 'Player 2 Wins', color: 'bg-red-600', count: getWinCount('player2') },
                  { id: 'tie', label: 'Tie Games', color: 'bg-gray-600', count: getWinCount('tie') }
                ].map(item => (
                  <div key={item.id} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-700">{item.label}</span>
                      <span className="font-semibold">
                        {item.count} ({calculatePercentage(item.count)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full ${item.color}`}
                        style={{ 
                          width: stats.totalGames > 0 
                            ? `${(item.count / stats.totalGames) * 100}%` 
                            : '0%' 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href="/"
                className="py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 text-center"
              >
                Play Game
              </a>
              <a
                href="/history"
                className="py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 text-center"
              >
                View History
              </a>
              <button
                onClick={fetchStats}
                className="py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
              >
                Refresh Statistics
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameStats;