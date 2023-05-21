import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';
import { User } from '../models/user';

export const useUserStore = defineStore('users', {
  state: () => ({
    users: [] as User[],
    editedUsers: [] as string[]
  }),
  getters: {},
  actions: {
    fetchUsers() {
      api.get('/users/user/').then((response) => {
        this.users = response.data.results;
      });
    },
    saveUsers() {
      for (const user of this.users) {
        if (user.id === null) {
          user.id = '';
          api
            .post('/users/user/', user)
            .then(() => this.fetchUsers())
            .catch((error) => console.log(error));
        }
      }

      for (const userId of this.editedUsers) {
        const user = this.users.find((user) => user.id === userId);
        if (user) {
          api.put(`/users/user/${user.id}/`, user);
        }
      }
    }
  }
});
