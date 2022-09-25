// ! 交叉类型是将多个类型合并为一个类型。 这让我们可以把现有的多种类型叠加到一起成为一种类型，它包含了所需的所有类型的特性。
// ~ T & U
// P & S & L 同时是 P 和 S 和 L; 就是说这个类型的对象同时拥有了这三种类型的成员。
// 与单纯的 与 逻辑 不太一样
// 1 接口类型的交叉类型
interface Interface1 {
  id: number;
  name: string;
}

interface Interface2 {
  age: number;
}

type IntersectionType = Interface1 & Interface2;
/*
 * 交叉类型 IntersectionType 的类型为

    {
        id: number;
        name: string;
        age: number;
    }
`~ 对于接口类型来说，交叉类型确实是具有所有接口类型的所有特性。
 */

// 2 联合类型的交叉类型
type UnionA = "px" | "em" | "rem" | "%";
type UnionB = "vh" | "em" | "rem" | "pt";
type IntersectionUnion = UnionA & UnionB;

/*
    交叉类型 IntersectionUnion 的类型为：

    'em' | 'rem'

   ~ 为什么会这样？可以这样来理解：

    交叉类型不仅要将所有的类型合并为一个类型，而且要同时满足要交叉的类型。

    ! 要想同时满足两个接口，那么交叉后的类型必须要同时有那两个接口的属性，否则接口肯定会报需要这个属性，但是没有提供。

    ! 要想同时满足两个联合类型，那么取的必须要是两个联合类型的交集，否则不可能同时满足两个联合类型。

*/
