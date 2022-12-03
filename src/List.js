import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function List({ session }) {
    const [userId, setUserId] = useState(null)
    const [notes, setNotes] = useState([]);

    useEffect(() => {
        const { user } = session

        setUserId(user.id)
        getAllNotes()

        supabase
        .channel('public:notes')
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'notes' }, (payload) => {
            console.log("Something changed", payload);
            getAllNotes();
        })
        .subscribe();
      }, [session])
    
    async function getAllNotes() {
        const { data, error } = await supabase
        .from('notes')
        .select()
        .eq('user_id', userId)

        const newNotes = [];
        if(error) {
            console.log(error);
        } else {
            if(data.length != 0) {
                data.sort((a, b) => a.id - b.id);
                data.map((note) => {
                    newNotes.push({
                        id: note.id,
                        title: note.title,
                        //tags: note.tags,
                        created_at: note.created_at,
                    })
                })
            }
        }

        setNotes(newNotes);
    };

    async function deleteNote(index, id) {
        const newNotes = [...notes];
        const { data, error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)

        if(error) {
            console.log(error);
        } else {
            newNotes.splice(index, 1);
            setNotes(newNotes);
        }
    };

    function Note({ note, index }) {
        return (
          <tr>
            <td>{note.title}</td>
            <td>{note.created_at}</td>
            {/* <td>{note.tags}</td> */}
            <td><button>View</button></td>
            <td><button>Update</button></td>
            <td><button style={{ backgroundColor:'color' }} onClick={() => deleteNote(index, note.id)}>
                <i class="fa-solid fa-trash-can"></i> Delete
            </button></td>
          </tr>
        );
    }

    return (
        <div>
            Your Notes
            <div className="list-container" >
                <table className="table table-striped">
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

