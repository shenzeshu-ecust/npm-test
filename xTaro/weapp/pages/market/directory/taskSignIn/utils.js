function parseJson(str, def = {}) {
    let ret = def
    try {
      ret = JSON.parse(str)
    } catch (error) {
      console.log(error)
    }
    return ret
}


export default {
    parseJson
}
