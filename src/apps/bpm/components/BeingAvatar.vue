<template>
  <img v-if="photo" :src="photo" />
  <v-icon v-else-if="being.avatarIcon">{{ being.avatarIcon }}</v-icon>
  <v-icon v-else>mdi-emoticon-neutral</v-icon>
</template>
<script>
export default {
  props: {
    being: {
      type: Object,
      required: true
    }
  },
  computed: {
    photo: function () {
      if (this.being && this.being.photo) {
        if (this.being.photo.indexOf('http') >= 0) {
          return this.being.photo
        } else if (this.being.photo.indexOf('base64') >= 0) {
          return this.being.photo
        } else {
          return '/disk/d/preview/resize/64x64/' + this.being.photo
        }
      }
      return ''
    }
  }
}
</script>
