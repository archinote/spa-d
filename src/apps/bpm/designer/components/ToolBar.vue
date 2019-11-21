<template>
  <!-- BP Designer Toolbar -->
  <v-toolbar
    clipped-left
    clipped-right
    scroll-off-screen
    flat
    dense
    color="blue lighten-4"
  >
    <v-menu
      offset-y
      bottom
      nudge-bottom="6"
      right
      nudge-left="24"
      v-model="isCatalogMenuVisible"
      :close-on-content-click="false"
      :close-on-click="true"
    >
      <v-btn
        slot="activator"
        :icon="false"
        flat
      >
        Каталог 
        <v-icon v-html="isCatalogMenuVisible ? 'mdi-menu-up' : 'mdi-menu-down'"></v-icon>
      </v-btn>

      <loading v-if="loading" flat :message="false" />

      <v-list v-else-if="false" class="menu-catalog">
        <template v-for="(item, i) in menuItems">
          <!-- item as divider -->
          <v-divider v-if="item.divider" :key="i" class="my-2" />

          <!-- item with submenu -->
          <v-menu v-else-if="item.subModels"
            right
            offset-x
            nudge-right="0"
            min-width="280"
            open-on-hover
            open-delay="100"
          >
            <v-list-tile slot="activator"
              :key="item.id"
              :to="getRouteData({ name: item.routeName, params: { processId: item.processId } })"
            >
              <v-list-tile-action>
                <v-icon color="grey darken-1">{{ item.icon }}</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>
                  {{ item.text }}
                </v-list-tile-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-icon>mdi-menu-right</v-icon>
              </v-list-tile-action>
            </v-list-tile>

            <!-- menu content -->
            <v-list>
              <v-list-tile 
                v-for="subModel in item.subModels" :key="subModel.id" 
                :to="getRouteData({ name: subModel.routeName, params: { processId: subModel.processId } })"
                @click="isCatalogMenuVisible = false"
              >
                <v-list-tile-action v-if="subModel.icon">
                  <v-icon color="grey darken-1">{{ subModel.icon }}</v-icon>
                </v-list-tile-action>
                <v-list-tile-title>{{ subModel.text }}</v-list-tile-title>
              </v-list-tile>
            </v-list>
          </v-menu>

          <!-- item with no submenu -->
          <v-list-tile v-else
            :key="item.id"
            :to="getRouteData({ name: item.routeName, params: { processId: item.processId } })"
          >
            <v-list-tile-action v-if="item.icon">
              <v-icon color="grey darken-1">{{ item.icon }}</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>
                {{ item.text }}
              </v-list-tile-title>
            </v-list-tile-content>
          </v-list-tile>
        </template>
      </v-list>

      <v-card v-else-if="menuItems.length">
        <v-card-text>
          <v-treeview
            :items="menuItems"
            activatable
            :active.sync="active"
            :open.sync="open"
            item-key="processId"
            item-text="text"
            item-children="subModels"
            hoverable
          >
            <!-- NOTE: use it to show item icon before label -->
            <!-- <template slot="prepend" slot-scope="{ item, open }">
              <v-icon small>{{ item.icon }}</v-icon>
            </template> -->
          </v-treeview>
        </v-card-text>
      </v-card>
    </v-menu>

    <v-divider inset vertical />

    <v-toolbar-title v-text="title" class="ml-4 mr-4"></v-toolbar-title>
    
    <template v-if="processId">
      <v-divider inset vertical />

      <v-menu
        offset-y
        bottom
        nudge-bottom="6"
        right
        v-model="isViewMenuVisible"
        :close-on-content-click="false"
      >
        <v-btn
          slot="activator"
          :icon="false"
          flat
        >Вид</v-btn>

        <v-card>
          <v-list>
            <v-list-tile>
              <v-list-tile-action>
                <v-switch v-model="isParametersModeOn"></v-switch>
              </v-list-tile-action>
              <v-list-tile-title>Управление данными</v-list-tile-title>
            </v-list-tile>
          </v-list>
        </v-card>

      </v-menu>

      <v-spacer></v-spacer>

      <v-btn v-if="isDebug" icon @click="$bus.$emit('diagram.reinit')">
        <v-icon>mdi-reload</v-icon>
      </v-btn>
      <v-btn icon @click="$bus.$emit('diagram.fit-zoom')">
        <v-icon>mdi-arrow-all</v-icon>
      </v-btn>

      <v-menu 
        :nudge-width="100" 
        offset-y
        v-model="isProcessMenuVisible"
      >
        <v-btn flat slot="activator">
          Добавить <v-icon>mdi-menu-down</v-icon>
        </v-btn>
        <v-list>
          <v-list-tile @click="$bus.$emit('nested-process.add-new')">
            <v-list-tile-action>
              <v-icon>mdi-animation-outline</v-icon>
            </v-list-tile-action>
            <v-list-tile-title>Вложенный процесс</v-list-tile-title>
          </v-list-tile>
          <v-list-tile @click="$bus.$emit('port.add-new', 'input')">
            <v-list-tile-action>
              <v-icon>mdi-import</v-icon>
            </v-list-tile-action>
            <v-list-tile-title>Входной порт</v-list-tile-title>
          </v-list-tile>
          <v-list-tile @click="$bus.$emit('port.add-new', 'output')">
            <v-list-tile-action>
              <v-icon>mdi-export</v-icon>
            </v-list-tile-action>
            <v-list-tile-title>Выходной порт</v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-menu>

      <v-btn v-if="processId" icon @click="$store.commit('bpm/designer/propertyPanel/switch')">
        <v-icon>mdi-square-edit-outline</v-icon>
      </v-btn>
    </template>
  </v-toolbar>
</template>
<script>
import { mapState, mapGetters } from 'vuex'

const consoleDebug = Boolean(process.env.NODE_ENV !== 'production')

export default {
  data () {
    return {
      isProcessMenuVisible: false,
      isCatalogMenuVisible: false,
      isViewMenuVisible: false,
      loading: false,
      active: [],
      open: [],
      isDebug: consoleDebug
    }
  },

  computed: {
    ...mapState({
      isParametersOn: state => state.bpm.designer && state.bpm.designer.diagramModes 
        ? state.bpm.designer.diagramModes.isParametersOn 
        : false,
      // isIndicationOn: state => state.bpm.designer.diagramModes.isIndicationOn // NOTE: for future use
    }),
    ...mapGetters('app/layout', ['getRouteData']),
    ...mapGetters('bpm/designer', {
      getProcessList: 'process/list'
    }),
    bigScreen: function() {
      return Boolean(this.$vuetify.breakpoint.width > 1264)
    },
    processId: function() {
      return this.$route.params.processId ? this.$route.params.processId : null
    },
    menuItems: function() {
      let items = []

      // items.push({ icon: 'mdi-home', text: 'Главная', routeName: 'home' })
      // items.push({ divider: true })

      items.push({ 
        icon: 'mdi-file-outline',
        text: 'Создать',
        routeName: 'bpm.designer.new',
        processId: 'NEW',
        // subModels: []
      })

      // BP list
      if (this.loading) {
        // items.push({ loader: true })
      } else {
        let list = this.getProcessList()

        if (list && list.length) {
          // items.push({ divider: true })

          list.forEach(item => {
            let _model = {
              icon: 'mdi-file-document',
              text: item.name,
              routeName: 'bpm.designer.edit-process',
              processId: item.id,
              subModels: []
            }

            if (item.sub_process_list) {
              let _subModels = []
              item.sub_process_list.forEach(subModel => {
                _subModels.push({
                  icon: 'mdi-file-document',
                  text: subModel.name,
                  routeName: 'bpm.designer.edit-process',
                  processId: subModel.id,
                })
              })

              if (_subModels.length) _model.subModels = _subModels
            }

            items.push(_model)
          })
        }
      }

      return items
    },
    title: function() {
      const defaultTitle = 'Конструктор бизнес-процессов'
      let processName = ''

      if (this.processId) {
        let process = this.$store.getters['bpm/designer/process/item'](this.processId)

        if (process && process.name) processName = process.name
      }

      return processName ? processName : defaultTitle
    },
    isParametersModeOn: {
      get: function () {
        return this.isParametersOn
      },
      set: function (newValue) {
        this.$store.commit('bpm/designer/diagramModes/setParametersStatus', newValue)
      }
    },
    selected () {
      if (!this.active.length) return undefined

      const id = this.active[0]
      let selected = null

      this.menuItems.forEach(item => {
        if (!selected) {
          if (item.processId === id) { 
            selected = item 
          } else if (item.subModels && Array.isArray(item.subModels) && item.subModels.length) {
            selected = item.subModels.find(_item => _item.processId === id)
          }
        }
      })

      return selected
    }
  },

  watch: {
    selected: function () {
      if (this.selected && this.selected.routeName) {
        // Save selected item properties to be able clear 'active' list later
        let routeName = this.selected.routeName
        let processId = this.selected.processId

        // Hide menu with tree
        this.isCatalogMenuVisible = false
        // And clear tree state
        this.active = []
        this.open = []

        this.$router.push(this.getRouteData({
          name: routeName,
          params: { processId } 
        }))
      }
    }
  },

  mounted () {
    this.init()
  },

  methods: {
    init: function () {
      // Show loading indicator in processes menu.
      this.loading = true

      // Получить список бизнес-процессов для использования их в меню.
      this.$store.dispatch('bpm/designer/process/list').then(processes => {
      }).catch(error => {
        console.warn(error)

        this.$dmsErrorNoty('Произошла ошибка при загрузке списка бизнес-процессов')
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>
<style lang="scss">
</style>
