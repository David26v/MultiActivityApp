'use client'
import { useState } from 'react';
import { FaBell } from 'react-icons/fa';
import { IoMdPerson } from 'react-icons/io';
import { Menu, LogOut, User } from 'lucide-react'; 
import Sidebar from './Sidebar';
import { useEffect } from 'react';
import supabase from '../utils/supabaseClient';

const Navbar = () => {
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); 


  const togglePopover = () => {
    setPopoverVisible(!popoverVisible);
  };


  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };


  const handleLogout = () => {
    localStorage.removeItem('authToken');  
    window.location.reload(); 
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = supabase.auth.user();
        if (user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error('Error fetching user profile:', error);
          } else {
            setUserName(data.full_name); 
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
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
              <p className="font-semibold">{userName || 'User Name'}</p>
                <ul>
                  <li className="py-2 flex items-center">
                    <User size={16} className="mr-2 text-gray-600" />
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
