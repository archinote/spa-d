/**
 * Routes list
 * API Processes
 */
const _prefix = String(process.env.API_PREFIX_BPM_DESIGNER || '/bpm/v1/designer')

export default {
  // GET
  index: _prefix + "/models/{model_id}/ports",

  // PUT
  create: _prefix + "/models/{model_id}/ports",
  // create: "/" + version + "/businessprocessdesigner/port-create",

  // GET
  show: _prefix + "/models/{model_id}/ports/{port_id}",
  // show: "/" + version + "/businessprocessdesigner/port",

  // PATCH
  update: _prefix + "/models/{model_id}/ports/{port_id}",
  // update: "/" + version + "/businessprocessdesigner/port-update",

  // DELETE
  delete: _prefix + "/models/{model_id}/ports/{port_id}",
  // delete: "/" + version + "/businessprocessdesigner/port-delete"

  data: {
    // Получение списка параметров порта модели процесса
    // GET
    index: _prefix + "/models/{model_id}/ports/{port_id}/data",

    // Создание параметра порта модели процесса
    // PUT
    create: _prefix + "/models/{model_id}/ports/{port_id}/data",

    // Получение параметра порта модели процесса
    // GET
    show: _prefix + "/models/{model_id}/ports/{port_id}/data/{data_id}",

    // Изменение параметра порта модели процесса
    // PATCH
    update: _prefix + "/models/{model_id}/ports/{port_id}/data/{data_id}",

    // Удаление параметра порта модели процесса
    // DELETE
    delete: _prefix + "/models/{model_id}/ports/{port_id}/data/{data_id}"
  }
}
