const names = {
  men: [
    'Иван',
    'Пётр',
    'Владимир',
    'Григорий',
    'Олег',
    'Максим'
  ],
  women: [
    'Ольга',
    'Елена',
    'Светлана',
    'Василиса',
    'Юлия',
    'Мария',
    'Наталья',
    'Антонина',
  ]
}

const lastnames = {
  men: [
    'Иванов',
    'Петров',
    'Сидоров',
    'Тяпкин',
    'Ляпкин',
    'Мерзляев',
  ],
  women: [
    'Иванова',
    'Петрова',
    'Сидорова',
    'Тяпкина',
    'Ляпкина',
    'Купцова',
  ],
}

const middlenames = {
  men: [
    'Иванович',
    'Петрович',
    'Алексеевич',
    'Васильевич',
    'Семёнович',
    'Григорьевич',
    'Анатольевич'
  ],
  women: [
    'Ивановна',
    'Петровна',
    'Алексеевна',
    'Васильевна',
    'Семёновна',
    'Григорьевна',
    'Анатольевна'
  ]
}

function elementFromArray( arr ) {
  return arr[ getters.intValue()(0, arr.length-1) ]
}

const getters = {
  intValue: (state) => (min = 0, max = 10) => {
    return Math.floor(Math.round(Math.random() * max) + min)
  },
  stringValue: (state) => (len = 10) => {
    return "Random String"
  },
  name: (state) => (sex = 'men') => {
    return elementFromArray( names[sex] )
  },
  lastname: (state) => (sex = 'men') => {
    return elementFromArray( lastnames[sex] )
  },
  middlename: (state) => (sex = 'men') => {
    return elementFromArray( middlenames[sex] )
  },
  fullname: (state, getters) => (sex = 'men') => {
    return getters.name(sex) + ' ' + getters.middlename(sex) + ' ' + getters.lastname(sex)
  },
  avatar: (state, getters) => (sex = 'men') => {
    return 'https://randomuser.me/api/portraits/' + sex + '/' + String(getters.intValue(1, 98)) + '.jpg'
  },
  lorem: (state) => {
    return 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
  }
}

export default {
  namespaced: true,
  getters
}
