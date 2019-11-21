/**
 * Routes list
 * EXAMPLE API
 */
const _prefix = String(process.env.API_PREFIX_EXAMPLE || '/example/v1')

export default {
  // GET
  index: _prefix + "/crud",

  // GET
  show: _prefix + "/crud/{entity_id}",

  // PUT
  create: _prefix + "/crud",

  // PATCH
  update: _prefix + "/crud/{entity_id}",

  // DELETE
  delete: _prefix + "/crud/{entity_id}"
}
