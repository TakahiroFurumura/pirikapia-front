<template>
  <div class="row bg-grey-2 q-pa-md" >
    <div class="col-12 mx-auto">
      <div v-if="showOwnerMenu" class="q-mb-sm">
        <span @click="changeTitleCoverDialog" style="cursor: pointer; width: auto;">
          <q-icon name="image_search" size="medium"/><span class="q-ml-xs">change cover image</span>
        </span>
      </div>
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

  <q-dialog v-model="imageSelectDialog" maximized>
    <q-card style="width: 700px; max-width: 80vw; max-height: 80vw;">
      <q-card-section>
        <div class="text-h6">Select new cover image</div>
      </q-card-section>
      <q-card-actions align="left" class="text-primary">
        <q-btn flat label="Set image" v-close-popup @click="updateCoverImage"></q-btn>
        <q-btn flat label="cancel" v-close-popup></q-btn>
      </q-card-actions>

      <q-card-section class="q-pt-none">
        <ImageSelector
          :owner-id="props.ownerId"
          @imageSelected="handleImageSelected"
        />
      </q-card-section>

    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useUiConfigStore } from "stores/uiconfig";
const uiConfigStore = useUiConfigStore()
const debug = uiConfigStore.isDebugMode
if (debug) { console.debug('NovelCover loaded') }


import type { ThumbnailProps } from 'components/ImageThumbnail.vue';
import ImageBox from '../components/ImageBox.vue'
import NovelCoverChapter from "components/NovelCoverChapter.vue";
import type { NovelCoverChapterProps } from "components/NovelCoverChapter.vue";
import ImageSelector from "components/ImageSelector.vue";

import { ref, computed } from "vue";
import { onMounted } from 'vue';

import { api } from 'boot/axios';
const imageSelectDialog = ref(false)
const selectedImageId = ref('')

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
  thumbnail?: boolean,
  showOwnerMenu?: boolean
}

const props = withDefaults(defineProps<NovelCoverProps>(), {
  novelTitle: '',
  coverImage: '',
  description: '',
  novelId: 0,
  imageLinksToImageDetail: false,
  thumbnail: false,
  showOwnerMenu: false
});

const emit = defineEmits<{
  (e: 'imageUpdated'): void
}>();

function linkToChapter(chapterStrId: string) {
  return `/novel-chapter/${props.novelId}/${chapterStrId}/${uiConfigStore.language}`;
}

function changeTitleCoverDialog() {
  if (debug) console.debug("changeTitleCoverDialog triggered");
  imageSelectDialog.value = true
}

function handleImageSelected(selectedImages: ThumbnailProps[]) {
  if (debug) console.debug(`handleImageSelected`);
  if (selectedImages[0] !== undefined) {
    if (debug) console.debug(selectedImages[0].image_id)
    selectedImageId.value = selectedImages[0].image_id
  }
}

function updateCoverImage() {
  if (debug) console.debug(`updateCoverImage: ${selectedImageId.value}`);
  api.post(`/novels/set-cover/title/${props.novelId}/${selectedImageId.value}/`)
    .then(response => {
      if (debug) console.debug(`${response.status} Cover image updated`);
      // 成功した場合の通知
      imageSelectDialog.value = false
      emit('imageUpdated')
    })
    .catch(error => {
      // 失敗した場合の通知
      console.error('API Error:', error);
      imageSelectDialog.value = false
    })
}

onMounted(() => {
  if (debug) console.debug(props)
})


</script>
<style scoped>

</style>
