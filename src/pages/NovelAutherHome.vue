<template>
  <q-page v-if="!authStore.isAuthenticated" class="q-pa-sm">
    <div>
      Please <router-link to="/user-login">login</router-link> to use this feature for novel authors.
    </div>
  </q-page>

  <q-page class="q-pa-sm">
    <div class="q-mx-md">
      <h4>Novel Auther Home</h4>
    </div>
    <div class="q-pa-none q-ma-none" style="max-width: 350px">
        <q-list>
          <q-separator spaced inset></q-separator>
          <q-item>
            <q-item-section  style="cursor: pointer;" @click="toNovelUploadText">
              <q-item-label>Create new novel</q-item-label>
              <q-item-label caption lines="2">upload your novel, or create a new one with our generative AI tools.</q-item-label>
            </q-item-section>

            <q-item-section side middle>
              <q-item-label caption></q-item-label>
              <q-icon name="upload" color="black"></q-icon>
            </q-item-section>
          </q-item>

          <q-separator spaced inset></q-separator>

        </q-list>
    </div>

    <div>

    </div>
  </q-page>
</template>


<script setup lang="ts">
import { useAuthStore } from "stores/auth";
const authStore = useAuthStore();

import { useRouter } from "vue-router";
const router = useRouter();
const toNovelUploadText = () => {
  void router.push("novel-edit")
}

</script>


<style scoped>

</style>
