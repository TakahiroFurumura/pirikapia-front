

<template>
  <div class="row">
    <div class="col-12 col-lg-6 mx-auto">
      <div class="text-h4">{{props.novelTitle}}</div>
        <ImageBox
          :imageId="props.coverImage"
          :showTags="false"
          :crop-aspect-ratio="1.0"
        />
      <div class="text-h5 q-my-sm">{{props.novelTitle}}</div>
      <div>{{props.description}}</div>
      <div
        v-for="chapter in props.novelChapters"
        :key="chapter.chapterTitle"
        class="q-my-sm"
      >
        <q-separator class="q-my-md" />
        <NovelThumbnailChapter
          :coverImage="(chapter.coverImage !== undefined && chapter.coverImage.length > 0) ? chapter.coverImage : props.coverImage"
          :description="chapter.description"
          :chapterTitle="chapter.chapterTitle"
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

import { onMounted } from 'vue';


export interface NovelThumbnailProps {
  novelTitle: string,
  coverImage: string,
  novelChapters: NovelThumbnailChapterProps[],
  description: string,
  novelId: number,
}

const props = withDefaults(defineProps<NovelThumbnailProps>(), {
  novelTitle: '',
  coverImage: '',
  description: '',
  novelId: 0,
});

onMounted(() => {
  if (debug) console.debug(props)
})


</script>
<style scoped>

</style>
