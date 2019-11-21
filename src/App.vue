<template>
  <v-app v-if="isSafari9">
    <v-content class="text-xs-center">
      <v-flex xs12 sm6 offset-sm3>
        <div class="pt-5">
          <v-card>
            <v-toolbar color="error" dark flat dense>
              <v-icon>mdi-alert-circle-outline</v-icon>
              <v-toolbar-title>Сообщение об ошибке</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
              <p class="py-4">Пожалуйста, обновите версию своего браузера</p>
            </v-card-text>
          </v-card>
        </div>
      </v-flex>
    </v-content>
  </v-app>
  <v-app v-else>
    <template v-if="['ok', 'success'].includes(routeStatus)">
      <d-toaster />
      <d-common-header v-if="isAccountActive && !isPublic" />

      <v-content>
        <div v-show="isAppLoading" class="loading-mask-layer">
          <Loading message="Загружаются данные приложения. Пожалуйста, подождите." />
        </div>

        <d-confirm-dialog />

        <template v-if="isAccountActive || isPublic">
          <transition name="fade" mode="out-in">
            <router-view v-if="!isPostUpdating"></router-view>
            <template v-else>
              <v-flex xs12 sm6 offset-sm3>
                <div class="pt-5">
                  <Loading message="Загружаются данные поста. Пожалуйста, подождите." />
                </div>
              </v-flex>
            </template>
          </transition>
        </template>
        <!-- ELSE -->
        <template v-else>
          <!-- TODO: create temprary view (ex. - for logout waiting state) -->
          <!-- <p>Account leaved out and this route is not a public.</p> -->
          <v-flex xs12 sm6 offset-sm3>
            <div class="pt-5">
              <Loading 
                message="Происходит завершение сессии. Пожалуйста, подождите." 
                hasToolbar
                color="primary"
              />
            </div>
          </v-flex>
        </template>

      </v-content>
    </template>
    
    <template v-else-if="routeStatus == 'accessDenied'">
      <v-content class="text-xs-center">
        <v-flex xs12 sm6 offset-sm3>
          <div class="pt-5">
            <v-card>
              <v-toolbar color="error" dark flat dense>
                <v-icon>mdi-alert-circle-outline</v-icon>
                <v-toolbar-title>Сообщение об ошибке</v-toolbar-title>
              </v-toolbar>
              <v-card-text>
                <p class="py-4">У вас нет доступа к текущей странице.</p>
                <p>Возможно, Вы не авторизованы или истекла сессия авторизации.</p>
                <!-- <p>Для авторизации перейдите <router-link :to="routeAuth">по ссылке</router-link>.</p> -->
              </v-card-text>
              <v-card-actions>
                <v-btn flat block color="primary" :to="routeAuth">Авторизация</v-btn>
              </v-card-actions>
            </v-card>
          </div>
        </v-flex>
      </v-content>
    </template>
    
    <template v-else-if="routeStatus == 'notSignedIn'">
      <v-content class="text-xs-center">
        <v-flex xs12 sm6 offset-sm3>
          <div class="pt-5">
            <v-card>
              <v-toolbar color="error" dark flat dense>
                <v-icon>mdi-alert-circle-outline</v-icon>
                <v-toolbar-title>Сообщение об ошибке</v-toolbar-title>
              </v-toolbar>
              <v-card-text>
                <p class="py-4">Вы не авторизованы.</p>
                <p>Возможно, истекла сессия авторизации.</p>
                <!-- <p>Для авторизации перейдите <router-link :to="routeAuth">по ссылке</router-link>.</p> -->
              </v-card-text>
              <v-card-actions>
                <v-btn flat block color="primary" :to="routeAuth">Авторизация</v-btn>
              </v-card-actions>
            </v-card>
          </div>
        </v-flex>
      </v-content>
    </template>
    
    <template v-else-if="routeStatus == 'notFound'">
      <v-content class="text-xs-center">
        <v-flex xs12 sm6 offset-sm3>
          <div class="pt-5">
            <v-card>
              <v-toolbar color="error" dark flat dense>
                <v-icon>mdi-alert-circle-outline</v-icon>
                <v-toolbar-title>Сообщение об ошибке</v-toolbar-title>
              </v-toolbar>
              <v-card-text>
                <p class="py-4">Ошибка 404. Указанный путь неверен (такой страницы не существует).</p>
                <!-- <p>Перейти на <router-link :to="{ name: 'wellcome' }">домашнюю страницу</router-link>.</p> -->
              </v-card-text>
              <v-card-actions>
                <v-btn flat block color="primary" :to="{ name: 'auth' }">На домашнюю страницу</v-btn>
              </v-card-actions>
            </v-card>
          </div>
        </v-flex>
      </v-content>
    </template>
    
    <template v-else-if="routeStatus == 'error'">
      <v-content class="text-xs-center">
        <v-flex xs12 sm6 offset-sm3>
          <div class="pt-5">
            <v-card>
              <v-toolbar color="error" dark flat dense>
                <v-icon>mdi-alert-circle-outline</v-icon>
                <v-toolbar-title>Сообщение об ошибке</v-toolbar-title>
              </v-toolbar>
              <v-card-text>
                <p class="py-4" v-html="'Error code: ' + routeError.code + '. ' + routeError.text"></p>
              </v-card-text>
            </v-card>
          </div>
        </v-flex>
      </v-content>
    </template>

    <template v-else-if="routeStatus == 'loading'">
      <v-content class="text-xs-center">
        <v-flex xs12 sm6 offset-sm3>
          <div class="pt-5">
            <Loading 
              message="Приложение загружается. Пожалуйста, подождите." 
              hasToolbar
              color="primary"
            />
          </div>
        </v-flex>
      </v-content>
    </template>
  </v-app>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  name: 'App',

  data() {
    return {
      routeAuth: ''
    }
  },

  computed: {
    ...mapState('app/layout', [
      'routeStatus',
      'routeError',
      'isPublic',
      'isPostUpdating',
      'isAppLoading'
    ]),
    ...mapState('app/account', ['companyId', 'postId']),
    ...mapGetters('app/layout', ['getRouteData']),
    ...mapGetters('app/account', ['isAccountActive']),
    // bigScreen: function() {
    //   return Boolean(this.$vuetify.breakpoint.width > 1264);
    // }
    isSafari9(){
      const browser = this.getBrowser()
      return (browser[0] === 'Safari' && parseInt(browser[1]) < 10)
    }
  },

  mounted() {
    let currentPath = document.location.pathname 
      + (document.location.search ? document.location.search : '')
    if (currentPath === '/') currentPath = ''
    this.routeAuth = this.getRouteData({ name: 'auth', query: { continue: currentPath } })
  },
  
  methods: {
    getBrowser(){
      let ua= navigator.userAgent, tem,
        M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
      if(/trident/i.test(M[1])){
        tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
        return 'IE '+(tem[1] || '');
      }
      if(M[1]=== 'Chrome'){
        tem= ua.match(/\b(OPR|Edge)\/(\d+)/);
        if(tem!= null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
      }
      M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
      if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
      return M
    }
  }
}
</script>

<style lang="scss">
.loading-mask-layer {
  position: absolute;
  display: flex;
  flex: 1 1 auto;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: center;

  width: 100%;
  max-width: 100%;
  height: 100%;
  z-index: 5;
  background: rgba(255, 255, 255, 0.3);
}

@import "./styles/transitions.scss"
</style>
