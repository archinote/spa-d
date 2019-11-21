/**
 * App router
 */
import Vue from 'vue'
import VueRouter from 'vue-router'
import routes from './routes'
import { isEmpty } from 'lodash'
// Import routing helper functions.
import { 
  getRouteData, 
  getCompanyFromUrl,
  saveCompanyId,
  getPostFromUrl,
  savePostId,
  detectPostId
} from './helpers'

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  base: __dirname,
  routes
})

const consoleDebug = Boolean(process.env.NODE_ENV == 'development')

let routeStatus = ''

// New version
router.beforeEach((to, from, next) => {
  let store = router.app.$store
  // Detect route flags
  let isPublic = to.matched.some(record => record.meta.public)
  let hasPostContext = !to.matched.some(record => record.meta.noPostContext)
  let isHidden = to.matched.some(record => record.meta.hidden)
  let isSkipAuthCheck = to.matched.some(record => record.meta.skipAuthCheck)
  let isNotFound = ['notFound', '404'].includes(to.name)
  let isOpenedDirectly = Boolean(from.name == null)

  let lastCompanyId = store.getters[`app/account/getCompanyId`]
  let lastPostId = store.getters[`app/account/getPostId`]
  let currentCompanyId = ''
  let currentPostId = ''

  routeStatus = ''
  
  // Save route data to Store
  store.commit(`app/layout/setRoute`, to)

  // Save route meta data in the Store each time route changed.
  // store.commit(`app/layout/setPublic`, isPublic)
  store.commit(`app/layout/setPostContext`, hasPostContext)

  // Not Found current path check
  if (isNotFound) {
    // store.commit('app/layout/setRouteStatus', 'notFound')
    routeStatus = 'notFound'
    if (consoleDebug) console.log("Route NOT found.")
    next()
    return
  }

  // Some routes can't be accessed directly
  if (isOpenedDirectly && isHidden) {
    if (consoleDebug) console.log("Try to open directly route with meta 'hidden' found.")
    // store.commit('app/layout/setRouteStatus', 'accessDenied')
    routeStatus = 'accessDenied'
    next()
    return
  }
  
  // Some 'public' routes don't need any access check
  if (isPublic) {
    if (consoleDebug) console.log("Route with meta 'public' found.")
    
    if (isSkipAuthCheck) {
      // Set current route status
      // store.commit('app/layout/setRouteStatus', 'ok')
      routeStatus = 'ok'

      // Resolve next route.
      next()
      return
    }
  }

  // Check for AUTH.
  // if (consoleDebug) console.log("Проверка на авторизацию...")
  // if page reloads and LocalStorage has tokens - store them in app store. Before all requests
  if (localStorage) {
    let tokens = null
    try {
      let json_tokens = localStorage.getItem("dms_auth_tokens")
      tokens = JSON.parse(json_tokens)
    }
    catch(ex) {
      tokens = null
    }
    if(tokens!=null) store.commit('app/account/setAuthTokens', tokens)
  }

  // Set router 'loading' status before sending server request.
  if (!store.getters[`app/account/isAccountActive`]) {
    store.commit('app/layout/setRouteStatus', 'loading')
  }

  // To check user for AUTH get user data (profile) from server.
  store.dispatch(`app/account/getProfile`).then(profile => {
    if (isEmpty(profile)) {
      // if (consoleDebug) console.log("... НЕ успешно.")

      // store.commit('app/layout/setRouteStatus', 'notSignedIn')
      routeStatus = 'notSignedIn'
      next()
    } else {
      // if (consoleDebug) console.log("... успешно.")
      
      // Get user Companies & Posts
      store.dispatch(`app/account/getCompanies`).then(companies => {
        // This route needs account company & post data

        if (hasPostContext) {
          //
          // Current route needs post ID context
          //

          // Detect account current company & post
          
          // TODO move it to 'detectPostId' function
          // currentCompanyId = getCompanyFromUrl(to)
          // currentPostId = getPostFromUrl(to)

          // currentCompanyId = detectCompanyId(to, store)
          currentCompanyId = getCompanyFromUrl(to)

          // We need to save company ID in store for later detecting post ID.
          store.commit(`app/account/setCompanyId`, currentCompanyId)

          if (lastCompanyId != currentCompanyId) {
            // NOTE возможно, что потребуется какая-то реакция на смену компании
            
            // Load account company anketa.
            let anketaId = store.getters['app/account/getCompanyAnketaID'](currentCompanyId)
            store.dispatch('app/account/loadAnketa', anketaId)
          }
          
          // currentPostId = getPostFromUrl(to)
          currentPostId = detectPostId(to, store)
          // if (consoleDebug) console.log("App routing, detected post ID: " + currentPostId)
          
          if (currentPostId) {
            // Save post ID in Store to use it in http-client.
            store.commit(`app/account/setPostId`, currentPostId)

            // If postId is changed?
            if (lastPostId !== currentPostId) {
              // if (consoleDebug) console.log("Post ID has changed!")
              // NOTE New post ID
              
              // Clear old post data
              store.commit(`app/account/clearPostData`)

              // Load or Update accesses & other post data
              // These actions may take a time so set app sub-loading state.
              store.commit(`app/layout/setUpdating`, true)
              
              // Check & load account ACCESSES
              store.dispatch(`app/account/checkAccess`, currentPostId).then(response => {
                // User has a valid post ID

                // Set account 'isMyPost' property
                store.commit(`app/account/setIsMyPost`, response.is_my === true)
              
                // Load Post accesses
                store.dispatch(`app/account/loadAccesses`).then(() => {
                  // TODO: check for valid access
                  let isValidAccess = true

                  // TODO
                  // Validate Post Accesses???
                  // ...

                  // Set current route status
                  if (isValidAccess) {
                    // store.commit('app/layout/setRouteStatus', 'ok')
                    routeStatus = 'ok'

                    // TODO: remove it from router (to App.vue?)

                    // Get post notifications and put them in store
                    store.dispatch('app/notifications/loadNotifications')
                    
                    // TODO: remove it from router (to App.vue?)

                    // Load post LOGO
                    store.dispatch('app/account/loadLogo')
                  } else {
                    // store.commit('app/layout/setRouteStatus', 'accessDenied')
                    routeStatus = 'accessDenied'
                  }
                }).catch(error => {
                  console.warn(error)
                  // store.commit('app/layout/setRouteStatus', 'error')
                  routeStatus = 'error'
                  store.commit(`app/layout/setRouteError`, { code: 121, text: "Can't load accesses." })
                }).finally(() => {
                  // Resolve next route
                  next()
                })
              }).catch(error => {
                // Invalid post ID
                console.warn(error)
                // store.commit('app/layout/setRouteStatus', 'error')
                routeStatus = 'error'
                store.commit(`app/layout/setRouteError`, { code: 151, text: "У вас нет доступа к выбранному посту." })
                next()
              })
            } else {
              // Post ID has no changed.
              // No needs to load accesses, logo, etc.
              // store.commit('app/layout/setRouteStatus', 'ok')
              routeStatus = 'ok'
              next()
            }
          } else {
            // App needs LOST post ID to load assesses & other data
            console.warn("Can not get account post ID to run current application")
            // store.commit('app/layout/setRouteStatus', 'accessDenied')
            routeStatus = 'accessDenied'
            next()
          }
        } else {
          if (consoleDebug) console.log("Route with meta 'noPostContext' found.")
  
          // TODO: clear post data
          // - logo
          // - accesses
          // - etc...
          // store.commit(`app/account/clearPostData`)
  
          // store.commit('app/layout/setRouteStatus', 'ok')
          routeStatus = 'ok'
          next()
        }
      }).catch(error => {
        console.warn(error)
        // store.commit('app/layout/setRouteStatus', 'error')
        routeStatus = 'error'
        store.commit(`app/layout/setRouteError`, { code: 131, text: "Can't load companies & posts." })
        next()
      })
    }
  }).catch(error => {
    // NOTE: AUTH check error.

    if (consoleDebug) console.warn(error)

    // Call 'Cleaner' and get out of here.
    store.commit(`app/account/setCompanyId`, null)
    store.commit(`app/account/setPostId`, null)
    store.commit(`app/account/setCompanies`, [])

    if (error.response && error.response.status == 401) {
      if (isPublic) {
        // Not authorized user can have access to public route
        // store.commit('app/layout/setRouteStatus', 'ok')
        routeStatus = 'ok'
      } else {
        // store.commit('app/layout/setRouteStatus', 'accessDenied')
        routeStatus = 'accessDenied'
      }
    } else {
      // store.commit('app/layout/setRouteStatus', 'error')
      routeStatus = 'error'
      store.commit(`app/layout/setRouteError`, { code: 101, text: "Server connection error." })
    }

    next()
  })
})

router.afterEach((to, from) => {
  // if (consoleDebug) console.log('router.afterEach(), routeStatus = ' + routeStatus)

  let store = router.app.$store
  let isPublic = to.matched.some(record => record.meta.public)
  // let hasPostContext = !to.matched.some(record => record.meta.noPostContext)
  // let isHidden = to.matched.some(record => record.meta.hidden)
  
  store.commit(`app/layout/setPublic`, isPublic)
  store.commit('app/layout/setRouteStatus', routeStatus ? routeStatus : 'ok')
})

export default router
