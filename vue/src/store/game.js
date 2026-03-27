const GAME_STATUSES = {
    IDLE: "IDLE",
    READY: "READY",
};

const CELL_TYPES = {
    WALL: "wall",
    PATH: "path",
};

const createCell = (type) => ({
    type,
    visited: false,
});

const buildMaze = (rows) =>
    rows.map((row) => row.map((cellType) => createCell(cellType)));

const cloneMaze = (maze) => maze.map((row) => row.map((cell) => ({ ...cell })));

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
    rows: buildMaze(rows),
    playerPosition,
});

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
];

const createProgress = (maze) => ({
    current: 0,
    total: maze.flat().filter((cell) => cell.type === CELL_TYPES.PATH).length,
});

const createStateFromConfiguration = (configuration) => ({
    maze: cloneMaze(configuration.rows),
    player: {
        row: configuration.playerPosition.row,
        column: configuration.playerPosition.column,
    },
    playerPosition: { ...configuration.playerPosition },
    progress: createProgress(configuration.rows),
    partyState: GAME_STATUSES.READY,
    partyStatus: GAME_STATUSES.READY,
    isComplete: false,
});

const initialConfiguration = mazeConfigurations[0];

export default {
    namespaced: true,
    state() {
        const preparedState =
            createStateFromConfiguration(initialConfiguration);

        return {
            cellTypes: CELL_TYPES,
            statuses: GAME_STATUSES,
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
    },
};
