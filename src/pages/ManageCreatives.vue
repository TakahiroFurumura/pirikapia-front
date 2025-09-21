<template>
  <q-page class="q-pa-sm">

    <div class="q-pa-md flex flex-center">
      <q-pagination
        v-model="currentPage"
        :max="maxPages"
        input
      ></q-pagination>
    </div>

    <div v-if="showSearchCondition">
        <q-chip color="primary" text-color="white">
          {{route.query.tag}}
        </q-chip>
    </div>
    <div v-if="loading" class="text-center">
      <q-spinner-gears size="50px" color="primary" />
      <p>Loading...</p>
    </div>

    <div class="raw">
      <router-link to="/user-login">
        <div v-if="!authStore.isAuthenticated">
          Log in to view your bookmark
        </div>
      </router-link>
    </div>

    <div v-if="authStore.isAuthenticated">
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
            :comment_count="item.comment_count"
            :requires_login="item.requires_login"
            :bookmark="item.bookmark"
            :bookmark_count="item.bookmark_count"
          />
        </div>
      </div>
    </div>
    <div class="q-pa-md flex flex-center">
      <q-pagination
        v-model="currentPage"
        :max="maxPages"
      ></q-pagination>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed, } from 'vue';
import { api } from 'boot/axios.js'
import ImageThumbnail from 'components/ImageThumbnail.vue'; // 子コンポーネントのパスを正しく指定してください
import type { ThumbnailProps } from 'components/ImageThumbnail.vue';
import type { APIResponseImage, } from "app/interfaces";
import { apiResponseToThumbnailProps } from "app/interfaces";
const imageItems = ref<ThumbnailProps[]>([]);
const loading = ref<boolean>(true);
const error = ref<Error | null>(null);
import { useAuthStore } from "stores/auth";
const authStore = useAuthStore();
import { useRoute } from "vue-router";
const route = useRoute();

const searchUrl = ref('')

const showSearchCondition = computed(() => {
  return typeof route.query.tag == "string"
})

const maxPages = ref(1)
const maxItemsPerPage = ref(30)
const currentPage = ref(1)
watch(currentPage, () => {
  refreshItems()
})

const fetchThumbnails = async () => {
  console.debug("url query parameters", route.query);
  loading.value = true;
  error.value = null;
  searchUrl.value = `/images/search/?owner=${authStore.user.pk}&orderby=-created_on&n=${maxItemsPerPage.value}&offset=${((currentPage.value-1)*maxItemsPerPage.value).toString()}`
  try {
    await api.get(searchUrl.value, )
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

const fetchCount = async () => {
  try {
    await api.get(searchUrl.value.replace('search/', 'search/count/'), )
      .then(response => {
        const itemCount = response.data.count as number
        maxPages.value = Math.ceil(itemCount / maxItemsPerPage.value)
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

}

function refreshItems() {
  fetchThumbnails()
    .then(() => {
      void fetchCount()
    })
    .catch(err => console.error(err))
}


onMounted(() => {
  refreshItems()
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
