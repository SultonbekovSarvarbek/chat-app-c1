import { createApp } from 'vue';
import { Quasar } from 'quasar';
import quasarIconSet from 'quasar/icon-set/material-icons';

import 'quasar/src/css/index.sass';

import App from './App.vue';

const app = createApp(App);

app.use(Quasar, {
  plugins: {},
  iconSet: quasarIconSet
});

app.mount('#app'); 