const obj = {
    name: 'joe',
    age: 35,
    person1: {
      name: 'Tony',
      age: 50,
      person2: {
        name: 'Albert',
        age: 21,
        person3: {
          name: 'Peter',
          age: 23
        }
      }
    }
  }
  console.log(obj)  // person3会被省略成[Object]
//   ! JSON.stringify(obj, null, 2)
  console.log(JSON.stringify(obj, null, 2)) // 2标识 缩进的空格数

