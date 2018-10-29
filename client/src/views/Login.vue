<template>
  <v-content>
    <v-layout style="position: fixed; width: 100%;">
      <v-flex md12>
        <v-alert v-if="error" dismissible color="error" icon="warning" v-model="alert" class="mx-1">
          {{error}}
        </v-alert>
      </v-flex>
    </v-layout>
    <v-container fluid fill-height>
      <v-layout align-center justify-center>
        <v-flex xs12 sm8 md4>
          <v-card class="elevation-12">
            <v-tabs color="red" v-model="active">
              <v-tabs-slider color="yellow"></v-tabs-slider>
              <v-tab href="#tab-1" ripple>Login</v-tab>
              <v-tab href="#tab-2" ripple>Sign Up</v-tab>
              <v-tab-item key="1" id="tab-1">
                <v-layout row>
                  <v-flex xs10 offset-xs1>
                    <v-form @keyup.native.enter="login" v-model="validLogin" ref="formLogin" lazy-validation>
                      <v-text-field
                        name="username"
                        label="Username"
                        v-model="username"
                        required
                      ></v-text-field>
                      <v-text-field
                        name="password"
                        autocomplete="off"
                        label="Password"
                        v-model="password"
                        :append-icon="pwToggle ? 'visibility' : 'visibility_off'"
                        :append-icon-cb="() => (pwToggle = !pwToggle)"
                        :type="pwToggle ? 'password' : 'text'"
                        required
                      ></v-text-field>
                      <v-btn
                        color="red"
                        @click.stop="login"
                        :disabled="!validLogin || waitLogin"
                      >
                        <v-progress-circular v-if="waitLogin" indeterminate></v-progress-circular>
                        <span v-else>Login</span>
                      </v-btn>
                    </v-form>
                  </v-flex>
                </v-layout>
              </v-tab-item>
              <v-tab-item key="2" id="tab-2">
                <v-layout row>
                  <v-flex xs10 offset-xs1>
                    <v-form @keyup.native.enter="signUp" v-model="validSignUp" ref="formSignUp" lazy-validation>
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
                      <v-btn
                        color="red"
                        @click.stop="signUp"
                        :disabled="!validSignUp || waitSignUp"
                      >
                        <v-progress-circular v-if="waitSignUp" indeterminate></v-progress-circular>
                        <span v-else>Sign Up</span>
                      </v-btn>
                    </v-form>
                  </v-flex>
                </v-layout>
              </v-tab-item>
            </v-tabs>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </v-content>
</template>

<script>
  import {mapState} from 'vuex';
  import {usernameRules, nameRules, passwordRules} from '../../../common/inputRules';

  export default {
    name: 'Login',
    data() {
      return {
        formHeight: 280,
        menu: false,
        active: 'tab-1',
        validLogin: true,
        validSignUp: true,
        pwToggle: true,
        username: '',
        name: '',
        password: '',
        usernameRules,
        nameRules,
        passwordRules,
        waitLogin: false,
        waitSignUp: false,
        alert: false
      };
    },
    methods: {
      login() {
        const {username, password} = this;

        if (this.$refs.formLogin.validate()) {
          this.waitLogin = true;
          this.$store.dispatch('login', {username, password})
            .then((success) => {
              if (success) {
                this.$store.commit('setError', null);
                const redirect = this.$route.query.redirect || '/';
                this.$router.push({path: redirect});
              } else {
                this.alert = true;
              }
              this.waitLogin = false;
            });
        }
      },
      signUp() {
        const {username, name, password} = this;
        if (this.$refs.formSignUp.validate()) {
          this.waitSignUp = true;
          this.$store.dispatch('signUp', {username, name, password})
            .then((success) => {
              if (success) {
                this.active = 'tab-1';
              } else {
                this.alert = true;
              }
              this.waitSignUp = false;
            });
        }
      }
    },
    computed: {
      ...mapState({
        error: state => state.error
      })
    }
  };
</script>

<style scoped>
  #tab-1, #tab-2 {
    padding-top: 10px;
    min-height: 300px;
  }
</style>
