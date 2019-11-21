<template>
  <v-layout row justify-center>
    <v-dialog 
      :value="confirmer.active" 
      persistent 
      :max-width="confirmer.width ? confirmer.width : 480"
      @keydown.esc="cancel()"
    >

      <component v-if="confirmer.form"
        v-bind="confirmer.props"
        :is="confirmer.form"
        @cancel="cancel()"
        @submit="confirm()"
      ></component>

      <v-card v-else>
        <v-toolbar v-if="confirmer.toolbar" :color="getDialogColor( confirmer.type )" dark card dense>
          <v-icon>{{ getDialogIcon( confirmer.type ) }}</v-icon>
          <v-toolbar-title v-if="confirmer.component && confirmer.title">{{ confirmer.title }}</v-toolbar-title>
          <v-toolbar-title v-else>{{ getDialogTitle( confirmer.type ) }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon v-if="confirmer.canCancel" @click.native="cancel()">
            <v-icon>clear</v-icon>
          </v-btn>
        </v-toolbar>

        <v-card-title 
          v-if="confirmer.title && (confirmer.component == null || !confirmer.toolbar)" 
          class="headline"
        >{{ confirmer.title }}</v-card-title>

        <v-card-text v-if="confirmer.body" v-html="confirmer.body"></v-card-text>

        <v-card-text v-if="confirmer.component">
          <component
            :is="confirmer.component"
            v-bind="confirmer.props"
            ref="ccomp"
            @close="cancel()"
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <!-- Cancel button -->
          <v-btn
            v-if="confirmer.canCancel && confirmer.cancelText"
            :disabled="isClosing"
            color="secondary" 
            flat 
            @click.native="cancel()"
          >{{ confirmer.cancelText }}</v-btn>

          <!-- Confirm button -->
          <v-btn 
            color="primary" 
            flat 
            @click.native="confirm()"
            :loading="isClosing"
          >{{ confirmer.confirmText }}</v-btn>

        </v-card-actions>
      </v-card>

    </v-dialog>
  </v-layout>
</template>

<script>
  export default {
    name: 'DConfirmDialog',

    computed: {
      confirmer() {
        return this.$store.state.confirmer
      }
    },

    data: function() {
      return {
        isClosing: false
      }
    },

    methods: {
      confirm() {
        this.isClosing = false
        this.confirmer.resolve(true)

        const submitMethodName = this.confirmer.onSubmit
          ? this.confirmer.onSubmit
          : 'onSubmit'
        const submitMethod = this.confirmer.component 
          && this.confirmer.component.methods 
          && typeof this.confirmer.component.methods[submitMethodName] === 'function'
            ? this.confirmer.component.methods[submitMethodName]
            : null

        if (submitMethod) {
          this.isClosing = true

          // call submitting function with context of dynamic component
          submitMethod.call(this.$refs.ccomp).then(canClose => {
            if (canClose) this.$store.commit('confirmer/DEACTIVATE')
          }).catch(error => {
            // On reject close dialog
            this.$store.commit('confirmer/DEACTIVATE')
          }).finally(() => {
            // set indicator OFF
            this.isClosing = false
          })
        } else {
          this.$store.commit('confirmer/DEACTIVATE')
        }
      },

      cancel() {
        if (this.confirmer.canCancel) {
          this.confirmer.resolve(false)
          this.$store.commit('confirmer/DEACTIVATE')
        }
      },

      getDialogIcon: function ( type = 'info' ) {
        switch (type) {
          case "success":
            return "check_circle"
            break;
          case "info":
            return "info"
            break;
          case "warning":
            return "priority_high"
            break;
          case "error":
            return "warning"
            break;
          case "ask":
            return "help_outline"
            break;
        }
        return "info"
      },

      getDialogColor: function ( type = 'info' ) {
        switch (type) {
          case "ask":
            return "info"
            break;
          default:
            return type
        }
        return type
      },

      getDialogTitle: function ( type = 'info' ) {
        switch (type) {
          case "success":
            return "Сообщение"
            break;
          case "info":
            return "Сообщение"
            break;
          case "warning":
            return "Предупреждение"
            break;
          case "error":
            return "Ошибка"
            break;
          case "ask":
            return "Вопрос"
            break;
        }
        return "Сообщение"
      }
    }
  }
</script>
