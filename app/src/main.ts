import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import "roboto-fontface/css/roboto/roboto-fontface.css";
import "@mdi/font/css/materialdesignicons.css";
import VueTheMask from "vue-the-mask";

import BindTitle from "./components/BindTitle.vue";
import DateInput from "./components/DateInput.vue";
import Rating from "./components/Rating.vue";
import LabelFilter from "./components/LabelFilter.vue";
import Divider from "./components/Divider.vue";
import NoResults from "./components/NoResults.vue";
import Loading from "./components/Loading.vue";

Vue.use(VueTheMask);

Vue.component("BindTitle", BindTitle);
Vue.component("DateInput", DateInput);
Vue.component("Rating", Rating);
Vue.component("LabelFilter", LabelFilter);
Vue.component("Divider", Divider);
Vue.component("NoResults", NoResults);
Vue.component("Loading", Loading);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");
