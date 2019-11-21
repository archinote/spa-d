<template lang="html">
  <v-container grid-list-xs fluid>
    <v-layout row wrap>

      <template v-if="loading">
        <v-flex xs12 sm6 md4 lg12 xl12>
          <loading :message="false" flat />
        </v-flex>
      </template>

      <template v-else-if="filters">

        <template v-for="(filter, index) in filters">

          <template v-if="filter.type && filter.type === 'checkbox'">
            <v-flex xs12 sm6 md4 lg12 xl12>
              <h3 class="subheading mb-1">{{ filter.name }}</h3>
              <v-checkbox
                v-for="(item, _index) in filter.list" :key="item.id"
                :label="item.name"
                :value="item.id"
                :disabled="item.disabled"
                v-model="filter.values"
                hide-details
              />
            </v-flex>
          </template>

          <template v-else-if="filter.type && filter.type === 'dropcheckbox'">
            <v-flex xs12 sm6 md4 lg12 xl12>

              <!-- v-model="filter.values" -->
              <template v-if="filter.code === 'contractor'">
                <v-select
                  :label="filter.name"
                  v-bind:items="filter.list"
                  v-model="filter.values"
                  item-text="name"
                  item-value="id"
                  multiple
                  chips
                  clearable
                  :menu-props="{ maxHeight: 'auto' }"
                  :hint="filter.description"
                  persistent-hint
                  :small-chips="false"
                >
                  <template slot="selection" slot-scope="data">
                    <v-chip
                      close
                      @input="data.parent.selectItem(data.item)"
                      :selected="data.selected"
                      class="chip--select-multi"
                      :key="JSON.stringify(data.item)"
                    >
                      <v-avatar>
                        <img v-if="data.item.photo" :src="data.item.photo"/>
                        <v-icon v-else-if="data.item.avatarIcon">{{ data.item.avatarIcon }}</v-icon>
                        <v-icon v-else>mdi-emoticon-neutral</v-icon>
                      </v-avatar>
                      {{ data.item.fullname }}
                    </v-chip>
                  </template>
                  <template slot="item" slot-scope="data">
                    <v-list-tile avatar>
                      <template v-if="typeof data.item !== 'object'">
                        <v-list-tile-content v-text="data.item"></v-list-tile-content>
                      </template>
                      <template v-else>
                        <v-list-tile-avatar>
                          <img v-if="data.item.photo" :src="data.item.photo"/>
                          <v-icon v-else-if="data.item.avatarIcon">{{ data.item.avatarIcon }}</v-icon>
                          <v-icon v-else>mdi-emoticon-neutral</v-icon>
                        </v-list-tile-avatar>
                        <v-list-tile-content>
                          <v-list-tile-title v-html="data.item.fullname"></v-list-tile-title>
                          <!-- <v-list-tile-sub-title v-html="data.item.description"></v-list-tile-sub-title> -->
                        </v-list-tile-content>
                      </template>
                    </v-list-tile>
                  </template>
                </v-select>
              </template>

              <template v-else>
                <v-select
                  :label="filter.name"
                  v-bind:items="filter.list"
                  item-text="name"
                  item-value="id"
                  item-disabled="disabled"
                  v-model="filter.values"
                  multiple
                  chips
                  clearable
                  :hint="filter.description"
                  persistent-hint
                >
                  <template slot="selection" slot-scope="data">
                    <v-chip
                      @input="data.parent.selectItem(data.item)"
                      class="chip--select-multi"
                      :selected="data.selected"
                      :disabled="data.disabled"
                      :key="JSON.stringify(data.item)"
                    >
                      <v-avatar class="accent">{{ data.item.name.slice(0, 1).toUpperCase() }}</v-avatar>
                      {{ data.item.name }}
                    </v-chip>
                  </template>
                </v-select>
              </template>

            </v-flex>
          </template>

        </template>

        <!-- <v-flex xs12>
          <div class="text-xs-center">
            <v-btn color="grey" flat @click.native="doReact()">Применить</v-btn>
          </div>
        </v-flex> -->

      </template>

    </v-layout>
  </v-container>
</template>

<script>
import monitor from '../mixins/monitor'

export default {
  mixins: [monitor],

  props: {
    loading: {
      type: Boolean,
      default: false
    },
    filters: {
      type: Array,
      default: function () {
        return []
      }
    },
  },

  data() {
    return {
      // selected: [],
      // checked: [],
      // checked: '',
      // curFilters: this.filters.slice()
    }
  },

  computed: {
    fakeAvatar: function() {
      return this.$store.getters['app/faker/avatar']()
    }
  },

  watch: {
    filters: {
      handler (newVal, oldVal) {
        if (oldVal == null && newVal && newVal.length) 
          this.loadFiltersData()

        this.doReact()
      },
      deep: true
    }
  },

  mounted () {
  },

  methods: {
    loadFiltersData: function () {
      this.filters.forEach(filter => {
        if (filter.code === 'contractor' && Array.isArray(filter.list) && filter.list.length) {
          let posts = filter.list

          // Load posts & containers info by its IDs
          this.$store.dispatch('app/org/entitiesInfo', { posts, containers: [] }).then(response => {
            const postsData = response.posts_data
              ? response.posts_data
              : []

            filter.list.forEach((contractor, index) => {
              let user = postsData.find(_user => Boolean(_user.id == contractor))

              if (user) {
                // Replace broken avatar
                if (user.photo === 'http://anketa.lsc/storage/user.png') 
                  user.photo = this.fakeAvatar
                
                filter.list.splice(index, 1, user)
              }
            })
          }).catch( error => {
            console.warn(error)
          })
        }
      })
    },

    doReact: function () {
      let selected = []

      this.filters.forEach(filter => {
        if (filter.values && Array.isArray(filter.values) && filter.values.length) {
          selected[filter.code] = filter.values.slice()
        }
      })

      // console.log("FiltersContainer, 'filters' watcher handler, SELECTED FILTERS:")
      // console.log(selected)

      this.$emit('filtersChange', selected)
    }
  }
}
</script>

<style lang="scss">
</style>
