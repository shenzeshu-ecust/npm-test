import React,{ useState, useTransition } from "react"

/*
! 使用useTransition()将UI更新标记为低优先级，这种操作对大量的非紧急更新非常有用。
! react默认所有更新都是紧急的，这会导致 快速更新会被大量更新拖慢速度
React中的并发模式(concurrent mode)将紧急任务和非紧急任务区分开，使UI更新更加人性化。
在开启React 18并发模式新特性之后，你可以使用useTransition()钩子进而使用startTransition(callback)函数。
useTransition()使你能够将默认更新标记为过渡(transitions):
! 从React 18中新增特性-concurrency之后，你就可以将某些更新标记为可中断的和非紧急的-也就是所谓的transitions。这种新特性在大量的UI更新操作中尤其有效，比如过滤一个较大的列表。
const [isPending, startTransition] = useTransition();
startTransition(() => {
  ~ // Mark updates as transitions
  setStateValue(newValue);
});
useTransition()这个钩子函数使得用户能够在React组件中使用concurrent模式特性。
调用const [isPending, startTransition] = useTransitionHook()返回一个具有两个成员的数组：

    ! isPending: 指明这个transition正在加载中(pending)
    ! startTransition(回调): 允许用户将回调中的任何UI更新标记为transitions.


 
 */
export function FilterList({names}) {
    const [query, setQuery] = useState("")
    const [highlight, setHighlight] = useState("")

    const [isPending, startTransition] = useTransition()
    const changeHandler = ({target: {value}}) => {
        setQuery(value)
        startTransition(() => setHighlight(value))
    }

    return (
        <div>
            <input onChange={changeHandler} value={query} type="text" />
            <div style={{width:"200px",height: "30px", margin:"10px auto",background:"pink"}}>---{isPending && "loading..."}</div>
            {isPending ? 'pending' : names.map((name, i) => (
                <ListItem key={i} name={name} highlight={highlight}/>
            ))}
        </div>
    )
}
function ListItem({ name, highlight }) {
    const index = name.toLowerCase().indexOf(highlight.toLowerCase());
    if (index === -1) {
      return <div>{name}</div>;
    }
    return (
      <div>
        {name.slice(0, index)}
        <span className="highlight">
          {name.slice(index, index + highlight.length)}
        </span>
        {name.slice(index + highlight.length)}
      </div>
    );
  }
  /*
    打开这个使用了transitionos特性的示例，如果你非常快速地在输入框中键入，你会注意到高亮列表的延迟更新。

    React将紧急任务(当用户键入时更新输入框)的更新和非紧急任务(高亮显示过滤内容)的渲染区分开了，这样的操作提升了用户体验。
   */