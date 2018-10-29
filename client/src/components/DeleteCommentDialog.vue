<template>
  <v-dialog v-model="show" max-width="520">
    <v-card>
      <v-toolbar color="red">
        <v-btn icon @click.native="show = false" dark>
          <v-icon>close</v-icon>
        </v-btn>
        <v-toolbar-title class="mr-5 align-center">
          <span class="title">Are you sure you want to delete this comment?</span>
        </v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <comment v-if="comment" :comment="comment" noaction></comment>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn flat @click.native="show = false">Cancel</v-btn>
        <v-btn color="red" @click.native="deleteComment">Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
  import {mapState} from 'vuex';
  import Comment from '@/components/Comment';

  export default {
    name: 'DeleteCommentDialog',
    components: {
      'comment': Comment
    },
    data() {
      return {
        loading: false
      };
    },
    methods: {
      deleteComment() {
        this.loading = true;
        this.$store.dispatch('deleteComment', this.comment.id)
          .then((success) => {
            if (success) {
              // TODO: snackbar ?
              this.show = false;
              this.$store.dispatch('getComments', this.$store.state.post.id);
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
        comment: state => state.comment
      }),
      show: {
        get() {
          return this.$store.state.dialog.deleteComment;
        },
        set(value) {
          this.$store.commit('setDialog', {deleteComment: value});
        }
      }
    }
  };
</script>
