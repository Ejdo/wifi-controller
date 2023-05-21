<template>
  <div class="q-pa-md shadow-2">
    <q-table
      :columns="columns"
      :rows="templateStore.getWifiInterfaces"
      :filter="searchFilter"
      row-key="name"
      v-model:pagination="pagination"
      hide-pagination
      flat
      ref="wifiTable"
    >
      <template v-slot:top>
        <q-btn
          dense
          flat
          icon="add"
          label="Create WiFi Network"
          @click="addWifi"
        />
        <q-btn dense flat icon="save" class="q-mx-sm" @click="saveWifiNetworks"
          ><q-tooltip>Save WiFi Networks</q-tooltip></q-btn
        >
        <q-btn dense flat icon="refresh" @click="templateStore.fetchTemplates"
          ><q-tooltip>Refresh</q-tooltip></q-btn
        >
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
          <q-td key="ssid" class="text-weight-bold" :props="props">
            {{ props.row.config.interfaces[0].wireless.ssid }}
            <q-popup-edit
              v-model="props.row.config.interfaces[0].wireless.ssid"
              title="Edit SSID"
              auto-save
              v-slot="scope"
              @save="wifiEdited(props.row)"
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
          <q-td key="band" :props="props">
            <q-btn-toggle
              v-model="props.row.config.interfaces[0].wireless.radio"
              dense
              no-caps
              :options="[
                { label: '5 GHz', value: 'radio0' },
                { label: '2.4 GHz', value: 'radio1' }
              ]"
              @update:model-value="updateTemplateName(props.row)"
            />
          </q-td>
          <q-td
            key="encryption"
            class="text-primary"
            :props="props"
            style="cursor: pointer"
          >
            <q-tooltip>Edit Encryption</q-tooltip>
            {{ props.row.config.interfaces[0].wireless.encryption.protocol }}
            <q-popup-edit
              v-model="props.row.config.interfaces[0].wireless.encryption"
              v-slot="scope"
              title="Edit Encryption"
              @save="wifiEdited(props.row)"
            >
              <q-select
                v-model="scope.value.protocol"
                dense
                :options="['none', 'wpa2_personal', 'wpa2_enterprise']"
                @update:model-value="updateEncryptionModel(props.row, $event)"
              />
              <div
                v-if="scope.value.protocol === 'wpa2_personal'"
                @keyup.enter="wifiEdited(props.row)"
              >
                <q-input
                  v-model="
                    props.row.config.interfaces[0].wireless.encryption.key
                  "
                  dense
                  autofocus
                  label="Password"
                  :rules="[
                    (val) => !!val || 'Required',
                    (val) => val.length >= 8 || 'Minimum 8 characters'
                  ]"
                />
              </div>
              <div
                v-if="scope.value.protocol === 'wpa2_enterprise'"
                @keyup.enter="wifiEdited(props.row)"
              >
                <q-input
                  v-model="
                    props.row.config.interfaces[0].wireless.encryption
                      .auth_server
                  "
                  dense
                  autofocus
                  label="Authentication Server"
                  :rules="[(val) => !!val || 'Required']"
                />
                <q-input
                  v-model="
                    props.row.config.interfaces[0].wireless.encryption
                      .auth_secret
                  "
                  dense
                  autofocus
                  label="Authentication Secret"
                  :rules="[(val) => !!val || 'Required']"
                />
                <q-input
                  v-model="
                    props.row.config.interfaces[0].wireless.encryption
                      .acct_server
                  "
                  dense
                  autofocus
                  label="Accounting Server"
                  :rules="[(val) => !!val || 'Required']"
                />
                <q-input
                  v-model="
                    props.row.config.interfaces[0].wireless.encryption
                      .acct_secret
                  "
                  dense
                  autofocus
                  label="Accounting Secret"
                  :rules="[(val) => !!val || 'Required']"
                />
              </div>
            </q-popup-edit>
          </q-td>
          <q-td key="disabled" :props="props">
            <q-toggle
              v-model="props.row.config.interfaces[0].disabled"
              :true-value="false"
              :false-value="true"
              keep-color
              :color="
                props.row.config.interfaces[0].disabled
                  ? 'negative'
                  : 'positive'
              "
              @update:model-value="wifiEdited(props.row)"
            />
          </q-td>

          <q-td key="ft" :props="props">
            <q-toggle
              v-model="props.row.config.interfaces[0].wireless.ieee80211r"
              keep-color
              :color="
                props.row.config.interfaces[0].wireless.ieee80211r
                  ? 'positive'
                  : 'negative'
              "
              @update:model-value="wifiEdited(props.row)"
            >
              <q-tooltip>Enables 802.11r fast transition</q-tooltip>
            </q-toggle>
          </q-td>
          <q-td key="isolate" :props="props">
            <q-toggle
              v-model="props.row.config.interfaces[0].wireless.isolate"
              keep-color
              :color="
                props.row.config.interfaces[0].wireless.isolate
                  ? 'positive'
                  : 'negative'
              "
              @update:model-value="wifiEdited(props.row)"
            >
              <q-tooltip>Can clients see each other</q-tooltip>
            </q-toggle>
          </q-td>
          <q-td key="required" :props="props">
            <q-checkbox
              v-model="props.row.required"
              @update:model-value="wifiEdited(props.row)"
            >
              <q-tooltip>Enable on all access points</q-tooltip>
            </q-checkbox>
          </q-td>
          <q-td>
            <q-btn dense flat icon="delete" @click="deleteTemplate(props.row)">
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Template } from 'src/models/template';
import { QTable } from 'quasar';
import { useTemplateStore } from 'src/stores/template-store';
import { api } from 'src/boot/axios';

const templateStore = useTemplateStore();

onMounted(() => {
  templateStore.fetchTemplates();
});

const columns = [
  {
    name: 'ssid',
    label: 'SSID'
  },
  {
    name: 'band',
    label: 'Band'
  },
  {
    name: 'encryption',
    label: 'Encryption'
  },
  {
    name: 'disabled',
    label: 'Enabled'
  },
  {
    name: 'ft',
    label: 'Fast Transition'
  },
  {
    name: 'isolate',
    label: 'Isolate Clients'
  },
  {
    name: 'required',
    label: 'Required'
  }
];

const pagination = ref({
  sortBy: 'desc',
  descending: false,
  page: 1,
  rowsPerPage: 8
});

const wifiTable = ref<QTable | null>(null);
let searchFilter = ref('');

let pagesNumber = computed(() => {
  return wifiTable.value !== null
    ? Math.ceil(
        wifiTable.value.computedRowsNumber / pagination.value.rowsPerPage
      )
    : 0;
});

function addWifi() {
  let date = new Date();
  let newWifi = {
    id: null,
    name: '2gwifi' + ' ' + date.getTime(),
    organization: null,
    type: 'generic',
    backend: 'netjsonconfig.OpenWrt',
    default: false,
    required: false,
    config: {
      interfaces: [
        {
          wireless: {
            network: ['lan'],
            mode: 'access_point',
            radio: 'radio1',
            ssid: 'SSID',
            encryption: {
              protocol: 'none'
            },
            ieee80211r: true,
            isolate: false
          },
          type: 'wireless',
          name: date.getTime().toString(),
          disabled: false
        }
      ]
    }
  };
  templateStore.templates.push(newWifi);
}

function saveWifiNetworks() {
  for (let template of templateStore.templates) {
    if (template.id === null) {
      template.id = '';
      api
        .post('/controller/template/', template)
        .then(() => templateStore.fetchTemplates())
        .catch((error) => console.log(error));
    }
  }

  for (let templateId of templateStore.editedTemplates) {
    const template = templateStore.templates.find(
      (template) => template.id === templateId
    );
    console.log(template);
    if (template) {
      api.put(`/controller/template/${template.id}/`, template);
    }
  }
}

function wifiEdited(wifi: Template) {
  if (templateStore.editedTemplates.findIndex((id) => id === wifi.id) == -1) {
    templateStore.editedTemplates.push(wifi.id!);
  }
}

function updateTemplateName(wifi: Template) {
  if (wifi.config.interfaces[0].wireless.radio === 'radio0') {
    wifi.name = '5gwifi' + ' ' + new Date().getTime();
  } else {
    wifi.name = '2gwifi' + ' ' + new Date().getTime();
  }

  wifiEdited(wifi);
}

function updateEncryptionModel(wifi: Template, protocol: string) {
  if (protocol === 'none')
    wifi.config.interfaces[0].wireless.encryption = { protocol: 'none' };
  else if (protocol === 'wpa2_personal')
    wifi.config.interfaces[0].wireless.encryption = {
      protocol: 'wpa2_personal',
      key: '',
      cipher: 'auto'
    };
  else if (protocol === 'wpa2_enterprise')
    wifi.config.interfaces[0].wireless.encryption = {
      protocol: 'wpa2_enterprise',
      auth_server: '',
      auth_secret: '',
      acct_server: '',
      acct_secret: '',
      key: 'testing123',
      server: '192.168.0.1'
    };
  wifiEdited(wifi);
}

function deleteTemplate(wifi: Template) {
  if (wifi.id !== null) {
    api
      .delete(`/controller/template/${wifi.id}/`)
      .then(() => templateStore.fetchTemplates())
      .catch((error) => console.log(error));
  } else {
    templateStore.templates.splice(templateStore.templates.indexOf(wifi), 1);
  }
}
</script>
