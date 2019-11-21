<template>
  <div>
    <p>
      <el-alert
        :title="msg"
        type="error"
        show-icon
        :closable="false">
      </el-alert>
    </p>
    <p>
      <el-button size="mini" icon="el-icon-refresh" @click.stop="$emit('reinit')">{{ btn }}</el-button>
    </p>
  </div>
</template>
<script>
export default {
  props: {
    msg: {
      type: String,
      default: 'При выполнении операции произошла ошибка'
    },
    btn: {
      type: String,
      default: 'Обновить'
    }
  }
}
</script>
