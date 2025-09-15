<template>
  <q-page>
    <div class="q-ma-md q-pa-md">
      back to index
      <div class="text-body2">{{title}}</div>
    </div>

    <div class="col-12 col-xl-8 q-ma-md q-pa-md bg-grey-2">
      <div class="col-lg-2 col-md-3 col-sm-6">
          <ImageBox
            :imageId="coverImage"
            :enableLinkToImageDetailView="false"
            :showTags="false"
            :showPublishedDate="false"
            :showButtons="false"
            :cropAspectRatio="1.0"
          />
      </div>

    <div
        v-for="(scene,) in scenes"
        :key="scene"
        class="col-12 q-px-md q-py-sm novel-scene"
      >
      {{scene}}
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
// config
import { useUiConfigStore } from "stores/uiconfig";
const uiConfigStore = useUiConfigStore()
// const debug = uiConfigStore.isDebugMode

import { ref, onMounted } from 'vue';
// import type { APIResponseImage } from "app/interfaces";
// import {apiResponseToThumbnailProps} from "app/interfaces";
// import { useAuthStore } from 'stores/auth'
// const authStore = useAuthStore()
import { api } from 'boot/axios.js'
// import ImageThumbnail from "components/ImageThumbnail.vue";
// import { useRouter } from 'vue-router'
import { useRoute } from 'vue-router'
import { apiResponseToNovelThumbnailProps } from "app/interfaces";
import type { APIResponseNovel } from "app/interfaces";
const route = useRoute()
// import ImageThumbnail from "components/ImageThumbnail.vue";
// import type { ThumbnailProps } from 'components/ImageThumbnail.vue';
// const router = useRouter();

const novelId = ref(route.params.novelId !== undefined ? route.params.novelId.toString() : '')
const chapterStrId = ref(route.params.chapterStrId !== undefined ? route.params.chapterStrId.toString() : '')
const title = ref("")
const coverImage = ref("")
const scenes = ref<string[]>([]);

import type { NovelThumbnailProps } from "components/NovelThumbnail.vue";
import ImageBox from "components/ImageBox.vue";
const novel = ref<NovelThumbnailProps>(
  {
      novelTitle: "",
      coverImage: "",
      novelChapters: [],
      description: "",
      novelId: 0,
  }
);


async function loadNovelChapter() {
  await api.get(`/novels/${novelId.value}/${chapterStrId.value}/${uiConfigStore.language}/`)
    .then((response) => {
      coverImage.value = response.data.cover_image
      response.data.text.forEach((text: string) => {
        console.log(text)
        title.value = response.data.title
        scenes.value.push(text)
      })
      return Promise.resolve()
    })
    .catch((error) => {
      console.log(error)
      return Promise.reject(new Error(error.message))
    })
  return Promise.resolve()
}

function loadNovel() {

  if (typeof route.params.novelId == "string") {
    const url = `/novels/${route.params.novelId}/${uiConfigStore.language}/`
    api.get(url)
      .then((response) => {
        const rawItem = response.data as APIResponseNovel;
          console.debug(rawItem)
          novel.value = apiResponseToNovelThumbnailProps(rawItem)
        })
      .catch((error) => {
        console.log(error)
      })
      .finally(() => {
      })
  } else {
    return
  }
}

// --- ライフサイクルフック ---
onMounted(() => {
  loadNovelChapter()
    .then(() => {
      loadNovel()
    })
    .catch((error) => {
      console.log(error)
    })
});
</script>

<style scoped>
.novel-scene {
  white-space: pre-wrap;
  line-height: 1.8; /* 行間を調整すると読みやすくなります (任意) */
  margin-bottom: 1em; /* 段落ごとのマージン (任意) */
}
</style>
