<template>
  <q-page class="row items-center justify-evenly">
    <div class="q-pa-md shadow-2">
      <q-table
        :columns="columns"
        :rows="userStore.users"
        row-key="username"
        :filter="searchFilter"
        v-model:pagination="pagination"
        hide-pagination
        flat
        ref="table"
      >
        <template v-slot:top>
          <q-btn
            dense
            flat
            icon="add"
            label="Create User"
            @click="createUser"
          />
          <q-btn
            dense
            flat
            icon="save"
            class="q-mx-sm"
            @click="userStore.saveUsers"
          >
            <q-tooltip> Save Users </q-tooltip>
          </q-btn>
          <q-btn dense flat icon="refresh" @click="userStore.fetchUsers">
            <q-tooltip>Refresh</q-tooltip>
          </q-btn>
          <q-space class="q-mx-md" />
          <q-input
            dense
            debounce="100"
            color="primary"
            v-model="searchFilter"
            label="Search"
            hide-bottom-space
            outlined
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>
        <template v-slot:body="props">
          <q-tr :props="props">
            <q-td
              key="username"
              class="text-weight-bold"
              :props="props"
              style="cursor: pointer"
            >
              {{ props.row.username }}
              <q-popup-edit
                v-model="props.row.username"
                title="Edit Username"
                auto-save
                v-slot="scope"
                @save="userEdited(props.row)"
              >
                <q-input
                  v-model="scope.value"
                  dense
                  autofocus
                  counter
                  @keyup.enter="scope.set"
                />
              </q-popup-edit>
            </q-td>
            <q-td
              key="email"
              class="text-weight-bold"
              :props="props"
              style="cursor: pointer"
            >
              {{ props.row.email }}
              <q-popup-edit
                v-model="props.row.email"
                title="Edit Email"
                auto-save
                v-slot="scope"
                @save="userEdited(props.row)"
              >
                <q-input
                  v-model="scope.value"
                  dense
                  autofocus
                  counter
                  @keyup.enter="scope.set"
                />
              </q-popup-edit>
            </q-td>
            <q-td
              key="first_name"
              class="text-weight-bold"
              :props="props"
              style="cursor: pointer"
            >
              {{ props.row.first_name }}
              <q-popup-edit
                v-model="props.row.first_name"
                title="Edit First Name"
                auto-save
                v-slot="scope"
                @save="userEdited(props.row)"
              >
                <q-input
                  v-model="scope.value"
                  dense
                  autofocus
                  counter
                  @keyup.enter="scope.set"
                />
              </q-popup-edit>
            </q-td>
            <q-td
              key="last_name"
              class="text-weight-bold"
              :props="props"
              style="cursor: pointer"
            >
              {{ props.row.last_name }}
              <q-popup-edit
                v-model="props.row.last_name"
                title="Edit Last Name"
                auto-save
                v-slot="scope"
                @save="userEdited(props.row)"
              >
                <q-input
                  v-model="scope.value"
                  dense
                  autofocus
                  counter
                  @keyup.enter="scope.set"
                />
              </q-popup-edit>
            </q-td>
            <q-td key="is_active" class="text-weight-bold" :props="props">
              <q-toggle
                v-model="props.row.is_active"
                keep-color
                :color="props.row.is_active ? 'positive' : 'negative'"
              ></q-toggle>
            </q-td>
            <q-td key="is_staff" class="text-weight-bold" :props="props">
              <q-toggle
                v-model="props.row.is_staff"
                keep-color
                :color="props.row.is_staff ? 'positive' : 'negative'"
              ></q-toggle>
            </q-td>
            <q-td key="is_superuser" class="text-weight-bold" :props="props">
              <q-toggle
                v-model="props.row.is_superuser"
                keep-color
                :color="props.row.is_superuser ? 'positive' : 'negative'"
              ></q-toggle>
            </q-td>
            <q-td>
              <q-btn dense flat icon="delete" @click="deleteUser(props.row)">
                <q-tooltip>Delete</q-tooltip>
              </q-btn>
            </q-td>
          </q-tr>
        </template>
      </q-table>
      <div class="row justify-center q-mt-md">
        <q-pagination
          v-model="pagination.page"
          color="grey-9"
          :max="pagesNumber"
          size="sm"
          direction-links
          :max-pages="10"
        />
      </div>
    </div>
    <q-dialog v-model="passwordDialogOpen">
      <q-card class="q-pa-sm">
        <q-card-section>
          <div class="text-h5">Enter Password</div>
        </q-card-section>
        <q-card-section>
          <q-form>
            <q-input
              v-model="userStore.users[userStore.users.length - 1].password"
              label="Password"
              outlined
              autofocus
              type="password"
              :rules="[
                (val) => !!val || 'Required',
                (val) =>
                  val.length >= 8 || 'Password must be at least 8 characters'
              ]"
            />
            <div align="right" class="text-primary q-mt-md">
              <q-btn flat label="Confirm" v-close-popup />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script lang="ts" setup>
import { useUserStore } from 'src/stores/user-store';
import { onMounted, ref, computed } from 'vue';
import { QTable } from 'quasar';
import { User } from '../models/user';
import { api } from '../boot/axios';

const userStore = useUserStore();
let searchFilter = ref('');
let passwordDialogOpen = ref(false);

onMounted(() => {
  userStore.fetchUsers();
});

const columns = [
  {
    name: 'username',
    label: 'Username'
  },
  {
    name: 'email',
    label: 'Email'
  },
  {
    name: 'first_name',
    label: 'First Name'
  },
  {
    name: 'last_name',
    label: 'Last Name'
  },
  {
    name: 'is_active',
    label: 'Active'
  },
  {
    name: 'is_staff',
    label: 'Staff'
  },
  {
    name: 'is_superuser',
    label: 'Superuser'
  },
  {
    name: 'actions'
  }
];

const pagination = ref({
  sortBy: 'desc',
  descending: false,
  page: 1,
  rowsPerPage: 8
});

const table = ref<QTable | null>(null);

let pagesNumber = computed(() => {
  return table.value !== null
    ? Math.ceil(table.value.computedRowsNumber / pagination.value.rowsPerPage)
    : 0;
});

function userEdited(user: User) {
  if (userStore.editedUsers.findIndex((id) => id === user.id) == -1) {
    userStore.editedUsers.push(user.id!);
  }
}

function createUser() {
  const newUser = {
    id: null,
    username: 'newuser',
    email: '-',
    first_name: '',
    last_name: '',
    is_active: true,
    is_staff: false,
    is_superuser: false,
    password: ''
  };
  userStore.users.push(newUser);
  passwordDialogOpen.value = true;
}

function deleteUser(user: User) {
  api.delete(`/users/user/${user.id}/`).then(() => {
    userStore.fetchUsers();
  });
}
</script>
