<template>
  <v-layout justify-center>
    <v-flex xs12 sm10 md8 lg6>
      <v-card>
        <v-card-title>
          <span class="title">Settings</span>
        </v-card-title>
        <v-divider class="mt-1"></v-divider>
        <v-card-text>
          <v-form v-model="validSettings" ref="formSettings" lazy-validation>
            <v-text-field
              label="Username"
              v-model="username"
              :rules="usernameRules"
              required
            ></v-text-field>
            <v-text-field
              label="Name"
              v-model="name"
              :rules="nameRules"
              required
            ></v-text-field>
            <v-text-field
              label="Password"
              hint="At least 6 characters"
              v-model="password"
              :rules="passwordRules"
              :append-icon="pwToggle ? 'visibility' : 'visibility_off'"
              :append-icon-cb="() => (pwToggle = !pwToggle)"
              :type="pwToggle ? 'password' : 'text'"
              required
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-divider class="mt-5"></v-divider>
        <v-card-actions>
          <v-btn color="red" @click.stop="dialog = true">Delete</v-btn>
          <v-spacer></v-spacer>
          <v-btn
            color="red"
            @click.stop="saveSettings"
            :disabled="!validSettings || waitSettings"
          >
            <v-progress-circular v-if="waitSettings" indeterminate></v-progress-circular>
            <span v-else>Save</span>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-flex>
    <v-dialog v-model="dialog" max-width="290">
      <v-card>
        <v-card-title class="headline">Account deletion</v-card-title>
        <v-card-text>Are you sure you want to delete this account?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click.native="dialog = false">Cancel</v-btn>
          <v-btn color="red" @click.native="deleteAccount">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script>
  import {usernameRules, nameRules, passwordRules} from '../../../common/inputRules';

  export default {
    name: 'Settings',
    data() {
      return {
        validSignUp: true,
        pwToggle: true,
        username: '',
        name: '',
        password: '',
        usernameRules,
        nameRules,
        passwordRules,
        validSettings: true,
        waitSettings: false,
        dialog: false
      };
    },
    methods: {
      saveSettings() {
        const {username, name, password} = this;
        if (this.$refs.formSettings.validate()) {
          this.waitSettings = true;
          this.$store.dispatch('changeSettings', {username, name, password})
            .then((success) => {
              if (success) {
                // TODO: snackbar ?
              } else {
                // TODO: snackbar ?
              }
              this.waitSettings = false;
            });
        }
      },
      deleteAccount() {
        this.$store.dispatch('deleteAccount', {username: this.$store.getters.username})
          .then(() => {
            this.$router.push({path: '/login'});
          });
      }
    },
    created() {
      this.username = this.$store.getters.username;
      this.name = this.$store.getters.name;
    }
  };
</script>

<style scoped>

</style>
