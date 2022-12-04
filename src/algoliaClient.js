import algoliasearch from 'algoliasearch/lite';

const algoliaAppId = process.env.REACT_APP_ALGOLIA_APP_ID
const algoliaSearchOnlyAPIKey = process.env.REACT_APP_ALGOLIA_API_KEY

export const searchClient = algoliasearch(algoliaAppId, algoliaSearchOnlyAPIKey)