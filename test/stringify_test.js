var Sinon = require("sinon")
var stringify = require("..")

describe("Stringify", function() {
  it("must stringify circular objects", function() {
    var obj = {a: "b"}
    obj.self = obj
    obj.selves = [obj, obj]

    stringify(obj, null, 2).must.equal(JSON.stringify({
      a: "b",
      self: "[Circular ~]",
      selves: ["[Circular ~]", "[Circular ~]"]
    }, null, 2))
  })

  it("must stringify complex circular objects", function() {
    var a = {x: 1}; a.a = a
    var b = {x: 2}; b.a = a

    var obj = {}
    obj.self = obj
    obj.list = [a, b, {a: a, b: b}]

    stringify(obj, null, 2).must.equal(JSON.stringify({
      "self": "[Circular ~]",

      "list": [
        {"x": 1, "a": "[Circular ~.list.0]"},
        {"x": 2, "a": "[Circular ~.list.0]"},
        {"a": "[Circular ~.list.0]", "b": "[Circular ~.list.1]"}
      ]
    }, null, 2))
  })

  it("must call given decycler and use its output", function() {
    var obj = {}
    obj.a = obj
    obj.b = obj

    var decycle = Sinon.spy(function() { return decycle.callCount })
    var json = stringify(obj, null, 2, decycle)
    json.must.equal(JSON.stringify({a: 1, b: 2}, null, 2))

    decycle.callCount.must.equal(2)
    decycle.args[0][0].must.equal("a")
    decycle.args[0][1].must.equal(obj)
    decycle.args[1][0].must.equal("b")
    decycle.args[1][1].must.equal(obj)
  })

  it("must call given decycler and use its output for nested objects",
    function() {
    var obj = {}
    obj.a = obj
    obj.b = {self: obj}

    var decycle = Sinon.spy(function() { return decycle.callCount })
    var json = stringify(obj, null, 2, decycle)
    json.must.equal(JSON.stringify({a: 1, b: {self: 2}}, null, 2))

    decycle.callCount.must.equal(2)
    decycle.args[0][0].must.equal("a")
    decycle.args[0][1].must.equal(obj)
    decycle.args[1][0].must.equal("self")
    decycle.args[1][1].must.equal(obj)
  })

  it("must use decycler's output when it returned null", function() {
    var obj = {a: "b"}
    obj.self = obj
    obj.selves = [obj, obj]

    function decycle() { return null }
    stringify(obj, null, 2, decycle).must.equal(JSON.stringify({
      a: "b",
      self: null,
      selves: [null, null]
    }, null, 2))
  })

  it("must use decycler's output when it returned undefined", function() {
    var obj = {a: "b"}
    obj.self = obj
    obj.selves = [obj, obj]

    function decycle() {}
    stringify(obj, null, 2, decycle).must.equal(JSON.stringify({
      a: "b",
      selves: [null, null]
    }, null, 2))
  })

  it("must throw given a decycler that returns a cycle", function() {
    var obj = {}
    obj.self = obj
    var err
    function identity(key, value) { return value }
    try { stringify(obj, null, 2, identity) } catch (ex) { err = ex }
    err.must.be.an.instanceof(TypeError)
  })

  describe(".getSerialize", function() {
    it("must stringify circular objects", function() {
      var obj = {a: "b"}
      obj.circularRef = obj
      obj.list = [obj, obj]

      var json = JSON.stringify(obj, stringify.getSerialize(), 2)
      json.must.equal(JSON.stringify({
        "a": "b",
        "circularRef": "[Circular ~]",
        "list": ["[Circular ~]", "[Circular ~]"]
      }, null, 2))
    })
  })
})
