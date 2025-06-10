"use client";
import { SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { User, LogIn } from "lucide-react";

function HeaderProfileBtn() {
  return (
    <>
      <UserButton>
        <UserButton.MenuItems>
          <UserButton.Link
            label="Profile"
            labelIcon={<User className="size-4" />}
            href="/profile"
          />
        </UserButton.MenuItems>
      </UserButton>

      <SignedOut>
        <SignInButton mode="modal">
          <button
            className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 
              text-white text-sm rounded-md font-medium transition-all duration-200 shadow 
              shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>
        </SignInButton>
      </SignedOut>
    </>
  );
}

export default HeaderProfileBtn;
