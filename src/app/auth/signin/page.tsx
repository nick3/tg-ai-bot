import { getCsrfToken, signIn } from "next-auth/react";

export default async function SignIn() {
    const csrfToken = await getCsrfToken();

    return (
        <form className="flex flex-col items-center justify-center h-screen" method="post">
            <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
            <label className="mb-2">
                Username
                <input className="border border-gray-300 rounded-md p-2" name="username" type="text" />
            </label>
            <label className="mb-2">
                Password
                <input className="border border-gray-300 rounded-md p-2" name="password" type="password" />
            </label>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" type="button" onClick={() => {
                alert(111)
            }}>Sign in</button>
        </form>
    );
}

function encryptPassword(password: string): string {
    // Implement your custom password encryption logic here
    const encryptedPassword = password;

    return encryptedPassword;
}