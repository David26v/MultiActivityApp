"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import supabase from "./utils/supabaseClient";

export default function Home() {
  const [user, setUser] = useState(undefined); // Initially undefined to avoid hydration mismatch
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);

      if (!session) {
        router.push("/login"); // Redirect to login if no session exists
      } else {
        // Redirect to the welcome page if the user is logged in
        router.push("/");
      }
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
      if (session) {
        router.push("/"); // Redirect to welcome page after login
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  if (user === undefined) {
    return <div>Loading...</div>; // Prevents hydration mismatch by ensuring SSR output matches
  }

  return (
    <div className="h-full bg-white">
      <h1>Welcome to ChronoSphere</h1>
    </div>
  );
}
