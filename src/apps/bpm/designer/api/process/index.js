/**
 * API module
 * BPM Processes
 */
import { ApiModule } from '@/api/api-module'
import routes from './routes'
import uuidv4 from 'uuid/v4'

export class ApiProcess extends ApiModule {

  list() {
    return new Promise((resolve, reject) => {
      this.http.get(routes.index).then(response => {
        if (response.data) {
          resolve(response.data.list)
        } else {
          reject("Error occurres while loading data from server")
        }
      }).catch(error => {
        reject(error)
      })
    })
  }

  item({ id }) {
    return new Promise((resolve, reject) => {
      let apiPath = routes.show.replace("{model_id}", id)

      this.http.get(apiPath).then(response => {
        if (response.status == 200 && response.data) {
          // Add new element to processes map.
          resolve(response.data.item)
        } else {
          reject("Error occurres while loading data from server")
        }
      }).catch(error => {
        reject(error)
      })
    })
  }

  create( data ) {
    return new Promise((resolve, reject) => {
      let apiPath = routes.create

      // Generate ID for a new item.
      if (typeof data.id === 'undefined' || !data.id) {
        data.id = uuidv4()
      }

      this.http.put(apiPath, data).then(response => {
        if (response.status == 201) {
          // Fill ID property if it was generated or updated by API.
          if (typeof data.id === 'undefined' && response.data && response.data.id) {
            data.id = response.data.id
          }
          resolve( data )
        } else {
          reject("Error occurres while creating data.")
        }
      }).catch(error => {
        reject(error)
      })
    })
  }

  update(data) {
    return new Promise((resolve, reject) => {
      let apiPath = routes.update.replace("{model_id}", data.id)

      this.http.patch(apiPath, data).then(response => {
        if (response.status == 200) {
          // TODO: update data with API response
          // TODO: - response.data.item
          // resolve(data)
          resolve(response.data.item)
        } else {
          reject("Error occurres while updating process data.")
        }
      }).catch(error => {
        reject(error)
      })
    })
  }

  delete({ id }) {
    return new Promise((resolve, reject) => {
      let apiPath = routes.delete.replace("{model_id}", id)

      this.http.delete(apiPath).then(response => {
        if (response.status == 200) {
          resolve( true )
        } else {
          reject("Error occurres while deleting data.")
        }
      }).catch(error => {
        reject(error)
      })
    })
  }
}

// Create and export module class instance.
const apiProcess = new ApiProcess('process')
export default apiProcess
