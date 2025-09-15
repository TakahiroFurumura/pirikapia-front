<template>
  <q-page class="">
    <div class="col-12 q-ma-md bg-grey-2">
      <NovelThumbnail
        :novelTitle="novel.novelTitle"
        :coverImage="novel.coverImage"
        :novelChapters="novel.novelChapters"
        :description="novel.description"
        :novelId="novel.novelId"
        :owner-id="novel.ownerId"
        :imageLinksToImageDetail="true"
      ></NovelThumbnail>
    </div>
  </q-page>
</template>

<script setup lang="ts">
// config
import { useUiConfigStore } from "stores/uiconfig";
const uiConfigStore = useUiConfigStore()
const debug = uiConfigStore.isDebugMode
// vue
import { ref, onMounted } from 'vue';
import { useRoute } from "vue-router";
const route = useRoute();
// import type { APIResponseImage } from "app/interfaces";
// import {apiResponseToThumbnailProps} from "app/interfaces";
// import { useAuthStore } from 'stores/auth'
// const authStore = useAuthStore()
import { api } from 'boot/axios.js'
// import NovelThumbnailChapter from "components/NovelThumbnailChapter.vue";
// import ImageBox from "components/ImageBox.vue";
// import ImageThumbnail from "components/ImageThumbnail.vue";
// import { useRouter } from 'vue-router'
// import ImageThumbnail from "components/ImageThumbnail.vue";
// import type { ThumbnailProps } from 'components/ImageThumbnail.vue';
// const router = useRouter();
import NovelThumbnail from "components/NovelThumbnail.vue";
import type { NovelThumbnailProps } from "components/NovelThumbnail.vue";
import type { APIResponseNovel } from "app/interfaces";
import { apiResponseToNovelThumbnailProps } from "app/interfaces";

const novel = ref<NovelThumbnailProps>(
  {
      novelTitle: "",
      coverImage: "",
      novelChapters: [],
      description: "",
      novelId: 0,
    ownerId: 0
  }
);

const loading = ref<boolean>(true);

function loadNovels() {

  if (typeof route.params.novelId == "string") {
    const url = `/novels/${route.params.novelId}/${uiConfigStore.language}/`
    loading.value = true
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
        loading.value = false
      })
  } else {
    return
  }
}

// --- ライフサイクルフック ---
onMounted(() => {
  if (debug) console.debug(route.params.novelId)
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
