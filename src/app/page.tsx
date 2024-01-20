import { unstable_noStore as noStore } from "next/cache";

// import { CreatePost } from "~/app/_components/create-post";
import { getServerAuthSession } from "~/server/auth";
import { Header } from "~/components/main-nav";
// import { api } from "~/trpc/server";

export default async function Home() {
  noStore();
  // const hello = await api.post.hello.query({ text: "from tRPC" });
  const session = await getServerAuthSession();

  return (
    <main className="flex min-h-screen flex-col">
      <Header />
      {/* 未登录时显示介绍页面，登录后显示配置页面 */}
      {session?.user ? (
        <div className="flex flex-col items-center justify-center flex-1">
          <h1 className="text-4xl font-bold">Teleram AI Bot Configurator</h1>
          <p className="mt-4">Teleram AI 机器人配置器</p>
          <p className="mt-4">您已登录</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center flex-1">
          <h1 className="text-4xl font-bold">Teleram AI Bot Configurator</h1>
          <p className="mt-4">Teleram AI 机器人配置器</p>
          <p className="mt-4">请登录后使用</p>
        </div>
      )}


      {/* <CrudShowcase /> */}
    </main>
  );
}

// async function CrudShowcase() {
//   const session = await getServerAuthSession();
//   if (!session?.user) return null;

//   const latestPost = await api.post.getLatest.query();

//   return (
//     <div className="w-full max-w-xs">
//       {latestPost ? (
//         <p className="truncate">Your most recent post: {latestPost.name}</p>
//       ) : (
//         <p>You have no posts yet.</p>
//       )}

//       <CreatePost />
//     </div>
//   );
// }
