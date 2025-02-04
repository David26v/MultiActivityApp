import { useState, useEffect } from "react";
import supabase from "../utils/supabaseClient";

const ProfileModal = ({ isOpen, onClose }) => {
  const [show, setShow] = useState(isOpen);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState(null); 
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(false);

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
        // If there's an existing avatar, show it
        if (profileData.avatar_url) {
          setAvatarFile(profileData.avatar_url);
        }
      }
    };

    fetchUserData();
  }, [isOpen]);

  const handleImageUpload = async () => {
    if (!avatarFile) return null;

    const fileExt = avatarFile.name.split(".").pop();
    const fileName = `${user.id}-avatar.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(filePath, avatarFile, { upsert: true });

    if (error) {
      console.error("Error uploading image:", error.message);
      return null;
    }

    const imageUrl = supabase.storage.from("avatars").getPublicUrl(filePath).publicURL;
    return imageUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Handle email update
      if (newEmail && newEmail !== user?.email) {
        const { error: emailError } = await supabase.auth.updateUser({ email: newEmail });
        if (emailError) throw emailError;
      }

      let avatarUrl = profile?.avatar_url;
      if (avatarFile) {
        avatarUrl = await handleImageUpload();
        if (!avatarUrl) throw new Error("Image upload failed.");
      }

      const profileData = { full_name: fullName, bio, avatar_url: avatarUrl };

      const { error: profileError } = profile
        ? await supabase.from("profiles").update(profileData).eq("id", user?.id)
        : await supabase.from("profiles").insert([{ id: user?.id, ...profileData }]);

      if (profileError) throw profileError;
      onClose();
    } catch (error) {
      console.error("Error updating profile:", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`bg-white p-6 rounded-lg shadow-md max-w-lg w-full transition-all duration-300 transform ${
          isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"
        }`}
      >
        <h2 className="text-xl font-bold mb-4 text-black">Profile Settings</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="p-2 border w-full rounded-md text-black"
            required
          />
          <div className="flex flex-col items-center">
            <label className="p-2 border rounded-md">
              <span className="text-gray-600">Upload Avatar</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setAvatarFile(e.target.files[0])}
                className="hidden"
              />
            </label>
            {avatarFile && <img src={URL.createObjectURL(avatarFile)} alt="Preview" className="mt-2 w-24 h-24 object-cover rounded-full" />}
          </div>
          <input
            type="email"
            placeholder="New Email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="p-2 border w-full rounded-md text-black"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileModal;
