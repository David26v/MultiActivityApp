"use client";

import { useRouter } from "next/navigation";

const BackButton = () => {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/")}
      className="mb-4 px-4 py-2 bg-gray-800 text-white rounded-lg"
    >
      Back to Homepage
    </button>
  );
};

export default BackButton;
