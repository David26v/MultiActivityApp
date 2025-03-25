import { useState, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';
import { IoMdPerson } from 'react-icons/io';
import { Menu, LogOut, User } from 'lucide-react'; 
import Sidebar from './Sidebar';
import { fetchData } from '../helper/supabaseHelper';
import supabase from '../utils/supabaseClient';

const Navbar = () => {
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); 
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);

  const togglePopover = () => {
    setPopoverVisible(!popoverVisible);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Logout error:', error.message);
      } else {
        console.log('User logged out');
      }

      // Reset user state
      setUser(null);
      setUserName('');
      window.location.href = '/login'; 
    } catch (error) {
      console.error('Error during logout:', error.message);
    }
  };

  const handleLoadData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Error fetching user:', error.message);
        return;
      }
  
      const user = data?.user;
  
      if (user) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name') 
          .eq('id', user.id) 
          .single(); 
  
        if (profileError) {
          console.error('Error fetching profile:', profileError.message);
        } else {
          console.log('Profile data:', profileData);
          setUserName(profileData.full_name); 
        }
      } else {
        console.error('No user is logged in');
      }
    } 
    catch (error) {
      console.error('Error loading data:', error.message);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    handleLoadData();
  }, []);

  return (
    <nav className="bg-blue-500 p-4 flex justify-between items-center">
      {/* Menu Button (Sidebar Toggle) */}
      <button
        onClick={toggleSidebar}
        className="p-2 bg-gray-900 text-white rounded-md focus:outline-none"
      >
        <Menu size={24} />
      </button>

      {/* Logo or Brand Name */}
      <div className="text-white font-bold ml-4">My App</div>

      <div className="flex items-center space-x-4">
        {/* Notification Icon */}
        <div className="relative">
          <button>
            <FaBell className="text-white text-2xl" />
          </button>
        </div>

        {/* Avatar with Popover */}
        <div className="relative">
          <button onClick={togglePopover}>
            <IoMdPerson className="text-white text-2xl" />
          </button>

          {popoverVisible && (
            <div className="absolute right-0 top-full mt-2 bg-white shadow-lg rounded-md p-4 w-48">
              {/* Popover content */}
              <div>
                <p className="font-semibold text-black">{`Hi,${userName}`}</p>
                <ul>
                  <li className="py-2 flex items-center text-black">
                    <User size={16} className="mr-2" />
                    Profile
                  </li>
                  <li className="py-2 flex items-center">
                    <LogOut size={16} className="mr-2 text-red-500" />
                    <span
                      onClick={handleLogout}
                      className="text-red-500 cursor-pointer"
                    >
                      Logout
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Render Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
    </nav>
  );
};

export default Navbar;
