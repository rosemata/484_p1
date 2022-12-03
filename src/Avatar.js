import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

export default function Avatar({ url, size, onUpload }) {
  const [avatarUrl, setAvatarUrl] = useState([])
  const [uploading, setUploading] = useState(false)

  const handleUploadFiles = files => {
      const uploaded = [...avatarUrl];
      let limitExceeded = false;
      files.some((file) => {
          if (uploaded.findIndex((f) => f.name === file.name) === -1) {
              uploaded.push(file);
              if (uploaded.length === MAX_COUNT) setUploading(true);
              if (uploaded.length > MAX_COUNT) {
                  alert(`You can only add a maximum of ${MAX_COUNT} files`);
                  setUploading(false);
                  limitExceeded = true;
                  return true;
              }
          }
      })
      if (!limitExceeded) setAvatarUrl(uploaded)

  }

  const handleFileEvent =  (e) => {
      const chosenFiles = Array.prototype.slice.call(e.target.files)
      handleUploadFiles(chosenFiles);
  }

  

  useEffect(() => {
    if (url) downloadImage(url)
  }, [url])

  async function downloadImage(path) {
    try {
      const { data, error } = await supabase.storage.from('avatars').download(path)
      if (error) {
        throw error
      }
      const url = URL.createObjectURL(data)
      setAvatarUrl(url)
    } catch (error) {
      console.log('Error downloading image: ', error.message)
    }
  }

  async function uploadAvatar(event) {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      let { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      onUpload(filePath)
    } catch (error) {
      alert(error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="Avatar"
          className="avatar image"
          style={{ height: size, width: size }}
        />
      ) : (
        <div className="avatar no-image" style={{ height: size, width: size }} />
      )}
      <div style={{ width: size }}>
        <label className="button primary block" htmlFor="single">
          {uploading ? 'Uploading ...' : 'Upload'}
        </label>
        <input
          style={{
            visibility: 'hidden',
            position: 'absolute',
          }}
          type="file"
          id="single"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
        />
      </div>
    </div>
  )
}
