
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
        <q-chip color="primary" text-color="white" v-for="tag in tags" :key="tag">
          {{tag.replace(/_/g, ' ')}}
        </q-chip>
      </q-card-section>
      <q-card-section class="text-caption">
        <q-list dense>
          <li>{{imageData?.filename}}</li>
          <li>{{imageData?.created_on}}</li>
        </q-list>
      </q-card-section>

    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import type { APIResponseImage } from "app/interfaces";
import { api } from 'boot/axios.js'
import { useRouter } from 'vue-router'
const router = useRouter();

// --- Propsの定義 ---
// ルートパラメータ名 (imageId) と同じ名前でpropsを定義します。
interface Props {
  imageId: string; // imageId は文字列として渡されます。数値の場合はパースが必要です。
}
const props = defineProps<Props>();

// --- リアクティブ変数 ---
const imageData = ref<APIResponseImage | null>(null); // APIから取得する画像データの型に合わせてください
const loading = ref<boolean>(false);
const error = ref<Error | null>(null);
const tags = ref<string[]>([]);


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

// --- ライフサイクルフック ---
onMounted(() => {
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

</script>

<style scoped>

</style>
