'use strict';

const fs = require('fs');
const path = require('path');

const axios = require('axios');
const RateLimiter = require('limiter').RateLimiter;
const stringSimilarity = require('string-similarity');

const logger = require('../../logger');
const { SERIES_IMAGE_BASE } = require('../../../config.json');
const { getYear, getSeasonSynonyms } = require('../../utils/seriesUtil');
const AniListData = require('../../models/aniListData');

const aniListGraphQLEndpoint = 'https://graphql.anilist.co';
const aniListMaxRequestsPerMinute = 60; // it is 90, but being safe here

const limiter = new RateLimiter(aniListMaxRequestsPerMinute, 'minute');

class GraphQLRequest {
  constructor(query, variables) {
    this.query = query;
    this.variables = variables;
  }
}

async function smartSearch(series) {
  const results = await searchForSeries(series);
  const bestMatch = findBestMatch(series, results);
  const data = getAniListData(bestMatch);
  return data;
}

async function searchForSeries(series) {
  if (series && series.length > 0) {
    const req = new GraphQLRequest(
      GRAPHQL_QUERIES.LOOKUP_ANIME_BY_NAME,
      { search: series, page: 1, perPage: 10 });
    const searchResults = await makeAniListRequest(req);
    if (searchResults &&
      searchResults.data &&
      searchResults.data.data &&
      searchResults.data.data.Page &&
      searchResults.data.data.Page.media) {
      return searchResults.data.data.Page.media;
    }
  }
  return null;
}

async function getAniListData(aniListId) {
  if (aniListId) {
    const req = new GraphQLRequest(
      GRAPHQL_QUERIES.QUERY_ANIME_BY_ID,
      { id: aniListId });
    const aniListDetails = await makeAniListRequest(req);
    if (aniListDetails &&
      aniListDetails.data &&
      aniListDetails.data.data &&
      aniListDetails.data.data.Media) {
      return new AniListData(aniListDetails.data.data.Media);
    }
  }
  return null;
}

function findBestMatch(series, results) {
  if (results === null || results.length === 0) {
    return null;
  }

  // optimizations for season year
  const yearFilter = getYear(series);

  // optimizations for season number
  // replace sX with season X as a dual property algorithm

  const seriesInLower = series.toLowerCase();
  const seasonVariations = getSeasonSynonyms(seriesInLower);
  let found = null;

  // let aniList do the heavy lifting, it should be in a good order already!
  results.forEach(result => {
    if (found === null &&
      (yearFilter === null || Math.abs(yearFilter - result.seasonYear) < 2)) {
      const candidates = [...result.synonyms,
        (result.title.english || ''),
        (result.title.romaji || '')].map(s => s.toLowerCase());

      let { bestMatch } = stringSimilarity.findBestMatch(seriesInLower, candidates);

      if (seasonVariations) {
        bestMatch = seasonVariations.map(variation => {
          return (stringSimilarity.findBestMatch(variation, candidates)).bestMatch;
        }).reduce((acc, cur) => {
          return (acc.rating > cur.rating) ? acc : cur;
        }, bestMatch);
      }

      // check if it's good enough
      if (bestMatch.rating > 0.7) {
        found = result.id;
      }
    }
  });
  return found;
}

async function makeAniListRequest(graphQLRequest) {
  // wait for rate limiter
  try {
    await throttle();
    const response = await axios.post(aniListGraphQLEndpoint, graphQLRequest);
    if (response && response.headers && response.headers['x-ratelimit-remaining']) {
      const remainingRequests = parseInt(response.headers['x-ratelimit-remaining']);
      if (remainingRequests < 20) {
        console.log(`DANGER ZONE: ${remainingRequests}`);
      }
      else {
        // console.log(`we stil got ${remainingRequests} left! WOOT!`)
      }
    }
    return response;
  }
  catch (e) {
    logger.error(e);
    return null;
  }
}

async function throttle() {
  return new Promise((res, rej) => {
    limiter.removeTokens(1, function (err, remainingRequests) {
      if (err) {
        rej(err);
      }
      else {
        res(remainingRequests);
      }
    });
  });
}

async function downloadSeriesImages(aniListData) {
  return Promise.all(
    [aniListData.coverImage, aniListData.bannerImage]
      .map(async (url) => {
        if (url) {
          const fileName = path.basename(url);
          const saveTo = path.join(SERIES_IMAGE_BASE, fileName);
          if (await downloadPic(url, saveTo) !== null) {
            return fileName;
          }
        }
      })
  );
}

async function downloadPic(url, saveTo) {
  try {
    return await axios({
      method: 'get',
      url: url,
      responseType: 'stream'
    }).then(res => {
      const writer = fs.createWriteStream(saveTo);
      res.data.pipe(writer);
      return new Promise((res, rej) => {
        writer.on('finish', () => res(saveTo));
        writer.on('error', () => rej());
      });
    });
  }
  catch (e) {
    logger.error(e);
    return null;
  }
}

module.exports = {
  searchForSeries,
  getAniListData,
  smartSearch,
  downloadSeriesImages
};

const GRAPHQL_QUERIES = {
  QUERY_ANIME_BY_ID:
    `query ($id: Int) {
  Media(id: $id, type: ANIME) {
    id
    season
    seasonYear
    episodes
    source
    title {
      romaji
      english
      native
    }
    genres
    coverImage {
      large
      color
    }
    bannerImage
    studios(isMain: true) {
      edges {
        node {
          name
        }
      }
    }
    nextAiringEpisode {
      id
      airingAt
      episode
    }
    description
  }
}`,

  LOOKUP_ANIME_BY_NAME:
    `query ($page: Int, $perPage: Int, $search: String) {
  Page (page: $page, perPage: $perPage) {
    pageInfo {
      total
      currentPage
      lastPage
      hasNextPage
      perPage
    }
    media (search: $search, type:ANIME) {
      id
      format
      seasonYear
      title {
        romaji
        english
      }
      synonyms
    }
  }
}
`
};