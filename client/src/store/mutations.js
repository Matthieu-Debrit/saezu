import Vue from 'vue';

export default {
  setLoading(state, payload) {
    state.loading = payload;
  },
  setError(state, payload) {
    state.error = payload;
    state.errorAlert = !!payload;
  },
  clearError(state) {
    state.error = null;
  },
  setSearch(state, payload) {
    state.search = payload;
  },
  setDialog(state, payload) {
    for (let dialog in payload) {
      if (payload.hasOwnProperty(dialog) && state.dialog.hasOwnProperty(dialog)) {
        Vue.set(state.dialog, dialog, payload[dialog]);
      }
    }
  },
  clearDialogs(state) {
    for (let dialog in state.dialog) {
      if (state.dialog.hasOwnProperty(dialog)) {
        Vue.set(state.dialog, dialog, false);
      }
    }
  },
  setUser(state, payload) {
    state.user = payload;
  },
  clearUser(state) {
    state.user = null;
  },
  setHomeTimeline(state, payload) {
    state.homeTimeline = payload;
  },
  clearHomeTimeline(state) {
    state.homeTimeline = [];
  },
  setUserProfile(state, payload) {
    state.userProfile = payload;
  },
  clearUserProfile(state) {
    state.userProfile = null;
    state.userTimeline = null;
  },
  setUserTimeline(state, payload) {
    state.userTimeline = payload;
  },
  clearUserTimeline(state) {
    state.userTimeline = [];
  },
  setPost(state, payload) {
    state.post = payload;
  },
  togglePostOverlay(state, payload) {
    state.postOverlay = payload;
  },
  setComments(state, payload) {
    state.comments = payload;
  },
  setComment(state, payload) {
    state.comment = payload;
  }
};
