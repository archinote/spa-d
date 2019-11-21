/**
 * Example App API module
 * CRUD API
 */
import { ApiModule } from '@/api/api-module'
import routes from './routes'
import uuidv4 from 'uuid/v4'

export class ApiExample extends ApiModule {
  list() {
    return new Promise((resolve, reject) => {
      this.http.get(routes.index).then(response => {
        if (response.status == 200 && response.data) {
          resolve(response.data)
        } else {
          reject("Error occurres while loading data from server")
        }
      }).catch(error => {
        reject(error)
      })
    })
  }

  item( id ) {
    return new Promise((resolve, reject) => {
      let apiPath = routes.show.replace("{entity_id}", id)

      this.http.get(apiPath).then(response => {
        if (response.status == 200 && response.data) {
          resolve(response.data)
        } else {
          reject("Error occurres while loading data from server")
        }
      }).catch(error => {
        reject(error)
      })
    })
  }

  create( entity ) {
    return new Promise((resolve, reject) => {
      let apiPath = routes.create

      // Generate ID for a new entity.
      entity.id = entity.id || uuidv4()

      this.http.put(apiPath, entity).then(response => {
        if ([200, 201].includes(response.status)) {
          resolve(response)
        } else {
          reject("Error occurres while creating data.")
        }
      }).catch(error => {
        reject(error)
      })
    })
  }

  update(entity) {
    return new Promise((resolve, reject) => {
      let apiPath = routes.update.replace("{entity_id}", entity.id)

      this.http.patch(apiPath, entity).then(response => {
        if (response.status == 200) {
          resolve(response)
        } else {
          reject("Error occurres while updating data.")
        }
      }).catch(error => {
        reject(error)
      })
    })
  }

  delete( id ) {
    return new Promise((resolve, reject) => {
      let apiPath = routes.delete.replace("{entity_id}", id)

      this.http.delete(apiPath).then(response => {
        if (response.status == 200) {
          resolve(response)
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
const apiExample = new ApiExample('example')
export default apiExample
