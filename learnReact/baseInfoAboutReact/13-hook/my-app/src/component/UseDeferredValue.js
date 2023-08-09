// 这里就存在问题了，用户连续输入的时候，不停地在进行计算或者调用后端服务，其实中间态的很多输入片段的信息是无用的，既浪费了服务资源，
// 也因为React应用实时更新和JS的单线程特性导致其他渲染任务卡顿。
// 那我们使用useDeferredValue来使用下，如何避免这个问题。
// ! useDeferredValue 允许用户推迟屏幕更新优先级不高部分。

// ? 我们已经了解到触发 Concurrent 模式需要使用 useTransition。
// ? 除了 useTransition， React18 还提供了另外一个 api - useDeferredValue，同样可以触发 Concurrent 模式。
//  类似防抖节流。不过防抖设置了固定时间

// * 通常情况下，用户会希望能立即看到自己输入的内容，查询的结果可以稍后展示。
// * 基于此，我们可以使用 useDeferredValue 来做优化，将 input 更新作为紧急的部分优先处理，长列表更新作为不紧急的部分延迟处理。
import { useState, useDeferredValue, useEffect, memo } from "react";
export default function DeferredValueApp() {
  const [text, setText] = useState("");
  // ! 我们仅需要修改外部组件，使得传入List的Text变量是一个延迟更新的值。
  const deferredText = useDeferredValue(text);
  const handleChange = (e) => {
    setText(e.target.value);
  };
  return (
    <div>
      <input value={text} onChange={handleChange} />
      <ListMemo text={deferredText} />
    </div>
  );
}
function List(props) {
  const [list, setList] = useState([]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount((count) => count + 1);
    setTimeout(() => {
      setList([
        { name: props.text, value: Math.random() },
        { name: props.text, value: Math.random() },
        { name: props.text, value: Math.random() },
        { name: props.text, value: Math.random() },
        { name: props.text, value: Math.random() },
        { name: props.text, value: Math.random() },
        { name: props.text, value: Math.random() },
      ]);
    }, 500);
  }, [props.text]);
  return [
    <p>{"我被触发了" + count + "次"}</p>,
    <ul>
      {list.map((item) => (
        <li>
          Hello:{item.name} value:{item.value}
        </li>
      ))}
    </ul>,
  ];
}
/*

 * 在上面示例中，虽然我们使用了 useDeferredValue，但并没有发挥出它的效果。我们仅仅延迟了长列表需要的 deferredValue，长列表对应的协调过程并没有延迟。当 input 更新开始协调时，依旧要处理 50000 个节点，使得 js 引擎占据了较多的时间，从而阻塞了渲染引擎。
 * 为了能让 useDeferredValue 能发挥它应有的作用，我们可以将长列表抽离为一个 memo 组件，将 deferredValue 通过 props 传递给长列表组件。当 deferredValue 发生变化时，长列表组件开始更新。

 */
const ListMemo = memo((props) => {
  return <List></List>;
});
