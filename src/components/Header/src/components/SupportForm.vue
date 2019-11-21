<template>
  <v-card>
    <v-form ref="form" v-model="valid" lazy-validation>
      <v-card-title class="headline pb-0">
        Написать в службу поддержки
        <v-spacer></v-spacer>
        <v-btn icon class="mx-0" @click="$emit('close-dialog')">
          <v-icon>close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text class="pt-0">
        <v-textarea label="Текст сообщения" v-model="message.body" :rules="[v => !!v || 'Нужно заполнить поле']" required rows="4" auto-grow></v-textarea>
      </v-card-text>
      <v-card-actions class="pa-3">
        <v-spacer></v-spacer>
        <v-btn class="info" @click="submit" :loading="loading" :disabled="!valid">Отправить</v-btn>
      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script>
import { sendToSupport } from '@/apps/account/api'
export default {
  name: 'SupportForm',

  data() {
    return {
      message: {
        body: ''
      },
      loading: false,
      valid: true,
      emailRules: [
        v => !!v || 'Нужно заполнить поле E-mail',
        v =>
          /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
            v
          ) || 'Неверный формат электроного адреса'
      ]
    }
  },

  methods: {
    submit() {
      if (this.$refs.form.validate()) {
        this.loading = true
        sendToSupport(this.message)
          .then(
            data => {
              this.$dmsSuccessNoty('Сообщение отправлено в службу поддержки.')
              this.$emit('close-dialog')
            },
            error => {
              this.$dmsErrorNoty('Не удалось отправить сообщение.')
            }
          )
          .finally(_ => {
            this.loading = false
          })
      }
    }
  }
}
</script>