export default Behavior({
  definitionFilter(e) {
    const {
      properties: o
    } = e;
    Object.keys(o).forEach(e => {
      const {
        options: t
      } = o[e];
      t && (o[e].observer = function (o) {
        !t.includes(o) && o && console.error(`${e}: ${o} must be in the [${t}]`)
      })
    })
  }
});