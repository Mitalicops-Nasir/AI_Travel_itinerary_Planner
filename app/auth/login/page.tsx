import { LoginForm } from "@/FormsRelatedConfig/LoginForm";
import React, { Suspense } from "react";

const Login = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading login...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
};

export default Login;
