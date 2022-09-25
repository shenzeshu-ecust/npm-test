interface Bird {
  fly();
  layEggs();
}
interface Fish {
  swim();
  layEggs();
}
function getPet(pet: Bird | Fish) {
  pet.layEggs();
  pet.fly(); // 报错
}
// 解决：类型断言
function getPet1(pet: Bird | Fish) {
  pet.layEggs();
  (<Bird>pet).fly(); // 正确
}
