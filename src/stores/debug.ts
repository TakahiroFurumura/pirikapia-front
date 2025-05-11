import { defineStore, acceptHMRUpdate } from 'pinia';

export const useDebugStore = defineStore('debugStore', {
  state: () => ({
    debugMode: true,
  }),
  getters: {
    isDebugMode: (state) => state.debugMode
  },
  actions: {}
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useDebugStore, import.meta.hot));
}
