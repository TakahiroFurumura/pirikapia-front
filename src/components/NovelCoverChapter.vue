

<template>
  <div class="row">
    <div :class="props.descriptionMaxLength > 0 ? 'col-12' : 'col-12'">
      <router-link :to="linkToChapter" style="text-decoration: none">
        <span class="text-h5 q-my-sm">{{props.chapterTitle}}</span>
      </router-link>
    </div>
    <div class="col-12">
      <div class="row">
          <div :class="props.descriptionMaxLength > 0 ? 'col-12 col-md-6 col-lg-6 col-xl-6' : 'col-12'">
            <ImageBox
              :imageId="props.coverImage"
              :enableLinkToImageDetailView="false"
              :showTags="false"
              :showPublishedDate="false"
              :showButtons="false"
              :link-to="linkToChapter"
              :height-percent="props.descriptionMaxLength > 0 ? 100 : null"
              :crop-aspect-ratio="props.descriptionMaxLength > 0 ? null : 1.0"
            />
          </div>
          <div v-if="props.descriptionMaxLength > 0" class="col-12 col-md-6 col-lg-6 col-xl-6">
            <router-link :to="linkToChapter" style="text-decoration: none">
              <div class=" q-mx-md">
                {{descriptionLenghtAdjusted}}...
              </div>
            </router-link>
          </div>
      </div>
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

export interface NovelCoverChapterProps {
  novelId: number;
  chapterStrId: string;
  chapterTitle: string,
  coverImage: string,
  description: string,
  descriptionMaxLength?: number,
}

const props = withDefaults(defineProps<NovelCoverChapterProps>(), {
  chapterTitle: '',
  coverImage: '',
  description: '',
  descriptionMaxLength: 250,
});

const linkToChapter = computed(() => {
  return `/novel-chapter/${props.novelId}/${props.chapterStrId}/${uiConfigStore.language}`;
})

onMounted(() => {
  if (debug) console.debug('props', props)
})


</script>
<style scoped>

</style>
