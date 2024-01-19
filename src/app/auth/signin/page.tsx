import { getCsrfToken } from "next-auth/react";

import CredentialSignInForm from "./_components/CredentialSignInForm";

export default async function SignIn() {
  const csrfToken = await getCsrfToken();
  if (typeof csrfToken === 'undefined') {
    return null; // 或者你可以返回一个加载指示器，或者其他适合你的应用的东西
  }
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <CredentialSignInForm csrfToken={csrfToken} />
    </div>
  );
}