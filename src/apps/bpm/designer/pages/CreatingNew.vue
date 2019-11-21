<template lang="html">
  <div style="height: 100%; padding-top: calc(50% - 180px); width: 75%; margin: 0 auto;">
    <!-- <loading message="Выполняется создание нового процесса. Поалуйста, подождите." /> -->
  </div>
</template>
<script>
export default {
  mounted() {
    this.$store.commit('app/layout/setAppLoading', true)
  },
  destroyed() {
    this.$store.commit('app/layout/setAppLoading', false)
  }
}
</script>
