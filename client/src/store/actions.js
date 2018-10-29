import {serverAPI} from '@/api';

export default {
  async login({commit, dispatch}, payload) {
    const success = await serverAPI.post('/connect', {
      username: payload.username,
      password: payload.password
    })
      .then(response => {
        if (response.data.data && response.data.data.id_token) {
          const token = response.data.data.id_token;
          serverAPI.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          // TODO cleaner way
          if (window.localStorage) {
            window.localStorage.setItem('token', token);
          }
          return serverAPI.get('/users/me');
        } else {
          return Promise.reject(new Error('Wrongly formatted response'));
        }
      })
      .then(response => {
        const user = response.data.data;
        commit('setUser', user);
        // TODO cleaner way
        if (window.localStorage) {
          window.localStorage.setItem('user', JSON.stringify(user));
        }
        return true;
      })
      .catch(error => {
        console.error(error);
        commit('setError', error.response.data.message);
        return false;
      });
    return success;
  },
  async signUp({commit}, payload) {
    const success = await serverAPI.post('/users', {
      username: payload.username,
      name: payload.name,
      password: payload.password
    })
      .then(response => {
        return true;
      })
      .catch(error => {
        console.error(error);
        commit('setError', error.response.data.message);
        return false;
      });
    return success;
  },
  async logout({commit}) {
    delete serverAPI.defaults.headers.common['Authorization'];
    commit('clearUser');
    commit('clearUserProfile');
    commit('clearHomeTimeline');
    commit('clearUserTimeline');
    if (window.localStorage) {
      window.localStorage.removeItem('token');
      window.localStorage.removeItem('user');
    }
    return true;
  },
  async changeSettings({commit}, payload) {
    const success = await serverAPI.put('/users/me', {
      username: payload.username,
      name: payload.name,
      password: payload.password
    })
      .then(() => {
        return serverAPI.get('/users/me');
      })
      .then(response => {
        commit('setUser', response.data.data);
        return true;
      })
      .catch(error => {
        console.error(error);
        commit('setError', error.response.data.message);
        return false;
      });
    return success;
  },
  async deleteAccount({commit, dispatch}, payload) {
    const success = await serverAPI.delete('users/me', {
      username: payload.username,
      password: payload.password
    })
      .then(response => {
        return dispatch('logout');
      })
      .catch(error => {
        console.error(error);
        commit('setError', error.response.data.message);
        return false;
      });
    return success;
  },
  async post({commit}, payload) {
    const success = await serverAPI.post('/posts/create', {
      content: payload.text
    })
      .then(response => {
        return true;
      })
      .catch(error => {
        console.error(error);
        commit('setError', error.response.data.message);
        return false;
      });
    return success;
  },
  async editPost({commit}, payload) {
    const success = await serverAPI.put(`/posts/edit/${payload.id}`, {
      content: payload.text
    })
      .then(response => {
        return true;
      })
      .catch(error => {
        console.error(error);
        commit('setError', error.response.data.message);
        return false;
      });
    return success;
  },
  async deletePost({commit}, payload) {
    const success = await serverAPI.post(`/posts/destroy/${payload}`)
      .then(response => {
        return true;
      })
      .catch(error => {
        console.error(error);
        commit('setError', error.response.data.message);
        return false;
      });
    return success;
  },
  async likePost({commit}, payload) {
    const success = await serverAPI.post(`/posts/like/create/${payload}`)
      .then(response => {
        return true;
      })
      .catch(error => {
        console.error(error);
        commit('setError', error.response.data.message);
        return false;
      });
    return success;
  },
  async unlikePost({commit}, payload) {
    const success = await serverAPI.post(`/posts/like/destroy/${payload}`)
      .then(response => {
        return true;
      })
      .catch(error => {
        console.error(error);
        commit('setError', error.response.data.message);
        return false;
      });
    return success;
  },
  async getPost({commit}, payload) {
    const success = await serverAPI.get(`/posts/show/${payload}`)
      .then(response => {
        commit('setPost', response.data.data);
        return true;
      })
      .catch(error => {
        console.error(error);
        commit('setError', error.response.data.message);
        return false;
      });
    return success;
  },
  async getHomeTimeline({commit}) {
    const success = await serverAPI.get('/posts/home_timeline')
      .then(response => {
        commit('setHomeTimeline', response.data.data);
        return true;
      })
      .catch(error => {
        console.error(error);
        commit('setError', error.response.data.message);
        return false;
      });
    return success;
  },
  async getUserProfile({commit, dispatch, state}, payload) {
    if (!payload.user_id && !payload.username) {
      console.error('Called "getuserProfile" without id');
      return false;
    }
    const query = payload.user_id ? `user_id=${payload.user_id}` : `username=${payload.username}`;
    const success = await serverAPI.get(`/users/show?${query}`)
      .then(response => {
        const oldUserId = state.userProfile ? state.userProfile.id : undefined;
        commit('setUserProfile', response.data.data);
        // We want userTimeline in accordance with userProfile if userTimeline is loaded
        if (state.userTimeline && oldUserId !== state.userProfile.id) {
          return dispatch('getUserTimeline');
        }
      })
      .then(response => {
        return true;
      })
      .catch(error => {
        console.error(error);
        commit('setError', error.response.data.message);
        return false;
      });
    return success;
  },
  async getUserTimeline({state, commit}, payload) {
    const userId = payload || (state.userProfile ? state.userProfile.id : null);
    if (!userId) {
      console.error('Can\'t load timeline: no user id');
      return false;
    }
    const success = await serverAPI.get(`/posts/user_timeline?user_id=${userId}`)
      .then(response => {
        commit('setUserTimeline', response.data.data);
        return true;
      })
      .catch(error => {
        console.error(error);
        commit('setError', error.response.data.message);
        return false;
      });
    return success;
  },
  async followUser({commit}, payload) {
    if (!payload.user_id && !payload.username) {
      return false;
    }
    const query = payload.user_id ? `user_id=${payload.user_id}` : `username=${payload.username}`;
    const action = payload.actionFollow ? 'create' : 'destroy';
    const success = await serverAPI.post(`/friendships/${action}?${query}`)
      .then(response => {
        return true;
      })
      .catch(error => {
        console.error(error);
        commit('setError', error.response.data.message);
        return false;
      });
    return success;
  },
  async getComments({commit}, payload) {
    const success = await serverAPI.get(`/comments/reply/${payload}`)
      .then(response => {
        commit('setComments', response.data.data);
        return true;
      })
      .catch(error => {
        console.error(error);
        commit('setError', error.response.data.message);
        return false;
      });
    return success;
  },
  async comment({commit}, payload) {
    const success = await serverAPI.post(`/comments/create?in_reply_to=${payload.post_id}`, {
      content: payload.text
    })
      .then(response => {
        return true;
      })
      .catch(error => {
        console.error(error);
        commit('setError', error.response.data.message);
        return false;
      });
    return success;
  },
  async editComment({commit}, payload) {
    const success = await serverAPI.put(`/comments/edit/${payload.id}`, {
      content: payload.text
    })
      .then(response => {
        return true;
      })
      .catch(error => {
        console.error(error);
        commit('setError', error.response.data.message);
        return false;
      });
    return success;
  },
  async deleteComment({commit}, payload) {
    const success = await serverAPI.post(`/comments/destroy/${payload}`)
      .then(response => {
        return true;
      })
      .catch(error => {
        console.error(error);
        commit('setError', error.response.data.message);
        return false;
      });
    return success;
  },
  async likeComment({commit}, payload) {
    const success = await serverAPI.post(`/comments/like/create/${payload}`)
      .then(response => {
        return true;
      })
      .catch(error => {
        console.error(error);
        commit('setError', error.response.data.message);
        return false;
      });
    return success;
  },
  async unlikeComment({commit}, payload) {
    const success = await serverAPI.post(`/comments/like/destroy/${payload}`)
      .then(response => {
        return true;
      })
      .catch(error => {
        console.error(error);
        commit('setError', error.response.data.message);
        return false;
      });
    return success;
  }
};
