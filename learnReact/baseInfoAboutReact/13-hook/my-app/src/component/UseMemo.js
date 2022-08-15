// useMemo 返回缓存的变量
// const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
// ! 传入 useMemo 的函数会在渲染期间执行。请不要在这个函数内部执行与渲染无关的操作，诸如副作用这类的操作属于 useEffect 的适用范畴，而不是 useMemo。
import {useMemo, useState} from 'react'
// ! 这里的昂贵计算只依赖于count的值，在val修改的时候，是没有必要再次计算的。在这种情况下，我们就可以使用useMemo，只在count的值修改时，执行expensive计算：
export default function WithMemo() {
    const [count, setCount] = useState(1);
    const [val, setValue] = useState('');
 
    const expensive = useMemo(() => {
        console.log('compute expensive');
        let sum = 0;
        for (let i = 0; i < count * 100; i++) {
            sum += i;
        }
        return sum;
    },[count]) // 只依赖于count
    // ~ 如果没有提供依赖项数组，useMemo 在每次渲染时都会计算新的值。
 
    return <div>
        <h4>{count}-{val}-{expensive}</h4>
        <div>
            <button onClick={() => setCount(count + 1)}>+c1</button>
            <input value={val} onChange={event => setValue(event.target.value)}/>
        </div>
    </div>;
}