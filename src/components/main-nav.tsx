
import { getServerAuthSession } from "~/server/auth";
import Link from "next/link";
import AccountDropdown from "./AccountDropdown";
import { Button } from "~/components/ui/button"

export async function Header() {
    const session = await getServerAuthSession();
    console.log('Header session:', session);

    return (
        <header className="flex items-center justify-between px-4 py-2 border-b border-b-stone-200">
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
                The Joke Tax
            </h3>
            <div className="flex items-center gap-4">
                <Link href="/" className="text-white">
                    配置
                </Link>
            </div>
            <div className="flex items-center gap-4">
                {session?.user ? (
                    <AccountDropdown name={session.user?.name ?? 'UnknownAccount'} />
                ) : (
                    <Link href="/api/auth/signin" className="text-white">
                        <Button variant="default">登录</Button>
                    </Link>
                )}
            </div>
        </header>
    );
}