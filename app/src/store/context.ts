import { VuexModule, Module, Mutation, Action } from "vuex-class-modules";

@Module
class ContextModule extends VuexModule {
  showFilters = false;

  sceneAspectRatio = 1;
  actorAspectRatio = 1;

  @Mutation
  toggleFilters(bool: boolean) {
    this.showFilters = bool;
  }

  @Mutation
  setSceneAspectRatio(val: number) {
    this.sceneAspectRatio = val;
  }

  @Mutation
  setActorAspectRatio(val: number) {
    this.actorAspectRatio = val;
  }
}

import store from "./index";
export const contextModule = new ContextModule({ store, name: "context" });
