module.exports = stringify;

function getObjectChildren(value) {
  return Object.keys(value).filter(function (k) {
    return typeof value[k] === 'object' && value[k];
  });
}

function getSerialize (fn, decycle) {
  var context;
  decycle = decycle || function(key, value) {
    return '[Circular ' + getPath(value, context) + ']';
  };

  // Drop all contexts that had all their object-like children checked.
  var cleanContext = function () {
    while (!context.children.length) {
      context = context.parent;
      if (!context) {
        break;
      }
    }
  };

  return function(key, value) {
    var ret = value;
    if (typeof value === 'object' && value) {
      if (context) {
        // Remove the child we're currently processing
        context.children.shift();

        if (context.seen.indexOf(value) !== -1) {
          ret = decycle(key, value);

          // That circular reference was also the last child to evaluate
          if (!context.children.length) {
            cleanContext();
          }
        } else {
          // List all the direct children that are objects so that we know if we need to create a new context
          var children = getObjectChildren(value);

          if (children.length) {
            context = {
              parent: context,
              key: key,
              children: children,
              seen: context.seen.concat([value])
            };
          } else {
            // There are no more object child to match for circular references, we can pop the contexts
            cleanContext();
          }
        }
      } else {
        // The initial context
        context = {
          key: key,
          children: getObjectChildren(value),
          seen: [value]
        };
      }
    }
    if (fn) ret = fn(key, ret);
    return ret;
  };
}

function getPath (value, context) {
  var path = '';

  do {
    if (context.parent && context.parent.seen.indexOf(value) === -1) {
      path = path ? context.key + '.' + path : context.key;
    }

    context = context.parent;
  } while (context);

  return '~' + (path ? '.' + path : path);
}

function stringify(obj, fn, spaces, decycle) {
  return JSON.stringify(obj, getSerialize(fn, decycle), spaces);
}

stringify.getSerialize = getSerialize;
