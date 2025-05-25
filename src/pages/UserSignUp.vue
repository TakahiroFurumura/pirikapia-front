<template>
  <q-page class="flex">
    <q-card flat style="width: 400px; max-width: 90vw;">
      <q-card-section>
        <div class="text-h5 q-mb-md">Sing up</div>
        <q-form @submit.prevent="handleSignUp">
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
            v-model="username"
            label="User name (displayed publicly)"
            type="text"
            filled
            lazy-rules
            :rules="[val => !!val || 'User name is required']"
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
            <q-btn label="Sign up" type="submit" color="primary" :loading="loading" class="full-width"/>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from 'boot/axios.js'
import { useAuthStore } from 'src/stores/auth'
const authStore = useAuthStore()
// import { useQuasar } from 'quasar'
// import { AxiosError } from 'axios'; // AxiosError の型をインポート

const email = ref('');
const username = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');

// const authStore = useAuthStore();
const router = useRouter();

const handleSignUp = async () => {
  loading.value = true;
  errorMessage.value = ''; // エラーメッセージを初期化

  try {
    const data = {
      "username": username.value,
      "email": email.value,
      "password1": password.value,
      "password2": password.value,
    }
    await api.post('/auth/registration/', data )
      .then((response) => {
        if (response.status === 201) {
          authStore._setAuthData(
            response.data.access,
            response.data.refresh,
            response.data.user
          )
          router.push('/')
            .catch(err => {console.error("navigation after logging in failed", err)});
        }
        else {
          errorMessage.value = 'Failed to create a new account. ' + response.data.toString()
        }
      })
      .catch((error) => {
        console.log(error)
        errorMessage.value = 'Failed to create a new account. '
        if (error.response.data.email !== undefined) {
          errorMessage.value += error.response.data.email + ' '
        }
        if (error.response.data.password !== undefined) {
          errorMessage.value += error.response.data.password + ' '
        }
        if (error.response.data.username !== undefined) {
          errorMessage.value += error.response.data.username + ' '
        }
      })
      .finally()

  } catch (error: unknown) {
    console.log(error)
  } finally {
    loading.value = false;
  }
};

</script>
