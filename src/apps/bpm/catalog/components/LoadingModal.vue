<template lang="html">
  <v-dialog v-model="visible" persistent max-width="440">
    <loading></loading>
  </v-dialog>
</template>

<script>
  export default {
    props: {
      visible: {
        type: Boolean,
        default: false
      }
    }
  }
</script>
