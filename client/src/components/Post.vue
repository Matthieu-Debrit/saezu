<template>
  <v-card ref="post">
    <v-container style="margin-left: 48px; width: auto;">
      <v-card-title class="pt-0">
        <router-link class="author-link" :to='userLink(post.author_username)' style="overflow: visible;">
          <v-avatar size="48" style="margin-left: -58px;">
            <img src="/static/img/logo.png" alt="avatar">
          </v-avatar>
          <span class="author-name">{{post.author_name}}</span>
          <span class="author-username">@{{post.author_username}}</span>
        </router-link>
        <span class="time">
          <v-tooltip top>
            <a @click.stop="showPostOverlay" slot="activator" class="timestamp">{{post.created_at | prettyTime('Asia/Shanghai')}}</a>
            <span>{{post.created_at | prettyDate('Asia/Shanghai')}}</span>
          </v-tooltip>
        </span>
        <span v-if="post.modified_at" class="modified">
          <v-tooltip top>
            <span slot="activator" class="modified-flag">(modified)</span>
            <span>{{post.modified_at | prettyTime('Asia/Shanghai')}}</span>
          </v-tooltip>
        </span>
      </v-card-title>
      <v-card-text>
        {{post.content}}
      </v-card-text>
      <v-card-actions v-if="!noaction">
        <div class="post-action-item">
          <v-btn @click.stop="showPostOverlay" icon>
            <v-icon>chat_bubble_outline</v-icon>
          </v-btn>
          <span v-if="post.comment_count > 0">{{post.comment_count}}</span>
        </div>
        <div class="post-action-item">
          <v-btn v-if="!post.liked" class="like-btn" @click="likePost" icon>
            <v-icon class="like-btn-icon">favorite_border</v-icon>
          </v-btn>
          <v-btn v-else class="unlike-btn" @click="unlikePost" icon>
            <v-icon class="unlike-btn-icon" color="red">favorite</v-icon>
          </v-btn>
          <span v-if="post.like_count > 0">{{post.like_count}}</span>
        </div>
        <v-spacer></v-spacer>
        <div class="post-action-item">
          <v-btn v-if="user && user.id === post.author_id" @click="editPost" icon>
            <v-icon>edit</v-icon>
          </v-btn>
        </div>
        <div class="post-action-item">
          <v-btn v-if="user && user.id === post.author_id" @click="deletePost" icon>
            <v-icon>delete</v-icon>
          </v-btn>
        </div>
      </v-card-actions>
    </v-container>
  </v-card>
</template>

<script>
  import {mapState} from 'vuex';

  export default {
    name: 'Post',
    props: {
      post: Object,
      noaction: Boolean
    },
    methods: {
      userLink: username => `/user/${username}`,
      likePost() {
        if (!this.user) {
          this.$router.push({path: '/login', query: {redirect: this.$route.fullPath}});
          return;
        }
        this.post.liked = true;
        this.$store.dispatch('likePost', this.post.id)
          .then(() => {
            this.$store.dispatch('getHomeTimeline');
            if (this.$store.state.userProfile) {
              this.$store.dispatch('getUserTimeline', this.$store.state.userProfile.id);
            }
            if (this.$store.state.post) {
              this.$store.dispatch('getPost', this.$store.state.post.id);
            }
          });
      },
      unlikePost() {
        this.post.liked = false;
        this.$store.dispatch('unlikePost', this.post.id)
          .then(() => {
            this.$store.dispatch('getHomeTimeline');
            if (this.$store.state.userProfile) {
              this.$store.dispatch('getUserTimeline', this.$store.state.userProfile.id);
            }
            if (this.$store.state.post) {
              this.$store.dispatch('getPost', this.$store.state.post.id);
            }
          });
      },
      editPost() {
        this.$store.commit('setPost', this.post);
        this.$store.commit('setDialog', {editPost: true});
      },
      deletePost() {
        this.$store.commit('setPost', this.post);
        this.$store.commit('setDialog', {deletePost: true});
      },
      showPostOverlay() {
        this.$store.commit('setPost', this.post);
        this.$store.commit('togglePostOverlay', true);
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

  .post-action-item {
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
