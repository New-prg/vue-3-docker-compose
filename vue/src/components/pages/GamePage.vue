<template>
    <main class="game-page" aria-label="Game surface">
        <section class="game-page__surface">
            <div
                ref="mazeShellElement"
                class="game-page__maze-shell"
                :style="mazeStyle"
            >
                <div class="game-page__actions">
                    <button
                        type="button"
                        class="game-page__reset"
                        :disabled="isResetDisabled"
                        @click="resetCurrentMaze"
                    >
                        Reset
                    </button>
                </div>

                <div class="game-page__maze" :aria-label="mazeAriaLabel">
                    <div
                        v-for="cell in mazeCells"
                        :key="`${cell.row}-${cell.column}`"
                        class="game-page__cell"
                        :class="{
                            'game-page__cell--visited': cell.isVisited,
                            'game-page__cell--wall':
                                cell.type === cellTypes.WALL,
                            'game-page__cell--player': cell.isPlayer,
                        }"
                    >
                        <span
                            v-if="cell.isPlayer"
                            class="game-page__player"
                            aria-hidden="true"
                        >
                            {{ playerProgressLabel }}
                        </span>
                    </div>
                </div>

                <span
                    ref="playerLabelMeasureElement"
                    class="game-page__player game-page__player--measure"
                    aria-hidden="true"
                >
                    {{ playerFullProgressLabel }}
                </span>
            </div>

            <div
                class="game-page__controls"
                aria-label="Maze directional controls"
            >
                <button
                    type="button"
                    class="game-page__control game-page__control--left"
                    :disabled="isDirectionDisabled(directions.LEFT)"
                    @click="movePlayer(directions.LEFT)"
                >
                    ←
                </button>
                <button
                    type="button"
                    class="game-page__control game-page__control--up"
                    :disabled="isDirectionDisabled(directions.UP)"
                    @click="movePlayer(directions.UP)"
                >
                    ↑
                </button>
                <button
                    type="button"
                    class="game-page__control game-page__control--down"
                    :disabled="isDirectionDisabled(directions.DOWN)"
                    @click="movePlayer(directions.DOWN)"
                >
                    ↓
                </button>
                <button
                    type="button"
                    class="game-page__control game-page__control--right"
                    :disabled="isDirectionDisabled(directions.RIGHT)"
                    @click="movePlayer(directions.RIGHT)"
                >
                    →
                </button>
            </div>
        </section>

        <div
            v-if="isComplete"
            class="game-page__overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="game-page-winner-title"
        >
            <div class="game-page__overlay-panel">
                <p id="game-page-winner-title" class="game-page__overlay-title">
                    winner winner chicken dinner
                </p>

                <button
                    type="button"
                    class="game-page__overlay-action"
                    @click="handleWinnerAction"
                >
                    Hooray!
                </button>
            </div>
        </div>
    </main>
</template>

<script setup lang="ts">
import {
    computed,
    nextTick,
    onBeforeUnmount,
    onMounted,
    ref,
    watch,
} from "vue";
import { useStore } from "vuex";

interface MazeCell {
    type: string;
    visited: boolean;
}

interface Player {
    row: number;
    column: number;
}

interface MazeConfiguration {
    id: string;
    name: string;
}

interface CellTypes {
    WALL: string;
    PATH: string;
}

interface GameDirections {
    UP: string;
    DOWN: string;
    LEFT: string;
    RIGHT: string;
}

interface AvailableMoves {
    [key: string]: boolean;
}

interface Progress {
    current: number;
    total: number;
}

interface GameModuleState {
    maze: MazeCell[][];
    player: Player;
    configurations: MazeConfiguration[];
    currentLevel: MazeConfiguration;
    cellTypes: CellTypes;
    directions: GameDirections;
    availableMoves?: AvailableMoves;
    progress?: Progress;
    isComplete?: boolean;
}

interface RootState {
    game: GameModuleState;
}

const store = useStore<RootState>();
const mazeShellElement = ref<HTMLElement | null>(null);
const playerLabelMeasureElement = ref<HTMLElement | null>(null);
const shouldUseCompactPlayerLabel = ref(false);

let playerLabelResizeObserver: ResizeObserver | null = null;

const gameState = computed(() => store.state.game);
const configurations = computed(() => gameState.value.configurations ?? []);
const cellTypes = computed(() => gameState.value.cellTypes);
const directions = computed(() => gameState.value.directions);

const mazeRows = computed(() => gameState.value.maze.length);
const mazeColumns = computed(() => gameState.value.maze[0]?.length ?? 0);

const currentConfigurationIndex = computed(() => {
    return configurations.value.findIndex(
        (configuration) =>
            configuration.id === gameState.value.currentLevel?.id,
    );
});

const isComplete = computed(() => Boolean(gameState.value.isComplete));

const isMazeSwitchDisabled = computed(() => configurations.value.length <= 1);
const isResetDisabled = computed(() => !gameState.value.currentLevel?.id);

const movePlayer = (direction: string) => {
    store.dispatch("game/movePlayer", direction);
};

const isDirectionDisabled = (direction?: string) => {
    if (!direction || isComplete.value) {
        return true;
    }

    return !gameState.value.availableMoves?.[direction];
};

const resetCurrentMaze = () => {
    const currentLevelId = gameState.value.currentLevel?.id;

    if (!currentLevelId) {
        return;
    }

    store.dispatch("game/initializeGame", currentLevelId);
};

const cycleMazeConfiguration = () => {
    if (isMazeSwitchDisabled.value) {
        return;
    }

    const nextIndex =
        (currentConfigurationIndex.value + 1) % configurations.value.length;
    const nextConfiguration =
        configurations.value[nextIndex] ?? configurations.value[0];

    if (!nextConfiguration) {
        return;
    }

    store.dispatch("game/initializeGame", nextConfiguration.id);
};

const handleWinnerAction = () => {
    if (isMazeSwitchDisabled.value) {
        resetCurrentMaze();

        return;
    }

    cycleMazeConfiguration();
};

const mazeCells = computed(() => {
    return gameState.value.maze.flatMap((row, rowIndex) => {
        return row.map((cell, columnIndex) => ({
            row: rowIndex,
            column: columnIndex,
            type: cell.type,
            isVisited: cell.visited && cell.type !== cellTypes.value.WALL,
            isPlayer:
                gameState.value.player.row === rowIndex &&
                gameState.value.player.column === columnIndex,
        }));
    });
});

const playerFullProgressLabel = computed(() => {
    const progress = gameState.value.progress;

    if (!progress?.total) {
        return "";
    }

    return `${progress.current}/${progress.total}`;
});

const playerRemainingLabel = computed(() => {
    const progress = gameState.value.progress;

    if (!progress?.total) {
        return "";
    }

    return `${Math.max(progress.total - progress.current, 0)}`;
});

const playerProgressLabel = computed(() => {
    if (!playerFullProgressLabel.value) {
        return "";
    }

    return shouldUseCompactPlayerLabel.value
        ? playerRemainingLabel.value
        : playerFullProgressLabel.value;
});

const mazeStyle = computed(() => ({
    "--maze-columns": `${Math.max(mazeColumns.value, 1)}`,
    "--maze-rows": `${Math.max(mazeRows.value, 1)}`,
}));

const mazeAriaLabel = computed(() => {
    return `Maze ${mazeRows.value} by ${mazeColumns.value}, player at row ${gameState.value.player.row}, column ${gameState.value.player.column}`;
});

const updatePlayerLabelMode = () => {
    nextTick(() => {
        const playerMarkerElement =
            mazeShellElement.value?.querySelector<HTMLElement>(
                ".game-page__player:not(.game-page__player--measure)",
            );
        const playerMeasureElement = playerLabelMeasureElement.value;

        if (
            !playerMarkerElement ||
            !playerMeasureElement ||
            !playerFullProgressLabel.value
        ) {
            shouldUseCompactPlayerLabel.value = false;

            return;
        }

        const playerMarkerRect = playerMarkerElement.getBoundingClientRect();
        const playerMeasureRect = playerMeasureElement.getBoundingClientRect();

        shouldUseCompactPlayerLabel.value =
            playerMeasureRect.width > playerMarkerRect.width ||
            playerMeasureRect.height > playerMarkerRect.height;
    });
};

watch(
    [
        playerFullProgressLabel,
        mazeRows,
        mazeColumns,
        () => gameState.value.player.row,
        () => gameState.value.player.column,
    ],
    updatePlayerLabelMode,
    { flush: "post" },
);

onMounted(() => {
    updatePlayerLabelMode();

    if (typeof ResizeObserver === "undefined") {
        return;
    }

    playerLabelResizeObserver = new ResizeObserver(() => {
        updatePlayerLabelMode();
    });

    if (mazeShellElement.value) {
        playerLabelResizeObserver.observe(mazeShellElement.value);
    }

    if (playerLabelMeasureElement.value) {
        playerLabelResizeObserver.observe(playerLabelMeasureElement.value);
    }
});

onBeforeUnmount(() => {
    playerLabelResizeObserver?.disconnect();
});
</script>

<style scoped>
.game-page {
    --game-space-1: 0.5rem;
    --game-space-2: 0.75rem;
    --game-space-3: 1rem;
    --game-space-4: 1.5rem;
    --game-page-inline-padding: 2rem;
    --game-viewport-padding: 4rem;
    --game-control-strip-height: clamp(3.5rem, 12dvh, 4.75rem);
    --game-controls-base-width: 30rem;
    --game-surface-height: calc(100dvh - var(--game-viewport-padding));

    grid-column: 1 / -1;
    width: calc(100dvw - (var(--game-page-inline-padding) * 2));
    max-width: none;
    height: var(--game-surface-height);
    min-width: 0;
    min-height: 0;
    margin-block: 0;
    margin-inline: calc(50% - 50dvw + var(--game-page-inline-padding));
}

.game-page__surface {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: var(--game-space-3);
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
}

.game-page__maze-shell {
    --game-maze-max-height: calc(
        var(--game-surface-height) - var(--game-control-strip-height) -
            var(--game-space-3)
    );

    position: relative;
    flex: 0 0 auto;
    width: min(
        100%,
        calc(
            var(--game-maze-max-height) *
                (var(--maze-columns) / var(--maze-rows))
        )
    );
    max-width: 100%;
    min-width: 0;
    margin: 0 auto;
}

.game-page__actions {
    position: absolute;
    top: var(--game-space-1);
    right: var(--game-space-1);
    z-index: 1;
    display: grid;
    justify-items: end;
    gap: var(--game-space-1);
    max-width: calc(100% - (var(--game-space-1) * 2));
}

.game-page__reset,
.game-page__overlay-action,
.game-page__control {
    border: 1px solid var(--color-border-hover);
    background: var(--color-background-soft);
    color: var(--color-heading);
    font: inherit;
    opacity: 1;
}

.game-page__reset,
.game-page__overlay-action {
    padding: var(--game-space-1) var(--game-space-2);
    background: color-mix(in srgb, var(--color-background) 78%, transparent);
    line-height: 1.2;
}

.game-page__maze {
    display: grid;
    grid-template-columns: repeat(var(--maze-columns), minmax(0, 1fr));
    width: 100%;
    aspect-ratio: var(--maze-columns) / var(--maze-rows);
    border: 1px solid var(--color-border-hover);
    background: var(--color-background);
}

.game-page__cell {
    aspect-ratio: 1;
    border: 1px solid var(--color-border);
    background: var(--color-background);
    display: grid;
    place-items: center;
}

.game-page__cell--visited {
    background: color-mix(
        in srgb,
        var(--color-heading) 12%,
        var(--color-background)
    );
}

.game-page__cell--wall {
    background: var(--color-background-mute);
}

.game-page__player {
    width: 78%;
    height: 78%;
    border: 1px solid var(--color-heading);
    background: var(--color-heading);
    color: var(--color-background);
    display: grid;
    place-items: center;
    padding: var(--game-space-1);
    font-size: clamp(0.5rem, 1.3vw, 0.875rem);
    font-weight: 600;
    line-height: 1;
    text-align: center;
    white-space: nowrap;
}

.game-page__player--measure {
    position: absolute;
    top: 0;
    left: 0;
    width: auto;
    height: auto;
    visibility: hidden;
    pointer-events: none;
}

.game-page__overlay {
    position: fixed;
    inset: 0;
    z-index: 10;
    display: grid;
    place-items: center;
    padding: var(--game-space-4);
    background: color-mix(in srgb, var(--color-background) 70%, transparent);
}

.game-page__overlay-panel {
    display: grid;
    justify-items: center;
    gap: var(--game-space-3);
    padding: var(--game-space-4);
    border: 1px solid var(--color-border-hover);
    background: color-mix(
        in srgb,
        var(--color-background-soft) 92%,
        transparent
    );
    min-width: min(100%, 22rem);
}

.game-page__overlay-title {
    color: var(--color-heading);
    font-size: clamp(1.5rem, 3vw, 2rem);
    line-height: 1.2;
    text-align: center;
}

.game-page__overlay-action {
    min-width: 6rem;
}

.game-page__controls {
    flex: 0 0 auto;
    align-self: center;
    width: min(100%, var(--game-controls-base-width));
    height: var(--game-control-strip-height);
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    grid-template-rows: repeat(2, minmax(0, 1fr));
    gap: var(--game-space-1);
}

.game-page__control {
    min-height: 0;
    height: 100%;
    display: grid;
    place-items: center;
    padding: 0;
    font-size: 1.125rem;
    line-height: 1;
}

.game-page__control--left {
    grid-column: 1;
    grid-row: 1 / span 2;
}

.game-page__control--up {
    grid-column: 2;
    grid-row: 1;
}

.game-page__control--down {
    grid-column: 2;
    grid-row: 2;
}

.game-page__control--right {
    grid-column: 3;
    grid-row: 1 / span 2;
}

@media (max-width: 45rem) {
    .game-page__controls {
        width: 100%;
    }
}
</style>
