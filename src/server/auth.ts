import { PrismaAdapter } from "@next-auth/prisma-adapter";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
// import GitHubProvider from "next-auth/providers/github";

import { env } from "~/env";
import { db } from "~/server/db";

import { encryptPassword } from "~/utils/password"; // 导入加密函数

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    // signOut: "/auth/signout",
    // error: "/auth/error", // Error code passed in query string as ?error=
    // verifyRequest: "/auth/verify-request", // (used for check email message)
    // newUser: "/auth/new-user", // New users will be directed here on first sign in (leave the property out if not of interest)
  },
  callbacks: {
    // async signIn({ user, account, profile, email, credentials }) {
    //   // You can customize the signIn behavior here
    //   // console.log('signIn', user, account, profile, email, credentials)
    //   // 登录成功后路由跳转至 /dashboard
    //   return '/';
    // },
    session({ session, token }) {
      console.log('session', session, token)
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub ?? session.user?.id,
        },
      }
    },
  },
  adapter: PrismaAdapter(db),
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "Username & Password",
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        email: { label: "Email", type: "text", placeholder: "Enter your username or email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        // Add logic here to look up the user from the credentials supplied
        let user = null
        if (credentials?.email) {
          user = await getUserFromDb(credentials.email)
        } else {
          throw new Error("Email is not correct.")
        }
        console.log('user', user)

        if (!user) {
          throw new Error("User was not found and could not be created.")
        } else {
          if (credentials.password === null || user.passwordHash === null) {
            throw new Error("Password or password hash is null.");
          }
          ;
          const isMatch = encryptPassword(credentials.password) === user.passwordHash as string;
          if (!isMatch) {
            throw new Error("Password is not correct.");
          } else {
            return user;
          }
        }
      }
    }),
    // GitHubProvider({
    //   clientId: env.GITHUB_ID,
    //   clientSecret: env.GITHUB_SECRET
    // })
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
};

async function getUserFromDb(email: string) {
  const user = await db.user.findUnique({
    where: {
      email: email
    }
  })
  return user
}

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
