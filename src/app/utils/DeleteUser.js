// pages/api/deleteUser.js

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY 
);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userId } = req.body;

    try {
      const { error } = await supabase.auth.api.deleteUser(userId);
      if (error) {
        return res.status(400).json({ message: error.message });
      }
      return res.status(200).json({ message: 'User successfully deleted' });
    } catch (error) {
      return res.status(500).json({ message: 'Error deleting user' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
