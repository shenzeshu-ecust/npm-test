// * Hook 本质就是 JavaScript 函数，但是在使用它时需要遵循两条规则。
// ! 1 只在最顶层使用 Hook 
// ~ 不要在循环，条件或嵌套函数中调用 Hook， 确保总是在你的 React 函数的最顶层调用他们。
// ~ 遵守这条规则，你就能确保 Hook 在每一次渲染中都按照同样的顺序被调用。这让 React 能够在多次的 useState 和 useEffect 调用之间保持 hook 状态的正确。
/**
 // ? 我们可以在单个组件中使用多个 State Hook 或 Effect Hook,那么 React 怎么知道哪个 state 对应哪个 useState？
 // ! 答案是 React 靠的是 Hook 调用的顺序。因为我们的示例中，Hook 的调用顺序在每次渲染中都是相同的，所以它能够正常工作
 // ! 只要 Hook 的调用顺序在多次渲染之间保持一致，React 就能正确地将内部 state 和对应的 Hook 进行关联。
//  ! 但如果我们将一个 Hook (例如 persistForm effect) 调用放到一个条件语句中会发生 可能一些hook调用提前执行，导致bug产生
    如果我们想要有条件地执行一个 effect，可以将判断放到 Hook 的内部：
 */
// ! 2 只在 React 函数中调用 Hook 
function Form() {
    // 1. Use the name state variable
    const [name, setName] = useState('Mary');

    // 2. Use an effect for persisting the form
    useEffect(function persistForm() {
        localStorage.setItem('formData', name);
    });

    // 3. Use the surname state variable
    const [surname, setSurname] = useState('Poppins');

    // 4. Use an effect for updating the title
    useEffect(function updateTitle() {
        document.title = name + ' ' + surname;
    });

    // ...
}
// 
// ! 🔴 在条件语句中使用 Hook 违反第一条规则
if (name !== '') {
    useEffect(function persistForm() {
        localStorage.setItem('formData', name);
    });
}
// ~ 在第一次渲染中 name !== '' 这个条件值为 true，所以我们会执行这个 Hook。
// ~ 但是下一次渲染时我们可能清空了表单，表达式值变为 false。此时的渲染会跳过该 Hook，Hook 的调用顺序发生了改变：
useState('Mary')           // 1. 读取变量名为 name 的 state（参数被忽略）
// useEffect(persistForm)  // 🔴 此 Hook 被忽略！
useState('Poppins')        // 🔴 2 （之前为 3）。读取变量名为 surname 的 state 失败
useEffect(updateTitle)     // 🔴 3 （之前为 4）。替换更新标题的 effect 失败
// ~ 如果我们想要有条件地执行一个 effect，可以将判断放到 Hook 的内部：

useEffect(function persistForm() {
    // 👍 将条件判断放置在 effect 中
    if (name !== '') {
        localStorage.setItem('formData', name);
    }
});