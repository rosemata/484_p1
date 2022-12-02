import { useState } from 'react'
import { supabase } from './supabaseClient'
import { searchClient } from './algoliaClient'
import { InstantSearch, SearchBox, Hits, Highlight, useInstantSearch } from 'react-instantsearch-hooks-web';

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')

  const handleLogin = async (email) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithOtp({ email })
      if (error) throw error
      alert('Check your email for the login link!')
    } catch (error) {
      alert(error.error_description || error.message)
    } finally {
      setLoading(false)
    }
  }

  
  function Hit({ hit }) {
    return (
      <article>
        <h1>
          <Highlight attribute="Notes" hit={hit} />
        </h1>
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
    <InstantSearch searchClient={searchClient} indexName="test_pipedream">
    <div className="row flex flex-center">
      <div className="col-6 form-widget">
        <h1 className="header">Share Class Notes</h1>
        <p className="description">Sign in to upload your own notes!</p>
        <div>
          <input
            className="inputField"
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <button
            onClick={(e) => {
              e.preventDefault()
              handleLogin(email)
            }}
            className={'button block'}
            disabled={loading}
          >
            {loading ? <span>Loading</span> : <span>Send magic link</span>}
          </button>
        </div>
      </div>
    </div>
      <SearchBox placeholder="Search" />
      <EmptyQueryBoundary fallback={null}>
        <Hits hitComponent={Hit} />
      </EmptyQueryBoundary>
    </InstantSearch>
  )
}
