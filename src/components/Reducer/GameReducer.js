export const initialState = {
  step: 1,
  player1Name: '',
  player2Name: '',
  gameId: null,
  currentRound: 1,
  choices: { player1: null, player2: null },
  rounds: [],
  scores: { player1: 0, player2: 0, ties: 0 },
  gameWinner: null,
  loading: false
};

export const gameReducer = (state, action) => {
  switch (action.type) {
    case 'SET_PLAYER_NAME':
      return {
        ...state,
        [action.payload.player === 'player1' ? 'player1Name' : 'player2Name']:
          action.payload.name
      };

    case 'SET_PLAYERS':
      return {
        ...state,
        step: 2,
        gameId: action.payload.gameId
      };

    case 'SET_CHOICE':
      return {
        ...state,
        choices: {
          ...state.choices,
          [action.payload.player]: action.payload.choice
        }
      };

    case 'ADD_ROUND':
      return {
        ...state,
        rounds: [...state.rounds, action.payload.round],
        scores: action.payload.scores,
        gameWinner: action.payload.gameWinner,
        currentRound: state.currentRound + 1,
        choices: { player1: null, player2: null },
        step: state.currentRound === 6 ? 3 : 2
      };

    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'RESET_GAME':
      return initialState;

    // ADD THIS NEW CASE
    case 'RESTORE_STATE':
      return {
        ...action.payload,
        loading: false,
        choices: { player1: null, player2: null }
      };

    default:
      return state;
  }
};