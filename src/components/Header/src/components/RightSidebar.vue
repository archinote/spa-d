<template>
  <v-navigation-drawer temporary clipped fixed right :dark="isDarkTheme" v-model="show">
  
    <!--Информация о пользователе -->
    <v-list class="pa-1">
      <v-list-tile avatar :to="routeAccount()" title="Перейти в Аккаунт">
        <v-list-tile-avatar>
          <img :src="accountAvatar(64)" />
        </v-list-tile-avatar>
        <v-list-tile-content>
          <v-list-tile-title>{{ accountFullName }}</v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
      <v-list-tile>
        <v-list-tile-content>
          <v-list-tile-sub-title>
            ID: {{ accountId }}
            <a class="exit-link" @click="logout"><i class="mdi-exit-to-app" aria-hidden="true"></i> Выход</a>
          </v-list-tile-sub-title>
        </v-list-tile-content>
      </v-list-tile>
  
      <v-divider></v-divider>
    </v-list>
  
    <!--Навигация и настройки -->
    <v-expansion-panel>
      <!--Мои группы-->
      <v-expansion-panel-content>
        <div slot="header" class="d-accordion-title">
          <v-icon>mdi-account-multiple</v-icon>
          <span>Мои группы</span>
        </div>
        <v-card flat class="">
          <v-list>
            <!-- <v-list-tile v-for="(item, i) in companies" :key="i" @click="selectCompany(item)"> -->
            <!-- <v-list-tile v-for="item in companies" :key="item.id" :to="getRouteData({ name: 'companyHome', params: { cid: item.id } })"> -->
            <v-list-tile v-for="item in companies" :key="item.id" :to="routeCompanyHome(item.id)">
              <v-list-tile-content>
                <v-list-tile-title>{{item.name}}</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
          </v-list>
        </v-card>
      </v-expansion-panel-content>
  
      <!--Навигация-->
      <!-- TODO: enable ORG tree: v-if="false && ..." -->
      <v-expansion-panel-content v-if="false && hasPostContext">
        <div slot="header" class="d-accordion-title">
          <v-icon>mdi-sitemap</v-icon>
          <span>Навигация по дереву</span>
        </div>
        <v-card flat class="">
          <v-card-text :dark="currentTheme=='secondary'" class="py-0 px-2">
            <!-- <dantser-tree ref="navTree" :selectMode="1" :source="navigation_tree" @node-dblclick="enterPost($event)"></dantser-tree> -->
            <d-tree
              :data="companiesTree"
              :props="defaultTreeProps"
              accordion
              @node-click="handleNodeClick">
            </d-tree>
            <!-- <v-alert :value="true" type="info">
              Tree widget is under construction.
            </v-alert> -->
          </v-card-text>
        </v-card>
      </v-expansion-panel-content>
  
      <!--Настройки-->
      <v-expansion-panel-content>
        <div slot="header" class="d-accordion-title">
          <v-icon>settings</v-icon>
          <span>Настройки</span>
        </div>
        <v-card flat>
          <v-flex px-3 pt-1>
            <v-select :value="theme" @change="saveTheme" :items="themes" label="Выберите тему" item-text="name" item-value="id" hide-details bottom></v-select>
          </v-flex>
          <v-list>
            <v-list-tile>
              <v-list-tile-action>
                <v-switch v-model="message" color="primary"></v-switch>
              </v-list-tile-action>
              <v-list-tile-title>Виджет бизнес процессов</v-list-tile-title>
            </v-list-tile>
            <v-list-tile>
              <v-list-tile-action>
                <v-switch v-model="hints" color="primary"></v-switch>
              </v-list-tile-action>
              <v-list-tile-title>Виджет телефона</v-list-tile-title>
            </v-list-tile>
          </v-list>
        </v-card>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-navigation-drawer>
</template>

<script>
import { mapState, mapGetters, mapActions } from "vuex"
import DTree from "@/components/ElementTree"

export default {
  name: "RightSidebar",
  components: {
    DTree
  },
  props: {
    drawer: {
      type: Boolean,
      required: false,
      default: false
    },
    currentTheme: {
      type: String,
      required: false,
      default: "primary"
    },
    navigation_tree: {
      type: Array,
      required: false,
      default: () => []
    }
  },

  computed: {
    ...mapState('app/layout', ['hasPostContext']),
    ...mapState('app/account', [
      // 'companyId',
      // 'postId',
      'profile',
      'companies',
    ]),
    ...mapGetters('app/account', ['accountAvatar', 'accountFullName', 'accountId']),
    ...mapGetters('app/layout', [
      'theme', //Текущая тема
      'themes', //Список доступных тем
      'isDarkTheme', //Темная ли тема
      'getRouteData'
    ]),
    show: {
      get() {
        return this.drawer
      },
      set(v) {
        this.$emit("toggle", v)
      }
    }
  },

  data() {
    return {
      hints: false,
      message: false,

      companiesTree: [
        {
          label: 'Level one 1',
          children: [{
            label: 'Level two 1-1',
            children: [{
              label: 'Level three 1-1-1'
            }]
          }]
        }, {
          label: 'Level one 2',
          children: [{
            label: 'Level two 2-1',
            children: [{
              label: 'Level three 2-1-1'
            }]
          }, {
            label: 'Level two 2-2',
            children: [{
              label: 'Level three 2-2-1'
            }]
          }]
        }, {
          label: 'Level one 3',
          children: [{
            label: 'Level two 3-1',
            children: [{
              label: 'Level three 3-1-1'
            }]
          }, {
            label: 'Level two 3-2',
            children: [{
              label: 'Level three 3-2-1'
            }]
          }]
        }
      ],

      defaultTreeProps: {
        children: 'children',
        label: 'label'
      }
    }
  },

  methods: {
    ...mapActions("app/layout", {
      saveTheme: "saveTheme"
    }),
    ...mapActions("app/account", {
      signOut: "signOut"
    }),

    routeAccount: function() {
      return this.getRouteData({ name: 'account' })
    },

    routeAuth: function() {
      return this.getRouteData({ name: 'auth' })
    },

    routeCompanyHome: function(cid) {
      return this.getRouteData({ name: 'companyHome', params: { cid } })
    },

    getCompaniesTree: function() {
      return [
        {
          label: 'Level one 1',
          children: [{
            label: 'Level two 1-1',
            children: [{
              label: 'Level three 1-1-1'
            }]
          }]
        }, {
          label: 'Level one 2',
          children: [{
            label: 'Level two 2-1',
            children: [{
              label: 'Level three 2-1-1'
            }]
          }, {
            label: 'Level two 2-2',
            children: [{
              label: 'Level three 2-2-1'
            }]
          }]
        }, {
          label: 'Level one 3',
          children: [{
            label: 'Level two 3-1',
            children: [{
              label: 'Level three 3-1-1'
            }]
          }, {
            label: 'Level two 3-2',
            children: [{
              label: 'Level three 3-2-1'
            }]
          }]
        }
      ]
    },

    handleNodeClick: function() {},

    logout() {
      this.$store.dispatch("app/account/signOut").then(() => {
        // this.$router.push(this.routeAuth())
        // document.location.reload(true)
        document.location.assign(process.env.APP_AUTH_URL || '/')
      })
    },

    selectCompany(company) {
      console.log("RightSidebar component, selected company:")
      console.log(company)

      let postId = company && company.posts[0] && company.posts[0]
        ? company.posts[0].id
        : null

      this.$store.commit('app/account/setPostId', postId)
    },

    enterPost(post) {
      if (post.element_type === "post") {
        localStorage.setItem("DMS-POST-ID", post.id)
        //TODO При необходимости понадобится в дерево запоминать ID анкеты
        //localStorage.setItem("DMS-FORM-ID", post.form_id)
        location.reload()
      }
    }
  }
}
</script>

<style>
.d-accordion-title {
  margin-left: -8px;
}

.d-accordion-title span {
  display: inline-block;
  margin-left: 22px;
  font-weight: 500;
}

.exit-link {
  float: right;
  color: #4f89ec !important;
  cursor: pointer;
  text-decoration: none;
}

.exit-link:hover {
  text-decoration: underline;
}

.expansion-panel__container .header__icon {
  margin-right: -8px !important;
}
</style>