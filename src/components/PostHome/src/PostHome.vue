<template>
  <v-container fluid grid-list-xl>
    <v-layout row wrap>
      <v-flex xs12>
        <v-alert
          v-model="isMessageVisible"
          dismissible
          type="error"
          transition="slide-top"
          outline
        >
          Это заготовка страницы: <strong>"Рабочий стол поста в группе"</strong>
        </v-alert>
      </v-flex>

    <!-- </v-layout>
    <v-layout row wrap v-if="false"> -->
      
      <!-- Услуги -->
      <v-flex xs12 md6>
        <v-card>
          <v-toolbar color="primary" dark dense card>
            <v-icon>receipt</v-icon>
            <v-toolbar-title>Услуги</v-toolbar-title>
          </v-toolbar>
          <v-list three-line subheader>
            <v-subheader>Подключенные услуги</v-subheader>
            <v-list-tile>
              <v-list-tile-content>
                <v-list-tile-title>Интернет 100 Мбит/с</v-list-tile-title>
                <v-list-tile-sub-title>Доступ в интернет со скоростью до 100 Мбит/с с неограниченным трафиком.</v-list-tile-sub-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-btn icon ripple>
                  <v-icon color="blue lighten-1">info</v-icon>
                </v-btn>
              </v-list-tile-action>
            </v-list-tile>
            <v-list-tile>
              <v-list-tile-content>
                <v-list-tile-title>Обещанный платеж</v-list-tile-title>
                <v-list-tile-sub-title>Если баланс приближается к нулю или ушёл в минус, вы можете продолжать пользоваться услугами в течение 7 дней.</v-list-tile-sub-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-btn icon ripple>
                  <v-icon color="blue lighten-1">info</v-icon>
                </v-btn>
              </v-list-tile-action>
            </v-list-tile>
            <v-divider></v-divider>
            <v-subheader>Доступные услуги</v-subheader>
            <v-list-tile>
              <v-list-tile-content>
                <v-list-tile-title>Интерактивное телевидение</v-list-tile-title>
                <v-list-tile-sub-title>Wi-Fi-роутер и HD-приставка в комплекте! До 200 ТВ каналов</v-list-tile-sub-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-btn class="primary" icon title="Подключить услугу">
                  <v-icon>add</v-icon>
                </v-btn>
              </v-list-tile-action>
            </v-list-tile>
          </v-list>
        </v-card>
      </v-flex>
  
      <!-- Планировщик -->
      <v-flex xs12 md6>
        <v-card>
          <v-toolbar color="primary" dark dense card>
            <v-icon>date_range</v-icon>
            <v-toolbar-title>Планировщик</v-toolbar-title>
          </v-toolbar>
          <v-layout row wrap>
            <v-flex xs12 sm6>
              <v-date-picker
                no-title
                flat
                ref="picker"
                v-model="date"
                :picker-date.sync="pickerDate"
                full-width
                locale="ru-ru"
                :first-day-of-week="1"
                event-color="green"
                :events="arrayEvents"
              ></v-date-picker>
            </v-flex>
            <v-flex xs12 sm6 class="my-2 px-3">
              <div class="title">События месяца ({{ pickerDate || 'change month...' }})</div>
              <ul class="ma-3">
                <li v-for="note in notes" :key="note">{{ note }}</li>
              </ul>
            </v-flex>
          </v-layout>
        </v-card>
      </v-flex>
      
      <!-- Последние сообщения -->
      <v-flex xs12 md4>
        <v-card>
          <v-toolbar color="primary" dark dense card>
            <v-icon>message</v-icon>
            <v-toolbar-title>Чат</v-toolbar-title>
          </v-toolbar>
          <v-list three-line>
            <v-subheader>Последние сообщения</v-subheader>
            <template v-for="(item, index) in chat_items">
              <v-divider v-if="item.divider" :inset="item.inset" :key="index"></v-divider>
              <v-list-tile v-else avatar :key="item.title" @click="">
                <v-list-tile-avatar>
                  <img :src="item.avatar">
                </v-list-tile-avatar>
                <v-list-tile-content>
                  <v-list-tile-title v-html="item.title"></v-list-tile-title>
                  <v-list-tile-sub-title v-html="item.subtitle"></v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
            </template>
          </v-list>
        </v-card>
      </v-flex>
  
      <!-- Последние файлы и папки -->
      <v-flex xs12 md4>
        <v-card>
          <v-toolbar color="primary" dark dense card>
            <v-icon>cloud</v-icon>
            <v-toolbar-title>Последние файлы и папки</v-toolbar-title>
          </v-toolbar>
          <v-list two-line subheader>
            <v-subheader inset>Папки</v-subheader>
            <v-list-tile avatar v-for="item in folders" :key="item.title" @click="">
              <v-list-tile-avatar>
                <v-icon class="blue-grey lighten-1 white--text">{{ item.icon }}</v-icon>
              </v-list-tile-avatar>
              <v-list-tile-content>
                <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                <v-list-tile-sub-title>{{ item.subtitle }}</v-list-tile-sub-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-btn icon ripple>
                  <v-icon color="grey lighten-1">info</v-icon>
                </v-btn>
              </v-list-tile-action>
            </v-list-tile>
            <v-divider inset></v-divider>
            <v-subheader inset>Файлы</v-subheader>
            <v-list-tile v-for="item in files" :key="item.title" avatar @click="">
              <v-list-tile-avatar>
                <v-icon class="blue-grey lighten-1 white--text">{{ item.icon }}</v-icon>
              </v-list-tile-avatar>
              <v-list-tile-content>
                <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                <v-list-tile-sub-title>{{ item.subtitle }}</v-list-tile-sub-title>
              </v-list-tile-content>
              <v-list-tile-action>
                <v-btn icon ripple>
                  <v-icon color="grey lighten-1">info</v-icon>
                </v-btn>
              </v-list-tile-action>
            </v-list-tile>
          </v-list>
        </v-card>
      </v-flex>
  
      <!-- Почта -->
      <v-flex xs12 md4>
        <v-card>
          <v-toolbar color="primary" dark dense card>
            <v-icon>mail</v-icon>
            <v-toolbar-title>Почта</v-toolbar-title>
          </v-toolbar>
          <v-list>
            <template v-for="(item, index) in mail_items">
              <v-divider></v-divider>
              <v-list-tile dense :key="index" @click="">
                <v-list-tile-content>
                  <v-list-tile-title v-html="item.email"></v-list-tile-title>
                </v-list-tile-content>
                <v-badge left>
                  <span slot="badge">{{item.count}}</span>
                </v-badge>
          
              </v-list-tile>
            </template>
          </v-list>
        </v-card>
      </v-flex>

    </v-layout>
  </v-container>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name : 'PostHome',
  
  data() {
    return {
      isMessageVisible: true,

      mail_items:[
        {email: 'info@dantser.ru', count: 0},
        {email: 'admin@dantser.ru', count: 5},
        {email: 'orgstructure@dantser.ru', count: 7},
      ],
      chat_items: [
        { avatar: 'https://randomuser.me/api/portraits/men/1.jpg', title: 'Brunch this weekend?', subtitle: "<span class='text--primary'>Ali Connors</span> &mdash; I'll be in your neighborhood doing errands this weekend. Do you want to hang out?" },
        { divider: true, inset: true },
        { avatar: 'https://randomuser.me/api/portraits/women/2.jpg', title: 'Summer BBQ <span class="grey--text text--lighten-1">4</span>', subtitle: "<span class='text--primary'>to Alex, Scott, Jennifer</span> &mdash; Wish I could come, but I'm out of town this weekend." },
        { divider: true, inset: true },
        { avatar: 'https://randomuser.me/api/portraits/women/3.jpg', title: 'Oui oui', subtitle: "<span class='text--primary'>Sandra Adams</span> &mdash; Do you have Paris recommendations? Have you ever been?" },
        { divider: true, inset: true },
        { avatar: 'https://randomuser.me/api/portraits/men/4.jpg', title: 'Birthday gift', subtitle: "<span class='text--primary'>Trevor Hansen</span> &mdash; Have any ideas about what we should get Heidi for her birthday?" },
        { divider: true, inset: true },
        { avatar: 'https://randomuser.me/api/portraits/women/5.jpg', title: 'Recipe to try', subtitle: "<span class='text--primary'>Britta Holt</span> &mdash; We should eat this: Grate, Squash, Corn, and tomatillo Tacos." }
      ],
      folders: [
        { icon: 'folder', title: 'Документы', subtitle: 'Апр 9, 2014' },
        { icon: 'folder', title: 'Фотографии', subtitle: 'Апр 17, 2014' },
        { icon: 'folder', title: 'Отдел IT', subtitle: 'Апр 28, 2014' }
      ],
      files: [
        { icon: 'assignment', title: 'Описание архитектуры проекта', subtitle: 'Апр 20, 2014' },
        { icon: 'photo', title: 'Снимок структуры микросервисов', subtitle: 'Апр 10, 2014' }
      ],
      allNotes: [
        'Встреча с руководителем компании',
        'Презентация нового модуля DMS',
        'Старт начала продаж системы',
        'Обсуждение и подготовка к следующей версии',
        'Расширение отдела и переезд в новый офис'
      ],
      date: null,
      pickerDate: null,
      notes: [],
      arrayEvents: []
    }
  },

  watch: {
    pickerDate (val) {
      this.notes = [
        this.allNotes[Math.floor(Math.random() * 5)],
        this.allNotes[Math.floor(Math.random() * 5)],
        this.allNotes[Math.floor(Math.random() * 5)]
      ].filter( (value, index, self) => self.indexOf(value) === index)

      this.arrayEvents = [...Array(this.notes.length)].map(() => {
        const day = Math.floor(Math.random() * 30)
        const d = new Date()
        d.setDate(day)
        d.setMonth(val.split('-')[1]-1)
        d.setYear(val.split('-')[0])
        return d.toISOString().substr(0, 10)
      })
    },
    isUpdating() {
      // After data updating show message again.
      if (this.isUpdating) {
        this.isMessageVisible = true
      }
    }
  }
}
</script>

<style>
</style>