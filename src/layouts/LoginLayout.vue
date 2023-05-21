<template>
  <q-layout>
    <q-page-container>
      <q-page class="window-height window-width">
        <q-card
          class="row fixed-center text-center items-center q-pa-lg responsive-card"
        >
          <q-card-section>
            <h2>Log in</h2>
            <p>Use your OpenWISP account</p>
            <div class="column justify-center q-gutter-md q-my-xl">
              <q-input
                outlined
                autofocus
                id="username"
                v-model="credentials.username"
                class="col-12"
                label="Username"
              >
                <template v-slot:error> User not found </template>
              </q-input>
              <q-input
                outlined
                id="password"
                v-model="credentials.password"
                type="password"
                class="col-12"
                label="Password"
              >
              </q-input>
            </div>
            <div class="column wrap content-center" style="margin: 15px 35px">
              <q-btn
                class="shadow-4 q-px-xl"
                color="primary"
                text-color="white"
                no-caps
                label="Log in"
                @click="login"
                style="font-size: 20px"
              />
            </div>
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>
<script lang="ts" setup>
import { computed, ref } from 'vue';
import { LoginCredentials } from 'src/models/auth';
import { useAuthStore } from 'src/stores/auth-store';
import { RouteLocationRaw, useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const authStore = useAuthStore();

const credentials = ref({
  username: '',
  password: ''
} as LoginCredentials);

const redirectTo = computed<RouteLocationRaw>(() => {
  return (route.query.redirect as string) || { name: 'chat' };
});

function login() {
  authStore.login(credentials.value).then(() => {
    router.push(redirectTo.value);
  });
}
</script>
