"use client"

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function CredentialSignInForm(props: { csrfToken: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    void signIn("credentials", {
      email,
      password,
    }).then(async (res) => {
      if (res?.error) {
        setError(res.error);
      } else {
      }
    });

    // const res = await fetch("/api/auth/signin", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     email,
    //     password: encryptPassword(password),
    //   }),
    // });

    // if (res.status !== 200) {
    //   setError("Incorrect email or password");
    // }
  };

  return (
    <form className="flex flex-col items-center justify-center h-screen" onSubmit={handleSubmit}>
      <input name="csrfToken" type="hidden" defaultValue={props.csrfToken} />
      <label className="mb-2">
        Email
        <input
          className="border border-gray-300 rounded-md p-2"
          name="email"
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label className="mb-2">
        Password
        <input
          className="border border-gray-300 rounded-md p-2"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        type="submit"
      >
        Sign in
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
}