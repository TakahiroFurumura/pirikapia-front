<template>
  <q-page class="">
    <h4 class="q-px-md">Create a new book</h4>
    <div class="q-px-md">
      <div class="q-my-md">
        <q-input v-model="book_title" label="title" class="q-my-sm"></q-input>
        <p>cover images</p>
        <a>select from your bookmark</a>
        <div></div>
      </div>
      <q-separator/>

      <div class="q-my-md">
        <q-input v-model="chapter_title" label="chapter title (optional)" class="q-my-sm"></q-input>
        <p>chapter cover images</p>
        <a>select from your bookmark</a>

        <div v-for="scene in scenes" :key="scene.sceneId">
          <NovelSceneEdit
            :sceneId="scene.sceneId"
            :editable="true"
          />
        </div>
      </div>
    <q-btn flat color="white" text-color="black" label="Create" class="q-my-md" ></q-btn>
  </div>
  </q-page>
</template>

<script setup lang="ts">

import { ref, onMounted } from 'vue'
import NovelSceneEdit from "components/NovelSceneEdit.vue";
import type { NovelSceneEditProps } from 'components/NovelSceneEdit.vue';
const isNewBook = ref(true)
const newBookId = ref<string|null>(null)
const book_title = ref("")
const chapter_title = ref("")
const scenes = ref<NovelSceneEditProps[]>([]);

interface Props {
  bookId: string;
}
const props = defineProps<Props>();

onMounted(() => {
  console.debug("bookId: ", props.bookId);
  if (props.bookId === undefined) {
    isNewBook.value = true
    newBookId.value = crypto.randomUUID()
    console.debug("create a new book.", newBookId.value)
  } else {
    isNewBook.value = true
    newBookId.value = null
    console.debug("edit an existing book.", props.bookId)
  }
})

</script>


<style scoped>

</style>
