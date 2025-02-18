'use client'

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import supabase from '../utils/supabaseClient';
import { useRouter } from 'next/navigation';

const GoogleDrive = () => {
  const [photos, setPhotos] = useState([]);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [sortByDate, setSortByDate] = useState('desc');

  const router = useRouter();

  const checkUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error("Error getting user: " + error.message);
    } else {
      setUser(data.user);
    }
  };

  useEffect(() => {
    checkUser();
  }, []);


  useEffect(() => {
    if (user) {
      fetchPhotos(user.id);
    }

  }, [user, sortOrder, searchTerm, sortByDate]);

  const fetchPhotos = async (userId) => {
    setLoading(true);

    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .ilike('name', `%${searchTerm}%`)
      .eq('user_id', userId)
      .order('name', { ascending: sortOrder === 'asc' })
      .order('upload_date', { ascending: sortByDate === 'asc' });

    if (error) {
      console.error(error);
    } else {
      setPhotos(data);
    }
    setLoading(false);
  };


  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSortChange = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleDelete = async (id) => {
    const { error } = await supabase
      .from('photos')
      .delete()
      .match({ id });

    if (error) {
      console.error(error);
    } else {
      setPhotos(photos.filter((photo) => photo.id !== id));
    }
  };

  const handleUploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const uniqueFileName = `${Date.now()}-${file.name}`;
      const filePath = `uploads/${uniqueFileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, file);

      if (uploadError) {
        console.error("Error uploading file:", uploadError.message || uploadError);
        return;
      }

      const { data: urlData, error: urlError } = await supabase.storage
        .from('photos')
        .getPublicUrl(data.path);

      if (urlError) {
        console.error("Error getting public URL:", urlError.message || urlError);
        return;
      }

      setImageUrl(urlData.publicUrl);

      const { error: insertError } = await supabase
        .from('photos')
        .insert([{
          name: file.name,
          image_url: urlData.publicUrl,
          description: '',
          user_id: user.id
        }]);

      if (insertError) {
        console.error("Error inserting photo data:", insertError.message || insertError);
        return;
      }

      fetchPhotos(user.id);
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  const handleDateSortToggle = () => {
    setSortByDate(sortByDate === 'asc' ? 'desc' : 'asc');
  };


  return (
    <div className="min-h-screen bg-white text-black p-6">
      <button
        onClick={() => router.push('/')}
        className="mb-4 px-4 py-2 bg-gray-800 text-white rounded-lg"
      >
        Back to Homepage
      </button>
      <h1 className="text-3xl font-semibold mb-4">Photo Management</h1>

      {/* Search Bar */}
      <div className="mb-4 flex items-center space-x-4">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search by photo name"
          className="border px-4 py-2 rounded-lg w-full sm:w-1/3"
        />
        <button
          onClick={handleSortChange}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Sort by Name
        </button>
        <button
          onClick={handleDateSortToggle}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md"
        >
          Sort by Date
        </button>
      </div>

      {/* Photo Upload */}
      <div className="mb-4">
        <input
          type="file"
          onChange={handleUploadPhoto}
          className="border px-4 py-2 rounded-lg w-full sm:w-1/3"
        />
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center items-center my-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
        </div>
      )}

      {/* Display Photos with Animation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <AnimatePresence>
          {photos?.map((photo) => (
            <motion.div
              key={photo.id}
              className="bg-white shadow-md rounded-lg overflow-hidden"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
            >
              <motion.img
                src={photo.image_url}
                alt={photo.name}
                className="w-full h-48 object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
              />
              <div className="p-4">
                <h2 className="text-xl font-medium">{photo.name}</h2>
                <p className="text-gray-500 text-sm">{new Date(photo.upload_date).toLocaleString()}</p>
                <div className="mt-4 flex justify-between">
                  <button
                    onClick={() => handleDelete(photo.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GoogleDrive;
