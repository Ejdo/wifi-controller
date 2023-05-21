<template>
  <q-page class="row items-center justify-evenly">
    <div class="column q-gutter-lg">
      <AccessPointsTable :accesPoints="accessPoints"></AccessPointsTable>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { useAccessPointsStore } from '../stores/access-points-store';
import { useTemplateStore } from 'src/stores/template-store';
import { computed, onMounted } from 'vue';
import AccessPointsTable from '../components/AccessPointsTable.vue';

const accessPointsStore = useAccessPointsStore();
const templateStore = useTemplateStore();
const accessPoints = computed(() => accessPointsStore.accessPoints);

onMounted(() => {
  accessPointsStore.fetchAccessPoints();
  templateStore.fetchTemplates();
});
</script>
