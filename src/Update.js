import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Avatar from './Avatar'

export default function Update({ session }) {
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState(null)
    const [content, setContent] = useState(null)
    const [avatar_url, setAvatarUrl] = useState(null)

    useEffect(() => {
        async function getNote() {
        try {
            setLoading(true)
            const { user } = session

            let { data, error } = await supabase
            .from('profiles')
            .select(`username, website, avatar_url`)
            .eq('id', user.id)
            .single()

            if (error) {
            throw error
            }

            setUsername(data.username)
            setWebsite(data.website)
            setAvatarUrl(data.avatar_url)
        } catch (error) {
            console.warn(error.message)
        } finally {
            setLoading(false)
        }
        }

        getProfile()
    }, [session])

    async function uploadNote({ title, content, avatar_url }) {
        try {
        setLoading(true)
        const { user } = session

        const note = {
            user_id: user.id,
            title: title,
            content,
            original_file: avatar_url,
            created_at: date,
            updated_at: new Date(),
        }

        let { error } = await supabase.from('profiles').update(note)

        if (error) {
            throw error
        }
        } catch (error) {
        alert(error.message)
        } finally {
        document.getElementById('upload-note-form').reset();
        setLoading(false)
        }
    }

    return (
        <div id="upload-note-form" className="form-widget">
        <div>
            <label htmlFor="Title">Title</label>
            <input
            id="title"
            type="text"
            value={title ||''}
            onChange={(e) => setTitle(e.target.value)}
            />
        </div>
        Upload notes here
        <Avatar
            url={avatar_url}
            size={150}
            onUpload={(url) => {
            setAvatarUrl(url)
            //   updateProfile({ username, website, avatar_url: url })
            }}
        />
        <div>
            <label htmlFor="content">TYPE YOUR NOTES BELOW</label>
            <input
            id="content"
            type="text"
            value={content || ''}
            onChange={(e) => setContent(e.target.value)}
            style={{height: '800px'}}
            />
        </div>

        <div>
            <button
            className="button block primary"
            onClick={() => uploadNote({ title, content, avatar_url })}
            disabled={loading}
            >
            {loading ? 'Loading ...' : 'Add note!'}
            </button>
        </div>
        </div>
    )
}
