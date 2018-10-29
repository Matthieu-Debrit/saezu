<template>
  <user-list v-if="!loading" :users="users"></user-list>
  <v-container v-else text-xs-center>
    <v-progress-circular :size="70" :width="7" indeterminate color="red"></v-progress-circular>
  </v-container>
</template>

<script>
  import {serverAPI} from '@/api';
  import UserList from '@/components/UserList';

  export default {
    name: 'Search',
    components: {
      'user-list': UserList
    },
    data() {
      return {
        loading: true,
        users: []
      };
    },
    methods: {
      search(query) {
        if (!query) {
          this.loading = false;
          return;
        }
        return serverAPI.get(`/search?q=${encodeURIComponent(query)}`)
          .then(response => {
            this.users = response.data.data;
            this.loading = false;
          })
          .catch(error => {
            console.error(error);
            this.$store.commit('setError', error.response.data.message);
            this.loading = false;
          });
      }
    },
    created() {
      this.search(this.$route.query.q);
    },
    beforeRouteUpdate(to, from, next) {
      this.loading = true;
      this.search(to.query.q)
        .then(next);
    }
  };
</script>
