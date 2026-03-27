<template>
    <main class="game-page" aria-label="Game surface">
        <section class="game-page__surface">
            <GameMazeBoard
                :maze="gameState.maze"
                :player="gameState.player"
                :progress="gameState.progress"
                :cell-types="cellTypes"
                :is-reset-disabled="isResetDisabled"
                @reset="resetCurrentMaze"
            />

            <GameControls
                :directions="directions"
                :available-moves="gameState.availableMoves"
                :is-complete="isComplete"
                @move="movePlayer"
            />
        </section>

        <GameWinnerOverlay :is-complete="isComplete" @action="handleWinnerAction" />
    </main>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useStore } from "vuex";

import GameControls from "../game/GameControls.vue";
import GameMazeBoard from "../game/GameMazeBoard.vue";
import GameWinnerOverlay from "../game/GameWinnerOverlay.vue";

import type { RootState } from "../game/types";

const store = useStore<RootState>();

const gameState = computed(() => store.state.game);
const configurations = computed(() => gameState.value.configurations ?? []);
const cellTypes = computed(() => gameState.value.cellTypes);
const directions = computed(() => gameState.value.directions);

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
</style>
