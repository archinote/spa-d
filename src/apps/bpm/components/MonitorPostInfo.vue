<template>
  <!-- 'chip' view -->
  <loading v-if="viewAs === 'chip' && status === 'loading'" :flat="true" :message="false" progress="circular" color="primary" size="24" width="2" />

  <!-- <v-chip v-if="viewAs === 'chip'" disabled :outline="false && Boolean(!postId)" :color="Boolean(!postId) ? 'grey darken-1' : ''"> -->
  <v-chip v-else-if="viewAs === 'chip' && status !== 'loading'" disabled>
    
    <!-- state: no post-id -->
    <template v-if="status === 'noId'">
      <v-avatar>
        <v-icon color="grey">mdi-account-off</v-icon>
      </v-avatar>
      отсутствует
    </template>
    
    <!-- state: error -->
    <template v-else-if="status === 'error'">
      <v-avatar>
        <v-icon color="grey">mdi-account-off</v-icon>
      </v-avatar>
      произошла ошибка
    </template>

    <!-- state: loading -->
    <!-- <template v-else-if="status === 'loading'">
      <loading :flat="true" :message="false" progress="circular" color="primary" size="24" width="2" />
    </template> -->

    <!-- state: normal -->
    <template v-else>
      <v-avatar>
        <img v-if="photo" :src="photo" />
        <v-icon v-else>{{ icon }}</v-icon>
      </v-avatar>
      {{ name }}
    </template>

  </v-chip>

  <!-- 'list-tile' vew -->
  <v-list-tile v-else avatar>

    <!-- state: no post-id -->
    <template v-if="status === 'noId'">
      <v-list-tile-avatar>
        <v-icon>mdi-account-off</v-icon>
      </v-list-tile-avatar>
      <v-list-tile-content>
        <v-list-tile-title>отсутствует</v-list-tile-title>
        <!-- <v-list-tile-sub-title></v-list-tile-sub-title> -->
      </v-list-tile-content>
    </template>

    <!-- state: error -->
    <template v-else-if="status === 'error'">
      <v-list-tile-avatar>
        <v-icon>mdi-account-off</v-icon>
      </v-list-tile-avatar>
      <v-list-tile-content>
        <v-list-tile-title>{{ errorMessage }}</v-list-tile-title>
        <v-list-tile-sub-title>{{ errorMessage2 }}</v-list-tile-sub-title>
      </v-list-tile-content>
    </template>

    <!-- state: loading -->
    <template v-else-if="status === 'loading'">
      <v-list-tile-avatar>
        <v-icon>face</v-icon>
      </v-list-tile-avatar>
      <v-list-tile-content>
        <loading :flat="true" :message="false" progress="circular" color="primary" size="32" width="3" />
      </v-list-tile-content>
      <!-- <v-list-tile-action>
        <loading :flat="true" :message="false" :progress="'circular'" :color="'primary'" :size="32" :width="3"></loading>
      </v-list-tile-action> -->
    </template>

    <!-- state: normal -->
    <template v-else>
      <v-list-tile-avatar>
        <img v-if="photo" :src="photo" />
        <v-icon v-else>{{ icon }}</v-icon>
        <!-- <v-icon v-else>mdi-emoticon-neutral</v-icon> -->
      </v-list-tile-avatar>
      <v-list-tile-content>
        <v-list-tile-title>{{ name }}</v-list-tile-title>
        <v-list-tile-sub-title v-if="subTitle">{{ subTitle }}</v-list-tile-sub-title>
      </v-list-tile-content>
    </template>

  </v-list-tile>

</template>

<script>
export default {
  props: {
    postId: {
      type: String,
      default: ''
    },
    viewAs: {
      type: String,
      default: 'list-tile'
    },
    subTitle: {
      type: String,
      default: ''
    },
    emptyName: {
      type: String,
      default: 'Иван Безымянный'
    },
    notAppointed: {
      type: String,
      default: 'не назначен'
    }
  },

  computed: {
    postInfo: function() {
      return this.postId ? this.$store.getters['app/org/getPostById'](this.postId) : {}
    },
    status: function() {
      if (!this.postId) {
        return 'noId'
      } else if (this.loaded === false) {
        return 'loading'
      } else if (this.hasError) {
        return 'error'
      }
      return ''
    },
    loaded: function() {
      return this.postInfo.loaded
    },
    name: function () {
      return this.postInfo && this.postInfo.fullname 
        ? this.postInfo.fullname 
        : this.emptyName
    },
    photo: function () {
      return this.postInfo && this.postInfo.photo 
        ? this.postInfo.photo 
        : ''
    },
    icon: function () {
      return this.postInfo && this.postInfo.avatarIcon 
        ? this.postInfo.avatarIcon 
        : 'face'
    },
    fakeAvatar: function() {
      return this.$store.getters['app/faker/avatar']()
    },
    fakeName: function() {
      return this.$store.getters['app/faker/fullname']()
    }
  },

  data: function() {
    return {
      hasError: false,
      errorMessage: 'Данные не получены',
      errorMessage2: 'Ошибка при обращении к серверу'
    }
  },

  mounted() {
    if (!this.loaded) {
      this.$store.dispatch("app/org/loadEntity", {
        post: this.postId
      })

      this.hasError = false
      setTimeout(() => {
        if (!this.loaded && this.postId) {
          // server has not response
          this.hasError = true
        }
      }, 10000)
    }
  },

  methods: {}
}
</script>
