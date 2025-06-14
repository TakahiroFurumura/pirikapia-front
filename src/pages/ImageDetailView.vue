<template>
  <div class="q-pa-md q-gutter-sm">
    <q-card flat>
      <q-img
        :src="imageData?.signed_url"
        spinner-color="grey"
        :ratio="aspectRatio"
        spinner-size="82px"
        style="position: relative;"
      >
        <template v-slot:error>
          <div class="absolute-full flex flex-center bg-negative text-white">
            Failed to load...
          </div>
        </template>

        <div
          v-if="imageData?.requires_login"
          class="absolute-full text-subtitle1  flex flex-center"
          style="cursor: pointer; background-color: rgba(0, 0, 0, 0.3); color: white; padding: 2px;"
          @click="router.push('/user-login')"
        >
          <span class="">Login to unlock</span>
        </div>
      </q-img>

      <q-card-actions align="left" class="q-mx-none q-pa-none q-my-none">
        <q-btn flat round size="md" :color="favoriteColor" :icon="favoriteIcon" class="q-ml-none" @click="addToBookmark"> {{ favoriteCount }}</q-btn>
        <q-btn flat round size="md" color="primary" icon="comment" class="q-ml-sm"> {{ commentCount }}</q-btn>
        <div class="text-caption q-ml-sm">by {{ owner_username }}</div>
      </q-card-actions>
      <q-card-section v-if="tags.length>0">
          <q-chip color="primary" text-color="white" v-for="tag in tags" :key="tag"  class="q-mx-xs q-px-sm">
            <router-link :to=tagSearchLink(tag) style="text-decoration: none; color: white" >
              {{tag.replace(/_/g, ' ')}}
            </router-link>
          </q-chip>
      </q-card-section>
      <q-card-section class="text-caption">
         {{ createdOnDate }}
      </q-card-section>

    </q-card>
    <div
    v-if="!loading && !error && similarImageItems.length > 0"
    class="row q-col-gutter-xs">

      <p class="text-subtitle1 col-12">more like this</p>
      <div
        v-for="(item,) in similarImageItems"
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


</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed} from 'vue';
import type { APIResponseImage } from "app/interfaces";
import {apiResponseToThumbnailProps} from "app/interfaces";
import { useAuthStore } from 'stores/auth'
const authStore = useAuthStore()
import { api } from 'boot/axios.js'
import { useRouter } from 'vue-router'
import ImageThumbnail from "components/ImageThumbnail.vue";
import type { ThumbnailProps } from 'components/ImageThumbnail.vue';
const router = useRouter();

const dateFormatter = new Intl.DateTimeFormat('en-US', {year: "numeric", month: "long", day: "numeric"});

// --- Propsの定義 ---
// ルートパラメータ名 (imageId) と同じ名前でpropsを定義します。
interface Props {
  imageId: string;
}
const props = defineProps<Props>();

const similarImageItems = ref<ThumbnailProps[]>([]);

// reactives
const imageData = ref<APIResponseImage | null>(null); // APIから取得する画像データの型に合わせてください
const loading = ref<boolean>(false);
const error = ref<Error | null>(null);
const tags = ref<string[]>([]);
const createdOnDate = computed(() => {
  return imageData.value?.created_on ? dateFormatter.format(new Date(imageData.value?.created_on)) : ""
})
const favoriteCount = computed(() => {return 0 + (isMyBookmark.value ? 1 : 0)})
const commentCount = computed(() => {return 0})
const owner_username = computed(() => {return imageData.value !== null ? imageData.value.owner_username : ""})
const aspectRatio = computed(() => {
  if (imageData.value !== null && imageData.value.width !== undefined && imageData.value.height !== undefined) {
    return imageData.value.width / imageData.value.height;
  } else {
    return 1.0
  }
})
// reactive fav
const isMyBookmark = ref<boolean>(false);
const favoriteIcon = computed(() => {return  isMyBookmark.value ? "favorite" : "favorite_border"})
const favoriteColor = computed(() => {return isMyBookmark.value ? "pink" : "primary"})


function tagSearchLink(tag: string) {
  return `/?tag=${tag}`;
}



// --- APIから画像詳細を取得する関数 (仮) ---
const fetchImageDetails = async () => {
  await api.get(`/images/hashid/${props.imageId}/`)
    .then((response) => {
      imageData.value = response.data
      tags.value = Object.keys(response.data.tags)
      isMyBookmark.value = response.data.bookmark
    })
    .catch((error) => {
      console.log(error);
    })
};

// --- 画像詳細をロードする処理 ---
const loadImageDetails = async () => {
  loading.value = true;
  error.value = null;
  imageData.value = null;
  try {
    // props.imageId を使ってAPIからデータを取得
    await fetchImageDetails();
  } catch (e) {
    console.error('Failed to load an image:', e);
    if (e instanceof Error) {
      error.value = e;
    } else {
      error.value = new Error(String(e));
    }
  } finally {
    loading.value = false;
  }
};

const fetchSimilarImages = async () => {
  loading.value = true;
  error.value = null;
  try {
    let url
    if (props.imageId !== null) {
      console.debug(props.imageId);
      url = `/images/similar/${props.imageId}/12/`
    } else {
      console.error("loading random thumbnails instead of similar images")
      url = "/images/random-thumbnails/12/"
    }
    await api.get(url)
      .then(response => {
        const rawItems = response.data as APIResponseImage[];
        similarImageItems.value = rawItems.map((rawItem: APIResponseImage): ThumbnailProps => {
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

function addToBookmark() {
  if (isMyBookmark.value) {
    return
  }
  if (imageData.value !== null) {
    console.debug(`toggleBookmark ${imageData.value.filename} ${authStore.user}`);
    if (authStore.isAuthenticated) {
      api.post(`/images/bookmark/${imageData.value.image_id}/`, {})
        .then(() => {
          console.debug(`added to ${authStore.user.username} bookmark.`)
        })
        .catch((err) => {
          console.error(err.message);
        })
    } else {
      void router.push('/user-login')
    }
  }
}

// --- ライフサイクルフック ---
onMounted(() => {
  loadImageDetails()
    .catch(e => console.error(e));
  fetchSimilarImages()
    .catch(e => console.error(e));
});

// --- Watch (ルートパラメータの変更に対応) ---
// 同じコンポーネントが再利用されてimageIdだけが変わる場合 (例: /image-detail-view/123 -> /image-detail-view/456)
// props.imageId の変更を監視してデータを再ロードします。
watch(
  () => props.imageId,
  (newId, oldId) => {
    if (newId !== oldId && newId) {
      console.log(`Image ID changed from ${oldId} to ${newId}. Reloading data.`);
      loadImageDetails()
        .then(() => {
          fetchSimilarImages()
            .catch(e => console.error(e));
          }
        )
        .catch(e => console.error(e));
    }
  }
);

</script>

<style scoped>

</style>
