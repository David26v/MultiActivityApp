'use client'
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import supabase from '../utils/supabaseClient';
import { useRouter } from 'next/navigation';


const PokemonReviewApp = () => {
  const [pokemons, setPokemons] = useState([]);
  const [reviews, setReviews] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortByDate, setSortByDate] = useState('desc');
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [editReview, setEditReview] = useState(null); 
  const [editedReviewText, setEditedReviewText] = useState(''); 
  const [reviewText, setReviewText] = useState(''); 

  const router = useRouter();


  // Fetch Pokémon and reviews
  useEffect(() => {
    fetchPokemons();
  }, [searchTerm, sortOrder, sortByDate]);

  const fetchPokemons = async () => {
    const { data, error } = await supabase
      .from('pokemons')
      .select('*')
      .ilike('name', `%${searchTerm}%`)
      .order('name', { ascending: sortOrder === 'asc' })
      .order('upload_date', { ascending: sortByDate === 'asc' });

    if (error) {
      console.error(error);
    } else {
      setPokemons(data);
      fetchReviews(data);
    }
  };

  const fetchReviews = async (pokemons) => {
    const { data, error } = await supabase.from('reviews_pokemon').select('*');

    if (error) {
      console.error(error);
    } else {
      const groupedReviews = {};
      pokemons.forEach((pokemon) => {
        groupedReviews[pokemon.id] = data.filter(
          (review) => review.pokemon_id === pokemon.id
        );
      });
      setReviews(groupedReviews);
    }
  };

  // Handle file upload (for Pokémon photo)
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const uniqueFileName = `${Date.now()}-${file.name}`;
      const filePath = `uploads/${uniqueFileName}`;

      const { data, error } = await supabase.storage
        .from('pokemons')
        .upload(filePath, file);

      if (error) {
        console.error(error);
        return;
      }

      const { data: urlData } = await supabase.storage
        .from('pokemons')
        .getPublicUrl(data.path);

      setImageUrl(urlData.publicUrl);
      await supabase.from('pokemons').insert([
        { name: file.name, image_url: urlData.publicUrl },
      ]);
      fetchPokemons();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddReview = async (pokemonId) => {
    if (!reviewText) return;

    try {
      await supabase.from('reviews_pokemon').insert([
        { pokemon_id: pokemonId, review: reviewText },
      ]);
      setReviewText('');
      fetchReviews(pokemons);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditReview = async (reviewId) => {
    if (!editedReviewText) return;

    try {
      await supabase
        .from('reviews_pokemon')
        .update({ review: editedReviewText })
        .eq('id', reviewId);
      setEditedReviewText('');
      setEditReview(null);
      fetchReviews(pokemons);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await supabase.from('reviews_pokemon').delete().eq('id', reviewId);
      fetchReviews(pokemons);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectPokemon = (pokemon) => {
    setSelectedPokemon(pokemon);
    setReviewText(''); 
  };

  const handleSortToggle = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleDateSortToggle = () => {
    setSortByDate(sortByDate === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="min-h-screen text-black p-6" 
        style={{
          backgroundImage: 'url(./pokemon_bg.png)',
          backgroundSize: 'cover',  
          backgroundPosition: 'center', 
          backgroundRepeat: 'no-repeat', 
      }}
>
    <button 
        onClick={() => router.push('/')} 
        className="mb-4 px-4 py-2 bg-gray-800 text-white rounded-lg"
    >
        Back to Homepage
    </button>
      <h1 className="text-4xl font-semibold mb-6 text-center text-white">Pokemon Review App</h1>

      {/* Search and Sort */}
      <div className="mb-4 flex items-center justify-center space-x-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by Pokemon name"
          className="border px-4 py-2 rounded-lg w-full sm:w-1/3 shadow-md"
        />
        <button
          onClick={handleSortToggle}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-md"
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

      {/* Upload Pokemon Photo */}
      <div className="mb-6 w-full">
        <input
          type="file"
          onChange={handleFileUpload}
          className="border px-4 py-2 rounded-lg w-full sm:w-1/3 shadow-md"
        />
      </div>

      {/* Pokémon List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {pokemons?.map((pokemon) => (
          <motion.div
            key={pokemon.id}
            className="bg-white shadow-lg rounded-lg overflow-hidden transition-transform transform hover:scale-105 cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => handleSelectPokemon(pokemon)}
          >
            <img
              src={pokemon.image_url}
              alt={pokemon.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold">{pokemon.name}</h2>
              <p className="text-gray-500 text-sm">
                {new Date(pokemon.upload_date).toLocaleString()}
              </p>

              {/* Reviews Section */}
              <div className="mt-4">
                {selectedPokemon?.id === pokemon.id && (
                  <>
                    <input
                      type="text"
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Write a review..."
                      className="border px-4 py-2 rounded-lg w-full shadow-md"
                    />
                    <button
                      onClick={() => handleAddReview(pokemon.id)}
                      className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg shadow-md"
                    >
                      Add Review
                    </button>
                  </>
                )}
              </div>

              {/* Display Reviews */}
              <div className="mt-4">
                <h3 className="text-lg font-semibold">Reviews:</h3>
                {reviews[pokemon.id]?.map((review) => (
                  <div key={review.id} className="text-gray-600 mt-2">
                    {editReview && editReview.id === review.id ? (
                      <div>
                        <input
                          type="text"
                          value={editedReviewText}
                          onChange={(e) => setEditedReviewText(e.target.value)}
                          className="border px-4 py-2 rounded-lg w-full shadow-md"
                        />
                        <button
                          onClick={() => handleEditReview(review.id)}
                          className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded-lg shadow-md"
                        >
                          Save Changes
                        </button>
                        <button
                            onClick={() => {
                            setEditReview(null);
                            setEditedReviewText('');
                            }}
                            className="mt-2 px-4 py-2 bg-gray-500 text-white rounded-lg shadow-md ml-2"
                        >
                            Cancel
                         </button>
                      </div>
                    ) : (
                      <div>
                        <p>{review.review}</p>
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="text-red-500 text-sm  cursor-pointer"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => {
                            setEditReview(review); 
                            setEditedReviewText(review.review); 
                          }}
                          className="text-blue-500 text-sm ml-2  cursor-pointer"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PokemonReviewApp;
