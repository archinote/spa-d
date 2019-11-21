<template>
  <v-card>
    <v-card-title class="title">
      {{heading}}
      <v-spacer></v-spacer>
      <v-btn icon class="mx-0" @click="$emit('close-dialog')">
        <v-icon>close</v-icon>
      </v-btn>
    </v-card-title>
    
    <v-card-text>
      <span v-if="got_response">{{response_text}}</span>
      <span v-else>{{text}}</span>
    </v-card-text>
    <v-card-actions class="pa-3" v-if="need_buttons">
      <template v-if="!got_response && this.status===0">
        <v-btn class="error" @click="acceptOffer(false)">Отклонить</v-btn>
        <v-spacer></v-spacer>
        <v-btn class="success" @click="acceptOffer(true)">Принять</v-btn>
      </template>
      <template v-else>
        <v-btn v-if="got_response && need_action" class="success" @click="btnActionClick">{{action_text}}</v-btn>
        <v-spacer></v-spacer>
        <v-btn class="primary" @click="$emit('close-dialog')">Закрыть</v-btn>
      </template>
    </v-card-actions>
  </v-card>
</template>

<script>
  import { mapGetters } from 'vuex'
  import {apiNotification} from '@/apps/notifications/api'
  
  export default {
    name : 'AcceptForm',
    
    computed:{
      ...mapGetters('app/layout', ['getRouteData']),
      heading(){
        switch(this.data.action){
          case 'transferLabel': return 'Передача прав владения статистики'
          case 'processContractor': return 'Задача на исполнение'
          case 'processCustomer': return 'Статус заявки'
          default: return this.data.title
        }
      },
      text(){
        switch(this.status){
          case 0:
            return this.data.body
          case 1:
            return 'Вы отклонили предложение'
          case 2:
            return 'Предложение не актуально'
        }
      }
    },
    
    props:{
      data: {
        type: Object,
        required: true
      },
    },
    
    data() {
      return {
        url: '',
        baseURL: '',
        status: false,
        got_response: false,
        response_text: '',
        need_action: false,
        need_buttons: true,
        action_text: '',
        response_data: {}
      }
    },
    
    created(){
      switch(this.data.action){
        case 'createInvite':
          this.url = `/orgstructure/v1/invite-status/${this.data.entity.invite_id}`
            this.getStatus()
          break
        case 'transferLabel':
          this.url = `/analytics/v1/transfer-status/${this.data.entity.label_id}`
            this.getStatus()
          break
        case 'processContractor':
          this.status= 0
          this.got_response = true
          this.need_action = true
          this.action_text = 'Перейти к задаче...'
          this.response_text = this.data.body
          break
        default :
          this.status = 0
          this.need_buttons = false
          break
      }

    },
    
    methods : {
      getStatus(){
        apiNotification.status(this.url).then( data => {
          this.status = data.status
        })
      },
      
      acceptOffer(accept){
        switch(this.data.action){
          case 'createInvite':
            this.acceptInvite(accept)
            break
          case 'transferLabel':
            this.acceptStatistic(accept)
            break
          case 'disk.ownerRequest':
            this.acceptDisk(accept)
            break
        }
      },
      
      acceptInvite(accept){
        apiNotification.acceptInvite(this.data.entity.invite_id, accept).then( data => {
          this.got_response = true
          if(accept){
            this.response_text = "Вы успешно приняли предложение"
            this.need_action = true
            this.action_text = "Перейти на пост"
            this.response_data = data
          } else {
            this.response_text = "Вы отклонили предложение"
            this.need_action = false
          }
        })
      },
      
      acceptStatistic(accept){
        apiNotification.acceptStatistic(this.data.entity.label_id, accept).then( response => {
          this.$emit('close-dialog')
        })
      },
  
      acceptDisk(accept){
        apiNotification.acceptDisk(this.entity.token, accept).then( response => {
          if(accept && this.$store.state.disk){
            this.$store.commit("disk/acceptTransfer", response)
          }
          this.$emit('close-dialog')
        })
      },
  
      btnActionClick(){
        switch(this.data.action){
          case 'invite':
            let company = {
              default:false,
              id: this.response_data.company_id,
              name: this.response_data.company_name,
              posts:[
                {
                  container_id: this.response_data.container_id,
                  form_id: this.response_data.form_id,
                  id: this.response_data.post_id,
                  name: this.response_data.post_name
                }
              ]
            }
            this.$store.commit(`app/account/addCompany`, company)
            
            this.$router.push(this.getRouteData({
              name: 'org.hierarchy',
              params: { cid: this.response_data.company_id },
              query: { pid: this.response_data.post_id }
            }))
            break
          case 'processContractor':
            this.$dmsGoto({
              name: 'bpm.monitor',
              query: {
                  selectedId: this.data.entity.process_id
              }
            })
            break
        }
        this.$emit('close-dialog')
      }
    }
  }
</script>

<style>

</style>