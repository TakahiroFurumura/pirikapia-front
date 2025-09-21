<template>
  <div class="row bg-grey-2 q-pa-md" >
    <div class="col-12 mx-auto">
      <router-link :to="`/novel-title/${props.novelId}/${uiConfigStore.language}`" style="text-decoration: none;">
        <ImageBox
            :imageId="props.coverImage"
            :showTags="false"
            :crop-aspect-ratio="1.0"
            :link-to="imageLinkTo"
          />
        <div class="q-my-md"><span class="text-h5">{{props.novelTitle}}</span> <span class="q-ml-md">by {{props.ownerUsername}}</span></div>
        <div>{{props.description}}</div>
      </router-link>

      <q-separator class="q-my-md" />

      <div
        v-for="chapter in props.novelChapters"
        :key="chapter.chapterTitle"
        class="q-my-sm"
      >
        <div v-if="!props.thumbnail">
          <NovelCoverChapter
            :novel-id="novelId"
            :coverImage="(chapter.coverImage !== undefined && chapter.coverImage !== null && chapter.coverImage.length > 0) ? chapter.coverImage : props.coverImage"
            :description="chapter.description"
            :chapterTitle="chapter.chapterTitle"
            :chapter-str-id="chapter.chapterStrId"
          />
          <q-separator class="q-my-md" />
        </div>

        <div v-if="props.thumbnail">
          <div class="row">
            <router-link :to="linkToChapter(chapter.chapterStrId)" style="text-decoration: none;">
              <div class="col-12">
                  <div class="text-body1" style="text-decoration: underline">{{chapter.chapterTitle}}: </div>
                  <div style="text-decoration: none;">{{chapter.description.substring(0, 100)}}...</div>
              </div>
            </router-link>
          </div>
          <q-separator class="q-my-md" />

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUiConfigStore } from "stores/uiconfig";
const uiConfigStore = useUiConfigStore()
const debug = uiConfigStore.isDebugMode
if (debug) { console.debug('NovelCover loaded') }


import ImageBox from '../components/ImageBox.vue'
import NovelCoverChapter from "components/NovelCoverChapter.vue";
import type { NovelCoverChapterProps } from "components/NovelCoverChapter.vue";

import { computed } from "vue";
import { onMounted } from 'vue';

const imageLinkTo = computed(() => {
  if (props.imageLinksToImageDetail) {
    return ""
  } else {
    return `/novel-title/${props.novelId}/${uiConfigStore.language}`
  }
});

export interface NovelCoverProps {
  novelTitle: string,
  coverImage: string,
  novelChapters: NovelCoverChapterProps[],
  description: string,
  novelId: number,
  imageLinksToImageDetail?: boolean,
  ownerId: number,
  ownerUsername: string,
  thumbnail?: boolean
}

const props = withDefaults(defineProps<NovelCoverProps>(), {
  novelTitle: '',
  coverImage: '',
  description: '',
  novelId: 0,
  imageLinksToImageDetail: false,
  thumbnail: false
});

function linkToChapter(chapterStrId: string) {
  return `/novel-chapter/${props.novelId}/${chapterStrId}/${uiConfigStore.language}`;
}

onMounted(() => {
  if (debug) console.debug(props)
})


</script>
<style scoped>

</style>
