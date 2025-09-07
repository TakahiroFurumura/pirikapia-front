

<template>
  <div class="row">
    <div class="col-12 col-lg-6 mx-auto">
      <div class="text-h4">{{props.novelTitle}}</div>
        <ImageBox
          :imageId="props.coverImage"
          :showTags="false"
        />
      <div>{{props.novelTitle}}</div>
      <div>{{props.description}}</div>
      <div
        v-for="chapter in props.novelChapters"
        :key="chapter.chapterTitle"
      >
        <div>{{chapter.chapterTitle}}</div>
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

import { onMounted } from 'vue';
import type { NovelChapterProps } from "components/NovelChapter.vue";

export interface NovelThumbnailProps {
  novelTitle: string,
  coverImage: string,
  novelChapters: NovelChapterProps[],
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
