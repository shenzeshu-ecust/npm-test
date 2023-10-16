module.exports =  function add() {
    // add
    return [...arguments].reduce((cur, sum) => cur + sum, 0);
}