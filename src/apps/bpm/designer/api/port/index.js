/**
 * API module
 * BPM Port API
 */
import { ApiModule } from '@/api/api-module'
import routes from './routes'
import uuidv4 from 'uuid/v4'

export class ApiPort extends ApiModule {

  list({ process_model_id }) {
    return new Promise((resolve, reject) => {
      let apiPath = routes.index.replace("{model_id}", process_model_id)

      this.http.get(apiPath).then(response => {
        // console.log("Port API, 'list' action, server response:")
        // console.log(response)

        if (response.status == 200 && response.data && response.data.list) {
          resolve( response.data.list )
        } else {
          reject("Error occurres while loading data from server")
        }
      }).catch(error => {
        reject(error)
      })
    })
  }

  item({ process_model_id, id }) {
    return new Promise((resolve, reject) => {
      let apiPath = routes.show.replace("{model_id}", process_model_id).replace("{port_id}", id)

      this.http.get(apiPath).then(response => {
        // TODO - need to check server response
        // console.log("Port API, GET 'item', server response:")
        // console.log(response)

        if (response.status == 200 && response.data && response.data.item) {
          resolve( response.data.item )
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
      let apiPath = routes.create.replace("{model_id}", data.process_model_id)

      // Generate ID for a new item.
      if (typeof data.id === 'undefined' || !data.id) {
        data.id = uuidv4()
      }

      this.http.put(apiPath, data).then(response => {
        // console.log("Port API, 'create', server response:")
        // console.log(response)

        if (response.status == 201) {
          // Fill ID property if it was generated by server.
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

  update( data ) {
    return new Promise((resolve, reject) => {
      let apiPath = routes.update.replace("{model_id}", data.process_model_id).replace("{port_id}", data.id)

      this.http.patch(apiPath, data).then(response => {
        // console.log("Port API, 'update', server response:")
        // console.log(response)

        if (response.status == 200) {
          // resolve( data )
          resolve(response.data.item)
        } else {
          reject("Error occurres while updating data.")
        }
      }).catch(error => {
        reject(error)
      })
    })
  }

  delete({ process_model_id, id }) {
    return new Promise((resolve, reject) => {
      let apiPath = routes.delete.replace("{model_id}", process_model_id).replace("{port_id}", id)

      this.http.delete(apiPath).then(response => {
        // console.log("Port API, 'delete', server response:")
        // console.log(response)

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
const apiPort = new ApiPort('port')

export default apiPort
