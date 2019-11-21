/**
 * API module
 * BPM Link data API
 */
import { ApiModule } from '@/api/api-module'
import routes from './routes'
// import uuidv4 from 'uuid/v4'

export class ApiLinkData extends ApiModule {
  getLinkData( processId, linkId ) {
    return new Promise((resolve, reject) => {
      const apiPath = routes.data.show
        .replace('{model_id}', processId)
        .replace('{link_id}', linkId)

      this.http.get(apiPath).then(response => {
        if (response.status == 200 && response.data) {
          resolve( response.data )
        } else {
          reject('Error occurres while loading data from server')
        }
      }).catch(error => {
        reject(error)
      })
    })
  }

  sharedPorts( processId, portLinkId, data ) {
    return new Promise((resolve, reject) => {
      const apiPath = routes.data.sharedPorts
        .replace('{model_id}', processId)
        .replace('{port_link_id}', portLinkId)

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

  linkDataSettings( processId, portLinkId, data ) {
    return new Promise((resolve, reject) => {
      const apiPath = routes.data.linkDataSettings
        .replace('{model_id}', processId)
        .replace('{port_link_id}', portLinkId)

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
}

// Create and export module class instance.
const apiLinkData = new ApiLinkData('linkData')
export default apiLinkData
