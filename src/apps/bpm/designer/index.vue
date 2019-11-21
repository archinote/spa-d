<template>
  <div style="height: calc(100% - 48px);">
    <tool-bar >
    </tool-bar>

    <transition name="fade" mode="out-in">
      <router-view></router-view>
    </transition>
  </div>
</template>

<script>
// Element UI
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/ru-RU'
import Vue from 'vue'
Vue.use(ElementUI, { locale })

import { mapState, mapGetters } from 'vuex'

import appStore from './store'

import ToolBar from './components/ToolBar'

export default {
  name: 'BPMDesigner',

  components: {
    ToolBar
  },

  data () {
    return {
      clipped: false,
      drawerLeft: false,
      fixed: false,
      miniVariant: false,
      right: true,
      drawerRight: true
    }
  },

  computed: {
    bigScreen: function() {
      return Boolean(this.$vuetify.breakpoint.width > 1264)
    },
    ...mapGetters('app/layout', ['getRouteData'])
  },

  watch: {
    '$route' (to, from) {
      if (to && to.name && to.name === 'bpm.designer.new') {
        this.createNewProcess()
      } else if (to && to.name && to.name === 'bpm.designer.home') {
        // Show left sidebar for designer 'home' route
        this.drawerLeft = true
      }
    }
  },

  created() {
    // App can not start from "create new process" route.
    // If so, redirect to 'home' route.
    if (this.$router.currentRoute.name === 'bpm.designer.new') {
      this.$router.push(this.getRouteData({ name: 'bpm.designer.home' }))
    } else if (this.$router.currentRoute.name === null) {
      this.$router.push(this.getRouteData({ name: 'bpm.designer.home' }))
    }

    // Add application Store module.
    this.$store.registerModule(['bpm', 'designer'], appStore, { preserveState: false })
  },

  destroyed() {
    this.$store.unregisterModule(['bpm', 'designer'])
  },

  methods: {
    createNewProcess: function () {
      this.$store.dispatch('bpm/designer/process/create', {
        name: "Новый Бизнес-процесс",
        description: "Описание нового бизнес-процесса"
      }).then(process => {
        if (process && process.id) {
          this.$dmsSuccessNoty('Новый бизнес-процесс успешно создан')

          // After process successfully created redirect to its edit route
          this.$router.replace(this.getRouteData({ name: 'bpm.designer.edit-process', params: { processId: process.id } }))
        } else {
          console.warn("App.vue, create new Process -- process ID missing.");
        }
      }).catch(error => {
        console.warn(error)
        this.$dmsErrorNoty('Произошла ошибка при создании бизнес-процесса')
      })
    }
  }
}
</script>

<style lang="scss">
.el-dialog, .el-dropdown-menu, .el-popper {
  font-family: Arial, Helvetica, sans-serif;
}

// Align width of menu items
.menu-catalog {
  & > .v-menu {
    width: 100%;

    .v-menu__activator > div { 
      width: 100%; 
    }
  }
}
</style>
