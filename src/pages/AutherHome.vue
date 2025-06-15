<template>
  <q-page v-if="!authStore.isAuthenticated" class="q-pa-sm">
    <div>
      Please <router-link to="/user-login">login</router-link> to use this feature for novel authors.
    </div>
  </q-page>

  <q-page>
    <div>

    </div>
    <div>

    </div>
  </q-page>
</template>


<script setup lang="ts">
import { useAuthStore } from "stores/auth";
const authStore = useAuthStore();

</script>


<style scoped>

</style>
