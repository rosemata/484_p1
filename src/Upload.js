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
    
    const [isLoading, setIsLoading] = React.useState(false);
    const [image, setImage] = React.useState('');
    const [text, setText] = React.useState('');
    const [progress, setProgress] = React.useState(0);

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

    const handleSubmit = () => {
      setIsLoading(true);
      Tesseract.recognize(image, 'eng', {
        logger: (m) => {
          console.log(m);
          if (m.status === 'recognizing text') {
            setProgress(parseInt(m.progress * 100));
          }
        },
      })
        .catch((err) => {
          console.error(err);
        })
        .then((result) => {
          console.log(result.data);
          setText(result.data.text);
          setIsLoading(false);
        });
    };

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

        <div className="container" style={{ height: '100vh' }}>
      <div className="row h-100">
        <div className="col-md-5 mx-auto h-100 d-flex flex-column justify-content-center">
          {!isLoading && (
            <h1 className="text-center py-5 mc-5">Image To Text</h1>
          )}
          {isLoading && (
            <>
              <progress className="form-control" value={progress} max="100">
                {progress}%{' '}
              </progress>{' '}
              <p className="text-center py-0 my-0">Converting:- {progress} %</p>
            </>
          )}
          {!isLoading && !text && (
            <>
              <input
                type="file"
                onChange={(e) =>
                  setImage(URL.createObjectURL(e.target.files[0]))
                }
                className="form-control mt-5 mb-2"
              />
              <input
                type="button"
                onClick={handleSubmit}
                className="btn btn-primary mt-5"
                value="Convert"
              />
            </>
          )}
          {!isLoading && text && (
            <>
              <textarea
                className="form-control w-100 mt-5"
                rows="30"
                value={text}
                onChange={(e) => setText(e.target.value)}
              ></textarea>
            </>
          )}
        </div>
      </div>
    </div>
    
        </div>
    )
}
