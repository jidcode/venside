import Logo from "@/core/components/elements/logo";
import Link from "next/link";
import RegisterForm from "../_components/register-form";

const RegisterPage = () => {
  return (
    <div className="flex bg-primary flex-col justify-center px-6 py-10 lg:px-8 min-h-screen">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <div className="grid place-content-center">
          <Logo />
        </div>

        <h2 className="mt-8 text-center text-2xl font-bold tracking-tight">
          Create a new account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
        <RegisterForm />

        <p className="mt-8 text-center text-sm">
          Already have an account?
          <Link
            href="/login"
            className="font-semibold text-focus hover:underline ml-2"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
