// useMemo 返回缓存的变量
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
 
    return <div>
        <h4>{count}-{val}-{expensive}</h4>
        <div>
            <button onClick={() => setCount(count + 1)}>+c1</button>
            <input value={val} onChange={event => setValue(event.target.value)}/>
        </div>
    </div>;
}