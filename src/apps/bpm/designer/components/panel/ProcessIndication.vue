<template lang="html">
  <div>

    <el-collapse v-model="activeNames" :accordion="false">

      <el-collapse-item title="Индикаторы и Состояния" name="1">
        <ProcessIndicators :id="id" />
      </el-collapse-item>

      <el-collapse-item title="Настройки Индикации" name="2">
        <ProcessPortStateSettings :id="id" />
      </el-collapse-item>

    </el-collapse>

  </div>
</template>

<script>
  import ProcessIndicators from "./ProcessIndicators"
  import ProcessPortStateSettings from './ProcessPortStateSettings'

  export default {
    components: {
      ProcessIndicators,
      ProcessPortStateSettings
    },

    props: {
      id: {
        type: [String, Number],
        default: null
      }
    },

    data() {
      return {
        formData: null,
        loading: false,
        error: '',

        activeNames: ['1', '2']
      }
    }
  }
</script>

<style lang="scss">
</style>
