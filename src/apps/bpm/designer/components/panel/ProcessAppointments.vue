<template lang="html">
  <div class="">

    <template v-if="loading">
      <loading flat :message="false" />
    </template>

    <template v-if="error">
      <el-alert
        :title="error"
        type="error"
        show-icon
        @close="hideError">
      </el-alert>
    </template>

    <el-collapse v-model="activeNames" :accordion="false">

      <el-collapse-item title="Исполнение" name="1">
        <ProcessExecutors :id="id" :role="1" sub-title="Назначенные исполнители"/>
      </el-collapse-item>

      <el-collapse-item title="Супервизирование" name="2">
        <ProcessExecutors :id="id" :role="2" sub-title="Назначенные супервайзеры"/>
      </el-collapse-item>

    </el-collapse>

  </div>
</template>

<script>
  import ProcessExecutors from './ProcessExecutors'

  export default {
    components: {
      ProcessExecutors
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
    },

    methods: {
      hideError: function() {
        setTimeout( () => {
          this.error = ''
        }, 600)
      }
    }
  }
</script>

<style lang="scss">
</style>
