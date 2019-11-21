/**
 * Routes list
 * API Processes
 */
const _prefix = String(process.env.API_PREFIX_BPM_DESIGNER || '/bpm/v1/designer')

export default {
  // GET
  index: _prefix + "/models",

  // GET
  show: _prefix + "/models/{model_id}",

  // PUT
  create: _prefix + "/models",

  // PATCH
  update: _prefix + "/models/{model_id}",

  // DELETE
  delete: _prefix + "/models/{model_id}"
}
