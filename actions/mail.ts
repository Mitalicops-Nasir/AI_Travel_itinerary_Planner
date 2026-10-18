"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const FROM = "onboarding@resend.dev";

async function sendEmail(to: string, subject: string, html: string) {
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
    });

    if (error) {
      console.log({ resendError: error });
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.log({ resendError: error });
    return { success: false, error: "Failed to send email" };
  }
}

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${APP_URL}/auth/new-password?token=${token}`;

  return sendEmail(
    email,
    "Reset Your Password",
    `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`
  );
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `${APP_URL}/auth/new-verification?token=${token}`;

  return sendEmail(
    email,
    "Confirm your email",
    `<p>Click <a href="${confirmLink}">here</a> to confirm email.</p>`
  );
};
