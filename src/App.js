import './index.css'
import React from "react";
import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './Auth'
import Account from './Account'
import Nav from './Navbar'
import Search from './Search'
import List from './List'
import Preview from './Preview'
import Update from './Update'
import Upload from './Upload'
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

export default function Home() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  return (
    <BrowserRouter>
    <div className="container" style={{ padding: '50px 0 100px 0' }}>
      <Nav session={session} />
      <Routes>
        <Route path="/" element={!session ? <Auth /> : <List key={session.user.id} session={session}/> }/>
        <Route path="/search" element={<Search />} />
        <Route path="/preview" element={<Preview />} />
        <Route path="/account" element={!session ? <Auth /> : <Account key={session.user.id} session={session} />} />
        <Route path="/upload" element={!session ? <Auth /> : <Upload key={session.user.id} session={session} />} />
        <Route path="/update" element={!session ? <Auth /> : <Update key={session.user.id} session={session} />} />
      </Routes>
      </div>
    </BrowserRouter>
  )
}
