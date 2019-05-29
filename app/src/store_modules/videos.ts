import Video from '@/classes/video';
import Vue from "vue";
import fs from "fs";

type RootState = {
  items: Video[]
}

export default {
  namespaced: true,

  state: {
    items: [] as Video[]
  },
  getters: {
    getAll(state: RootState): Video[] {
      return state.items;
    },
    getByPath: (state: RootState) => (path: string): Video | undefined => {
      return state.items.find((v: Video) => v.path == path);
    },
    getByActor: (state: RootState) => (id: string): Video[] => {
      return state.items.filter((v: Video) => v.actors.includes(id));
    },
    getLabels(state: RootState) {
      return [
        ...new Set(
          (<Video[]>state.items).reduce(
            (acc: string[], video) => acc.concat(video.labels),
            []
          )
        )
      ];
    }
  },
  mutations: {
    set(state: RootState, items: Video[]) {
      state.items = items;
    },
    add(state: RootState, items: Video[]) {
      state.items.push(...items);
    },
    addThumbnails(state: RootState, { id, images }: { id: string, images: string[] }) {
      let _index = state.items.findIndex((v: Video) => v.id == id) as number;

      if (_index >= 0) {
        let video = state.items[_index] as Video;
        video.thumbnails.push(...images);
        Vue.set(state.items, _index, video);
      }
    },
    setCoverIndex(state: RootState, { id, index }: { id: string, index: number }) {
      let _index = state.items.findIndex((v: Video) => v.id == id) as number;

      if (_index >= 0) {
        let video = state.items[_index] as Video;
        video.coverIndex = index;
        Vue.set(state.items, _index, video);
      }
    },
    removeThumbnail(state: RootState, { id, index }: { id: string, index: number }) {
      let _index = state.items.findIndex((v: Video) => v.id == id) as number;

      if (_index >= 0) {
        let video = state.items[_index] as Video;

        video.thumbnails.splice(index, 1)[0];

        if (video.coverIndex >= video.thumbnails.length) {
          video.coverIndex -= 1;
        }

        Vue.set(state.items, _index, video);
      }
    },
    rate(state: RootState, { id, rating }: { id: string, rating: number }) {
      let _index = state.items.findIndex((v: Video) => v.id == id) as number;

      if (_index >= 0) {
        let video = state.items[_index] as Video;
        video.rating = video.rating == rating ? 0 : rating;
        Vue.set(state.items, _index, video);
      }
    },
    favorite(state: RootState, id: string) {
      let _index = state.items.findIndex((v: Video) => v.id == id) as number;

      if (_index >= 0) {
        let video = state.items[_index] as Video;
        video.favorite = !video.favorite;
        Vue.set(state.items, _index, video);
      }
    },
    bookmark(state: RootState, id: string) {
      let _index = state.items.findIndex((v: Video) => v.id == id) as number;

      if (_index >= 0) {
        let video = state.items[_index] as Video;
        video.bookmark = !video.bookmark;
        Vue.set(state.items, _index, video);
      }
    },
    setLabels(state: RootState, { id, labels }: { id: string, labels: string[] }) {
      let _index = state.items.findIndex((v: Video) => v.id == id) as number;

      if (_index >= 0) {
        let video = state.items[_index] as Video;
        video.labels = labels;
        Vue.set(state.items, _index, video);
      }
    },
    incrementViewCounter(state: RootState, id: string) {
      let _index = state.items.findIndex((v: Video) => v.id == id) as number;

      if (_index >= 0) {
        let video = state.items[_index] as Video;
        video.watches.push(+new Date());
        Vue.set(state.items, _index, video);
      }
    },
    edit(state: RootState, { id, settings }: { id: string, settings: any }) {
      let _index = state.items.findIndex((v: Video) => v.id == id) as number;

      if (_index >= 0) {
        let video = state.items[_index] as Video;
        video.title = settings.title || video.title;
        video.actors = settings.actors || video.actors;
        Vue.set(state.items, _index, video);
      }
    }
  },
  actions: {
    add(context: any, files: File[]) {
      return new Promise((resolve, reject) => {
        const videos = files.map(file => Video.create(file));
        context.commit("add", videos);
        resolve();
      })
    }
  },
}