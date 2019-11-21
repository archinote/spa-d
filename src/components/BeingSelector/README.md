DBeingSelector
==============
Selector для форм, позволяющий выбрать пост из списка, сформированного динамически из списка id постов.
Динамически загружает данные каждого поста на основании его id.

Параметры:
---
| Название | Описание | Тип | Значение по умолчанию | Пример |
|--|--|--|--|--|
| ids      | Массив id | Array | [] | ['<строка id в формате uuid>', ... ''] |
| label | Метка | String | undefined | 'Исполнитель' |
| hint | Подпись | String | undefined | 'Выберите исполнителя из списка' |
| use-faker | Использовать генератор данных для замещения некорректных или пустых значений | Boolean | false | true |
| multiple | Множественный выбор | Boolean | false | true |

Другие параметры аналогичны компоненту v-selector vuetify (**```в разработке```**).

Пример использования:
---

Подключить компонент:
```js
import DBeingSelector from '@/components/BeingSelector'
```

Добавить в разметку компонента, передав необходимые параметры 

```html
<d-being-selector
  :ids="posts"
  label="Пост"
  hint="Выберите пост (или несколько) из списка"
  v-model="selectedPosts"
  use-faker
  multiple
/>
```

Получение результата пользовательского выбора
----
Осуществляется через использование ```v-model```

### Ссылки:

+ [Select (vuetify)](https://vuetifyjs.com/en/components/selects)
+ [Using v-model on Components](https://vuejs.org/v2/guide/components.html#Using-v-model-on-Components)
