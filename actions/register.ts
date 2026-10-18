"use server";

import { db } from "@/data/db";
import { getUserByEmail } from "@/data/user";
import { RegisterUser } from "@/FormsRelatedConfig/validationZod/registerUser";
import bcrypt from "bcryptjs";
import { z } from "zod";

export const signUpUser = async (values: z.infer<typeof RegisterUser>) => {
  try {
    const validatedFields = RegisterUser.safeParse(values);

    if (!validatedFields.success) {
      return { error: "Invalid fields!" };
    }

    const { name, phone, password } = validatedFields.data;
    const email = validatedFields.data.email.toLowerCase();

    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      return { error: "Email already in use!" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        // New accounts are auto-verified.
        // Swap this for `generateVerificationToken` + `sendVerificationEmail`
        // if email verification is enforced later.
        emailVerified: new Date(),
      },
    });

    return { success: "User Created!" };
  } catch (error) {
    console.log({ error });
    return { error: "Something went wrong. Please try again." };
  }
};
