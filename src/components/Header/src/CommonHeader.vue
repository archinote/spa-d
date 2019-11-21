<template>
  <div class="d-application-header">
    <v-toolbar
      app dense
      :clipped-left="true"
      :clipped-right="true"
      :dark="theme.toolbarDark"
      :color="theme.toolbarColor"
      :style="{ backgroundColor: isSmallScreen ? logo.background : 'inherit' }"
      class="color-transition"
    >
  
      <v-tooltip right>
        <v-btn icon v-if="isSmallScreen || hasPostContext" color="primary" @click="switchDrawerLeft" slot="activator">
          <v-icon size="32">{{drawer_icon}}</v-icon>
        </v-btn>
        <span>Поменять отображение меню</span>
      </v-tooltip>
      
      <v-spacer v-if="isSmallScreen"></v-spacer>

      <app-logo />

      <!-- Select post widget -->
      <template v-if="!isSmallScreen">
        <v-flex md3 lg2 v-if="currentCompany && hasPostContext">
          <v-menu
            :close-on-content-click="true"
            offset-y
            min-width="300"
            right
            :disabled="isUpdating"
          >
            <v-btn slot="activator" flat style="text-transform: none;">
              <v-icon v-if="curPost && curPost.name" :color="toolbarTextColor" class="color-transition">mdi-account-star</v-icon>
              <span class="ml-2 compact-line post-title" :class="toolbarTextColorClass">{{ curPostName }}</span>
            </v-btn>
            <v-card>
              <v-list dense subheader>
                <v-subheader inset>Ваши посты</v-subheader>

                <v-list-tile
                  v-for="post in posts" :key="post.id"
                  @click="selectPost(post.id)"
                  avatar
                >
                  <v-list-tile-action>
                    <v-icon v-if="post.id === curPost.id" color="primary">star</v-icon>
                  </v-list-tile-action>
                  <v-list-tile-content>
                    <v-list-tile-title>{{ post.container_name+' ('+post.name+')' }}</v-list-tile-title>
                  </v-list-tile-content>
                </v-list-tile>

                <!--<v-divider />

                <v-subheader inset>Чужие посты</v-subheader>

                <v-list-tile disabled>
                  <v-list-tile-content>
                    <v-list-tile-title>Виджет в разработке</v-list-tile-title>
                  </v-list-tile-content>
                </v-list-tile>-->
              </v-list>
            </v-card>
          </v-menu>
        </v-flex>
      </template>

      <!-- Anketa data: user or account name -->
      <v-flex md3 lg2 v-if="!isSmallScreen">
        <div class="align-vertical color-transition">
          <v-icon :color="toolbarTextColor">mdi-account-card-details</v-icon>
          <span class="body-2 ml-2 color-transition compact-line" :class="toolbarTextColorClass" v-html="userName"></span>
        </div>
      </v-flex>

      <!-- Чужой пост -->
      <v-flex md3 lg2 v-if="!isMyPost && !isSmallScreen && hasPostContext" dark>
        <!-- <p class="mb-0 body-2">{{ another_post }}</p> -->
        <p class="red darken-2 body-2 align-vertical color-transition" :class="toolbarTextColorClass">
          <v-icon>mdi-alert</v-icon>
          <span class="pl-2">Вы просматриваете чужой пост</span>
        </p>
      </v-flex>

      <v-spacer></v-spacer>

      <app-tools v-if="!isSmallScreen" @toggle="drawerRight=$event" />

      <v-btn icon v-if="isSmallScreen" @click="horizontalmenu = !horizontalmenu" :disabled="isUpdating">
        <v-icon>mdi-dots-horizontal</v-icon>
      </v-btn>
    </v-toolbar>

    <!-- <v-layout wrap :style="{ marginTop: '64px', marginBottom: horizontalmenu ? '0' : '-64px' }"> -->
    <v-layout wrap>
      <v-flex v-if="horizontalmenu && isSmallScreen"
        xs12 class="icons-panel grey"
        :class="is_dark(logo.background) ? 'lighten-3' : 'darken-3'"
      >
        <app-tools
          @toggle="drawerRight=$event"
          :color="logo.background"
          :system_notifications="system_notifications"
          :group_notifications="group_notifications">
        </app-tools>
      </v-flex>

      <!-- <right-sidebar
        :drawer="drawerRight"
        :currentTheme="currentTheme"
        :navigation_tree="navigation_tree"
        @change-theme="currentTheme=$event"
        @toggle="drawerRight=$event">
      </right-sidebar> -->

      <left-sidebar v-if="isSmallScreen || hasPostContext"
        style="z-index:1;"
        :currentPost="currentPost"
        :posts="posts"
        :drawer="drawerStates[drawerLeft]"
        @select-post="changePost($event)"
        @select-service="goToUrl($event)"
        @toggle="drawerLeft = $event">
      </left-sidebar>
    </v-layout>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { LeftSidebar, RightSidebar, AppLogo, AppTools } from './components'

const _drawerStates = ['hidden', 'mini', 'full']

export default {
  name: 'DCommonHeader',

  components: {
    LeftSidebar,
    RightSidebar,
    AppLogo,
    AppTools
  },

  data() {
    return {
      drawerRight: false,
      drawerStates: _drawerStates,
      // Set default left sidebar state
      drawerLeft: 1, // 'mini'

      horizontalmenu: false,
      currentTheme: 'primary',
      drawer_icon: 'mdi-dots-vertical',
      
      navigation_tree: [],
      currentPost: {},
      another_post : '',
      system_notifications: [],
      group_notifications: []
    }
  },

  computed: {
    // ...mapState(`app/layout`, [
    //   'routeStatus',
    //   'routeError',
    //   'isDarkTheme',
    // ]),
    curPostName() {
      return this.curPost ? this.curPost.container_name+' ('+this.curPost.name+')' : 'Нет доступного поста'
    },
    ...mapState('app/layout', ['hasPostContext', 'isUpdating']),
    ...mapState(`app/account`, [
      'companyId',
      'postId',
      'companies',
      'isMyPost',
      'logo'
    ]),
    ...mapGetters(`app/layout`, [
      'getRouteData',
      'theme',
      'isDarkTheme',
      'toolbarTextColorClass',
      'toolbarTextColor'
    ]),
    ...mapGetters(`app/account`, {
      currentCompany: 'getCompany',
      userName: 'userFullName'
    }),
    posts() {
      return this.$store.getters[`app/account/getPosts`]()
    },
    curPost() {
      return this.$store.getters[`app/account/getPost`]()
    },
    hasOnePostOnly() {
      return this.posts.length <= 1 && this.isMyPost
    },
    isSmallScreen() {
      return this.$vuetify.breakpoint.smAndDown
    }
  },

  watch: {
    // NOTE: commented. Is it wasted?
    // currentPost: {
    //   handler: function (val, oldVal) {
    //     if (this.currentPost && this.currentPost.id) {
    //       // this.$bus.$emit('post.selectById', this.currentPost.id)
    //       this.$store.commit(`app/account/setPostId`, this.currentPost.id)
    //     }
    //   },
    //   deep: true
    // },
    postId: function() {
      // Post ID changed globally => change value of this.currentPost
      this.currentPost = this.$store.getters[`app/account/getPostById`](this.postId)
    }
  },

  mounted() {
    this.init()
  },
  
  created(){
    this.$bus.$on('notification.new', data => {
      const audio = new Audio('/static/sounds/notification-sound.mp3');
      this.$store.commit('app/notifications/add', data)
      audio.play()
    })

    setInterval( () => {
      this.$store.dispatch('app/notifications/loadNotifications')
    }, 300000 );
  },
  
  destroyed() {
    this.$bus.$off('notification.new')
  },

  methods: {
    init() {
      if (this.hasPostContext) {
        // Set current post
        this.currentPost = this.curPost
      }
    },

    switchDrawerLeft() {
      this.drawerLeft++
      if (this.drawerLeft >= this.drawerStates.length) this.drawerLeft = 0
      
      switch(this.drawerStates[this.drawerLeft]){
        case 'full': this.drawer_icon = 'mdi-menu'; break;
        case 'mini': this.drawer_icon = 'mdi-dots-vertical'; break;
        case 'hidden': this.drawer_icon = 'mdi-arrow-right'; break;
      }
    },

    selectPost(pid) {
      let company = this.$store.getters[`app/account/getCompanyByPostID`](pid)

      this.$router.push(this.getRouteData({ 
        name: 'org.hierarchy',
        params: { cid: company.id },
        query: { pid } 
      }))
    },
    
    is_dark(color) {
      if (color.indexOf("#") === 0) {
        color = color.slice(1);
      }
      // convert 3-digit hex to 6-digits.
      if (color.length === 3) {
        color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
      }
      if (color.length !== 6) {
        throw new Error("Invalid HEX color.");
      }
      const r = parseInt(color.slice(0, 2), 16);
      const g = parseInt(color.slice(2, 4), 16);
      const b = parseInt(color.slice(4, 6), 16);
      return r * 0.299 + g * 0.587 + b * 0.114 < 186;
    }
  }
};
</script>

<style lang="scss">

.compact-line {
  line-height: 1.1;
}

.align-vertical {
  align-items: center;
  display: flex;
  flex: 1 0 auto;
  /* justify-content: center;
  margin: 0 auto; */
  justify-content: left;
  margin-left: 16px;
}

.color-transition {
  transition: color 0.3s ease;
}

.post-title{
  max-width: 250px;
  white-space: nowrap;
  overflow: hidden !important;
  text-overflow: ellipsis;
}
</style>
