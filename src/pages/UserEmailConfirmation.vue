<template>
  <div class="q-pa-md column items-center justify-center" style="min-height: 80vh;">
    <div v-if="isLoading" class="text-center">
      <q-spinner-dots color="primary" size="4em" />
      <p class="q-mt-md text-body1">Verifying your email, please wait...</p>
    </div>
    <div v-else-if="errorMessage" class="text-center">
      <q-icon name="error" color="negative" size="3em" />
      <p class="q-mt-sm text-h6 text-negative">Verification Failed</p>
      <p class="text-body1">{{ errorMessage }}</p>
      <q-btn
        label="Go to Homepage"
        color="primary"
        class="q-mt-md"
        @click="goToHome"
        unelevated
      />
    </div>
    <div v-else-if="isVerified" class="text-center">
      <q-icon name="check_circle" color="positive" size="3em" />
      <p class="q-mt-sm text-h6 text-positive">Email Successfully Verified!</p>
      <p class="text-body1">Redirecting to homepage shortly...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { api } from 'boot/axios'; // Quasarのaxiosインスタンスを想定
import type { AxiosError } from 'axios'

const route = useRoute();
const router = useRouter();

const isLoading = ref<boolean>(true);
const errorMessage = ref<string | null>(null);
const isVerified = ref<boolean>(false);

onMounted(async () => {
  const keyFromQuery = route.query.key;

  if (typeof keyFromQuery !== 'string' || keyFromQuery.trim() === '') {
    errorMessage.value = 'Invalid or missing verification key in the URL.';
    isLoading.value = false;
    return;
  }

  try {
    // APIエンドポイントのパスを確認してください。
    // boot/axios.js の baseURL 設定によって、先頭に '/' が必要かどうかが変わります。
    // 例: baseURL が 'https://api.example.com/api' なら 'auth/registration/verify-email/'
    // 例: baseURL が 'https://api.example.com' なら '/api/auth/registration/verify-email/'
    // 元のコードでは 'auth/registration/verify-email' となっていました。
    // ここではDRFの慣習に従い、末尾にスラッシュを追加することを推奨します: 'auth/registration/verify-email/'
    await api.post('auth/registration/verify-email/', { key: keyFromQuery });

    console.log("Email verification successful.");
    isVerified.value = true;
    isLoading.value = false;

    // 成功したら2秒後にホームページにリダイレクト
    setTimeout(() => {
      // 'Home' という名前付きルートがある場合は router.push({ name: 'Home' });
      // なければ直接パスを指定 router.push('/');
      void router.push('user-login');
    }, 2000);

  } catch (error: unknown) {
    console.error("Email verification failed:", error);
    isLoading.value = false;
    const axiosError = error as AxiosError;
    errorMessage.value = axiosError.message;
  }
});

function goToHome() {
  // 'Home' という名前付きルートがある場合は router.push({ name: 'Home' });
  void router.push('/')
}
</script>

<style scoped>
/* 必要に応じてスタイルを追加 */
.column { /* Quasarのクラスがグローバルに効いているはずですが、念のため */
  display: flex;
  flex-direction: column;
}
.items-center {
  align-items: center;
}
.justify-center {
  justify-content: center;
}
</style>
