<template>
  <div class="q-my-md">
    <q-editor
      v-model="content"
      :toolbar="[
        ['bold', 'italic', 'strike', 'underline'],
      ]"
    ></q-editor>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

export interface NovelSceneEditProps {
  sceneId: string;
  editable: boolean;
}

const props = withDefaults(defineProps<NovelSceneEditProps>(), {
  editable: true
});

// contentというStringの変数を持ちます
const content = ref<string>('');

// sceneIdを監視し、nullでない場合にgetSceneContentsを実行します
watch(() => props.sceneId, (newSceneId) => {
  if (newSceneId !== null) {
    getSceneContents(newSceneId);
  }
}, { immediate: true }); // immediate: trueでコンポーネント初期化時にもチェックを実行

// getSceneContents関数の定義（中身は未実装）
const getSceneContents = (sceneId: string) => {
  // ここに将来的に処理を実装します
  console.log(`Fetching content for sceneId: ${sceneId}`);
};

</script>

<style scoped>

</style>
