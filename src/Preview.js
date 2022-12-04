import { useState, useEffect } from 'react'
import { useSearchParams } from "react-router-dom"
import { supabase } from './supabaseClient'

export default function Preview() {
    const [searchParams] = useSearchParams()
    const [title, setTitle] = useState(null)
    const [content, setContent] = useState(null)

    useEffect(() => {
        async function getNote() {
            try {
                const { data, error } = await supabase
                .from('notes')
                .select()
                .eq('id', searchParams.get('note_id'))

                if(error) {
                    throw error
                }

                setTitle(data[0].title)
                setContent(data[0].content)
            } catch (error) {
                console.warn(error.message)
            }
        }
        getNote()
    }, [])

    return (
        <div className="form-widget">
        {title}
        <div>
            <label htmlFor="content"></label>
            <input
            id="content"
            type="text"
            value={content || ''}
            style={{height: '800px'}}
            />
        </div>
        </div>
    )
}
