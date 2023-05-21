import { defineStore } from 'pinia';
import { Template } from '../models/template';
import { api } from '../boot/axios';

export const useTemplateStore = defineStore('templates', {
  state: () => ({
    templates: [] as Template[],
    editedTemplates: [] as string[],
    loading: false
  }),
  getters: {
    getWifiInterfaces(state): Template[] {
      return state.templates.filter((template) =>
        template.name.includes('wifi')
      );
    }
  },
  actions: {
    async fetchTemplates() {
      this.loading = true;
      await api.get('/controller/template/').then((response) => {
        this.templates = response.data.results;
        this.loading = false;
      });
    }
  }
});
