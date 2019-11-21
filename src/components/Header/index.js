import CommonHeader from './src/CommonHeader'

function install(Vue, options = {}) {
  Vue.component(CommonHeader.name, CommonHeader)
}

export default {
  install
}
