

<template>
  <router-link :to="linkToChapter" style="text-decoration: none">
    <div class="text-h5 q-my-sm">{{props.chapterTitle}}</div>
  </router-link>
  <div class="row">
      <div class="col-lg-2 col-md-3 col-sm-6">
        <ImageBox
          :imageId="props.coverImage"
          :enableLinkToImageDetailView="false"
          :showTags="false"
          :showPublishedDate="false"
          :showButtons="false"
          :cropAspectRatio="1.0"
          :link-to="linkToChapter"
        />
      </div>
      <div class="col-lg-10 col-md-9 col-sm-6">
        <router-link :to="linkToChapter" style="text-decoration: none">
          <div class=" q-mx-md">
            {{descriptionLenghtAdjusted}}...
          </div>
        </router-link>
      </div>
  </div>
</template>

<script setup lang="ts">
// config
import { useUiConfigStore } from "stores/uiconfig";
const uiConfigStore = useUiConfigStore()
const debug = uiConfigStore.isDebugMode
// vue
import { computed } from "vue";
import { onMounted } from 'vue';
// components
import ImageBox from '../components/ImageBox.vue'

const descriptionLenghtAdjusted = computed(() => {
  return props.description.substring(0, props.descriptionMaxLength - 1);
})

export interface NovelThumbnailChapterProps {
  novelId: number;
  chapterStrId: string;
  chapterTitle: string,
  coverImage: string,
  description: string,
  descriptionMaxLength?: number,
}

const props = withDefaults(defineProps<NovelThumbnailChapterProps>(), {
  chapterTitle: '',
  coverImage: '',
  description: '',
  descriptionMaxLength: 250,
});

const linkToChapter = computed(() => {
  return `/novel-chapter/${props.novelId}/${props.chapterStrId}`;
})

onMounted(() => {
  if (debug) console.debug('props', props)
})


</script>
<style scoped>

</style>
