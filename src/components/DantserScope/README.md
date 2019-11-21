# Dantser Scope component

### Usage example:
```html
<dantser-scope :treedata="varTree" v-model="varScope"></dantser-scope>
```

Параметры:
-----
| Название | Описание | Тип | Значение по умолчанию |
|--|--|--|--|--|
| treedata     | Дерево постов | Array | [] |  
| v-model      | Переменная, хранящая скоуп | Array | [] |
| withScopes   | Флаг, показывать ли чекбокс "Включая подчиненные подразделения" | Boolean | false |
| withEdit     | Флаг, показывать ли чекбокс "Разрешить редактирование" | Boolean | false |