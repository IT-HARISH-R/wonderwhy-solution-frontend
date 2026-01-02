import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const GameStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/games-stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
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
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading statistics...</p>
          </div>
        ) : stats && (
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
                    {stats.playerWins?.find(p => p._id === 'player1')?.count || 0}
                  </div>
                  <div className="text-gray-600 mt-1">Player 1 Wins</div>
                </div>
                
                <div className="bg-red-50 rounded-lg p-4 text-center border border-red-200">
                  <div className="text-3xl font-bold text-red-600">
                    {stats.playerWins?.find(p => p._id === 'player2')?.count || 0}
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
                {stats.playerWins?.map(win => (
                  <div key={win._id} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-700 capitalize">
                        {win._id === 'player1' ? 'Player 1 Wins' : 
                         win._id === 'player2' ? 'Player 2 Wins' : 
                         'Tie Games'}
                      </span>
                      <span className="font-semibold">{win.count}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          win._id === 'player1' ? 'bg-blue-600' :
                          win._id === 'player2' ? 'bg-red-600' :
                          'bg-gray-600'
                        }`}
                        style={{ width: `${(win.count / stats.totalGames) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Games */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Recent Activity
                </h2>
                <button
                  onClick={fetchStats}
                  className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                >
                  Refresh
                </button>
              </div>
              <div className="text-center text-gray-600">
                View detailed history on the History page
              </div>
            </div>

            {/* Navigation */}
            <div className="flex gap-4">
              <a
                href="/"
                className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 text-center"
              >
                Play Game
              </a>
              <a
                href="/history"
                className="flex-1 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 text-center"
              >
                View History
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameStats;