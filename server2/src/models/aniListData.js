class AniListData {
  constructor(aniListObj) {
    this.id = aniListObj.id;
    this.season = aniListObj.season;
    this.seasonYear = aniListObj.seasonYear;
    this.episodes = aniListObj.episodes;
    this.title = aniListObj.title.romaji;
    this.englishTitle = aniListObj.title.english;
    this.nativeTitle = aniListObj.title.native;
    this.genres = aniListObj.genres;
    this.source = aniListObj.source;
    if (aniListObj.coverImage) {
      this.coverImage = aniListObj.coverImage.large;
      this.color = aniListObj.coverImage.color;
    }
    this.bannerImage = aniListObj.bannerImage;
    if (aniListObj.studios &&
      aniListObj.studios.edges &&
      aniListObj.studios.edges[0] &&
      aniListObj.studios.edges[0].node &&
      aniListObj.studios.edges[0].node.name) {
      this.studio = aniListObj.studios.edges[0].node.name;
    }
    this.nextAiringEpisode = aniListObj.nextAiringEpisode;
    this.description = aniListObj.description;
    this.localCoverImage = null;
    this.localBannerImage = null;
  }

  setLocalImages(cover, banner) {
    this.localCoverImage = cover;
    this.localBannerImage = banner;
  }
};

module.exports = AniListData;