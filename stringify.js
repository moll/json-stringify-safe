module.exports = stringify;

function stringify(obj, fn, spaces) {
  var seen = [];
  return JSON.stringify(obj, function(key, value) {
    var ret = value;
    if (typeof value === 'object' && value) {
      if (seen.indexOf(value) !== -1)
        ret = '[Circular]';
      else
        seen.push(value);
    }
    if (fn) ret = fn(key, ret);
    return ret;
  }, spaces);
}
