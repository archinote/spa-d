import store from '@/store'
const defaultMessage = { type: 'unknown', data: {} }
/**
 *
 */
class SocketWrapper {
  /**
   *
   * @param {*} url
   * @param {*} bus
   */
  constructor(url, bus) {
    this._bus = bus
    this._url = url
    // Messages
    this._messageId = 0
    this._promises = {}
    // DMS data
    this._accountId = null
    this._postId = null
    this._inited = false
    this.init()
  }
  /**
   * Инициализация
   */
  init() {
    this._inited = false
    this._accountId = null
    this._postId = null
    this._ws = new WebSocket(this._url)
    // Соединение установлено
    // @todo Уточнить поведение
    this._ws.onopen = event => {
      console.log('Open websocket')
      this._inited = true
      this.signIn()
      this.setPost()
    }
    // Соединение установлено
    this._ws.onmessage = event => {
      this.onMessage(event)
    }
    // Соединение установлено
    // @todo Уточнить поведение
    this._ws.onerror = event => {
      console.log(error)
    }
    // Соединение закрыто
    // @todo Уточнить поведение
    this._ws.onclose = event => {
      this._inited = false
      this.init()
    }
  }
  /**
   * Get message id
   *
   * @returns {Number}
   */
  getId() {
    return ++this._messageId
  }
  /**
   * Разбор сообщений от WS
   * @param {Event} event
   */
  onMessage(event) {
    let msg = {}
    try {
      msg = JSON.parse(event.data)
    } catch (e) {
      msg = {}
    }
    let message = Object.assign({ id: 0 }, defaultMessage, msg)
    // Cообщение от backend
    if (message.type === 'message') {
      let messageEvent = Object.assign({}, defaultMessage, message.data)
      this._bus.$emit(messageEvent.type, messageEvent.data)
    }
    // Ответ на команду или ошибка
    else if (message.type === 'response' || message.type === 'error') {
      const promData = this._promises[message.id]
      const action = message.type === 'response' ? 'resolve' : 'reject'
      if (promData) {
        promData[action](message.data)
        delete this._promises[message.id]
      }
    }
    // Резерв
    else {
    }
  }
  /**
   * Отправка команды
   *
   * @param {String} type
   * @param {Object} data
   * @returns {Promise}
   */
  sendCommand(type, data) {
    if (!this._inited) {
      //@todo Проверить вложенность (рекурсию)
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          this.sendCommand(type, data).then(resolve, reject)
        }, 1000)
      })
    }

    let id = this.getId()
    let message = {
      id: id,
      type: type,
      data: Object.assign({}, data)
    }

    let promData = {}
    let prom = new Promise((resolve, reject) => {
      promData.resolve = resolve
      promData.reject = reject
    })

    this._promises[id] = promData
    this._ws.send(JSON.stringify(message))

    return prom
  }
  /**
   * Смена поста, данные беруться из Store
   * @param {*} postId
   */
  setPost() {
    let postId = store.state.app.account.postId
    if (!postId) {
      return Promise.resolve(null)
    }

    if (postId == this._postId) {
      return Promise.resolve(this._postId)
    }

    return this.sendCommand('setpost', {
      post_id: postId
    }).then(
      data => {
        this._postId = data.id
        return data.id
      },
      error => {
        return Promise.reject(error)
      }
    )
  }
  /**
   * Смена поста, данные беруться из Store
   * @param {*} token
   */
  signIn() {
    let data = store.state.app.account.auth_tokens || {}
    if (!data.access_token) {
      return Promise.resolve(null)
    }
    return this.sendCommand('login', {
      token: data.access_token
    }).then(
      data => {
        this._accountId = data.id
        return data.id
      },
      error => {
        return Promise.reject(error)
      }
    )
  }
}
/**
 *
 * @param {*} url  //"wss://dev18.dantser.net/wss"
 * @param {*} bus  //Vue.prototype.$bus
 */
export function initWS(url, bus) {
  let wrapper = new SocketWrapper(url, bus)
  store.watch(
    function(state) {
      return state.app.account.accountId
    },
    function() {
      wrapper.signIn()
    }
  )
  //Смена поста
  store.watch(
    function(state) {
      return state.app.account.postId
    },
    function(newVal, oldVal) {
      wrapper.setPost()
    }
  )
  return wrapper
}

export default SocketWrapper
