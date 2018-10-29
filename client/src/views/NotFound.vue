<template>
  <v-container fluid fill-height>
    <v-layout align-center justify-center>
      <v-flex xs12 sm8 md4>
        <img src="/static/img/logo.png">

        <v-content>
          <h1>You are lost.</h1>
          <h4>This page doesn't exist.</h4>
          <router-link to="/">Take me home.</router-link>
        </v-content>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  export default {
    name: 'NotFound'
  };
</script>
