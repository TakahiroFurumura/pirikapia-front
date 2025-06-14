<template>
  <q-card flat class="q-ma-none q-pa-none" style="cursor: pointer;">
    <router-link :to=linkToDetail()>
      <q-img
        :src="props.signed_url"
        :ratio="1/1"
        style="position: relative;"
      >
        <template v-slot:error>
          <div class="absolute-full flex flex-center bg-negative text-white">
            Failed to load...
          </div>
        </template>
        <div
          v-if="requires_login"
          class="absolute-bottom text-center"
          style="background-color: rgba(0, 0, 0, 0.3); color: white; padding: 2px;"
        >
          <span class="text-caption">Login to unlock</span>
        </div>
      </q-img>
    </router-link>
    <q-separator/>
    <q-card-actions align="left" class="q-mx-none q-pa-none q-my-none">
      <q-btn flat round size="md" :color="favoriteColor" :icon="favoriteIcon" class="q-ml-none" @click="addToBookmark"> {{ bookmarkCount }}</q-btn>
      <q-btn flat round size="md" color="primary" icon="comment" class="q-ml-sm"> {{ props.comment_count }}</q-btn>
      <div class="text-caption q-ml-sm">by {{ props.owner_username }}</div>
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
const router =useRouter();
import { useAuthStore } from 'stores/auth'
const authStore = useAuthStore()
import { api } from 'boot/axios.js'
import {computed, ref, onMounted} from "vue";

export interface ThumbnailProps {
  filename: string;
  image_id: string;
  signed_url: string;
  owner_username: string;
  title: string | undefined;
  comment_count: number | undefined;
  requires_login: boolean | undefined;
  bookmark: boolean | undefined;
  bookmark_count: number;
}
const props = withDefaults(defineProps<ThumbnailProps>(), {
  title: '',
  bookmark_count: 0,
  comment_count: 0,
});

// const isMyFavorite = ref(false);

const bookmarkCount = computed(() => {return props.bookmark_count + (isMyBookmark.value ? 1 : 0)});
// reactive fav
const isMyBookmark = ref<boolean>(false);
const favoriteIcon = computed(() => {return  isMyBookmark.value ? "favorite" : "favorite_border"})
const favoriteColor = computed(() => {return isMyBookmark.value ? "pink" : "primary"})

function linkToDetail() {
  return `/image-detail-view/${props.image_id}`;
}

function addToBookmark() {
  if (isMyBookmark.value) {
    return
  }
  console.debug(`toggleBookmark ${props.filename} ${authStore.user}`);
  if (authStore.isAuthenticated) {
    api.post(`images/bookmark/${props.image_id}/`,{})
      .then((res) => {
        console.debug(`${res.status} ${props.filename} was added to ${authStore.user.username} bookmark.`)
        isMyBookmark.value = true;
      })
      .catch((err) => {console.error(err.message);})
  } else {
    void router.push('/user-login')
  }
}

onMounted(() => {
  isMyBookmark.value = props.bookmark;
})

</script>

<style scoped>

</style>
