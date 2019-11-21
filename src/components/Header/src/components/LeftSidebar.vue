<template>
  <v-navigation-drawer
    v-model="show"
    :temporary="isSmallScreen"
    clipped
    app
    :fixed="true"
    left
    :dark="currentTheme === 'secondary'"
    :mini-variant="mini"
    mini-variant-width="74"
    width="318"
    style="overflow: auto"
  >
    <v-list class="" two-line dense>
      <v-tooltip v-for="(serv, index) in services" :key="index" right>
        <v-list-tile slot="activator"
          :to="getRouteData({ name: serv.routeName, params: { cid } })" 
          :exact="serv.exact ? true : false"
          :title="serv.name"
        >
          <v-list-tile-action class="action-icon">
            <v-icon size="32">{{ serv.icon }}</v-icon>
          </v-list-tile-action>

          <v-list-tile-content>
            <v-list-tile-title>{{ serv.name }}</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
        <span>{{ serv.name }}</span>
      </v-tooltip>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
export default {
  name : 'LeftSidebar',

  props: {
    drawer: {
      type: String
    },
    posts: {
      type: Array,
      required: false,
      default: () => []
    },
    currentTheme: {
      type: String,
      required: false,
      default: 'primary'
    },
    currentPost: {
      type: Object,
      required: false,
      default: () => {}
    }
  },

  computed: {
    ...mapState('app/layout', ['hasPostContext']),
    ...mapState('app/account', {
      cid: state => state.companyId,
      pid: state => state.postId,
      services: state => state.services,
    }),
    ...mapGetters('app/layout', ['getRouteData']),
    show: {
      get() {
        return this.drawer !== 'hidden'
      },
      set(v) {
        // this.$emit('toggle', v ? 1 : 0)
      }
    },
    mini: {
      get() {
        return this.drawer === 'mini'
      },
      set(v) {
        this.$emit('toggle', v ? 1 : 2)
      }
    },
    isSmallScreen() {
      return this.$vuetify.breakpoint.smAndDown
    }
  }
}
</script>

<style scoped>
  .action-icon{
    min-width: 42px;
  }
</style>