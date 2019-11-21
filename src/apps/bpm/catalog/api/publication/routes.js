/**
 * Routes list
 * BPM Catalog API Routes
 */
const _prefix = String(process.env.API_PREFIX_BPM_CATALOG || '/bpm/v1/catalog')

export default {
  // Список доступных процессов (публикаций) для Каталога
  index: _prefix + "/publications",

  // GET one item by its ID.
  show: _prefix + "/publications/{publication_id}",

  // GET  - Форма с параметрами процесса для его запуска из Каталога
  form: _prefix + "/publications/{publication_id}/form",

  // PUT - Запуск процесса из Каталога
  start: _prefix + "/publications/{publication_id}"
}
