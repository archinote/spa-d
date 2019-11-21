import { dmsConfirm, dmsAgree } from './confirm'
import {
  dmsNoty,
  dmsErrorNoty,
  dmsWarningNoty,
  dmsInfoNoty,
  dmsSuccessNoty
} from './noty'

import { ShowDialog } from '@/components/DialogManager'
import { getRouteWithPost } from './routing'
import routingMixin from './routing'
/**
 * Инициализация хелперов
 *
 * @param {*} Vue
 * @param {*} options
 */
function install(Vue, options = {}) {
  // Add dmsConfirm => resolve(result)
  Vue.prototype.$dmsConfirm = function(options) {
    return dmsConfirm(options, this)
  }
  // Add dmsAgree => resolve() if agree, reject if error
  Vue.prototype.$dmsAgree = function(options) {
    return dmsAgree(options, this)
  }
  // Add dms noty
  Vue.prototype.$dmsNoty = dmsNoty
  // Add dms noty
  Vue.prototype.$dmsErrorNoty = dmsErrorNoty
  // Add dms error noty
  Vue.prototype.$dmsWarningNoty = dmsWarningNoty
  // Add dms warning noty
  Vue.prototype.$dmsInfoNoty = dmsInfoNoty
  // Add dms success noty
  Vue.prototype.$dmsSuccessNoty = dmsSuccessNoty

  //Show dialog
  Vue.prototype.$dmsShowDialog = function(options = {}) {
    if (!options.parent) {
      options.parent = this.$root
    }
    return ShowDialog(options)
  }
  //Routing
  Vue.prototype.$dmsGoto = function(routeData) {
    this.$router && this.$router.push(getRouteWithPost(routeData))
  }
  Vue.prototype.$dmsRedirect = function(routeData) {
    this.$router && this.$router.replace(getRouteWithPost(routeData))
  }
  // Routing mixin
  Vue.mixin(routingMixin)
}

export default {
  install
}
