import type { NextAuthConfig } from "next-auth";
import bcrypt from "bcryptjs";

import credentials from "next-auth/providers/credentials";
import { getUserByEmail } from "./data/user";
import google from "next-auth/providers/google";

import { loginSchema } from "./FormsRelatedConfig/validationZod/loginUser";

export const runtime = "nodejs";


export default {
  providers: [
    google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    credentials({
      /**
       * This function is used to authorize a user with credentials.
       *
       * It takes an object with `email` and `password` properties.
       *
       * It first validates the credentials using the `RegisterUser` schema,
       * which is a Zod schema that checks the types of the credentials and
       * makes sure they are not empty.
       *
       * If the credentials are valid, it then checks if a user with the given
       * email exists in the database. If the user does not exist, it returns
       * null.
       *
       * If the user exists, it then checks if the password matches the one
       * stored in the database. If the password is incorrect, it returns null.
       *
       * If the password is correct, it returns the user object.
       *
       * @param credentials An object with `email` and `password` properties.
       * @returns The user object if the credentials are valid and the password
       * matches the one in the database, or null if the credentials are invalid.
       */
      async authorize(credentials) {
        const validatedFields = loginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;

          const user = await getUserByEmail(email);
          if (!user || !user.password) {
            return null;
          }

          const passwordMatch = await bcrypt.compare(password, user.password);

          if (passwordMatch) {
            return user;
          }
        }

        return null;
      },
    }),
  ],
} satisfies NextAuthConfig;

