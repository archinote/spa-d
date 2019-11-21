<template>
  <transition name="fade" mode="out-in">
    <router-view></router-view>
  </transition>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import appStore from './store'

export default {
  created() {
    // Add application Store module.
    this.$store.registerModule(['bpm', 'catalog'], appStore)
  },

  destroyed() {
    this.$store.unregisterModule(['bpm', 'catalog'])
  }
}
</script>
