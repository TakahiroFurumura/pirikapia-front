<template>
  <q-item
    clickable
    :to="isExternalLink ? undefined : link"
    :target="isExternalLink ? '_blank' : undefined"
    tag="a"
  >
    <q-item-section
      v-if="icon"
      avatar
    >
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label caption>{{ caption }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface EssentialLinkProps {
  title: string;
  caption?: string;
  link?: string | object; // Handles string paths and route objects
  icon?: string;
}

const props = defineProps<EssentialLinkProps>();

const isExternalLink = computed(() => {
  return typeof props.link === 'string' && props.link.startsWith('http');
});

</script>
