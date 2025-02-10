"use client";

import { useState, useEffect } from "react";
import { createBrowserSupabaseClient } from "@/lib/client-utils";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { TypographyH2 } from "@/components/ui/typography";

interface Profile {
  id: string;
  display_name: string;
  email: string;
  biography: string | null;
}

export default function UsersPage() {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      // Check for a valid session
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.push("/");
        return;
      }
      setUserId(sessionData.session.user.id);

      // Query the profiles table
      const { data: profilesData, error } = await supabase
        .from("profiles")
        .select("*");

      if (error) {
        console.error("Error fetching profiles:", error.message);
        return;
      }
      setProfiles(profilesData || []);
    };

    void fetchProfiles();
  }, [supabase, router]);

  if (!userId) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <div className="mb-5">
        <TypographyH2>Users</TypographyH2>
      </div>
      <Separator className="my-4" />
      <div className="flex flex-wrap justify-center">
        {profiles.map((profile) => (
          <div
            key={profile.id}
            className="m-4 w-72 rounded border-2 p-3 shadow flex flex-col"
          >
            <h3 className="text-2xl font-semibold">{profile.display_name}</h3>
            <p className="text-gray-600 break-words">{profile.email}</p>
            <p className="mt-2">{profile.biography}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
