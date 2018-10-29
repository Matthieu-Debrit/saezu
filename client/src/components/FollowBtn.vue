<template>
  <v-btn
    v-if="user && user.id !== profile.id"
    :loading="loading"
    @click.native="followUser"
    :disabled="loading"
    :color="isFollowing ? (hover ? 'error' : 'success') : 'primary'"
    @mouseover="hover = true"
    @mouseleave="hover = false"
  >
    {{isFollowing ? (hover ? 'Unfollow' : 'Following') : 'Follow'}}
    <v-icon right>{{isFollowing ? 'check' : 'rss_feed'}}</v-icon>
  </v-btn>
</template>

<script>
  import {mapState} from 'vuex';

  export default {
    name: 'FollowBtn',
    props: ['profile', 'isFollowing'],
    data() {
      return {
        loading: false,
        hover: false
      };
    },
    methods: {
      followUser() {
        const actionFollow = !this.isFollowing;

        this.loading = true;
        this.$store.dispatch('followUser', {user_id: this.profile.id, actionFollow})
          .then((success) => {
            if (success) {
              this.$emit('follow', actionFollow);
            }
            this.loading = false;
          });
      }
    },
    computed: {
      ...mapState({
        user: state => state.user
      })
    }
  };
</script>

<style scoped>

</style>
