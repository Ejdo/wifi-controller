<template>
  <div class="q-pa-md shadow-2">
    <q-table
      :columns="columns"
      :rows="accesPoints"
      :filter="searchFilter"
      row-key="name"
      v-model:pagination="pagination"
      hide-pagination
      flat
      ref="apTable"
    >
      <template v-slot:top>
        <h5 class="q-ma-sm">Access Points</h5>
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
          <q-td key="name" :props="props" class="text-weight-bold">
            {{ props.row.name }}
            <q-popup-edit
              v-model="props.row.name"
              v-slot="scope"
              title="Edit name"
              @save="(name) => updateApName(props.row, name)"
            >
              <q-input
                v-model="scope.value"
                dense
                autofocus
                @keyup.enter="scope.set"
                :rules="[(val) => !!val || 'Required']"
              />
            </q-popup-edit>
          </q-td>
          <q-td key="last_ip" :props="props">
            <a :href="'http://' + props.row.last_ip" class="text-secondary">
              {{ props.row.last_ip }}
            </a>
          </q-td>
          <q-td key="model" :props="props">
            {{ props.row.model }}
          </q-td>
          <q-td key="config" :props="props">
            <q-icon
              v-if="props.row.config.status == 'applied'"
              name="check"
              color="green"
              size="sm"
            >
              <q-tooltip> Applied </q-tooltip>
            </q-icon>
            <q-icon
              v-else-if="props.row.config.status == 'error'"
              name="error"
              color="red"
              size="sm"
            >
              <q-tooltip> Error </q-tooltip>
            </q-icon>
            <q-icon
              v-else-if="props.row.config.status == 'modified'"
              name="hourglass_empty"
              color="orange"
              size="sm"
            >
              <q-tooltip> Applying </q-tooltip>
            </q-icon>
          </q-td>
          <q-td auto-width>
            <q-btn
              size="sm"
              color="accent"
              round
              dense
              @click="loadApDetails(props.row)"
              icon="chevron_right"
            >
              <q-tooltip> Details </q-tooltip>
            </q-btn>
          </q-td>
        </q-tr>
        <q-tr v-show="props.expand" :props="props">
          <q-td colspan="100%"> </q-td>
        </q-tr>
      </template>
    </q-table>
    <div class="row justify-center q-mt-md">
      <q-pagination
        v-model="pagination.page"
        color="accent"
        :max="pagesNumber"
        size="sm"
        direction-links
        :max-pages="10"
      />
    </div>
  </div>
  <q-dialog v-model="detailsDialogOpen">
    <q-card style="min-width: 700px" class="q-pa-sm">
      <q-card-section>
        <div class="text-h5">{{ selectedAp.name }}</div>
      </q-card-section>

      <q-card-section class="q-pt-none horizontal row">
        <q-card-section class="col">
          <q-list bordered padding style="height: 100%">
            <q-item>
              <q-item-label class="text-subtitle1">2.4 GHz Radio</q-item-label>
            </q-item>
            <q-separator />
            <q-item>
              <q-item-label class="q-py-sm text-subtitle2"
                >Radio Settings
              </q-item-label>
            </q-item>
            <q-item>
              <q-item-section>Channel</q-item-section>
              <q-item-section>
                <q-select
                  v-model="selectedAp.config.config.radios[1].channel"
                  :options="channelOptions2g"
                  emit-value
                />
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>Channel Width</q-item-section>
              <q-item-section>
                <q-select
                  v-model="selectedAp.config.config.radios[1].channel_width"
                  :options="['20', '40']"
                  emit-value
                />
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>TX Power</q-item-section>
              <q-item-section>
                <q-slider
                  v-model="selectedAp.config.config.radios[1].tx_power"
                  label
                  :label-value="
                    'TX Power: ' +
                    selectedAp.config.config.radios[1].tx_power +
                    ' dBm'
                  "
                  :min="0"
                  :max="20"
                />
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>Disabled</q-item-section>
              <q-item-section>
                <q-toggle
                  v-model="selectedAp.config.config.radios[1].disabled"
                />
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item>
              <q-item-section class="col-3">
                <q-item-label class="text-subtitle2">SSIDs:</q-item-label>
              </q-item-section>
              <q-item-section class="col-8">
                <q-chip
                  v-for="ssid in getWifiInterfaces(selectedAp, '2g')"
                  v-bind:key="ssid.id"
                  color="primary"
                  text-color="white"
                  icon="wifi"
                  removable
                  @remove="removeWifiFromAp(ssid)"
                >
                  {{ ssid.config.interfaces[0].wireless.ssid }}
                </q-chip>
                <q-chip
                  outline
                  clickable
                  :icon="add2gOpen ? 'expand_more' : 'add'"
                  color="primary"
                  @click="add2gOpen = !add2gOpen"
                >
                  Add WiFi Network
                </q-chip>
                <q-list separator bordered v-if="add2gOpen" class="q-mt-sm">
                  <q-item
                    clickable
                    ripple
                    v-for="wifi in getWifiInterfaces(null, '2g').filter(
                      (wifi) => !selectedAp.config.templates?.includes(wifi.id)
                    )"
                    v-bind:key="wifi.id"
                    @click="addAp(wifi)"
                  >
                    {{ wifi.config.interfaces[0].wireless.ssid }}
                  </q-item>
                </q-list>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-section class="col">
          <q-list bordered padding style="height: 100%">
            <q-item>
              <q-item-label class="text-subtitle1">5 GHz Radio</q-item-label>
            </q-item>
            <q-separator />
            <q-item>
              <q-item-label class="q-py-sm text-subtitle2"
                >Radio Settings
              </q-item-label>
            </q-item>

            <q-item>
              <q-item-section>Channel</q-item-section>
              <q-item-section>
                <q-select
                  v-model="selectedAp.config.config.radios[0].channel"
                  :options="channelOptions5g"
                  emit-value
                />
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>Channel Width</q-item-section>
              <q-item-section>
                <q-select
                  v-model="selectedAp.config.config.radios[0].channel_width"
                  :options="['20', '40', '80', '160']"
                  emit-value
                />
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>TX Power</q-item-section>
              <q-item-section>
                <q-slider
                  v-model="selectedAp.config.config.radios[0].tx_power"
                  label
                  :label-value="
                    'TX Power: ' +
                    selectedAp.config.config.radios[0].tx_power +
                    ' dBm'
                  "
                  :min="0"
                  :max="23"
                />
              </q-item-section>
            </q-item>
            <q-item>
              <q-item-section>Disabled</q-item-section>
              <q-item-section>
                <q-toggle
                  v-model="selectedAp.config.config.radios[0].disabled"
                />
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item>
              <q-item-section class="col-3">
                <q-item-label class="text-subtitle2">SSIDs:</q-item-label>
              </q-item-section>
              <q-item-section class="col-8">
                <q-chip
                  v-for="ssid in getWifiInterfaces(selectedAp, '5g')"
                  v-bind:key="ssid.id"
                  color="primary"
                  text-color="white"
                  icon="wifi"
                  removable
                  @remove="removeWifiFromAp(ssid)"
                >
                  {{ ssid.config.interfaces[0].wireless.ssid }}
                </q-chip>
                <q-chip
                  outline
                  clickable
                  :icon="add5gOpen ? 'expand_more' : 'add'"
                  color="primary"
                  @click="add5gOpen = !add5gOpen"
                >
                  Add WiFi Network
                </q-chip>
                <q-list separator bordered v-if="add5gOpen" class="q-mt-sm">
                  <q-item
                    clickable
                    ripple
                    v-for="wifi in getWifiInterfaces(null, '5g').filter(
                      (wifi) => !selectedAp.config.templates?.includes(wifi.id)
                    )"
                    v-bind:key="wifi.id"
                    @click="addAp(wifi)"
                  >
                    {{ wifi.config.interfaces[0].wireless.ssid }}
                  </q-item>
                </q-list>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" v-close-popup />
        <q-btn
          flat
          label="Save"
          color="primary"
          v-close-popup
          @click="updateApDetails"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, PropType } from 'vue';
import { AccessPoint } from 'src/models/accessPoint';
import { QTable } from 'quasar';
import { useTemplateStore } from 'src/stores/template-store';
import { useAccessPointsStore } from 'src/stores/access-points-store';
import { api } from 'boot/axios';
import { Template } from 'src/models/template';

defineProps({
  accesPoints: Array as PropType<AccessPoint[]>
});

const columns = [
  {
    name: 'name',
    label: 'Name'
  },
  {
    name: 'last_ip',
    label: 'IP Address'
  },
  {
    name: 'model',
    label: 'Access Point Model'
  },
  {
    name: 'config',
    label: 'Config Status'
  }
];

const pagination = ref({
  sortBy: 'desc',
  descending: false,
  page: 1,
  rowsPerPage: 8
});

const apTable = ref<QTable | null>(null);

const templateStore = useTemplateStore();
const accessPointsStore = useAccessPointsStore();

let detailsDialogOpen = ref(false);
let selectedAp = ref({} as AccessPoint);

let add2gOpen = ref(false);
let add5gOpen = ref(false);

let pagesNumber = computed(() => {
  return apTable.value !== null
    ? Math.ceil(apTable.value.computedRowsNumber / pagination.value.rowsPerPage)
    : 0;
});

function getWifiInterfaces(ap: AccessPoint | null, band: '2g' | '5g') {
  if (ap === null) {
    return templateStore.templates.filter(
      (template) =>
        template.name.includes('wifi') && template.name.includes(band)
    );
  }
  if (ap.config.templates != null) {
    return templateStore.templates.filter(
      (template) =>
        template.name.includes('wifi') &&
        template.name.includes(band) &&
        ap.config.templates?.includes(template.id)
    );
  } else {
    return [];
  }
}

async function loadApDetails(ap: AccessPoint) {
  const selectedApId = await accessPointsStore.fetchAccessPointDetails(ap.id);
  selectedAp.value = accessPointsStore.accessPoints[selectedApId];
  if (
    !selectedAp.value.config.config ||
    !selectedAp.value.config.config.hasOwnProperty('radios') ||
    selectedAp.value.config.config.radios?.length == 0
  ) {
    selectedAp.value.config.config.radios = [
      {
        protocol: '802.11ac',
        name: 'radio0',
        channel: 36,
        channel_width: 80,
        tx_power: 23,
        disabled: false
      },
      {
        protocol: '802.11n',
        name: 'radio1',
        channel: 1,
        channel_width: 20,
        tx_power: 20,
        disabled: false
      }
    ];
  }
  detailsDialogOpen.value = true;
}

async function updateApDetails(): Promise<void> {
  if (selectedAp.value) {
    await api.put(
      `/controller/device/${selectedAp.value.id}/`,
      selectedAp.value
    );
  }
}

function updateApName(ap: AccessPoint, name: string) {
  console.log(ap);
  const body = {
    name: name
  };
  api.patch(`/controller/device/${ap.id}/`, body);
}

function removeWifiFromAp(wifi: Template) {
  selectedAp.value.config.templates?.splice(
    selectedAp.value.config.templates.findIndex(
      (template) => template === wifi.id
    ),
    1
  );
}

function addAp(wifi: Template) {
  selectedAp.value.config.templates?.push(wifi.id);
}

const channelOptions2g = [
  { label: 'auto', value: '0' },
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4', value: 4 },
  { label: '5', value: 5 },
  { label: '6', value: 6 },
  { label: '7', value: 7 },
  { label: '8', value: 8 },
  { label: '9', value: 9 },
  { label: '10', value: 10 },
  { label: '11', value: 11 },
  { label: '12', value: 12 },
  { label: '13', value: 13 }
];

const channelOptions5g = [
  { label: 'auto', value: '0' },
  { label: '36', value: 36 },
  { label: '40', value: 40 },
  { label: '44', value: 44 },
  { label: '48', value: 48 },
  { label: '52', value: 52 },
  { label: '56', value: 56 },
  { label: '60', value: 60 },
  { label: '64', value: 64 },
  { label: '100', value: 100 },
  { label: '104', value: 104 },
  { label: '108', value: 108 },
  { label: '112', value: 112 },
  { label: '116', value: 116 },
  { label: '120', value: 120 },
  { label: '124', value: 124 },
  { label: '128', value: 128 },
  { label: '132', value: 132 },
  { label: '136', value: 136 },
  { label: '140', value: 140 }
];

let searchFilter = ref('');
</script>
