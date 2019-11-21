/**
 * Состояния приложения
 */
const statuses = {
  //Загрузка компаний
  companiesLoading: "companiesLoading",
  //Компании загружены
  companiesLoaded: "companiesLoaded",
  //
  netError: "netError", //Ошибка сети
  checkAuth: "checkAuth", //Проверка авторизации
  notAuth: "notAuth", //Аккаунт не авторизован
  checkCompanies: "checkCompanies", //Загрузка компаний и постов
  checkAccess: "checkAccess", //Проверка доступов
  finish: true //Загрузка завершена
};
export { statuses };
