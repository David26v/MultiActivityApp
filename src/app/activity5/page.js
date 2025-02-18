'use client'
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus, faCheck } from '@fortawesome/free-solid-svg-icons';
import supabase from '../utils/supabaseClient';
import { useRouter } from 'next/navigation';


const MarkDownNotes = () => {
  const [notes, setNotes] = useState([]);
  const [user, setUser] = useState(null);
  const [currentNote, setCurrentNote] = useState('');
  const [editIndex, setEditIndex] = useState(null);
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


  const fetchNotes = async (userId) => {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching notes:', error);
    } else {
      setNotes(data);
    }
  };

  const createNote = async () => {
    if (currentNote.trim()) {
      const { data, error } = await supabase
        .from('notes')
        .insert([{ content: currentNote, user_id: user.id }])
        .select();

      if (error) {
        console.error('Error creating note:', error);
      } else {
        setNotes([data[0], ...notes]);
        setCurrentNote('');
      }
    }
  };

  const updateNote = async () => {
    if (currentNote.trim()) {
      const updatedNote = notes[editIndex];
      const { error } = await supabase
        .from('notes')
        .update({ content: currentNote })
        .eq('id', updatedNote.id);

      if (error) {
        console.error('Error updating note:', error);
      } else {
        const updatedNotes = [...notes];
        updatedNotes[editIndex].content = currentNote;
        setNotes(updatedNotes);
        setCurrentNote('');
        setEditIndex(null);
      }
    }
  };

  const deleteNote = async (id) => {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting note:', error);
    } else {
      setNotes(notes.filter(note => note.id !== id));
    }
  };

  const editNote = (index) => {
    setCurrentNote(notes[index].content);
    setEditIndex(index);
  };

  useEffect(() => {
    if (user) {
      fetchNotes(user.id);
    }
  }, [user]);

  return (
    <div className="w-full min-h-screen pt-20"
      style={{
        backgroundImage: 'url(./mark_down.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <button
        onClick={() => router.push('/')}
        className="mb-4 px-4 py-2 bg-gray-800 text-white rounded-lg bg-blue"
      >
        Back to Homepage
      </button>
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Markdown Notes App</h1>

        <div className="bg-gray-100 p-6 rounded-lg shadow-md mb-6">
          <textarea
            value={currentNote}
            onChange={(e) => setCurrentNote(e.target.value)}
            rows="10"
            className="w-full p-4 border border-gray-300 rounded-md shadow-sm mb-4 text-black"
            placeholder="Write your markdown here"
          />

          <div className="flex justify-center">
            {editIndex === null ? (
              <button
                onClick={createNote}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-600 transition duration-200"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" /> Create Note
              </button>
            ) : (
              <button
                onClick={updateNote}
                className="bg-green-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-green-600 transition duration-200"
              >
                <FontAwesomeIcon icon={faCheck} className="mr-2" /> Update Note
              </button>
            )}
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Notes List</h2>
        <div>
          {notes.map((note, index) => (
            <div key={note.id} className="bg-white p-6 mb-4 rounded-lg shadow-md">
              <div className="flex justify-end space-x-4 mb-4">
                <button
                  onClick={() => editNote(index)}
                  className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition duration-200"
                >
                  <FontAwesomeIcon icon={faEdit} className="mr-2" /> Edit
                </button>
                <button
                  onClick={() => deleteNote(note.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-200"
                >
                  <FontAwesomeIcon icon={faTrash} className="mr-2" /> Delete
                </button>
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mb-2">Raw Markdown:</h3>
              <pre className="bg-gray-50 p-4 rounded-md text-black">{note.content}</pre>

              <h3 className="text-lg font-semibold mt-4 mb-2 text-black">Preview:</h3>
              <div className="prose text-black">
                <ReactMarkdown>{note.content}</ReactMarkdown>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarkDownNotes;
