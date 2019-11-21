<template lang="html">
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    :show-close="true"
    :before-close="doCancel"
    append-to-body
  >

    <template v-if="loading">
      <loading />
    </template>

    <div v-if="errors && errors.length" style="margin-bottom: 16px;">
      <el-alert
        title="Возникли ошибки"
        :description="getErrors()"
        type="error"
        show-icon
        @close="hideError">
      </el-alert>
    </div>

    <div v-if="formDataCurrent">

      <div style="margin-bottom: 16px;">
        <el-collapse>
          <el-collapse-item title="Порты" name="1">
              <!-- <span>Порты</span> -->
              <el-checkbox-group v-model="portsInList" size="mini">
                <!-- <el-checkbox-button v-for="(port, index) in formDataCurrent.from_ports" :key="port.id" v-if="index > 0" :label="port.id" >
                  {{ port.name }}
                </el-checkbox-button> -->
                <!-- <el-checkbox v-for="(port, index) in formDataCurrent.from_ports" :key="port.id" v-if="index > 0" :label="port.id" >
                  {{ port.name }}
                </el-checkbox> -->
                <el-checkbox v-for="port in formDataCurrent.from_ports" :label="port.id" :key="port.id">{{ port.name }}</el-checkbox>
              </el-checkbox-group>
          </el-collapse-item>
        </el-collapse>
      </div>

      <el-checkbox-group v-if="formDataCurrent && formDataCurrent.to_port" v-model="links" @change="handleCheckedLinksChange">
        <table class="link-data">
          <thead>
            <th>&nbsp;</th>
            <th style="width: 40px;">
              &nbsp;
            </th>
            <th :colspan="formDataCurrent.to_port.data_list.length" style="text-align: center; border-bottom: 1px solid rgba(128, 128, 128, .15); border-left: 1px solid rgba(128, 128, 128, .15);">
              <div class="text-small text-bold">{{ formDataCurrent.to_port.name }}</div>
              <div class="caption">(порт-назначение)</div>
            </th>
          </thead>
          <thead>
            <th colspan="2" style="text-align: center; vertical-align: bottom; padding-bottom: 20px;">
              <div class="caption">Порты-источники</div>
            </th>
            <th
              v-for="(destPortData, index) in formDataCurrent.to_port.data_list"
              v-bind:key="destPortData.id"
              style="border-left: 1px solid rgba(128, 128, 128, .15);">
              <div class="rotated-text">
                <div class="text-small text-bold">{{ destPortData.name }}</div>
              </div>
            </th>
          </thead>

          <tbody>
            <template
              v-for="(port, index) in formDataCurrent.from_ports"
              v-if="(portsInList.findIndex(element => { return element == port.id }) >= 0)"
              >
              <tr class="title-row">
                <td class="data-title">
                  <div class="text-small text-bold">{{ port.name }}</div>
                  <div class="caption">(порт-источник)</div>
                </td>
                <td style="width: 40px;">
                  <el-button
                    type="text"
                    :icon="isPortShared(port.id) ? 'el-icon-circle-check' : 'el-icon-circle-check-outline'"
                    @click="switchSharePort(port.id)"
                    style="font-size: 20px;">
                  </el-button>
                  <!-- <v-btn small icon @click="switchSharePort(port.id)">
                    <template v-if="isPortShared(port.id)">
                      <v-icon color="indigo">visibility</v-icon>
                    </template>
                    <template v-else>
                      <v-icon color="grey">visibility_off</v-icon>
                    </template>
                  </v-btn> -->
                </td>
                <!-- TODO: remove debug code: @click="test()" -->
                <td :colspan="formDataCurrent.to_port.data_list.length" @click="test()"></td>
              </tr>
              <template v-if="port.data_list && Array.isArray(port.data_list) && port.data_list.length">
                <tr
                  v-for="(portData, index2) in port.data_list"
                  v-bind:key="port.id + '.' + portData.id"
                  :style="(index2 % 2) === 1 ? 'background-color: rgba(128, 128, 128, .15);' : ''">
                  <td class="data-title">
                    <div class="text-small">{{ portData.name }}</div>
                  </td>
                  <td style="width: 40px;">
                    &nbsp;
                  </td>
                  <td v-for="destPortData in formDataCurrent.to_port.data_list" class="data-value" style="border-left: 1px solid rgba(128, 128, 128, .15);">
                    <!-- <v-checkbox
                      v-show="portData.type_id == destPortData.type_id"
                      label=""
                      v-model="links"
                      color="indigo"
                      hide-details
                      :value="portData.id + ';' + destPortData.id"
                      :ripple="false"
                      :disabled="portData.type_id != destPortData.type_id"
                      >
                    </v-checkbox> -->
                    <el-checkbox v-show="portData.type_id == destPortData.type_id" :label="portData.id + ';' + destPortData.id"></el-checkbox>
                  </td>
                </tr>
              </template>
              <template v-else>
                <tr>
                  <td :colspan="formDataCurrent.to_port.data_list.length+2" class="no-data">Порт не имеет данных</td>
                </tr>
              </template>
            </template>
          </tbody>
        </table>
      </el-checkbox-group>

    </div>

    <span slot="footer" class="dialog-footer">
      <el-button @click="doCancel()" size="small">{{ cancelText }}</el-button>
      <el-button v-show="!loading" :loading="loadingSubmit" type="primary" @click="doSubmit()" size="small">{{ submitText }}</el-button>
    </span>

  </el-dialog>
</template>

<script>
  import dialogForm from '../../../mixins/dialogForm'

  export default {
    mixins: [
      dialogForm
    ],

    data() {
      return {
        links: [],
        // sharedPorts: [],
        sourcePortsMenu: false,
        portsInList: [],
        // error: false,
        saving: false,
        saveStatuses: [],
        // showMessage: false,
        msgText: ''
      }
    },

    // mounted() {
    //   this.init()
    // },

    methods: {
      updateCurrentData: function () {
        this.formDataCurrent = null
        this.links = null
        this.portsInList = []

        if (this.formData) {
          this.formDataCurrent = Object.assign({}, this.formData)

          // Формируем список связей между данными портов соединения.
          if (this.formDataCurrent.data_links) {
            this.links = this.createLinkDataSettings( this.formDataCurrent.data_links )
          }

          // Формируем список портов-источников для формы.
          if (this.formDataCurrent.from_ports) {
            this.createFormPortsList( this.formDataCurrent )
          }
        }

        // console.log("LinkEditDialog, updateCurrentData(), 'formDataCurrent':", this.formDataCurrent)
      },

      collectResults: function () {
        // TODO - collect & return results
        return {
          sharedPorts: this.formDataCurrent.port_data_links,
          linkDataSettings: this.getLinkDataSettings()
        }
      },

      handleCheckedLinksChange: function () {
        // console.log("links:")
        // console.log(this.links)
      },

      //
      // Shared ports functions
      //
      getPortShared: function (port_id) {
        return this.formDataCurrent.port_data_links.findIndex(element => { return element === port_id })
      },

      isPortShared: function (port_id) {
        // console.log("Port #" + port_id + " shared: " + String(Boolean(this.getPortShared(port_id) >= 0)));
        return Boolean(this.getPortShared(port_id) >= 0)
      },

      switchSharePort: function (port_id) {
        let shareIndex = this.getPortShared(port_id)
        // console.log(shareIndex)

        if (shareIndex < 0 ) {
          this.formDataCurrent.port_data_links.push(port_id)
        } else {
          this.formDataCurrent.port_data_links.splice(shareIndex, 1)
        }

        // console.log(this.formDataCurrent.port_data_links);
      },

      //
      // Convertional functions
      //
      getLinkDataSettings: function () {
        let newLinks = []

        this.links.forEach(element => {
          let linkPair = element.split(';')

          if (linkPair && linkPair[0] && linkPair[1]) {
            // let sourcePortData = linkPair[0].split('.')
            // let destPortData = linkPair[1].split('.')
            //
            // if (sourcePortData && sourcePortData[0] && sourcePortData[1]
            //   && destPortData && destPortData[0] && destPortData[1]) {
              newLinks.push({
                from: linkPair[0],
                to: linkPair[1]
                // source:{
                //   port_id: sourcePortData[0],
                //   data_id: sourcePortData[1]
                // },
                // dest: {
                //   port_id: destPortData[0],
                //   data_id: destPortData[1]
                // }
              })
            // }
          }

        })

        return newLinks
      },

      createLinkDataSettings: function ( data_links) {
        let links = []

        if (data_links && Array.isArray(data_links)) {
          data_links.forEach( element => {
            if (element.from && element.to) {
              links.push(element.from + ";" + element.to)
            }
          } )
        }

        return links
      },

      // Формируем список портов-источников для формы.
      // - если доступен исполнителю
      // - если есть связи между ним и портом-назначением.
      createFormPortsList: function ( formData ) {
        var portFlag;

        formData.from_ports.forEach((port, index) => {
          portFlag = Boolean(index === 0)

          if (!portFlag) {
            if (formData.port_data_links.includes(port.id)) {
              portFlag = true
            } else {
              formData.data_links.forEach(dataLink => {
                if (port.data_list.findIndex(portData => {
                  return Boolean(dataLink.from == portData.id)
                }) >= 0) {
                  portFlag = true
                }
              })
            }
          }

          if (portFlag && !this.portsInList.includes(port.id)) {
            this.portsInList.push(port.id)
          }
        })

        // console.log("this.portsInList:")
        // console.log(this.portsInList)
      },


      //
      // Test functions.
      //
      test: function () {
        console.log("Установленные связи между параметрами портов:")
        console.log( this.links )

        console.log("Установленные связи между параметрами портов:")
        console.log( this.getLinkDataSettings() )

        console.log("Включённые для видимости порты (shared ports):")
        console.log( this.formDataCurrent.port_data_links )

      }
    }
  }
</script>

<style lang="scss">
  table.link-data {
    margin: 0 auto;

    .el-checkbox__label {
      // color: pink !important;
      display: none;
    }

    .text-small {
      font-size: 14px;
    }

    .text-small.text-bold {
      font-weight: bold;
    }

    thead {
      th.data-title {
        text-align: right;
        // padding-right: 40px;
        vertical-align: middle;
        padding-bottom: 16px;
      }

      th {
        .rotated-text {
          transform: rotate(270deg);
          transform-origin: 120% 45%;
          height: 120px;
          width: 50px;
          line-height: 16px;
        }
      }
    }

    tbody {
      tr.title-row {
        background-color: lightgrey;

        td {
          padding: 8px 0;
          text-align: center;
        }
      }

      tr:not(.title-row) {
        td.data-title {
          // text-align: center;
          padding: 8px 0 8px 16px;
        }
        td.data-value {
          padding: 8px 0 4px 12px;

          & > div {
            max-width: 32px;
            max-height: 32px;
            overflow: hidden;
          }
        }
        td.no-data {
          text-align: center;
          padding: 8px 0;
        }
      }
    }

    .data-title {
      min-width: 300px;
      vertical-align: middle;
    }
  }
</style>
