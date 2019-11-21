<template lang="html">
  <v-container grid-list-lg :fluid="true" class="pa-3 bgs-container">
    <v-layout v-bind="binding">

      <!-- Catalog elements tree -->
      <v-flex sm6 md5 lg4 xl3>
        <v-card class="">
          <v-toolbar color="primary" dark card dense>
            <v-icon>mdi-format-list-bulleted</v-icon>
            <v-toolbar-title>Каталог бизнес-процессов</v-toolbar-title>
          </v-toolbar>

          <v-list two-line v-if="false && listShared.length">
            <v-list-group
              v-for="group in listShared"
              :key="group.code"
              no-action
              prepend-icon="mdi-forum"
            >
              <v-list-tile slot="activator">
                <v-list-tile-content>
                  <v-list-tile-title v-html="group.name"></v-list-tile-title>
                  <!-- <v-list-tile-sub-title v-html="group.description"></v-list-tile-sub-title> -->
                </v-list-tile-content>
              </v-list-tile>

              <v-list-tile
                v-for="item in group.list" :key="item.id"
                @click="selectItem(item)"
                :class="{ 'primary lighten-4': curCatalogItem && curCatalogItem.id === item.id}"
              >
                <v-list-tile-content>
                  <v-list-tile-title>{{ item.name }}</v-list-tile-title>
                  
                  <!-- <v-list-tile-sub-title v-if="item.description'">
                    {{ item.description }}
                  </v-list-tile-sub-title> -->
                </v-list-tile-content>

                <!-- TODO: enable after Favorite API ready -->
                <!-- Favorites switcher -->
                <!-- <v-list-tile-action @click="switchFavorites(item.id)"> -->
                <!-- OR -->
                <!-- Favorites info -->
                <!-- <v-list-tile-action>
                  <v-icon v-if="item.favorite" color="primary lighten-3">favorite</v-icon>
                  <v-icon v-else color="grey lighten-2">favorite_border</v-icon>
                </v-list-tile-action> -->
              </v-list-tile>
            </v-list-group>
          </v-list>

          <v-treeview v-else-if="listShared.length"
            :items="listShared"
            activatable
            :active.sync="active"
            item-key="id"
            item-children="list"
            open-on-click
          >
            <template slot="prepend" slot-scope="{ item, open }">
              <v-icon v-if="item.code">
                {{ open ? 'mdi-folder-open' : 'mdi-folder' }}
              </v-icon>
              <v-icon v-else>
                {{ 'mdi-tournament' }}
              </v-icon>
            </template>
          </v-treeview>
          
          <v-card-text v-else>
            <template v-if="loading">
              <!-- <loading :message="false" flat /> -->
            </template>
            <div v-else-if="listShared.length < 1">
              <v-alert outline color="primary" icon="mdi-information" value="true">
                Нет элементов для отображения.
              </v-alert>
            </div>
          </v-card-text>
        </v-card>
      </v-flex>

      <!-- Selected catalog element info -->
      <v-flex sm6 md7 lg8 xl9>
        <div v-if="!loading">
          <template v-if="curCatalogItem">
            <CatalogItemInfo
              :name="curCatalogItem.name"
              :description="curCatalogItem.description"
              :tag="curCatalogItem.tag"
              :publicationID="curCatalogItem.id"
              :portID="curCatalogItem.port_id"
              :timeLimit="curCatalogItem.time_limit"
              :timeLimit2="0"
              :deferred="curCatalogItem.deferred"
              :favorite="curCatalogItem.favorite"
              :favoriteUpdating="isFavoriteUpdating"
              v-on:switchFavorites="switchFavorites"
              v-on:runPublication="showPublicationForm"
            />
          </template>
          <template v-else-if="listShared.length">
            <v-alert outline color="primary" icon="mdi-information" value="true">
              Выберите элемент из каталога.
            </v-alert>
          </template>
          <template v-else>
            <v-alert outline color="primary" icon="mdi-information" value="true" class="mb-3">
              Каталог пуст. 
              Нажмите <v-btn flat icon v-on:click="loadCatalogData" color="green"><v-icon>cached</v-icon></v-btn> для обновления.
            </v-alert>
          </template>
        </div>
      </v-flex>

    </v-layout>
  </v-container>
</template>

<script>
import { isEmpty } from 'lodash'
import CatalogItemInfo from './CatalogItemInfo'
import LoadingModal from './LoadingModal'
import RunPublication from './RunPublication'

import time_limit from '../mixins/time_limit'
import monitor from '../mixins/monitor'

const consoleDebug = Boolean(process.env.NODE_ENV == 'development')

export default {
  mixins: [time_limit, monitor],

  components: {
    CatalogItemInfo,
    LoadingModal,
    RunPublication
  },

  computed: {
    binding () {
      const binding = {}

      if (this.$vuetify.breakpoint.smAndDown) binding.column = true
      else binding.row = true

      return binding
    },
    selected () {
      if (!this.active.length) return undefined

      const id = this.active[0]

      let selected = null

      this.listShared.forEach(item => {
        if (item.list && Array.isArray(item.list) && item.list.length) {
          selected = item.list.find(_item => _item.id === id)
        }
      })

      return selected
    }
  },

  data() {
    return {
      listShared: [],
      curCatalogItem: '',
      active: [],

      isLoadingModalVisible: false,
      isFavoriteUpdating: false,
      loading: false
    }
  },

  watch: {
    loading: function () {
      this.$store.commit('app/layout/setAppLoading', this.loading)
    },
    selected: function () {
      this.selectItem(this.selected)
    }
  },

  mounted() {
    this.loadCatalogData() // DEBUG:
  },

  methods: {
    showPublicationForm: function(publicationId) {
      this.$store.dispatch('confirmer/ask', {
        width: 800,
        toolbar: false,
        title: this.curCatalogItem.name,
        // body: this.curCatalogItem.description,
        component: RunPublication,
        props: {
          id: publicationId
        },
        confirmText: 'Запустить',
        cancelText: 'Отменить'
      })
    },

    // Get list of shared publications from server
    loadCatalogData: function () {
      this.loading = true
      this.$store.dispatch('bpm/catalog/publication/list').then(list => {
        // NOTE: Fix some server data issues
        list.forEach(item => {
          if (item.code) item.id = item.code
        })
        this.listShared = list
      }).catch(error => {
        console.warn(error)
        this.$dmsErrorNoty('Произошла ошибка при получении данных от сервера.')
      }).finally(() => {
        this.loading = false
      })
    },

    selectItem: function (curItem) {
      this.curCatalogItem = curItem
    },

    switchFavorites: function (publicationId) {
      var apiPath
      var params
      var item

      // Search for catalog item by its publication id.
      this.listShared.forEach( group => {
        if (typeof item === 'undefined' && Array.isArray(group.list)) {
          item = group.list.find( element => {
            return element.id == publicationId
          } )
        }
      } )

      if ( item ) {
        if (this.curCatalogItem.favorite) {
          apiPath = this.$apiHosts.bpCatalog.favorites.remove.replace( '{publication_id}', publicationId )
        } else {
          apiPath = this.$apiHosts.bpCatalog.favorites.add.replace( '{publication_id}', publicationId )
        }

        this.isFavoriteUpdating = true

        this.$http.patch( apiPath ).then(response => {
          if (response.status == 200) {
            // Switch 'favorites' state.
            this.curCatalogItem.favorite = !this.curCatalogItem.favorite

            // Show info message
            let msg = this.curCatalogItem.favorite
              ? 'Публикация добавлена в избранное'
              : 'Публикация удалена из избранного'
            this.$dmsSuccessNoty(msg)
          } else {
            this.$dmsErrorNoty('Произошла ошибка при обращении к серверу')
          }
        }).catch(error => {
          console.error(error)
          this.$dmsErrorNoty('Произошла ошибка при обращении к серверу')
        }).finally(() => {
          // Clear loading indicator.
          this.isFavoriteUpdating = false
        })
      }
    }
  } // methods
}
</script>

<style lang="scss">
</style>
