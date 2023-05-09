function isInViewport(el) {
  const clientHeight =
    document.documentElement.clientHeight || document.body.clientHeight;

  const top = el.offsetTop - document.documentElement.scrollTop;
  return top <= clientHeight;
}
