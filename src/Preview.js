import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Avatar from './Avatar'

export default function Preview() {

  return (
    <div className="form-widget">
      <div>
        <label htmlFor="Title">Title</label>
        <input
          id="title"
          type="text"
          value={'title' ||''}
          disabled={true}
        />
      </div>
      <div>
        <label htmlFor="content">TYPE YOUR NOTES BELOW</label>
        <input
          id="content"
          type="text"
          value={'content' || ''}
          style={{height: '800px'}}
        />
      </div>
    </div>
  )
}
