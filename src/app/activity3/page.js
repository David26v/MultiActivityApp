'use client'
import { useState, useEffect } from 'react';
import supabase from '../utils/supabaseClient';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const FoodReview = () => {
  const [user, setUser] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [imageUrl, setImageUrl] = useState('');
  const [reviews, setReviews] = useState({});
  const [reviewText, setReviewText] = useState({});
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
      fetchReviews(data);
    }
  };


  const fetchReviews = async (photos) => {
    const { data, error } = await supabase.from('reviews').select('*');

    if (error) {
      console.error(error);
    } else {
      const groupedReviews = {};
      photos.forEach(photo => {
        groupedReviews[photo.id] = data.filter(review => review.photo_id === photo.id);
      });
      setReviews(groupedReviews);
    }
  };

  const handleUploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const uniqueFileName = `${Date.now()}-${file.name}`;
      const filePath = `uploads/${uniqueFileName}`;

      const { data, error } = await supabase.storage
        .from('photos')
        .upload(filePath, file);

      if (error) {
        console.error(error);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('photos')
        .getPublicUrl(data.path);

      setImageUrl(urlData.publicUrl);
      await supabase.from('photos').insert([{ name: file.name, image_url: urlData.publicUrl, user_id: user.id }]);
      fetchPhotos(user.id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddReview = async (photoId) => {
    if (!reviewText[photoId]?.trim()) return;

    await supabase.from('reviews').insert([{ photo_id: photoId, review: reviewText[photoId] }]);
    setReviewText((prev) => ({ ...prev, [photoId]: '' }));
    fetchPhotos(user.id);
  };

  const handleReviewChange = (e, photoId) => {
    setReviewText((prev) => ({ ...prev, [photoId]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 text-black p-6">
      <button
        onClick={() => router.push('/')}
        className="mb-4 px-4 py-2 bg-gray-800 text-white rounded-full shadow-md"
      >
        Back to Homepage
      </button>
      <h1 className="text-4xl font-semibold mb-6 text-center">Food Review App</h1>

      <div className="mb-4 flex items-center justify-center space-x-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by food name"
          className="border px-4 py-2 rounded-lg w-full sm:w-1/3 shadow-md"
        />
        <button
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md"
        >
          Sort by Name
        </button>
        <button
          onClick={() => setSortByDate(sortByDate === 'asc' ? 'desc' : 'asc')}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md"
        >
          Sort by Upload Date
        </button>
      </div>

      <div className="mb-6 w-full">
        <input
          type="file"
          onChange={handleUploadPhoto}
          className="border px-4 py-2 rounded-lg w-full sm:w-1/3 shadow-md"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {photos?.map((photo) => (
          <motion.div
            key={photo.id}
            className="bg-white shadow-lg rounded-lg overflow-hidden transition-transform transform hover:scale-105"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <img src={photo.image_url} alt={photo.name} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h2 className="text-xl font-semibold">{photo.name}</h2>
              <p className="text-gray-500 text-sm">{new Date(photo.upload_date).toLocaleString()}</p>

              <div className="mt-4">
                <input
                  type="text"
                  value={reviewText[photo.id] || ''}
                  onChange={(e) => handleReviewChange(e, photo.id)}
                  placeholder="Write a review..."
                  className="border px-4 py-2 rounded-lg w-full shadow-md"
                />
                <button
                  onClick={() => handleAddReview(photo.id)}
                  className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg shadow-md"
                >
                  Add Review
                </button>
              </div>

              <div className="mt-4">
                <h3 className="text-lg font-semibold">Reviews:</h3>
                {reviews[photo.id]?.map((review) => (
                  <p key={review.id} className="text-gray-600 mt-2">{review.review}</p>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default FoodReview;
