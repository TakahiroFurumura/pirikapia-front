<template>
  <q-card flat class="q-ma-none q-pa-none" style="cursor: pointer;">
    <q-img
      :src="props.signed_url"
      :ratio="1/1"
      @click="navigateToDetail"
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
    <q-separator/>
    <q-card-actions align="left" class="q-mx-none q-pa-none q-my-none">
      <q-btn flat round size="sm" color="primary" icon="favorite_border" class="q-ml-none"> {{ props.favorite_count }}</q-btn>
      <q-btn flat round size="sm" color="primary" icon="comment" class="q-ml-sm"> {{ props.comment_count }}</q-btn>
      <div class="text-caption q-ml-sm">by {{ props.owner_username }}</div>
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
const router =useRouter();

export interface ThumbnailProps {
  filename: string;
  image_id: string;
  signed_url: string;
  owner_username: string;
  title: string | undefined;
  favorite_count: number | undefined;
  comment_count: number | undefined;
  requires_login: boolean | undefined;
}
const props = withDefaults(defineProps<ThumbnailProps>(), {
  title: '',
  favorite_count: 0,
  comment_count: 0,
});
// const props = defineProps<Props>();

const navigateToDetail = () => {
  router.push({ name: 'image-detail-view', params: { imageId: props.image_id } })
    .catch( (err: Error) => { console.log(err) })
}

</script>

<style scoped>

</style>
