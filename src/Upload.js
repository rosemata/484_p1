import { useEffect, useState } from 'react'
import { createSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import Tesseract from 'tesseract.js';

export default function Upload({ session }) {
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState(null)
    const [content, setContent] = useState(null)
    const [image_url, setImageUrl] = useState(null)
    const [note_id, setNoteId] = useState(null)
    const [progress, setProgress] = useState(0);
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

    function handleSubmit(image) {
        setLoading(true);
        Tesseract.recognize(image, 'eng', {
            logger: (m) => {
                if (m.status === 'recognizing text') {
                    setProgress(parseInt(m.progress * 100));
                }
            }
        })
        .catch((error) => {
            console.warn(error)
            alert("File type not supported")
        })
        .then(({ data: {text} }) => {
            console.log(text)
            setImageUrl(image)
            setContent(text)
            setLoading(false)
        });
    }

    async function uploadNote({ title, content, image_url }) {
        try {
            setLoading(true)
            const { user } = session

            const note = {
                user_id: user.id,
                title: title,
                content: content,
                original_file: image_url,
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
            alert("Title cannot be empty")
            console.warn(error.message)
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
        <label htmlFor="file">File</label>
        <input
            id="file"
            type="file"
            onChange={(e) =>
                handleSubmit(URL.createObjectURL(e.target.files[0]))
            }
        />
        <progress value={progress} max="100" style={{ width: '100%' }}></progress>
        {progress != 0 && <span>{progress}%</span> }
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
            onClick={() => uploadNote({ title, content, image_url })}
            disabled={loading}
            >
            {loading ? 'Loading ...' : 'Add note!'}
            </button>
        </div>
        </div>
    )
}
