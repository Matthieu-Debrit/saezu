<template>
  <v-card>
    <v-list>
      <v-list-tile avatar>
        <v-list-tile-avatar>
          <img src="/static/img/logo.png" alt="avatar">
        </v-list-tile-avatar>
        <v-list-tile-content>
          <v-list-tile-title>
            <router-link class="username-link" :to="`/user/${profile.username}`">{{profile.name}}</router-link>
          </v-list-tile-title>
          <v-list-tile-sub-title>
            <span class="at-name">@<router-link class="name-link"
                                                :to="`/user/${profile.username}`">{{profile.username}}</router-link></span>
            <span v-if="profile.followed" class="followStatus">Follows you</span>
          </v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>
    </v-list>
  </v-card>
</template>

<script>
  import {mapState} from 'vuex';

  export default {
    name: 'User',
    props: ['profile'],
    computed: {
      ...mapState({
        user: state => state.user
      })
    }
  };
</script>

<style scoped>
  .username-link {
    color: white;
    font-size: 18px;
  }

  .at-name, .name-link {
    color: lightgrey;
    font-size: 14px;
  }

  .username-link, .name-link {
    text-decoration: none;
  }

  .username-link:hover, .name-link:hover {
    text-decoration: underline;
  }
</style>
