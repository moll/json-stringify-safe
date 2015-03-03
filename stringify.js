var has = Object.hasOwnProperty
exports = module.exports = stringify
exports.getSerialize = serializer

function stringify(obj, replacer, spaces, cycleReplacer) {
  return JSON.stringify(obj, serializer(replacer, cycleReplacer), spaces)
}

function serializer(replacer, cycleReplacer) {
  var stack = []

  if (cycleReplacer == null) cycleReplacer = function(key, value) {
    return pathize(stack, key, value)
  }

  return function(key, value) {
    if (stack.length > 0) {
      var thisPos = stack.indexOf(this)
      ~thisPos ? stack.splice(thisPos + 1) : stack.push(this)
      if (~stack.indexOf(value)) value = cycleReplacer.call(this, key, value)
    }
    else stack.push(value)

    return replacer ? replacer.call(this, key, value) : value
  }
}

function pathize(stack, key, value) {
  if (stack[0] === value) return "[Circular ~]"

  var paths = []
  for (var i = 0, l = stack.indexOf(value); i < l; ++i)
    paths.push(findKey(stack[i], stack[i + 1]))

  return "[Circular ~." + paths.join(".") + "]"
}

function findKey(obj, value) {
  // For arrays from foreign context, for-in will probably do.
  if (obj instanceof Array) return obj.indexOf(value)
  for (var key in obj) if (has.call(obj, key) && obj[key] === value) return key
}
