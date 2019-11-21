<template>
  <v-menu 
    v-if="!isUpdating"
    bottom
    offset-y
    class="logo-link"
    :style="{ marginLeft: hasPostContext ? '14px' : '0' }"
  >
    <img v-if="hasPostContext && logo.image_url && $vuetify.breakpoint.mdAndUp"
      :src="logo.image_url"
      slot="activator"
      :style="logoStyle"
    >
    <span v-else
      slot="activator"
      :style="logoStyle"
    >
      {{ logoText }}
    </span>
    <v-list style="width: 244px;">
      <v-list-tile v-for="item in companies" :key="item.id" :to="routeCompanyHome(item.id)">
        <v-list-tile-title>{{ item.name }}</v-list-tile-title>
      </v-list-tile>
      <v-list-tile :to="routeAccount()" exact>
        <v-list-tile-title>Личный кабинет</v-list-tile-title>
      </v-list-tile>
      <v-list-tile @click="logout">
        <v-list-tile-title>
          Выход <v-icon>mdi-logout-variant</v-icon>
        </v-list-tile-title>
      </v-list-tile>
    </v-list>
  </v-menu>
  <span v-else :style="logoStyle" v-html="defaultLogo.text"></span>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  name: 'AppLogo',

  computed: {
    ...mapState(`app/layout`, [
      'routeStatus',
      'routeError',
      'isDarkTheme',
      'hasPostContext',
      'isUpdating'
    ]),
    ...mapState(`app/account`, ['postId', 'companies', 'logo', 'defaultLogo']),
    ...mapGetters('app/layout', ['getRouteData']),
    ...mapGetters('app/account', {
      logoStyle: 'getLogoStyle'
    }),
    logoText: function() {
      let text = this.hasPostContext
        ? this.logo.text 
        : 'Личный Кабинет'
      return text
    }
  },

  methods: {
    routeAccount: function() {
      return this.getRouteData({ name: 'account' })
    },

    routeCompanyHome: function(cid) {
      return this.getRouteData({ name: 'org.hierarchy', params: { cid } })
    },
    
    logout() {
      this.$store.dispatch("app/account/signOut").then(() => {
        //document.location.assign(process.env.APP_AUTH_URL || '/')
        //this.$router.push({ name: 'auth' })
        //CLEAR STORE
        document.location.assign('/')
      })
    }
  }
}
</script>

<style>
  .logo-link{
    /* margin: 0 !important; */
    height: 48px;
    overflow: hidden;
  }
</style>