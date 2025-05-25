<template>

</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onMounted } from 'vue'

const verification_key = ref("")

onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.has('key')) {
    verification_key.value = urlParams.get('key') as string
  }
})

</script>

<style scoped>

</style>
