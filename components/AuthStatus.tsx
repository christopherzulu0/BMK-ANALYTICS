"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

export default function AuthStatus() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="text-sm text-gray-500">Loading...</div>;
  }

  if (status === "unauthenticated" || !session?.user) {
    return (
      <div className="flex flex-col items-start gap-2">
        <div className="text-sm text-gray-500">Not signed in</div>
        <button
          onClick={() => signIn()}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="text-sm">
        Signed in as <span className="font-bold">{session?.user?.email}</span>
      </div>
      <div className="text-sm">
        Role: <span className="font-bold">{session?.user?.role || "N/A"}</span>
      </div>
      <button
        onClick={() => signOut()}
        className="text-sm text-blue-600 hover:text-blue-800 underline"
      >
        Sign out
      </button>
    </div>
  );
}
