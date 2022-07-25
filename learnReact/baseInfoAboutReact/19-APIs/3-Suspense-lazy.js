// * React.Suspense 可以指定加载指示器（loading indicator），以防其组件树中的某些子组件尚未具备渲染条件。
// * 目前，懒加载组件是 <React.Suspense> 支持的唯一用例
// 该组件是动态加载的
const OtherComponent = React.lazy(() => import('./OtherComponent'));

function MyComponent() {
  return (
    // 显示 <Loading/> 组件 直至 OtherComponent 加载完成
    <React.Suspense fallback={<Loading/>}>
      <div>
        <OtherComponent />
      </div>
    </React.Suspense>
  );
}
// ? 最佳实践是将 <Suspense> 置于你想展示加载指示器（loading indicator）的位置，而 lazy() 则可被放置于任何你想要做代码分割的地方。