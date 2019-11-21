/**
 * API module
 * BPM Processes
 */
import { ApiModule } from '@/api/api-module'
import routes from './routes'
// import uuidv4 from 'uuid/v4'

export class ApiPortPublicationAccess extends ApiModule {

  list( processId, portId, role = 9 ) {
    return new Promise((resolve, reject) => {
      let apiPath = routes.index.replace("{model_id}", processId)

      this.http.get(apiPath, {
        params: {
          role,
          port_id: portId
        }
      }).then(response => {
        // console.log("Port Publication Access API, 'list' action, server response:")
        // console.log(response)

        if (response.status == 200 && response.data && response.data.contractors) {
          resolve( response.data.contractors )
        } else {
          reject("Error occurres while loading data from server")
        }
      }).catch(error => {
        reject(error)
      })
    })
  }

  update( processId, data, role = 9 ) {
    return new Promise((resolve, reject) => {
      if (processId && data) {
        let apiPath = routes.update.replace("{model_id}", processId)

        this.http.patch(apiPath, data).then(response => {
          // console.log("Port Publication Access API, 'update', server response:")
          // console.log(response)

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
}

const apiPortPublicationAccess = new ApiPortPublicationAccess('portPublicationAccess')
export default apiPortPublicationAccess
