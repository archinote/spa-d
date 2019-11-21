<template>
  <div>
    <v-toolbar dense flat color="primary" dark>
      <v-toolbar-items>
        <v-btn
          flat
          v-for="item in menuItems" :key="item.name"
          :to="getRouteData(item)"
        >{{ item.title }}</v-btn>
      </v-toolbar-items>
    </v-toolbar>

    <transition name="fade" mode="out-in">
      <keep-alive>
        <router-view></router-view>
      </keep-alive>
    </transition>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import appStore from './store'

export default {
  name: 'ExampleApp',

  computed: {
    ...mapState(`app/account`, ['companyId', 'postId']),
    ...mapGetters('app/layout', ['getRouteData']),
    // Local menu items must be sensitive to company ID changing
    menuItems() {
      let items = []

      items.push({ title: 'Local menu item 1', name: 'example-app.route-1', params: { cid: this.companyId } })
      items.push({ title: 'Local menu item 2', name: 'example-app.route-2', params: { cid: this.companyId } })

      return items
    }
  },

  created() {
    // Register application Store module.
    this.$store.registerModule('example-app', appStore)
  },

  mounted() {
    this.init()
  },
  
  destroyed() {
    // Un-register application Store module.
    this.$store.unregisterModule('example-app')
  },

  methods: {
    init: function () {
      // Set data loading indicator ON
      this.$store.commit('app/layout/setAppLoading', true)

      setTimeout(() => {
        // Set data loading indicator OFF
        this.$store.commit('app/layout/setAppLoading', false)
      }, 2000)
    }
  }
}
</script>
