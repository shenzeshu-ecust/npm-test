// ! useId 是一个用于生成横跨服务端和客户端的 稳定的 唯一 ID 的同时避免 hydration 不匹配的 hook。
// ! 不要用useId生成list的key值！
import { useId } from 'react'
function Checkbox() {
    const id = useId();
    return (
        <>
            <label htmlFor={id}>Do you like React?</label>
            <input id={id} type="checkbox" name="react" />
        </>
    );
};
// 对于同一组件中的多个 ID，使用相同的 id 并添加后缀：
function NameFields() {
    const id = useId();
    return (
        <div>
            <label htmlFor={id + '-firstName'}>First Name</label>
            <div>
                <input id={id + '-firstName'} type="text" />
            </div>
            <label htmlFor={id + '-lastName'}>Last Name</label>
            <div>
                <input id={id + '-lastName'} type="text" />
            </div>
        </div>
    );
}
// ~ useId 生成一个包含 : 的字符串 token。这有助于确保 token 是唯一的，但在 CSS 选择器或 querySelectorAll 等 API 中不受支持。