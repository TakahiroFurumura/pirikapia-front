<template>
  <q-page class="flex">
    <q-card flat style="width: 400px; max-width: 90vw;">
      <q-card-section class="q-my-md">
        <div class="text-h5 q-mb-md">Enter new password</div>
        <q-form @submit.prevent="handlePasswordReset">
          <q-input
            v-model="password"
            label="New password"
            type="password"
            filled
            lazy-rules
            :rules="[val => !!val || 'Password is required']"
            class="q-mb-sm"
          />
          <q-banner v-if="errorMessage" inline-actions class="text-white bg-red q-my-md">
            {{ errorMessage }}
          </q-banner>
          <div>
            <q-btn label="Reset password" type="submit" color="primary" :loading="loading" class="full-width"/>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router';
const route = useRoute();
const router = useRouter();
// import { useAuthStore } from 'src/stores/auth'
// import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
// import { AxiosError } from 'axios'; // AxiosError の型をインポート

// const email = ref('');
const password = ref('');
const uid = ref<string|null>(null)
const token = ref<string|null>(null)
const loading = ref(false);
const errorMessage = ref('');

// const authStore = useAuthStore();

const handlePasswordReset = async () => {
  loading.value = true;
  errorMessage.value = ''; // エラーメッセージを初期化

  await api.post(
    'auth/password/reset/confirm/',
    {
    "new_password1": password.value,
    "new_password2": password.value,
    "uid": uid.value,
    "token": token.value,
    }
  )
    .then(() => {
      router.push('/user-login')
        .catch((err) => {console.error(err)})
    })
    .catch((error) => {
      console.error(error)
      errorMessage.value = 'Failed to reset password. '
      if (error.response.data.new_password2 !== undefined) {
        errorMessage.value += error.response.data.new_password2 + ' '
      }
    })
    .finally(() => {
      loading.value = false
    })
};

onMounted(() => {
  const urlFromQuery = route.query.url as string;
  token.value = urlFromQuery.split('/')[7] as string
  uid.value = urlFromQuery.split('/')[6] as string
  console.log('passwordResetUrl', urlFromQuery);
  console.debug("uid", uid.value)
  console.debug("token", token.value)
})

</script>
