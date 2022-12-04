import { useState, useEffect } from 'react'
import { createSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'

export default function List({ session }) {
    const [userId, setUserId] = useState(null)
    const [notes, setNotes] = useState([])
    const navigate = useNavigate();

    useEffect(() => {
        supabase
        .channel('public:notes')
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'notes' }, (payload) => {
            console.log("Note Deleted", payload)
            getAllNotes();
        })
        .subscribe();
    }, [])

    useEffect(() => {
        const { user } = session
        setUserId(user.id)
    }, [session])

    useEffect(() => {
        if(userId != null) {
            getAllNotes()
        }
    }, [userId])
    
    async function getAllNotes() {
        try{
            const { data, error } = await supabase
            .from('notes')
            .select()
            .eq('user_id', userId)

            const newNotes = []
            if(error) {
                throw error
            } 
            if(data.length != 0) {
                data.map((note) => {
                    newNotes.push({
                        id: note.id,
                        title: note.title,
                        //tags: note.tags,
                        created_at: note.created_at,
                    })
                })
            }
            setNotes(newNotes)
        } catch(error) {
            console.warn(error.message)
        }
    }

    async function deleteNote(index, id) {
        try{
            const newNotes = [...notes]
            const { data, error } = await supabase
            .from('notes')
            .delete()
            .eq('id', id)

            if(error) {
                throw error
            }
            newNotes.splice(index, 1)
            setNotes(newNotes)
        } catch(error) {
            console.warn(error.message)
        }
    }

    function redirect(path, id) {
        navigate({
            pathname: `/${path}`,
            search: createSearchParams({
                note_id: id,
            }).toString()
        })
    }

    function Note({ note, index }) {
        const dateUploaded = new Date(note.created_at)

        return (
          <tr>
            <td>{note.title}</td>
            <td>{dateUploaded.toLocaleDateString()}</td>
            {/* <td>{note.tags}</td> */}
            <td><button onClick={() => redirect("preview", note.id)}>View</button></td>
            <td><button onClick={() => redirect("update", note.id)}>Update</button></td>
            <td><button onClick={() => deleteNote(index, note.id)}>
                <i class="fa-solid fa-trash-can" /> Delete
            </button></td>
          </tr>
        );
    }

    return (
        <div>
            <p style={{ fontSize: 'x-large'}}><b>Your Notes</b></p>
            <div className="list-container">
                <table className="table table-striped" style={{ width: '100%' }}>
                    <thead>
                        <tr>
                            <th scope="col">Title</th>
                            <th scope="col">Uploaded On</th>
                            {/* <th scope="col">Tags</th> */}
                            <th scope="col"></th>
                            <th scope="col"></th>
                            <th scope="col"></th>
                        </tr>
                    </thead>
                    <tbody id="main-table-body">
                        {notes.map((note, index) => (
                            <Note key={index} index={index} note={note} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

