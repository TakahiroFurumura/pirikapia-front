<template>
  <q-layout>
    <q-page-container>
      <q-page>
        <q-page-container class="q-ma-md">
          <div v-if=authStore.getUser>
            <q-list dense>
              <q-item><span class="text-bold">User Profile</span></q-item>
              <q-item>Name: {{authStore.user.username}}</q-item>
              <q-item>email: {{authStore.user.email}}</q-item>
              <q-item clickable @click="handleLogout"><q-btn flat round dense icon="logout"><span class="q-ml-sm">Logout</span></q-btn></q-item>
            </q-list>
          </div>

        </q-page-container>
      </q-page>
  </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from 'vue-router'
const router = useRouter()
import { useAuthStore } from "stores/auth";
const authStore = useAuthStore();

const handleLogout = async () => {
  await authStore.logout();
  router.push('/')
    .catch(err => console.log(err))
}

onMounted(() => {
  if (!useAuthStore().isAuthenticated) {
    router.push("/login")
      .catch(err => console.error(err))
  }
})

</script>

<style scoped>

</style>
