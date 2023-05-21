import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';
import { AccessPoint } from '../models/accessPoint';

export const useAccessPointsStore = defineStore('accessPoints', {
  state: () => ({
    accessPoints: [] as AccessPoint[]
  }),
  getters: {},
  actions: {
    fetchAccessPoints() {
      this.accessPoints = [];
      api.get('/controller/device/').then((response) => {
        this.accessPoints = response.data.results;
      });
    },
    async fetchAccessPointDetails(id: string): Promise<number> {
      const response = await api.get(`/controller/device/${id}/`);
      const index = this.accessPoints.findIndex((ap) => ap.id === id);
      this.accessPoints[index] = response.data;
      return index;
    }
  }
});
