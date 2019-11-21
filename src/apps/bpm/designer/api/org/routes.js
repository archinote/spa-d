/**
 * Routes list
 * API Processes
 */
const _prefix = String(process.env.API_PREFIX_ORG || '/org/v1')

export default {
  // GET
  companiesPosts: _prefix + "/companies-posts",

  // GET
  tree: _prefix + "/tree/bp",

  // POST - get info about posts & containers
  // 'posts_ids' as array of entities ('post' or/and 'container')
  info: _prefix + "/entities-info",

  post: {
    // GET
    list: _prefix + "/posts-list/{containerId}"
  }
}
