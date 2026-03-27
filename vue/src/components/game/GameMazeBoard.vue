<template>
    <div ref="mazeShellElement" class="game-page__maze-shell" :style="mazeStyle">
        <div class="game-page__actions">
            <button
                type="button"
                class="game-page__reset"
                :disabled="isResetDisabled"
                @click="emit('reset')"
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
                    'game-page__cell--wall': cell.type === cellTypes.WALL,
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

import type {
    CellTypes,
    MazeBoardCell,
    MazeCell,
    Player,
    Progress,
} from "./types";

const props = defineProps<{
    maze: MazeCell[][];
    player: Player;
    progress?: Progress;
    cellTypes: CellTypes;
    isResetDisabled: boolean;
}>();

const emit = defineEmits<{
    (event: "reset"): void;
}>();

const mazeShellElement = ref<HTMLElement | null>(null);
const playerLabelMeasureElement = ref<HTMLElement | null>(null);
const shouldUseCompactPlayerLabel = ref(false);

let playerLabelResizeObserver: ResizeObserver | null = null;

const mazeRows = computed(() => props.maze.length);
const mazeColumns = computed(() => props.maze[0]?.length ?? 0);

const mazeCells = computed<MazeBoardCell[]>(() => {
    return props.maze.flatMap((row, rowIndex) => {
        return row.map((cell, columnIndex) => ({
            row: rowIndex,
            column: columnIndex,
            type: cell.type,
            isVisited: cell.visited && cell.type !== props.cellTypes.WALL,
            isPlayer:
                props.player.row === rowIndex &&
                props.player.column === columnIndex,
        }));
    });
});

const playerFullProgressLabel = computed(() => {
    if (!props.progress?.total) {
        return "";
    }

    return `${props.progress.current}/${props.progress.total}`;
});

const playerRemainingLabel = computed(() => {
    if (!props.progress?.total) {
        return "";
    }

    return `${Math.max(props.progress.total - props.progress.current, 0)}`;
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
    return `Maze ${mazeRows.value} by ${mazeColumns.value}, player at row ${props.player.row}, column ${props.player.column}`;
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
        () => props.player.row,
        () => props.player.column,
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

.game-page__reset {
    border: 1px solid var(--color-border-hover);
    background: color-mix(in srgb, var(--color-background) 78%, transparent);
    color: var(--color-heading);
    font: inherit;
    opacity: 1;
    padding: var(--game-space-1) var(--game-space-2);
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
</style>
