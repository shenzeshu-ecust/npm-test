export function equel(arg1, arg2) {
  let type1 = typeof arg1
  let type2 = typeof arg2
  if (Array.isArray(arg1)) {
    type1 = 'array'
  }
  if (Array.isArray(arg2)) {
    type2 = 'array'
  }
  if (type1 != type2) {
    return false
  }
  switch (type1) {
    case 'string':
    case 'number':
      return arg1 === arg2
    case 'array':
      for (let i = 0; i < arg1.length; i++) {
        let v1 = arg1[i]
        let v2 = arg2[i]
        if (equel(v1, v2)) {
          continue;
        } else {
          return false;
        }
      }
    case 'object':
      for (let key in arg1) {
        let v1 = arg1[key]
        let v2 = arg2[key]
        if (equel(v1, v2)) {
          continue;
        } else {
          return false;
        }
      }
    default:
      return arg1 === arg2
  }
}

export function vilidQuery(rule, obj) {
  let ret = {
    success: true,
    msg: ''
  }
  for(let i = 0 ; i < rule.length; i++) {
    let key = rule[i]
    if (typeof obj[key] == 'undefined') {
      ret.success = false
      ret.msg = `${obj[key]} miss`
      return ret
    }
  }
  return ret
}