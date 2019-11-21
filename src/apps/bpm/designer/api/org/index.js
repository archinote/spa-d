/**
 * API module
 * OrgStructure API
 */
import { ApiModule } from '@/api/api-module'
import routes from './routes'
// import uuidv4 from 'uuid/v4'

export class ApiOrg extends ApiModule {

  check() {
    return new Promise((resolve, reject) => {
      let apiPath = routes.companiesPosts

      // console.log("OrgStructure API, 'check' method, apiPath:");
      // console.log(apiPath);

      this.http.get(apiPath).then(response => {
        // console.log("OrgStructure API, 'check' method, server response:")
        // console.log(response)

        if (response.status == 200) {
          resolve( true )
        } else {
          resolve( false )
        }
      }).catch(error => {
        // reject(error)
        resolve(false)
      })
    })
  }

  // orgstructureTree() {
  //   return new Promise((resolve, reject) => {
  //     let apiPath = routes.orgstructureTree
  //
  //     // console.log("OrgStructure API, 'orgstructureTree' method, apiPath:");
  //     // console.log(apiPath);
  //
  //     this.http.get(apiPath).then(response => {
  //       console.log("OrgStructure API, 'orgstructureTree' method, server response:")
  //       console.log(response)
  //
  //       if (response.status == 200 && response.data && response.data.container_tree) {
  //         resolve( response.data.container_tree )
  //       } else {
  //         reject("OrgStructure API. Error occurres while getting server data ('orgstructureTree' method).")
  //       }
  //     }).catch(error => {
  //       console.warn(error)
  //       reject(error)
  //     })
  //   })
  // }

  /**
   * Gets post & container info by itd ids array.
   *
   * @param 'ids' - array of entities id (post & container)
   */
  info( posts_ids, containers_ids ) {
    return new Promise((resolve, reject) => {
      let apiPath = routes.info

      // this.http.post(apiPath, { posts_ids, containers_ids }).then(response => {
      this.http.post(apiPath, {
        // entities_ids: { posts_ids, containers_ids }
        posts_ids, containers_ids
      }).then(response => {
        // console.log("OrgStructure API, 'info' method, server response:")
        // console.log(response)

        if (response.status == 200 && response.data) {
          // containers_data
          // posts_data
          resolve( { containersData: response.data.containers_data, postsData: response.data.posts_data } )
        } else {
          reject("OrgStructure API. Error occurres while getting server data ('info' method).")
        }
      }).catch(error => {
        console.warn(error)
        reject(error)
      })
    })
  }

  tree() {
    return new Promise((resolve, reject) => {
      let apiPath = routes.tree

      // console.log("OrgStructure API, 'tree' method, apiPath:");
      // console.log(apiPath);

      this.http.get(apiPath).then(response => {
        // console.log("OrgStructure API, 'tree' method, server response:")
        // console.log(response)

        if (response.status == 200 && response.data && response.data.tree) {
          resolve( response.data.tree )
        } else {
          reject("OrgStructure API. Error occurres while getting server data ('tree' method).")
        }
      }).catch(error => {
        console.warn(error)
        reject(error)
      })
    })
  }

  postsList(containerId = null) {
    return new Promise((resolve, reject) => {
      let apiPath = routes.post.list.replace( "{containerId}", containerId ? containerId : "0" )

      // console.log("OrgStructure API, 'postsList' method, apiPath:");
      // console.log(apiPath);

      this.http.get(apiPath).then(response => {
        // console.log("OrgStructure API, 'postsList' method, server response:")
        // console.log(response)

        if (response.status == 200 && response.data && response.data.posts) {
          resolve( response.data.posts )
        } else {
          reject("OrgStructure API. Error occurres while getting server data ('postsList' method).")
        }
      }).catch(error => {
        console.warn(error)
        reject(error)
      })
    })
  }
}

// Create and export module class instance.
const apiOrg = new ApiOrg('org')
export default apiOrg
