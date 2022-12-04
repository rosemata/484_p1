import { useState, useEffect } from 'react'
import { useSearchParams } from "react-router-dom"
import { supabase } from './supabaseClient'
import Avatar from './Avatar'

export default function Update({ session }) {
    const [loading, setLoading] = useState(false)
    const [note, setNote] = useState(null)
    const [title, setTitle] = useState(null)
    const [content, setContent] = useState(null)
    const [avatar_url, setAvatarUrl] = useState(null)
    const [searchParams] = useSearchParams()

    useEffect(() => {
        supabase
        .channel('public:notes')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'notes' }, (payload) => {
            console.log("Note Updated", payload)
            getNote();
        })
        .subscribe();
    }, [])

    useEffect(() => {
        getNote()
    }, [session])

    async function getNote() {
        try {
            setLoading(true)
            const { data, error } = await supabase
            .from('notes')
            .select()
            .eq('id', searchParams.get('note_id'))

            if(error) {
                throw error
            }

            setNote(data[0])
            setTitle(data[0].title)
            setContent(data[0].content)
            setAvatarUrl(data[0].original_file)
        } catch (error) {
            console.warn(error.message)
        } finally {
            setLoading(false)
        }
    }

    async function updateNote({ note, title, content, avatar_url }) {
        try {
            setLoading(true)

            let { error } = await supabase
            .from('notes')
            .update({
                title: title,
                content: content,
                original_file: avatar_url,
                updated_at: new Date(),
            })
            .eq('id', note.id)

            if (error) {
                throw error
            }
            alert("Note updated!")
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
            onClick={() => updateNote({ note, title, content, avatar_url })}
            disabled={loading}
            >
            {loading ? 'Loading ...' : 'Update note!'}
            </button>
        </div>
        </div>
    )
}
