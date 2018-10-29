<template>
  <v-container grid-list-md>
    <v-layout>
      <v-flex v-for="profile in users" :key="profile.id" xs4>
        <user :profile="profile"></user>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  import User from '@/components/User';

  export default {
    name: 'UserList',
    components: {
      'user': User
    },
    props: ['users']
  };
</script>
