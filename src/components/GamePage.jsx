import React, { useContext, useEffect } from 'react';
import axios from 'axios';
import { GameContext } from './context/GameContext';

// const API_URL = 'http://localhost:3000/api';
const API_URL = 'http://56.228.33.77:3000/api';

const choicesList = [
  { id: 'stone', label: 'Stone', emoji: '✊' },
  { id: 'paper', label: 'Paper', emoji: '✋' },
  { id: 'scissors', label: 'Scissors', emoji: '✌️' }
];

const GamePage = () => {
  const { state, dispatch } = useContext(GameContext);

  // Restore game state
  useEffect(() => {
    const savedState = localStorage.getItem('gameState');
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);

        // Check if this is a valid in-progress game (step 2)
        const isValidInProgressGame =
          parsedState.step === 2 &&
          parsedState.gameId &&
          parsedState.player1Name &&
          parsedState.player2Name &&
          parsedState.currentRound <= 6;

        if (isValidInProgressGame) {
          // Restore the game state
          dispatch({
            type: 'RESTORE_STATE',
            payload: parsedState
          });
        }
      } catch (error) {
        console.error('Error restoring game:', error);
        localStorage.removeItem('gameState');
      }
    }
  }, [dispatch]);

  // Save state to localStorage when game is in progress
  useEffect(() => {
    // Only save when game is in progress (step 2)
    if (state.step === 2) {
      const stateToSave = {
        ...state,
        loading: false 
      };
      localStorage.setItem('gameState', JSON.stringify(stateToSave));
    }

    // Clear saved state when game is finished
    if (state.step === 3) {
      localStorage.removeItem('gameState');
    }
  }, [state]);

  const startGame = async () => {
    if (!state.player1Name.trim() || !state.player2Name.trim()) {
      alert('Please enter names for both players');
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await axios.post(`${API_URL}/games`, {
        player1Name: state.player1Name,
        player2Name: state.player2Name
      });

      dispatch({
        type: 'SET_PLAYERS',
        payload: {
          gameId: response.data.id
        }
      });
    } catch (error) {
      console.error('Error starting game:', error);
      alert('Failed to start game. Please try again.');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleChoice = (player, choice) => {
    dispatch({ type: 'SET_CHOICE', payload: { player, choice } });
  };

  const playRound = async () => {
    if (!state.choices.player1 || !state.choices.player2) {
      alert('Both players must make a choice');
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await axios.post(`${API_URL}/games/playround`, {
        gameId: state.gameId,
        roundNumber: state.currentRound,
        player1Choice: state.choices.player1,
        player2Choice: state.choices.player2
      });

      const { round, scores: newScores, gameWinner } = response.data;

      dispatch({
        type: 'ADD_ROUND',
        payload: { round, scores: newScores, gameWinner }
      });
    } catch (error) {
      console.error('Error playing round:', error);
      alert('Failed to play round. Please try again.');
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const resetGame = () => {
    dispatch({ type: 'RESET_GAME' });
    localStorage.removeItem('gameState');
  };

  const getWinnerText = () => {
    if (!state.gameWinner) return '';
    if (state.gameWinner === 'player1') return `${state.player1Name} Wins!`;
    if (state.gameWinner === 'player2') return `${state.player2Name} Wins!`;
    return "It's a Tie!";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Stone Paper Scissors</h1>
          <p className="text-gray-600">Battle it out in 6 rounds!</p>

          {/* Show continue message if game is in progress */}
          {state.step === 2 && state.rounds.length > 0 && (
            <div className="mt-4 mb-2">
              <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm">
                Game in progress - Round {state.currentRound}/6
              </div>
            </div>
          )}

          <div className="flex justify-end mt-3">
            <button
              onClick={() => (window.location.href = "/history")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              History
            </button>
          </div>
        </div>

        {/* Step 1: Player Setup */}
        {state.step === 1 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Enter Player Names
            </h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-gray-700 mb-2">Player 1 Name</label>
                <input
                  type="text"
                  value={state.player1Name}
                  onChange={(e) =>
                    dispatch({ type: 'SET_PLAYER_NAME', payload: { player: 'player1', name: e.target.value } })
                  }
                  placeholder="Enter name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Player 2 Name</label>
                <input
                  type="text"
                  value={state.player2Name}
                  onChange={(e) =>
                    dispatch({ type: 'SET_PLAYER_NAME', payload: { player: 'player2', name: e.target.value } })
                  }
                  placeholder="Enter name"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <button
              onClick={startGame}
              disabled={state.loading}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
            >
              {state.loading ? 'Starting...' : 'Start Game'}
            </button>
          </div>
        )}

        {/* Step 2: Game Rounds */}
        {state.step === 2 && (
          <div className="space-y-6">
            {/* Round Header with continue message */}
            <div className="text-center">
              <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full mb-2">
                Round {state.currentRound}/6
              </div>
            </div>

            {/* Score Display */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-lg shadow p-4 text-center">
                <h3 className="text-gray-700 mb-2">{state.player1Name}</h3>
                <div className="text-3xl font-bold text-blue-600">
                  {state.scores.player1}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4 text-center">
                <h3 className="text-gray-700 mb-2">Ties</h3>
                <div className="text-3xl font-bold text-gray-600">
                  {state.scores.ties}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-4 text-center">
                <h3 className="text-gray-700 mb-2">{state.player2Name}</h3>
                <div className="text-3xl font-bold text-red-600">
                  {state.scores.player2}
                </div>
              </div>
            </div>

            {/* Game Area */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Player 1 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    {state.player1Name}
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {choicesList.map(choice => (
                      <button
                        key={choice.id}
                        onClick={() => handleChoice('player1', choice.id)}
                        className={`p-4 rounded-lg border-2 ${state.choices.player1 === choice.id
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
                    {state.player2Name}
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {choicesList.map(choice => (
                      <button
                        key={choice.id}
                        onClick={() => handleChoice('player2', choice.id)}
                        className={`p-4 rounded-lg border-2 ${state.choices.player2 === choice.id
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
                  disabled={state.loading || !state.choices.player1 || !state.choices.player2}
                  className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                >
                  {state.loading ? 'Playing...' : `Play Round ${state.currentRound}`}
                </button>

                {/* Reset button option */}
                <div className="mt-4">
                  <button
                    onClick={resetGame}
                    className="px-5 py-2 bg-white text-red-600 rounded-lg border border-red-300 hover:bg-red-50 hover:text-red-700 font-medium transition-colors duration-200 shadow-sm"
                  >
                    New Game
                  </button>

                </div>
              </div>
            </div>

            {/* Rounds History */}
            {state.rounds.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Previous Rounds
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 text-left text-gray-700">Round</th>
                        <th className="py-2 text-left text-gray-700">{state.player1Name}</th>
                        <th className="py-2 text-left text-gray-700">{state.player2Name}</th>
                        <th className="py-2 text-left text-gray-700">Winner</th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.rounds.map(round => (
                        <tr key={round.roundNumber} className="border-b">
                          <td className="py-3">{round.roundNumber}</td>
                          <td className="py-3 capitalize">{round.player1Choice}</td>
                          <td className="py-3 capitalize">{round.player2Choice}</td>
                          <td className="py-3">
                            {round.winner === 'player1' ? state.player1Name :
                              round.winner === 'player2' ? state.player2Name : 'Tie'}
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
        {state.step === 3 && (
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
                <h3 className="text-gray-700 mb-2">{state.player1Name}</h3>
                <div className="text-4xl font-bold text-blue-600">
                  {state.scores.player1}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                <h3 className="text-gray-700 mb-2">Ties</h3>
                <div className="text-4xl font-bold text-gray-600">
                  {state.scores.ties}
                </div>
              </div>

              <div className="bg-red-50 rounded-lg p-4 text-center border border-red-200">
                <h3 className="text-gray-700 mb-2">{state.player2Name}</h3>
                <div className="text-4xl font-bold text-red-600">
                  {state.scores.player2}
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
                      <th className="py-2 text-left text-gray-700">{state.player1Name}</th>
                      <th className="py-2 text-left text-gray-700">{state.player2Name}</th>
                      <th className="py-2 text-left text-gray-700">Winner</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.rounds.map(round => (
                      <tr key={round.roundNumber} className="border-b">
                        <td className="py-3">{round.roundNumber}</td>
                        <td className="py-3 capitalize">{round.player1Choice}</td>
                        <td className="py-3 capitalize">{round.player2Choice}</td>
                        <td className="py-3">
                          {round.winner === 'player1' ? state.player1Name :
                            round.winner === 'player2' ? state.player2Name : 'Tie'}
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