<template lang="html">
  <v-snackbar
    absolute
    :color="toaster.color"
    :timeout="toaster.timeout"
    :top="toaster.y === 'top'"
    :bottom="toaster.y === 'bottom'"
    :right="toaster.x === 'right'"
    :left="toaster.x === 'left'"
    :multi-line="toaster.mode === 'multi-line'"
    :vertical="toaster.mode === 'vertical'"
    :value="toaster.active"
  >
    {{ toaster.text }}
    
    <!-- Close button -->
    <v-btn icon v-if="toaster.close" flat color="white" @click.native="close()">
      <v-icon>close</v-icon>
    </v-btn>
  </v-snackbar>
</template>

<script>
  export default {
    name: 'DToaster',

    computed: {
      toaster() {
        return this.$store.state.toaster
      }
    },

    methods: {
      close() {
        this.toaster.resolve()
        this.$store.commit('toaster/DEACTIVATE')
      },

      getTypeColor: function ( type ) {
        switch (type) {
          case "success":
          case "info":
          case "warning":
          case "error":
            return String(type)
            break
          default:
            return null
        }
        return null
      }
    }
  }
</script>

<style lang="css">
</style>
