import { searchClient } from './algoliaClient'
import { InstantSearch, SearchBox, Hits, Highlight, useInstantSearch } from 'react-instantsearch-hooks-web';
import { createSearchParams, useNavigate } from 'react-router-dom'

export default function Search() {
    const navigate = useNavigate();

    function redirect(id) {
        navigate({
            pathname: '/preview',
            search: createSearchParams({
                note_id: id,
            }).toString()
        })
    }

    function Hit({ hit }) {
        return (
        <article>
            <button onClick={() => redirect(hit.objectID)}>
                <h1>
                    <Highlight attribute="content" hit={hit} />
                </h1>
                <img src={hit.image} align="left" />
            </button>
        </article>
        );
    }

    function EmptyQueryBoundary({ children, fallback }) {
        const { indexUiState } = useInstantSearch();
    
        if (!indexUiState.query) {
        return fallback;
        }
    
        return children;
    }

    return (
        <div>
        <InstantSearch searchClient={searchClient} indexName="Sharenote">
        <SearchBox placeholder="Search" />
        <Hits hitComponent={Hit} />
        {/* <EmptyQueryBoundary fallback={null}>
            <Hits hitComponent={Hit} />
        </EmptyQueryBoundary> */}
        </InstantSearch>
        </div>
    )
}
