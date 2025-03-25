'use client';
import { useState } from "react";
import supabase from "../utils/supabaseClient";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import Alert from "../component/alert";
import { useRouter } from "next/navigation"; // Import useRouter


const LoginForm = ({ setUser, setError, setLoading }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter(); // Create router instance
  
    const handleLogin = async () => {
      setLoading(true);
      try {
        const { user, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setUser(user);
        setError(null); 
        router.push("/");
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-6 text-center text-black">Login</h1>
  
        {/* Email Input */}
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 mb-4"
        />
  
        {/* Password Input with Toggle */}
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-3 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 mb-4"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            {showPassword ? (
              <AiFillEyeInvisible className="text-gray-500" size={20} />
            ) : (
              <AiFillEye className="text-gray-500" size={20} />
            )}
          </button>
        </div>
  
        {/* Login Button */}
        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 transition duration-300"
        >
          Login
        </button>
      </div>
    );
};

const RegisterForm = ({ setUser, setError, setLoading }) => {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState(""); 
    const [age, setAge] = useState("");
    const [company, setCompany] = useState("");
    const [birthday, setBirthday] = useState(""); 
    const [profilePicture, setProfilePicture] = useState(null); 
    const [role, setRole] = useState(""); 
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); 

    const router = useRouter();

    const handleRegister = async () => {
        setError(null);
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }
        setLoading(true);
        try {
            const { user, error } = await supabase.auth.signUp({
                email,
                password,
            });
    
            if (error) {
                setError(error.message);
                return;
            }
    
            const { data: clientData, error: clientError } = await supabase
                .from('clients')
                .upsert([
                    { name: company }
                ], { onConflict: ['name'] 
            });
    

            if (clientError) {
                setError(clientError.message);
                return;
            }
    
            const clientId = clientData[0].client_id;
    
            // Handle the profile creation with avatar and other data
            const { data, error: profileError } = await supabase
                .from('profiles')
                .insert([
                    {
                        user_id: user.id,
                        full_name: fullName,
                        avatar: profilePicture ? await handleAvatarUpload(profilePicture) : null,
                        age: age,
                        company: company,
                        role: role,
                        birthday:birthday,
                        client_id: clientId,
                        approved: role === 'user' ? false : true, 
                    }
                ]);
    
            if (profileError) {
                setError(profileError.message);
                return;
            }
    
            setUser(user);
            setError(null);
            localStorage.setItem("registeredEmail", email);
            router.push("/login"); // Navigate to login page instead of reloading
        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    
    // Helper function to upload avatar as BYTEA
    const handleAvatarUpload = async (file) => {
        if (!file || !(file instanceof Blob)) {
            setError("Invalid file type. Please upload an image.");
            return;
        }
    
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
    
            reader.onloadend = () => {
                const arrayBuffer = reader.result;
                resolve(arrayBuffer); // Resolve with the byte array
            };
    
            reader.onerror = () => {
                reject(new Error("Error reading file"));
            };
    
            // Read the file as an ArrayBuffer
            reader.readAsArrayBuffer(file);
        });
    };
    
    

    return (
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-4 sm:p-8 mx-auto mt-10 overflow-hidden">
            <h1 className="text-2xl font-semibold text-center text-black mb-6">Sign Up</h1>

            <div className="flex flex-col space-y-4">
                    {/* Full Name & Email */}
                    <div className="flex space-x-4">
                        <div className="flex-1">
                            <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Full Name"
                            className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                            />
                        </div>
                        <div className="flex-1">
                            <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                            />
                        </div>
                    </div>

                {/* Password & Confirm Password */}
                <div className="flex space-x-4">
                    <div className="relative flex-1">
                        <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full p-4 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                        />
                        <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                        {showPassword ? (
                            <AiFillEyeInvisible className="text-gray-500" size={20} />
                        ) : (
                            <AiFillEye className="text-gray-500" size={20} />
                        )}
                        </button>
                    </div>

                    <div className="relative flex-1">
                        <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm Password"
                        className="w-full p-4 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                        />
                        <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                        {showConfirmPassword ? (
                            <AiFillEyeInvisible className="text-gray-500" size={20} />
                        ) : (
                            <AiFillEye className="text-gray-500" size={20} />
                        )}
                        </button>
                    </div>
                </div>
                {/* Age & Company */}
                <div className="flex space-x-4">
                    <div className="relative flex-1">
                        <input
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="Age"
                        className="w-full p-4 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                        />
                    </div>

                    <div className="relative flex-1">
                        <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Company"
                        className="w-full p-4 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
                        />
                    </div>
                </div>

                {/* Birthday & Role */}
                <div className="flex space-x-4">
                    <input
                        type="date"
                        value={birthday}
                        onChange={(e) => setBirthday(e.target.value)}
                        className="flex-1 p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 max-w-full"
                    />
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="flex-1 p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 max-w-full"
                    >
                        <option value="">Select Role</option>
                        <option value="user">Admin</option>
                        <option value="employee">Employee</option>
                    </select>
                </div>

                {/* Profile Picture */}
                <div>
                    <label htmlFor="profilePicture" className="block text-gray-700 mb-2">
                        Upload Profile Picture
                    </label>
                    <input
                        type="file"
                        id="profilePicture"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="w-full p-4 border border-gray-300 rounded-md text-gray-700"
                    />
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleRegister}
                    className="w-full bg-blue-500 text-white p-4 rounded-md hover:bg-blue-600"
                >
                    Create Account
                </button>

                {/* Confirmation Message */}
                <div className="text-center text-gray-500 mt-4">
                    <p>A confirmation email will be sent to your email address.</p>
                </div>
            </div>
        </div>
    );
};
  
const Login = () => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [isRegistering, setIsRegistering] = useState(false); 
  
    const toggleForm = () => {
      setIsRegistering(!isRegistering); // Switch between Login and Register
    };
  
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 relative">
        {/* Alert Component placed outside of form */}
        {success || error ? (
          <Alert
            message={success || error}
            type={success ? 'success' : 'error'}
            className="absolute top-4 left-4 w-auto max-w-xs p-4 rounded-md shadow-lg"
          />
        ) : null}
  
        {/* Render either the login form or register form based on isRegistering state */}
        {isRegistering ? (
            
          <RegisterForm setUser={setUser} setError={setError} setLoading={setLoading} />
        ) : (
          <LoginForm setUser={setUser} setError={setError} setLoading={setLoading} />
        )}
  
        {/* Toggle button to switch between Login and Register */}
        <button
          onClick={toggleForm}
          className="absolute bottom-4 text-blue-500 hover:text-blue-700"
        >
          {isRegistering ? 'Already have an account? Login' : 'Don\'t have an account? Register'}
        </button>
      </div>
    );
};

export default Login;
