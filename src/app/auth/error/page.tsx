"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  let errorMessage = "发生未知错误。";
  switch (error) {
    case "OAuthAccountNotLinked":
      errorMessage = "此邮箱已注册，请使用其他登录方式。";
      break;
    case "CredentialsSignin":
      errorMessage = "登录凭据无效，请检查邮箱和密码。";
      break;
    case "CallbackRouteError":
      errorMessage = "回调路由发生错误。";
      break;
    default:
      errorMessage = "发生未知错误。请稍后再试。";
      break;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-3xl font-bold text-red-600">
          错误
        </h1>
        <p className="mb-4 text-center text-lg text-gray-700">
          {errorMessage}
        </p>
        <div className="text-center">
          <Link
            href="/auth/signin"
            className="inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            返回登录
          </Link>
        </div>
      </div>
    </div>
  );
}