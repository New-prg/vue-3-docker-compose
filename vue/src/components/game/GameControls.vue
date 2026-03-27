<template>
    <div class="game-page__controls" aria-label="Maze directional controls">
        <button
            type="button"
            class="game-page__control game-page__control--left"
            :disabled="isDirectionDisabled(directions.LEFT)"
            @click="emit('move', directions.LEFT)"
        >
            ←
        </button>
        <button
            type="button"
            class="game-page__control game-page__control--up"
            :disabled="isDirectionDisabled(directions.UP)"
            @click="emit('move', directions.UP)"
        >
            ↑
        </button>
        <button
            type="button"
            class="game-page__control game-page__control--down"
            :disabled="isDirectionDisabled(directions.DOWN)"
            @click="emit('move', directions.DOWN)"
        >
            ↓
        </button>
        <button
            type="button"
            class="game-page__control game-page__control--right"
            :disabled="isDirectionDisabled(directions.RIGHT)"
            @click="emit('move', directions.RIGHT)"
        >
            →
        </button>
    </div>
</template>

<script setup lang="ts">
import type { AvailableMoves, GameDirections } from "./types";

const props = defineProps<{
    directions: GameDirections;
    availableMoves?: AvailableMoves;
    isComplete: boolean;
}>();

const emit = defineEmits<{
    (event: "move", direction: string): void;
}>();

const isDirectionDisabled = (direction?: string) => {
    if (!direction || props.isComplete) {
        return true;
    }

    return !props.availableMoves?.[direction];
};
</script>

<style scoped>
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
    border: 1px solid var(--color-border-hover);
    background: var(--color-background-soft);
    color: var(--color-heading);
    font: inherit;
    font-size: 1.125rem;
    line-height: 1;
    opacity: 1;
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
