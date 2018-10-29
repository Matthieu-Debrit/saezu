<template>
  <v-card ref="comment">
    <div style="background-color: rgba(40, 40, 100, 0.2)">
      <v-container style="margin-left: 48px; width: auto;">
        <v-card-title class="pt-0">
          <router-link class="author-link" :to='userLink(comment.author_username)' style="overflow: visible;">
            <v-avatar size="48" style="margin-left: -58px;">
              <img src="/static/img/logo.png" alt="avatar">
            </v-avatar>
            <span class="author-name">{{comment.author_name}}</span>
            <span class="author-username">@{{comment.author_username}}</span>
          </router-link>
          <span class="time">
          <v-tooltip top>
            <a slot="activator" class="timestamp">{{comment.created_at | prettyTime('Asia/Shanghai')}}</a>
            <span>{{comment.created_at | prettyDate('Asia/Shanghai')}}</span>
          </v-tooltip>
        </span>
          <span v-if="comment.modified_at" class="modified">
          <v-tooltip top>
            <span slot="activator" class="modified-flag">(modified)</span>
            <span>{{comment.modified_at | prettyTime('Asia/Shanghai')}}</span>
          </v-tooltip>
        </span>
        </v-card-title>
        <v-card-text>
          {{comment.content}}
        </v-card-text>
        <v-card-actions v-if="!noaction">
          <div class="comment-action-item">
            <v-btn v-if="!comment.liked" class="like-btn" @click="likeComment" icon>
              <v-icon class="like-btn-icon">favorite_border</v-icon>
            </v-btn>
            <v-btn v-else class="unlike-btn" @click="unlikeComment" icon>
              <v-icon class="unlike-btn-icon" color="red">favorite</v-icon>
            </v-btn>
            <span v-if="comment.like_count > 0">{{comment.like_count}}</span>
          </div>
          <v-spacer></v-spacer>
          <div class="comment-action-item">
            <v-btn v-if="user && user.id === comment.author_id" @click="editComment" icon>
              <v-icon>edit</v-icon>
            </v-btn>
          </div>
          <div class="comment-action-item">
            <v-btn v-if="user && user.id === comment.author_id" @click="deleteComment" icon>
              <v-icon>delete</v-icon>
            </v-btn>
          </div>
        </v-card-actions>
      </v-container>
    </div>
  </v-card>
</template>

<script>
  import {mapState} from 'vuex';

  export default {
    name: 'Comment',
    props: {
      comment: Object,
      noaction: Boolean
    },
    methods: {
      userLink: username => `/user/${username}`,
      likeComment() {
        if (!this.user) {
          this.$router.push({path: '/login', query: {redirect: this.$route.fullPath}});
          return;
        }
        this.$store.dispatch('likeComment', this.comment.id)
          .then(() => {
            this.$store.dispatch('getComments', this.$store.state.post.id);
          });
      },
      unlikeComment() {
        this.$store.dispatch('unlikeComment', this.comment.id)
          .then(() => {
            this.$store.dispatch('getComments', this.$store.state.post.id);
          });
      },
      editComment() {
        this.$store.commit('setComment', this.comment);
        this.$store.commit('setDialog', {editComment: true});
      },
      deleteComment() {
        this.$store.commit('setComment', this.comment);
        this.$store.commit('setDialog', {deleteComment: true});
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
  .author-username {
    color: lightgrey;
  }

  .author-name {
    color: white;
    font-weight: bold;
  }

  .author-link {
    margin-right: 5px;
    text-decoration: none;
  }

  .author-link:hover > .author-name {
    text-decoration: underline;
    color: #f44336;
  }

  .comment-action-item {
    min-width: 80px;
  }

  .like-btn:hover .like-btn-icon {
    color: #f44336;
  }

  .time {
    margin-right: 5px;
    color: lightgrey;
  }

  .time::before {
    content: " - ";
  }

  .timestamp {
    text-decoration: none;
    color: inherit;
  }

  .timestamp:hover {
    text-decoration: underline;
    color: #f44336;
  }

  .modified {
    color: grey;
    font-size: 9px;
  }
</style>
