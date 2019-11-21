DBeing
=======

Получение данных контейнера или поста. В процессе загрузки меняется состояние данных.

Props:
--------------

```yaml
id:
    type: string
    required: true
type:
    type: string
    enum: [post,container]
    required: true
data:
    type: mixed    
```

Методы:
-------

```js
load(){
    ... Инициализация загрузки данных (первоначально инициируется при монтировании компонента)
}
```

Использование:
--------------

Подключить компонент, передаем в качестве параметров идентификатор и тип сущности.

```html
<d-being :id="item.id" :type="item.type">
    <!-- Шаблон для отображения бытийности -->
    <div slot="default" slot-scope="{being,type,data}">
        <template v-if="being.loaded!==false">
          Данные загружены  {{being}}
        </template>
        <template v-else>
          Загрузка {{being}}
        </template>
    </div>
</d-being>  
```

### Ссылки:

+ [Список компонентов](../)

