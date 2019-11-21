/**
 * API module
 * BPM Link API
 */
import { ApiModule } from '@/api/api-module'
import routes from './routes'
import uuidv4 from 'uuid/v4'
import apiLinkData from './linkData'

export class ApiLink extends ApiModule {
  list( processId ) {
    return new Promise((resolve, reject) => {
      const apiPath = routes.index.replace('{model_id}', processId)

      this.http.get(apiPath).then(response => {
        if (response.status == 200 && response.data && response.data.list) {
          resolve( response.data.list )
        } else {
          reject('Error occurres while loading data from server')
        }
      }).catch(error => {
        reject(error)
      })
    })
  }

  item( processId, id ) {
    return new Promise((resolve, reject) => {
      const apiPath = routes.show.replace('{model_id}', processId).replace('{port_link_id}', id)

      this.http.get(apiPath).then(response => {
        // TODO - need to check server response
        if (response.status == 200 && response.data && response.data.item) {
          resolve( response.data.item )
        } else {
          reject('Error occurres while loading data from server')
        }
      }).catch(error => {
        reject(error)
      })
    })
  }

  create( processId, data ) {
    return new Promise((resolve, reject) => {
      const apiPath = routes.create.replace('{model_id}', processId)

      // Generate ID for a new item.
      if (typeof data.id === 'undefined' || data.id == null) {
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

  update( processId, id, data ) {
    return new Promise((resolve, reject) => {
      const apiPath = routes.update.replace('{model_id}', processId).replace('{port_link_id}', id)

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

  delete( processId, id ) {
    return new Promise((resolve, reject) => {
      const apiPath = routes.delete.replace('{model_id}', processId).replace('{port_link_id}', id)

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

// Create and export module class instance.
const apiLink = new ApiLink('link')
apiLink.addModules([
  apiLinkData
])

export default apiLink
