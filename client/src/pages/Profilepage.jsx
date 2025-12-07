import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import assets from '../assets/assets'
import { Authcontext } from '../../context/Authcontext'

const Profilepage = () => {
  const { authUser, updateProfile, setAuthUser } = useContext(Authcontext)

  const [selectedImage, setSelectedImage] = useState(null)
  const [name, setName] = useState(authUser?.fullname || '')
  const [bio, setBio] = useState(authUser?.bio || '')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Case 1: user does NOT upload an image
      if (!selectedImage) {
        const updatedUser = await updateProfile({
          fullname: name,
          bio: bio,
        })
        
        // Update context with new data
        if (updatedUser && setAuthUser) {
          setAuthUser(updatedUser)
        }
        
        setLoading(false)
        navigate('/')
        return
      }

      // Case 2: Image selected → convert to base64
      const reader = new FileReader()
      reader.readAsDataURL(selectedImage)

      reader.onload = async () => {
        try {
          const base64Image = reader.result

          const updatedUser = await updateProfile({
            fullname: name,
            bio: bio,
            profilePic: base64Image,
          })

          // Update context with new data including the new profile pic
          if (updatedUser && setAuthUser) {
            setAuthUser(updatedUser)
          }

          setLoading(false)
          navigate('/')
        } catch (error) {
          console.error('Error in onload:', error)
          setLoading(false)
        }
      }

      reader.onerror = () => {
        console.error('Error reading file')
        setLoading(false)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      setLoading(false)
    }
  }

  // Get the current profile picture to display
  const getCurrentProfilePic = () => {
    if (selectedImage) {
      return URL.createObjectURL(selectedImage)
    }
    return authUser?.profilePic || assets.avatar_icon
  }

  return (
    <div className='min-h-screen bg-cover bg-no-repeat flex items-center justify-center p-4'>
      <div className='w-full max-w-3xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex max-sm:flex-col-reverse rounded-lg overflow-hidden'>

        {/* LEFT Side Form */}
        <form
          className='flex flex-col gap-5 p-10 flex-1'
          onSubmit={handleSubmit}
        >
          <h3 className='text-2xl font-semibold text-white'>Profile Details</h3>

          {/* Upload Image */}
          <label htmlFor='avatar' className='flex items-center gap-3 cursor-pointer hover:opacity-80 transition'>
            <input
              type='file'
              id='avatar'
              accept='image/png, image/jpg, image/jpeg, image/webp'
              hidden
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setSelectedImage(e.target.files[0])
                }
              }}
            />

            <img
              src={getCurrentProfilePic()}
              alt='Profile Picture'
              className='w-24 h-24 rounded-full object-cover border-2 border-purple-400'
            />

            <div className='flex flex-col'>
              <span className='text-white font-medium'>Upload profile image</span>
              <span className='text-sm text-gray-400'>PNG, JPG or JPEG</span>
            </div>
          </label>

          {/* Name Input */}
          <div className='flex flex-col gap-2'>
            <label className='text-sm text-gray-400'>Full Name</label>
            <input
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='Enter your name'
              className='p-3 border border-gray-600 rounded-lg text-white bg-gray-800/50 w-full focus:outline-none focus:border-purple-400 transition'
              required
            />
          </div>

          {/* Bio Input */}
          <div className='flex flex-col gap-2'>
            <label className='text-sm text-gray-400'>Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder='Write something about yourself...'
              className='p-3 border border-gray-600 rounded-lg text-white bg-gray-800/50 w-full focus:outline-none focus:border-purple-400 transition resize-none'
              rows={4}
            />
          </div>

          {/* Buttons */}
          <div className='flex gap-3 mt-2'>
            <button
              type='submit'
              disabled={loading}
              className='flex-1 bg-gradient-to-r from-purple-400 to-violet-600 text-white p-3 rounded-full text-lg font-medium cursor-pointer hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type='button'
              onClick={() => navigate('/')}
              className='px-6 bg-gray-700 text-white p-3 rounded-full text-lg font-medium cursor-pointer hover:bg-gray-600 transition'
            >
              Cancel
            </button>
          </div>
        </form>

        {/* RIGHT Side Image Preview */}
        <div className='flex flex-col items-center justify-center gap-4 p-10 border-l-2 border-gray-600 max-sm:border-l-0 max-sm:border-b-2 bg-gray-900/30'>
          <h4 className='text-lg font-semibold text-white'>Preview</h4>
          <img
            src={getCurrentProfilePic()}
            alt='Profile Preview'
            className='w-44 h-44 aspect-square rounded-full object-cover border-4 border-purple-400 shadow-lg'
          />
          <p className='text-center text-gray-400 text-sm'>
            {name || 'Your name'}
          </p>
          {bio && (
            <p className='text-center text-gray-500 text-xs max-w-[200px]'>
              {bio}
            </p>
          )}
        </div>

      </div>
    </div>
  )
}

export default Profilepage