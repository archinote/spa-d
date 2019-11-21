# Confirmer component

## Usage examples:

### As alert:
```js
this.$store.dispatch('confirmer/alert', {
  type: 'error',
  body: 'Произошла ошибка при получении данных от сервера.'
})
```

### As confirmer:
```js
this.$store.dispatch('confirmer/ask', {
  body: 'Вы согласны пройти тест?',
  confirmText: 'Согласен',
  cancelText: 'Нет'
}).then(confirmed => {
  // confirmed: 'true' or 'false'
  if (confirmed) {
    this.$store.dispatch('toaster/show', {
      text: 'Получено согласие',
      color: 'green'
    })
  } else {
    this.$store.dispatch('toaster/show', {
      text: 'Получен отказ',
      color: 'red'
    })
  }
})
```

### With nested component
```js
this.$store.dispatch('confirmer/ask', {
  width: 800,
  title: 'Заголовок окна',
  component: ConfirmerFormComponent, // Компонент для отображения внутри диалогового окна
  onSubmit: 'onConfirm', // название метода в компоненте для вызова по сабмиту, 'onSubmit' по-умолчанию
  props: { // данные для передачи компоненту в качестве входных параметров
    id: 99,
    someText: 'Text message',
    someObject: { t1: 't1', t2: this.t2 }
  },
  confirmText: 'Подтвердить', // Текст кнопки Submit
  cancelText: 'Отменить' // Текст кнопки Cancel
}).then(confirmed => {
  // confirmed: 'true' or 'false'
  if (confirmed) {
    this.$store.dispatch('toaster/show', {
      text: 'Форма подтверждена',
      color: 'green'
    })
  } else {
    this.$store.dispatch('toaster/show', {
      text: 'Форма отменена',
      color: 'red'
    })
  }
})

// Сам компонент может содержать метод обработки подтверждения формы,
// который должен возвращать Promise
onSubmit: function() {
  return new Promise((resolve, reject) => {
    // Можно валидировать значения полей формы,
    // отправить их на сервер и т.д.
    // ...
    if ('<всё в порядке>') {
      // Закрываем диалоговое окно.
      resolve(true)
    } else {
      // НЕ закрываем диалоговое окно.
      // Например для исправления ошибок в полях формы
      resolve(false)
    }
    // вызов reject() всегда приводит к закрытию диалогового окна
  })
}
```