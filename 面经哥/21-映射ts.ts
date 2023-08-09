type Partiall<T> = {
  [K in keyof T]?: T[K];
};
type Requiredd<T> = {
  [K in keyof T]-?: T[K];
};
type Readonlyy<T> = {
  readonly [K in keyof T]: T[K];
};
type Pickk<T, K extends keyof T> = {
  [P in K]: T[P];
};
type Omitt<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
type Excludee<T, U> = T extends U ? never : T;
type Recordd<K extends keyof any, T> = {
  [P in K]: T;
};
type NonNullablee<T> = T extends null | undefined ? never : T;
type Parameterss<T extends (...args: any) => any> = T extends (
  ...args: infer P
) => any
  ? P
  : never;
type ReturnTypee<T extends (...args: any) => any> = T extends (
  ...args: any
) => infer R
  ? R
  : any;
