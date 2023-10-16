let timeslice = (gen) => {
  if (typeof gen === "function") gen = gen();
  if (!gen || typeof gen.next !== "function") return;
  return function next() {
    const start = performance.now();
    let res = null;
    do {
      res = gen.next();
    } while (!res.done && performance.now() - start < 25);
    if (res.done) return;
    setTimeout(next, 0);
  };
};
let count = 0;
timeslice(function* () {
  const start = performance.now();
  while (performance.now() - start < 1000) {
    console.log(11);
    count++;
    yield;
  }
  console.log("done!");
  console.log(count);
})();


