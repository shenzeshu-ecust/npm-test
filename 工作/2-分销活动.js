// 项目简介：用户可以组队拉新人下单，每拉成功一个且队员出行则获取10元。新用户进分享首页会有弹窗邀请加入（根据shareKey和缓存）。

// ! 1 封装蒙层组件，整体页面需要禁止滚动，但是弹窗内的内容仍需要滚动
// 解决方案1：overflow:hidden
document.body.style.overflow = "hidden"; // 有些还要给html加上这个
document.body.style.overflow = "auto"; // 恢复滚动
/*
  缺点是在移动端的适配性差一些，部分安卓机型以及​​safari​​​中，无法阻止底部页面滚动，
  另外有些机型可能需要给根节点​​<html>​​​添加​​overflow: hidden;​​样式才有效果，
  此外由于实际上是将页面的内容给裁剪了，所以在设置这个样式的时候滚动条会消失，
  而移除样式的时候滚动条又会出现，所以在视觉上是会有一定的闪烁现象的，当然也可以定制滚动条的样式，但滚动条样式就是另一个兼容性的问题了，还有同样是因为裁剪。

 */
// 解决方案2：body:fixed
/*
 最常用的方案： 要阻止页面滚动，可以将其固定在视图中即 position: fixed, 这样它就无法滚动了。
 当蒙层关闭时再释放。
 细节： 将页面固定视图后内容会回头最顶端，这里我们需要记录一下用来同步​​top​​​值，这样就可以得到一个兼容移动端与​​PC​​​端的较为完善的方案了。
 当然对于浏览器的​​api​​​兼容性是使用​​document.documentElement.scrollTop​​​控制还是​​window.pageYOffset + window.scrollTo​​控制就需要另行适配了。
    #mask{
            position: fixed;
            height: 100vh;
            width: 100vw;
            background: rgba(0, 0, 0, 0.6);
            top: 0;
            left: 0;
            display: flex;
            align-items: center;
            justify-content: center;
        }
*/
const btn = document.getElementById("btn");
const mask = document.getElementById("mask");
const body = document.body;

let documentTop = 0; // 记录按下按钮时的 `top`

btn.addEventListener("click", (e) => {
  mask.classList.remove("hide"); // 显示蒙层
  documentTop = document.scrollingElement.scrollTop;
  body.style.position = "fixed"; // 给body加
  body.style.top = -documentTop + "px";
});
mask.addEventListener("click", (e) => {
  mask.classList.add("hide");
  body.style.position = "static";
  body.style.top = "auto";
  document.scrollingElement.scrollTop = documentTop;
});

// ! 2 上滑加载更多功能
// ① 判断有没有到底，到底pageNo++,再次调接口 ② 实时监听scroll事件开销大，采用debounce节流
// ③ 封装hooks时注意页面卸载时取消监听 onUnmounted， handler必须抽离出来，否则addEventListener和removeEventListener无法匹配，取消监听不了
// 获取当前可视范围的高度
function getClientHeight() {
  let clientHeight = 0;
  if (document.body.clientHeight && document.documentElement.clientHeight) {
    clientHeight = Math.min(
      document.body.clientHeight,
      document.documentElement.clientHeight
    );
  } else {
    clientHeight = Math.max(
      document.body.clientHeight,
      document.documentElement.clientHeight
    );
  }
  return clientHeight;
}
/**
 * 滑动到底部执行callback
 * @param {Element} el 滑动目标元素（父盒子）
 * @param {Function} callback 回调
 * @param {Number} threshold 阈值，一般元素顶部距离 + 元素可视高度 == 元素总的滚动高度（包括overflow部分）时表示到底了
 * @param {Boolean} isWindow 是否判断的事window滚动。此时el置空就行
 */
export function scrollToBottom(el, callback, threshold = 0, isWindow = false) {
  let scrollTop;
  let clientHeight;
  let scrollHeight;
  if (isWindow) {
    scrollTop =
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      window.pageYOffset;
    clientHeight = getClientHeight();
    scrollHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    );
  } else {
    scrollTop = el.scrollTop;
    clientHeight = el.clientHeight;
    scrollHeight = el.scrollHeight;
  }
  if (scrollTop + clientHeight >= scrollHeight - threshold) {
    callback();
  }
}

// ! 3 页面下拉上划渐变TopBar
/*
topbar fixed定位。 主要判断页面滚动的距离是不是大于topBar的高度。
scrollTop + parseInt(safeTop, 10) >= topBar.offsetHeight

但有些机型是刘海屏，单凭scrollTop不一定准。需要一个安全的距离提前触发变色。
~ 在css中，可以通过env()函数读取安全区域规范定义的边界距离值，比如： margin-top: env(safe-area-inset-top);
? 如何在js中获取 —— 需要css自定义变量
在css中设置 :root {
    --safe-top: env(safe-area-inset-top);
}
然后可以在JavaScript中，通过以下方法，读取到css自定义变量:
getComputedStyle(document.documentElement).getPropertyValue("--safe-top")
*/
export function changeTopBarBackgroundColor(
  TobackgroundColor,
  Tocolor,
  FromColor
) {
  const safeTop = getComputedStyle(document.documentElement).getPropertyValue(
    "--sat"
  );
  console.log("safe top:", safeTop);

  const topBar = document.querySelector(".top-bar");
  if (!topBar) return;
  const scrollTop =
    document.documentElement.scrollTop ||
    window.pageYOffset ||
    document.body.scrollTop;
  if (scrollTop + parseInt(safeTop, 10) >= topBar.offsetHeight) {
    topBar.style.backgroundColor = TobackgroundColor;
    topBar.style.color = Tocolor;
  } else {
    topBar.style.backgroundColor = "";
    topBar.style.color = FromColor;
  }
}
// hooks
export function useTopBarChange() {
  const topBarHandler = debounce(
    () => changeTopBarBackgroundColor("#fff", "#333", "#333"),
    10
  );
  onMounted(() => {
    window.addEventListener("scroll", topBarHandler);
  });
  onUnmounted(() => {
    window.removeEventListener("scroll", topBarHandler);
  });
}
// ! 4 存储localStorage过期时间
// 项目中被分享的用户会弹出弹窗，只有在分享过期时间内并且没点击过加入才会弹出，一旦点击过加入以后不会再次弹出
// 后端返回过期时间，前端存储过期时间。每次拿存储时判断下有没有过期。
export function getStorage(shareKey) {
  const res = localStorage.getItem("SALE_DISTRIBUTION_HAS_JOIN");
  const arr = res ? JSON.parse(res) : [];
  const target = arr.find((v) => v.shareKey === shareKey);
  if (target) {
    const expireTime = target.expireTime;
    if (dayjs().unix() > expireTime) {
      const toDelIndex = arr.findIndex((v) => v.shareKey === shareKey);
      arr.splice(toDelIndex, 1);
      localStorage.setItem("SALE_DISTRIBUTION_HAS_JOIN", JSON.stringify(arr));
      return false;
    }
    return true;
  }
  return false;
}

export function setStorage(value, expire = 2592000) {
  const cache = localStorage.getItem("SALE_DISTRIBUTION_HAS_JOIN");
  const arr = JSON.parse(cache) || [];
  if (arr.some((v) => v.shareKey === value)) return;
  arr.push({ shareKey: value, expireTime: dayjs().unix() + expire });
  const v = JSON.stringify(arr);
  localStorage.setItem("SALE_DISTRIBUTION_HAS_JOIN", v);
}
