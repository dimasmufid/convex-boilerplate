import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params) {
        const email = params.email;
        if (typeof email !== "string" || !email.trim()) {
          throw new Error("Email is required.");
        }

        const profile: {
          email: string;
          name?: string;
          role: "user";
        } = {
          email: email.trim().toLowerCase(),
          role: "user",
        };

        const name = params.name;
        if (typeof name === "string" && name.trim()) {
          profile.name = name.trim();
        }

        return profile;
      },
    }),
  ],
});
