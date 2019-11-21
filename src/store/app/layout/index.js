/**
 * Layout store module.
 * Состояния шаблона.
 */
// import apiAccount from '@/apps/account/api'
// import apiOrg from '@/api/org/'
import { assign, merge } from 'lodash'

const state = {
  route: {},
  routeStatus: '',
  isPostUpdating: false,
  isAppLoading: false,
  /* available values:
    'loading' -
    'accessDenied' - 
    'notSignedIn'
    'notFound' - 
    'error' - 
    'ok' || 'success' - 
  */
  routeError: {}, // error - { code: <number>, text: <string>'Message text' }
  initialLoading: false,
  isAppLoaded: false,
  skipAccessCheck: false,
  isPublic: false,
  hasPostContext: false,

  // ...

  //Доступные темы оформления
  themes: [
    {
      id: "light", //Идентификатор
      name: "Светлая", //Название
      color: "primary",
      appClass: "light", //Класс темы приложения  (добавляется d-application__theme-)
      dark: false, //Приложение в темных тонах
      toolbarColor: "primary", // Цвет панели
      toolbarDark: true //Темная ли панель
    },
    {
      id: "dark",
      name: "Темная",
      color: "secondary",
      appClass: "dark",
      dark: true,
      toolbarColor: "secondary",
      toolbarDark: true
    }
  ],
  //Идентификатор текущей темы
  themeID: "light"
}

const getters = {
  getRouteData: (state) => (data) => {
    let routeData = {}
    
    // routeData = Object.assign({}, state.route, data)
    routeData = Object.assign({}, state.route)
    
    // Filter query params in case of new route name
    if ((state.route.name || '') !== (data.name || '')) {
      let clearQuery = {}

      // TODO: implement check for 'keepQuery' option
      // if (!data.keepQuery) {}

      for (var prop in routeData.query) {
        if (['pid', 'continue'].includes(prop)) clearQuery[prop] = routeData.query[prop]
      }

      routeData.query = clearQuery
    }

    // routeData = Object.assign({}, routeData, data)
    routeData = merge({}, routeData, data)

    // console.log("'App/layout' Store, getRouteData, routeData:")
    // console.log(routeData)
    return routeData
  },
  
  themes(state) {
    return state.themes;
  },
  themesObject(state) {
    let result = {};
    state.themes.forEach(theme => {
      result[theme.id] = theme;
    });
    return result;
  },
  //Текущая тема или первая доступная
  theme(state, getters) {
    return getters.themesObject[state.themeID] || state.themes[0];
  },
  //Темная тема
  isDarkTheme(state, getters) {
    return getters.theme && !!getters.theme.dark;
  },
  //Идентификатор активной темы
  themeID(state, getters) {
    let theme = getters.theme;
    return (!!theme && theme.id) || null;
  },
  toolbarTextColorClass: (state, getters) => {
    let theme = getters['theme']
    return state.isPostUpdating
      ? (theme.toolbarDark ? 'grey--text' : 'grey--text')
      : (theme.toolbarDark ? 'white--text' : 'black--text')
  },
  toolbarTextColor: (state, getters) => {
    let theme = getters['theme']
    return state.isPostUpdating
      ? (theme.toolbarDark ? 'grey' : 'grey')
      : (theme.toolbarDark ? 'white' : 'black')
  }
}

const mutations = {
  /**
   * Sets current route status
   * @param {object} state 
   * @param {string} status 
   * 'status' available values:
   *   'appLoading' -
   *   'accessDenied' - 
   *   'wrongUrl' - 
   *   'ok' || 'success' - 
   */
  setRouteStatus(state, status = '') {
    state.routeStatus = status
    // Every changing route status stops updating
    state.isPostUpdating = false
  },

  setRouteError(state, error = {}) {
    state.routeError = error
  },

  setUpdating(state) {
    state.isPostUpdating = true
  },

  setAppLoading(state, status) {
    state.isAppLoading = Boolean(status)
  },

  setAppLoaded(state, status) {
    state.isAppLoaded = Boolean(status)
  },

  setSkipAccessCheck(state, status) {
    state.skipAccessCheck = Boolean(status)
  },

  setPublic(state, status) {
    state.isPublic = Boolean(status)
  },
  // setNoPid(state, status) {
  setPostContext(state, status) {
    state.hasPostContext = Boolean(status)
  },
  setInitialLoading(state, value) {
    state.initialLoading = Boolean(value)
  },
  setRoute(state, route) {
    state.route = {
      name: route.name,
      hash: route.hash,
      params: route.params,
      query: route.query,
      path: route.path
    }
  },

  // ...

  /**
   * Назначение темы оформления
   * @param {*} state
   * @param {*} theme
   */
  setTheme(state, id) {
    state.themeID = id;
  },
  /**
   * Назначение доступных схем
   * @param {*} state
   * @param {*} theme
   */
  setThemes(state, themes) {
    state.themes = themes;
  }
}

const actions = {
  /**
   * Загрузка настроек темы
   *
   * @param {*} context
   */
  loadTheme(context) {
    return new Promise(resolve => {
      let theme =
        (window.localStorage && window.localStorage.getItem("currentTheme")) ||
        context.getters.themeID;
      context.commit("setTheme", theme);
      resolve(theme);
    });
  },

  /**
   * Сохранение настроек темы
   *
   * @param {*} context
   * @param {*} theme
   */
  saveTheme(context, theme) {
    return new Promise(resolve => {
      context.commit("setTheme", theme);
      window.localStorage && window.localStorage.setItem("currentTheme", theme);
      resolve(theme);
    });
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
