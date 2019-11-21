<template>
  <div class="d-file-uploader">
    <input class="d-file-uploader__input" type="file" ref="file" @change="onChangeInputFile">
    <v-btn icon flat @click="selectInputFile">
      <v-icon>mdi-attachment</v-icon>
    </v-btn>
  </div>
</template>
<script>
import componentMixin from './Base'
export default {
  mixins: [componentMixin],
  name: 'DFileUploader',
  methods: {
    selectInputFile() {
      if (this.$refs && this.$refs.file) {
        this.$refs.file.click()
      }
    }
  }
}
</script>
<style lang="scss">
.d-file-uploader__input {
  opacity: 0;
  visibility: hidden;
  position: absolute;
  width: 0.1px;
  height: 0.1px;
  overflow: hidden;
  position: absolute;
  z-index: -1;
}
</style>
