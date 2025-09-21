import { defineStore, acceptHMRUpdate } from 'pinia';

export const useUiConfigStore = defineStore('uiConfigStore', {
  state: () => ({
    debugMode: true,
    language: "jp",
  }),
  getters: {
    getLanguage: (state) => state.language,
    isDebugMode: (state) => state.debugMode
  },
  actions: {
    setLanguage(language: string) {
      this.language = language;
    },
  }
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useUiConfigStore, import.meta.hot));
}
