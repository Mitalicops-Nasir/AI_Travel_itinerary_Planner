import { ErrorCard } from "@/components/auth/ErrorCard";
import { NewPasswordForm } from "@/components/auth/NewPasswordForm";

const NewPasswordPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) => {
  const { token } = await searchParams;

  if (!token) {
    return <ErrorCard message="Missing password reset token." />;
  }

  return <NewPasswordForm token={token} />;
};

export default NewPasswordPage;
