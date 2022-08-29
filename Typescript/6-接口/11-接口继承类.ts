// ! 当接口继承了一个类类型时，它会继承类的成员但不包括其实现。 
// ! 就好像接口声明了所有类中存在的成员，但并没有提供具体实现一样。 接口同样会继承到类的private和protected成员。 

// ! 这意味着当你创建了一个接口 继承了一个 拥有私有或受保护的成员 的类时，这个接口类型只能被这个类或其子类所实现（implement）。 
class Control {
    private state: any;
}

interface SelectableControl extends Control {
    select(): void;
}

// ~ 因为 state是私有成员，所以只能够是Control的子类们才能实现SelectableControl接口
class Button extends Control implements SelectableControl {
    select() { }
}

class TextBox extends Control {
    select() { }
}

// 错误：“Image”类型缺少“state”属性。
class Image implements SelectableControl {
    select() { }
}

