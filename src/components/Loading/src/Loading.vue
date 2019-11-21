<template>
  <v-card :flat="flat">
    <v-toolbar 
      v-if="hasToolbar"
      :color="color" dark flat dense
    >
      <v-icon>{{ toolbarIcon }}</v-icon>
      <v-toolbar-title>{{ toolbarTitle }}</v-toolbar-title>
    </v-toolbar>
    <v-card-text>
      
      <div v-if="message" :class="'text-' + color + 'text-xs-center py-3'">
        {{ message }}
      </div>

      <div v-if="progress" :class="progress === 'linear' ? 'py-2' : ''">
        <v-progress-linear
          v-if="progress === 'linear'"
          :color="color"
          :height="height"
          indeterminate
        />
        <v-progress-circular
          v-else
          :color="color"
          :size="size" 
          :width="_width" 
          indeterminate 
        />
      </div>

    </v-card-text>
  </v-card>
</template>

<script>
// import { mapState } from 'vuex'

export default {
  name : 'Loading',

  props: {
    message: {
      type: [String, Boolean],
      default: 'Загружаются данные. Пожалуйста, подождите.'
    },
    flat: {
      type: Boolean,
      default: false
    },

    hasToolbar: {
      type: Boolean,
      default: false
    },
    toolbarTitle: {
      type: String,
      default: 'Информация'
    },
    toolbarIcon: {
      type: String,
      default: 'info'
    },

    progress: {
      type: [String, Boolean],
      default: 'linear'
    },
    color: {
      type: String,
      default: 'grey'
    },
    size: {
      type: [Number, String],
      default: 40
    },
    height: {
      type: [Number, String],
      default: 5
    },
    width: {
      type: [Number, String],
      default: 5
    }
  },

  computed: {
    _width: function() {
      return parseInt(this.width)
    }
  },
  
  data() {
    return {
    }
  }
}
</script>

<style>
</style>