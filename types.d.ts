export type Config<T = string | string[], showCompiled extends boolean = false> = {
  regex: T;
  flags: T;
  errorMessage: T;
} & (showCompiled extends true ? {
  compiled: RegExp;
} : {});