<template>
  <q-page class="q-pa-md">
    <div v-if="loading" class="text-center">
      <q-spinner-gears size="50px" color="primary" />
      <p>Loading...</p>
    </div>

    <div v-if="error" class="text-negative text-center">
      <p>データの読み込みに失敗しました: {{ error.message }}</p>
      <q-btn label="再試行" color="primary" @click="fetchThumbnails" />
    </div>

    <div v-if="!loading && !error && imageItems.length === 0" class="text-center">
      <p>表示するアイテムがありません。</p>
    </div>

    <div
      v-if="!loading && !error && imageItems.length > 0"
      class="row q-col-gutter-md justify-center"
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
import { ref, onMounted } from 'vue';
import { api } from 'boot/axios.js'
import ImageThumbnail from 'components/ImageThumbnail.vue'; // 子コンポーネントのパスを正しく指定してください
import type { ThumbnailProps } from 'components/ImageThumbnail.vue';
import type { APIResponseImage } from "app/interfaces";

const imageItems = ref<ThumbnailProps[]>([]);
const loading = ref<boolean>(true);
const error = ref<Error | null>(null);


// APIからデータを取得する想定の関数
const fetchThumbnails = async () => {
  loading.value = true;
  error.value = null;
  try {
    // --- 実際のAPI呼び出しの例
    await api.get("https://api.pirikapia.com/images/random-thumbnails/20/")
      .then(response => {
        const rawItems = response.data as APIResponseImage[];
        imageItems.value = rawItems.map((rawItem: APIResponseImage): ThumbnailProps => {
          return {
            filename: rawItem.filename,
            image_id: rawItem.image_id,
            signed_url: rawItem.signed_url,
            owner_username: rawItem.owner_username,
            title: '',
            favorite_count: 0,
            comment_count: 0,
            requires_login: rawItem.requires_login,
          }
        })
      })
    await new Promise(resolve => setTimeout(resolve, 1000)); // ネットワーク遅延のシミュレーション

    // ダミーデータ (APIのレスポンスを想定)
    /**
    const mockApiResponse: ThumbnailProps[] = [
      {
        filename: 'photo_mountain_view.jpg',
        signed_url: 'https://cdn.quasar.dev/img/mountains.jpg',
        owner_username: 'photographer123',
        title: '雄大な山々の風景',
        favorite_count: 120,
        comment_count: 15,
      },
      {
        filename: 'city_night_lights.png',
        signed_url: 'https://cdn.quasar.dev/img/parallax1.jpg', // ダミーURL
        owner_username: 'urbanexplorer',
        title: '煌めく都市の夜景',
        favorite_count: 250,
        comment_count: 30,
      },
      {
        filename: 'forest_stream.jpeg',
        signed_url: 'https://cdn.quasar.dev/img/parallax2.jpg', // ダミーURL
        owner_username: 'naturelover',
        title: '静寂の森と小川',
        favorite_count: 180,
        comment_count: 22,
      },
      {
        filename: 'quasar_logo_art.svg',
        signed_url: 'https://cdn.quasar.dev/img/quasar.jpg', // ダミーURL
        owner_username: 'quasarfan',
        title: 'Quasar アートワーク',
        favorite_count: 90,
        comment_count: 5,
      },
    ];
    imageItems.value = mockApiResponse;
    // --- ここまでダミーデータ ---
     **/

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
