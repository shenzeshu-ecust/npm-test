class Bullet {
  constructor(data) {
    Object.assign(this, data)
    this.moving = false
    this.isPass = false
  }
}

export {
  Bullet
}