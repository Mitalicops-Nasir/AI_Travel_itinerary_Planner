"use server";

import { getUserByEmail } from "@/data/user";
import { loginSchema } from "@/FormsRelatedConfig/validationZod/loginUser";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { generateTwoFactorToken, generateVerificationToken } from "./tokens";
import { sendTwoFactorTokenEmail, sendVerificationEmail } from "./mail";
import { getTwoFactorTokenByEmail } from "@/data/two-factor-token";
import { db } from "@/data/db";
import { getTwoFactorConfirmationByUserId } from "@/data/two-factor-confirmation";
import { signIn } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { AuthError } from "next-auth";

export async function Login(user: z.infer<typeof loginSchema>) {
  try {
    const validatedFields = loginSchema.safeParse(user);

    if (!validatedFields.success) {
      return { error: "Invalid fields!" };
    }

    const { email, password, code } = validatedFields.data;

    const userByEmail = await getUserByEmail(validatedFields.data?.email!);

    if (!userByEmail || !userByEmail.email || !userByEmail?.password)
      return { error: "User not found" };

    if (!userByEmail.emailVerified) {
      const verificationToken = await generateVerificationToken(
        userByEmail.email
      );

      await sendVerificationEmail(
        verificationToken.email,
        verificationToken.token
      );
      return { success: "confirmation email sent!" };
    }

    if (userByEmail.isTwoFactorEnabled && userByEmail.email) {
      if (user.code) {
        const twoFactorToken = await getTwoFactorTokenByEmail(
          userByEmail.email
        );
        if (!twoFactorToken) {
          return { error: "Invalid code!" };
        }
        if (twoFactorToken.token !== user.code) {
          return { error: "Invalid code!" };
        }
        const hasExpired = new Date(twoFactorToken.expires) < new Date();

        if (hasExpired) {
          return { error: "Code expired" };
        }

        await db.twoFactorToken.delete({
          where: { id: twoFactorToken.id },
        });

        const existingConfirmation = await getTwoFactorConfirmationByUserId(
          userByEmail.id
        );

        if (existingConfirmation) {
          await db.twoFactorConfirmation.delete({
            where: { id: existingConfirmation.id },
          });
        }

        await db.twoFactorConfirmation.create({
          data: {
            userId: userByEmail.id,
          },
        });
      } else {
        const twoFactorToken = await generateTwoFactorToken(userByEmail.email);
        await sendTwoFactorTokenEmail(
          twoFactorToken.email,
          twoFactorToken.token
        );

        return { twoFactor: true };
      }
    }

    await signIn("credentials", {
      email,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    });

    return { success: "Login successful!" };
  } catch (error) {
    console.log(error);

    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials!" };
        default:
          return { error: "something went wrong!" };
      }
    }

    throw error;
  }
}
