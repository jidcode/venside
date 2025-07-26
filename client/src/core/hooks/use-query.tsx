"use client";

import useSWR from "swr";
import { fetcher } from "@/server/api/fetcher";

export default function useQuery<T>(endpoint: string) {
  const { data, error, mutate } = useSWR<T>(endpoint, fetcher);

  return {
    data,
    isLoading: !error && !data,
    error,
    mutate,
  };
}
