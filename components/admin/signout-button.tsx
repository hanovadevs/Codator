"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut } from "lucide-react";

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push("/admin/login");
  };

  return (
    <button
      onClick={handleSignOut}
      className="flex w-full items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer"
    >
      <LogOut className="h-4 w-4" />
      <span>Sign Out</span>
    </button>
  );
}
