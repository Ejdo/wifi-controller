<template>
  <q-layout view="hHh LpR fFf">
    <q-header bordered class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />
        <q-toolbar-title class="absolute-center">
          WiFi Network Controller
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" side="left" overlay bordered>
      <q-list>
        <q-item clickable v-ripple to="/accesspoints">
          <q-item-section avatar>
            <q-icon color="primary" name="router" />
          </q-item-section>

          <q-item-section>Access Points</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/networks">
          <q-item-section avatar>
            <q-icon color="primary" name="wifi" />
          </q-item-section>

          <q-item-section>WiFi Networks</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/users">
          <q-item-section avatar>
            <q-icon color="primary" name="manage_accounts" />
          </q-item-section>

          <q-item-section>Users</q-item-section>
        </q-item>
      </q-list>
      <q-btn
        icon="logout"
        flat
        class="absolute-bottom"
        @click="authStore.logout"
      >
        <q-tooltip>Logout</q-tooltip>
      </q-btn>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { useAuthStore } from 'src/stores/auth-store';
import { ref } from 'vue';

const leftDrawerOpen = ref(false);
const authStore = useAuthStore();

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>
