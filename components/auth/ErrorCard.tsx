import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ErrorCardProps {
  message?: string;
}

export const ErrorCard = ({ message }: ErrorCardProps) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F9FBFC] p-6">
      <Card className="w-[400px] shadow-md">
        <CardHeader className="text-center text-[24px] font-semibold">
          Oops! Something went wrong!
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <p className="text-center text-muted-foreground">
            {message ?? "An unexpected error occurred. Please try again."}
          </p>
          <Button asChild className="w-full bg-[#256FF1] text-white">
            <Link href="/auth/login">Back to login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
