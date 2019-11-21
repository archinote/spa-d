<template>
  <div style="height: 100%;">
  <!-- <div style="height: calc(100% - 48px);">
    <v-toolbar v-if="false" dense flat>
      <v-toolbar-items>
        <v-btn
          flat
          v-for="item in menuItems" :key="item.name"
          :to="getRouteData(item)"
        >{{ item.title }}</v-btn>
      </v-toolbar-items>
    </v-toolbar> -->

    <transition name="fade" mode="out-in">
      <router-view />
    </transition>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import appStore from './store'

export default {
  name: 'BPM',

  computed: {
    ...mapState(`app/account`, ['companyId', 'postId']),
    ...mapGetters('app/layout', ['getRouteData']),
    bpmAccesses() {
      return this.$store.state.app.account.accesses['bpm'] || {}
    },
    // Local menu items must be sensitive to company ID changing
    menuItems() {
      let items = []

      if (this.bpmAccesses.catalog_access) 
        items.push({ title: 'Каталог', name: 'bpm.catalog', params: { cid: this.companyId } })
      if (this.bpmAccesses.executor_access) 
        items.push({ title: 'Исполнение', name: 'bpm.monitor', params: { cid: this.companyId } })
      if (this.bpmAccesses.supervisor_access) 
        items.push({ title: 'Мониторинг', name: 'bpm.super-monitor', params: { cid: this.companyId } })
      if (this.bpmAccesses.designer_access) 
        items.push({ title: 'Конструктор', name: 'bpm.designer', params: { cid: this.companyId } })

      return items
    }
  },

  created() {
    // Add application Store module.
    this.$store.registerModule('bpm', appStore)
  },

  destroyed() {
    // Un-register this app store module.
    this.$store.unregisterModule('bpm')
  }
}
</script>

<style lang="scss">
.bgs-container {
  position: relative;
  height: 100%;

  & > .layout > .flex {
    z-index: 1;
  }

  &:after {
    content : "";
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity : 0.2;
    z-index: 0;
    background-image: url('/static/bg/flower-image.jpg');
    // box-shadow: inset 0 0 10px 2px rgba(0,0,0,0.25);
  }
}

.monitor-data-table {
  table { 
    tr:not(.v-datatable__expand-row) {
      cursor: pointer;
    }
  }
}

.v-treeview-node {
  &__content {
    cursor: pointer;

    label {
      cursor: pointer;
      font-size: 1rem;
    }
  }
  
  &--active {
    background: none !important;

    label, .v-treeview-node__label {
      color: rgb(25, 118, 210);
    }
  }

  &__root:hover {
    background: none !important;
    color: rgba(25, 118, 210, 0.6);

    label, .v-treeview-node__label { 
      color: rgba(25, 118, 210, 0.6);
    }
  }
}
</style>
