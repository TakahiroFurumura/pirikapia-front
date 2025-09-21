<template>
  <q-layout view="lHh Lpr lFf">
    <q-header flat>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />
          <q-toolbar-title style="cursor: pointer;" @click="toHome">
            Pirikapia
          </q-toolbar-title>
        <q-item v-if="authStore.isAuthenticated" clickable @click="router.push('/user-profile')">
          <q-btn flat round dense icon="account_circle">
            <span class="q-ml-sm">{{authStore.user.username}}</span>
          </q-btn>
        </q-item>

        <!-- -->
          <q-select dark borderless v-model="language" :options="languageOptions">
            <template v-slot:prepend>
              <q-icon color="white" name="language"></q-icon>
              <q-tooltip>Language</q-tooltip>
            </template>
          </q-select>

        <q-item v-if="!authStore.isAuthenticated" clickable @click="router.push('/user-login')">
          <q-btn flat round dense icon="login"><span class="q-ml-sm">Login</span></q-btn>
        </q-item>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
    >
      <q-list>
        <q-item-label
          header
        >
          Menus
        </q-item-label>

        <EssentialLink
          v-for="link in linksList"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
    <q-footer class="q-pa-xs">
      <span>{{welcomeMessage}}</span>
      <span class="q-pa-xs" v-if="debug">(debug mode) {{apiBaseUrl}}</span> </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
// config
import { useAuthStore } from "stores/auth";
const authStore = useAuthStore();
import { useUiConfigStore } from "stores/uiconfig";
const uiConfigStore = useUiConfigStore()
const debug = uiConfigStore.isDebugMode

import { ref, watch, onMounted } from 'vue';
import EssentialLink, { type EssentialLinkProps } from 'components/EssentialLink.vue';
import { api } from 'boot/axios';
import apiBaseUrl from 'boot/axios';
import axios from 'axios';

import { useRouter } from 'vue-router'
const router = useRouter()

const language = ref(uiConfigStore.language)
const languageOptions = [
  'en', 'ja'
]
watch(language, (newLanguage) => {
  uiConfigStore.setLanguage(newLanguage)
})

watch(() => uiConfigStore.language, (newLanguage) => {
  language.value = newLanguage
})

const linksList: EssentialLinkProps[] = [
  {
    title: 'Images & Movies',
    caption: '',
    icon: 'collections',
    link: {name: 'home'}
  },
  {
    title: 'Novels & Articles',
    caption: '',
    icon: 'library_books',
    link: {path: `novel-home/${uiConfigStore.language}`}
  },
  {
    title: 'Your bookmarks',
    caption: '',
    icon: 'bookmark',
    link: {name: 'image-bookmarks'}
  },
  {
    title: 'Upload and manage',
    caption: 'upload or manage your images, videos and texts',
    icon: 'upload',
    link: {name: 'manage-creatives'}
  },
  {
    title: 'Generate images',
    caption: '(to be developed) create novels and articles',
    icon: 'edit',
    link: {name: 'home'}
  },
  {
    title: 'Generate texts',
    caption: '(to be developed) create images',
    icon: 'edit',
    link: {name: 'home'}
  },
  {
    title: 'Your profile',
    caption: '',
    icon: 'account_circle',
    link: {name: 'user-profile'}
  },
  {
    title: 'About',
    caption: 'pirikapia, Utopia of beauties',
    icon: 'info',
    link: ''
  },

];

const leftDrawerOpen = ref(false);
const welcomeMessage = ref("");
const fetchError = ref<string | null>(null); // To store any error messages
const isLoading = ref(false); // To indicate loading state

function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

// Function to fetch the welcome message
async function fetchWelcomeMessage() {
  isLoading.value = true;
  fetchError.value = null;
  try {
    // Make the GET request using the imported 'api' instance
    // The full URL is used here. If 'https://callingapi.pirikapia.com/' was your baseURL in axios.js,
    // you could just use api.get('/')
    const response = await api.get('/');

    // Assuming the API returns the text directly in response.data
    // If the text is nested (e.g., response.data.message), adjust accordingly
    if (typeof response.data === 'string') {
      welcomeMessage.value = response.data;
    } else if (response.data && typeof response.data.message === 'string') {
      // Example if the message is in a 'message' property
      welcomeMessage.value = response.data.message;
    } else {
      // If the response is not plain text or the expected structure, log it and set a generic message
      console.warn('Unexpected response format:', response.data);
      welcomeMessage.value = 'Welcome message received, but format is unexpected.';
    }

  } catch (error: unknown) {
    console.error('Failed to fetch welcome message:', error);

    if (axios.isAxiosError(error)) {
    // Set an error message to display to the user
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        fetchError.value = `Server Error: ${error.response.status} - ${error.response.data?.message || error.response.data || error.message}`;
      } else if (error.request) {
        // The request was made but no response was received
        fetchError.value = 'No response from server. Please check your network connection.';
      } else {
        // Something happened in setting up the request that triggered an Error
        fetchError.value = `Error: ${error.message}`;
      }
    }
    welcomeMessage.value = ''; // Clear any previous message
  } finally {
    isLoading.value = false;
  }
}

function toHome() {
  router.push('/')
    .then(() => {location.reload()})
    .catch((error: unknown) => {console.log(error)})
}

// Call the function when the component is mounted
onMounted(() => {
  fetchWelcomeMessage()
    .then()
    .catch(error => {console.log(error)})
    .finally(() => {});
  uiConfigStore.language = navigator.language ? navigator.language : 'ja';
  if (debug) console.debug('language set to', uiConfigStore.language)
});

</script>
