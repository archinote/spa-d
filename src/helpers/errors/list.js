/**
 * Errors table
 */
const validationErrors = {
  'required': {
    'ru': 'Это поле не может быть пустым'
  },
  'wrong_format': {
    'ru': 'Неправильный формат поля'
  },
  'unique': {
    'ru': 'Значение поля должно быть уникальным'
  },
  'unique_in_container': {
    'ru': 'Значение должно быть уникальным внутри контейнера'
  },

  // Бизнес-процессы
  'bpm_dataformat_bad': {
    'ru': 'Неверный формат данных'
  },
  'bpm_model_notfound': {
    'ru': 'Модель процесса не найдена'
  },
  'bpm_model_notcreated': {
    'ru': 'Модель процесса не создана'
  },
  'bpm_model_notupdated': {
    'ru': 'Модель процесса не изменена'
  },
  'bpm_model_notdeleted': {
    'ru': 'Модель процесса не удалена'
  },
  'bpm_submomodel_notfound': {
    'ru': 'Вложенная модель не найдена'
  },
  'bpm_submomodel_notcreated': {
    'ru': 'Вложенная модель не создана'
  },
  'bpm_submomodel_notupdated': {
    'ru': 'Вложенная модель не изменена'
  },
  'bpm_submomodel_notdeleted': {
    'ru': 'Вложенная модель не удалена'
  },
  
}

export default validationErrors
