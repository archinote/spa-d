<template>
  <div>
    <v-menu offset-y left :close-on-content-click="false" v-model="notificationsmenu" :disabled="isUpdating">
      <v-btn icon slot="activator" :style="{ color: color }" :disabled="isUpdating">
        <v-badge color="red">
          <span slot="badge" v-if="messages_count">{{messages_count}}</span>
          <v-tooltip left>
            <v-icon slot="activator">notifications</v-icon>
            <span>Уведомления</span>
          </v-tooltip>
        </v-badge>
      </v-btn>
      <v-card style="width: 440px; max-width: 100%;">
        <v-tabs grow color="teal darken-2" dark>
          <v-tabs-slider color="yellow"></v-tabs-slider>
          <v-tab href="#tab-system">
            Уведомления
          </v-tab>
          
          <v-tabs-items>
            <v-tab-item value="tab-system">
              <v-card flat style="height:270px; overflow: scroll">
                <v-card-text class="pa-0">
                  <p v-if="list.length===0" class="title pa-4 text-xs-center">Уведомления данного типа отсутствуют</p>
                  <v-list three-line dense v-else>
                    <template v-for="(item, index) in list">
                      <v-list-tile 
                        @click="clickNotification(item)" 
                        :key="item.id"
                        class="notification-item py-1" 
                        :class="{'grey lighten-3':!item.is_viewed}">
                        <v-list-tile-content>
                          <v-list-tile-title :class="{'body-2':!item.is_viewed}"><v-icon v-if="item.type==='system'" size="16">mdi-account-circle</v-icon> {{item.title}}</v-list-tile-title>
                          <v-list-tile-sub-title>{{item.body}}</v-list-tile-sub-title>
                        </v-list-tile-content>
                        <v-list-tile-action>
                          <p class="notification-date">{{item.date}}</p>
                          <v-btn icon class="grey--text" small @click.stop="deleteNotification(index, 'system')"><v-icon>delete</v-icon></v-btn>
                        </v-list-tile-action>
                      </v-list-tile>
                      <v-divider></v-divider>
                    </template>
                  </v-list>
                </v-card-text>
              </v-card>
              <v-flex xs12 class="text-xs-center" v-if="list.length>0">
                <v-btn small class="blue-grey mx-auto" dark @click="setViewed()">Отметить все прочитанными</v-btn>
              </v-flex>
            </v-tab-item>
          </v-tabs-items>
        </v-tabs>
      </v-card>
    </v-menu>

    <!--<v-btn icon :style="{ color: color }" :disabled="isUpdating">
      <v-icon>stay_primary_portrait</v-icon>
    </v-btn>

    <v-btn icon :style="{ color: color }" :disabled="isUpdating">
      <v-icon>forum</v-icon>
    </v-btn>-->

    <v-menu offset-y bottom left :disabled="isUpdating">
      <v-btn icon slot="activator" :style="{ color: color }" :disabled="isUpdating">
        <v-tooltip left>
          <v-icon slot="activator">mdi-help-circle</v-icon>
          <span>Помощь</span>
        </v-tooltip>
      </v-btn>
      <v-list>
        <v-list-tile @click="goToHelp">
          <v-list-tile-title>Помощь</v-list-tile-title>
        </v-list-tile>
        <v-list-tile @click="writeToSupport">
          <v-list-tile-title>Написать в поддержку</v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-menu>

    <v-menu v-if="$vuetify.breakpoint.mdAndUp && hasPostContext"
      left bottom offset-y 
      :close-on-content-click="true" 
      max-width="360" 
      min-width="360" 
      v-model="servicesmenu" :disabled="isUpdating">
      <v-btn icon slot="activator" :style="{ color: color }" :disabled="isUpdating">
        <v-tooltip left>
          <v-icon slot="activator">apps</v-icon>
          <span>Приложения</span>
        </v-tooltip>
      </v-btn>
      <v-card>
        <v-container fluid grid-list-lg text-xs-center>
          <v-layout row wrap justify-center align-center>
            <v-flex xs4 v-for="(serv, index) in services" :key="index">
              <v-card v-if="serv.routeName"
                flat
                tile
                class="service-link"
                :to="getRouteData({ name: serv.routeName, params: { cid } })"
                :exact="serv.exact ? true : false"
              >
                <v-icon x-large>{{serv.icon}}</v-icon>
                <p class="service-name">{{ serv.name }}</p>
              </v-card>
              <v-card v-else flat tile class="service-link" @click.native="goToUrl(serv.url)">
                <v-icon x-large>{{ serv.icon }}</v-icon>
                <p class="service-name">{{ serv.name }}</p>
              </v-card>
            </v-flex>
          </v-layout>
        </v-container>
      </v-card>
    </v-menu>
    <!-- Account header dropdown -->
    <v-menu
      :close-on-content-click="true"
      offset-y left bottom
      min-width="300" 
    >
      <v-btn  
        slot="activator"
        icon 
        :style="{ color: color }"
      >
        <v-tooltip left>
          <v-avatar v-if="accountAvatar(64)" :size="32" slot="activator">
            <img :src="accountAvatar(64)" />
          </v-avatar>
          <v-icon v-else slot="activator">account_circle</v-icon>
          <span>Мой профиль</span>
        </v-tooltip>
        
        <span :class="{'d-user-offline': !isOnline, 'd-user-online': isOnline }"></span>
      </v-btn>

      <v-card>
        <v-list>
          <v-list-tile avatar>
            <v-list-tile-avatar>
              <img :src="accountAvatar(64)" :alt="accountFullName">
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title>{{ accountFullName }}</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>

          <v-divider />
          
          <v-list-tile avatar to="/account" exact>
            <v-list-tile-action>
              <v-icon>mdi-face-profile</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Личный кабинет</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>

          <v-list-tile avatar @click="logout">
            <v-list-tile-action>
              <v-icon>mdi-logout</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>Выход</v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </v-card>
    </v-menu>
    
    <v-dialog v-model="toolsDialog" persistent :max-width="dialogWidth+'px'">
      <component :is="currentComponent" v-bind="formProps" v-if="toolsDialog" @close-dialog="toolsDialog=false"></component>
    </v-dialog>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import AcceptForm from './AcceptForm'
import SupportForm from './SupportForm'
import { isEmpty } from 'lodash'

export default {
  name : 'AppTools',
  
  props:{
    color:{
      type: String,
      required: false,
      default: ''
    }
  },
  
  computed:{
    ...mapState('app/layout', ['hasPostContext', 'isUpdating']),
    ...mapState('app/account', {
      cid: state => state.companyId,
      pid: state => state.postId,
      services: state => state.services,
    }),
    ...mapGetters('app/layout', ['getRouteData']),
    ...mapGetters('app/account', ['accountAvatar', 'accountFullName', 'accountId']),
    ...mapGetters('app/notifications', ['list']),
    messages_count(){
      return this.list.filter( item => item.is_viewed === false ).length
    }
  },

  // watch: {
  //   pid: function() {
  //     console.log("Header Tools component watcher, POST ID changed: " + this.pid)
  //   }
  // },
  
  data() {
    return {
      notificationsmenu: false,
      servicesmenu: false,
      isOnline: true,
      toolsDialog: false,
      formProps: {},
      currentComponent: null,
      dialogWidth: 500
    }
  },
  
  methods : {
    
    deleteNotification(index){
      this.$store.dispatch("app/notifications/delete", index)
    },
    
    setViewed(){
      this.$store.dispatch("app/notifications/viewAll")
    },
    
    goToHelp(){
      if(this.cid)
        this.$router.push(this.getRouteData({ name: 'help.index' }))
      else
        this.$router.push(this.getRouteData({ name: 'help_account.index' }))
    },
  
    writeToSupport(){
      this.dialogWidth = 500
      this.currentComponent = SupportForm
      this.toolsDialog = true
      this.formProps = {}
    },
    
    clickNotification(data){
      this.dialogWidth = 500
      this.currentComponent = AcceptForm
      this.toolsDialog = true
      this.formProps = {
        data: data,
      }
      if(!data.is_viewed) this.$store.dispatch("app/notifications/view", data.sending_id)
      data.is_viewed = true
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
  .d-user-online {
    width: 13px;
    height: 13px;
    background: #1fef1f;
    position: absolute;
    left: 0;
    top: 0;
    border-radius: 8px;
  }
  
  .d-user-offline {
    width: 13px;
    height: 13px;
    background: red;
    position: absolute;
    left: 0;
    top: 0;
    border-radius: 8px;
  }
  
  .service-name{
    height: 40px;
    overflow: hidden;
    margin: 0;
  }
  
  .service-link{
    cursor: pointer;
    border: #fff 1px solid;
  }
  
  .service-link:hover{
    border: #c9c9c9 1px solid;
  }
  
  .notification-item a.list__tile--link{
    height: inherit !important;
  }
  
  .notification-date{
    width: 56px;
    text-align: right;
    white-space: normal;
    font-size: 11px;
    margin-bottom: 8px;
    color: #454545;
  }
</style>