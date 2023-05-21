<template>
  <q-page class="row items-center justify-evenly">
    <div class="column q-gutter-lg">
      <WifiNetworksTable />
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import WifiNetworksTable from '../components/WifiNetworksTable.vue';
</script>
