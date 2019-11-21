/**
 * Implementation of ApiModule class
 */
import { isEmpty } from 'lodash'
import { HttpClient } from './http-client'
import httpClient from './http-client'

window.httpClient = httpClient // DEBUG

const ApiModule = class {
  /**
   * Class constructor
   * @param {string} name - this API-module name
   * @param {object} httpClient - HttpClient class instance, use to replace default http client
   */
  constructor(name = '', _httpClient = httpClient) {
    if (isEmpty(name)) console.warn("Missing ApiModule class 'name' property.")

    this._name = name

    if (_httpClient instanceof HttpClient) {
      this._http = _httpClient
    } else {
      this._http = null
      console.warn("Http Client must be instance of HttpClient class!")
    }
  }

  /**
   * Class property getter
   * @returns {string} module 'name' property
   */
  get name() {
    return this._name
  }
  
  /**
   * Class property getter
   * @returns {object} module http-client
   */
  get http() {
    // Check for empty, use httpClient
    if (isEmpty(this._http)) {
      this._http = httpClient
    }

    return this._http.http
  }

  /**
   * Class property getter
   * @returns {object} 'config' value of module http-client
   */
  get config() {
    return this._http.config
  }

  /**
   * Class property setter
   * Sets module hppt-client 'baseURL' property
   * @param {string} val 
   */
  set baseURL(val) {
    this._http.baseURL = val
  }

  /**
   * Class property setter
   * Sets module hppt-client 'timeout' property 
   * @param {number} val timeout value (ms)
   */
  set timeout(val) {
    this._http.timeout = val
  }

  /**
   * Class property setter
   * Sets module hppt-client 'headers' property
   * @param {object} val
   */
  set headers(val) {
    this._http.headers = val
  }

  /**
   * Adds new item to api-modules collection
   * @param {object} module ApiModule instance
   */
  addModule(module) {
    if (module && module.name && module instanceof ApiModule) {
      this[module.name] = module
    }
  }

  /**
   * Adds new items array to api-modules collection
   * @param {array} modules of ApiModule's instance
   */
  addModules(modules = []) {
    if (modules && Array.isArray(modules)) {
      modules.forEach(module => {
        this.addModule(module)
      })
    }
  }

  /**
   * Normalize Http-client error
   * @param {object} error 
   */
  normalizeError(error) {
    return error
  }
}

export { ApiModule }
