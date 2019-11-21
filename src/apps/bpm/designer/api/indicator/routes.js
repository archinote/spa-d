/**
 * Routes list
 * API Processes
 */
const _prefix = String(process.env.API_PREFIX_BPM_DESIGNER || '/bpm/v1/designer')

export default {
  // GET
  index: _prefix + "/models/{model_id}/indicators",

  // PUT
  create: _prefix + "/models/{model_id}/indicators",

  // GET
  show: _prefix + "/models/{model_id}/indicators/{indicator_id}",
  // show: "/" + version + "/businessprocessdesigner/port",

  // PATCH
  update: _prefix + "/models/{model_id}/indicators/{indicator_id}",

  // DELETE
  delete: _prefix + "/models/{model_id}/indicators/{indicator_id}",

  // Indicator states
  state: {
    // GET
    index: _prefix + "/models/{model_id}/indicators/{indicator_id}/states",

    // PUT
    create: _prefix + "/models/{model_id}/indicators/{indicator_id}/states",

    // GET
    show: _prefix + "/models/{model_id}/indicators/{indicator_id}/states/{state_id}",

    // PATCH
    update: _prefix + "/models/{model_id}/indicators/{indicator_id}/states/{state_id}",

    // DELETE
    delete: _prefix + "/models/{model_id}/indicators/{indicator_id}/states/{state_id}",
  }
}
