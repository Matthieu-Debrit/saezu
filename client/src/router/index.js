import Vue from 'vue';
import Router from 'vue-router';
import store from '@/store';

import Login from '@/views/Login';
import NotFound from '@/views/NotFound';
import Main from '@/views/Main';
import Home from '@/views/Home';
import Profile from '@/views/Profile';
import ProfilePosts from '@/views/ProfilePosts';
import ProfileFollowers from '@/views/ProfileFollowers';
import ProfileFollowing from '@/views/ProfileFollowing';
import Settings from '@/views/Settings';
import Search from '@/views/Search';

import {serverAPI} from '@/api';

Vue.use(Router);

const routerInstance = new Router({
  routes: [
    {
      path: '/',
      component: Main,
      children: [
        {
          path: '',
          name: 'Home',
          component: Home,
          meta: {requiresAuth: true}
        }, {
          path: '/settings',
          name: 'Settings',
          component: Settings,
          meta: {requiresAuth: true}
        }, {
          path: '/user/:username',
          name: 'Profile',
          component: Profile,
          children: [
            {
              path: '',
              name: 'ProfilePosts',
              component: ProfilePosts
            }, {
              path: 'followers',
              name: 'ProfileFollowers',
              component: ProfileFollowers
            }, {
              path: 'following',
              name: 'ProfileFollowing',
              component: ProfileFollowing
            }
          ]
        }, {
          path: '/search',
          name: 'Search',
          component: Search,
          meta: {requiresAuth: true} // Not necessary
        }
      ]
    }, {
      path: '/login',
      name: 'Login',
      component: Login,
      beforeEnter: (to, from, next) => {
        if (store.state.user) {
          next({
            path: to.query.redirect ? to.query.redirect : '/'
          });
        } else {
          next();
        }
      }
    }, {
      path: '*',
      component: NotFound
    }
  ]
});

routerInstance.beforeEach((to, from, next) => {
  const user = store.state.user;
  if (to.matched.some(record => record.meta.requiresAuth) && (!user || user === 'null')) {
    next({
      path: '/login',
      query: {redirect: to.fullPath}
    });
  } else {
    next();
  }
});

// TODO cleaner way
// Check local storage to handle refreshes
if (window.localStorage) {
  const localUserString = window.localStorage.getItem('user') || 'null';
  const localUser = JSON.parse(localUserString);

  if (localUser && store.state.user !== localUser) {
    store.commit('setUser', localUser);
    serverAPI.defaults.headers.common['Authorization'] = `Bearer ${window.localStorage.getItem('token')}`;
  }
}

export default routerInstance;
