import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Avatar from './Avatar'

const MAX_COUNT = 5;

export default function Account({ session }) {
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState(null)
  const [website, setWebsite] = useState(null)
  const [avatar_url, setAvatarUrl] = useState(null)

	const [uploadedFiles, setUploadedFiles] = useState([])
  const [fileLimit, setFileLimit] = useState(false);


  const handleUploadFiles = files => {
      const uploaded = [...uploadedFiles];
      let limitExceeded = false;
      files.some((file) => {
            if (uploaded.findIndex((f) => f.name === file.name) === -1) {
                uploaded.push(file);
                if (uploaded.length === MAX_COUNT) setFileLimit(true);
                if (uploaded.length > MAX_COUNT) {
                    alert(`You can only add a maximum of ${MAX_COUNT} files`);
                    setFileLimit(false);
                    limitExceeded = true;
                    return true;
                }
            }
        })
        if (!limitExceeded) setUploadedFiles(uploaded)

    }

    const handleFileEvent =  (e) => {
        const chosenFiles = Array.prototype.slice.call(e.target.files)
        handleUploadFiles(chosenFiles);
    }

  useEffect(() => {
    async function getProfile() {
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

  async function updateProfile({ username, website, avatar_url }) {
    try {
      setLoading(true)
      const { user } = session

      const updates = {
        id: user.id,
        username,
        website,
        avatar_url,
        updated_at: new Date(),
      }

      let { error } = await supabase.from('profiles').upsert(updates)

      if (error) {
        throw error
      }
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-widget">
      <Avatar
        url={avatar_url}
        size={150}
        onUpload={(url) => {
          setAvatarUrl(url)
          updateProfile({ username, website, avatar_url: url })
        }}
      />
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="text" value={session.user.email} disabled />
      </div>
      <div>
        <label htmlFor="username">Name</label>
        <input
          id="username"
          type="text"
          value={username || ''}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="website">TYPE YOUR NOTES BELOW</label>
        <input
          id="website"
          type="website"
          value={website || ''}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <div>
        <button
          className="button block primary"
          onClick={() => updateProfile({ username, website, avatar_url })}
          disabled={loading}
        >
          {loading ? 'Loading ...' : 'Update'}
        </button>
      </div>

      <div>
        <button className="button block" onClick={() => supabase.auth.signOut()}>
          Sign Out
        </button>
      </div>

		<div>

			<input id='fileUpload' type='file' multiple
					accept='application/pdf, image/png'
                    onChange={handleFileEvent}
                    disabled={fileLimit}
			/>

			<label htmlFor='fileUpload'>
				<a  className={`btn btn-primary ${!fileLimit ? '' : 'disabled' } `}>Upload Files</a>
			</label>

			<div className="uploaded-files-list">
				{uploadedFiles.map(file => (
                    <div >
                        {file.name}
                    </div>
                ))}
			</div>

		</div>



    </div>
  )
}
