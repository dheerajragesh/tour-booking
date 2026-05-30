"use client";

import { useEffect, useState } from "react";
import api from "@/services/api";

export default function ProfilePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get("/auth/me");

      setUser(data.user);
    } catch (error) {
      console.log(error);
    }
  };

  if (!user) return <h1>Loading...</h1>;

  return (
    <div className="max-w-4xl mx-auto p-10">
      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="flex items-center gap-6">
          <img
            src={
              user.avatar ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            className="w-32 h-32 rounded-full object-cover"
          />

          <div>
            <h1 className="text-4xl font-bold">
              {user.name}
            </h1>

            <p className="text-gray-600 mt-2">
              {user.email}
            </p>

            <p className="mt-2 capitalize">
              Role: {user.role}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}