<template>
  <v-dialog v-model="show" max-width="520">
    <v-container grid-list-xs>
      <v-layout v-if="!loading" row wrap>
        <v-flex xs12>
          <post v-if="post" :post="post"></post>
        </v-flex>
        <v-flex xs12>
          <v-card>
            <v-card-text>
              <v-form v-model="validComment" ref="formComment" style="display: inline;" lazy-validation>
                <v-text-field
                  name="commentText"
                  ref="commentTextfield"
                  v-model="commentText"
                  placeholder="Post your reply"
                  :rules="postRules"
                  :counter="postMax"
                  :disabled="commentLoading"
                  no-resize
                ></v-text-field>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-btn
                color="red"
                :loading="commentLoading"
                @click.stop="comment"
                :disabled="!validComment || loading"
              >Post
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-flex>
        <v-flex xs12>
          <v-flex v-for="comment in comments" :key="comment.id" xs12>
            <comment :comment="comment"></comment>
          </v-flex>
        </v-flex>
      </v-layout>
      <v-layout v-else row wrap>
        <v-progress-circular :size="70" :width="7" indeterminate color="red"></v-progress-circular>
      </v-layout>
    </v-container>
  </v-dialog>
</template>

<script>
  import {mapState} from 'vuex';
  import {postRules, postMax} from '../../../common/inputRules';
  import Post from '@/components/Post';
  import Comment from '@/components/Comment';

  export default {
    name: 'PostOverlay',
    components: {
      'post': Post,
      'comment': Comment
    },
    data() {
      return {
        loading: false,
        postRules,
        postMax,
        commentText: '',
        validComment: true,
        commentLoading: false
      };
    },
    methods: {
      comment() {
        if (this.$refs.formComment.validate()) {
          this.commentLoading = true;
          this.$store.dispatch('comment', {post_id: this.post.id, text: this.commentText})
            .then((success) => {
              if (success) {
                // TODO: snackbar ?
                this.commentText = '';
                this.$store.dispatch('getComments', this.post.id);
                this.$store.dispatch('getHomeTimeline');
                if (this.$store.state.userProfile) {
                  this.$store.dispatch('getUserTimeline', this.$store.state.userProfile.id);
                }
                if (this.$store.state.post) {
                  this.$store.dispatch('getPost', this.$store.state.post.id);
                }
              } else {
                // TODO: snackbar ?
              }
              this.commentLoading = false;
            });
        }
      }
    },
    computed: {
      ...mapState({
        post: state => state.post,
        comments: state => state.comments
      }),
      show: {
        get() {
          const value = this.$store.state.postOverlay;
          if (value === true) {
            this.commentText = '';
            // this.loading = true;
            this.$store.dispatch('getComments', this.post.id)
              .then(() => {
                this.loading = false;
              });
          }
          return value;
        },
        set(value) {
          this.$store.commit('togglePostOverlay', value);
        }
      }
    }
  };
</script>

<style scoped>

</style>
