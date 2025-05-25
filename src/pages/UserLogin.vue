<template>
  <q-page class="flex">
    <q-card flat style="width: 400px; max-width: 90vw;">
      <q-card-section>
        <div class="text-h5 q-mb-md">Login or <a class="" @click="redirectToSignUp">sing up</a></div>
        <q-form @submit.prevent="handleLogin">
          <q-input
            v-model="email"
            label="Email"
            type="email"
            filled
            lazy-rules
            :rules="[val => !!val || 'Email is required', val => /.+@.+\..+/.test(val) || 'Invalid email']"
            class="q-mb-sm"
          />
          <q-input
            v-model="password"
            label="Password"
            type="password"
            filled
            lazy-rules
            :rules="[val => !!val || 'Password is required']"
            class="q-mb-sm"
          />
          <q-banner v-if="errorMessage" inline-actions class="text-white bg-red q-mb-md">
            {{ errorMessage }}
          </q-banner>
          <div>
            <q-btn label="Login" type="submit" color="primary" :loading="loading" class="full-width"/>
          </div>

        </q-form>
      </q-card-section>

      <q-card-section class="q-my-lg">
        <q-banner class="q-my-none q-py-none q-px-none">Forgot password?</q-banner>
        <q-form @submit.prevent="sendPasswordResetEmail">
          <q-input
            v-model="email"
            label="Email"
            type="email"
            filled
            lazy-rules
            :rules="[val => !!val || 'Email is required', val => /.+@.+\..+/.test(val) || 'Invalid email']"
            class="q-mb-sm"
          />
          <div>
            <q-btn label="Send email to reset password" type="submit" color="primary" :loading="loading" class="full-width"/>
          </div>
          <q-banner v-if="passwordResetMessage" inline-actions class="text-white bg-red q-mb-md">
            {{ passwordResetMessage }}
          </q-banner>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import { AxiosError } from 'axios'; // AxiosError の型をインポート

const email = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');
const passwordResetMessage = ref('');

const authStore = useAuthStore();
const router = useRouter();
const $q = useQuasar(); // Quasar の機能を使うため

const handleLogin = async () => {
  loading.value = true;
  errorMessage.value = ''; // エラーメッセージを初期化

  try {
    // Piniaストアのloginアクションを呼び出し
    await authStore.login({
      email: email.value,
      username: email.value,
      password: password.value,
    });

    // ログイン成功時の通知
    console.log("login success");

    // ログイン成功後、ダッシュボードやホームページにリダイレクト
    // router.push({ name: 'Dashboard' }); // ルート名で指定する場合
    router.push('/')
      .catch(err => {console.error("navigation after logging in failed", err)});

  } catch (error: unknown) {
    // ストアのloginアクションがrejectした場合のエラーハンドリング
    let message = 'Login failed. Please check your credentials or try again later.';
    // 型ガードを使ってエラーの型を特定し、安全にプロパティにアクセスする
    if (error instanceof AxiosError) {
      // Axios からのエラーの場合
      if (error.response && error.response.data) {
        const responseData = error.response.data; // response.data の型が不明なため、一時的にanyで受ける
        if (responseData && typeof responseData.message === 'string') {
          message = responseData.message;
        } else if (responseData && typeof responseData.error === 'string') { // { error: "message" } 形式
          message = responseData.error;
        } else if (typeof responseData === 'string') { // APIがエラーメッセージ文字列を直接返す場合
           message = responseData;
        } else if (error.message) { // response.data に適切なメッセージがない場合、Axiosのエラーメッセージを使用
          message = error.message;
        }
      } else if (error.request) {
        // リクエストは行われたがレスポンスがない場合 (ネットワークエラーなど)
        message = 'No response from server. Please check your network connection.';
      } else {
        // リクエスト設定時のエラーなど
        message = error.message || 'An unexpected error occurred during the request setup.';
      }
    } else if (error instanceof Error) {
      // 標準の JavaScript Error オブジェクトの場合
      message = error.message;
    } else if (typeof error === 'string') {
      // 文字列が throw された場合 (推奨されないが、可能性として考慮)
      message = error;
    }
    // 他のカスタムエラータイプに対する処理もここに追加できます

    errorMessage.value = message;

    $q.notify({
      color: 'negative',
      position: 'top',
      message: errorMessage.value,
      icon: 'warning',
    });
  } finally {
    loading.value = false;
  }
};

const redirectToSignUp = () => {
  router.push('user-sign-up')
    .catch(err => console.log(err));
}

const sendPasswordResetEmail = () => {
  console.debug("sendPasswordResetEmail");
  api.post(
    "auth/password/reset/",
    {"email": email.value},
  )
    .then(res => {
      console.debug(res);
      passwordResetMessage.value = "Email to reset your password was sent. Please check your mailbox."
    })
    .catch(err => console.log(err));
}

</script>
