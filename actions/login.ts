"use server";

import { getUserByEmail } from "@/data/user";
import { loginSchema } from "@/FormsRelatedConfig/validationZod/loginUser";
import { z } from "zod";
import {
  generatePasswordResetToken,
  generateVerificationToken,
} from "./tokens";
import { sendPasswordResetEmail, sendVerificationEmail } from "./mail";
import { signIn } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { AuthError } from "next-auth";

function safeCallbackUrl(callbackUrl?: string | null) {
  if (callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")) {
    return callbackUrl;
  }
  return DEFAULT_LOGIN_REDIRECT;
}

export async function Login(
  user: z.infer<typeof loginSchema>,
  callbackUrl?: string | null
) {
  try {
    const validatedFields = loginSchema.safeParse(user);

    if (!validatedFields.success) {
      return { error: "Invalid fields!" };
    }

    const { email, password } = validatedFields.data;
    const normalizedEmail = email.toLowerCase();

    const userByEmail = await getUserByEmail(normalizedEmail);

    if (userByEmail === null) return { error: "User not found" };

    if (!userByEmail.emailVerified) {
      const verificationToken = await generateVerificationToken(
        userByEmail.email
      );

      const result = await sendVerificationEmail(
        verificationToken.email,
        verificationToken.token
      );

      if (!result.success) {
        return { error: "Could not send confirmation email. Try again later." };
      }

      return { success: "Confirmation email sent!" };
    }

    await signIn("credentials", {
      email: normalizedEmail,
      password,
      redirectTo: safeCallbackUrl(callbackUrl),
    });

    return { success: "Login successful!" };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials!" };
        default:
          return { error: "Something went wrong!" };
      }
    }

    throw error;
  }
}

export async function ResetPassword(email: string) {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Invalid email!" };
  }

  const normalizedEmail = email.toLowerCase();
  const userByEmail = await getUserByEmail(normalizedEmail);

  if (!userByEmail) {
    // Do not reveal whether an account exists.
    return { success: "If that email exists, a reset link was sent." };
  }

  const passwordResetToken = await generatePasswordResetToken(normalizedEmail);

  const result = await sendPasswordResetEmail(
    passwordResetToken.email,
    passwordResetToken.token
  );

  if (!result.success) {
    return { error: "Could not send reset email. Try again later." };
  }

  return { success: "Reset email sent!" };
}
