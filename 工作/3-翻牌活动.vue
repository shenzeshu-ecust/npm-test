<template>
  <div>
    <!-- 用户可以根据订单参与活动，先弹出弹窗，点击收下给5张卡牌，继续集满5张即可提现。 -->
    <div class="btn-submit">收下</div>
    <img src="" class="dot-icon" />
    <h3>集齐卡牌...</h3>
    <!-- 首次5张牌 -->
    <div :class="['pop-star', { anim: !store.showShadow }]">
      <!---收起时addclass="anim" 且shadow 消失-->
      <i class="icon-light" />
      <i class="icon-dot" />
      <div class="tit-maipiaohuozeng" />
      <div class="tit-qijibide" />
      <div class="pop-star-card">
        <ul class="card-list">
          <li v-for="item in cardList.slice(0, 5)" :key="item.cardType">
            <img
              :src="
                CARD_LIST.find((card) => card.cardType === item.cardType).img
              "
              class="card-img"
            />
          </li>
        </ul>
      </div>
      <button class="btn-submit">
        <div class="tit" @click="onClickAccept">收下卡牌</div>
      </button>
    </div>

    <!-- 集齐卡牌 -->
    <div class="pop-mid pop-cardallin">
      <div class="back-light" />
      <ul class="card-list">
        <li v-for="item in CARD_LIST" :key="item.cardType">
          <img :src="item.img" class="card-img" />
        </li>
      </ul>
    </div>
  </div>
</template>
<script setup></script>
<style lang="less">
/*
  1 用户获得助力得到卡牌，进页面需要弹出对应的卡牌。
  问题：服务端返回的是新的卡牌数，但是需要对比出新发的卡牌，如何解决
  解决：①本地缓存。但是有问题，app和小程序缓存不共享——走后端redis缓存。
  ② 存什么数据。刚开始存卡片数组。每次进页面缓存下。对比下哪些卡片多了。根据得到的时间排序弹出
  问题：逻辑冗余——只要缓存进页面时间就行。判断哪些卡片是在缓存时间（get接口的卡片数据有获得时间字段）之后得到的，拿出来就行。

  判断用户是不是第一次
*/

/*
 2 弹出成功提现的弹窗时会带有动画。一张卡片加上背景图（蝴蝶结）,但是存在问题：
 第一次出现的时候蝴蝶结背景图动画很怪异，只出现出现了部分，和弹窗本地不贴合。
 而且这个bug只出现在第一次弹出的情况。本地调试没问题。
 原因：图片会进行缓存，本地浏览器或者手机调试时机器中已经有缓存了，而用户不会。图片比较大时无法及时显示完全图片，而动画只播放1秒不到。
 解决：图片预加载。
*/

/*
  3 按钮文案会根据卡片收集情况（cardList）、提现与否等展示不同文案（有默认文案）。有一个条件是判断有没有参加过活动。用
  cardList.every(v => v.num > 0) bug就是：在初次进页面时默认文案没有显示默认文案而是进了
  其他if分支显示了不正确的文案，页面闪一下后完成渲染后显示又正确了。
  原因：用cardList.every(v => v.num > 0) 判断用户有没有参加过活动（因为参加过肯定有5张卡片）。初始进页面
  的时候get请求还没完成，cardList默认空数组，而every有两个特性： 
  1 判断空数组：对于空数组，它只返回 true。（这种情况属于无条件正确，因为空集的所有元素都符合给定的条件。）
  2）callbackFn 仅针对已分配值的数组索引调用。它不会为稀疏数组中的空槽调用。every() 不会在空槽上运行它的断言函数。
    console.log([1, , 3].every((x) => x !== undefined)); // true

  同样Array.prototype.some也有类似的特性：
  1）在对于一个空数组，任何条件下它都返回 false
  2）它不会为稀疏数组中的空槽调用。
    console.log([1, , 1].some((x) => x !== 1)); // false
*/

// 初次进页面，显示弹层，让用户收下
// 1 点图闪烁的效果
.dot-icon {
  animation: lightscale 0.5s 0.5s ease-in-out forwards,
    lightflicker 1.5s 1s ease-in-out infinite;
}
.title {
  // forwards 停在最后一帧
  animation: titshow 0.3s 0.2s linear forwards;
}
.pop-card-bd {
  animation: cardshow 0.8s linear 1 forwards;
}
// 从小到大出现，(光圈也是用这个实现)
@keyframes lightscale {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
}
// 然后开始闪烁效果
@keyframes lightflicker {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
// 标题文字从左到右展示（像拉开卷轴一样）
@keyframes titshow {
  0% {
    width: 0;
  }
  100% {
    width: 13.4rem;
  }
}
// 卡片逐渐方大有回弹的效果
@keyframes cardshow {
  0% {
    transform: scale(0);
  }
  60% {
    transform: scale(1.2);
  }
  70% {
    transform: scale(0.9);
  }
  80% {
    transform: scale(1.03);
  }
  90% {
    transform: scale(0.98);
  }
  100% {
    transform: scale(1);
  }
}
// 点击收下卡片 卡片滑动至对应位置
@keyframes cardmove {
  0% {
    margin: 5.4rem 1rem 0;
    opacity: 1;
    transform: scale(1);
  }
  100% {
    margin: 0.4rem 1.3rem 0;
    opacity: 1;
    transform: scale(1);
  }
}
// 卡片光效（背景图从左到右）
@keyframes cardslidelight {
  0% {
    left: -3.1rem;
    opacity: 0.4;
  }
  100% {
    left: 6.1rem;
    opacity: 0.4;
  }
}
// 集齐成功
.pop-cardallin {
  width: 16.9rem;
  height: 7.85rem;
  .card-list {
    position: relative;
    grid-gap: 0.45rem;
    li {
      opacity: 1;
      &:nth-child(1) {
        animation: cardallin1 2s 0.8s linear forwards;
      }
      &:nth-child(2) {
        animation: cardallin2 2s 0.8s linear forwards;
      }
      &:nth-child(3) {
        animation: cardallin3 2s 0.8s linear forwards;
      }
      &:nth-child(4) {
        animation: cardallin4 2s 0.8s linear forwards;
      }
      &:nth-child(5) {
        animation: cardallin5 2s 0.8s linear forwards;
      }
      &:nth-child(6) {
        animation: cardallin6 2s 0.8s linear forwards;
      }
      &:nth-child(7) {
        animation: cardallin7 2s 0.8s linear forwards;
      }
      &:nth-child(8) {
        animation: cardallin8 2s 0.8s linear forwards;
      }
      &:nth-child(9) {
        animation: cardallin9 2s 0.8s linear forwards;
      }
      &:nth-child(10) {
        animation: cardallin10 2s 0.8s linear forwards;
      }
    }
  }
}
@keyframes cardallin1 {
  0%,
  4% {
    transform: translate(0, 0);
  }
  24% {
    transform: translate(0, -2.2rem);
  }
  28% {
    transform: translate(0, -2rem);
  }
  32% {
    transform: translate(0, -2.2rem);
  }
  36%,
  52% {
    transform: translate(0, -2rem);
  }
  56% {
    transform: translate(0, -2.2rem);
  }
  60% {
    transform: translate(0, -2rem);
  }
  76%,
  85% {
    transform: translate(6.9rem, 2rem);
    opacity: 1;
  }
  100% {
    transform: translate(6.9rem, 2rem);
    opacity: 0;
  }
}
@keyframes cardallin2 {
  0%,
  2% {
    transform: translate(0, 0);
  }
  24% {
    transform: translate(0, -3.2rem);
  }
  28% {
    transform: translate(0, -3rem);
  }
  32% {
    transform: translate(0, -3.2rem);
  }
  36%,
  52% {
    transform: translate(0, -3rem);
  }
  56% {
    transform: translate(0, -3.2rem);
  }
  60% {
    transform: translate(0, -3rem);
  }
  76%,
  85% {
    transform: translate(3.45rem, 2rem);
    opacity: 1;
  }
  100% {
    transform: translate(3.45rem, 2rem);
    opacity: 0;
  }
}
</style>
