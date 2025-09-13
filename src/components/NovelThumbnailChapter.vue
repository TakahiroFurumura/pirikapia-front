

<template>
  <div class="text-h5">{{props.chapterTitle}}</div>
  <div class="row">
    <div class="col-lg-2 col-md-3 col-sm-6">
      <ImageBox
        :imageId="props.coverImage"
        :enableLinkToImageDetailView="false"
        :showTags="false"
        :showPublishedDate="false"
        :showButtons="false"
        :cropAspectRatio="1.0"

      />
    </div>
    <div class="col-lg-10 col-md-9 col-sm-6">
      <div class=" q-mx-md">
        {{props.description}}...
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

export interface NovelThumbnailChapterProps {
  chapterTitle: string,
  coverImage: string,
  description: string,
}

const props = withDefaults(defineProps<NovelThumbnailChapterProps>(), {
  chapterTitle: '',
  coverImage: '',
  description: '',
});

onMounted(() => {
  if (debug) console.debug('props', props)
})


</script>
<style scoped>

</style>
