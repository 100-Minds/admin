"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/store";
import LoginForm from "@/components/LoginForm"; // Import your Login form

export default function Home() {
  const { user } = useSession((state) => state);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace("/dashboard"); // Redirect logged-in users
    }
  }, [user, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <LoginForm />
    </div>
  );
}
