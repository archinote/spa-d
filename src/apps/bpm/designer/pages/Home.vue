<template lang="html">
  <v-container fluid class="pa-3 bgs-container">
    <v-layout row>
      <v-flex xs12 sm6 offset-sm3>
        <div class="pt-5">
          <v-alert 
            :value="true"
            color="info"
            icon="info"
          >
            Выберите процесс из меню слева или создайте новый.
          </v-alert>
        </div>
      </v-flex>
    </v-layout>
  </v-container>
</template>
