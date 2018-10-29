<template>
  <v-content>
    <v-container fluid grid-list-md>
      <v-layout v-if="!loading" row justify-space-between wrap>
        <v-flex xs3>
          <v-card>
            <v-list>
              <v-list-tile avatar>
                <v-list-tile-avatar>
                  <img src="/static/img/logo.png" alt="avatar">
                </v-list-tile-avatar>
                <v-list-tile-content>
                  <v-list-tile-title>{{profile.name}}</v-list-tile-title>
                  <v-list-tile-sub-title>@{{profile.username}}<span v-if="profile.followed" class="follow-status">Follows you</span>
                  </v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
              <v-list-tile v-if="user && user.id !== profile.id">
                <v-list-tile-action>
                  <follow-btn :profile="profile" :isFollowing="profile.following"
                              @follow="changeFollowState"></follow-btn>
                </v-list-tile-action>
              </v-list-tile>
            </v-list>
            <v-divider></v-divider>
            <div class="profile-card-stats">
              <ul class="profile-card-stats-list">
                <li class="profile-card-stats-stat">
                  <router-link class="profile-card-stats-link" :to="path">
                    <span class="profile-card-stats-text">Posts</span>
                    <span class="profile-card-stats-text">{{profile.post_count}}</span>
                  </router-link>
                </li>
                <li class="profile-card-stats-stat">
                  <router-link class="profile-card-stats-link" :to="`${path}/following`">
                    <span class="profile-card-stats-text">Following</span>
                    <span class="profile-card-stats-text">{{profile.following_count}}</span>
                  </router-link>
                </li>
                <li class="profile-card-stats-stat">
                  <router-link class="profile-card-stats-link" :to="`${path}/followers`">
                    <span class="profile-card-stats-text">Followers</span>
                    <span class="profile-card-stats-text">{{profile.follower_count}}</span>
                  </router-link>
                </li>
              </ul>
            </div>
          </v-card>
        </v-flex>
        <v-flex xs9>
          <router-view></router-view>
        </v-flex>
      </v-layout>
    </v-container>
  </v-content>
</template>

<script>
  import {mapState} from 'vuex';
  import FollowBtn from '@/components/FollowBtn';

  export default {
    name: 'Profile',
    components: {
      'follow-btn': FollowBtn
    },
    data() {
      return {
        loading: true,
        path: ''
      };
    },
    beforeRouteUpdate(to, from, next) {
      this.updatePage(to.params.username)
        .then(() => {
          if (to.name === 'ProfilePosts') {
            return this.$store.dispatch('getUserTimeline');
          }
        })
        .then(next);
    },
    methods: {
      updatePage(username) {
        return this.$store.dispatch('getUserProfile', {username: username})
          .then(() => {
            this.path = `/user/${username}`;
            this.loading = false;
          });
      },
      changeFollowState(state) {
        this.profile.following = state;
        this.$store.dispatch('getUserProfile', {user_id: this.profile.id});
      }
    },
    computed: {
      ...mapState({
        user: state => state.user,
        profile: state => state.userProfile
      })
    },
    created() {
      this.updatePage(this.$route.params.username);
    }
  };
</script>

<style scoped>
  .profile-card-stats {
    padding: 16px;
  }

  .profile-card-stats-list {
    display: table;
    list-style-image: none;
    list-style-position: outside;
    list-style-type: none;
    min-width: 100%;
    table-layout: fixed;
  }

  .profile-card-stats-stat {
    display: table-cell;
    list-style-image: none;
    list-style-position: outside;
    list-style-type: none;
  }

  .profile-card-stats-link {
    display: block;
  }

  .profile-card-stats-text {
    display: block;
  }

  .follow-status {
    padding: 2px 4px 2px 4px;
    margin-left: 2px;
    font-size: 12px;
  }
</style>
