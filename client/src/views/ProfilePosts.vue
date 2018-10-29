<template>
  <timeline :loading="loading" :posts="posts" @refresh="updateTimeline"></timeline>
</template>

<script>
  import {mapGetters} from 'vuex';
  import Timeline from '@/components/Timeline';

  export default {
    name: 'ProfilePosts',
    components: {
      'timeline': Timeline
    },
    data() {
      return {
        loading: false
      };
    },
    methods: {
      updateTimeline(callback) {
        this.$store.dispatch('getUserTimeline')
          .then(success => {
            if (!success) {
              callback(new Error('Unknown error'));
            }
            callback();
          });
      }
    },
    computed: {
      ...mapGetters({
        posts: 'userTimeline'
      })
    }
  };
</script>

<style scoped>

</style>
