<template>
  <q-page class="q-pa-sm">
    <div v-if="showSearchCondition">
        <q-chip color="primary" text-color="white">
          {{route.query.tag}}
        </q-chip>
    </div>
    <div v-if="loading" class="text-center">
      <q-spinner-gears size="50px" color="primary" />
      <p>Loading...</p>
    </div>

    <div v-if="error" class="text-negative text-center">
      <p>failed to load images {{ error.message }}</p>
      <q-btn label="reload" color="primary" @click="fetchThumbnails" />
    </div>

    <div v-if="!loading && !error && imageItems.length === 0" class="text-center">
      <p>No images found</p>
    </div>

    <div
      v-if="!loading && !error && imageItems.length > 0"
      class="row q-col-gutter-xs"
    >
      <div
        v-for="(item,) in imageItems"
        :key="item.filename"
        class="col-xs-12 col-sm-6 col-md-4 col-lg-3"
      >
        <ImageThumbnail
          :filename="item.filename"
          :image_id="item.image_id"
          :signed_url="item.signed_url"
          :owner_username="item.owner_username"
          :title="item.title"
          :favorite_count="item.favorite_count"
          :comment_count="item.comment_count"
          :requires_login="item.requires_login"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, } from 'vue';
import { api } from 'boot/axios.js'
import ImageThumbnail from 'components/ImageThumbnail.vue'; // 子コンポーネントのパスを正しく指定してください
import type { ThumbnailProps } from 'components/ImageThumbnail.vue';
import type { APIResponseImage, } from "app/interfaces";
import { apiResponseToThumbnailProps } from "app/interfaces";
import { useRoute } from "vue-router";
const route = useRoute();
const imageItems = ref<ThumbnailProps[]>([]);
const loading = ref<boolean>(true);
const error = ref<Error | null>(null);

const showSearchCondition = computed(() => {
  return typeof route.query.tag == "string"
})

const fetchThumbnails = async () => {
  console.debug("url query parameters", route.query);
  loading.value = true;
  error.value = null;
  try {
    let url = ""
    if (route.query.tag) {
      const tag = typeof route.query.tag == "string" ? route.query.tag  : route.query.tag[0]
      url = `https://api.pirikapia.com/images/search/?tag=${tag}`
    } else {
      url = "https://api.pirikapia.com/images/random-thumbnails/24/"
    }
    await api.get(url)
      .then(response => {
        const rawItems = response.data as APIResponseImage[];
        imageItems.value = rawItems.map((rawItem: APIResponseImage): ThumbnailProps => {
          return apiResponseToThumbnailProps(rawItem)
        })
      })
    // await new Promise(resolve => setTimeout(resolve, 1000)); // ネットワーク遅延のシミュレーション
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

// コンポーネントがマウントされたら画像URLを取得
onMounted(() => {
  fetchThumbnails()
    .catch(err => console.error(err))
});

// ImageThumbnailコンポーネントがimageUrlプロパティを受け取ることを想定しています。
// ImageThumbnail.vue の <script setup> 内で以下のようにプロパティを定義してください。
/*
  interface Props {
    imageUrl: string;
  }
  const props = defineProps<Props>();
*/
</script>

<style scoped>
/* 必要に応じてスタイルを追加 */
.text-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px; /* コンテンツが少ない場合でも中央に表示されるように */
}
</style>
