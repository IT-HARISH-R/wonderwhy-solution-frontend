import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const HistoryPage = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/games`);
      setGames(response.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch games');
      console.error('Error fetching games:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getGameWinner = (game) => {
    if (!game.gameWinner) return 'Not Completed';
    if (game.gameWinner === 'player1') return game.player1Name;
    if (game.gameWinner === 'player2') return game.player2Name;
    return 'Tie';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Game History</h1>
          <button
            onClick={fetchGames}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading games...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : games.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No games played yet.</p>
            <a href="/" className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
              Start a new game
            </a>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left text-gray-700 font-semibold">Date</th>
                    <th className="py-3 px-4 text-left text-gray-700 font-semibold">Player 1</th>
                    <th className="py-3 px-4 text-left text-gray-700 font-semibold">Player 2</th>
                    <th className="py-3 px-4 text-left text-gray-700 font-semibold">Score</th>
                    <th className="py-3 px-4 text-left text-gray-700 font-semibold">Winner</th>
                    <th className="py-3 px-4 text-left text-gray-700 font-semibold">Rounds</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {games.map(game => (
                    <tr key={game._id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">{formatDate(game.createdAt)}</td>
                      <td className="py-3 px-4">{game.player1Name}</td>
                      <td className="py-3 px-4">{game.player2Name}</td>
                      <td className="py-3 px-4">
                        {game.player1Score} - {game.player2Score}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          game.gameWinner === 'player1' ? 'bg-blue-100 text-blue-800' :
                          game.gameWinner === 'player2' ? 'bg-red-100 text-red-800' :
                          game.gameWinner === 'tie' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {getGameWinner(game)}
                        </span>
                      </td>
                      <td className="py-3 px-4">{game.rounds.length}/6</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-4 text-center">
          <a href="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Game
          </a>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;