<template>
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
                @click="emit('action')"
            >
                Hooray!
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
defineProps<{
    isComplete: boolean;
}>();

const emit = defineEmits<{
    (event: "action"): void;
}>();
</script>

<style scoped>
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
    border: 1px solid var(--color-border-hover);
    background: color-mix(in srgb, var(--color-background) 78%, transparent);
    color: var(--color-heading);
    font: inherit;
    opacity: 1;
    padding: var(--game-space-1) var(--game-space-2);
    line-height: 1.2;
}
</style>
