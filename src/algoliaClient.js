import algoliasearch from 'algoliasearch/lite';

const algoliaAppId = process.env.ALGOLIA_APP_ID
const algoliaSearchOnlyAPIKey = process.env.ALGOLIA_API_KEY

export const searchClient = algoliasearch(algoliaAppId, algoliaSearchOnlyAPIKey)