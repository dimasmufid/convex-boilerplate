import { isAuthenticatedNextjs } from "@convex-dev/auth/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const isAuthenticated = await isAuthenticatedNextjs();

  if (isAuthenticated) {
    redirect("/dashboard");
  }

  redirect("/sign-in");
}
