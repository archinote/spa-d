<template>
  <v-select
    :label="label"
    :items="list"
    v-model="value"
    item-text="name"
    item-value="id"
    :multiple="multiple"
    chips
    :clearable="clearable"
    :menu-props="{ maxHeight: 'auto' }"
    :hint="hint"
    :persistent-hint="persistentHint"
    :small-chips="smallChips"
    :loading="loading"
  >
    <template slot="selection" slot-scope="{ item, parent, selected }">
      <v-chip
        @input="parent.selectItem(item)"
        :selected="selected"
        :key="item.id"
        :close="multiple"
        :small="smallChips"
      >
        <v-avatar>
          <img v-if="item.photo" :src="item.photo"/>
          <v-icon v-else v-html="item.avatarIcon ? item.avatarIcon : 'mdi-emoticon-neutral'"></v-icon>
        </v-avatar>
        {{ item.fullname ? item.fullname : item.name }}
      </v-chip>
    </template>
    <template slot="item" slot-scope="{ index, item }">
      <template v-if="typeof item !== 'object'">
        <v-list-tile-content v-text="item"></v-list-tile-content>
      </template>
      <template v-else>
        <v-list-tile-avatar>
          <img v-if="item.photo" :src="item.photo"/>
          <v-icon v-else v-html="item.avatarIcon ? item.avatarIcon : 'mdi-emoticon-neutral'"></v-icon>
        </v-list-tile-avatar>
        <v-list-tile-content>
          <v-list-tile-title>{{ item.fullname ? item.fullname : emptyPost }}</v-list-tile-title>
          <v-list-tile-sub-title v-if="item.name" v-html="item.name"></v-list-tile-sub-title>
        </v-list-tile-content>
      </template>
    </template>
  </v-select>
</template>

<script>
import { debounce } from 'lodash'

export default {
  name: 'DBeingSelector',
  
  props: {
    label: {
      type: String
    },
    hint: {
      type: String
    },
    ids: {
      type: Array,
      default: () => []
    },
    postIds: {
      type: Array,
      default: () => []
    },
    containerIds: {
      type: Array,
      default: () => []
    },
    multiple: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: true
    },
    persistentHint: {
      type: Boolean,
      default: false
    },
    smallChips: {
      type: Boolean,
      default: false
    },
    useFaker: {
      type: Boolean,
      default: false
    },
    emptyPost: {
      type: String,
      default: "Назначение на пост отсутствует"
    }
  },

  data() {
    return {
      list: [],
      value: null,
      loading: false
    }
  },

  computed: {
    fakeAvatar: function() {
      return this.$store.getters['app/faker/avatar']()
    },
    fakeName: function() {
      return this.$store.getters['app/faker/fullname']()
    }
  },

  watch: {
    ids: function () {
      this.debouncedLoadData()
    },
    postIds: function () {
      this.debouncedLoadData()
    },
    containerIds: function () {
      this.debouncedLoadData()
    },
    value: function () {
      this.$emit('input', this.value)
    }
  },

  created() {
    this.debouncedLoadData = debounce(this.loadBeings, 250, { 'maxWait': 500 })
  },

  mounted() {
    this.loadBeings()
  },

  methods: {
    // Load posts & containers info by its IDs
    loadBeings: function () {
      this.list = []
      this.loading = false

      let posts = this.postIds && this.postIds.length
        ? this.postIds
        : (this.ids && this.ids.length ? this.ids : [])
      let containers = this.containerIds && this.containerIds.length ? this.containerIds : []

      this.loading = true
      this.$store.dispatch('app/org/entitiesInfo', { posts, containers }).then(response => {
        let _list = Array.isArray(response.posts_data) ? response.posts_data : []
        _list = _list.concat(Array.isArray(response.containers_data) ? response.containers_data : [])

        if (this.useFaker) {
          _list.forEach(_being => {
            // Replace broken avatar
            if (_being.photo === 'http://anketa.lsc/storage/user.png')
              _being.photo = this.fakeAvatar
            // Check for empty name
            if (_being.fullname == '')
              _being.fullname = this.fakeName
          })
        } else {
            _list.forEach(_being => {
                // Replace broken avatar
                if (_being.photo && _being.photo.indexOf('http')<0 && _being.photo.indexOf('base64')<0)
                    _being.photo = '/disk/d/'+_being.photo
            })
        }

        this.list = _list
      }).catch( error => {
        console.warn(error)
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>
