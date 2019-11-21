<template lang="html">
  <div>

    <p class="caption">
      Управление публикацией процесса через его входные порты.
    </p>

    <!-- Error messages -->
    <template v-if="isError">
      <el-alert
        :title="error"
        type="error"
        show-icon
        @close="hideError">
      </el-alert>
    </template>

    <!-- Loading indicator -->
    <template v-if="loading">
      <loading flat :message="false" />
    </template>

    <!-- Loading error message & reload button -->
    <template v-else-if="onLoadError">
      <p>
        <el-alert
          title="Во время загрузки данных произошла ошибка"
          type="error"
          show-icon
          :closable="false">
        </el-alert>
      </p>
      <p>
        <el-button size="mini" icon="el-icon-refresh" @click="() => init()">Обновить</el-button>
      </p>
    </template>

    <template v-else>
      <template v-if="isPortShared">
        <el-alert
          title="Процесс опубликован через выбранный порт"
          type="success"
          :closable="false">
        </el-alert>
        <p class="caption" style="margin-top: 16px;">
          Вы можете отменить публикацию:
        </p>
        <el-button size="mini" @click.stop="cancelShareProcessPort">
          Отменить публикацию
        </el-button>
      </template>

      <template v-else>
        <el-alert
          title="Публикация ещё не создана."
          type="info"
          :closable="false">
        </el-alert>
        <p class="caption" style="margin-top: 16px;">
          Вы можете создать публикацию:
        </p>
        <el-button size="mini" @click.stop="shareProcessPort">
          Опубликовать в каталоге
        </el-button>
      </template>
    </template>

  </div>
</template>

<script>
import panelForm from '../../mixins/panelForm'

export default {
  mixins: [
    panelForm
  ],

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
      publications: []
    }
  },

  methods: {
    init: function () {
      this.loading = true
      this.onLoadError = false
      this.publications = []

      this.$store.dispatch('bpm/designer/port/publication/list', {
        parentId: this.id
      }).then(list => {
        this.publications = list
      }).catch( error => {
        this.onLoadError = true
        this.$dmsErrorNoty("При получении данных произошла ошибка")
      }).finally(() => {
        this.loading = false
      })
    },

    shareProcessPort: function () {
      this.loading = true

      this.$store.dispatch('bpm/designer/port/item', {
        id: this.id,
        processId: this.processId,
      }).then(port => {
        this.$store.dispatch('bpm/designer/port/publication/create', {
          parentId: this.id,
          item: {
            name: port.name,
            description: port.description ? port.description : "Empty",
            tag: port.tag ? port.tag : "E",
            deferred: port.deferred ? port.deferred : false,
            hold: port.hold ? port.hold : false,
            single: port.single ? port.single : false,
            time_limit: port.time_limit ? port.time_limit : '0',
            time_limit_changeable: port.time_limit_changeable ? port.time_limit_changeable : false
          }
        }).then(response => {
          this.$dmsSuccessNoty("Публикация успешно создана")
        }).catch( error => {
          console.error(error)
          this.$dmsErrorNoty("При выполнении операции произошла ошибка")
        }).finally(() => {
          this.loading = false
          this.init()
        })
      })
    },

    cancelShareProcessPort: function () {
      // NOTE: remove all existing publications.
      if (this.publications && this.publications.length) {
        this.loading = true

        this.publications.forEach((publication, index, array) => {
          if (publication.id) {
            this.$store.dispatch('bpm/designer/port/publication/delete', {
              parentId: this.id,
              id: publication.id
            }).then(response => {
              if (index >= array.length-1) {
                this.loading = false
                this.$dmsSuccessNoty("Публикация порта была успешно отменена")
                this.init()
              }
            }).catch( error => {
              console.error(error)
              this.loading = false
              this.$dmsErrorNoty("При выполнении операции произошла ошибка.")
              this.init()
            })
          }
        })
      }
    }
  }
}
</script>

<style lang="scss">
</style>
