export default {
  loading: state => state.loading,
  error: state => state.error,
  user: state => state.user,
  username: state => (state.user ? state.user.username : null),
  name: state => (state.user ? state.user.name : null),
  userTimeline: state => state.userTimeline,
  search: state => state.search
};
