<template>
  <q-input dense v-model="searchKeywordInput" autofocus @keyup.enter="addSearchKeyword" label="search keyword"></q-input>
  <div class="q-my-md">
    <q-chip
      v-for="(keyword, index) in searchKeywords"
      :key="index"
      removable
      bold
      @remove="removeSearchKeyword(index)"
    >
      {{ keyword }}
    </q-chip>
  </div>
  <!-- Thumbnails -->
  <div class="q-pa-md flex flex-center">
    <q-pagination
      v-model="currentPage"
      :max="maxPages"
      input
    ></q-pagination>
  </div>
  <div class="">
    <div v-if="loading" class="q-my-lg text-center">
      <q-spinner-gears size="50px" color="primary" />
      <p>Loading...</p>
    </div>
    <div class="row">
      <div
        v-for="(item,) in imageItems"
        :key="item.filename"
        class="col-xs-12 col-sm-6 col-md-4 col-lg-3"
        @click="selectImage(item)"
      >
        <div :class="`${'q-pa-sm'} ${selectedImage.includes(item) ? 'bg-light-blue-3' : 'bg-grey-2'}`">
          <ImageThumbnail
            :filename="item.filename"
            :image_id="item.image_id"
            :signed_url="item.signed_url"
            :owner_username="item.owner_username"
            :title="item.title"
            :comment_count="item.comment_count"
            :requires_login="item.requires_login"
            :bookmark="item.bookmark"
            :bookmark_count="item.bookmark_count"
            :show_buttons="false"
            :disable_link="true"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const uiConfigStore = useUiConfigStore()
const debug = uiConfigStore.isDebugMode
if (debug) { console.debug('NovelCover loaded') }


import { useUiConfigStore } from "stores/uiconfig";
import ImageThumbnail from "components/ImageThumbnail.vue";
import {api} from "boot/axios";
import type {APIResponseImage} from "app/interfaces";
import {ref, computed, onMounted, watch} from "vue";

export interface ImageSelectorProps {
  ownerId: number,
  multiSelection?: boolean,
}

const props = withDefaults(defineProps<ImageSelectorProps>(), {
  multiSelection: false
});

const emit = defineEmits<{
  (e: 'imageSelected', payload: ThumbnailProps[]): void
}>();
const selectedImage = ref<ThumbnailProps[]>([]);

import type { ThumbnailProps } from 'components/ImageThumbnail.vue';
import { apiResponseToThumbnailProps } from "app/interfaces";
// import { useRoute } from "vue-router";
// const route = useRoute();
const loading = ref<boolean>(true);
const error = ref<Error | null>(null);

const imageItems = ref<ThumbnailProps[]>([]);
const imageItemsPerPage = ref<number>(12);
const currentPage = ref<number>(1);
const totalItemCount = ref<number>(0);
const maxPages = computed<number>(() => Math.ceil(totalItemCount.value / imageItemsPerPage.value))

watch(currentPage, () => {
  fetchThumbnails()
    .catch(err => console.error(err))
})


const searchKeywordInput = ref<string>("");
const searchKeywords = ref<string[]>([]);
const searchQuery = computed<string>(() => {
  const queryParts: string[] = [
    `owner=${props.ownerId}`,
    'orderby=-created_on',
    `n=${imageItemsPerPage.value}`,
    `offset=${((currentPage.value-1)*imageItemsPerPage.value).toString()}`
  ];
  // 2. キーワード配列を 'key=value' の形式に変換し、エンコードする
  const keywordParts = searchKeywords.value.map(keyword =>
    `keyword=${encodeURIComponent(keyword)}`
  );
  return queryParts.concat(keywordParts).join('&');
})

const fetchThumbnails = async () => {
  imageItems.value = [];
  loading.value = true;
  error.value = null;
  try {
    const url = `/images/search/?${searchQuery.value}`
    await api.get(url)
      .then(response => {
        const rawItems = response.data as APIResponseImage[];
        imageItems.value = rawItems.map((rawItem: APIResponseImage): ThumbnailProps => {
          return apiResponseToThumbnailProps(rawItem)
        })
        void api.get(url.replace('search/', 'search/count/'))
          .then(response => {
            totalItemCount.value = response.data.count as number
          })
      })
      .catch(error => {
        console.log(error);
      })

  } catch (e) {
    console.error('Failed to fetch image data:', e);
    if (e instanceof Error) {
      error.value = e;
    } else {
      error.value = new Error('An unknown error occurred');
    }
  } finally {
    loading.value = false;
  }
};

function addSearchKeyword() {
  if (searchKeywordInput.value) {
    searchKeywords.value.push(searchKeywordInput.value)
    searchKeywordInput.value = ""
    fetchThumbnails()
      .catch(err => console.error(err))
  }
}

function removeSearchKeyword(index: number) {
  searchKeywords.value.splice(index, 1)
  fetchThumbnails()
    .catch(err => console.error(err))
}

function selectImage(item: ThumbnailProps) {
  if (props.multiSelection) {
  } else {
    selectedImage.value = [item]
    emit('imageSelected', selectedImage.value)
  }
}

onMounted(() => {
  fetchThumbnails()
    .catch(err => console.error(err))
});

</script>

<style scoped>

</style>
