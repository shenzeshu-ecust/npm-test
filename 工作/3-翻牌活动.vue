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
