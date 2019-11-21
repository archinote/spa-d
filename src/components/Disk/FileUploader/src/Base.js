import FileUploader from './FileUploader'
export default {
  props: {
    autoUpload: {
      type: Boolean,
      default: false
    },
    uploadUrl: {
      type: String,
      required: true
    }
  },
  methods: {
    selectInputFile() {
      if (this.$refs && this.$refs.file) {
        this.$refs.file.click()
      }
    },
    onChangeInputFile(e) {
      let files = e.target.files || e.dataTransfer.files
      if (!files.length) return
      for (let i = 0; i < files.length; i++) {
        let file = new FileUploader(files[i], this.uploadUrl)
        if (this.autoUpload) {
          file.upload()
        }
        this.$emit('file-added', file)
      }
    }
  }
}
