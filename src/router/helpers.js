/**
 * Route helper functions
 */
// import { storeModuleName } from 'dms-base/settings'

const consoleDebug = Boolean(process.env.NODE_ENV == 'development')

export function getCompanyFromUrl( route ) {
  return route.params.cid
    ? route.params.cid.toLowerCase()
    : null
}

export function getCompanyFromLS() {
  return localStorage.getItem('companyId')
    ? localStorage.getItem('companyId').toLowerCase()
    : null
}

/**
 * 
 */
export function getPostFromUrl( route ) {
  return route.query.pid
    ? route.query.pid.toLowerCase()
    : null
}

export function getPostFromLS() {
  return localStorage.getItem('postId')
    ? localStorage.getItem('postId').toLowerCase()
    : null
}

export function saveCompanyId(companyId, store) {
  // Save valid company ID in Store & localStorage
  localStorage.setItem('companyId', companyId)
  store.commit(`app/account/setCompanyId`, companyId)
}

export function savePostId(postId, store) {
  // Save valid post ID in Store & localStorage
  localStorage.setItem('postId', postId)
  store.commit(`app/account/setPostId`, postId)
}

/**
 * Detect a valid company ID.
 * 
 * @param {object} route route, resolving path 'to'
 * @param {object} store App Store object
 */
export function detectCompanyId(route, store) {
  let currentCompanyId = null
  let companyIdFromUrl = getCompanyFromUrl(route)
  let companyIdFromLocalStorage = getCompanyFromLS()
  let companies = store.getters[`app/account/getCompanies`]

  // Check if company ID from URL is not empty & valid
  if (!_.isEmpty(companyIdFromUrl) && companies.some(el => el.id == companyIdFromUrl)) {
    // Try to trust it.
    currentCompanyId = companyIdFromUrl
    // if (consoleDebug) console.log('COMPANY ID - from URL param')
  } 
  // Check & validate company Id from localStorage
  else if (!_.isEmpty(companyIdFromLocalStorage) && companies.some(el => el.id == companyIdFromLocalStorage)) {
    // Try to trust it.
    currentCompanyId = companyIdFromLocalStorage
    // if (consoleDebug) console.log('COMPANY ID - from localStorage')
  }
  // Companies list has one company only.
  else if (companies.length > 0 && companies.length < 2) {
    // Try to get a company from list if it has one company only.
    currentCompanyId = companies[0].id
    // if (consoleDebug) console.log('COMPANY ID - first in list, list length = 1')
  }
  // If companies list has more than one company
  else if (companies.length > 0) {
    //  - DEBUG: use first available
    //  - FIXME: show widget to user to select company from list.
    currentCompanyId = companies[0].id
    // if (consoleDebug) console.log('COMPANY ID - first in list, list length > 1')
  }
  // No any company
  else {
    // FIXME: Redirect to error page.
    if (consoleDebug) console.warn("!!! Companies list has no items !!!")
    store.commit(`app/layout/setRouteStatus`, 'error')
    store.commit(`app/layout/setRouteError`, {code: 123, text: 'Companies list has no items'})
  }

  // Now we have a valid Company ID.
  return currentCompanyId ? String(currentCompanyId).toLowerCase() : null
}

/**
 * Detect a valid Post ID
 * 
 * @param {object} route route, resolving path 'to'
 * @param {object} store App Store object
 */
export function detectPostId(route, store) {
  let currentPostId = null
  let postIdFromUrl = getPostFromUrl(route)
  let postIdFromLocalStorage = getPostFromLS()
  // Get available posts list of the user in current company
  let posts = store.getters[`app/account/getPosts`]()

  // Check if post ID from URL (query) is not empty & valid
  if (!_.isEmpty(postIdFromUrl) && posts.some(el => el.id == postIdFromUrl)) {
    // Try to trust it.
    currentPostId = postIdFromUrl
    // if (consoleDebug) console.log('POST ID - from URL query param')
  } 
  // Check if localStorage has post ID & it is valid.
  else if (postIdFromLocalStorage && posts.some(el => el.id == postIdFromLocalStorage)) {
    currentPostId = postIdFromLocalStorage
    // if (consoleDebug) console.log('POST ID - from localStorage')
  }
  // Check if posts list has only one item
  else if (posts.length > 0 && posts.length < 2) {
    currentPostId = posts[0].id
    // if (consoleDebug) console.log('POST ID - first in list, list length = 1')
  }
  // Posts list has more than one item?
  else if (posts.length > 1) {
    // FIXME: Show widget where user can select post
    // DEBUG: Now use first post in list
    currentPostId = posts[0].id
    // if (consoleDebug) console.log('POST ID - first in list, list length > 1')
  }
  // No any post
  else {
    if (consoleDebug) console.error("!!! User Company has no any POST !!!")
    // DEBUG: stay at previous page.
  }

  // Now we have valid user Post ID.
  return currentPostId ? String(currentPostId).toLowerCase() : null
}

/**
 * Validate Post ID
 */
export function validatePostId(postId, store) {
  let isValid = true
  // Get available posts list of the user in current company
  let posts = store.getters[`app/account/getPosts`]()

  // Check Post Id in current company posts list.
  if (posts.length < 1 || posts.some(el => el.id == postId) === false) {
    isValid = false
  }
  return isValid
}

/**
 * 
 * @param {object} route router param, resolving path 'to'
 * @param {object} store App Store object
 * 
 * @returns {object} {companyID, postID, validRoute} detected company ID, post ID & valid next route with params
 */
export function getRouteData(route, store) {
  let currentCompanyId = null
  let currentPostId = null
  let validRoute = {}
  let companyIdFromUrl = route.params.cid
    ? route.params.cid.toLowerCase()
    : null
  let postIdFromUrl = route.query.pid
    ? route.query.pid.toLowerCase()
    : null
  // console.log("Post ID from URL: " + postIdFromUrl)
  let posts = store.getters[`app/account/getPosts`]()

  // Detect valid Company ID.
  currentCompanyId = detectCompanyId(route, store)
  // console.log("Detected company ID: " + currentCompanyId)
  saveCompanyId(currentCompanyId, store)

  // Detect valid Post ID.
  currentPostId = detectPostId(route, store)
  // console.log("Detected Post ID: " + currentPostId)
  savePostId(currentPostId, store)

  // Validate Company & Post ID
  if (_.isEmpty(companyIdFromUrl) || companyIdFromUrl != currentCompanyId
    || ((_.isEmpty(postIdFromUrl) && posts.length > 1) || (postIdFromUrl != currentPostId))) 
  {
    // Invalid data found.
    validRoute = {
      // path: '',
      name: route.name ? route.name : 'wellcome', // TODO: 'help' ???
      params: Object.assign({}, route.params, { cid: currentCompanyId }),
      query: Object.assign({}, route.query, { pid: currentPostId }),
      hash: route.hash ? route.hash : ''
    }
    // console.log("Invalid Company ID or Post ID found, this is valid route:")
    // console.log(validRoute)
  }

  return { 
    currentCompanyId, 
    currentPostId, 
    validRoute
  }
}
