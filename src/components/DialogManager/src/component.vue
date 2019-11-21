<template>
  <v-dialog ref="dialog" v-bind="dialogProps" v-model="visible" v-on="dlgListeners">
    <component ref="component" v-if="component" v-bind="props" :is="component" v-on="componentListeners"></component>
    <v-card ref="component" v-else>
      <v-toolbar card dark dense color="primary">
        <v-toolbar-title>Dialog</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon @click.native="cancel()">
          <v-icon>clear</v-icon>
        </v-btn>
      </v-toolbar>Default component
    </v-card>
  </v-dialog>
</template>
<script type="text/babel">
import { cloneDeep, peak } from 'lodash'
export default {
  provide() {
    return {
      popupDialog: this
    }
  },
  data() {
    return {
      component: null,
      props: null,
      listeners: {},
      dialogListeners: {},
      visible: false,
      hide: false,
      fullscreen: false
    }
  },
  watch: {
    hide(newVal, oldVal) {
      this.$nextTick(_ => {
        if (this.dialogVm && this.dialogVm.overlay) {
          this.dialogVm.overlay.hidden = this.hide
        }
      })
    },
    visible(newVal, oldVal) {
      if (newVal === false) {
        this.$emit('close')
      }
    }
  },
  methods: {
    close() {
      this.$emit('close')
    },
    cancel() {
      this.$emit('close')
    }
  },
  computed: {
    dialogProps() {
      const { maxWidth, maxHeight, persistent, scrollable, contentClass } = this
      return { maxWidth, maxHeight, persistent, scrollable, contentClass, fullscreen: this.fullscreen }
    },
    dialogVm() {
      return this.$refs.dialog
    },
    componentVm() {
      return this.$refs.component
    },
    componentListeners() {
      let result = {
        ...this.listeners,
        cancel: this.cancel
      }
      return result
    },
    dlgListeners() {
      let result = {
        ...this.dialogListeners
      }
      return result
    }
  }
}
</script>
