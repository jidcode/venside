import { cn } from "@/core/lib/utils";

export const parseServerErrors = (errorString: string | null): string[] => {
  if (!errorString) return [];

  return errorString
    .split(";")
    .map((error) => error.trim())
    .filter((error) => error.length > 0);
};

export type DisplayErrorsProp = {
  serverErrors: string[] | null;
  className?: string;
  errorItemClassName?: string;
};

export const DisplayErrors = ({
  serverErrors,
  className = "text-destructive bg-destructive/5 px-4 py-2 my-4 rounded-md w-full text-sm",
  errorItemClassName = "space-y-1 text-center",
}: DisplayErrorsProp) => {
  if (!serverErrors || serverErrors.length === 0) return null;

  return (
    <div className={className}>
      <ul
        className={cn(
          serverErrors.length > 1 && "flex flex-col items-start list-disc px-4",
          errorItemClassName
        )}
      >
        {serverErrors.map((error, index) => (
          <li key={index}>{error}</li>
        ))}
      </ul>
    </div>
  );
};
