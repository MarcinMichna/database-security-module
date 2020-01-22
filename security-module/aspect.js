const before = (fn, args) => {
  return function() {
    // here code will execute before 'prepareQuery' function

    const queryStr = `${arguments[0]} WHERE ID=1`;

    // queryStr += checkSomething1();
    // queryStr += checkSomething2();
    // queryStr += checkSomething3();

    return fn.call(this, queryStr);
  };
};

let prepareQuery = query => {
  // here code will execute after 'before' function
  return `${query}`;
};

prepareQuery = before(prepareQuery);

module.exports = { prepareQuery };
