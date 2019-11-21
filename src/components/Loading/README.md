# Loading (loading indicator) component

### Usage example:
```html
  <Loading message="Загружаются данные поста. Пожалуйста, подождите." />
```
или
```html
  <Loading 
    message="Приложение загружается. Пожалуйста, подождите." 
    hasToolbar
    color="primary"
    progress="circular"
  />
```

Параметры:
-----
| Название | Описание | Тип | Значение по умолчанию | Пример |
|--|--|--|--|--|
| message      | Текст сообщения | [String, Boolean] | 'Загружаются данные. Пожалуйста, подождите.' | false - для сокрытия сообщения |
| progress     | Тип индикатора | String | 'linear' | 'circular' |
| color        | Цвет (тулбара, текста, индикатора) | String | 'grey' | 'primary' |
| size         | Размер кругового индикатора | [String, Number] | 40 | 50 |
| width        | Ширина кругового индикатора | [String, Number] | 5 | 3 |
| height       | Высота линейного индикатора | [String, Number] | 5 | 4 |
| flat         | Отображать без тени | Boolean | false | true |
| hasToolbar   | Отображать ли тулбар | Boolean | false | true |
| toolbarTitle | Заголовок в тулбаре | String | 'Информация' | 'Info' |
| toolbarIcon  | Иконка в тулбаре | String | 'info' | 'mdi-information-outline' |

