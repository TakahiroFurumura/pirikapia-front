<template>
  <div class="row bg-grey-2 q-pa-md" >
    <div class="col-12 mx-auto">
      <router-link :to="`/novel-title/${props.novelId}`" style="text-decoration: none;">
        <div class="text-body2">{{props.novelTitle}}</div>
        <ImageBox
            :imageId="props.coverImage"
            :showTags="false"
            :crop-aspect-ratio="1.0"
            :link-to="imageLinkTo"
          />
        <div class="text-h5 q-my-sm">{{props.novelTitle}}</div>
        <div>{{props.description}}</div>
      </router-link>
        <div
        v-for="chapter in props.novelChapters"
        :key="chapter.chapterTitle"
        class="q-my-sm"
      >
        <q-separator class="q-my-md" />
        <NovelThumbnailChapter
          :novel-id="novelId"
          :coverImage="(chapter.coverImage !== undefined && chapter.coverImage !== null && chapter.coverImage.length > 0) ? chapter.coverImage : props.coverImage"
          :description="chapter.description"
          :chapterTitle="chapter.chapterTitle"
          :chapter-str-id="chapter.chapterStrId"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUiConfigStore } from "stores/uiconfig";
const uiConfigStore = useUiConfigStore()
const debug = uiConfigStore.isDebugMode
if (debug) { console.debug('NovelThumbnail loaded') }

import ImageBox from '../components/ImageBox.vue'
import NovelThumbnailChapter from "components/NovelThumbnailChapter.vue";
import type { NovelThumbnailChapterProps } from "components/NovelThumbnailChapter.vue";

import { computed } from "vue";
import { onMounted } from 'vue';

const imageLinkTo = computed(() => {
  if (props.imageLinksToImageDetail) {
    return ""
  } else {
    return `/novel-title/${props.novelId}`
  }
});

export interface NovelThumbnailProps {
  novelTitle: string,
  coverImage: string,
  novelChapters: NovelThumbnailChapterProps[],
  description: string,
  novelId: number,
  imageLinksToImageDetail?: boolean,
  ownerId: number,
}

const props = withDefaults(defineProps<NovelThumbnailProps>(), {
  novelTitle: '',
  coverImage: '',
  description: '',
  novelId: 0,
  imageLinksToImageDetail: false
});

onMounted(() => {
  if (debug) console.debug(props)
})


</script>
<style scoped>

</style>
