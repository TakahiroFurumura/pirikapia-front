
<template>
  <q-btn push label="Change image" flat @click="refresh"></q-btn>
  <div class="q-pa-md q-gutter-sm">

    <q-img
      :src="url"
      spinner-color="white"
      style="max-width: 1024px"
    ></q-img>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { api } from 'boot/axios';

const url = ref<string>('');
const refresh = (() => {
  api.get('https://api.pirikapia.com/images/random-pick/')
    .then(res => {url.value = res.data.signed_url})
    .catch(err => {console.log(err)})
})

</script>

<style scoped>

</style>
