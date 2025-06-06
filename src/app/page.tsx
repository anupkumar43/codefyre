import Image from "next/image";
import {
  SignUpButton,
  SignedOut,
  SignOutButton,
  SignedIn,
  UserButton,
} from "@clerk/nextjs";

export default function Home() {
  return (
    <div>
      <SignedOut>
        <SignUpButton />
      </SignedOut>
      <UserButton />
      <SignedIn>
        <SignOutButton />
      </SignedIn>
    </div>
  );
}
