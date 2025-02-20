'use client'
import { useState, useEffect } from "react";
import supabase from "../utils/supabaseClient";

const ProfileModal = ({ isOpen, onClose }) => {
  const [show, setShow] = useState(isOpen);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => setShow(false), 300);
      return;
    }
    setShow(true);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchUserData = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) return console.error("Error fetching user:", error.message);

      setUser(user);

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) return console.error("Error fetching profile:", profileError.message);
      if (profileData) {
        setProfile(profileData);
        setFullName(profileData.full_name);
        setBio(profileData.bio || "");
        setAvatarUrl(profileData.avatar_url);
      }
    };

    fetchUserData();
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (newEmail && newEmail !== user?.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email: newEmail });
        if (emailError) throw emailError;
      }

      const profileData = { full_name: fullName, bio, avatar_url: avatarUrl };

      const { error: profileError } = profile
        ? await supabase.from("profiles").update(profileData).eq("id", user?.id)
        : await supabase.from("profiles").insert([{ id: user?.id, ...profileData }]);

      if (profileError) throw profileError;
      setEditMode(false); 
    } 
    catch (error) {
      console.error("Error updating profile:", error.message);
    } 
    finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className={`fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}>
      <div className={`bg-white p-6 rounded-lg shadow-md max-w-lg w-full transition-all duration-300 transform ${isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"}`}>
        <h2 className="text-xl font-bold mb-4 text-black">Profile</h2>
        
        {/* Profile Display */}
        {!editMode ? (
          <div className="text-center">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="mx-auto w-20 h-20 rounded-full" />
            ) : (
              <div className="w-20 h-20 mx-auto bg-gray-300 rounded-full flex items-center justify-center">No Avatar</div>
            )}
            <p className="text-lg font-semibold mt-2 text-black">{fullName}</p>
            <p className="text-sm text-gray-500 ">{user?.email}</p>
            <p className="mt-2 text-black">{bio || "No bio available."}</p>
            <button onClick={() => setEditMode(true)} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md">Edit</button>
            <button onClick={onClose} className="mt-4 ml-2 px-4 py-2 bg-gray-300 rounded-md">Close</button>
          </div>
        ) : (
          // Edit Mode
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="p-2 border w-full rounded-md text-black"
              required
            />
            <input
              type="email"
              placeholder="New Email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="p-2 border w-full rounded-md text-black"
            />
            <textarea
              placeholder="Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="p-2 border w-full rounded-md text-black"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEditMode(false)} className="px-4 py-2 bg-gray-300 rounded-md">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md">{loading ? "Saving..." : "Save"}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProfileModal;
