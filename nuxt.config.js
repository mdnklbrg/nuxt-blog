const bodyParser = require('body-parser');
const axios = require('axios');

const fbUrl = ''; // Add firebase url here
const fbKey = ''; // Add firebase api key here

export default {
  mode: 'universal',
  /*
  ** Headers of the page
  */
  head: {
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Open+Sans&display=swap" }
    ]
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#3b8070', failedColor: 'hotpink', height: '4px', duration: 5000 },
  /*
  ** Global CSS
  */
  css: [
    '~assets/styles/main.css'
  ],
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    '~plugins/core-components.js',
    '~plugins/date-filter.js'
  ],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
    '@nuxtjs/axios'
  ],
  // available through the axios module
  axios: {
    baseURL: process.env.BASE_URL || fbUrl,
    credentials: false
  },
  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    extend (config, ctx) {}
  },
  env: {
    baseURL: process.env.BASE_URL || fbUrl,
    fbApiKey: fbKey
  },
  router: {
    linkActiveClass: 'active',
  },
  pageTransition: {
    name: 'fade',
    mode: 'out-in'
  },
  serverMiddleware: [
    bodyParser.json(),
    { path: '/api', handler: '~/api/index.js' }
  ],
  // add routes to prerender
  generate: {
    routes: function() {
      return axios.get(`${fbUrl}/posts.json`)
        .then(res => {
          const routes = [];
          for (let key in res.data) {
            routes.push({
              route: `/posts/${key}`,
              payload: {
                postData: res.data[key]
              }
            });
          }
          return routes;
        });
    }
  }
}
