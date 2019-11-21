export default {
  data() {
    return {
      indicatorTypes: [
        {
          value: 1,
          label: "Виджет на панели",
          iconClass: "fa fa-share-alt fa-fw",
          disabled: false
        },
        {
          value: 2,
          label: "Сообщение на e-mail",
          iconClass: "fa fa-envelope-o fa-fw",
          disabled: true
        },
        {
          value: 3,
          label: "SMS сообщение",
          iconClass: "fa fa-mobile fa-fw",
          disabled: true
        },
      ],

      recipientTypes: [
        {
          value: 1,
          label: "Стартер"
        },
        {
          value: 2,
          label: "Исполнитель"
        }
      ],


    }
  },

  methods: {
    getIndicatorIconClassByType: function (type = 1) {
      let index = this.indicatorTypes.findIndex(_type => Boolean(_type.value = type))
      if (index < 0) index = 0

      return this.indicatorTypes[index].iconClass
    },

    getParameterLabelByType: function(type) {
      let label = ''

      switch (String(type)) {
        case "1":
          label = 'Текст (строка)'
          break;
        case "2":
          label = 'Текстовый блок'
          break;
        case "3":
          label = 'Эл. почта'
          break;
        case "4":
          label = 'Дата'
          break;
        case "5":
          label = 'Да/Нет'
          break;
        default:
          label = ''
          break;
      }

      return label
    },


    getProcessNameByPortId: function (processObject, id) {
      let portObject = processObject.findPort(id)
      let portProcessID = portObject.getProcessID()
      // console.log("portProcessID for port #" + port_id + " = " + portProcessID);

      let portProcess = (portProcessID == processObject.getID())
        ? processObject
        : processObject.getProcess(portProcessID)

      // console.log("portProcess for port #" + port_id);
      // console.log(portProcess);

      return this.getNameValue(portProcess)
    },

    getPortNameById: function (processObject, id) {
      let portObject = processObject.findPort(id)

      return this.getNameValue(portObject)
    },

    getIndicatorNameByStateId: function (processObject, id) {
      if (id) {
        let stateObject = processObject.getIndicatorState(id)
        // console.log(stateObject);

        if (stateObject) {
          let indicatorObject = processObject.getIndicator( stateObject.getIndicatorID() )

          return this.getNameValue(indicatorObject)
        }
      }

      return "Indicator Name for state #" + id
    },

    getStateNameById: function (processObject, id) {
      let stateObject = processObject.getIndicatorState(id)

      if (stateObject) {
        return this.getNameValue(stateObject)
      }

      return "State Name for state #" + id
    },

    getNameValue: function (obj) {
      return obj.getName() + (this.$bpmDebug.forms ? ' (#' + obj.getID() + ')' : '')
    },
  }
}
