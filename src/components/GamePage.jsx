import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://56.228.33.77:3000/api';

const GamePage = () => {
  const [step, setStep] = useState(1); // 1: Setup, 2: Game, 3: Results
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [gameId, setGameId] = useState(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [choices, setChoices] = useState({ player1: null, player2: null });
  const [rounds, setRounds] = useState([]);
  const [scores, setScores] = useState({ player1: 0, player2: 0, ties: 0 });
  const [loading, setLoading] = useState(false);
  const [gameWinner, setGameWinner] = useState(null);

  const choicesList = [
    { id: 'stone', label: 'Stone', emoji: '✊' },
    { id: 'paper', label: 'Paper', emoji: '✋' },
    { id: 'scissors', label: 'Scissors', emoji: '✌️' }
  ];

  const startGame = async () => {
    if (!player1Name.trim() || !player2Name.trim()) {
      alert('Please enter names for both players');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/games`, {
        player1Name,
        player2Name
      });

      setGameId(response.data.gameId);
      setStep(2);
      setCurrentRound(1);
      setRounds([]);
      setScores({ player1: 0, player2: 0, ties: 0 });
      setGameWinner(null);
    } catch (error) {
      console.error('Error starting game:', error);
      alert('Failed to start game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChoice = (player, choice) => {
    setChoices(prev => ({ ...prev, [player]: choice }));
  };

  const playRound = async () => {
    if (!choices.player1 || !choices.player2) {
      alert('Both players must make a choice');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/games/play-round`, {
        gameId,
        roundNumber: currentRound,
        player1Choice: choices.player1,
        player2Choice: choices.player2
      });

      const { round, scores: newScores, gameWinner: winner } = response.data;

      setRounds(prev => [...prev, round]);
      setScores(newScores);

      if (currentRound === 6) {
        setGameWinner(winner);
        setStep(3);
      } else {
        setCurrentRound(prev => prev + 1);
      }

      setChoices({ player1: null, player2: null });
    } catch (error) {
      console.error('Error playing round:', error);
      alert('Failed to play round. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetGame = () => {
    setStep(1);
    setPlayer1Name('');
    setPlayer2Name('');
    setGameId(null);
    setCurrentRound(1);
    setChoices({ player1: null, player2: null });
    setRounds([]);
    setScores({ player1: 0, player2: 0, ties: 0 });
    setGameWinner(null);
  };

  const getWinnerText = () => {
    if (!gameWinner) return '';
    if (gameWinner === 'player1') return `${player1Name} Wins!`;
    if (gameWinner === 'player2') return `${player2Name} Wins!`;
    return "It's a Tie!";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Stone Paper Scissors
          </h1>
          <p className="text-gray-600">Battle it out in 6 rounds!</p>
          <div className='flex justify-end'>
            <button
             onClick={() => window.location.href = '/history'}
              className=" bg-blue-600  text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full sm:w-auto"
            >
              Refresh
            </button>
          </div>
        </div>
        {/* Step 1: Player Setup */}
        {step === 1 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Enter Player Names
            </h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-gray-700 mb-2">Player 1 Name</label>
                <input
                  type="text"
                  value={player1Name}
                  onChange={(e) => setPlayer1Name(e.target.value)}
                  placeholder="Enter name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Player 2 Name</label>
                <input
                  type="text"
                  value={player2Name}
                  onChange={(e) => setPlayer2Name(e.target.value)}
                  placeholder="Enter name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <button
              onClick={startGame}
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
            >
              {loading ? 'Starting...' : 'Start Game'}
            </button>
          </div>
        )}

        {/* Step 2: Game Rounds */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Round Header */}
            <div className="text-center">
              <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full">
                Round {currentRound}/6
              </div>
            </div>

            {/* Score Display */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <h3 className="text-gray-700 mb-2">{player1Name}</h3>
                <div className="text-3xl font-bold text-blue-600">
                  {scores.player1}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4 text-center">
                <h3 className="text-gray-700 mb-2">Ties</h3>
                <div className="text-3xl font-bold text-gray-600">
                  {scores.ties}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4 text-center">
                <h3 className="text-gray-700 mb-2">{player2Name}</h3>
                <div className="text-3xl font-bold text-red-600">
                  {scores.player2}
                </div>
              </div>
            </div>

            {/* Game Area */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Player 1 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    {player1Name}
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {choicesList.map(choice => (
                      <button
                        key={choice.id}
                        onClick={() => handleChoice('player1', choice.id)}
                        className={`p-4 rounded-lg border-2 ${choices.player1 === choice.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:bg-gray-50'
                          }`}
                      >
                        <div className="text-2xl mb-2">{choice.emoji}</div>
                        <div className="text-sm font-medium">{choice.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Player 2 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    {player2Name}
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {choicesList.map(choice => (
                      <button
                        key={choice.id}
                        onClick={() => handleChoice('player2', choice.id)}
                        className={`p-4 rounded-lg border-2 ${choices.player2 === choice.id
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-300 hover:bg-gray-50'
                          }`}
                      >
                        <div className="text-2xl mb-2">{choice.emoji}</div>
                        <div className="text-sm font-medium">{choice.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Play Button */}
              <div className="mt-8 text-center">
                <button
                  onClick={playRound}
                  disabled={loading || !choices.player1 || !choices.player2}
                  className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                >
                  {loading ? 'Playing...' : `Play Round ${currentRound}`}
                </button>
              </div>
            </div>

            {/* Rounds History */}
            {rounds.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Previous Rounds
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 text-left text-gray-700">Round</th>
                        <th className="py-2 text-left text-gray-700">{player1Name}</th>
                        <th className="py-2 text-left text-gray-700">{player2Name}</th>
                        <th className="py-2 text-left text-gray-700">Winner</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rounds.map(round => (
                        <tr key={round.roundNumber} className="border-b">
                          <td className="py-3">{round.roundNumber}</td>
                          <td className="py-3 capitalize">{round.player1Choice}</td>
                          <td className="py-3 capitalize">{round.player2Choice}</td>
                          <td className="py-3">
                            {round.winner === 'player1' ? player1Name :
                              round.winner === 'player2' ? player2Name : 'Tie'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Results */}
        {step === 3 && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                {getWinnerText()}
              </h2>
              <p className="text-gray-600">Game completed!</p>
            </div>

            {/* Final Scores */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200">
                <h3 className="text-gray-700 mb-2">{player1Name}</h3>
                <div className="text-4xl font-bold text-blue-600">
                  {scores.player1}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                <h3 className="text-gray-700 mb-2">Ties</h3>
                <div className="text-4xl font-bold text-gray-600">
                  {scores.ties}
                </div>
              </div>

              <div className="bg-red-50 rounded-lg p-4 text-center border border-red-200">
                <h3 className="text-gray-700 mb-2">{player2Name}</h3>
                <div className="text-4xl font-bold text-red-600">
                  {scores.player2}
                </div>
              </div>
            </div>

            {/* Game Summary */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Game Summary
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left text-gray-700">Round</th>
                      <th className="py-2 text-left text-gray-700">{player1Name}</th>
                      <th className="py-2 text-left text-gray-700">{player2Name}</th>
                      <th className="py-2 text-left text-gray-700">Winner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rounds.map(round => (
                      <tr key={round.roundNumber} className="border-b">
                        <td className="py-3">{round.roundNumber}</td>
                        <td className="py-3 capitalize">{round.player1Choice}</td>
                        <td className="py-3 capitalize">{round.player2Choice}</td>
                        <td className="py-3">
                          {round.winner === 'player1' ? player1Name :
                            round.winner === 'player2' ? player2Name : 'Tie'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={resetGame}
                className="flex-1 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
              >
                Play Again
              </button>

              <button
                onClick={() => window.location.href = '/history'}
                className="flex-1 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700"
              >
                View History
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GamePage;