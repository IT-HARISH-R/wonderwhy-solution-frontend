import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://56.228.33.77:3000/api';

const HistoryPage = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGameId, setSelectedGameId] = useState(null);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await axios.get(`${API_URL}/games`);
      
      // Backend returns array directly, not nested in data
      const gamesData = Array.isArray(res.data) ? res.data : [];
      
      // Ensure rounds always exist and use correct property name
      const formattedGames = gamesData.map(g => ({
        ...g,
        id: g.id, 
        rounds: g.Rounds || [], 
        player1Score: g.player1Score || 0,
        player2Score: g.player2Score || 0,
        tieRounds: g.tieRounds || 0
      }));

      setGames(formattedGames);
    } catch (err) {
      console.error('Fetch games error:', err);
      setError('Failed to fetch games. Please try again.');
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleGame = (id) => {
    setSelectedGameId(prev => (prev === id ? null : id));
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getWinner = (g) => {
    if (!g.gameWinner) return 'Pending';
    if (g.gameWinner === 'player1') return g.player1Name;
    if (g.gameWinner === 'player2') return g.player2Name;
    if (g.gameWinner === 'tie') return 'Tie';
    return 'Pending';
  };

  const badgeColor = (game) => {
    const winner = game.gameWinner;
    if (winner === 'player1') return 'bg-blue-100 text-blue-700';
    if (winner === 'player2') return 'bg-red-100 text-red-700';
    if (winner === 'tie') return 'bg-gray-100 text-gray-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  const getRoundWinner = (round, game) => {
    if (!round.winner) return 'Pending';
    if (round.winner === 'player1') return game.player1Name;
    if (round.winner === 'player2') return game.player2Name;
    if (round.winner === 'tie') return 'Tie';
    return 'Pending';
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 sm:px-6 py-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Game History</h1>
          <div className="flex gap-2">
            <button
              onClick={() => window.location.href = '/'}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Back to Game
            </button>
            <button
              onClick={fetchGames}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center py-12">
            <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-3 text-gray-600">Loading games...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
            {error}
            <button 
              onClick={fetchGames}
              className="ml-4 text-red-700 font-semibold"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && games.length === 0 && (
          <div className="bg-white p-8 rounded-xl shadow text-center">
            <p className="text-gray-600 mb-3">No games played yet</p>
            <a href="/" className="text-blue-600 font-semibold hover:underline">
              Start a new game →
            </a>
          </div>
        )}

        {/* ================= MOBILE VIEW ================= */}
        <div className="space-y-4 md:hidden">
          {games.map(game => (
            <div
              key={game.id}
              onClick={() => toggleGame(game.id)}
              className="bg-white p-4 rounded-xl shadow cursor-pointer hover:shadow-md transition"
            >
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-500">
                  {formatDate(game.createdAt)}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs ${badgeColor(game)}`}>
                  {getWinner(game)}
                </span>
              </div>

              <p className="font-semibold text-lg">
                {game.player1Name} vs {game.player2Name}
              </p>
              <p className="text-gray-600 text-sm">
                Score: {game.player1Score} - {game.player2Score} (Ties: {game.tieRounds})
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Rounds: {(game.rounds || []).length}/6
              </p>

              {/* ROUNDS */}
              {selectedGameId === game.id && (
                <div className="mt-4 border-t pt-3 space-y-2">
                  <p className="font-semibold text-gray-700">Rounds:</p>
                  {(game.rounds || []).map(round => (
                    <div
                      key={round.id}
                      className="flex justify-between bg-gray-50 p-2 rounded text-sm"
                    >
                      <span className="font-medium">R{round.roundNumber}</span>
                      <span className="capitalize">
                        {round.player1Choice} vs {round.player2Choice}
                      </span>
                      <span className="font-semibold">
                        {getRoundWinner(round, game)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ================= DESKTOP VIEW ================= */}
        {!loading && games.length > 0 && (
          <div className="hidden md:block bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4 text-left text-gray-700 font-semibold">Date</th>
                  <th className="p-4 text-left text-gray-700 font-semibold">Player 1</th>
                  <th className="p-4 text-left text-gray-700 font-semibold">Player 2</th>
                  <th className="p-4 text-left text-gray-700 font-semibold">Score</th>
                  <th className="p-4 text-left text-gray-700 font-semibold">Winner</th>
                  <th className="p-4 text-left text-gray-700 font-semibold">Rounds</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {games.map(game => (
                  <React.Fragment key={game.id}>
                    <tr
                      onClick={() => toggleGame(game.id)}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="p-4">{formatDate(game.createdAt)}</td>
                      <td className="p-4 font-medium">{game.player1Name}</td>
                      <td className="p-4 font-medium">{game.player2Name}</td>
                      <td className="p-4">
                        {game.player1Score} - {game.player2Score}
                        <span className="text-gray-500 text-sm ml-2">
                          (T: {game.tieRounds})
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full ${badgeColor(game)}`}>
                          {getWinner(game)}
                        </span>
                      </td>
                      <td className="p-4">
                        {(game.rounds || []).length}/6
                        <button className="ml-2 text-blue-600 text-sm">
                          {selectedGameId === game.id ? '▲ Hide' : '▼ Show'} details
                        </button>
                      </td>
                    </tr>

                    {/* EXPANDED ROUNDS */}
                    {selectedGameId === game.id && (
                      <tr className="bg-gray-50">
                        <td colSpan="6" className="p-4">
                          <div className="bg-white rounded-lg border p-4">
                            <h4 className="font-semibold text-gray-800 mb-3">
                              Round Details
                            </h4>
                            <table className="w-full text-sm">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="p-2 text-left">Round</th>
                                  <th className="p-2 text-left">{game.player1Name}</th>
                                  <th className="p-2 text-left">{game.player2Name}</th>
                                  <th className="p-2 text-left">Winner</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(game.rounds || []).map(round => (
                                  <tr key={round.id} className="border-t">
                                    <td className="p-2">Round {round.roundNumber}</td>
                                    <td className="p-2 capitalize">{round.player1Choice}</td>
                                    <td className="p-2 capitalize">{round.player2Choice}</td>
                                    <td className="p-2 font-semibold">
                                      {getRoundWinner(round, game)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};

export default HistoryPage;