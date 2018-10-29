<template>
  <v-dialog v-model="show" max-width="520">
    <v-card>
      <v-toolbar color="red">
        <v-btn icon @click.native="show = false" dark>
          <v-icon>close</v-icon>
        </v-btn>
        <v-toolbar-title class="mr-5 align-center">
          <span class="title">Edit comment</span>
        </v-toolbar-title>
      </v-toolbar>
      <v-card-text>
        <v-form v-model="validComment" ref="formComment" lazy-validation>
          <v-text-field
            name="commentText"
            ref="commentTextfield"
            v-model="commentText"
            placeholder="What's happening ?"
            :rules="commentRules"
            :counter="commentMax"
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
          @click.stop="editComment"
          :disabled="!validComment || loading"
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
  import {commentRules, commentMax} from '../../../common/inputRules';

  export default {
    name: 'EditCommentDialog',
    data() {
      return {
        commentRules,
        commentMax,
        commentText: '',
        validComment: true,
        loading: false
      };
    },
    methods: {
      editComment() {
        if (this.$refs.formComment.validate()) {
          this.loading = true;
          this.$store.dispatch('editComment', {id: this.comment.id, text: this.commentText})
            .then((success) => {
              if (success) {
                // TODO: snackbar ?
                this.show = false;
                this.$store.dispatch('getComments', this.$store.state.post.id);
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
        comment: state => state.comment,
        content: state => (state.comment ? state.comment.content : '')
      }),
      show: {
        get() {
          const value = this.$store.state.dialog.editComment;
          if (value === true && this.isOpen === false) {
            this.commentText = this.content;
            this.$nextTick(this.$refs.commentTextfield.focus);
          }
          this.isOpen = value;
          return value;
        },
        set(value) {
          this.isOpen = value;
          this.$store.commit('setDialog', {editComment: value});
        }
      }
    }
  };
</script>
