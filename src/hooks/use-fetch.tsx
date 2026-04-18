import { useState } from "react";
import { toast } from "sonner";

export const useFetch = <TData, TArgs extends any[] = []>(
  fetcher: (...args: TArgs) => Promise<TData>
) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<TData | null>(null);
  const [error, setError] = useState<unknown>(null);

  const fn = async (...args: TArgs): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetcher(...args);
      setData(result);
    } catch (err) {
      setError(err);
      console.error("Error in useFetch:", err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return { loading, data, error, fn };
};