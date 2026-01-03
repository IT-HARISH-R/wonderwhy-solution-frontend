import React, { useState, useEffect } from 'react';
import axios from 'axios';


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
    const res = await axios.get(`http://56.228.33.77:3000/api/games`);

    // 👇 SAFELY extract array
    const gamesData =
      Array.isArray(res.data)
        ? res.data
        : res.data.data || [];

    setGames(gamesData);
    setError('');
  } catch (err) {
    setError('Failed to fetch games');
    setGames([]);
  } finally {
    setLoading(false);
  }
};


  const toggleGame = (id) => {
    setSelectedGameId(prev => (prev === id ? null : id));
  };

  const formatDate = (date) =>
    new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  const getWinner = (g) => {
    if (!g.gameWinner) return 'Pending';
    if (g.gameWinner === 'player1') return g.player1Name;
    if (g.gameWinner === 'player2') return g.player2Name;
    return 'Tie';
  };

  const badgeColor = (winner) => {
    if (winner === 'player1') return 'bg-blue-100 text-blue-700';
    if (winner === 'player2') return 'bg-red-100 text-red-700';
    if (winner === 'tie') return 'bg-gray-100 text-gray-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 sm:px-6 py-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Game History</h1>
          <button
            onClick={fetchGames}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full sm:w-auto"
          >
             Refresh
          </button>
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
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading && !error && games.length === 0 && (
          <div className="bg-white p-8 rounded-xl shadow text-center">
            <p className="text-gray-600 mb-3">No games played yet</p>
            <a href="/" className="text-blue-600 font-semibold">
              Start a new game →
            </a>
          </div>
        )}

        {/* ================= MOBILE VIEW ================= */}
        <div className="space-y-4 md:hidden">
          { games.map(g => (
            <div
              key={g._id}
              onClick={() => toggleGame(g._id)}
              className="bg-white p-4 rounded-xl shadow cursor-pointer"
            >
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-500">
                  {formatDate(g.createdAt)}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs ${badgeColor(g.gameWinner)}`}>
                  {getWinner(g)}
                </span>
              </div>

              <p className="font-semibold">
                {g.player1Name} vs {g.player2Name}
              </p>
              <p className="text-gray-600 text-sm">
                Score: {g.player1Score} - {g.player2Score}
              </p>

              {/* ROUNDS */}
              {selectedGameId === g._id && (
                <div className="mt-4 border-t pt-3 space-y-2 text-sm">
                  {g.rounds.map(r => (
                    <div
                      key={r._id}
                      className="flex justify-between bg-gray-50 p-2 rounded"
                    >
                      <span>R{r.roundNumber}</span>
                      <span className="capitalize">
                        {r.player1Choice} vs {r.player2Choice}
                      </span>
                      <span className="font-semibold">
                        {r.winner === 'player1'
                          ? g.player1Name
                          : r.winner === 'player2'
                          ? g.player2Name
                          : 'Tie'}
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
          <div className="hidden md:block bg-white rounded-xl shadow overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4 text-left">Date</th>
                  <th className="p-4">Player 1</th>
                  <th className="p-4">Player 2</th>
                  <th className="p-4">Score</th>
                  <th className="p-4">Winner</th>
                  <th className="p-4">Rounds</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {games.map(g => (
                  <React.Fragment key={g._id}>
                    <tr
                      onClick={() => toggleGame(g._id)}
                      className="hover:bg-gray-50 cursor-pointer"
                    >
                      <td className="p-4">{formatDate(g.createdAt)}</td>
                      <td className="p-4">{g.player1Name}</td>
                      <td className="p-4">{g.player2Name}</td>
                      <td className="p-4">
                        {g.player1Score} - {g.player2Score}
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full ${badgeColor(g.gameWinner)}`}>
                          {getWinner(g)}
                        </span>
                      </td>
                      <td className="p-4">{g.rounds.length}/6</td>
                    </tr>

                    {/* EXPANDED ROUNDS */}
                    {selectedGameId === g._id && (
                      <tr className="bg-gray-50">
                        <td colSpan="6" className="p-4">
                          <table className="w-full text-sm border rounded-lg overflow-hidden">
                            <thead className="bg-gray-200">
                              <tr>
                                <th className="p-2">Round</th>
                                <th className="p-2">{g.player1Name}</th>
                                <th className="p-2">{g.player2Name}</th>
                                <th className="p-2">Winner</th>
                              </tr>
                            </thead>
                            <tbody>
                              {g.rounds.map(r => (
                                <tr key={r._id} className="text-center border-t">
                                  <td className="p-2">{r.roundNumber}</td>
                                  <td className="p-2 capitalize">{r.player1Choice}</td>
                                  <td className="p-2 capitalize">{r.player2Choice}</td>
                                  <td className="p-2 font-semibold">
                                    {r.winner === 'player1'
                                      ? g.player1Name
                                      : r.winner === 'player2'
                                      ? g.player2Name
                                      : 'Tie'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Back */}
        <div className="mt-6 text-center">
          <a href="/" className="text-blue-600 font-semibold">
            ← Back to Game
          </a>
        </div>

      </div>
    </div>
  );
};

export default HistoryPage;
