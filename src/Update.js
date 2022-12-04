import { useState, useEffect } from 'react'
import { useSearchParams } from "react-router-dom"
import { supabase } from './supabaseClient'
import Tesseract from 'tesseract.js';

export default function Update({ session }) {
    const [loading, setLoading] = useState(false)
    const [note, setNote] = useState(null)
    const [title, setTitle] = useState(null)
    const [content, setContent] = useState(null)
    const [image_url, setImageUrl] = useState(null)
    const [progress, setProgress] = useState(0);
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
            setImageUrl(data[0].original_file)
        } catch (error) {
            console.warn(error.message)
        } finally {
            setLoading(false)
        }
    }

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

    async function updateNote({ note, title, content, image_url }) {
        try {
            setLoading(true)

            let { error } = await supabase
            .from('notes')
            .update({
                title: title,
                content: content,
                original_file: image_url,
                updated_at: new Date(),
            })
            .eq('id', note.id)

            if (error) {
                throw error
            }
            alert("Note updated!")
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
            onClick={() => updateNote({ note, title, content, image_url })}
            disabled={loading}
            >
            {loading ? 'Loading ...' : 'Update note!'}
            </button>
        </div>
        </div>
    )
}
