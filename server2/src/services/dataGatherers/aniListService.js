'use strict';

const axios = require('axios');
const RateLimiter = require('limiter').RateLimiter;
const stringSimilarity = require('string-similarity');

const logger = require('../../logger');
const AniListData = require('../../models/aniListData');

const aniListGraphQLEndpoint = 'https://graphql.anilist.co';
const aniListMaxRequestsPerMinute = 80; // it is 90, but being safe here

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
  return getAniListData(bestMatch);
}

async function searchForSeries(series) {
  if (series && series.length > 0) {
    const req = new GraphQLRequest(
      GRAPHQL_QUERIES.LOOKUP_ANIME_BY_NAME,
      { search: series, page: 1, perPage: 20 });
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

  const seriesInLower = series.toLowerCase();
  // const cache = new Map();
  const candidates = [];

  // let us find this guy
  results.forEach(result => {
    if (result && result.title && result.title.romaji) {
      candidates.push(result.title.romaji.toLowerCase());
      // cache.set(result.title.romaji, results.id);
    }
    else {
      candidates.push('');
    }

    if (result && result.title && result.title.english) {
      candidates.push(result.title.english.toLowerCase());
      // cache.set(result.title.english, results.id);
    }
    else {
      candidates.push('');
    }
  });

  const { bestMatch, bestMatchIndex } = stringSimilarity.findBestMatch(seriesInLower, candidates);
  
  // check if it's good enough
  if (bestMatch.rating > 0.7) {
    const found = results[Math.floor(bestMatchIndex/2)];
    return found.id;
  }
}

async function makeAniListRequest(graphQLRequest) {
  // wait for rate limiter
  await throttle();
  try {
    return await axios.post(aniListGraphQLEndpoint, graphQLRequest);
  }
  catch(e) {
    logger.error(e);
    return null;
  }
}

function throttle() {
  return new Promise((res, rej) => {
    limiter.removeTokens(1, function(err, remainingRequests) {
      if (err) {
        rej(err);
      }
      else {
        res(remainingRequests);
      }
    });
  });
}

module.exports = {
  searchForSeries,
  getAniListData,
  smartSearch
};

const GRAPHQL_QUERIES = {
  QUERY_ANIME_BY_ID: 
`query ($id: Int) {
  Media(id: $id, type: ANIME) {
    id
    season
    seasonYear
    episodes
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
      title {
        romaji
        english
      }
    }
  }
}
`
};