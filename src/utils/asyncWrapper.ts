type AsyncFn<TArgs extends any[] = any[], TResult = any> = (
  ...args: TArgs
) => Promise<TResult>;

export const asyncWrapper =
  <TArgs extends any[]>(
    fn: AsyncFn<TArgs>,
    toast: { error: (msg: string) => void },
    getMessage?: (err: any) => string,
  ) =>
  async (...args: TArgs) => {
    try {
      return await fn(...args);
    } catch (err: any) {
      const msg =
        getMessage?.(err) ||
        err?.response?.data?.message ||
        err?.message ||
        "خطای داخلی";
      toast.error(msg);
      throw err;
    }
  };
