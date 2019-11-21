<template>
  <v-card>
    <v-toolbar card dark dense :color="color">
      <v-icon v-if="icon">{{icon}}</v-icon>
      <v-toolbar-title>{{ title }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon @click.native="cancelEvent()">
        <v-icon>clear</v-icon>
      </v-btn>
    </v-toolbar>
    <v-card-text>{{ message }}</v-card-text>
    <v-divider></v-divider>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="grey" flat @click.native="cancelEvent()">{{cancelText}}</v-btn>
      <v-btn color="primary darken-1" flat @click.native="agree()">{{okText}}</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import dialogMixin from '@/components/DialogManager/mixins/dialog'
export default {
  name: 'DConfirm',
  mixins: [dialogMixin],
  props: {
    message: {
      type: String,
      default: 'Вы уверены?'
    },
    icon: {
      type: String,
      default: 'mdi-alert-circle-outline'
    },
    title: {
      type: String,
      default: 'Внимание'
    },
    cancelText: {
      type: String,
      default: 'Отмена'
    },
    okText: {
      type: String,
      default: 'Да'
    },
    color: {
      type: String,
      default: 'primary'
    }
  },
  methods: {
    agree() {
      this.$emit('confirm')
    }
  }
}
</script>