<template>
  <section class="indexPage">
    <p class="indexPage__title">
      Index
    </p>

    <div class="indexPage__links">
      <RouterLink class="indexPage__link" :to="{ name: $routes.EXAMPLE }">
        To Example
      </RouterLink>

      <RouterLink class="indexPage__link" :to="{ name: $routes.GAME }">
        To Game
      </RouterLink>
    </div>
  </section>
</template>

<script setup lang="ts">
</script>

<style scoped>
.indexPage {
  display: grid;
  gap: 1rem;
}

.indexPage__title {
  margin: 0;
}

.indexPage__links {
  display: grid;
  gap: 0.75rem;
}

.indexPage__link {
  width: fit-content;
}
</style>
