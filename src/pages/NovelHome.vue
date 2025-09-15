<template>
  <q-page>
    <div class="row">
      <div
          v-for="(novel,) in novels"
          :key="novel.novelId"
          class="col-12 col-sm-12 col-md-6 col-lg-4 col-xl-3 q-px-md q-py-sm"
        >
          <NovelThumbnail
            :novelTitle="novel.novelTitle"
            :coverImage="novel.coverImage"
            :novelChapters="novel.novelChapters"
            :description="novel.description"
            :novelId="novel.novelId"
            :owner-id="novel.ownerId"
          >
          </NovelThumbnail>
        </div>
      </div>
  </q-page>
</template>

<script setup lang="ts">
import { useUiConfigStore } from "stores/uiconfig";
const uiConfigStore = useUiConfigStore()
const debug = uiConfigStore.isDebugMode
if (debug) console.debug("uiConfigStore", `debug mode: ${uiConfigStore.isDebugMode}, `, `language: ${uiConfigStore.language}`)

import { ref, onMounted } from 'vue';
// import type { APIResponseImage } from "app/interfaces";
// import {apiResponseToThumbnailProps} from "app/interfaces";
// import { useAuthStore } from 'stores/auth'
// const authStore = useAuthStore()
import { api } from 'boot/axios.js'
const loading = ref<boolean>(true);
// import ImageThumbnail from "components/ImageThumbnail.vue";
// import { useRouter } from 'vue-router'
// import ImageThumbnail from "components/ImageThumbnail.vue";
// import type { ThumbnailProps } from 'components/ImageThumbnail.vue';
// const router = useRouter();
import NovelThumbnail from "components/NovelThumbnail.vue";
import type { NovelThumbnailProps } from "components/NovelThumbnail.vue";
import type { APIResponseNovel } from "app/interfaces";
import { apiResponseToNovelThumbnailProps } from "app/interfaces";

const novels = ref<NovelThumbnailProps[]>([]);

function loadNovels() {

  loading.value = true
  api.get(`/novels/search/${uiConfigStore.language}/`)
    .then((response) => {
      const rawItems = response.data as APIResponseNovel[];
      console.debug(rawItems)
      novels.value = rawItems.map((rawItem: APIResponseNovel): NovelThumbnailProps => {
        return apiResponseToNovelThumbnailProps(rawItem)
      })
      loading.value = false
    })
    .catch((error) => {
      console.log(error)
    })
}


// --- ライフサイクルフック ---
onMounted(() => {
  loadNovels()
});
</script>

<style scoped>
.novel-scene {
  white-space: pre-wrap;
  line-height: 1.8; /* 行間を調整すると読みやすくなります (任意) */
  margin-bottom: 1em; /* 段落ごとのマージン (任意) */
}
</style>
