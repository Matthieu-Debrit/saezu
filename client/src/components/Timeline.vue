<template>
  <v-content>
    <v-container fluid grid-list-xs>
      <v-layout row wrap>
        <v-flex style="position: relative;">
          <v-btn
            absolute
            dark
            fab
            bottom
            right
            color="red"
            :disabled="waitTimeline"
            @click.stop="onRefresh"
          >
            <v-progress-circular v-if="waitTimeline" indeterminate></v-progress-circular>
            <v-icon v-else>refresh</v-icon>
          </v-btn>
        </v-flex>
        <v-flex v-if="!loading" v-for="post in posts" :key="post.id" xs12>
          <post :post="post"></post>
        </v-flex>
        <v-flex v-if="loading">
          <v-progress-circular :size="70" :width="7" indeterminate color="red"></v-progress-circular>
        </v-flex>
      </v-layout>
    </v-container>
  </v-content>
</template>

<script>
  import Post from '@/components/Post';

  export default {
    name: 'Timeline',
    components: {
      'post': Post
    },
    props: ['loading', 'posts'],
    data() {
      return {
        waitTimeline: false,
        error: null
      };
    },
    methods: {
      onRefresh() {
        this.waitTimeline = true;
        this.$emit('refresh', (error) => {
          if (error) {
            this.error = this;
          }
          this.waitTimeline = false;
        });
      }
    }
  };
</script>
