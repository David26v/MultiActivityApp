'use client'
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import supabase from "./utils/supabaseClient";
import Register from "./component/Register";
import Login from "./component/Login";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSignOutAlt ,faTrash, faCircleInfo} from '@fortawesome/free-solid-svg-icons'; 
import Navigation from "./component/Navigation";
import ProfileModal from "./component/ProfileModal";

// Component for logged-in users
const LoggedInUI = ({ user, handleLogout, handleDeleteAccount }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); 

  const handleConfirmDelete = () => {
    handleDeleteAccount();
    setIsDeleteConfirmOpen(false); 
  };

  const handleCancelDelete = () => {
    setIsDeleteConfirmOpen(false); 
  };

  const profileSettingsOn =()=>{
    setIsProfileOpen(true);
    setIsSettingsOpen(false);
  }


  const handDeleteProfile = () => {
    setIsDeleteConfirmOpen(true);  
    setIsSettingsOpen(false);      
  };




  return (
    <div>
      <div className="flex justify-between items-center mb-6 text-center">
        <p className="text-xl font-semibold text-black pr-10">Welcome!</p>

        {/* Settings Button */}
        <div className="flex justify-end w-full space-x-2">
          <button
            onClick={() => setIsSettingsOpen(true)}  // Open settings modal
            className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
          >
            Settings
          </button>
          <button>
            <FontAwesomeIcon icon={faCircleInfo} className="bg-color-blue" /> 
          </button>
        </div>
      </div>

      <Navigation />

      {/* Profile Modal */}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

      {/* Delete Account Confirmation Modal */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <p className="text-lg text-black">Are you sure you want to delete your account?</p>
            <div className="flex justify-end mt-4 space-x-4">
              <button
                onClick={handleCancelDelete}
                className="bg-gray-500 text-white p-2 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold text-black">Settings</h2>
            <div className="space-y-4 mt-4">
              <button
                onClick={profileSettingsOn}
                className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 w-full"
              >
                <FontAwesomeIcon icon={faUser} className="mr-2" /> Profile Settings
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 w-full"
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" /> Logout
              </button>
              <button
                onClick={handDeleteProfile}
                className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 w-full"
              >
                <FontAwesomeIcon icon={faTrash} className="mr-2" /> Delete Account
              </button>
            </div>
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="mt-4 text-center text-blue-500 hover:underline"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Component for logged-out users
const LoggedOutUI = ({ isRegistering, setIsRegistering, error, setUser, setError, setLoading }) => (
  <div>
    {isRegistering ? (
      <Register setUser={setUser} setError={setError} setLoading={setLoading} />
    ) : (
      <Login setUser={setUser} setError={setError} setLoading={setLoading} />
    )}
    {error && <p className="text-red-500 mb-4">{error}</p>}
    <div className="text-center mt-4">
      <p className="text-sm text-gray-500">
        {isRegistering ? "Already have an account?" : "Don't have an account?"}
      </p>
      <button
        onClick={() => setIsRegistering(!isRegistering)}
        className="text-blue-500 hover:underline"
      >
        {isRegistering ? "Login" : "Register"}
      </button>
    </div>
  </div>
);

const HomePage = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  const checkUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      setError("Error getting user: " + error.message);
    } else {
      setUser(data);
      setIsLoggedIn(true);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsLoggedIn(false);
    router.push("/");
  };


  const handleDeleteAccount = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
  
    if (error) {
      console.error('Error fetching user:', error.message);
      return;
    }
  
    if (user) {
      const { error: deleteError } = await supabase.auth.api.deleteUser(user.id);
  
      if (deleteError) {
        console.error('Error deleting account:', deleteError.message);
      } else {
        console.log('Account successfully deleted');
      }
    } else {
      console.error('User not found');
    }
  };
  

  

  useEffect(() => {
    checkUser();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
      <h1 className="text-2xl font-bold text-black mb-4 text-center pb-10">
        Welcome to Multi Activities App, Enjoy
      </h1>
      <div className="flex max-w-4xl w-full p-6 bg-white rounded-lg shadow-md">
        {/* Left side - Image with animation */}
        <div className={`transition-all duration-500 ${isLoggedIn ? "w-0 opacity-0" : "w-1/2 opacity-100"}`}>
          <img
            src="/bg-main-3.jpg"
            alt="Descriptive image"
            className="w-full h-full object-cover rounded-l-lg"
          />
          <h3 className="text-center text-black pb-3">
            Multi Activities Design By David Fajardo
          </h3>
        </div>
    
        {/* Right side - Form */}
        <div className={`w-full sm:w-1/2 p-6 transition-all duration-500 ${isLoggedIn ? "ml-0" : "ml-10"}`}>
          {user ? (
            <LoggedInUI 
              user={user} 
              handleDeleteAccount={handleDeleteAccount}
              handleLogout={handleLogout} />
          ) : (
            <LoggedOutUI
              isRegistering={isRegistering}
              setIsRegistering={setIsRegistering}
              error={error}
              setUser={setUser}
              setError={setError}
              setLoading={setLoading}  
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
