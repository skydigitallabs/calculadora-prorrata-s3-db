'use strict';

// function getColdStart() {
//   var ret = false;
//   if (coldStart) {
//     ret = true
//     coldStart = false;
//   }
//   return ret;
// }

module.exports.calcProrratS3ToDb = (event, context, callback) => {
  const CalcProrrat = require('./functions/calc-prorrata');
  let lambda = new CalcProrrat(event, context, callback);
  lambda.run();
}