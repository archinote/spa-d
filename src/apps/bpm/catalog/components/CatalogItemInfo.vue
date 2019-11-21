<template lang="html">
  <div>
    <v-card>

      <v-toolbar color="primary" card dense dark>
        <v-icon>mdi-information-outline</v-icon>
        <v-toolbar-title>Информация о публикации</v-toolbar-title>
      </v-toolbar>

      <v-card-text>
        <div class="display-1 my-3" style="position: relative;">
          {{ name }}

          <!-- Favorites switcher -->
          <!-- TODO: enable after API is ready -->
          <!-- <v-btn icon absolute bottom right @click.native="switchFavorites()" :loading="favoriteUpdating">
            <v-icon v-if="favorite" color="amber">favorite</v-icon>
            <v-icon v-else color="grey lighten-2">favorite_border</v-icon>
          </v-btn> -->
        </div>

        <div v-if="description" v-html="description"></div>
      </v-card-text>

      <v-list two-line>

        <!-- Метка -->
        <!-- TODO: enable later -->
        <v-list-tile v-if="false && tag">
          <v-list-tile-action>
            <v-icon color="grey">local_offer</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>{{ tag }}</v-list-tile-title>
            <v-list-tile-sub-title>Метка</v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>

        <!-- Отложенный запуск -->
        <v-list-tile v-if="deferred">
          <v-list-tile-action>
            <v-icon color="grey">alarm_add</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title>Возможность отложенного запуска</v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>

        <!-- Лимит времени -->
        <v-list-tile>
          <v-list-tile-action>
            <v-icon color="grey" v-if="timeLimit">alarm_on</v-icon>
            <v-icon color="grey" v-else>alarm_off</v-icon>
          </v-list-tile-action>
          <v-list-tile-content>
            <v-list-tile-title v-if="timeLimit">{{ getTimeValue( timeLimit ) }} {{ getTimeTitle( timeLimit ) }}</v-list-tile-title>
            <v-list-tile-title v-else>Не установлен</v-list-tile-title>
            <v-list-tile-sub-title>Лимит времени</v-list-tile-sub-title>
          </v-list-tile-content>
        </v-list-tile>

        <!-- <template v-if="false && $bpmDebug.forms">
          <v-list-tile>
            <v-list-tile-action>
              <v-icon color="grey">info_outline</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>{{ publicationID }}</v-list-tile-title>
              <v-list-tile-sub-title>ID публикации</v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
          <v-list-tile>
            <v-list-tile-action>
              <v-icon color="grey">info_outline</v-icon>
            </v-list-tile-action>
            <v-list-tile-content>
              <v-list-tile-title>{{ portID }}</v-list-tile-title>
              <v-list-tile-sub-title>ID порта запуска</v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
        </template> -->

      </v-list>

      <v-card-actions>
        <v-btn color="primary" @click="runPublication()">Запустить</v-btn>
      </v-card-actions>

    </v-card>

  </div>
</template>

<script>
import time_limit from '../mixins/time_limit'

export default {
  mixins: [time_limit],

  props: {
    name: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    tag: {
      type: String,
      default: ''
    },
    deferred: {
      type: [String, Number, Boolean],
      default: ''
    },
    timeLimit: {
      type: [String, Number],
      default: ''
    },
    publicationID: {
      type: [String, Number],
      default: ''
    },
    portID: {
      type: [String, Number],
      default: ''
    },
    favorite: {
      type: Boolean,
      default: false
    },
    favoriteUpdating: {
      type: Boolean,
      default: false
    },
  },

  methods: {
    runPublication: function () {
      this.$emit('runPublication', this.publicationID)
    },

    switchFavorites: function () {
      this.$emit('switchFavorites', this.publicationID)
    }
  }
}
</script>
