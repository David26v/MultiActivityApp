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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    setLoading(true);
    try {
      const { user, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      setUser(user);
      setError(null); // Clear any previous error
      localStorage.setItem("registeredEmail", email);
      window.location.reload();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4 text-black text-center pb-9">Sign Up</h1>

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 mb-4"
      />

      <div className="relative flex justify-center">
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-4 pr-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 mb-4"
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

      <button
        onClick={handleRegister}
        className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
      >
        Create account
      </button>
    </div>
  );
};

const Login = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

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

      {/* LoginForm Component */}
      <LoginForm setUser={setUser} setError={setError} setLoading={setLoading} />
    </div>
  );
};

export default Login;
