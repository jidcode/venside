import Logo from "@/core/components/elements/logo";
import Link from "next/link";
import LoginForm from "../_components/login-form";

const LoginPage = () => {
  return (
    <div className="flex flex-col justify-center px-6 py-20 lg:px-8 bg-primary min-h-screen text-secondary/90">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="grid place-content-center">
          <Logo />
        </div>

        <h2 className="mt-10 text-center text-2xl font-bold tracking-tight">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <LoginForm />

        <p className="mt-10 text-center text-sm">
          Don't have an account?
          <Link
            href="/register"
            className="font-semibold text-focus hover:underline ml-2"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
