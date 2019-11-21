<template>
  <div class="d-overlay"></div>
</template>

<script>
export default {
  name: "DOverlay",
  props: {

  },
};
</script>
<style lang="scss">
.d-overlay{
   display: flex;
   position: absolute;
   top:0;
   bottom: 0;
   left: 0;
   right: 0;
}
</style>