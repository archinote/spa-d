<template>
  <div>
    <h1>Добро пожаловать в DMS!</h1>
    <p v-if="isAccountActive">Для перехода в личный кабинет используйте <router-link :to="{ name: 'account' }">ссылку</router-link>.</p>
    <p v-else="">Для входа в систему используйте <router-link :to="{ name: 'auth' }">ссылку</router-link>.</p>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  name: 'Wellcome',

  computed:{
    ...mapGetters('app/layout', ['getRouteData']),
    ...mapGetters('app/account', ['isAccountActive'])
  },

  methods: {
    routeAccount: function() {
      return this.getRouteData({ name: 'account' })
    },
    routeAuth: function() {
      return this.getRouteData({ name: 'auth' })
    }
  }
}
</script>
