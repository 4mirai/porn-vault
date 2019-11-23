import Vue from "vue";
import Vuetify from "vuetify/lib";
import colors from "vuetify/lib/util/colors";

Vue.use(Vuetify);

export default new Vuetify({
  theme: {
    options: {
      customProperties: true
    },
    themes: {
      light: {
        primary: colors.deepOrange.lighten4,
        secondary: colors.deepOrange.lighten4,
        accent: colors.blue.base,
        error: colors.red.accent3,
        info: colors.blue.darken2,
        success: colors.green.base,
        warning: colors.amber.accent3
      },
      dark: {
        primary: "#221015",
        secondary: colors.deepOrange.lighten4,
        accent: colors.blue.lighten3,
        error: colors.red.lighten3,
        info: colors.blue.darken2,
        success: colors.green.base,
        warning: colors.amber.accent3
      }
    }
  }
});
