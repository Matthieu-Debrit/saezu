<template>
  <v-dialog v-model="show" max-width="520">
    <v-card>
      <v-toolbar color="red">
        <v-btn icon @click.native="show = false" dark>
          <v-icon>close</v-icon>
        </v-btn>
        <v-toolbar-title class="mr-5 align-center">
          <span class="title">Are you sure you want to delete this post?</span>
        </v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <post v-if="post" :post="post" noaction></post>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn flat @click.native="show = false">Cancel</v-btn>
        <v-btn color="red" @click.native="deletePost">Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
  import {mapState} from 'vuex';
  import Post from '@/components/Post';

  export default {
    name: 'DeletePostDialog',
    components: {
      'post': Post
    },
    data() {
      return {
        loading: false
      };
    },
    methods: {
      deletePost() {
        this.loading = true;
        this.$store.dispatch('deletePost', this.post.id)
          .then((success) => {
            if (success) {
              // TODO: snackbar ?
              this.show = false;
              this.$store.dispatch('getHomeTimeline');
              if (this.$store.state.userProfile) {
                this.$store.dispatch('getUserTimeline', this.$store.state.userProfile.id);
              }
            } else {
              // TODO: snackbar ?
            }
            this.loading = false;
          });
      }
    },
    computed: {
      ...mapState({
        post: state => state.post
      }),
      show: {
        get() {
          return this.$store.state.dialog.deletePost;
        },
        set(value) {
          this.$store.commit('setDialog', {deletePost: value});
        }
      }
    }
  };
</script>
