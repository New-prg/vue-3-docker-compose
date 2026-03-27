<template>
  <section class="examplePage">
    <p class="examplePage__title">
      Example STORE {{ count }}
    </p>

    <RouterLink class="examplePage__link" :to="{ name: $routes.INDEX }">
      To Index
    </RouterLink>

    <div class="examplePage__controls">
      <input v-model="value" class="examplePage__input" type="number">
      <input v-model="timeout" class="examplePage__input" type="number">
      <button class="examplePage__button" @click="() => onIncrementClick()">
        +
      </button>
      <button class="examplePage__button" @click="() => onSetValueClick()">
        SET
      </button>
    </div>

    <div class="examplePage__list">
      <div v-for="item in list" :key="item" class="examplePage__listItem">
        {{ item }}
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useStore } from 'vuex'

const STORE_GETTERS = {
  COUNT: 'getCount',
  LIST: 'list/getList',
}

const STORE_ACTIONS = {
  RUN_INCREMENT: 'runIncrement',
  SET_COUNT: 'setCount',
}

const store = useStore()
const count = computed(() => store.getters[STORE_GETTERS.COUNT])
const list = computed(() => store.getters[STORE_GETTERS.LIST])

const value = ref(1)
const timeout = ref(0)

const onIncrementClick = () => {
  store.dispatch(STORE_ACTIONS.RUN_INCREMENT, value.value)
}

const onSetValueClick = () => {
  store.dispatch(STORE_ACTIONS.SET_COUNT, {
    value: value.value,
    timeout: timeout.value,
  })
}
</script>

<style scoped>
.examplePage {
  display: grid;
  gap: 1rem;
}

.examplePage__title {
  margin: 0;
}

.examplePage__link {
  width: fit-content;
}

.examplePage__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.examplePage__input,
.examplePage__button {
  font: inherit;
}

.examplePage__list {
  display: grid;
  gap: 0.5rem;
}
</style>
