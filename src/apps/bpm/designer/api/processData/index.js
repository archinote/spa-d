/**
 * API module
 * BPM Constructor Model Parameters (Process Data) API
 */
import { ApiModule } from '@/api/api-module'
import routes from './routes'
import uuidv4 from 'uuid/v4'
import apiProcessDataPortBinding from './processDataPortBinding'
import apiProcessDataDataBinding from './processDataDataBinding'

export class ApiProcessData extends ApiModule {
  /**
   * 
   * @param {String} processId 
   * @param {Boolean} hasPortBinding 
   */
  list({ model_id, hasPortBinding }) {
    return new Promise((resolve, reject) => {
      const apiPath = routes.index.replace('{model_id}', model_id)
      const params = hasPortBinding ? { binding: true } : undefined

      this.http.get(apiPath, { params }).then(response => {
        if (response.status == 200 && response.data) {
          resolve(response.data.list)
        } else {
          reject('Error occurres while getting data.')
        }
      }).catch(error => {
        console.error(error)
        reject(error)
      })
    })
  }

  create( data ) {
    return new Promise((resolve, reject) => {
      const apiPath = routes.create.replace('{model_id}', data.model_id)

      // Generate ID for a new item.
      if (typeof data.id === 'undefined' || !data.id) {
        data.id = uuidv4()
      }

      this.http.put(apiPath, data).then(response => {
        if (response.status == 201) {
          // Fill ID property if it was generated by server.
          if (typeof data.id === 'undefined' && response.data && response.data.id) {
            data.id = response.data.id
          }
          resolve( data )
        } else {
          reject('Error occurres while creating data.')
        }
      }).catch(error => {
        reject(error)
      })
    })
  }

  update( data ) {
    return new Promise((resolve, reject) => {
      const apiPath = routes.update.replace('{model_id}', data.model_id).replace('{data_id}', data.id)

      this.http.patch(apiPath, data).then(response => {
        if (response.status == 200) {
          resolve( data )
        } else {
          reject('Error occurres while updating data.')
        }
      }).catch(error => {
        reject(error)
      })
    })
  }

  delete({ model_id, id }) {
    return new Promise((resolve, reject) => {
      const apiPath = routes.delete.replace('{model_id}', model_id).replace('{data_id}', id)

      this.http.delete(apiPath).then(response => {
        if (response.status == 200) {
          resolve( true )
        } else {
          reject('Error occurres while deleting data.')
        }
      }).catch(error => {
        reject(error)
      })
    })
  }
}

const apiProcessData = new ApiProcessData('processData')
apiProcessData.addModules([
  apiProcessDataPortBinding,
  apiProcessDataDataBinding
])

export default apiProcessData
