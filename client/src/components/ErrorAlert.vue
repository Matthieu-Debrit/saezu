<template>
  <v-snackbar
    color="error"
    :timeout="timeout"
    bottom
    v-model="show"
  >
    {{ text }}
    <v-btn flat @click.native="show = false">Close</v-btn>
  </v-snackbar>
</template>

<script>
  import {mapState} from 'vuex';

  export default {
    name: 'ErrorAlert',
    data() {
      return {
        timeout: 6000
      };
    },
    computed: {
      ...mapState({
        text: state => state.error
      }),
      show: {
        get() {
          return this.$store.state.errorAlert;
        },
        set(value) {
          this.$store.state.errorAlert = value;
        }
      }
    }
  };
</script>

<style scoped>

</style>
