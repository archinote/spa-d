export default {
  methods: {
    closeEvent() {
      this.$emit('close')
    },
    cancelEvent() {
      this.$emit('cancel')
    }
  }
}
