<template>
  <main class="game-page" aria-label="Game surface">
    <section class="game-page__surface">
      <div class="game-page__maze-shell" :style="mazeStyle">
        <button type="button" class="game-page__reset" disabled>
          Reset
        </button>

        <div class="game-page__maze" :aria-label="mazeAriaLabel">
          <div
            v-for="cell in mazeCells"
            :key="`${cell.row}-${cell.column}`"
            class="game-page__cell"
            :class="{
              'game-page__cell--wall': cell.type === 'wall',
              'game-page__cell--player': cell.isPlayer,
            }"
          >
            <span v-if="cell.isPlayer" class="game-page__player" aria-hidden="true"></span>
          </div>
        </div>
      </div>

      <div class="game-page__controls" aria-label="Directional controls placeholder">
        <button type="button" class="game-page__control game-page__control--left" disabled>
          ←
        </button>
        <button type="button" class="game-page__control game-page__control--up" disabled>
          ↑
        </button>
        <button type="button" class="game-page__control game-page__control--down" disabled>
          ↓
        </button>
        <button type="button" class="game-page__control game-page__control--right" disabled>
          →
        </button>
      </div>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from 'vuex'

interface MazeCell {
  type: string
  visited: boolean
}

interface Player {
  row: number
  column: number
}

interface GameModuleState {
  maze: MazeCell[][]
  player: Player
}

interface RootState {
  game: GameModuleState
}

const store = useStore<RootState>()

const gameState = computed(() => store.state.game)

const mazeRows = computed(() => gameState.value.maze.length)
const mazeColumns = computed(() => gameState.value.maze[0]?.length ?? 0)

const mazeCells = computed(() => {
  return gameState.value.maze.flatMap((row, rowIndex) => {
    return row.map((cell, columnIndex) => ({
      row: rowIndex,
      column: columnIndex,
      type: cell.type,
      isPlayer:
        gameState.value.player.row === rowIndex
        && gameState.value.player.column === columnIndex,
    }))
  })
})

const mazeStyle = computed(() => ({
  '--maze-columns': `${Math.max(mazeColumns.value, 1)}`,
  '--maze-rows': `${Math.max(mazeRows.value, 1)}`,
}))

const mazeAriaLabel = computed(() => {
  return `Maze placeholder ${mazeRows.value} by ${mazeColumns.value}, player at row ${gameState.value.player.row}, column ${gameState.value.player.column}`
})
</script>

<style scoped>
.game-page {
  --game-space-1: 0.5rem;
  --game-space-2: 0.75rem;
  --game-space-3: 1rem;
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
  --game-maze-max-height: calc(var(--game-surface-height) - var(--game-control-strip-height) - var(--game-space-3));

  position: relative;
  flex: 0 0 auto;
  width: min(100%, calc(var(--game-maze-max-height) * (var(--maze-columns) / var(--maze-rows))));
  max-width: 100%;
  min-width: 0;
  margin: 0 auto;
}

.game-page__reset,
.game-page__control {
  border: 1px solid var(--color-border-hover);
  background: var(--color-background-soft);
  color: var(--color-heading);
  font: inherit;
  opacity: 1;
}

.game-page__reset {
  position: absolute;
  top: var(--game-space-1);
  right: var(--game-space-1);
  z-index: 1;
  padding: var(--game-space-1) var(--game-space-2);
  background: color-mix(in srgb, var(--color-background) 78%, transparent);
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

.game-page__cell--wall {
  background: var(--color-background-mute);
}

.game-page__player {
  width: 55%;
  height: 55%;
  border: 1px solid var(--color-heading);
  background: var(--color-heading);
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
