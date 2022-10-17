// ! 映射类型是TS允许将一个类型映射成另外一个类型。
// ~ 注意类型操作都是操作的对象是  类型

// 有如下两个类型
// 响应数据
interface Res {
  code: number;
  msg: string;
  data: any;
  errMsg?: string;
}

type ResCode = 200 | 300 | 400 | 500;

// ! 1 Partial
// 语法：type partial = Partial<T>
type ResPartial = Partial<Res>;

/*
    等价于
    type ResPartial = {
        code?: number;
        msg?: string;
        data?: any;
        errMsg?: string;
    }
*/

// ? 原理
/*
    type Partial<T> = {
        [P in keyof T]?: T[P];
    };
*/

// ! 2 Required
// 语法： type required = Required<T>
type ResRequired = Required<Res>;

/*
    等价于
    type ResRequired = {
        code: number;
        msg: string;
        data: any;
        errMsg: string;
    }
*/

// ? 原理
/*
    type Required<T> = {
 ~       [P in keyof T]-?: T[P];
    };
*/

// ! 3 Readonly
// 语法： type required = Required<T>
type ResReadonly = Readonly<Res>;

/*
    等价于
    type ResReadonly = {
        readonly code: number;
        readonly msg: string;
        readonly data: any;
        readonly errMsg?: string;
    }
*/

// ? 原理
/*
    type Readonly<T> = {
 ~       readonly [P in keyof T]: T[P];
    };
*/

// ! 4 Pick 选择/挑选属性
// 语法： type pick = Pick<T, k in keyof T>
type ResPick = Pick<Res, "code" | "data">;

/*
    等价于
    type ResPick = {
        code: number;
        data: any;
    }
*/

// ? 原理
/*
    type Pick<T, K extends keyof T> = {
        [P in K]: T[P];
    };
*/

// ! 5 Record 动态构造
// ! Record不是同态的。 因为Record并不需要输入类型来拷贝属性，所以它不属于同态
// ! 非同态类型本质上会 创建 新的属性，因此它们不会从它处拷贝属性修饰符。
// 语法： type pick = Record<K extends keyof any, T>
type recordString = Record<string, any>;

/*
    等价
    type recordString = {
        [x: string]: any;
    }
*/

type recordReq = Record<"id" | "token" | "data", any>;

/*
    等价
    type recordReq = {
        id: any;
        token: any;
        data: any;
    }
*/

// ? 原理
/*
    type Record<K extends keyof any, T> = {
        [P in K]: T;
    };
*/

// ! 6 Exclude

// 语法： type exclude = Exclude<T, U>
type excludeResCode = Exclude<ResCode, 200>;

/*
    等价
    type excludeResCode = 300 | 400 | 500
*/

// ? 原理
/*
    type Exclude<T, U> = T extends U ? never : T;
*/
// ~ 和Pick的用法差别，Exclude操作的是联合类型, Pick可以操作对象类型、联合类型

// ! 7 Extract Extract<Type, Union>

// 语法： type extract = Extract<T, U>
type extractResCode = Extract<ResCode, 200 | 300>;

/*
    等价
    type extractResCode = 200 | 300;
*/

// ? 原理
/*
    type Extract<T, U> = T extends U ? T : never;
*/
// ~ 和Pick的用法差别，Extract操作的是联合类型, Pick可以操作对象类型、联合类型

// ! 8 Omit 忽略属性 Omit<Type, Keys>
// 从Type中选取所有的属性值，然后移除属性名在Keys中的属性值
// ~ 本质上是Pick的反向操作，排除掉Keys。
// 语法： type omit = Omit<T, K>
type omitRes = Omit<Res, "code" | "msg">;

/*
    等价
    type omitRes = {
        data: any;
        errMsg?: string;
    }

*/

// ? 原理
/*
   type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
*/
type picked = Pick<"a" | "b", "a">; // * picked报错，原因很简单，字符串a不属于keyof 'a'|'b'
// Omit没报错 为啥
type omit = Omit<"a" | "b", "a">; // * 源码中 Omit<T, K extends keyof any>  --->   K extends any你写啥都不报错

// ! 9 NonNullable 排除null和undefined
// 语法： type nonNullable = NonNullable<T>
type Msg = string | null | number | undefined;
type MsgNonNullable = NonNullable<Msg>;

/*
    等价于
    type MsgNonNullable = string | number;
*/

// ? 原理
/*
    type NonNullable<T> = T extends null | undefined ? never : T;
*/

// ! 10 Parameters 获取函数参数返回类型
// 语法：type parameters = Parameters<T>;
interface ShowInfo {
  (msg: string, type: number): string;
}
type parameters = Parameters<ShowInfo>;
/* 
    相当于
    type parameters = [msg: string, type: number]
*/

// ? 原理
/*
    type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;
*/

// ! 11 ReturnType 获取函数参数返回类型
// 语法：type returnType = ReturnType<T>;
interface ShowInfo {
  (msg: string, type: number): string;
}
type returnType = ReturnType<ShowInfo>;
/* 
      相当于
      type returnType = string
  */

// ? 原理
/*
    type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;
*/
