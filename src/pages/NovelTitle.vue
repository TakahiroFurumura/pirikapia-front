<template>
  <q-page>
    <div class="col-12 q-px-md q-py-md text-h5">{{title}}</div>
    <div
        v-for="(scene,) in scenes"
        :key="scene"
        class="col-12 q-px-md q-py-sm novel-scene"
      >
      {{scene}}
      </div>
  </q-page>
</template>

<script setup lang="ts">

import { ref, onMounted } from 'vue';
// import type { APIResponseImage } from "app/interfaces";
// import {apiResponseToThumbnailProps} from "app/interfaces";
// import { useAuthStore } from 'stores/auth'
// const authStore = useAuthStore()
import { api } from 'boot/axios.js'
// import ImageThumbnail from "components/ImageThumbnail.vue";
// import { useRouter } from 'vue-router'
// import ImageThumbnail from "components/ImageThumbnail.vue";
// import type { ThumbnailProps } from 'components/ImageThumbnail.vue';
// const router = useRouter();

const title = ref("")
const scenes = ref<string[]>([]);

function loadNovelChapter() {
  api.get('/novels/eve/jp/')
    .then((response) => {
      console.log(response.data)
      response.data.text.forEach((text: string) => {
        console.log(text)
        title.value = response.data.title
        scenes.value.push(text)
      })
    })
    .catch((error) => {
      console.log(error)
    })
}


// --- ライフサイクルフック ---
onMounted(() => {
  loadNovelChapter()
});
</script>

<style scoped>
.novel-scene {
  white-space: pre-wrap;
  line-height: 1.8; /* 行間を調整すると読みやすくなります (任意) */
  margin-bottom: 1em; /* 段落ごとのマージン (任意) */
}
</style>
