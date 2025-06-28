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

    const { email, password, name, phone } = validatedFields.data;
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      return { error: "Email already in use!" };
    }
    const user = await db.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        emailVerified: new Date().toISOString(), //remove this if want to put verification feature of email
      },
    });

    //const verificationToken = await generateVerificationToken(email);
    //await sendVerificationEmail(
    //verificationToken.email,
    //verificationToken.token
    //);

    return { success: "User Created!", user: user };
  } catch (error) {
    console.log({ error });
    return { error };
  }
};
