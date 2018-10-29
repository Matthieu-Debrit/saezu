<template>
  <v-dialog v-model="show" max-width="520">
    <v-card>
      <v-toolbar color="red">
        <v-btn icon @click.native="show = false" dark>
          <v-icon>close</v-icon>
        </v-btn>
        <v-toolbar-title class="mr-5 align-center">
          <span class="title">Edit post</span>
        </v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <v-form v-model="validPost" ref="formPost" lazy-validation>
          <v-text-field
            name="postText"
            ref="postTextfield"
            v-model="postText"
            placeholder="What's happening ?"
            :rules="postRules"
            :counter="postMax"
            :disabled="loading"
            box
            no-resize
            multi-line
          ></v-text-field>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn
          color="red"
          @click.stop="editPost"
          :disabled="!validPost || loading"
        >
          <v-progress-circular v-if="loading" indeterminate></v-progress-circular>
          <span v-else>Edit</span>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
  import {mapState} from 'vuex';
  import {postRules, postMax} from '../../../common/inputRules';

  export default {
    name: 'EditPostDialog',
    data() {
      return {
        postRules,
        postMax,
        postText: '',
        validPost: true,
        loading: false
      };
    },
    methods: {
      editPost() {
        if (this.$refs.formPost.validate()) {
          this.loading = true;
          this.$store.dispatch('editPost', {id: this.post.id, text: this.postText})
            .then((success) => {
              if (success) {
                // TODO: snackbar ?
                this.show = false;
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
              this.loading = false;
            });
        }
      }
    },
    computed: {
      ...mapState({
        post: state => state.post,
        content: state => (state.post ? state.post.content : '')
      }),
      show: {
        get() {
          const value = this.$store.state.dialog.editPost;
          if (value === true && this.isOpen === false) {
            this.postText = this.content;
            this.$nextTick(this.$refs.postTextfield.focus);
          }
          this.isOpen = value;
          return value;
        },
        set(value) {
          this.isOpen = value;
          this.$store.commit('setDialog', {editPost: value});
        }
      }
    }
  };
</script>
