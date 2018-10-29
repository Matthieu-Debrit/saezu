<template>
  <div>
    <v-toolbar
      color="red"
      dense
      fixed
      app
      style="z-index: 10;"
    >
      <v-icon class="mx-3">star</v-icon>
      <v-toolbar-title class="mr-5 align-center">
        <router-link class="title" to="/">Saezu</router-link>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-layout row align-center style="max-width: 650px">
        <v-text-field
          ref="searchBar"
          placeholder="Search..."
          single-line
          append-icon="search"
          :append-icon-cb="goToSearchPage"
          @keyup.native.enter="goToSearchPage"
          v-model="search"
          color="white"
          hide-details
        ></v-text-field>
        <div v-if="user">
          <v-menu
            v-model="userMenu"
            bottom
            offset-y
            nudge-top="-6"
            v-if="user"
          >
            <v-btn icon slot="activator">
              <v-avatar size="36">
                <img src="/static/img/logo.png" alt="avatar">
              </v-avatar>
            </v-btn>
            <v-card>
              <v-list>
                <v-list-tile>
                  <v-list-tile-content>
                    <v-list-tile-title>{{user.name}}</v-list-tile-title>
                    <v-list-tile-sub-title>@{{user.username}}</v-list-tile-sub-title>
                  </v-list-tile-content>
                </v-list-tile>
              </v-list>
              <v-divider></v-divider>
              <v-list>
                <v-list-tile v-for="item in userMenuItems" :key="item.title" @click="item.click" :to="item.to">
                  <v-list-tile-action v-if="item.icon">
                    <v-icon>{{item.icon}}</v-icon>
                  </v-list-tile-action>
                  <v-list-tile-content>
                    <v-list-tile-title>{{item.title}}</v-list-tile-title>
                  </v-list-tile-content>
                </v-list-tile>
              </v-list>
            </v-card>
          </v-menu>
          <v-btn @click.stop="$store.commit('setDialog', {post: true})" round>Post</v-btn>
        </div>
        <v-btn v-else :to="{path: '/login', query: {redirect: this.$route.fullPath}}" round>Login</v-btn>
      </v-layout>
    </v-toolbar>
    <---------- DIALOGS ---------->
    <post-overlay></post-overlay>
    <post-dialog></post-dialog>
    <edit-post-dialog></edit-post-dialog>
    <delete-post-dialog></delete-post-dialog>
    <edit-comment-dialog></edit-comment-dialog>
    <delete-comment-dialog></delete-comment-dialog>
    <error-alert></error-alert>
    <v-content>
      <router-view></router-view>
    </v-content>
  </div>
</template>

<script>
  import {mapState} from 'vuex';
  import PostOverlay from '@/components/PostOverlay';
  import PostDialog from '@/components/PostDialog';
  import EditPostDialog from '@/components/EditPostDialog';
  import DeletePostDialog from '@/components/DeletePostDialog';
  import EditCommentDialog from '@/components/EditCommentDialog';
  import DeleteCommentDialog from '@/components/DeleteCommentDialog';
  import ErrorAlert from '@/components/ErrorAlert';

  export default {
    name: 'Main',
    components: {
      'post-overlay': PostOverlay,
      'post-dialog': PostDialog,
      'edit-post-dialog': EditPostDialog,
      'delete-post-dialog': DeletePostDialog,
      'edit-comment-dialog': EditCommentDialog,
      'delete-comment-dialog': DeleteCommentDialog,
      'error-alert': ErrorAlert
    },
    data() {
      return {
        alert: true,
        search: '',
        userMenu: false,
        userMenuItems: [
          {
            title: 'Profile',
            icon: 'account_box',
            click: () => {
            },
            to: '/user/'
          },
          {
            title: 'Settings',
            icon: 'settings',
            click: () => {
            },
            to: '/settings'
          },
          {
            title: 'Logout',
            icon: 'exit_to_app',
            click: this.logout
          }
        ]
      };
    },
    watch: {
      search(value) {
        this.$store.commit('setSearch', value);
      }
    },
    methods: {
      logout() {
        this.$store.dispatch('logout')
          .then(() => {
            this.$router.push({path: '/login'});
          });
      },
      goToSearchPage() {
        if (this.search.trim().length > 0) {
          this.$router.push({path: '/search', query: {q: encodeURIComponent(this.search)}});
        }
      }
    },
    computed: {
      ...mapState({
        user: state => state.user,
        postDialog: state => state.dialog.post,
        editPostDialog: state => state.dialog.editPost,
        deletePostDialog: state => state.dialog.deletePost
      })
    },
    created() {
      if (this.user) {
        for (let item of this.userMenuItems) {
          if (!item.hasOwnProperty('title') || item.title !== 'Profile') {
            continue;
          }
          item.to = `/user/${this.user.username}`;
          break;
        }
      }
    }
  };
</script>

<style scoped>

</style>
