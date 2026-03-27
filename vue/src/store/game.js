const GAME_STATUSES = {
  IDLE: "IDLE",
  READY: "READY",
  WON: "WON",
};

const CELL_TYPES = {
  WALL: "wall",
  PATH: "path",
};

const MOVE_DIRECTIONS = {
  UP: "up",
  DOWN: "down",
  LEFT: "left",
  RIGHT: "right",
};

const DIRECTION_VECTORS = {
  [MOVE_DIRECTIONS.UP]: {
    rowOffset: -1,
    columnOffset: 0,
  },
  [MOVE_DIRECTIONS.DOWN]: {
    rowOffset: 1,
    columnOffset: 0,
  },
  [MOVE_DIRECTIONS.LEFT]: {
    rowOffset: 0,
    columnOffset: -1,
  },
  [MOVE_DIRECTIONS.RIGHT]: {
    rowOffset: 0,
    columnOffset: 1,
  },
};

const createCell = (type) => ({
  type,
  visited: false,
});

const buildMaze = (rows) =>
  rows.map((row) => row.map((cellType) => createCell(cellType)));

const cloneMaze = (maze) => maze.map((row) => row.map((cell) => ({ ...cell })));

const isInsideMaze = (maze, row, column) => {
  return (
    row >= 0 &&
    row < maze.length &&
    column >= 0 &&
    column < (maze[row]?.length ?? 0)
  );
};

const getCell = (maze, row, column) => {
  if (!isInsideMaze(maze, row, column)) {
    return null;
  }

  return maze[row][column];
};

const isPathCell = (maze, row, column) => {
  const cell = getCell(maze, row, column);

  return cell?.type === CELL_TYPES.PATH;
};

const markVisitedCells = (maze, positions) => {
  positions.forEach(({ row, column }) => {
    const cell = getCell(maze, row, column);

    if (cell?.type === CELL_TYPES.PATH) {
      cell.visited = true;
    }
  });
};

const countVisitedCells = (maze) => {
  return maze
    .flat()
    .filter((cell) => cell.type === CELL_TYPES.PATH && cell.visited).length;
};

const createProgress = (maze) => ({
  current: countVisitedCells(maze),
  total: maze.flat().filter((cell) => cell.type === CELL_TYPES.PATH).length,
});

const createPlayerPosition = (playerPosition) => ({
  row: playerPosition.row,
  column: playerPosition.column,
});

const resolveMove = (maze, playerPosition, direction) => {
  const vector = DIRECTION_VECTORS[direction];

  if (!vector) {
    return {
      blocked: true,
      finalPosition: createPlayerPosition(playerPosition),
      traversedCells: [],
    };
  }

  let nextRow = playerPosition.row + vector.rowOffset;
  let nextColumn = playerPosition.column + vector.columnOffset;

  if (!isPathCell(maze, nextRow, nextColumn)) {
    return {
      blocked: true,
      finalPosition: createPlayerPosition(playerPosition),
      traversedCells: [],
    };
  }

  const traversedCells = [];

  while (isPathCell(maze, nextRow, nextColumn)) {
    traversedCells.push({
      row: nextRow,
      column: nextColumn,
    });

    nextRow += vector.rowOffset;
    nextColumn += vector.columnOffset;
  }

  const finalPosition = traversedCells[traversedCells.length - 1];

  return {
    blocked: false,
    finalPosition,
    traversedCells,
  };
};

const getAvailableMoves = (maze, playerPosition) => {
  return Object.values(MOVE_DIRECTIONS).reduce((availability, direction) => {
    availability[direction] = !resolveMove(maze, playerPosition, direction)
      .blocked;

    return availability;
  }, {});
};

const createMazeConfiguration = ({
  id,
  name,
  description,
  rows,
  playerPosition,
}) => ({
  id,
  name,
  description,
  rows,
  playerPosition,
});

const createMazeRowsFromLayout = (layout) => {
  return layout.map((row) =>
    row
      .split("")
      .map((cell) => (cell === "#" ? CELL_TYPES.WALL : CELL_TYPES.PATH)),
  );
};

const mazeConfigurations = [
  createMazeConfiguration({
    id: "training-ground",
    name: "Training ground",
    description: "Main testing Layout",
    rows: [
      [
        CELL_TYPES.WALL,
        CELL_TYPES.WALL,
        CELL_TYPES.WALL,
        CELL_TYPES.WALL,
        CELL_TYPES.WALL,
      ],
      [
        CELL_TYPES.WALL,
        CELL_TYPES.PATH,
        CELL_TYPES.PATH,
        CELL_TYPES.PATH,
        CELL_TYPES.WALL,
      ],
      [
        CELL_TYPES.WALL,
        CELL_TYPES.PATH,
        CELL_TYPES.WALL,
        CELL_TYPES.PATH,
        CELL_TYPES.WALL,
      ],
      [
        CELL_TYPES.WALL,
        CELL_TYPES.PATH,
        CELL_TYPES.PATH,
        CELL_TYPES.PATH,
        CELL_TYPES.WALL,
      ],
      [
        CELL_TYPES.WALL,
        CELL_TYPES.WALL,
        CELL_TYPES.WALL,
        CELL_TYPES.WALL,
        CELL_TYPES.WALL,
      ],
    ],
    playerPosition: {
      row: 1,
      column: 1,
    },
  }),
  createMazeConfiguration({
    id: "wide-corridor",
    name: "Wide corridor",
    description: "Alternative layout for testing",
    rows: [
      [
        CELL_TYPES.WALL,
        CELL_TYPES.WALL,
        CELL_TYPES.WALL,
        CELL_TYPES.WALL,
        CELL_TYPES.WALL,
        CELL_TYPES.WALL,
      ],
      [
        CELL_TYPES.WALL,
        CELL_TYPES.PATH,
        CELL_TYPES.PATH,
        CELL_TYPES.PATH,
        CELL_TYPES.PATH,
        CELL_TYPES.WALL,
      ],
      [
        CELL_TYPES.WALL,
        CELL_TYPES.PATH,
        CELL_TYPES.WALL,
        CELL_TYPES.WALL,
        CELL_TYPES.PATH,
        CELL_TYPES.WALL,
      ],
      [
        CELL_TYPES.WALL,
        CELL_TYPES.PATH,
        CELL_TYPES.PATH,
        CELL_TYPES.PATH,
        CELL_TYPES.PATH,
        CELL_TYPES.WALL,
      ],
      [
        CELL_TYPES.WALL,
        CELL_TYPES.WALL,
        CELL_TYPES.WALL,
        CELL_TYPES.WALL,
        CELL_TYPES.WALL,
        CELL_TYPES.WALL,
      ],
    ],
    playerPosition: {
      row: 1,
      column: 1,
    },
  }),
  createMazeConfiguration({
    id: "labyrinth-16",
    name: "Labyrinth 16x16",
    description: "Large maze layout with branches and dead ends",
    rows: createMazeRowsFromLayout([
      "################",
      "#..............#",
      "##############.#",
      "#.......######.#",
      "#.#####.######.#",
      "#.#####.######.#",
      "#.#####.######.#",
      "#.#####.######.#",
      "#.#####.######.#",
      "#.#####.######.#",
      "#.#####.######.#",
      "#............#.#",
      "######.#######.#",
      "#......#.......#",
      "#...........#..#",
      "################",
    ]),
    playerPosition: {
      row: 1,
      column: 1,
    },
  }),
];

const createStateFromConfiguration = (configuration) => {
  const maze = buildMaze(configuration.rows);
  const playerPosition = createPlayerPosition(configuration.playerPosition);

  markVisitedCells(maze, [playerPosition]);

  const progress = createProgress(maze);
  const isComplete = progress.current === progress.total;
  const partyStatus = isComplete ? GAME_STATUSES.WON : GAME_STATUSES.READY;

  return {
    maze,
    player: createPlayerPosition(playerPosition),
    playerPosition,
    progress,
    partyState: partyStatus,
    partyStatus,
    isComplete,
    availableMoves: getAvailableMoves(maze, playerPosition),
  };
};

const createMovedState = (state, direction) => {
  if (state.isComplete) {
    return null;
  }

  const maze = cloneMaze(state.maze);
  const playerPosition = createPlayerPosition(state.playerPosition);
  const moveResult = resolveMove(maze, playerPosition, direction);

  if (moveResult.blocked) {
    return null;
  }

  markVisitedCells(maze, moveResult.traversedCells);

  const nextPlayerPosition = createPlayerPosition(moveResult.finalPosition);
  const progress = createProgress(maze);
  const isComplete = progress.current === progress.total;
  const partyStatus = isComplete ? GAME_STATUSES.WON : GAME_STATUSES.READY;

  return {
    maze,
    player: createPlayerPosition(nextPlayerPosition),
    playerPosition: nextPlayerPosition,
    progress,
    partyState: partyStatus,
    partyStatus,
    isComplete,
    availableMoves: getAvailableMoves(maze, nextPlayerPosition),
  };
};

const initialConfiguration = mazeConfigurations[0];

export default {
  namespaced: true,
  state() {
    const preparedState = createStateFromConfiguration(initialConfiguration);

    return {
      cellTypes: CELL_TYPES,
      statuses: GAME_STATUSES,
      directions: MOVE_DIRECTIONS,
      availableLevels: mazeConfigurations,
      configurations: mazeConfigurations,
      currentLevel: {
        id: initialConfiguration.id,
        name: initialConfiguration.name,
      },
      ...preparedState,
    };
  },
  getters: {
    getMaze: (state) => state.maze,
    getPlayer: (state) => state.player,
    getPlayerPosition: (state) => state.playerPosition,
    getProgress: (state) => state.progress,
    getCurrentLevel: (state) => state.currentLevel,
    getPartyStatus: (state) => state.partyStatus,
    getConfigurations: (state) => state.configurations,
    getIsComplete: (state) => state.isComplete,
    getAvailableMoves: (state) => state.availableMoves,
    getDirections: (state) => state.directions,
  },
  mutations: {
    SET_CURRENT_LEVEL: (state, configuration) => {
      state.currentLevel = {
        id: configuration.id,
        name: configuration.name,
      };
    },
    SET_GAME_STATE: (state, gameState) => {
      state.maze = gameState.maze;
      state.player = gameState.player;
      state.playerPosition = gameState.playerPosition;
      state.progress = gameState.progress;
      state.partyState = gameState.partyState;
      state.partyStatus = gameState.partyStatus;
      state.isComplete = gameState.isComplete;
      state.availableMoves = gameState.availableMoves;
    },
  },
  actions: {
    initializeGame: ({ commit, state }, configurationId) => {
      const selectedConfiguration =
        state.configurations.find(
          (configuration) => configuration.id === configurationId,
        ) || state.configurations[0];

      commit("SET_CURRENT_LEVEL", selectedConfiguration);
      commit(
        "SET_GAME_STATE",
        createStateFromConfiguration(selectedConfiguration),
      );
    },
    movePlayer: ({ commit, state }, direction) => {
      const nextGameState = createMovedState(state, direction);

      if (!nextGameState) {
        return;
      }

      commit("SET_GAME_STATE", nextGameState);
    },
  },
};
