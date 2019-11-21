/**
 * Routes list
 * API Port publication API
 */
const _prefix = String(process.env.API_PREFIX_BPM_DESIGNER || '/bpm/v1/designer')

export default {
  // GET
  index: _prefix + "/models/{model_id}/indicators-bindings",

  // PUT
  create: _prefix + "/models/{model_id}/indicators-bindings",

  // GET
  show: _prefix + "/models/{model_id}/indicators-bindings/{indicators_bindings_id}",
  // show: "/" + version + "/businessprocessdesigner/port",

  // PATCH
  update: _prefix + "/models/{model_id}/indicators-bindings",

  // DELETE
  delete: _prefix + "/models/{model_id}/indicators-bindings/{indicators_bindings_id}"
}
