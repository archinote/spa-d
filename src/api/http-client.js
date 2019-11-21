/**
 * Implementation of Http-client wrapper class
 */
import axios from 'axios'
import { baseURL } from './baseURLs'

import store from '@/store/'

axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest'

// Axios default params.
const defaultParams = { 
  timeout: 25000,
  // withCredentials: true
}

export class HttpClient {
  /**
   * Class constructor
   * Creates axios instance and stores it in private variable.
   * @param {Object} params initial http-client params
   */
  constructor(params = defaultParams) {
    this._http = axios.create(params)
    this._cancelToken = axios.CancelToken
    
    this._http.interceptors.response.use(
      response => response,
      (error) => {
        const status = error.response ? error.response.status : null
        const data = error.response ? error.response.data : null
  
        if (status === 401 && data==='expired') {
          return store.dispatch('app/account/refreshToken').then( _ => {
            error.config.headers['Authorization'] = 'Bearer ' + store.getters['app/account/getAuthTokens'].access_token
            error.config.baseURL = undefined
            return this._http.request(error.config)
          });
        } else if(status === 401 && error.config.url.indexOf('MyProfile')<0 ){
          //Таймаут с проверкой, чтобы редирект не произошел после обновления токена, а в случае отключения сессии
          setTimeout(function() {
            let timestamp = Math.round((new Date()).getTime() / 1000)
            let deadline = store.getters['app/account/getAuthTokens'].expires_in || 0
            // Если срок токена меньше чем 4.5 минуты (т.е. обновление не произошло только что), перенаправить на авторизацию
            if(!store.getters['app/account/isRefreshing'] && ( deadline-timestamp < 4.5*60) ) document.location.assign('/');
          }, 2000);
        }
        return Promise.reject(error)
      }
    )
  }

  /**
   * Class property getter
   * @returns {object} http-client
   */
  get http() {
    return this._http
  }
  
  /**
   * Class property getter
   * @returns {CancelTokenStatic | *}
   */
  get cancelToken() {
    return this._cancelToken
  }

  /**
   * Class property getter
   * @returns {string} http-client 'baseURL' property
   */
  get baseURL() {
    return this._http.defaults.baseURL
  }

  /**
   * Class property getter
   * @returns {object} http-client 'config' summary property
   */
  get config() {
    return {
      baseURL: this.http.defaults.baseURL,
      timeout: this.http.defaults.timeout,
      headers: this.http.defaults.headers
    }
  }

  /**
   * Class property setter
   * Sets hppt-client 'baseURL' property
   * @param {String} val new baseURL value
   */
  set baseURL(val) {
    this._http.defaults.baseURL = val
  }

  /**
   * Class property setter
   * Sets hppt-client 'timeout' property 
   * @param {Number} val new timeout value (ms)
   */
  set timeout(val) {
    this._http.defaults.timeout = val
  }

  /**
   * Class property setter
   * Sets hppt-client 'headers' property
   * @param {Object} val new headers value
   */
  set headers(val) {
    // Keep previous header value.
    this._http.defaults.headers = Object.assign({}, this._http.defaults.headers, val)
  }
}

// Create http client instance
const httpClient = new HttpClient(Object.assign({}, defaultParams, { baseURL }))

// Export class definition & its instance.
export default httpClient

/**
 * Create HttpClient config for DMS
 * @param {string} postId 
 */
export function makeDMSConfig(postId){
  return {
    headers: {
      'DMS-POST-ID': postId
    }
  }
}