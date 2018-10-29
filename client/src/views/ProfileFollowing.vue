<template>
  <user-list v-if="!loading" :users="users"></user-list>
  <v-container v-else text-xs-center>
    <v-progress-circular :size="70" :width="7" indeterminate color="red"></v-progress-circular>
  </v-container>
</template>

<script>
  import {mapState} from 'vuex';
  import {serverAPI} from '@/api';
  import UserList from '@/components/UserList';

  export default {
    name: 'ProfileFollowing',
    components: {
      'user-list': UserList
    },
    data() {
      return {
        loading: true,
        users: []
      };
    },
    created() {
      if (!this.profile) {
        this.loading = false;
        return;
      }
      serverAPI.get(`/friends/list?user_id=${this.profile.id}`)
        .then(response => {
          this.users = response.data.data;
          this.loading = false;
        })
        .catch(error => {
          console.error(error);
          this.$store.commit('setError', error.response.data.message);
          this.loading = false;
        });
    },
    computed: {
      ...mapState({
        profile: state => state.userProfile
      })
    }
  };
</script>
