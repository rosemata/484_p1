import { useEffect, useState } from 'react'
import { createSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import Avatar from './Avatar'

export default function Upload({ session }) {
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState(null)
    const [content, setContent] = useState(null)
    const [avatar_url, setAvatarUrl] = useState(null)
    const [note_id, setNoteId] = useState(null)
    const navigate = useNavigate();

    useEffect(() => {
        if(note_id != null) {
            navigate({
                pathname: "/preview",
                search: createSearchParams({
                    note_id: note_id,
                }).toString()
            })
        }
    }, [note_id])

    async function uploadNote({ title, content, avatar_url }) {
        try {
            setLoading(true)
            const { user } = session

            const note = {
                user_id: user.id,
                title: title,
                content: content,
                original_file: avatar_url,
                created_at: new Date(),
                updated_at: new Date(),
            }

            let { data, error } = await supabase.from('notes').upsert(note).select()

            if (error) {
                throw error
            }
            
            alert('Note uploaded!')
            setNoteId(data[0].id)
        } catch (error) {
            alert(error.message)
        } finally {
            
            setLoading(false)
        }
    }

    return (
        <div className="form-widget">
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
            style={{height: '300px', width: '100%'}}
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
