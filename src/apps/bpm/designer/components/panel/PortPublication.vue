<template lang="html">
  <div>
    <el-collapse v-model="activeNames" :accordion="false">
      <el-collapse-item title="Публикация" name="1">
        <PortPublicationShare :id="id" :processId="processId" />
      </el-collapse-item>
      <el-collapse-item title="Доступ к публикации" name="2">
        <PortPublicationAccess :id="id" :processId="processId" />
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
  import PortPublicationShare from "./PortPublicationShare"
  import PortPublicationAccess from "./PortPublicationAccess"

  export default {
    components: {
      PortPublicationShare,
      PortPublicationAccess
    },

    props: {
      id: {
        type: String,
        required: true
      },
      processId: {
        type: String,
        required: true
      }
    },

    computed: {
      isPortShared: function() {
        return this.publications && this.publications.length
      }
    },

    data() {
      return {
        activeNames: ['1', '2']
      }
    }
  }
</script>
