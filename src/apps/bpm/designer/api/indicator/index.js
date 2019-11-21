/**
 * API module
 * BPM Indicator API
 */
import { ApiModule } from '@/api/api-module'
import routes from './routes'
import uuidv4 from 'uuid/v4'
import apiIndicatorState from './indicatorState'

export class ApiIndicator extends ApiModule {

  list( processId ) {
    return new Promise((resolve, reject) => {
      let apiPath = routes.index.replace("{model_id}", processId)

      this.http.get(apiPath).then(response => {
        // console.log("Indicator API, 'list' action, server response:")
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

  item( processId, id ) {
    return new Promise((resolve, reject) => {
      let apiPath = routes.show.replace("{model_id}", processId).replace("{indicator_id}", id)

      this.http.get(apiPath).then(response => {
        // TODO - need to check server response
        console.log("Indicator API, GET 'item', server response:")
        console.log(response)

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

  create( processId, data ) {
    return new Promise((resolve, reject) => {
      if (processId && data) {
        let apiPath = routes.create.replace("{model_id}", processId)

        // Generate ID for a new item.
        if (typeof data.id === 'undefined' || !data.id) {
          data.id = uuidv4()
        }

        this.http.put(apiPath, data).then(response => {
          console.log("Indicator API, 'create', server response:")
          console.log(response)

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
      }
    })
  }

  update( processId, id, data ) {
    return new Promise((resolve, reject) => {
      if (processId && id && data) {
        let apiPath = routes.update.replace("{model_id}", processId).replace("{indicator_id}", id)

        this.http.patch(apiPath, data).then(response => {
          console.log("Indicator API, 'update', server response:")
          console.log(response)

          if (response.status == 200) {
            resolve( data )
          } else {
            reject("Error occurres while updating data.")
          }
        }).catch(error => {
          reject(error)
        })
      }
    })
  }

  delete( processId, id ) {
    return new Promise((resolve, reject) => {
      if (processId && id) {
        let apiPath = routes.delete.replace("{model_id}", processId).replace("{indicator_id}", id)

        this.http.delete(apiPath).then(response => {
          console.log("Indicator API, 'delete', server response:")
          console.log(response)

          if (response.status == 200) {
            resolve( true )
          } else {
            reject("Error occurres while deleting data.")
          }
        }).catch(error => {
          reject(error)
        })
      }
    })
  }
}

// Create and export module class instance.
const apiIndicator = new ApiIndicator('indicator')
apiIndicator.addModules([
  apiIndicatorState
])

export default apiIndicator
