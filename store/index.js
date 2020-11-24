import Cookie from 'js-cookie'

export const state = () => ({
  loadedPosts: [],
  token: null
});

export const mutations = {
  setPosts(state, posts) {
    state.loadedPosts = posts;
  },
  addPost(state, post) {
    state.loadedPosts.push(post);
  },
  editPost(state, edittedPost) {
    const postIndex = state.loadedPosts.findIndex(post => post.id === edittedPost.id);
    state.loadedPosts[postIndex] = edittedPost;
  },
  setToken(state, token) {
    state.token = token;
  },
  clearToken(state) {
    state.token = null;
  }
};

export const actions = {
  nuxtServerInit(vuexContext, context) {
    return context.app.$axios
      .$get('/posts.json')
      .then(data => {
        const postsArray = [];
        for (const key in data) {
          postsArray.push({ ...data[key], id: key });
        }
        vuexContext.commit('setPosts', postsArray)
      })
      .catch(e => context.error(e));
  },
  setPosts(vuexContext, posts) {
    vuexContext.commit('setPosts', posts);
  },
  addPost(vuexContext, post) {
    const createdPost = {
      ...post,
      updatedDate: new Date()
    };
    return this.$axios
      .$post(`/posts.json?auth=${vuexContext.state.token}`, createdPost)
      .then(data => {
        vuexContext.commit('addPost', {
          ...createdPost,
          id: data.name
        });
      })
      .catch(error => console.log(error));
  },
  editPost(vuexContext, edittedPost) {
    return this.$axios
      .$put(`/posts/${edittedPost.id}.json?auth=${vuexContext.state.token}`, edittedPost)
      .then(res => {
        vuexContext.commit('editPost', edittedPost);
      })
      .catch(e => console.log(e));
  },
  authUser(vuexContext, authData) {
    let authUrl = 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword';
    if (!authData.isLogin) {
      authUrl = 'https://identitytoolkit.googleapis.com/v1/accounts:signUp'
    }
    return this.$axios
      .$post(`${authUrl}?key=${process.env.fbApiKey}`, {
        email: authData.email,
        password: authData.password,
        returnSecureToken: true
      })
      .then(result => {
        const token = result.idToken;
        const expirationDate = new Date().getTime() + Number.parseInt(result.expiresIn) * 1000;

        vuexContext.commit('setToken', token);
        localStorage.setItem('token', token);
        localStorage.setItem('tokenExpiration', expirationDate);
        Cookie.set('jwt', token);
        Cookie.set('expirationDate', expirationDate)

        return this.$axios.$post('http://localhost:3000/api/track-data', { data: 'Authenticated!' });
      })
      .catch(e => console.log(e));
  },
  initAuth(vuexContext, req) {
    let token;
    let expirationDate;
    if (req) {
      if (!req.headers.cookie) {
        return;
      }
      const jwtCookie =  req.headers.cookie
        .split(';')
        .find(c => c.trim().startsWith('jwt='));
      if (!jwtCookie) {
        return;
      }
      token = jwtCookie.split('=')[1];
      expirationDate = req.headers.cookie
        .split(';')
        .find(c => c.trim().startsWith('expirationDate='))
        .split('=')[1];
    } else if (process.client) { // extra check for build queries which has no client side
      token = localStorage.getItem('token');
      expirationDate = localStorage.getItem('tokenExpiration');
    }

    const currentDate = new Date().getTime();
    // console.log(currentDate, Number.parseInt(expirationDate));
    if (currentDate > Number.parseInt(expirationDate) || !token) {
      console.log('No or invalid token');
      // vuexContext.commit('clearToken');
      vuexContext.dispatch('logout');
      return;
    }
    vuexContext.commit('setToken', token);
  },
  logout(vuexContext) {
    vuexContext.commit('clearToken');
    Cookie.remove('jwt');
    Cookie.remove('expirationDate');
    if (process.client) {
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpiration');
    }
  }
};

export const getters = {
  loadedPosts(state) {
    return state.loadedPosts;
  },
  isAuthenticated(state) {
    return state.token != null;
  }
};
