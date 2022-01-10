// Flickr API key
const API_KEY = '980fc6e83c3ee34fd359377687def5ca';

const VCmpPhotos = {
  template: `
  <div class="photo-container">
    <div class="image-gallery__item" v-for="photo in this.$parent.photos">
      <a
        :key="photo.id"
        :data-text="photo.text"
        :href="photo.pageURL"
        class="d-inline-block img-tooltip"
        rel="noopener noreferrer"
        target="_blank"
      >
        <img
          :src="photo.imageURL"
          :alt="photo.text"
          class="img-fluid"
          width="150"
          height="150"
        >
      </a>
    </div>
  </div>
  `,
};

new Vue({
  el: '#app-vue', 

  components: {
    'v-cmp-photos': VCmpPhotos,
  },

  data: {
    photos: [],
    searchcnt: 5,
  },

  methods: {
    fetchImagesFromFlickr(e) {
      const searchText = e.target.elements.search.value;
      this.fetchImagesFromFlickr2(searchText, this.searchcnt);
    },
    getRequestURL(searchText, searchcnt){
      const parameters = {
        method: 'flickr.photos.search',
        api_key: API_KEY,
        text: searchText, // 検索テキスト
        sort: 'interestingness-desc', // 興味深さ順
        per_page: searchcnt, // 取得件数
        license: '4', // Creative Commons Attributionのみ
        extras: 'owner_name,license', // 追加で取得する情報
        format: 'json', // レスポンスをJSON形式に
        nojsoncallback: 1, // レスポンスの先頭に関数呼び出しを含めない
      };
      const url = new URL('https://api.flickr.com/services/rest');
      url.search = new URLSearchParams(parameters);
      return url;
    },
    // photoオブジェクトから画像のURLを作成して返す
    getFlickrImageURL(photo, size){
      let url = `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}`;
      if (size) {
        // サイズ指定ありの場合
        url += `_${size}`;
      }
      url += '.jpg';
      return url;
    },
    // photoオブジェクトからページのURLを作成して返す
    getFlickrPageURL(photo){
      return `https://www.flickr.com/photos/${photo.owner}/${photo.id}`
    },
    // photoオブジェクトからaltテキストを生成して返す
    getFlickrText(photo){
      let text = `"${photo.title}" by ${photo.ownername}`;
      if (photo.license === '4') {
        // Creative Commons Attribution（CC BY）ライセンス
        text += ' / CC BY';
      }
      return text;
    },
    fetchImagesFromFlickr2(searchText, searchcnt) {
      const url = this.getRequestURL(searchText, searchcnt);

      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          if (data.stat !== 'ok') {
            console.log("toFailed");
            this.photos = [];
            return;
          }
          
          const fetchedPhotos = data.photos.photo;

          // 検索テキストに該当する画像データがない場合
          if (fetchedPhotos.length === 0) {
            console.log("toNotFound");
            this.photos = [];
            return;
          }
          this.photos = fetchedPhotos.map((photo) => ({
            id: photo.id,
            imageURL: this.getFlickrImageURL(photo, 'q'),
            pageURL: this.getFlickrPageURL(photo),
            text: this.getFlickrText(photo),
          }));
        }).catch(() => {
          this.photos = [];
          console.log("toFailed");
        });
    },
  },
});
