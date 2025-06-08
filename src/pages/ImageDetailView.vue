<template>
  <div class="q-pa-md q-gutter-sm">
    <q-card flat>
      <q-img
        :src="imageData?.signed_url"
        spinner-color="white"
        style="max-width: 1024px"
      >

        <div
          v-if="imageData?.requires_login"
          class="absolute-full text-subtitle1  flex flex-center"
          style="cursor: pointer; background-color: rgba(0, 0, 0, 0.3); color: white; padding: 2px;"
          @click="router.push('/user-login')"
        >
          <span class="">Login to unlock</span>
        </div>
      </q-img>
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

    <div class="text-subtitle1 col-12">more like this</div>
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
          :favorite_count="item.favorite_count"
          :comment_count="item.comment_count"
          :requires_login="item.requires_login"
        />
      </div>
    </div>

  </div>


</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed} from 'vue';
import type { APIResponseImage } from "app/interfaces";
import {apiResponseToThumbnailProps} from "app/interfaces";
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


function tagSearchLink(tag: string) {
  return `/?tag=${tag}`;
}

// --- APIから画像詳細を取得する関数 (仮) ---
const fetchImageDetails = async () => {
  await api.get(`images/hashid/${props.imageId}/`)
    .then((response) => {
      imageData.value = response.data
      tags.value = Object.keys(response.data.tags)
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
    const data = await fetchImageDetails();
    console.log(data)
  } catch (e) {
    console.error('画像詳細の取得に失敗しました:', e);
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
