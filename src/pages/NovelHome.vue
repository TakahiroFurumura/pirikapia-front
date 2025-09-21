<template>
  <q-page>
    <div class="row">
      <div
          v-for="(novel,) in novels"
          :key="novel.novelId"
          class="col-12 col-sm-12 col-md-6 col-lg-4 col-xl-3 q-px-md q-py-sm"
        >
          <NovelCover
            :novelTitle="novel.novelTitle"
            :coverImage="novel.coverImage"
            :novelChapters="novel.novelChapters"
            :description="novel.description"
            :novelId="novel.novelId"
            :owner-id="novel.ownerId"
            :owner-username="novel.ownerUsername"
            :thumbnail="true"
          >
          </NovelCover>
        </div>
      </div>
    <div class="q-ma-md">
      <div v-if="uiConfigStore.language=='ja'"><router-link to="/novel-home/en/">EN</router-link></div>
      <div v-if="uiConfigStore.language=='en'"><router-link to="/novel-home/ja/">日本語</router-link></div>
    </div>

  </q-page>
</template>

<script setup lang="ts">
import { useUiConfigStore } from "stores/uiconfig";
const uiConfigStore = useUiConfigStore()
const debug = uiConfigStore.isDebugMode
if (debug) console.debug("uiConfigStore", `debug mode: ${uiConfigStore.isDebugMode}, `, `language: ${uiConfigStore.language}`)

import { ref, watch, onMounted } from 'vue';
// import type { APIResponseImage } from "app/interfaces";
// import {apiResponseToThumbnailProps} from "app/interfaces";
// import { useAuthStore } from 'stores/auth'
// const authStore = useAuthStore()
import { api } from 'boot/axios.js'
const loading = ref<boolean>(true);
// import ImageThumbnail from "components/ImageThumbnail.vue";
import { useRouter } from 'vue-router'
const router = useRouter()
// import ImageThumbnail from "components/ImageThumbnail.vue";
// import type { ThumbnailProps } from 'components/ImageThumbnail.vue';
// const router = useRouter();
import NovelCover from "components/NovelCover.vue";
import type { NovelCoverProps } from "components/NovelCover.vue";
import type { APIResponseNovel } from "app/interfaces";
import { apiResponseToNovelCoverProps } from "app/interfaces";

const novels = ref<NovelCoverProps[]>([]);

watch(() => uiConfigStore.language, (newLanguage) => {
  if (debug) console.debug(`language was changed to ${newLanguage}`)
  router.push({ path: `/novel-home/${uiConfigStore.language}` })
    .then(() =>{
      loadNovels()
    })
    .catch((error) => {
      console.error(error)
    })
});

watch(() => router.currentRoute.value.params.language, (newLanguage) => {
  if (newLanguage === undefined) return
  if (debug) console.debug(`language was changed to ${newLanguage.toString()}`)
  uiConfigStore.setLanguage(newLanguage as string)
});

function loadNovels() {

  loading.value = true
  api.get(`/novels/search/${uiConfigStore.language}/`)
    .then((response) => {
      const rawItems = response.data as APIResponseNovel[];
      console.debug(rawItems)
      novels.value = rawItems.map((rawItem: APIResponseNovel): NovelCoverProps => {
        return apiResponseToNovelCoverProps(rawItem)
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
