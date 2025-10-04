<template>
  <q-page class="">
    <div v-if="isOwner" class="q-ma-md">
      <q-toggle
        v-model="showOwnerMenu"
        label="owner view"
      ></q-toggle>
      </div>
    <div class="col-12 q-ma-md">
      <NovelCover
        :novelTitle="novel.novelTitle"
        :coverImage="novel.coverImage"
        :novelChapters="novel.novelChapters"
        :description="novel.description"
        :novelId="novel.novelId"
        :owner-id="novel.ownerId"
        :owner-username="novel.ownerUsername"
        :imageLinksToImageDetail="false"
        :show-owner-menu="showOwnerMenu"
        @imageUpdated="loadNovel"
      ></NovelCover>
    </div>
  </q-page>
</template>

<script setup lang="ts">
// config
import { useAuthStore } from "stores/auth";
const authStore = useAuthStore();
import { useUiConfigStore } from "stores/uiconfig";
const uiConfigStore = useUiConfigStore()
const debug = uiConfigStore.isDebugMode
import { useMeta } from 'quasar';
// vue
import {ref, onMounted, computed, watch} from 'vue';
import { useRoute } from "vue-router";
const route = useRoute();
// import type { APIResponseImage } from "app/interfaces";
// import {apiResponseToThumbnailProps} from "app/interfaces";
// import { useAuthStore } from 'stores/auth'
// const authStore = useAuthStore()
import { api } from 'boot/axios.js'
// import NovelCoverChapter from "components/NovelCoverChapter.vue";
// import ImageBox from "components/ImageBox.vue";
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


const novel = ref<NovelCoverProps>(
  {
    novelTitle: "",
    coverImage: "",
    novelChapters: [],
    description: "",
    novelId: 0,
    ownerId: 0,
    ownerUsername: ""
  }
);

const loading = ref<boolean>(true);

const isOwner = computed(() => {
  if (authStore.isAuthenticated) {
    return authStore.user.username === novel.value.ownerUsername
  } else {
    return false
  }
})

watch(() => uiConfigStore.language, (newLanguage) => {
  if (debug) console.debug(`language was changed to ${newLanguage}`)
  if (typeof route.params.novelId == "string") {
    router.push({path: `/novel-title/${route.params.novelId}/${uiConfigStore.language}`})
      .then(() => {
        loadNovel()
      })
      .catch((error) => {
        console.error(error)
      })
  }
})

const showOwnerMenu = ref<boolean>(false)

function loadNovel() {

  if (typeof route.params.novelId == "string") {
    const url = `/novels/${route.params.novelId}/${uiConfigStore.language}/`
    loading.value = true
    api.get(url)
      .then((response) => {
        const rawItem = response.data as APIResponseNovel;
          console.debug(rawItem)
          novel.value = apiResponseToNovelCoverProps(rawItem)
          // check if viewer is owner
          if (debug) console.debug(authStore.user.pk)
          if (novel.value.ownerId == authStore.user.pk) {
            showOwnerMenu.value = true
            if (debug) console.debug("owner view")
          }
        })
      .catch((error) => {
        console.log(error)
      })
      .finally(() => {
        loading.value = false
        useMeta({
        title: novel.value.novelTitle
  })
      })
  } else {
    return
  }
}

// --- ライフサイクルフック ---
onMounted(() => {
  if (debug) console.debug(route.params.novelId)

  if (route.params.language !== undefined) {
    uiConfigStore.language = route.params.language.toString()
  }
  loadNovel()
});
</script>

<style scoped>
.novel-scene {
  white-space: pre-wrap;
  line-height: 1.8; /* 行間を調整すると読みやすくなります (任意) */
  margin-bottom: 1em; /* 段落ごとのマージン (任意) */
}
</style>
