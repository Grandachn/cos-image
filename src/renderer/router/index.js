import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'tx-login-page',
      component: require('@/components/TXLoginPage').default
    },
    {
      path: '/upload-page',
      name: 'upload-page',
      component: require('@/components/UploadPage').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
