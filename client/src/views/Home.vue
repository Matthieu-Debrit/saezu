<template>
  <timeline :loading="loading" :posts="posts" @refresh="refreshTimeline"></timeline>
</template>

<script>
  import {mapState} from 'vuex';
  import Timeline from '@/components/Timeline';

  export default {
    name: 'Home',
    components: {
      'timeline': Timeline
    },
    data() {
      return {
        loading: true
      };
    },
    methods: {
      refreshTimeline(callback) {
        this.$store.dispatch('getHomeTimeline')
          .then(success => {
            if (!success) {
              callback(new Error('Unknown error'));
            }
            callback();
          });
      }
    },
    computed: {
      ...mapState({
        posts: state => state.homeTimeline
      })
    },
    created() {
      this.$store.dispatch('getHomeTimeline', this.$route.params.username)
        .then(() => {
          this.loading = false;
        });
    }
  };
</script>
