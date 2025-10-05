<template>
  <router-link :to=linkToDetail()>
    <q-img
      :src="imageData?.signed_url"
      spinner-color="grey"
      :ratio="aspectRatio"
      spinner-size="82px"
      style="position: relative;"
      :fit="fit"
      :height="height"
    >
      <template v-slot:error>
        <div class="absolute-full flex flex-center bg-grey text-white">
          Failed to load...
        </div>
      </template>

      <div
        v-if="imageData?.requires_login && !authStore.isAuthenticated"
        class="absolute-full text-subtitle1  flex flex-center"
        style="cursor: pointer; background-color: rgba(0, 0, 0, 0.3); color: white; padding: 2px;"
        @click="router.push('/user-login')"
      >
        <span class="">Login to unlock</span>
      </div>
    </q-img>
  </router-link>
  <div v-if="props.showButtons">
  <div class="row">
    <q-card-actions align="left" class="q-mx-none q-pa-none q-my-none">
      <q-btn flat round size="md" :color="favoriteColor" :icon="favoriteIcon" class="q-ml-none" @click="addToBookmark"> {{ bookmarkCount }}</q-btn>
      <q-btn flat round size="md" color="primary" icon="comment" class="q-ml-sm"> {{ commentCount }}</q-btn>
      <div class="text-caption q-ml-sm">by {{ owner_username }}</div>
    </q-card-actions>
    <q-card-section class="text-caption" v-if="props.showPublishedDate">
       {{ createdOnDate }}
    </q-card-section>
  </div>
  <!-- tags -->
  <q-card-section v-if="tags.length>0 && props.showTags">
      <q-chip color="primary" text-color="white" v-for="tag in tags" :key="tag"  class="q-mx-xs q-px-sm">
        <router-link :to=tagSearchLink(tag) style="text-decoration: none; color: white" >
          {{tag.replace(/_/g, ' ')}}
        </router-link>
      </q-chip>
  </q-card-section>
  </div>
</template>

<script setup lang="ts">
import { useUiConfigStore } from "stores/uiconfig";
const uiConfigStore = useUiConfigStore()
const debug = uiConfigStore.isDebugMode

import { ref, onMounted, watch, computed} from 'vue';
import type { APIResponseImage } from "app/interfaces";
// import {apiResponseToThumbnailProps} from "app/interfaces";
import { useAuthStore } from 'stores/auth'
const authStore = useAuthStore()
import { api } from 'boot/axios.js'
import { useRouter } from 'vue-router'
// import ImageThumbnail from "components/ImageThumbnail.vue";
// import type { ThumbnailProps } from 'components/ImageThumbnail.vue';
const router = useRouter();

const dateFormatter = new Intl.DateTimeFormat('en-US', {year: "numeric", month: "long", day: "numeric"});

// --- Propsの定義 ---
// ルートパラメータ名 (imageId) と同じ名前でpropsを定義します。
interface Props {
  imageId: string;
  linkTo?: string;
  showTags: boolean;
  showPublishedDate?: boolean;
  showButtons?: boolean;
  cropAspectRatio?: number | undefined | null;
  heightPercent?: number | undefined | null;
  fit?: "contain" | "cover" | "fill" | "none" | "scale-down" | undefined;
}

const props = withDefaults(defineProps<Props>(), {
  showTags: true,
  linkTo: "",
  showPublishedDate: true,
  showButtons: true,
  cropAspectRatio: null,
});

const fit = props.fit ? props.fit : "cover";
const height = computed(()=> {
  if (props.heightPercent !== null && props.heightPercent !== undefined) {
    return `${props.heightPercent}%`
  } else {
    return "none"
  }
})

// reactives
const imageData = ref<APIResponseImage | null>(null); // APIから取得する画像データの型に合わせてください
const loading = ref<boolean>(false);
const error = ref<Error | null>(null);
const tags = ref<string[]>([]);
const createdOnDate = computed(() => {
  return imageData.value?.created_on ? dateFormatter.format(new Date(imageData.value?.created_on)) : ""
})
const commentCount = computed(() => {return 0})
const owner_username = computed(() => {return imageData.value !== null ? imageData.value.owner_username : ""})
const aspectRatio = computed(() => {
  if (props.cropAspectRatio !== null && props.cropAspectRatio !== undefined) {
    return props.cropAspectRatio;
  } else if (imageData.value !== null && imageData.value.width !== undefined && imageData.value.height !== undefined) {
    return imageData.value.width / imageData.value.height;
  } else {
    return 1.0
  }
})

watch(() => props.imageId, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    loadImageDetails()
      .catch((err) => {
        console.error(err)
      })
  }})


// reactive fav
const isMyBookmark = ref<boolean>(false);
const justAddedToBookmark = ref<boolean>(false);
const favoriteIcon = computed(() => {return  isMyBookmark.value || justAddedToBookmark.value || bookmarkCount.value > 0 ? "favorite" : "favorite_border"})
const favoriteColor = computed(() => {return isMyBookmark.value || justAddedToBookmark.value ? "pink" : "primary"})
const bookmarkCount = computed(() => {
  if (imageData.value != undefined && imageData.value !== null) {
      return imageData.value.bookmark_count + (justAddedToBookmark.value ? 1 : 0)
    } else {
      return 0
    }
});

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
          justAddedToBookmark.value = true
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
  if (debug) {console.debug(props)}
  loadImageDetails()
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
        .catch(e => console.error(e));
    }
  }
);

function linkToDetail() {
  if (props.linkTo == "") {
    return `/image-detail-view/${props.imageId}`;
  } else {
    return props.linkTo;
  }
}

</script>


<style scoped>

</style>
