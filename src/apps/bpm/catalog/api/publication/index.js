/**
 * API module
 * Catalog Publication module.
 */
import { ApiModule } from '@/api/api-module'
import routes from './routes'
// import uuidv4 from 'uuid/v4'

export class ApiPublication extends ApiModule {
  list() {
    return new Promise((resolve, reject) => {
      // let apiPath = routes.index.replace("{model_id}", processId)
      let apiPath = routes.index

      this.http.get(apiPath).then(response => {
        // console.log("Publication API, 'list' method, server response:")
        // console.log(response)

        if (response.status == 200 && response.data && response.data.data) {
          resolve( response.data.data )
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
      let apiPath = routes.show.replace("{model_id}", processId).replace("{submodel_id}", id)

      this.http.get(apiPath).then(response => {
        // TODO - need to check server response
        // console.log("Publication API, GET 'item', server response:")
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

  /**
   * Получение "резиновой" формы для запуска процесса из Каталога.
   */
  form( publicationId ) {
    return new Promise((resolve, reject) => {
      let apiPath = routes.form.replace("{publication_id}", publicationId)

      this.http.get(apiPath).then(response => {
        // console.log("Publication API, 'form', server response:")
        // console.log(response)

        if (response.status == 200 && response.data) {
          resolve( response.data )
        } else {
          reject("Error occurres while getting server data.")
        }
      }).catch(error => {
        reject(error)
      })
    })
  }

  /**
   * Запуск БП из Каталога с передачей всех параметров, заполненных в "резиновой" форме.
   */
  start( publicationId, data ) {
    return new Promise((resolve, reject) => {
      if (publicationId && data) {
        let apiPath = routes.start.replace("{publication_id}", publicationId)

        this.http.put(apiPath, data).then(response => {
          // console.log("Publication API, 'start', server response:")
          // console.log(response)

          resolve( response )
        }).catch(error => {
          reject(error)
        })
      }
    })
  }
}

// Create and export module class instance.
const apiPublication = new ApiPublication('publication')

export default apiPublication
