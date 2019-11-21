<template>
  <div v-if="show">
    <el-alert
      :title="msg"
      :type="type"
      show-icon
      @close="$emit('hide-alert')"
      style="margin-bottom: 16px;"
    />
  </div>
</template>
<script>
export default {
  props: {
    msg: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: 'info'
    },
    show: {
      type: Boolean,
      default: false
    }
  }
}
</script>
