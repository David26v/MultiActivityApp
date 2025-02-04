"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import supabase from "./utils/supabaseClient";
import Register from "./component/Register";
import Login from "./component/Login";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons'; 
import Navigation from "./component/Navigation";
import ProfileModal from "./component/ProfileModal";

// Component for logged-in users
const LoggedInUI = ({ user, handleLogout }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-6 text-center">
        <p className="text-xl font-semibold text-black">Welcome, {user.email}</p>
        <div className="flex space-x-4">
          <button
            onClick={() => setIsProfileOpen(true)}
            className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
          >
            <FontAwesomeIcon icon={faUser} className="mr-2" /> Profile Settings
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600"
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" /> Logout
          </button>
        </div>
      </div>
      <Navigation />

      {/* Profile Modal */}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
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

  useEffect(() => {
    checkUser();
  }, []);

  return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
        
        <h1 className="text-2xl font-bold text-black mb-4 text-center pb-10">
          Welcome to Multi Activities App, Enjoy
        </h1>
    
        <div className="flex max-w-4xl w-full p-6 bg-white rounded-lg shadow-md">
          {/* Left side - Image with animation */}
          <div className={`transition-all duration-500 ${isLoggedIn ? "w-0 opacity-0" : "w-1/2 opacity-100"}`}>
            <img
              src="/bg.wallpaper.jpg"
              alt="Descriptive image"
              className="w-full h-full object-cover rounded-l-lg"
            />
          </div>
    
          {/* Right side - Form */}
          <div className={`w-full sm:w-1/2 p-6 transition-all duration-500 ${isLoggedIn ? "ml-0" : "ml-10"}`}>
            {user ? (
              <LoggedInUI user={user} handleLogout={handleLogout} />
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
