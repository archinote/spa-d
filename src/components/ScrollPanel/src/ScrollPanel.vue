<template>
  <div class="d-scroll-panel">
    <slot name="header"></slot>
    <div class="d-scroll-panel__content">
      <div ref="scroller" class="d-scroll-panel__scroller">
        <slot></slot>
      </div>
    </div>
    <slot name="footer"></slot>
  </div>
</template>

<script>
export default {
  name: 'DScrollPanel',
  methods: {
    scrollTop(value) {
      if (this.$refs.scroller && this.$refs.scroller.scrollTop) {
        this.$refs.scroller.scrollTop = value
      }
    }
  }
}
</script>

<style lang="scss">
.d-scroll-panel {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  &__content {
    flex: 1 1 auto;
    position: relative;
  }
  &__scroller {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    overflow: auto;
  }
}
</style>
