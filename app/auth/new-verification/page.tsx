import { ErrorCard } from "@/components/auth/ErrorCard";
import { NewVerificationForm } from "@/components/auth/NewVerificationForm";

const NewVerificationPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) => {
  const { token } = await searchParams;

  if (!token) {
    return <ErrorCard message="Missing verification token." />;
  }

  return <NewVerificationForm token={token} />;
};

export default NewVerificationPage;
