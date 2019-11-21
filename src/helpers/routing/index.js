import store from '@/store'
import { mapGetters } from 'vuex'
/**
 * Get route data with post
 * @todo Нужно смотреть релизацию в хранилище
 * @param {Object} routeData
 */
function getRouteWithPost(routeData) {
  return store.getters['app/layout/getRouteData'](routeData)
}

export { getRouteWithPost }

export default {
  computed: {
    ...mapGetters('app/layout', {
      $dmsRouteWithPost: 'getRouteData'
    })
  }
}
