# Dialog form mixin

## How to use this mixin in compponents

### Method 1

```html
<script>
  import dialogForm from 'vue-2-components/src/mixins/dialogForm'

  export default {
    mixins: [
      dialogForm
    ]

    // ...
    // component source code
    // ...
  }
</script>
```

### Method 2
```html
<script>
  export default {
    mixins: [
      require("vue-2-components/src/mixins/dialogForm")
    ]

    // ...
    // component source code
    // ...
  }
</script>
```