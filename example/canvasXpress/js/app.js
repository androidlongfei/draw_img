/*Prototype 1.6.0.3*/
var Prototype = {
  Version : "1.6.1_rc2",
  Browser : {
    IE : !!(window.attachEvent && navigator.userAgent.indexOf("Opera") === -1),
    Opera : navigator.userAgent.indexOf("Opera") > -1,
    WebKit : navigator.userAgent.indexOf("AppleWebKit/") > -1,
    Gecko : navigator.userAgent.indexOf("Gecko") > -1 && navigator.userAgent.indexOf("KHTML") === -1,
    MobileSafari : !!navigator.userAgent.match(/Apple.*Mobile.*Safari/)
  },
  BrowserFeatures : {
    XPath : !!document.evaluate,
    SelectorsAPI : !!document.querySelector,
    ElementExtensions : (function() {
      if(window.HTMLElement && window.HTMLElement.prototype) {
        return true
      }
      if(window.Element && window.Element.prototype) {
        return true
      }
    })(),
    SpecificElementExtensions : (function() {
      if( typeof window.HTMLDivElement !== "undefined") {
        return true
      }
      var div = document.createElement("div");
      if(div["__proto__"] && div["__proto__"] !== document.createElement("form")["__proto__"]) {
        return true
      }
      return false
    })()
  },
  ScriptFragment : "<script[^>]*>([\\S\\s]*?)<\/script>",
  JSONFilter : /^\/\*-secure-([\s\S]*)\*\/\s*$/,
  emptyFunction : function() {
  },
  K : function(x) {
    return x
  }
};
if(Prototype.Browser.MobileSafari) {
  Prototype.BrowserFeatures.SpecificElementExtensions = false
}
var Abstract = {};
var Try = {
  these : function() {
    var returnValue;
    for(var i = 0, length = arguments.length; i < length; i++) {
      var lambda = arguments[i];
      try {
        returnValue = lambda();
        break
      } catch(e) {
      }
    }
    return returnValue
  }
};
var Class = (function() {
  function create() {
    var parent = null, properties = $A(arguments);
    if(Object.isFunction(properties[0])) {
      parent = properties.shift()
    }
    function klass() {
      this.initialize.apply(this, arguments)
    }
    Object.extend(klass, Class.Methods);
    klass.superclass = parent;
    klass.subclasses = [];
    if(parent) {
      var subclass = function() {
      };
      subclass.prototype = parent.prototype;
      klass.prototype = new subclass;
      parent.subclasses.push(klass)
    }
    for(var i = 0; i < properties.length; i++) {
      klass.addMethods(properties[i])
    }
    if(!klass.prototype.initialize) {
      klass.prototype.initialize = Prototype.emptyFunction
    }
    klass.prototype.constructor = klass;
    return klass
  }

  function addMethods(source) {
    var ancestor = this.superclass && this.superclass.prototype;
    var properties = Object.keys(source);
    if(!Object.keys({
      toString : true
    }).length) {
      if(source.toString != Object.prototype.toString) {
        properties.push("toString")
      }
      if(source.valueOf != Object.prototype.valueOf) {
        properties.push("valueOf")
      }
    }
    for(var i = 0, length = properties.length; i < length; i++) {
      var property = properties[i], value = source[property];
      if(ancestor && Object.isFunction(value) && value.argumentNames().first() == "$super") {
        var method = value;
        value = (function(m) {
          return function() {
            return ancestor[m].apply(this, arguments)
          }
        })(property).wrap(method);
        value.valueOf = method.valueOf.bind(method);
        value.toString = method.toString.bind(method)
      }
      this.prototype[property] = value
    }
    return this
  }

  return {
    create : create,
    Methods : {
      addMethods : addMethods
    }
  }
})();
(function() {
  function getClass(object) {
    return Object.prototype.toString.call(object).match(/^\[object\s(.*)\]$/)[1]
  }

  function extend(destination, source) {
    for(var property in source) {
      destination[property] = source[property]
    }
    return destination
  }

  function inspect(object) {
    try {
      if(isUndefined(object)) {
        return "undefined"
      }
      if(object === null) {
        return "null"
      }
      return object.inspect ? object.inspect() : String(object)
    } catch(e) {
      if( e instanceof RangeError) {
        return "..."
      }
      throw e
    }
  }

  function toJSON(object) {
    var type = typeof object;
    switch(type) {
      case"undefined":
      case"function":
      case"unknown":
        return;
      case"boolean":
        return object.toString()
    }
    if(object === null) {
      return "null"
    }
    if(object.toJSON) {
      return object.toJSON()
    }
    if(isElement(object)) {
      return
    }
    var results = [];
    for(var property in object) {
      var value = toJSON(object[property]);
      if(!isUndefined(value)) {
        results.push(property.toJSON() + ": " + value)
      }
    }
    return "{" + results.join(", ") + "}"
  }

  function toQueryString(object) {
    return $H(object).toQueryString()
  }

  function toHTML(object) {
    return object && object.toHTML ? object.toHTML() : String.interpret(object)
  }

  function keys(object) {
    var results = [];
    for(var property in object) {
      results.push(property)
    }
    return results
  }

  function values(object) {
    var results = [];
    for(var property in object) {
      results.push(object[property])
    }
    return results
  }

  function clone(object) {
    return extend({}, object)
  }

  function isElement(object) {
    return !!(object && object.nodeType == 1)
  }

  function isArray(object) {
    return getClass(object) === "Array"
  }

  function isHash(object) {
    return object instanceof Hash
  }

  function isFunction(object) {
    return typeof object === "function"
  }

  function isString(object) {
    return getClass(object) === "String"
  }

  function isNumber(object) {
    return getClass(object) === "Number"
  }

  function isUndefined(object) {
    return typeof object === "undefined"
  }

  extend(Object, {
    extend : extend,
    inspect : inspect,
    toJSON : toJSON,
    toQueryString : toQueryString,
    toHTML : toHTML,
    keys : keys,
    values : values,
    clone : clone,
    isElement : isElement,
    isArray : isArray,
    isHash : isHash,
    isFunction : isFunction,
    isString : isString,
    isNumber : isNumber,
    isUndefined : isUndefined
  })
})();
Object.extend(Function.prototype, (function() {
  var slice = Array.prototype.slice;
  function update(array, args) {
    var arrayLength = array.length, length = args.length;
    while(length--) {
      array[arrayLength + length] = args[length]
    }
    return array
  }

  function merge(array, args) {
    array = slice.call(array, 0);
    return update(array, args)
  }

  function argumentNames() {
    var names = this.toString().match(/^[\s\(]*function[^(]*\(([^)]*)\)/)[1].replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, "").replace(/\s+/g, "").split(",");
    return names.length == 1 && !names[0] ? [] : names
  }

  function bind(context) {
    if(arguments.length < 2 && Object.isUndefined(arguments[0])) {
      return this
    }
    var __method = this, args = slice.call(arguments, 1);
    return function() {
      var a = merge(args, arguments);
      return __method.apply(context, a)
    }
  }

  function bindAsEventListener(context) {
    var __method = this, args = slice.call(arguments, 1);
    return function(event) {
      var a = update([event || window.event], args);
      return __method.apply(context, a)
    }
  }

  function curry() {
    if(!arguments.length) {
      return this
    }
    var __method = this, args = slice.call(arguments, 0);
    return function() {
      var a = merge(args, arguments);
      return __method.apply(this, a)
    }
  }

  function delay(timeout) {
    var __method = this, args = slice.call(arguments, 1);
    timeout = timeout * 1000;
    return window.setTimeout(function() {
      return __method.apply(__method, args)
    }, timeout)
  }

  function defer() {
    var args = update([0.01], arguments);
    return this.delay.apply(this, args)
  }

  function wrap(wrapper) {
    var __method = this;
    return function() {
      var a = update([__method.bind(this)], arguments);
      return wrapper.apply(this, a)
    }
  }

  function methodize() {
    if(this._methodized) {
      return this._methodized
    }
    var __method = this;
    return this._methodized = function() {
      var a = update([this], arguments);
      return __method.apply(null, a)
    }
  }

  return {
    argumentNames : argumentNames,
    bind : bind,
    bindAsEventListener : bindAsEventListener,
    curry : curry,
    delay : delay,
    defer : defer,
    wrap : wrap,
    methodize : methodize
  }
})());
Date.prototype.toJSON = function() {
  return '"' + this.getUTCFullYear() + "-" + (this.getUTCMonth() + 1).toPaddedString(2) + "-" + this.getUTCDate().toPaddedString(2) + "T" + this.getUTCHours().toPaddedString(2) + ":" + this.getUTCMinutes().toPaddedString(2) + ":" + this.getUTCSeconds().toPaddedString(2) + 'Z"'
};
RegExp.prototype.match = RegExp.prototype.test;
RegExp.escape = function(str) {
  return String(str).replace(/([.*+?^=!:${}()|[\]\/\\])/g, "\\$1")
};
var PeriodicalExecuter = Class.create({
  initialize : function(callback, frequency) {
    this.callback = callback;
    this.frequency = frequency;
    this.currentlyExecuting = false;
    this.registerCallback()
  },
  registerCallback : function() {
    this.timer = setInterval(this.onTimerEvent.bind(this), this.frequency * 1000)
  },
  execute : function() {
    this.callback(this)
  },
  stop : function() {
    if(!this.timer) {
      return
    }
    clearInterval(this.timer);
    this.timer = null
  },
  onTimerEvent : function() {
    if(!this.currentlyExecuting) {
      try {
        this.currentlyExecuting = true;
        this.execute()
      } catch(e) {
      } finally {
        this.currentlyExecuting = false
      }
    }
  }
});
Object.extend(String, {
  interpret : function(value) {
    return value == null ? "" : String(value)
  },
  specialChar : {
    "\b" : "\\b",
    "\t" : "\\t",
    "\n" : "\\n",
    "\f" : "\\f",
    "\r" : "\\r",
    "\\" : "\\\\"
  }
});
Object.extend(String.prototype, (function() {
  function prepareReplacement(replacement) {
    if(Object.isFunction(replacement)) {
      return replacement
    }
    var template = new Template(replacement);
    return function(match) {
      return template.evaluate(match)
    }
  }

  function gsub(pattern, replacement) {
    var result = "", source = this, match;
    replacement = prepareReplacement(replacement);
    if(Object.isString(pattern)) {
      pattern = RegExp.escape(pattern)
    }
    if(!(pattern.length || pattern.source)) {
      replacement = replacement("");
      return replacement + source.split("").join(replacement) + replacement
    }
    while(source.length > 0) {
      if( match = source.match(pattern)) {
        result += source.slice(0, match.index);
        result += String.interpret(replacement(match));
        source = source.slice(match.index + match[0].length)
      } else {result += source, source = ""
      }
    }
    return result
  }

  function sub(pattern, replacement, count) {
    replacement = prepareReplacement(replacement);
    count = Object.isUndefined(count) ? 1 : count;
    return this.gsub(pattern, function(match) {
      if(--count < 0) {
        return match[0]
      }
      return replacement(match)
    })
  }

  function scan(pattern, iterator) {
    this.gsub(pattern, iterator);
    return String(this)
  }

  function truncate(length, truncation) {
    length = length || 30;
    truncation = Object.isUndefined(truncation) ? "..." : truncation;
    return this.length > length ? this.slice(0, length - truncation.length) + truncation : String(this)
  }

  function strip() {
    return this.replace(/^\s+/, "").replace(/\s+$/, "")
  }

  function stripTags() {
    return this.replace(/<\/?[^>]+>/gi, "")
  }

  function stripScripts() {
    return this.replace(new RegExp(Prototype.ScriptFragment, "img"), "")
  }

  function extractScripts() {
    var matchAll = new RegExp(Prototype.ScriptFragment, "img");
    var matchOne = new RegExp(Prototype.ScriptFragment, "im");
    return (this.match(matchAll) || []).map(function(scriptTag) {
      return (scriptTag.match(matchOne)||["",""])[1]
    })
  }

  function evalScripts() {
    return this.extractScripts().map(function(script) {
      return eval(script)
    })
  }

  function escapeHTML() {
    escapeHTML.text.data = this;
    return escapeHTML.div.innerHTML
  }

  function unescapeHTML() {
    var div = document.createElement("div");
    div.innerHTML = this.stripTags();
    return div.childNodes[0] ? (div.childNodes.length > 1 ? $A(div.childNodes).inject("", function(memo, node) {
      return memo + node.nodeValue
    }) : div.childNodes[0].nodeValue) : ""
  }

  function toQueryParams(separator) {
    var match = this.strip().match(/([^?#]*)(#.*)?$/);
    if(!match) {
      return {}
    }
    return match[1].split(separator || "&").inject({}, function(hash, pair) {
      if((pair=pair.split("="))[0]) {
        var key = decodeURIComponent(pair.shift());
        var value = pair.length > 1 ? pair.join("=") : pair[0];
        if(value != undefined) {
          value = decodeURIComponent(value)
        }
        if( key in hash) {
          if(!Object.isArray(hash[key])) {
            hash[key] = [hash[key]]
          }
          hash[key].push(value)
        } else {
          hash[key] = value
        }
      }
      return hash
    })
  }

  function toArray() {
    return this.split("")
  }

  function succ() {
    return this.slice(0, this.length - 1) + String.fromCharCode(this.charCodeAt(this.length - 1) + 1)
  }

  function times(count) {
    return count < 1 ? "" : new Array(count + 1).join(this)
  }

  function camelize() {
    var parts = this.split("-"), len = parts.length;
    if(len == 1) {
      return parts[0]
    }
    var camelized = this.charAt(0) == "-" ? parts[0].charAt(0).toUpperCase() + parts[0].substring(1) : parts[0];
    for(var i = 1; i < len; i++) {
      camelized += parts[i].charAt(0).toUpperCase() + parts[i].substring(1)
    }
    return camelized
  }

  function capitalize() {
    return this.charAt(0).toUpperCase() + this.substring(1).toLowerCase()
  }

  function underscore() {
    return this.gsub(/::/, "/").gsub(/([A-Z]+)([A-Z][a-z])/, "#{1}_#{2}").gsub(/([a-z\d])([A-Z])/, "#{1}_#{2}").gsub(/-/, "_").toLowerCase()
  }

  function dasherize() {
    return this.gsub(/_/, "-")
  }

  function inspect(useDoubleQuotes) {
    var escapedString = this.gsub(/[\x00-\x1f\\]/, function(match) {
      var character = String.specialChar[match[0]];
      return character ? character : "\\u00" + match[0].charCodeAt().toPaddedString(2, 16)
    });
    if(useDoubleQuotes) {
      return '"' + escapedString.replace(/"/g, '\\"') + '"'
    }
    return "'" + escapedString.replace(/'/g, "\\'") + "'"
  }

  function toJSON() {
    return this.inspect(true)
  }

  function unfilterJSON(filter) {
    return this.sub(filter || Prototype.JSONFilter, "#{1}")
  }

  function isJSON() {
    var str = this;
    if(str.blank()) {
      return false
    }
    str = this.replace(/\\./g, "@").replace(/"[^"\\\n\r]*"/g, "");
    return (/^[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]*$/).test(str)
  }

  function evalJSON(sanitize) {
    var json = this.unfilterJSON();
    try {
      if(!sanitize || json.isJSON()) {
        return eval("(" + json + ")")
      }
    } catch(e) {
    }
    throw new SyntaxError("Badly formed JSON string: " + this.inspect())
  }

  function include(pattern) {
    return this.indexOf(pattern) > -1
  }

  function startsWith(pattern) {
    return this.indexOf(pattern) === 0
  }

  function endsWith(pattern) {
    var d = this.length - pattern.length;
    return d >= 0 && this.lastIndexOf(pattern) === d
  }

  function empty() {
    return this == ""
  }

  function blank() {
    return /^\s*$/.test(this)
  }

  function interpolate(object, pattern) {
    return new Template(this, pattern).evaluate(object)
  }

  return {
    gsub : gsub,
    sub : sub,
    scan : scan,
    truncate : truncate,
    strip : strip,
    stripTags : stripTags,
    stripScripts : stripScripts,
    extractScripts : extractScripts,
    evalScripts : evalScripts,
    escapeHTML : escapeHTML,
    unescapeHTML : unescapeHTML,
    toQueryParams : toQueryParams,
    parseQuery : toQueryParams,
    toArray : toArray,
    succ : succ,
    times : times,
    camelize : camelize,
    capitalize : capitalize,
    underscore : underscore,
    dasherize : dasherize,
    inspect : inspect,
    toJSON : toJSON,
    unfilterJSON : unfilterJSON,
    isJSON : isJSON,
    evalJSON : evalJSON,
    include : include,
    startsWith : startsWith,
    endsWith : endsWith,
    empty : empty,
    blank : blank,
    interpolate : interpolate
  }
})());
Object.extend(String.prototype.escapeHTML, {
  div : document.createElement("div"),
  text : document.createTextNode("")
});
String.prototype.escapeHTML.div.appendChild(String.prototype.escapeHTML.text);
if("<\n>".escapeHTML() !== "&lt;\n&gt;") {
  String.prototype.escapeHTML = function() {
    return this.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  }
}
if("&lt;\n&gt;".unescapeHTML() !== "<\n>") {
  String.prototype.unescapeHTML = function() {
    return this.stripTags().replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&")
  }
}
var Template = Class.create({
  initialize : function(template, pattern) {
    this.template = template.toString();
    this.pattern = pattern || Template.Pattern
  },
  evaluate : function(object) {
    if(Object.isFunction(object.toTemplateReplacements)) {
      object = object.toTemplateReplacements()
    }
    return this.template.gsub(this.pattern, function(match) {
      if(object == null) {
        return ""
      }
      var before = match[1] || "";
      if(before == "\\") {
        return match[2]
      }
      var ctx = object, expr = match[3];
      var pattern = /^([^.[]+|\[((?:.*?[^\\])?)\])(\.|\[|$)/;
      match = pattern.exec(expr);
      if(match == null) {
        return before
      }
      while(match != null) {
        var comp = match[1].startsWith("[") ? match[2].gsub("\\\\]", "]") : match[1];
        ctx = ctx[comp];
        if(null == ctx || "" == match[3]) {
          break
        }
        expr = expr.substring("[" == match[3] ? match[1].length : match[0].length);
        match = pattern.exec(expr)
      }
      return before + String.interpret(ctx)
    })
  }
});
Template.Pattern = /(^|.|\r|\n)(#\{(.*?)\})/;
var $break = {};
var Enumerable = (function() {
  function each(iterator, context) {
    var index = 0;
    try {
      this._each(function(value) {
        iterator.call(context, value, index++)
      })
    } catch(e) {
      if(e != $break) {
        throw e
      }
    }
    return this
  }

  function eachSlice(number, iterator, context) {
    var index = -number, slices = [], array = this.toArray();
    if(number < 1) {
      return array
    }
    while((index += number) < array.length) {
      slices.push(array.slice(index, index + number))
    }
    return slices.collect(iterator, context)
  }

  function all(iterator, context) {
    iterator = iterator || Prototype.K;
    var result = true;
    this.each(function(value, index) {
      result = result && !!iterator.call(context, value, index);
      if(!result) {
        throw $break
      }
    });
    return result
  }

  function any(iterator, context) {
    iterator = iterator || Prototype.K;
    var result = false;
    this.each(function(value, index) {
      if( result = !!iterator.call(context, value, index)) {
        throw $break
      }
    });
    return result
  }

  function collect(iterator, context) {
    iterator = iterator || Prototype.K;
    var results = [];
    this.each(function(value, index) {
      results.push(iterator.call(context, value, index))
    });
    return results
  }

  function detect(iterator, context) {
    var result;
    this.each(function(value, index) {
      if(iterator.call(context, value, index)) {
        result = value;
        throw $break
      }
    });
    return result
  }

  function findAll(iterator, context) {
    var results = [];
    this.each(function(value, index) {
      if(iterator.call(context, value, index)) {
        results.push(value)
      }
    });
    return results
  }

  function grep(filter, iterator, context) {
    iterator = iterator || Prototype.K;
    var results = [];
    if(Object.isString(filter)) {
      filter = new RegExp(RegExp.escape(filter))
    }
    this.each(function(value, index) {
      if(filter.match(value)) {
        results.push(iterator.call(context, value, index))
      }
    });
    return results
  }

  function include(object) {
    if(Object.isFunction(this.indexOf)) {
      if(this.indexOf(object) != -1) {
        return true
      }
    }
    var found = false;
    this.each(function(value) {
      if(value == object) {
        found = true;
        throw $break
      }
    });
    return found
  }

  function inGroupsOf(number, fillWith) {
    fillWith = Object.isUndefined(fillWith) ? null : fillWith;
    return this.eachSlice(number, function(slice) {
      while(slice.length < number) {
        slice.push(fillWith)
      }
      return slice
    })
  }

  function inject(memo, iterator, context) {
    this.each(function(value, index) {
      memo = iterator.call(context, memo, value, index)
    });
    return memo
  }

  function invoke(method) {
    var args = $A(arguments).slice(1);
    return this.map(function(value) {
      return value[method].apply(value, args)
    })
  }

  function max(iterator, context) {
    iterator = iterator || Prototype.K;
    var result;
    this.each(function(value, index) {
      value = iterator.call(context, value, index);
      if(result == null || value >= result) {
        result = value
      }
    });
    return result
  }

  function min(iterator, context) {
    iterator = iterator || Prototype.K;
    var result;
    this.each(function(value, index) {
      value = iterator.call(context, value, index);
      if(result == null || value < result) {
        result = value
      }
    });
    return result
  }

  function partition(iterator, context) {
    iterator = iterator || Prototype.K;
    var trues = [], falses = [];
    this.each(function(value, index) {
      (iterator.call(context, value, index) ? trues : falses).push(value)
    });
    return [trues, falses]
  }

  function pluck(property) {
    var results = [];
    this.each(function(value) {
      results.push(value[property])
    });
    return results
  }

  function reject(iterator, context) {
    var results = [];
    this.each(function(value, index) {
      if(!iterator.call(context, value, index)) {
        results.push(value)
      }
    });
    return results
  }

  function sortBy(iterator, context) {
    return this.map(function(value, index) {
      return {
        value : value,
        criteria : iterator.call(context, value, index)
      }
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      return a < b ? -1 : a > b ? 1 : 0
    }).pluck("value")
  }

  function toArray() {
    return this.map()
  }

  function zip() {
    var iterator = Prototype.K, args = $A(arguments);
    if(Object.isFunction(args.last())) {
      iterator = args.pop()
    }
    var collections = [this].concat(args).map($A);
    return this.map(function(value, index) {
      return iterator(collections.pluck(index))
    })
  }

  function size() {
    return this.toArray().length
  }

  function inspect() {
    return "#<Enumerable:" + this.toArray().inspect() + ">"
  }

  return {
    each : each,
    eachSlice : eachSlice,
    all : all,
    every : all,
    any : any,
    some : any,
    collect : collect,
    map : collect,
    detect : detect,
    findAll : findAll,
    select : findAll,
    filter : findAll,
    grep : grep,
    include : include,
    member : include,
    inGroupsOf : inGroupsOf,
    inject : inject,
    invoke : invoke,
    max : max,
    min : min,
    partition : partition,
    pluck : pluck,
    reject : reject,
    sortBy : sortBy,
    toArray : toArray,
    entries : toArray,
    zip : zip,
    size : size,
    inspect : inspect,
    find : detect
  }
})();
function $A(iterable) {
  if(!iterable) {
    return []
  }
  if("toArray" in iterable) {
    return iterable.toArray()
  }
  var length = iterable.length || 0, results = new Array(length);
  while(length--) {
    results[length] = iterable[length]
  }
  return results
}

function $w(string) {
  if(!Object.isString(string)) {
    return []
  }
  string = string.strip();
  return string ? string.split(/\s+/) : []
}
Array.from = $A;
(function() {
  var arrayProto = Array.prototype, slice = arrayProto.slice, _each = arrayProto.forEach;
  function each(iterator) {
    for(var i = 0, length = this.length; i < length; i++) {
      iterator(this[i])
    }
  }

  if(!_each) {
    _each = each
  }
  function clear() {
    this.length = 0;
    return this
  }

  function first() {
    return this[0]
  }

  function last() {
    return this[this.length - 1]
  }

  function compact() {
    return this.select(function(value) {
      return value != null
    })
  }

  function flatten() {
    return this.inject([], function(array, value) {
      if(Object.isArray(value)) {
        return array.concat(value.flatten())
      }
      array.push(value);
      return array
    })
  }

  function without() {
    var values = slice.call(arguments, 0);
    return this.select(function(value) {
      return !values.include(value)
    })
  }

  function reverse(inline) {
    return (inline !== false ? this : this.toArray())._reverse()
  }

  function uniq(sorted) {
    return this.inject([], function(array, value, index) {
      if(0 == index || ( sorted ? array.last() != value : !array.include(value))) {
        array.push(value)
      }
      return array
    })
  }

  function intersect(array) {
    return this.uniq().findAll(function(item) {
      return array.detect(function(value) {
        return item === value
      })
    })
  }

  function clone() {
    return slice.call(this, 0)
  }

  function size() {
    return this.length
  }

  function inspect() {
    return "[" + this.map(Object.inspect).join(", ") + "]"
  }

  function toJSON() {
    var results = [];
    this.each(function(object) {
      var value = Object.toJSON(object);
      if(!Object.isUndefined(value)) {
        results.push(value)
      }
    });
    return "[" + results.join(", ") + "]"
  }

  function indexOf(item, i) {
    i || ( i = 0);
    var length = this.length;
    if(i < 0) {
      i = length + i
    }
    for(; i < length; i++) {
      if(this[i] === item) {
        return i
      }
    }
    return -1
  }

  function lastIndexOf(item, i) {
    i = isNaN(i) ? this.length : (i < 0 ? this.length + i : i) + 1;
    var n = this.slice(0, i).reverse().indexOf(item);
    return (n < 0) ? n : i - n - 1
  }

  function concat() {
    var array = slice.call(this, 0), item;
    for(var i = 0, length = arguments.length; i < length; i++) {
      item = arguments[i];
      if(Object.isArray(item) && !("callee" in item)) {
        for(var j = 0, arrayLength = item.length; j < arrayLength; j++) {
          array.push(item[j])
        }
      } else {
        array.push(item)
      }
    }
    return array
  }
  Object.extend(arrayProto, Enumerable);
  if(!arrayProto._reverse) {
    arrayProto._reverse = arrayProto.reverse
  }
  Object.extend(arrayProto, {
    _each : _each,
    clear : clear,
    first : first,
    last : last,
    compact : compact,
    flatten : flatten,
    without : without,
    reverse : reverse,
    uniq : uniq,
    intersect : intersect,
    clone : clone,
    toArray : clone,
    size : size,
    inspect : inspect,
    toJSON : toJSON
  });
  var CONCAT_ARGUMENTS_BUGGY = (function() {
    return [].concat(arguments)[0][0] !== 1
  })(1, 2);
  if(CONCAT_ARGUMENTS_BUGGY) {
    arrayProto.concat = concat
  }
  if(!arrayProto.indexOf) {
    arrayProto.indexOf = indexOf
  }
  if(!arrayProto.lastIndexOf) {
    arrayProto.lastIndexOf = lastIndexOf
  }
})();
function $H(object) {
  return new Hash(object)
}

var Hash = Class.create(Enumerable, (function() {
  function initialize(object) {
    this._object = Object.isHash(object) ? object.toObject() : Object.clone(object)
  }

  function _each(iterator) {
    for(var key in this._object) {
      var value = this._object[key], pair = [key, value];
      pair.key = key;
      pair.value = value;
      iterator(pair)
    }
  }

  function set(key, value) {
    return this._object[key] = value
  }

  function get(key) {
    if(this._object[key] !== Object.prototype[key]) {
      return this._object[key]
    }
  }

  function unset(key) {
    var value = this._object[key];
    delete this._object[key];
    return value
  }

  function toObject() {
    return Object.clone(this._object)
  }

  function keys() {
    return this.pluck("key")
  }

  function values() {
    return this.pluck("value")
  }

  function index(value) {
    var match = this.detect(function(pair) {
      return pair.value === value
    });
    return match && match.key
  }

  function merge(object) {
    return this.clone().update(object)
  }

  function update(object) {
    return new Hash(object).inject(this, function(result, pair) {
      result.set(pair.key, pair.value);
      return result
    })
  }

  function toQueryPair(key, value) {
    if(Object.isUndefined(value)) {
      return key
    }
    return key + "=" + encodeURIComponent(String.interpret(value))
  }

  function toQueryString() {
    return this.inject([], function(results, pair) {
      var key = encodeURIComponent(pair.key), values = pair.value;
      if(values && typeof values == "object") {
        if(Object.isArray(values)) {
          return results.concat(values.map(toQueryPair.curry(key)))
        }
      } else {
        results.push(toQueryPair(key, values))
      }
      return results
    }).join("&")
  }

  function inspect() {
    return "#<Hash:{" + this.map(function(pair) {
      return pair.map(Object.inspect).join(": ")
    }).join(", ") + "}>"
  }

  function toJSON() {
    return Object.toJSON(this.toObject())
  }

  function clone() {
    return new Hash(this)
  }

  return {
    initialize : initialize,
    _each : _each,
    set : set,
    get : get,
    unset : unset,
    toObject : toObject,
    toTemplateReplacements : toObject,
    keys : keys,
    values : values,
    index : index,
    merge : merge,
    update : update,
    toQueryString : toQueryString,
    inspect : inspect,
    toJSON : toJSON,
    clone : clone
  }
})());
Hash.from = $H;
Object.extend(Number.prototype, (function() {
  function toColorPart() {
    return this.toPaddedString(2, 16)
  }

  function succ() {
    return this + 1
  }

  function times(iterator, context) {
    $R(0, this, true).each(iterator, context);
    return this
  }

  function toPaddedString(length, radix) {
    var string = this.toString(radix || 10);
    return "0".times(length - string.length) + string
  }

  function toJSON() {
    return isFinite(this) ? this.toString() : "null"
  }

  function abs() {
    return Math.abs(this)
  }

  function round() {
    return Math.round(this)
  }

  function ceil() {
    return Math.ceil(this)
  }

  function floor() {
    return Math.floor(this)
  }

  return {
    toColorPart : toColorPart,
    succ : succ,
    times : times,
    toPaddedString : toPaddedString,
    toJSON : toJSON,
    abs : abs,
    round : round,
    ceil : ceil,
    floor : floor
  }
})());
function $R(start, end, exclusive) {
  return new ObjectRange(start, end, exclusive)
}

var ObjectRange = Class.create(Enumerable, (function() {
  function initialize(start, end, exclusive) {
    this.start = start;
    this.end = end;
    this.exclusive = exclusive
  }

  function _each(iterator) {
    var value = this.start;
    while(this.include(value)) {
      iterator(value);
      value = value.succ()
    }
  }

  function include(value) {
    if(value < this.start) {
      return false
    }
    if(this.exclusive) {
      return value < this.end
    }
    return value <= this.end
  }

  return {
    initialize : initialize,
    _each : _each,
    include : include
  }
})());
var Ajax = {
  getTransport : function() {
    return Try.these(function() {
      return new XMLHttpRequest()
    }, function() {
      return new ActiveXObject("Msxml2.XMLHTTP")
    }, function() {
      return new ActiveXObject("Microsoft.XMLHTTP")
    }) || false
  },
  activeRequestCount : 0
};
Ajax.Responders = {
  responders : [],
  _each : function(iterator) {
    this.responders._each(iterator)
  },
  register : function(responder) {
    if(!this.include(responder)) {
      this.responders.push(responder)
    }
  },
  unregister : function(responder) {
    this.responders = this.responders.without(responder)
  },
  dispatch : function(callback, request, transport, json) {
    this.each(function(responder) {
      if(Object.isFunction(responder[callback])) {
        try {
          responder[callback].apply(responder, [request, transport, json])
        } catch(e) {
        }
      }
    })
  }
};
Object.extend(Ajax.Responders, Enumerable);
Ajax.Responders.register({
  onCreate : function() {
    Ajax.activeRequestCount++
  },
  onComplete : function() {
    Ajax.activeRequestCount--
  }
});
Ajax.Base = Class.create({
  initialize : function(options) {
    this.options = {
      method : "post",
      asynchronous : true,
      contentType : "application/x-www-form-urlencoded",
      encoding : "UTF-8",
      parameters : "",
      evalJSON : true,
      evalJS : true
    };
    Object.extend(this.options, options || {});
    this.options.method = this.options.method.toLowerCase();
    if(Object.isString(this.options.parameters)) {
      this.options.parameters = this.options.parameters.toQueryParams()
    } else {
      if(Object.isHash(this.options.parameters)) {
        this.options.parameters = this.options.parameters.toObject()
      }
    }
  }
});
Ajax.Request = Class.create(Ajax.Base, {
  _complete : false,
  initialize : function($super, url, options) {
    $super(options);
    this.transport = Ajax.getTransport();
    this.request(url)
  },
  request : function(url) {
    this.url = url;
    this.method = this.options.method;
    var params = Object.clone(this.options.parameters);
    if(!["get", "post"].include(this.method)) {
      params["_method"] = this.method;
      this.method = "post"
    }
    this.parameters = params;
    if( params = Object.toQueryString(params)) {
      if(this.method == "get") {
        this.url += (this.url.include("?") ? "&" : "?") + params
      } else {
        if(/Konqueror|Safari|KHTML/.test(navigator.userAgent)) {
          params += "&_="
        }
      }
    }
    try {
      var response = new Ajax.Response(this);
      if(this.options.onCreate) {
        this.options.onCreate(response)
      }
      Ajax.Responders.dispatch("onCreate", this, response);
      this.transport.open(this.method.toUpperCase(), this.url, this.options.asynchronous);
      if(this.options.asynchronous) {
        this.respondToReadyState.bind(this).defer(1)
      }
      this.transport.onreadystatechange = this.onStateChange.bind(this);
      this.setRequestHeaders();
      this.body = this.method == "post" ? (this.options.postBody || params) : null;
      this.transport.send(this.body);
      if(!this.options.asynchronous && this.transport.overrideMimeType) {
        this.onStateChange()
      }
    } catch(e) {
      this.dispatchException(e)
    }
  },
  onStateChange : function() {
    var readyState = this.transport.readyState;
    if(readyState > 1 && !((readyState == 4) && this._complete)) {
      this.respondToReadyState(this.transport.readyState)
    }
  },
  setRequestHeaders : function() {
    var headers = {
      "X-Requested-With" : "XMLHttpRequest",
      "X-Prototype-Version" : Prototype.Version,
      "Accept" : "text/javascript, text/html, application/xml, text/xml, */*"
    };
    if(this.method == "post") {
      headers["Content-type"] = this.options.contentType + (this.options.encoding ? "; charset=" + this.options.encoding : "");
      if(this.transport.overrideMimeType && (navigator.userAgent.match(/Gecko\/(\d{4})/)||[0,2005])[1] < 2005) {
        headers["Connection"] = "close"
      }
    }
    if( typeof this.options.requestHeaders == "object") {
      var extras = this.options.requestHeaders;
      if(Object.isFunction(extras.push)) {
        for(var i = 0, length = extras.length; i < length; i += 2) {
          headers[extras[i]] = extras[i + 1]
        }
      } else {
        $H(extras).each(function(pair) {
          headers[pair.key] = pair.value
        })
      }
    }
    for(var name in headers) {
      this.transport.setRequestHeader(name, headers[name])
    }
  },
  success : function() {
    var status = this.getStatus();
    return !status || (status >= 200 && status < 300)
  },
  getStatus : function() {
    try {
      return this.transport.status || 0
    } catch(e) {
      return 0
    }
  },
  respondToReadyState : function(readyState) {
    var state = Ajax.Request.Events[readyState], response = new Ajax.Response(this);
    if(state == "Complete") {
      try {
        this._complete = true;
        (this.options["on" + response.status] || this.options["on" + (this.success() ? "Success" : "Failure")] || Prototype.emptyFunction)(response, response.headerJSON)
      } catch(e) {
        this.dispatchException(e)
      }
      var contentType = response.getHeader("Content-type");
      if(this.options.evalJS == "force" || (this.options.evalJS && this.isSameOrigin() && contentType && contentType.match(/^\s*(text|application)\/(x-)?(java|ecma)script(;.*)?\s*$/i))) {
        this.evalResponse()
      }
    }
    try {(this.options["on" + state] || Prototype.emptyFunction)(response, response.headerJSON);
      Ajax.Responders.dispatch("on" + state, this, response, response.headerJSON)
    } catch(e) {
      this.dispatchException(e)
    }
    if(state == "Complete") {
      this.transport.onreadystatechange = Prototype.emptyFunction
    }
  },
  isSameOrigin : function() {
    var m = this.url.match(/^\s*https?:\/\/[^\/]*/);
    return !m || (m[0] == "#{protocol}//#{domain}#{port}".interpolate({
      protocol : location.protocol,
      domain : document.domain,
      port : location.port ? ":" + location.port : ""
    }))
  },
  getHeader : function(name) {
    try {
      return this.transport.getResponseHeader(name) || null
    } catch(e) {
      return null
    }
  },
  evalResponse : function() {
    try {
      return eval((this.transport.responseText || "").unfilterJSON())
    } catch(e) {
      this.dispatchException(e)
    }
  },
  dispatchException : function(exception) {(this.options.onException || Prototype.emptyFunction)(this, exception);
    Ajax.Responders.dispatch("onException", this, exception)
  }
});
Ajax.Request.Events = ["Uninitialized", "Loading", "Loaded", "Interactive", "Complete"];
Ajax.Response = Class.create({
  initialize : function(request) {
    this.request = request;
    var transport = this.transport = request.transport, readyState = this.readyState = transport.readyState;
    if((readyState > 2 && !Prototype.Browser.IE) || readyState == 4) {
      this.status = this.getStatus();
      this.statusText = this.getStatusText();
      this.responseText = String.interpret(transport.responseText);
      this.headerJSON = this._getHeaderJSON()
    }
    if(readyState == 4) {
      var xml = transport.responseXML;
      this.responseXML = Object.isUndefined(xml) ? null : xml;
      this.responseJSON = this._getResponseJSON()
    }
  },
  status : 0,
  statusText : "",
  getStatus : Ajax.Request.prototype.getStatus,
  getStatusText : function() {
    try {
      return this.transport.statusText || ""
    } catch(e) {
      return ""
    }
  },
  getHeader : Ajax.Request.prototype.getHeader,
  getAllHeaders : function() {
    try {
      return this.getAllResponseHeaders()
    } catch(e) {
      return null
    }
  },
  getResponseHeader : function(name) {
    return this.transport.getResponseHeader(name)
  },
  getAllResponseHeaders : function() {
    return this.transport.getAllResponseHeaders()
  },
  _getHeaderJSON : function() {
    var json = this.getHeader("X-JSON");
    if(!json) {
      return null
    }
    json = decodeURIComponent(escape(json));
    try {
      return json.evalJSON(this.request.options.sanitizeJSON || !this.request.isSameOrigin())
    } catch(e) {
      this.request.dispatchException(e)
    }
  },
  _getResponseJSON : function() {
    var options = this.request.options;
    if(!options.evalJSON || (options.evalJSON != "force" && !(this.getHeader("Content-type") || "").include("application/json")) || this.responseText.blank()) {
      return null
    }
    try {
      return this.responseText.evalJSON(options.sanitizeJSON || !this.request.isSameOrigin())
    } catch(e) {
      this.request.dispatchException(e)
    }
  }
});
Ajax.Updater = Class.create(Ajax.Request, {
  initialize : function($super, container, url, options) {
    this.container = {
      success : (container.success || container),
      failure : (container.failure || (container.success ? null : container))
    };
    options = Object.clone(options);
    var onComplete = options.onComplete;
    options.onComplete = (function(response, json) {
      this.updateContent(response.responseText);
      if(Object.isFunction(onComplete)) {
        onComplete(response, json)
      }
    }).bind(this);
    $super(url, options)
  },
  updateContent : function(responseText) {
    var receiver = this.container[this.success() ? "success" : "failure"], options = this.options;
    if(!options.evalScripts) {
      responseText = responseText.stripScripts()
    }
    if( receiver = $(receiver)) {
      if(options.insertion) {
        if(Object.isString(options.insertion)) {
          var insertion = {};
          insertion[options.insertion] = responseText;
          receiver.insert(insertion)
        } else {
          options.insertion(receiver, responseText)
        }
      } else {
        receiver.update(responseText)
      }
    }
  }
});
Ajax.PeriodicalUpdater = Class.create(Ajax.Base, {
  initialize : function($super, container, url, options) {
    $super(options);
    this.onComplete = this.options.onComplete;
    this.frequency = (this.options.frequency || 2);
    this.decay = (this.options.decay || 1);
    this.updater = {};
    this.container = container;
    this.url = url;
    this.start()
  },
  start : function() {
    this.options.onComplete = this.updateComplete.bind(this);
    this.onTimerEvent()
  },
  stop : function() {
    this.updater.options.onComplete = undefined;
    clearTimeout(this.timer);
    (this.onComplete || Prototype.emptyFunction).apply(this, arguments)
  },
  updateComplete : function(response) {
    if(this.options.decay) {
      this.decay = (response.responseText == this.lastText ? this.decay * this.options.decay : 1);
      this.lastText = response.responseText
    }
    this.timer = this.onTimerEvent.bind(this).delay(this.decay * this.frequency)
  },
  onTimerEvent : function() {
    this.updater = new Ajax.Updater(this.container, this.url, this.options)
  }
});
function $(element) {
  if(arguments.length > 1) {
    for(var i = 0, elements = [], length = arguments.length; i < length; i++) {
      elements.push($(arguments[i]))
    }
    return elements
  }
  if(Object.isString(element)) {
    element = document.getElementById(element)
  }
  return Element.extend(element)
}

if(Prototype.BrowserFeatures.XPath) {
  document._getElementsByXPath = function(expression, parentElement) {
    var results = [];
    var query = document.evaluate(expression, $(parentElement) || document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    for(var i = 0, length = query.snapshotLength; i < length; i++) {
      results.push(Element.extend(query.snapshotItem(i)))
    }
    return results
  }
}
if(!window.Node) {
  var Node = {}
}
if(!Node.ELEMENT_NODE) {
  Object.extend(Node, {
    ELEMENT_NODE : 1,
    ATTRIBUTE_NODE : 2,
    TEXT_NODE : 3,
    CDATA_SECTION_NODE : 4,
    ENTITY_REFERENCE_NODE : 5,
    ENTITY_NODE : 6,
    PROCESSING_INSTRUCTION_NODE : 7,
    COMMENT_NODE : 8,
    DOCUMENT_NODE : 9,
    DOCUMENT_TYPE_NODE : 10,
    DOCUMENT_FRAGMENT_NODE : 11,
    NOTATION_NODE : 12
  })
}(function(global) {
  var SETATTRIBUTE_IGNORES_NAME = (function() {
    var elForm = document.createElement("form");
    var elInput = document.createElement("input");
    var root = document.documentElement;
    elInput.setAttribute("name", "test");
    elForm.appendChild(elInput);
    root.appendChild(elForm);
    var isBuggy = elForm.elements ? ( typeof elForm.elements.test == "undefined") : null;
    root.removeChild(elForm);
    elForm = elInput = null;
    return isBuggy
  })();
  var element = global.Element;
  global.Element = function(tagName, attributes) {
    attributes = attributes || {};
    tagName = tagName.toLowerCase();
    var cache = Element.cache;
    if(SETATTRIBUTE_IGNORES_NAME && attributes.name) {
      tagName = "<" + tagName + ' name="' + attributes.name + '">';
      delete attributes.name;
      return Element.writeAttribute(document.createElement(tagName), attributes)
    }
    if(!cache[tagName]) {
      cache[tagName] = Element.extend(document.createElement(tagName))
    }
    return Element.writeAttribute(cache[tagName].cloneNode(false), attributes)
  };
  Object.extend(global.Element, element || {});
  if(element) {
    global.Element.prototype = element.prototype
  }
})(this);
Element.cache = {};
Element.idCounter = 1;
Element.Methods = {
  visible : function(element) {
    return $(element).style.display != "none"
  },
  toggle : function(element) {
    element = $(element);
    Element[Element.visible(element)?"hide":"show"](element);
    return element
  },
  hide : function(element) {
    element = $(element);
    element.style.display = "none";
    return element
  },
  show : function(element) {
    element = $(element);
    element.style.display = "";
    return element
  },
  remove : function(element) {
    element = $(element);
    element.parentNode.removeChild(element);
    return element
  },
  update : (function() {
    var SELECT_ELEMENT_INNERHTML_BUGGY = (function() {
      var el = document.createElement("select"), isBuggy = true;
      el.innerHTML = '<option value="test">test</option>';
      if(el.options && el.options[0]) {
        isBuggy = el.options[0].nodeName.toUpperCase() !== "OPTION"
      }
      el = null;
      return isBuggy
    })();
    var TABLE_ELEMENT_INNERHTML_BUGGY = (function() {
      try {
        var el = document.createElement("table");
        if(el && el.tBodies) {
          el.innerHTML = "<tbody><tr><td>test</td></tr></tbody>";
          var isBuggy = typeof el.tBodies[0] == "undefined";
          el = null;
          return isBuggy
        }
      } catch(e) {
        return true
      }
    })();
    var SCRIPT_ELEMENT_REJECTS_TEXTNODE_APPENDING = (function() {
      var s = document.createElement("script"), isBuggy = false;
      try {
        s.appendChild(document.createTextNode(""));
        isBuggy = !s.firstChild || s.firstChild && s.firstChild.nodeType !== 3
      } catch(e) {
        isBuggy = true
      }
      s = null;
      return isBuggy
    })();
    function update(element, content) {
      element = $(element);
      if(content && content.toElement) {
        content = content.toElement()
      }
      if(Object.isElement(content)) {
        return element.update().insert(content)
      }
      content = Object.toHTML(content);
      var tagName = element.tagName.toUpperCase();
      if(tagName === "SCRIPT" && SCRIPT_ELEMENT_REJECTS_TEXTNODE_APPENDING) {
        element.text = content;
        return element
      }
      if(SELECT_ELEMENT_INNERHTML_BUGGY || TABLE_ELEMENT_INNERHTML_BUGGY) {
        if( tagName in Element._insertionTranslations.tags) {
          $A(element.childNodes).each(function(node) {
            element.removeChild(node)
          });
          Element._getContentFromAnonymousElement(tagName, content.stripScripts()).each(function(node) {
            element.appendChild(node)
          })
        } else {
          element.innerHTML = content.stripScripts()
        }
      } else {
        element.innerHTML = content.stripScripts()
      }
      content.evalScripts.bind(content).defer();
      return element
    }

    return update
  })(),
  replace : function(element, content) {
    element = $(element);
    if(content && content.toElement) {
      content = content.toElement()
    } else {
      if(!Object.isElement(content)) {
        content = Object.toHTML(content);
        var range = element.ownerDocument.createRange();
        range.selectNode(element);
        content.evalScripts.bind(content).defer();
        content = range.createContextualFragment(content.stripScripts())
      }
    }
    element.parentNode.replaceChild(content, element);
    return element
  },
  insert : function(element, insertions) {
    element = $(element);
    if(Object.isString(insertions) || Object.isNumber(insertions) || Object.isElement(insertions) || (insertions && (insertions.toElement || insertions.toHTML))) {
      insertions = {
        bottom : insertions
      }
    }
    var content, insert, tagName, childNodes;
    for(var position in insertions) {
      content = insertions[position];
      position = position.toLowerCase();
      insert = Element._insertionTranslations[position];
      if(content && content.toElement) {
        content = content.toElement()
      }
      if(Object.isElement(content)) {
        insert(element, content);
        continue
      }
      content = Object.toHTML(content);
      tagName = ((position == "before" || position == "after") ? element.parentNode : element).tagName.toUpperCase();
      childNodes = Element._getContentFromAnonymousElement(tagName, content.stripScripts());
      if(position == "top" || position == "after") {
        childNodes.reverse()
      }
      childNodes.each(insert.curry(element));
      content.evalScripts.bind(content).defer()
    }
    return element
  },
  wrap : function(element, wrapper, attributes) {
    element = $(element);
    if(Object.isElement(wrapper)) {
      $(wrapper).writeAttribute(attributes || {})
    } else {
      if(Object.isString(wrapper)) {
        wrapper = new Element(wrapper, attributes)
      } else {
        wrapper = new Element("div", wrapper)
      }
    }
    if(element.parentNode) {
      element.parentNode.replaceChild(wrapper, element)
    }
    wrapper.appendChild(element);
    return wrapper
  },
  inspect : function(element) {
    element = $(element);
    var result = "<" + element.tagName.toLowerCase();
    $H({
      "id" : "id",
      "className" : "class"
    }).each(function(pair) {
      var property = pair.first(), attribute = pair.last();
      var value = (element[property] || "").toString();
      if(value) {
        result += " " + attribute + "=" + value.inspect(true)
      }
    });
    return result + ">"
  },
  recursivelyCollect : function(element, property) {
    element = $(element);
    var elements = [];
    while( element = element[property]) {
      if(element.nodeType == 1) {
        elements.push(Element.extend(element))
      }
    }
    return elements
  },
  ancestors : function(element) {
    return $(element).recursivelyCollect("parentNode")
  },
  descendants : function(element) {
    return Element.select(element, "*")
  },
  firstDescendant : function(element) {
    element = $(element).firstChild;
    while(element && element.nodeType != 1) {
      element = element.nextSibling
    }
    return $(element)
  },
  immediateDescendants : function(element) {
    if(!( element = $(element).firstChild)) {
      return []
    }
    while(element && element.nodeType != 1) {
      element = element.nextSibling
    }
    if(element) {
      return [element].concat($(element).nextSiblings())
    }
    return []
  },
  previousSiblings : function(element) {
    return $(element).recursivelyCollect("previousSibling")
  },
  nextSiblings : function(element) {
    return $(element).recursivelyCollect("nextSibling")
  },
  siblings : function(element) {
    element = $(element);
    return element.previousSiblings().reverse().concat(element.nextSiblings())
  },
  match : function(element, selector) {
    if(Object.isString(selector)) {
      selector = new Selector(selector)
    }
    return selector.match($(element))
  },
  up : function(element, expression, index) {
    element = $(element);
    if(arguments.length == 1) {
      return $(element.parentNode)
    }
    var ancestors = element.ancestors();
    return Object.isNumber(expression) ? ancestors[expression] : Selector.findElement(ancestors, expression, index)
  },
  down : function(element, expression, index) {
    element = $(element);
    if(arguments.length == 1) {
      return element.firstDescendant()
    }
    return Object.isNumber(expression) ? element.descendants()[expression] : Element.select(element,expression)[index || 0]
  },
  previous : function(element, expression, index) {
    element = $(element);
    if(arguments.length == 1) {
      return $(Selector.handlers.previousElementSibling(element))
    }
    var previousSiblings = element.previousSiblings();
    return Object.isNumber(expression) ? previousSiblings[expression] : Selector.findElement(previousSiblings, expression, index)
  },
  next : function(element, expression, index) {
    element = $(element);
    if(arguments.length == 1) {
      return $(Selector.handlers.nextElementSibling(element))
    }
    var nextSiblings = element.nextSiblings();
    return Object.isNumber(expression) ? nextSiblings[expression] : Selector.findElement(nextSiblings, expression, index)
  },
  select : function() {
    var args = $A(arguments), element = $(args.shift());
    return Selector.findChildElements(element, args)
  },
  adjacent : function() {
    var args = $A(arguments), element = $(args.shift());
    return Selector.findChildElements(element.parentNode, args).without(element)
  },
  identify : function(element) {
    element = $(element);
    var id = element.readAttribute("id");
    if(id) {
      return id
    }
    do {
      id = "anonymous_element_" + Element.idCounter++
    } while($(id));
    element.writeAttribute("id", id);
    return id
  },
  readAttribute : (function() {
    var iframeGetAttributeThrowsError = (function() {
      var el = document.createElement("iframe"), isBuggy = false;
      document.documentElement.appendChild(el);
      try {
        el.getAttribute("type", 2)
      } catch(e) {
        isBuggy = true
      }
      document.documentElement.removeChild(el);
      el = null;
      return isBuggy
    })();
    return function(element, name) {
      element = $(element);
      if(iframeGetAttributeThrowsError && name === "type" && element.tagName.toUpperCase() == "IFRAME") {
        return element.getAttribute("type")
      }
      if(Prototype.Browser.IE) {
        var t = Element._attributeTranslations.read;
        if(t.values[name]) {
          return t.values[name](element, name)
        }
        if(t.names[name]) {
          name = t.names[name]
        }
        if(name.include(":")) {
          return (!element.attributes || !element.attributes[name]) ? null : element.attributes[name].value
        }
      }
      return element.getAttribute(name)
    }
  })(),
  writeAttribute : function(element, name, value) {
    element = $(element);
    var attributes = {}, t = Element._attributeTranslations.write;
    if( typeof name == "object") {
      attributes = name
    } else {
      attributes[name] = Object.isUndefined(value) ? true : value
    }
    for(var attr in attributes) {
      name = t.names[attr] || attr;
      value = attributes[attr];
      if(t.values[attr]) {
        name = t.values[attr](element, value)
      }
      if(value === false || value === null) {
        element.removeAttribute(name)
      } else {
        if(value === true) {
          element.setAttribute(name, name)
        } else {
          element.setAttribute(name, value)
        }
      }
    }
    return element
  },
  getHeight : function(element) {
    return $(element).getDimensions().height
  },
  getWidth : function(element) {
    return $(element).getDimensions().width
  },
  classNames : function(element) {
    return new Element.ClassNames(element)
  },
  hasClassName : function(element, className) {
    if(!( element = $(element))) {
      return
    }
    var elementClassName = element.className;
    return (elementClassName.length > 0 && (elementClassName == className || new RegExp("(^|\\s)" + className + "(\\s|$)").test(elementClassName)))
  },
  addClassName : function(element, className) {
    if(!( element = $(element))) {
      return
    }
    if(!element.hasClassName(className)) {
      element.className += (element.className ? " " : "") + className
    }
    return element
  },
  removeClassName : function(element, className) {
    if(!( element = $(element))) {
      return
    }
    element.className = element.className.replace(new RegExp("(^|\\s+)" + className + "(\\s+|$)"), " ").strip();
    return element
  },
  toggleClassName : function(element, className) {
    if(!( element = $(element))) {
      return
    }
    return element[element.hasClassName(className)?"removeClassName":"addClassName"](className)
  },
  cleanWhitespace : function(element) {
    element = $(element);
    var node = element.firstChild;
    while(node) {
      var nextNode = node.nextSibling;
      if(node.nodeType == 3 && !/\S/.test(node.nodeValue)) {
        element.removeChild(node)
      }
      node = nextNode
    }
    return element
  },
  empty : function(element) {
    return $(element).innerHTML.blank()
  },
  descendantOf : function(element, ancestor) { element = $(element), ancestor = $(ancestor);
    if(element.compareDocumentPosition) {
      return (element.compareDocumentPosition(ancestor) & 8) === 8
    }
    if(ancestor.contains) {
      return ancestor.contains(element) && ancestor !== element
    }
    while( element = element.parentNode) {
      if(element == ancestor) {
        return true
      }
    }
    return false
  },
  scrollTo : function(element) {
    element = $(element);
    var pos = element.cumulativeOffset();
    window.scrollTo(pos[0], pos[1]);
    return element
  },
  getStyle : function(element, style) {
    element = $(element);
    style = style == "float" ? "cssFloat" : style.camelize();
    var value = element.style[style];
    if(!value || value == "auto") {
      var css = document.defaultView.getComputedStyle(element, null);
      value = css ? css[style] : null
    }
    if(style == "opacity") {
      return value ? parseFloat(value) : 1
    }
    return value == "auto" ? null : value
  },
  getOpacity : function(element) {
    return $(element).getStyle("opacity")
  },
  setStyle : function(element, styles) {
    element = $(element);
    var elementStyle = element.style, match;
    if(Object.isString(styles)) {
      element.style.cssText += ";" + styles;
      return styles.include("opacity") ? element.setOpacity(styles.match(/opacity:\s*(\d?\.?\d*)/)[1]) : element
    }
    for(var property in styles) {
      if(property == "opacity") {
        element.setOpacity(styles[property])
      } else {
        elementStyle[(property == "float" || property == "cssFloat") ? (Object.isUndefined(elementStyle.styleFloat) ? "cssFloat" : "styleFloat") : property] = styles[property]
      }
    }
    return element
  },
  setOpacity : function(element, value) {
    element = $(element);
    element.style.opacity = (value == 1 || value === "") ? "" : (value < 0.00001) ? 0 : value;
    return element
  },
  getDimensions : function(element) {
    element = $(element);
    var display = element.getStyle("display");
    if(display != "none" && display != null) {
      return {
        width : element.offsetWidth,
        height : element.offsetHeight
      }
    }
    var els = element.style;
    var originalVisibility = els.visibility;
    var originalPosition = els.position;
    var originalDisplay = els.display;
    els.visibility = "hidden";
    if(originalPosition != "fixed") {
      els.position = "absolute"
    }
    els.display = "block";
    var originalWidth = element.clientWidth;
    var originalHeight = element.clientHeight;
    els.display = originalDisplay;
    els.position = originalPosition;
    els.visibility = originalVisibility;
    return {
      width : originalWidth,
      height : originalHeight
    }
  },
  makePositioned : function(element) {
    element = $(element);
    var pos = Element.getStyle(element, "position");
    if(pos == "static" || !pos) {
      element._madePositioned = true;
      element.style.position = "relative";
      if(Prototype.Browser.Opera) {
        element.style.top = 0;
        element.style.left = 0
      }
    }
    return element
  },
  undoPositioned : function(element) {
    element = $(element);
    if(element._madePositioned) {
      element._madePositioned = undefined;
      element.style.position = element.style.top = element.style.left = element.style.bottom = element.style.right = ""
    }
    return element
  },
  makeClipping : function(element) {
    element = $(element);
    if(element._overflow) {
      return element
    }
    element._overflow = Element.getStyle(element, "overflow") || "auto";
    if(element._overflow !== "hidden") {
      element.style.overflow = "hidden"
    }
    return element
  },
  undoClipping : function(element) {
    element = $(element);
    if(!element._overflow) {
      return element
    }
    element.style.overflow = element._overflow == "auto" ? "" : element._overflow;
    element._overflow = null;
    return element
  },
  cumulativeOffset : function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop || 0;
      valueL += element.offsetLeft || 0;
      element = element.offsetParent
    } while(element);
    return Element._returnOffset(valueL, valueT)
  },
  positionedOffset : function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.offsetTop || 0;
      valueL += element.offsetLeft || 0;
      element = element.offsetParent;
      if(element) {
        if(element.tagName.toUpperCase() == "BODY") {
          break
        }
        var p = Element.getStyle(element, "position");
        if(p !== "static") {
          break
        }
      }
    } while(element);
    return Element._returnOffset(valueL, valueT)
  },
  absolutize : function(element) {
    element = $(element);
    if(element.getStyle("position") == "absolute") {
      return element
    }
    var offsets = element.positionedOffset();
    var top = offsets[1];
    var left = offsets[0];
    var width = element.clientWidth;
    var height = element.clientHeight;
    element._originalLeft = left - parseFloat(element.style.left || 0);
    element._originalTop = top - parseFloat(element.style.top || 0);
    element._originalWidth = element.style.width;
    element._originalHeight = element.style.height;
    element.style.position = "absolute";
    element.style.top = top + "px";
    element.style.left = left + "px";
    element.style.width = width + "px";
    element.style.height = height + "px";
    return element
  },
  relativize : function(element) {
    element = $(element);
    if(element.getStyle("position") == "relative") {
      return element
    }
    element.style.position = "relative";
    var top = parseFloat(element.style.top || 0) - (element._originalTop || 0);
    var left = parseFloat(element.style.left || 0) - (element._originalLeft || 0);
    element.style.top = top + "px";
    element.style.left = left + "px";
    element.style.height = element._originalHeight;
    element.style.width = element._originalWidth;
    return element
  },
  cumulativeScrollOffset : function(element) {
    var valueT = 0, valueL = 0;
    do {
      valueT += element.scrollTop || 0;
      valueL += element.scrollLeft || 0;
      element = element.parentNode
    } while(element);
    return Element._returnOffset(valueL, valueT)
  },
  getOffsetParent : function(element) {
    if(element.offsetParent) {
      return $(element.offsetParent)
    }
    if(element == document.body) {
      return $(element)
    }
    while(( element = element.parentNode) && element != document.body) {
      if(Element.getStyle(element, "position") != "static") {
        return $(element)
      }
    }
    return $(document.body)
  },
  viewportOffset : function(forElement) {
    var valueT = 0, valueL = 0;
    var element = forElement;
    do {
      valueT += element.offsetTop || 0;
      valueL += element.offsetLeft || 0;
      if(element.offsetParent == document.body && Element.getStyle(element, "position") == "absolute") {
        break
      }
    } while(element=element.offsetParent);
    element = forElement;
    do {
      if(!Prototype.Browser.Opera || (element.tagName && (element.tagName.toUpperCase() == "BODY"))) {
        valueT -= element.scrollTop || 0;
        valueL -= element.scrollLeft || 0
      }
    } while(element=element.parentNode);
    return Element._returnOffset(valueL, valueT)
  },
  clonePosition : function(element, source) {
    var options = Object.extend({
      setLeft : true,
      setTop : true,
      setWidth : true,
      setHeight : true,
      offsetTop : 0,
      offsetLeft : 0
    }, arguments[2] || {});
    source = $(source);
    var p = source.viewportOffset();
    element = $(element);
    var delta = [0, 0];
    var parent = null;
    if(Element.getStyle(element, "position") == "absolute") {
      parent = element.getOffsetParent();
      delta = parent.viewportOffset()
    }
    if(parent == document.body) {
      delta[0] -= document.body.offsetLeft;
      delta[1] -= document.body.offsetTop
    }
    if(options.setLeft) {
      element.style.left = (p[0] - delta[0] + options.offsetLeft) + "px"
    }
    if(options.setTop) {
      element.style.top = (p[1] - delta[1] + options.offsetTop) + "px"
    }
    if(options.setWidth) {
      element.style.width = source.offsetWidth + "px"
    }
    if(options.setHeight) {
      element.style.height = source.offsetHeight + "px"
    }
    return element
  }
};
Object.extend(Element.Methods, {
  getElementsBySelector : Element.Methods.select,
  childElements : Element.Methods.immediateDescendants
});
Element._attributeTranslations = {
  write : {
    names : {
      className : "class",
      htmlFor : "for"
    },
    values : {}
  }
};
if(Prototype.Browser.Opera) {
  Element.Methods.getStyle = Element.Methods.getStyle.wrap(function(proceed, element, style) {
    switch(style) {
      case"left":
      case"top":
      case"right":
      case"bottom":
        if(proceed(element, "position") === "static") {
          return null
        }
      case"height":
      case"width":
        if(!Element.visible(element)) {
          return null
        }
        var dim = parseInt(proceed(element, style), 10);
        if(dim !== element["offset" + style.capitalize()]) {
          return dim + "px"
        }
        var properties;
        if(style === "height") {
          properties = ["border-top-width", "padding-top", "padding-bottom", "border-bottom-width"]
        } else {
          properties = ["border-left-width", "padding-left", "padding-right", "border-right-width"]
        }
        return properties.inject(dim, function(memo, property) {
          var val = proceed(element, property);
          return val === null ? memo : memo - parseInt(val, 10)
        }) + "px";
      default:
        return proceed(element, style)
    }
  });
  Element.Methods.readAttribute = Element.Methods.readAttribute.wrap(function(proceed, element, attribute) {
    if(attribute === "title") {
      return element.title
    }
    return proceed(element, attribute)
  })
} else {
  if(Prototype.Browser.IE) {
    Element.Methods.getOffsetParent = Element.Methods.getOffsetParent.wrap(function(proceed, element) {
      element = $(element);
      try {
        element.offsetParent
      } catch(e) {
        return $(document.body)
      }
      var position = element.getStyle("position");
      if(position !== "static") {
        return proceed(element)
      }
      element.setStyle({
        position : "relative"
      });
      var value = proceed(element);
      element.setStyle({
        position : position
      });
      return value
    });
    $w("positionedOffset viewportOffset").each(function(method) {
      Element.Methods[method] = Element.Methods[method].wrap(function(proceed, element) {
        element = $(element);
        try {
          element.offsetParent
        } catch(e) {
          return Element._returnOffset(0, 0)
        }
        var position = element.getStyle("position");
        if(position !== "static") {
          return proceed(element)
        }
        var offsetParent = element.getOffsetParent();
        if(offsetParent && offsetParent.getStyle("position") === "fixed") {
          offsetParent.setStyle({
            zoom : 1
          })
        }
        element.setStyle({
          position : "relative"
        });
        var value = proceed(element);
        element.setStyle({
          position : position
        });
        return value
      })
    });
    Element.Methods.cumulativeOffset = Element.Methods.cumulativeOffset.wrap(function(proceed, element) {
      try {
        element.offsetParent
      } catch(e) {
        return Element._returnOffset(0, 0)
      }
      return proceed(element)
    });
    Element.Methods.getStyle = function(element, style) {
      element = $(element);
      style = (style == "float" || style == "cssFloat") ? "styleFloat" : style.camelize();
      var value = element.style[style];
      if(!value && element.currentStyle) {
        value = element.currentStyle[style]
      }
      if(style == "opacity") {
        if( value = (element.getStyle("filter") || "").match(/alpha\(opacity=(.*)\)/)) {
          if(value[1]) {
            return parseFloat(value[1]) / 100
          }
        }
        return 1
      }
      if(value == "auto") {
        if((style == "width" || style == "height") && (element.getStyle("display") != "none")) {
          return element["offset" + style.capitalize()] + "px"
        }
        return null
      }
      return value
    };
    Element.Methods.setOpacity = function(element, value) {
      function stripAlpha(filter) {
        return filter.replace(/alpha\([^\)]*\)/gi, "")
      }

      element = $(element);
      var currentStyle = element.currentStyle;
      if((currentStyle && !currentStyle.hasLayout) || (!currentStyle && element.style.zoom == "normal")) {
        element.style.zoom = 1
      }
      var filter = element.getStyle("filter"), style = element.style;
      if(value == 1 || value === "") {( filter = stripAlpha(filter)) ? style.filter = filter : style.removeAttribute("filter");
        return element
      } else {
        if(value < 0.00001) {
          value = 0
        }
      }
      style.filter = stripAlpha(filter) + "alpha(opacity=" + (value * 100) + ")";
      return element
    };
    Element._attributeTranslations = (function() {
      var classProp = "className";
      var forProp = "for";
      var el = document.createElement("div");
      el.setAttribute(classProp, "x");
      if(el.className !== "x") {
        el.setAttribute("class", "x");
        if(el.className === "x") {
          classProp = "class"
        }
      }
      el = null;
      el = document.createElement("label");
      el.setAttribute(forProp, "x");
      if(el.htmlFor !== "x") {
        el.setAttribute("htmlFor", "x");
        if(el.htmlFor === "x") {
          forProp = "htmlFor"
        }
      }
      el = null;
      return {
        read : {
          names : {
            "class" : classProp,
            "className" : classProp,
            "for" : forProp,
            "htmlFor" : forProp
          },
          values : {
            _getAttr : function(element, attribute) {
              return element.getAttribute(attribute, 2)
            },
            _getAttrNode : function(element, attribute) {
              var node = element.getAttributeNode(attribute);
              return node ? node.value : ""
            },
            _getEv : (function() {
              var el = document.createElement("div");
              el.onclick = Prototype.emptyFunction;
              var value = el.getAttribute("onclick");
              var f;
              if(String(value).indexOf("{") > -1) {
                f = function(element, attribute) {
                  attribute = element.getAttribute(attribute);
                  if(!attribute) {
                    return null
                  }
                  attribute = attribute.toString();
                  attribute = attribute.split("{")[1];
                  attribute = attribute.split("}")[0];
                  return attribute.strip()
                }
              } else {
                if(value === "") {
                  f = function(element, attribute) {
                    attribute = element.getAttribute(attribute);
                    if(!attribute) {
                      return null
                    }
                    return attribute.strip()
                  }
                }
              }
              el = null;
              return f
            })(),
            _flag : function(element, attribute) {
              return $(element).hasAttribute(attribute) ? attribute : null
            },
            style : function(element) {
              return element.style.cssText.toLowerCase()
            },
            title : function(element) {
              return element.title
            }
          }
        }
      }
    })();
    Element._attributeTranslations.write = {
      names : Object.extend({
        cellpadding : "cellPadding",
        cellspacing : "cellSpacing"
      }, Element._attributeTranslations.read.names),
      values : {
        checked : function(element, value) {
          element.checked = !!value
        },
        style : function(element, value) {
          element.style.cssText = value ? value : ""
        }
      }
    };
    Element._attributeTranslations.has = {};
    $w("colSpan rowSpan vAlign dateTime accessKey tabIndex " + "encType maxLength readOnly longDesc frameBorder").each(function(attr) {
      Element._attributeTranslations.write.names[attr.toLowerCase()] = attr;
      Element._attributeTranslations.has[attr.toLowerCase()] = attr
    });
    (function(v) {
      Object.extend(v, {
        href : v._getAttr,
        src : v._getAttr,
        type : v._getAttr,
        action : v._getAttrNode,
        disabled : v._flag,
        checked : v._flag,
        readonly : v._flag,
        multiple : v._flag,
        onload : v._getEv,
        onunload : v._getEv,
        onclick : v._getEv,
        ondblclick : v._getEv,
        onmousedown : v._getEv,
        onmouseup : v._getEv,
        onmouseover : v._getEv,
        onmousemove : v._getEv,
        onmouseout : v._getEv,
        onfocus : v._getEv,
        onblur : v._getEv,
        onkeypress : v._getEv,
        onkeydown : v._getEv,
        onkeyup : v._getEv,
        onsubmit : v._getEv,
        onreset : v._getEv,
        onselect : v._getEv,
        onchange : v._getEv
      })
    })(Element._attributeTranslations.read.values);
    if(Prototype.BrowserFeatures.ElementExtensions) {(function() {
        function _descendants(element) {
          var nodes = element.getElementsByTagName("*"), results = [];
          for(var i = 0, node; node = nodes[i]; i++) {
            if(node.tagName !== "!") {
              results.push(node)
            }
          }
          return results
        }
        Element.Methods.down = function(element, expression, index) {
          element = $(element);
          if(arguments.length == 1) {
            return element.firstDescendant()
          }
          return Object.isNumber(expression) ? _descendants(element)[expression] : Element.select(element,expression)[index || 0]
        }
      })()
    }
  } else {
    if(Prototype.Browser.Gecko && /rv:1\.8\.0/.test(navigator.userAgent)) {
      Element.Methods.setOpacity = function(element, value) {
        element = $(element);
        element.style.opacity = (value == 1) ? 0.999999 : (value === "") ? "" : (value < 0.00001) ? 0 : value;
        return element
      }
    } else {
      if(Prototype.Browser.WebKit) {
        Element.Methods.setOpacity = function(element, value) {
          element = $(element);
          element.style.opacity = (value == 1 || value === "") ? "" : (value < 0.00001) ? 0 : value;
          if(value == 1) {
            if(element.tagName.toUpperCase() == "IMG" && element.width) {
              element.width++;
              element.width--
            } else {
              try {
                var n = document.createTextNode(" ");
                element.appendChild(n);
                element.removeChild(n)
              } catch(e) {
              }
            }
          }
          return element
        };
        Element.Methods.cumulativeOffset = function(element) {
          var valueT = 0, valueL = 0;
          do {
            valueT += element.offsetTop || 0;
            valueL += element.offsetLeft || 0;
            if(element.offsetParent == document.body) {
              if(Element.getStyle(element, "position") == "absolute") {
                break
              }
            }
            element = element.offsetParent
          } while(element);
          return Element._returnOffset(valueL, valueT)
        }
      }
    }
  }
}
if("outerHTML" in document.documentElement) {
  Element.Methods.replace = function(element, content) {
    element = $(element);
    if(content && content.toElement) {
      content = content.toElement()
    }
    if(Object.isElement(content)) {
      element.parentNode.replaceChild(content, element);
      return element
    }
    content = Object.toHTML(content);
    var parent = element.parentNode, tagName = parent.tagName.toUpperCase();
    if(Element._insertionTranslations.tags[tagName]) {
      var nextSibling = element.next();
      var fragments = Element._getContentFromAnonymousElement(tagName, content.stripScripts());
      parent.removeChild(element);
      if(nextSibling) {
        fragments.each(function(node) {
          parent.insertBefore(node, nextSibling)
        })
      } else {
        fragments.each(function(node) {
          parent.appendChild(node)
        })
      }
    } else {
      element.outerHTML = content.stripScripts()
    }
    content.evalScripts.bind(content).defer();
    return element
  }
}
Element._returnOffset = function(l, t) {
  var result = [l, t];
  result.left = l;
  result.top = t;
  return result
};
Element._getContentFromAnonymousElement = function(tagName, html) {
  var div = new Element("div"), t = Element._insertionTranslations.tags[tagName];
  if(t) {
    div.innerHTML = t[0] + html + t[1];
    t[2].times(function() {
      div = div.firstChild
    })
  } else {
    div.innerHTML = html
  }
  return $A(div.childNodes)
};
Element._insertionTranslations = {
  before : function(element, node) {
    element.parentNode.insertBefore(node, element)
  },
  top : function(element, node) {
    element.insertBefore(node, element.firstChild)
  },
  bottom : function(element, node) {
    element.appendChild(node)
  },
  after : function(element, node) {
    element.parentNode.insertBefore(node, element.nextSibling)
  },
  tags : {
    TABLE : ["<table>", "</table>", 1],
    TBODY : ["<table><tbody>", "</tbody></table>", 2],
    TR : ["<table><tbody><tr>", "</tr></tbody></table>", 3],
    TD : ["<table><tbody><tr><td>", "</td></tr></tbody></table>", 4],
    SELECT : ["<select>", "</select>", 1]
  }
};
(function() {
  Object.extend(this.tags, {
    THEAD : this.tags.TBODY,
    TFOOT : this.tags.TBODY,
    TH : this.tags.TD
  })
}).call(Element._insertionTranslations);
Element.Methods.Simulated = {
  hasAttribute : function(element, attribute) {
    attribute = Element._attributeTranslations.has[attribute] || attribute;
    var node = $(element).getAttributeNode(attribute);
    return !!(node && node.specified)
  }
};
Element.Methods.ByTag = {};
Object.extend(Element, Element.Methods);
(function(div) {
  if(!Prototype.BrowserFeatures.ElementExtensions && div["__proto__"]) {
    window.HTMLElement = {};
    window.HTMLElement.prototype = div["__proto__"];
    Prototype.BrowserFeatures.ElementExtensions = true
  }
  div = null
})(document.createElement("div"));
Element.extend = (function() {
  function checkDeficiency(tagName) {
    if( typeof window.Element != "undefined") {
      var proto = window.Element.prototype;
      if(proto) {
        var id = "_" + (Math.random() + "").slice(2);
        var el = document.createElement(tagName);
        proto[id] = "x";
        var isBuggy = (el[id] !== "x");
        delete proto[id];
        el = null;
        return isBuggy
      }
    }
    return false
  }

  function extendElementWith(element, methods) {
    for(var property in methods) {
      var value = methods[property];
      if(Object.isFunction(value) && !( property in element)) {
        element[property] = value.methodize()
      }
    }
  }

  var HTMLOBJECTELEMENT_PROTOTYPE_BUGGY = checkDeficiency("object");
  var HTMLAPPLETELEMENT_PROTOTYPE_BUGGY = checkDeficiency("applet");
  if(Prototype.BrowserFeatures.SpecificElementExtensions) {
    if(HTMLOBJECTELEMENT_PROTOTYPE_BUGGY && HTMLAPPLETELEMENT_PROTOTYPE_BUGGY) {
      return function(element) {
        if(element && element.tagName) {
          var tagName = element.tagName.toUpperCase();
          if(tagName === "OBJECT" || tagName === "APPLET") {
            extendElementWith(element, Element.Methods);
            if(tagName === "OBJECT") {
              extendElementWith(element, Element.Methods.ByTag.OBJECT)
            } else {
              if(tagName === "APPLET") {
                extendElementWith(element, Element.Methods.ByTag.APPLET)
              }
            }
          }
        }
        return element
      }
    }
    return Prototype.K
  }
  var Methods = {}, ByTag = Element.Methods.ByTag;
  var extend = Object.extend(function(element) {
    if(!element || typeof element._extendedByPrototype != "undefined" || element.nodeType != 1 || element == window) {
      return element
    }
    var methods = Object.clone(Methods), tagName = element.tagName.toUpperCase();
    if(ByTag[tagName]) {
      Object.extend(methods, ByTag[tagName])
    }
    extendElementWith(element, methods);
    element._extendedByPrototype = Prototype.emptyFunction;
    return element
  }, {
    refresh : function() {
      if(!Prototype.BrowserFeatures.ElementExtensions) {
        Object.extend(Methods, Element.Methods);
        Object.extend(Methods, Element.Methods.Simulated)
      }
    }
  });
  extend.refresh();
  return extend
})();
Element.hasAttribute = function(element, attribute) {
  if(element.hasAttribute) {
    return element.hasAttribute(attribute)
  }
  return Element.Methods.Simulated.hasAttribute(element, attribute)
};
Element.addMethods = function(methods) {
  var F = Prototype.BrowserFeatures, T = Element.Methods.ByTag;
  if(!methods) {
    Object.extend(Form, Form.Methods);
    Object.extend(Form.Element, Form.Element.Methods);
    Object.extend(Element.Methods.ByTag, {
      "FORM" : Object.clone(Form.Methods),
      "INPUT" : Object.clone(Form.Element.Methods),
      "SELECT" : Object.clone(Form.Element.Methods),
      "TEXTAREA" : Object.clone(Form.Element.Methods)
    })
  }
  if(arguments.length == 2) {
    var tagName = methods;
    methods = arguments[1]
  }
  if(!tagName) {
    Object.extend(Element.Methods, methods || {})
  } else {
    if(Object.isArray(tagName)) {
      tagName.each(extend)
    } else {
      extend(tagName)
    }
  }
  function extend(tagName) {
    tagName = tagName.toUpperCase();
    if(!Element.Methods.ByTag[tagName]) {
      Element.Methods.ByTag[tagName] = {}
    }
    Object.extend(Element.Methods.ByTag[tagName], methods)
  }

  function copy(methods, destination, onlyIfAbsent) {
    onlyIfAbsent = onlyIfAbsent || false;
    for(var property in methods) {
      var value = methods[property];
      if(!Object.isFunction(value)) {
        continue
      }
      if(!onlyIfAbsent || !( property in destination)) {
        destination[property] = value.methodize()
      }
    }
  }

  function findDOMClass(tagName) {
    var klass;
    var trans = {
      "OPTGROUP" : "OptGroup",
      "TEXTAREA" : "TextArea",
      "P" : "Paragraph",
      "FIELDSET" : "FieldSet",
      "UL" : "UList",
      "OL" : "OList",
      "DL" : "DList",
      "DIR" : "Directory",
      "H1" : "Heading",
      "H2" : "Heading",
      "H3" : "Heading",
      "H4" : "Heading",
      "H5" : "Heading",
      "H6" : "Heading",
      "Q" : "Quote",
      "INS" : "Mod",
      "DEL" : "Mod",
      "A" : "Anchor",
      "IMG" : "Image",
      "CAPTION" : "TableCaption",
      "COL" : "TableCol",
      "COLGROUP" : "TableCol",
      "THEAD" : "TableSection",
      "TFOOT" : "TableSection",
      "TBODY" : "TableSection",
      "TR" : "TableRow",
      "TH" : "TableCell",
      "TD" : "TableCell",
      "FRAMESET" : "FrameSet",
      "IFRAME" : "IFrame"
    };
    if(trans[tagName]) {
      klass = "HTML" + trans[tagName] + "Element"
    }
    if(window[klass]) {
      return window[klass]
    }
    klass = "HTML" + tagName + "Element";
    if(window[klass]) {
      return window[klass]
    }
    klass = "HTML" + tagName.capitalize() + "Element";
    if(window[klass]) {
      return window[klass]
    }
    var element = document.createElement(tagName);
    var proto = element["__proto__"] || element.constructor.prototype;
    element = null;
    return proto
  }

  var elementPrototype = window.HTMLElement ? HTMLElement.prototype : Element.prototype;
  if(F.ElementExtensions) {
    copy(Element.Methods, elementPrototype);
    copy(Element.Methods.Simulated, elementPrototype, true)
  }
  if(F.SpecificElementExtensions) {
    for(var tag in Element.Methods.ByTag) {
      var klass = findDOMClass(tag);
      if(Object.isUndefined(klass)) {
        continue
      }
      copy(T[tag], klass.prototype)
    }
  }
  Object.extend(Element, Element.Methods);
  delete Element.ByTag;
  if(Element.extend.refresh) {
    Element.extend.refresh()
  }
  Element.cache = {}
};
document.viewport = {
  getDimensions : function() {
    return {
      width : this.getWidth(),
      height : this.getHeight()
    }
  },
  getScrollOffsets : function() {
    return Element._returnOffset(window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft, window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop)
  }
};
(function(viewport) {
  var B = Prototype.Browser, doc = document, element, property = {};
  function getRootElement() {
    if(B.WebKit && !doc.evaluate) {
      return document
    }
    if(B.Opera && window.parseFloat(window.opera.version()) < 9.5) {
      return document.body
    }
    return document.documentElement
  }

  function define(D) {
    if(!element) {
      element = getRootElement()
    }
    property[D] = "client" + D;
    viewport["get" + D] = function() {
      return element[property[D]]
    };
    return viewport["get"+D]()
  }
  viewport.getWidth = define.curry("Width");
  viewport.getHeight = define.curry("Height")
})(document.viewport);
Element.Storage = {
  UID : 1
};
Element.addMethods({
  getStorage : function(element) {
    if(!( element = $(element))) {
      return
    }
    var uid;
    if(element === window) {
      uid = 0
    } else {
      if( typeof element._prototypeUID === "undefined") {
        element._prototypeUID = [Element.Storage.UID++]
      }
      uid = element._prototypeUID[0]
    }
    if(!Element.Storage[uid]) {
      Element.Storage[uid] = $H()
    }
    return Element.Storage[uid]
  },
  store : function(element, key, value) {
    if(!( element = $(element))) {
      return
    }
    if(arguments.length === 2) {
      element.getStorage().update(key)
    } else {
      element.getStorage().set(key, value)
    }
    return element
  },
  retrieve : function(element, key, defaultValue) {
    if(!( element = $(element))) {
      return
    }
    var hash = Element.getStorage(element), value = hash.get(key);
    if(Object.isUndefined(value)) {
      hash.set(key, defaultValue);
      value = defaultValue
    }
    return value
  },
  clone : function(element, deep) {
    if(!( element = $(element))) {
      return
    }
    var clone = element.cloneNode(deep);
    clone._prototypeUID =
    void 0;
    if(deep) {
      var descendants = Element.select(clone, "*"), i = descendants.length;
      while(i--) {
        descendants[i]._prototypeUID =
        void 0
      }
    }
    return Element.extend(clone)
  }
});
var Selector = Class.create({
  initialize : function(expression) {
    this.expression = expression.strip();
    if(this.shouldUseSelectorsAPI()) {
      this.mode = "selectorsAPI"
    } else {
      if(this.shouldUseXPath()) {
        this.mode = "xpath";
        this.compileXPathMatcher()
      } else {
        this.mode = "normal";
        this.compileMatcher()
      }
    }
  },
  shouldUseXPath : (function() {
    var IS_DESCENDANT_SELECTOR_BUGGY = (function() {
      var isBuggy = false;
      if(document.evaluate && window.XPathResult) {
        var el = document.createElement("div");
        el.innerHTML = "<ul><li></li></ul><div><ul><li></li></ul></div>";
        var xpath = ".//*[local-name()='ul' or local-name()='UL']" + "//*[local-name()='li' or local-name()='LI']";
        var result = document.evaluate(xpath, el, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        isBuggy = (result.snapshotLength !== 2);
        el = null
      }
      return isBuggy
    })();
    return function() {
      if(!Prototype.BrowserFeatures.XPath) {
        return false
      }
      var e = this.expression;
      if(Prototype.Browser.WebKit && (e.include("-of-type") || e.include(":empty"))) {
        return false
      }
      if((/(\[[\w-]*?:|:checked)/).test(e)) {
        return false
      }
      if(IS_DESCENDANT_SELECTOR_BUGGY) {
        return false
      }
      return true
    }
  })(),
  shouldUseSelectorsAPI : function() {
    if(!Prototype.BrowserFeatures.SelectorsAPI) {
      return false
    }
    if(Selector.CASE_INSENSITIVE_CLASS_NAMES) {
      return false
    }
    if(!Selector._div) {
      Selector._div = new Element("div")
    }
    try {
      Selector._div.querySelector(this.expression)
    } catch(e) {
      return false
    }
    return true
  },
  compileMatcher : function() {
    var e = this.expression, ps = Selector.patterns, h = Selector.handlers, c = Selector.criteria, le, p, m, len = ps.length, name;
    if(Selector._cache[e]) {
      this.matcher = Selector._cache[e];
      return
    }
    this.matcher = ["this.matcher = function(root) {", "var r = root, h = Selector.handlers, c = false, n;"];
    while(e && le != e && (/\S/).test(e)) {
      le = e;
      for(var i = 0; i < len; i++) {
        p = ps[i].re;
        name = ps[i].name;
        if( m = e.match(p)) {
          this.matcher.push(Object.isFunction(c[name]) ? c[name](m) : new Template(c[name]).evaluate(m));
          e = e.replace(m[0], "");
          break
        }
      }
    }
    this.matcher.push("return h.unique(n);\n}");
    eval(this.matcher.join("\n"));
    Selector._cache[this.expression] = this.matcher
  },
  compileXPathMatcher : function() {
    var e = this.expression, ps = Selector.patterns, x = Selector.xpath, le, m, len = ps.length, name;
    if(Selector._cache[e]) {
      this.xpath = Selector._cache[e];
      return
    }
    this.matcher = [".//*"];
    while(e && le != e && (/\S/).test(e)) {
      le = e;
      for(var i = 0; i < len; i++) {
        name = ps[i].name;
        if( m = e.match(ps[i].re)) {
          this.matcher.push(Object.isFunction(x[name]) ? x[name](m) : new Template(x[name]).evaluate(m));
          e = e.replace(m[0], "");
          break
        }
      }
    }
    this.xpath = this.matcher.join("");
    Selector._cache[this.expression] = this.xpath
  },
  findElements : function(root) {
    root = root || document;
    var e = this.expression, results;
    switch(this.mode) {
      case"selectorsAPI":
        if(root !== document) {
          var oldId = root.id, id = $(root).identify();
          id = id.replace(/[\.:]/g, "\\$0");
          e = "#" + id + " " + e
        }
        results = $A(root.querySelectorAll(e)).map(Element.extend);
        root.id = oldId;
        return results;
      case"xpath":
        return document._getElementsByXPath(this.xpath, root);
      default:
        return this.matcher(root)
    }
  },
  match : function(element) {
    this.tokens = [];
    var e = this.expression, ps = Selector.patterns, as = Selector.assertions;
    var le, p, m, len = ps.length, name;
    while(e && le !== e && (/\S/).test(e)) {
      le = e;
      for(var i = 0; i < len; i++) {
        p = ps[i].re;
        name = ps[i].name;
        if( m = e.match(p)) {
          if(as[name]) {
            this.tokens.push([name, Object.clone(m)]);
            e = e.replace(m[0], "")
          } else {
            return this.findElements(document).include(element)
          }
        }
      }
    }
    var match = true, name, matches;
    for(var i = 0, token; token = this.tokens[i]; i++) { name = token[0], matches = token[1];
      if(!Selector.assertions[name](element, matches)) {
        match = false;
        break
      }
    }
    return match
  },
  toString : function() {
    return this.expression
  },
  inspect : function() {
    return "#<Selector:" + this.expression.inspect() + ">"
  }
});
if(Prototype.BrowserFeatures.SelectorsAPI && document.compatMode === "BackCompat") {
  Selector.CASE_INSENSITIVE_CLASS_NAMES = (function() {
    var div = document.createElement("div"), span = document.createElement("span");
    div.id = "prototype_test_id";
    span.className = "Test";
    div.appendChild(span);
    var isIgnored = (div.querySelector("#prototype_test_id .test") !== null);
    div = span = null;
    return isIgnored
  })()
}
Object.extend(Selector, {
  _cache : {},
  xpath : {
    descendant : "//*",
    child : "/*",
    adjacent : "/following-sibling::*[1]",
    laterSibling : "/following-sibling::*",
    tagName : function(m) {
      if(m[1] == "*") {
        return ""
      }
      return "[local-name()='" + m[1].toLowerCase() + "' or local-name()='" + m[1].toUpperCase() + "']"
    },
    className : "[contains(concat(' ', @class, ' '), ' #{1} ')]",
    id : "[@id='#{1}']",
    attrPresence : function(m) {
      m[1] = m[1].toLowerCase();
      return new Template("[@#{1}]").evaluate(m)
    },
    attr : function(m) {
      m[1] = m[1].toLowerCase();
      m[3] = m[5] || m[6];
      return new Template(Selector.xpath.operators[m[2]]).evaluate(m)
    },
    pseudo : function(m) {
      var h = Selector.xpath.pseudos[m[1]];
      if(!h) {
        return ""
      }
      if(Object.isFunction(h)) {
        return h(m)
      }
      return new Template(Selector.xpath.pseudos[m[1]]).evaluate(m)
    },
    operators : {
      "=" : "[@#{1}='#{3}']",
      "!=" : "[@#{1}!='#{3}']",
      "^=" : "[starts-with(@#{1}, '#{3}')]",
      "$=" : "[substring(@#{1}, (string-length(@#{1}) - string-length('#{3}') + 1))='#{3}']",
      "*=" : "[contains(@#{1}, '#{3}')]",
      "~=" : "[contains(concat(' ', @#{1}, ' '), ' #{3} ')]",
      "|=" : "[contains(concat('-', @#{1}, '-'), '-#{3}-')]"
    },
    pseudos : {
      "first-child" : "[not(preceding-sibling::*)]",
      "last-child" : "[not(following-sibling::*)]",
      "only-child" : "[not(preceding-sibling::* or following-sibling::*)]",
      "empty" : "[count(*) = 0 and (count(text()) = 0)]",
      "checked" : "[@checked]",
      "disabled" : "[(@disabled) and (@type!='hidden')]",
      "enabled" : "[not(@disabled) and (@type!='hidden')]",
      "not" : function(m) {
        var e = m[6], p = Selector.patterns, x = Selector.xpath, le, v, len = p.length, name;
        var exclusion = [];
        while(e && le != e && (/\S/).test(e)) {
          le = e;
          for(var i = 0; i < len; i++) {
            name = p[i].name;
            if( m = e.match(p[i].re)) {
              v = Object.isFunction(x[name]) ? x[name](m) : new Template(x[name]).evaluate(m);
              exclusion.push("(" + v.substring(1, v.length - 1) + ")");
              e = e.replace(m[0], "");
              break
            }
          }
        }
        return "[not(" + exclusion.join(" and ") + ")]"
      },
      "nth-child" : function(m) {
        return Selector.xpath.pseudos.nth("(count(./preceding-sibling::*) + 1) ", m)
      },
      "nth-last-child" : function(m) {
        return Selector.xpath.pseudos.nth("(count(./following-sibling::*) + 1) ", m)
      },
      "nth-of-type" : function(m) {
        return Selector.xpath.pseudos.nth("position() ", m)
      },
      "nth-last-of-type" : function(m) {
        return Selector.xpath.pseudos.nth("(last() + 1 - position()) ", m)
      },
      "first-of-type" : function(m) {
        m[6] = "1";
        return Selector.xpath.pseudos["nth-of-type"](m)
      },
      "last-of-type" : function(m) {
        m[6] = "1";
        return Selector.xpath.pseudos["nth-last-of-type"](m)
      },
      "only-of-type" : function(m) {
        var p = Selector.xpath.pseudos;
        return p["first-of-type"](m) + p["last-of-type"](m)
      },
      nth : function(fragment, m) {
        var mm, formula = m[6], predicate;
        if(formula == "even") {
          formula = "2n+0"
        }
        if(formula == "odd") {
          formula = "2n+1"
        }
        if( mm = formula.match(/^(\d+)$/)) {
          return "[" + fragment + "= " + mm[1] + "]"
        }
        if( mm = formula.match(/^(-?\d*)?n(([+-])(\d+))?/)) {
          if(mm[1] == "-") {
            mm[1] = -1
          }
          var a = mm[1] ? Number(mm[1]) : 1;
          var b = mm[2] ? Number(mm[2]) : 0;
          predicate = "[((#{fragment} - #{b}) mod #{a} = 0) and " + "((#{fragment} - #{b}) div #{a} >= 0)]";
          return new Template(predicate).evaluate({
            fragment : fragment,
            a : a,
            b : b
          })
        }
      }
    }
  },
  criteria : {
    tagName : 'n = h.tagName(n, r, "#{1}", c);      c = false;',
    className : 'n = h.className(n, r, "#{1}", c);    c = false;',
    id : 'n = h.id(n, r, "#{1}", c);           c = false;',
    attrPresence : 'n = h.attrPresence(n, r, "#{1}", c); c = false;',
    attr : function(m) {
      m[3] = (m[5] || m[6]);
      return new Template('n = h.attr(n, r, "#{1}", "#{3}", "#{2}", c); c = false;').evaluate(m)
    },
    pseudo : function(m) {
      if(m[6]) {
        m[6] = m[6].replace(/"/g, '\\"')
      }
      return new Template('n = h.pseudo(n, "#{1}", "#{6}", r, c); c = false;').evaluate(m)
    },
    descendant : 'c = "descendant";',
    child : 'c = "child";',
    adjacent : 'c = "adjacent";',
    laterSibling : 'c = "laterSibling";'
  },
  patterns : [{
    name : "laterSibling",
    re : /^\s*~\s*/
  }, {
    name : "child",
    re : /^\s*>\s*/
  }, {
    name : "adjacent",
    re : /^\s*\+\s*/
  }, {
    name : "descendant",
    re : /^\s/
  }, {
    name : "tagName",
    re : /^\s*(\*|[\w\-]+)(\b|$)?/
  }, {
    name : "id",
    re : /^#([\w\-\*]+)(\b|$)/
  }, {
    name : "className",
    re : /^\.([\w\-\*]+)(\b|$)/
  }, {
    name : "pseudo",
    re : /^:((first|last|nth|nth-last|only)(-child|-of-type)|empty|checked|(en|dis)abled|not)(\((.*?)\))?(\b|$|(?=\s|[:+~>]))/
  }, {
    name : "attrPresence",
    re : /^\[((?:[\w-]+:)?[\w-]+)\]/
  }, {
    name : "attr",
    re : /\[((?:[\w-]*:)?[\w-]+)\s*(?:([!^$*~|]?=)\s*((['"])([^\4]*?)\4|([^'"][^\]]*?)))?\]/
  }],
  assertions : {
    tagName : function(element, matches) {
      return matches[1].toUpperCase() == element.tagName.toUpperCase()
    },
    className : function(element, matches) {
      return Element.hasClassName(element, matches[1])
    },
    id : function(element, matches) {
      return element.id === matches[1]
    },
    attrPresence : function(element, matches) {
      return Element.hasAttribute(element, matches[1])
    },
    attr : function(element, matches) {
      var nodeValue = Element.readAttribute(element, matches[1]);
      return nodeValue && Selector.operators[matches[2]](nodeValue, matches[5] || matches[6])
    }
  },
  handlers : {
    concat : function(a, b) {
      for(var i = 0, node; node = b[i]; i++) {
        a.push(node)
      }
      return a
    },
    mark : function(nodes) {
      var _true = Prototype.emptyFunction;
      for(var i = 0, node; node = nodes[i]; i++) {
        node._countedByPrototype = _true
      }
      return nodes
    },
    unmark : function(nodes) {
      for(var i = 0, node; node = nodes[i]; i++) {
        node._countedByPrototype = undefined
      }
      return nodes
    },
    index : function(parentNode, reverse, ofType) {
      parentNode._countedByPrototype = Prototype.emptyFunction;
      if(reverse) {
        for(var nodes = parentNode.childNodes, i = nodes.length - 1, j = 1; i >= 0; i--) {
          var node = nodes[i];
          if(node.nodeType == 1 && (!ofType || node._countedByPrototype)) {
            node.nodeIndex = j++
          }
        }
      } else {
        for(var i = 0, j = 1, nodes = parentNode.childNodes; node = nodes[i]; i++) {
          if(node.nodeType == 1 && (!ofType || node._countedByPrototype)) {
            node.nodeIndex = j++
          }
        }
      }
    },
    unique : function(nodes) {
      if(nodes.length == 0) {
        return nodes
      }
      var results = [], n;
      for(var i = 0, l = nodes.length; i < l; i++) {
        if( typeof ( n = nodes[i])._countedByPrototype == "undefined") {
          n._countedByPrototype = Prototype.emptyFunction;
          results.push(Element.extend(n))
        }
      }
      return Selector.handlers.unmark(results)
    },
    descendant : function(nodes) {
      var h = Selector.handlers;
      for(var i = 0, results = [], node; node = nodes[i]; i++) {
        h.concat(results, node.getElementsByTagName("*"))
      }
      return results
    },
    child : function(nodes) {
      var h = Selector.handlers;
      for(var i = 0, results = [], node; node = nodes[i]; i++) {
        for(var j = 0, child; child = node.childNodes[j]; j++) {
          if(child.nodeType == 1 && child.tagName != "!") {
            results.push(child)
          }
        }
      }
      return results
    },
    adjacent : function(nodes) {
      for(var i = 0, results = [], node; node = nodes[i]; i++) {
        var next = this.nextElementSibling(node);
        if(next) {
          results.push(next)
        }
      }
      return results
    },
    laterSibling : function(nodes) {
      var h = Selector.handlers;
      for(var i = 0, results = [], node; node = nodes[i]; i++) {
        h.concat(results, Element.nextSiblings(node))
      }
      return results
    },
    nextElementSibling : function(node) {
      while( node = node.nextSibling) {
        if(node.nodeType == 1) {
          return node
        }
      }
      return null
    },
    previousElementSibling : function(node) {
      while( node = node.previousSibling) {
        if(node.nodeType == 1) {
          return node
        }
      }
      return null
    },
    tagName : function(nodes, root, tagName, combinator) {
      var uTagName = tagName.toUpperCase();
      var results = [], h = Selector.handlers;
      if(nodes) {
        if(combinator) {
          if(combinator == "descendant") {
            for(var i = 0, node; node = nodes[i]; i++) {
              h.concat(results, node.getElementsByTagName(tagName))
            }
            return results
          } else {
            nodes = this[combinator](nodes)
          }
          if(tagName == "*") {
            return nodes
          }
        }
        for(var i = 0, node; node = nodes[i]; i++) {
          if(node.tagName.toUpperCase() === uTagName) {
            results.push(node)
          }
        }
        return results
      } else {
        return root.getElementsByTagName(tagName)
      }
    },
    id : function(nodes, root, id, combinator) {
      var targetNode = $(id), h = Selector.handlers;
      if(root == document) {
        if(!targetNode) {
          return []
        }
        if(!nodes) {
          return [targetNode]
        }
      } else {
        if(!root.sourceIndex || root.sourceIndex < 1) {
          var nodes = root.getElementsByTagName("*");
          for(var j = 0, node; node = nodes[j]; j++) {
            if(node.id === id) {
              return [node]
            }
          }
        }
      }
      if(nodes) {
        if(combinator) {
          if(combinator == "child") {
            for(var i = 0, node; node = nodes[i]; i++) {
              if(targetNode.parentNode == node) {
                return [targetNode]
              }
            }
          } else {
            if(combinator == "descendant") {
              for(var i = 0, node; node = nodes[i]; i++) {
                if(Element.descendantOf(targetNode, node)) {
                  return [targetNode]
                }
              }
            } else {
              if(combinator == "adjacent") {
                for(var i = 0, node; node = nodes[i]; i++) {
                  if(Selector.handlers.previousElementSibling(targetNode) == node) {
                    return [targetNode]
                  }
                }
              } else {
                nodes = h[combinator](nodes)
              }
            }
          }
        }
        for(var i = 0, node; node = nodes[i]; i++) {
          if(node == targetNode) {
            return [targetNode]
          }
        }
        return []
      }
      return (targetNode && Element.descendantOf(targetNode, root)) ? [targetNode] : []
    },
    className : function(nodes, root, className, combinator) {
      if(nodes && combinator) {
        nodes = this[combinator](nodes)
      }
      return Selector.handlers.byClassName(nodes, root, className)
    },
    byClassName : function(nodes, root, className) {
      if(!nodes) {
        nodes = Selector.handlers.descendant([root])
      }
      var needle = " " + className + " ";
      for(var i = 0, results = [], node, nodeClassName; node = nodes[i]; i++) {
        nodeClassName = node.className;
        if(nodeClassName.length == 0) {
          continue
        }
        if(nodeClassName == className || (" " + nodeClassName + " ").include(needle)) {
          results.push(node)
        }
      }
      return results
    },
    attrPresence : function(nodes, root, attr, combinator) {
      if(!nodes) {
        nodes = root.getElementsByTagName("*")
      }
      if(nodes && combinator) {
        nodes = this[combinator](nodes)
      }
      var results = [];
      for(var i = 0, node; node = nodes[i]; i++) {
        if(Element.hasAttribute(node, attr)) {
          results.push(node)
        }
      }
      return results
    },
    attr : function(nodes, root, attr, value, operator, combinator) {
      if(!nodes) {
        nodes = root.getElementsByTagName("*")
      }
      if(nodes && combinator) {
        nodes = this[combinator](nodes)
      }
      var handler = Selector.operators[operator], results = [];
      for(var i = 0, node; node = nodes[i]; i++) {
        var nodeValue = Element.readAttribute(node, attr);
        if(nodeValue === null) {
          continue
        }
        if(handler(nodeValue, value)) {
          results.push(node)
        }
      }
      return results
    },
    pseudo : function(nodes, name, value, root, combinator) {
      if(nodes && combinator) {
        nodes = this[combinator](nodes)
      }
      if(!nodes) {
        nodes = root.getElementsByTagName("*")
      }
      return Selector.pseudos[name](nodes, value, root)
    }
  },
  pseudos : {
    "first-child" : function(nodes, value, root) {
      for(var i = 0, results = [], node; node = nodes[i]; i++) {
        if(Selector.handlers.previousElementSibling(node)) {
          continue
        }
        results.push(node)
      }
      return results
    },
    "last-child" : function(nodes, value, root) {
      for(var i = 0, results = [], node; node = nodes[i]; i++) {
        if(Selector.handlers.nextElementSibling(node)) {
          continue
        }
        results.push(node)
      }
      return results
    },
    "only-child" : function(nodes, value, root) {
      var h = Selector.handlers;
      for(var i = 0, results = [], node; node = nodes[i]; i++) {
        if(!h.previousElementSibling(node) && !h.nextElementSibling(node)) {
          results.push(node)
        }
      }
      return results
    },
    "nth-child" : function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, formula, root)
    },
    "nth-last-child" : function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, formula, root, true)
    },
    "nth-of-type" : function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, formula, root, false, true)
    },
    "nth-last-of-type" : function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, formula, root, true, true)
    },
    "first-of-type" : function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, "1", root, false, true)
    },
    "last-of-type" : function(nodes, formula, root) {
      return Selector.pseudos.nth(nodes, "1", root, true, true)
    },
    "only-of-type" : function(nodes, formula, root) {
      var p = Selector.pseudos;
      return p["last-of-type"](p["first-of-type"](nodes, formula, root), formula, root)
    },
    getIndices : function(a, b, total) {
      if(a == 0) {
        return b > 0 ? [b] : []
      }
      return $R(1, total).inject([], function(memo, i) {
        if(0 == (i - b) % a && (i - b) / a >= 0) {
          memo.push(i)
        }
        return memo
      })
    },
    nth : function(nodes, formula, root, reverse, ofType) {
      if(nodes.length == 0) {
        return []
      }
      if(formula == "even") {
        formula = "2n+0"
      }
      if(formula == "odd") {
        formula = "2n+1"
      }
      var h = Selector.handlers, results = [], indexed = [], m;
      h.mark(nodes);
      for(var i = 0, node; node = nodes[i]; i++) {
        if(!node.parentNode._countedByPrototype) {
          h.index(node.parentNode, reverse, ofType);
          indexed.push(node.parentNode)
        }
      }
      if(formula.match(/^\d+$/)) {
        formula = Number(formula);
        for(var i = 0, node; node = nodes[i]; i++) {
          if(node.nodeIndex == formula) {
            results.push(node)
          }
        }
      } else {
        if( m = formula.match(/^(-?\d*)?n(([+-])(\d+))?/)) {
          if(m[1] == "-") {
            m[1] = -1
          }
          var a = m[1] ? Number(m[1]) : 1;
          var b = m[2] ? Number(m[2]) : 0;
          var indices = Selector.pseudos.getIndices(a, b, nodes.length);
          for(var i = 0, node, l = indices.length; node = nodes[i]; i++) {
            for(var j = 0; j < l; j++) {
              if(node.nodeIndex == indices[j]) {
                results.push(node)
              }
            }
          }
        }
      }
      h.unmark(nodes);
      h.unmark(indexed);
      return results
    },
    "empty" : function(nodes, value, root) {
      for(var i = 0, results = [], node; node = nodes[i]; i++) {
        if(node.tagName == "!" || node.firstChild) {
          continue
        }
        results.push(node)
      }
      return results
    },
    "not" : function(nodes, selector, root) {
      var h = Selector.handlers, selectorType, m;
      var exclusions = new Selector(selector).findElements(root);
      h.mark(exclusions);
      for(var i = 0, results = [], node; node = nodes[i]; i++) {
        if(!node._countedByPrototype) {
          results.push(node)
        }
      }
      h.unmark(exclusions);
      return results
    },
    "enabled" : function(nodes, value, root) {
      for(var i = 0, results = [], node; node = nodes[i]; i++) {
        if(!node.disabled && (!node.type || node.type !== "hidden")) {
          results.push(node)
        }
      }
      return results
    },
    "disabled" : function(nodes, value, root) {
      for(var i = 0, results = [], node; node = nodes[i]; i++) {
        if(node.disabled) {
          results.push(node)
        }
      }
      return results
    },
    "checked" : function(nodes, value, root) {
      for(var i = 0, results = [], node; node = nodes[i]; i++) {
        if(node.checked) {
          results.push(node)
        }
      }
      return results
    }
  },
  operators : {
    "=" : function(nv, v) {
      return nv == v
    },
    "!=" : function(nv, v) {
      return nv != v
    },
    "^=" : function(nv, v) {
      return nv == v || nv && nv.startsWith(v)
    },
    "$=" : function(nv, v) {
      return nv == v || nv && nv.endsWith(v)
    },
    "*=" : function(nv, v) {
      return nv == v || nv && nv.include(v)
    },
    "~=" : function(nv, v) {
      return (" " + nv + " ").include(" " + v + " ")
    },
    "|=" : function(nv, v) {
      return ("-" + (nv || "").toUpperCase() + "-").include("-" + (v || "").toUpperCase() + "-")
    }
  },
  split : function(expression) {
    var expressions = [];
    expression.scan(/(([\w#:.~>+()\s-]+|\*|\[.*?\])+)\s*(,|$)/, function(m) {
      expressions.push(m[1].strip())
    });
    return expressions
  },
  matchElements : function(elements, expression) {
    var matches = $$(expression), h = Selector.handlers;
    h.mark(matches);
    for(var i = 0, results = [], element; element = elements[i]; i++) {
      if(element._countedByPrototype) {
        results.push(element)
      }
    }
    h.unmark(matches);
    return results
  },
  findElement : function(elements, expression, index) {
    if(Object.isNumber(expression)) {
      index = expression;
      expression = false
    }
    return Selector.matchElements(elements,expression||"*")[index || 0]
  },
  findChildElements : function(element, expressions) {
    expressions = Selector.split(expressions.join(","));
    var results = [], h = Selector.handlers;
    for(var i = 0, l = expressions.length, selector; i < l; i++) {
      selector = new Selector(expressions[i].strip());
      h.concat(results, selector.findElements(element))
    }
    return (l > 1) ? h.unique(results) : results
  }
});
if(Prototype.Browser.IE) {
  Object.extend(Selector.handlers, {
    concat : function(a, b) {
      for(var i = 0, node; node = b[i]; i++) {
        if(node.tagName !== "!") {
          a.push(node)
        }
      }
      return a
    },
    unmark : function(nodes) {
      for(var i = 0, node; node = nodes[i]; i++) {
        node.removeAttribute("_countedByPrototype")
      }
      return nodes
    }
  })
}
function $$() {
  return Selector.findChildElements(document, $A(arguments))
}

var Form = {
  reset : function(form) {
    form = $(form);
    form.reset();
    return form
  },
  serializeElements : function(elements, options) {
    if( typeof options != "object") {
      options = {
        hash : !!options
      }
    } else {
      if(Object.isUndefined(options.hash)) {
        options.hash = true
      }
    }
    var key, value, submitted = false, submit = options.submit;
    var data = elements.inject({}, function(result, element) {
      if(!element.disabled && element.name) {
        key = element.name;
        value = $(element).getValue();
        if(value != null && element.type != "file" && (element.type != "submit" || (!submitted && submit !== false && (!submit || key == submit) && ( submitted = true)))) {
          if( key in result) {
            if(!Object.isArray(result[key])) {
              result[key] = [result[key]]
            }
            result[key].push(value)
          } else {
            result[key] = value
          }
        }
      }
      return result
    });
    return options.hash ? data : Object.toQueryString(data)
  }
};
Form.Methods = {
  serialize : function(form, options) {
    return Form.serializeElements(Form.getElements(form), options)
  },
  getElements : function(form) {
    var elements = $(form).getElementsByTagName("*"), element, arr = [], serializers = Form.Element.Serializers;
    for(var i = 0; element = elements[i]; i++) {
      arr.push(element)
    }
    return arr.inject([], function(elements, child) {
      if(serializers[child.tagName.toLowerCase()]) {
        elements.push(Element.extend(child))
      }
      return elements
    })
  },
  getInputs : function(form, typeName, name) {
    form = $(form);
    var inputs = form.getElementsByTagName("input");
    if(!typeName && !name) {
      return $A(inputs).map(Element.extend)
    }
    for(var i = 0, matchingInputs = [], length = inputs.length; i < length; i++) {
      var input = inputs[i];
      if((typeName && input.type != typeName) || (name && input.name != name)) {
        continue
      }
      matchingInputs.push(Element.extend(input))
    }
    return matchingInputs
  },
  disable : function(form) {
    form = $(form);
    Form.getElements(form).invoke("disable");
    return form
  },
  enable : function(form) {
    form = $(form);
    Form.getElements(form).invoke("enable");
    return form
  },
  findFirstElement : function(form) {
    var elements = $(form).getElements().findAll(function(element) {
      return "hidden" != element.type && !element.disabled
    });
    var firstByIndex = elements.findAll(function(element) {
      return element.hasAttribute("tabIndex") && element.tabIndex >= 0
    }).sortBy(function(element) {
      return element.tabIndex
    }).first();
    return firstByIndex ? firstByIndex : elements.find(function(element) {
      return ["input", "select", "textarea"].include(element.tagName.toLowerCase())
    })
  },
  focusFirstElement : function(form) {
    form = $(form);
    form.findFirstElement().activate();
    return form
  },
  request : function(form, options) { form = $(form), options = Object.clone(options || {});
    var params = options.parameters, action = form.readAttribute("action") || "";
    if(action.blank()) {
      action = window.location.href
    }
    options.parameters = form.serialize(true);
    if(params) {
      if(Object.isString(params)) {
        params = params.toQueryParams()
      }
      Object.extend(options.parameters, params)
    }
    if(form.hasAttribute("method") && !options.method) {
      options.method = form.method
    }
    return new Ajax.Request(action, options)
  }
};
Form.Element = {
  focus : function(element) {
    $(element).focus();
    return element
  },
  select : function(element) {
    $(element).select();
    return element
  }
};
Form.Element.Methods = {
  serialize : function(element) {
    element = $(element);
    if(!element.disabled && element.name) {
      var value = element.getValue();
      if(value != undefined) {
        var pair = {};
        pair[element.name] = value;
        return Object.toQueryString(pair)
      }
    }
    return ""
  },
  getValue : function(element) {
    element = $(element);
    var method = element.tagName.toLowerCase();
    return Form.Element.Serializers[method](element)
  },
  setValue : function(element, value) {
    element = $(element);
    var method = element.tagName.toLowerCase();
    Form.Element.Serializers[method](element, value);
    return element
  },
  clear : function(element) {
    $(element).value = "";
    return element
  },
  present : function(element) {
    return $(element).value != ""
  },
  activate : function(element) {
    element = $(element);
    try {
      element.focus();
      if(element.select && (element.tagName.toLowerCase() != "input" || !["button", "reset", "submit"].include(element.type))) {
        element.select()
      }
    } catch(e) {
    }
    return element
  },
  disable : function(element) {
    element = $(element);
    element.disabled = true;
    return element
  },
  enable : function(element) {
    element = $(element);
    element.disabled = false;
    return element
  }
};
var Field = Form.Element;
var $F = Form.Element.Methods.getValue;
Form.Element.Serializers = {
  input : function(element, value) {
    switch(element.type.toLowerCase()) {
      case"checkbox":
      case"radio":
        return Form.Element.Serializers.inputSelector(element, value);
      default:
        return Form.Element.Serializers.textarea(element, value)
    }
  },
  inputSelector : function(element, value) {
    if(Object.isUndefined(value)) {
      return element.checked ? element.value : null
    } else {
      element.checked = !!value
    }
  },
  textarea : function(element, value) {
    if(Object.isUndefined(value)) {
      return element.value
    } else {
      element.value = value
    }
  },
  select : function(element, value) {
    if(Object.isUndefined(value)) {
      return this[element.type=="select-one"?"selectOne":"selectMany"](element)
    } else {
      var opt, currentValue, single = !Object.isArray(value);
      for(var i = 0, length = element.length; i < length; i++) {
        opt = element.options[i];
        currentValue = this.optionValue(opt);
        if(single) {
          if(currentValue == value) {
            opt.selected = true;
            return
          }
        } else {
          opt.selected = value.include(currentValue)
        }
      }
    }
  },
  selectOne : function(element) {
    var index = element.selectedIndex;
    return index >= 0 ? this.optionValue(element.options[index]) : null
  },
  selectMany : function(element) {
    var values, length = element.length;
    if(!length) {
      return null
    }
    for(var i = 0, values = []; i < length; i++) {
      var opt = element.options[i];
      if(opt.selected) {
        values.push(this.optionValue(opt))
      }
    }
    return values
  },
  optionValue : function(opt) {
    return Element.extend(opt).hasAttribute("value") ? opt.value : opt.text
  }
};
Abstract.TimedObserver = Class.create(PeriodicalExecuter, {
  initialize : function($super, element, frequency, callback) {
    $super(callback, frequency);
    this.element = $(element);
    this.lastValue = this.getValue()
  },
  execute : function() {
    var value = this.getValue();
    if(Object.isString(this.lastValue) && Object.isString(value) ? this.lastValue != value : String(this.lastValue) != String(value)) {
      this.callback(this.element, value);
      this.lastValue = value
    }
  }
});
Form.Element.Observer = Class.create(Abstract.TimedObserver, {
  getValue : function() {
    return Form.Element.getValue(this.element)
  }
});
Form.Observer = Class.create(Abstract.TimedObserver, {
  getValue : function() {
    return Form.serialize(this.element)
  }
});
Abstract.EventObserver = Class.create({
  initialize : function(element, callback) {
    this.element = $(element);
    this.callback = callback;
    this.lastValue = this.getValue();
    if(this.element.tagName.toLowerCase() == "form") {
      this.registerFormCallbacks()
    } else {
      this.registerCallback(this.element)
    }
  },
  onElementEvent : function() {
    var value = this.getValue();
    if(this.lastValue != value) {
      this.callback(this.element, value);
      this.lastValue = value
    }
  },
  registerFormCallbacks : function() {
    Form.getElements(this.element).each(this.registerCallback, this)
  },
  registerCallback : function(element) {
    if(element.type) {
      switch(element.type.toLowerCase()) {
        case"checkbox":
        case"radio":
          Event.observe(element, "click", this.onElementEvent.bind(this));
          break;
        default:
          Event.observe(element, "change", this.onElementEvent.bind(this));
          break
      }
    }
  }
});
Form.Element.EventObserver = Class.create(Abstract.EventObserver, {
  getValue : function() {
    return Form.Element.getValue(this.element)
  }
});
Form.EventObserver = Class.create(Abstract.EventObserver, {
  getValue : function() {
    return Form.serialize(this.element)
  }
});
(function() {
  var Event = {
    KEY_BACKSPACE : 8,
    KEY_TAB : 9,
    KEY_RETURN : 13,
    KEY_ESC : 27,
    KEY_LEFT : 37,
    KEY_UP : 38,
    KEY_RIGHT : 39,
    KEY_DOWN : 40,
    KEY_DELETE : 46,
    KEY_HOME : 36,
    KEY_END : 35,
    KEY_PAGEUP : 33,
    KEY_PAGEDOWN : 34,
    KEY_INSERT : 45,
    cache : {}
  };
  var _isButton;
  if(Prototype.Browser.IE) {
    var buttonMap = {
      0 : 1,
      1 : 4,
      2 : 2
    };
    _isButton = function(event, code) {
      return event.button === buttonMap[code]
    }
  } else {
    if(Prototype.Browser.WebKit) {
      _isButton = function(event, code) {
        switch(code) {
          case 0:
            return event.which == 1 && !event.metaKey;
          case 1:
            return event.which == 1 && event.metaKey;
          default:
            return false
        }
      }
    } else {
      _isButton = function(event, code) {
        return event.which ? (event.which === code + 1) : (event.button === code)
      }
    }
  }
  function isLeftClick(event) {
    return _isButton(event, 0)
  }

  function isMiddleClick(event) {
    return _isButton(event, 1)
  }

  function isRightClick(event) {
    return _isButton(event, 2)
  }

  function element(event) {
    event = Event.extend(event);
    var node = event.target, type = event.type, currentTarget = event.currentTarget;
    if(currentTarget && currentTarget.tagName) {
      if(type === "load" || type === "error" || (type === "click" && currentTarget.tagName.toLowerCase() === "input" && currentTarget.type === "radio")) {
        node = currentTarget
      }
    }
    if(node.nodeType == Node.TEXT_NODE) {
      node = node.parentNode
    }
    return Element.extend(node)
  }

  function findElement(event, expression) {
    var element = Event.element(event);
    if(!expression) {
      return element
    }
    var elements = [element].concat(element.ancestors());
    return Selector.findElement(elements, expression, 0)
  }

  function pointer(event) {
    return {
      x : pointerX(event),
      y : pointerY(event)
    }
  }

  function pointerX(event) {
    var docElement = document.documentElement, body = document.body || {
      scrollLeft : 0
    };
    return event.pageX || (event.clientX + (docElement.scrollLeft || body.scrollLeft) - (docElement.clientLeft || 0))
  }

  function pointerY(event) {
    var docElement = document.documentElement, body = document.body || {
      scrollTop : 0
    };
    return event.pageY || (event.clientY + (docElement.scrollTop || body.scrollTop) - (docElement.clientTop || 0))
  }

  function stop(event) {
    Event.extend(event);
    event.preventDefault();
    event.stopPropagation();
    event.stopped = true
  }
  Event.Methods = {
    isLeftClick : isLeftClick,
    isMiddleClick : isMiddleClick,
    isRightClick : isRightClick,
    element : element,
    findElement : findElement,
    pointer : pointer,
    pointerX : pointerX,
    pointerY : pointerY,
    stop : stop
  };
  var methods = Object.keys(Event.Methods).inject({}, function(m, name) {
    m[name] = Event.Methods[name].methodize();
    return m
  });
  if(Prototype.Browser.IE) {
    function _relatedTarget(event) {
      var element;
      switch(event.type) {
        case"mouseover":
          element = event.fromElement;
          break;
        case"mouseout":
          element = event.toElement;
          break;
        default:
          return null
      }
      return Element.extend(element)
    }
    Object.extend(methods, {
      stopPropagation : function() {
        this.cancelBubble = true
      },
      preventDefault : function() {
        this.returnValue = false
      },
      inspect : function() {
        return "[object Event]"
      }
    });
    Event.extend = function(event, element) {
      if(!event) {
        return false
      }
      if(event._extendedByPrototype) {
        return event
      }
      event._extendedByPrototype = Prototype.emptyFunction;
      var pointer = Event.pointer(event);
      Object.extend(event, {
        target : event.srcElement || element,
        relatedTarget : _relatedTarget(event),
        pageX : pointer.x,
        pageY : pointer.y
      });
      return Object.extend(event, methods)
    }
  } else {
    Event.prototype = window.Event.prototype || document.createEvent("HTMLEvents").__proto__;
    Object.extend(Event.prototype, methods);
    Event.extend = Prototype.K
  }
  function _createResponder(element, eventName, handler) {
    var registry = Element.retrieve(element, "prototype_event_registry");
    if(Object.isUndefined(registry)) {
      CACHE.push(element);
      registry = Element.retrieve(element, "prototype_event_registry", $H())
    }
    var respondersForEvent = registry.get(eventName);
    if(Object.isUndefined()) {
      respondersForEvent = [];
      registry.set(eventName, respondersForEvent)
    }
    if(respondersForEvent.pluck("handler").include(handler)) {
      return false
    }
    var responder;
    if(eventName.include(":")) {
      responder = function(event) {
        if(Object.isUndefined(event.eventName)) {
          return false
        }
        if(event.eventName !== eventName) {
          return false
        }
        Event.extend(event, element);
        handler.call(element, event)
      }
    } else {
      if(!Prototype.Browser.IE && (eventName === "mouseenter" || eventName === "mouseleave")) {
        if(eventName === "mouseenter" || eventName === "mouseleave") {
          responder = function(event) {
            Event.extend(event, element);
            var parent = event.relatedTarget;
            while(parent && parent !== element) {
              try {
                parent = parent.parentNode
              } catch(e) {
                parent = element
              }
            }
            if(parent === element) {
              return
            }
            handler.call(element, event)
          }
        }
      } else {
        responder = function(event) {
          Event.extend(event, element);
          handler.call(element, event)
        }
      }
    }
    responder.handler = handler;
    respondersForEvent.push(responder);
    return responder
  }

  function _destroyCache() {
    for(var i = 0, length = CACHE.length; i < length; i++) {
      Event.stopObserving(CACHE[i]);
      CACHE[i] = null
    }
  }

  var CACHE = [];
  if(Prototype.Browser.IE) {
    window.attachEvent("onunload", _destroyCache)
  }
  if(Prototype.Browser.WebKit) {
    window.addEventListener("unload", Prototype.emptyFunction, false)
  }
  var _getDOMEventName = Prototype.K;
  if(!Prototype.Browser.IE) {
    _getDOMEventName = function(eventName) {
      var translations = {
        mouseenter : "mouseover",
        mouseleave : "mouseout"
      };
      return eventName in translations ? translations[eventName] : eventName
    }
  }
  function observe(element, eventName, handler) {
    element = $(element);
    var responder = _createResponder(element, eventName, handler);
    if(!responder) {
      return element
    }
    if(eventName.include(":")) {
      if(element.addEventListener) {
        element.addEventListener("dataavailable", responder, false)
      } else {
        element.attachEvent("ondataavailable", responder);
        element.attachEvent("onfilterchange", responder)
      }
    } else {
      var actualEventName = _getDOMEventName(eventName);
      if(element.addEventListener) {
        element.addEventListener(actualEventName, responder, false)
      } else {
        element.attachEvent("on" + actualEventName, responder)
      }
    }
    return element
  }

  function stopObserving(element, eventName, handler) {
    element = $(element);
    var registry = Element.retrieve(element, "prototype_event_registry");
    if(Object.isUndefined(registry)) {
      return element
    }
    if(eventName && !handler) {
      var responders = registry.get(eventName);
      if(Object.isUndefined(responders)) {
        return element
      }
      responders.each(function(r) {
        Element.stopObserving(element, eventName, r.handler)
      });
      return element
    } else {
      if(!eventName) {
        registry.each(function(pair) {
          var eventName = pair.key, responders = pair.value;
          responders.each(function(r) {
            Element.stopObserving(element, eventName, r.handler)
          })
        });
        return element
      }
    }
    var responders = registry.get(eventName);
    if(!responders) {
      return
    }
    var responder = responders.find(function(r) {
      return r.handler === handler
    });
    if(!responder) {
      return element
    }
    var actualEventName = _getDOMEventName(eventName);
    if(eventName.include(":")) {
      if(element.removeEventListener) {
        element.removeEventListener("dataavailable", responder, false)
      } else {
        element.detachEvent("ondataavailable", responder);
        element.detachEvent("onfilterchange", responder)
      }
    } else {
      if(element.removeEventListener) {
        element.removeEventListener(actualEventName, responder, false)
      } else {
        element.detachEvent("on" + actualEventName, responder)
      }
    }
    registry.set(eventName, responders.without(responder));
    return element
  }

  function fire(element, eventName, memo, bubble) {
    element = $(element);
    if(Object.isUndefined(bubble)) {
      bubble = true
    }
    if(element == document && document.createEvent && !element.dispatchEvent) {
      element = document.documentElement
    }
    var event;
    if(document.createEvent) {
      event = document.createEvent("HTMLEvents");
      event.initEvent("dataavailable", true, true)
    } else {
      event = document.createEventObject();
      event.eventType = bubble ? "ondataavailable" : "onfilterchange"
    }
    event.eventName = eventName;
    event.memo = memo || {};
    if(document.createEvent) {
      element.dispatchEvent(event)
    } else {
      element.fireEvent(event.eventType, event)
    }
    return Event.extend(event)
  }
  Object.extend(Event, Event.Methods);
  Object.extend(Event, {
    fire : fire,
    observe : observe,
    stopObserving : stopObserving
  });
  Element.addMethods({
    fire : fire,
    observe : observe,
    stopObserving : stopObserving
  });
  Object.extend(document, {
    fire : fire.methodize(),
    observe : observe.methodize(),
    stopObserving : stopObserving.methodize(),
    loaded : false
  });
  if(window.Event) {
    Object.extend(window.Event, Event)
  } else {
    window.Event = Event
  }
})();
(function() {
  var timer;
  function fireContentLoadedEvent() {
    if(document.loaded) {
      return
    }
    if(timer) {
      window.clearTimeout(timer)
    }
    document.loaded = true;
    document.fire("dom:loaded")
  }

  function checkReadyState() {
    if(document.readyState === "complete") {
      document.stopObserving("readystatechange", checkReadyState);
      fireContentLoadedEvent()
    }
  }

  function pollDoScroll() {
    try {
      document.documentElement.doScroll("left")
    } catch(e) {
      timer = pollDoScroll.defer();
      return
    }
    fireContentLoadedEvent()
  }

  if(document.addEventListener) {
    document.addEventListener("DOMContentLoaded", fireContentLoadedEvent, false)
  } else {
    document.observe("readystatechange", checkReadyState);
    if(window == top) {
      timer = pollDoScroll.defer()
    }
  }
  Event.observe(window, "load", fireContentLoadedEvent)
})();
Element.addMethods();
Hash.toQueryString = Object.toQueryString;
var Toggle = {
  display : Element.toggle
};
Element.Methods.childOf = Element.Methods.descendantOf;
var Insertion = {
  Before : function(element, content) {
    return Element.insert(element, {
      before : content
    })
  },
  Top : function(element, content) {
    return Element.insert(element, {
      top : content
    })
  },
  Bottom : function(element, content) {
    return Element.insert(element, {
      bottom : content
    })
  },
  After : function(element, content) {
    return Element.insert(element, {
      after : content
    })
  }
};
var $continue = new Error('"throw $continue" is deprecated, use "return" instead');
var Position = {
  includeScrollOffsets : false,
  prepare : function() {
    this.deltaX = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
    this.deltaY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
  },
  within : function(element, x, y) {
    if(this.includeScrollOffsets) {
      return this.withinIncludingScrolloffsets(element, x, y)
    }
    this.xcomp = x;
    this.ycomp = y;
    this.offset = Element.cumulativeOffset(element);
    return (y >= this.offset[1] && y < this.offset[1] + element.offsetHeight && x >= this.offset[0] && x < this.offset[0] + element.offsetWidth)
  },
  withinIncludingScrolloffsets : function(element, x, y) {
    var offsetcache = Element.cumulativeScrollOffset(element);
    this.xcomp = x + offsetcache[0] - this.deltaX;
    this.ycomp = y + offsetcache[1] - this.deltaY;
    this.offset = Element.cumulativeOffset(element);
    return (this.ycomp >= this.offset[1] && this.ycomp < this.offset[1] + element.offsetHeight && this.xcomp >= this.offset[0] && this.xcomp < this.offset[0] + element.offsetWidth)
  },
  overlap : function(mode, element) {
    if(!mode) {
      return 0
    }
    if(mode == "vertical") {
      return ((this.offset[1] + element.offsetHeight) - this.ycomp) / element.offsetHeight
    }
    if(mode == "horizontal") {
      return ((this.offset[0] + element.offsetWidth) - this.xcomp) / element.offsetWidth
    }
  },
  cumulativeOffset : Element.Methods.cumulativeOffset,
  positionedOffset : Element.Methods.positionedOffset,
  absolutize : function(element) {
    Position.prepare();
    return Element.absolutize(element)
  },
  relativize : function(element) {
    Position.prepare();
    return Element.relativize(element)
  },
  realOffset : Element.Methods.cumulativeScrollOffset,
  offsetParent : Element.Methods.getOffsetParent,
  page : Element.Methods.viewportOffset,
  clone : function(source, target, options) {
    options = options || {};
    return Element.clonePosition(target, source, options)
  }
};
if(!document.getElementsByClassName) {
  document.getElementsByClassName = function(instanceMethods) {
    function iter(name) {
      return name.blank() ? null : "[contains(concat(' ', @class, ' '), ' " + name + " ')]"
    }
    instanceMethods.getElementsByClassName = Prototype.BrowserFeatures.XPath ? function(element, className) {
      className = className.toString().strip();
      var cond = /\s/.test(className) ? $w(className).map(iter).join("") : iter(className);
      return cond ? document._getElementsByXPath(".//*" + cond, element) : []
    } : function(element, className) {
      className = className.toString().strip();
      var elements = [], classNames = (/\s/.test(className) ? $w(className) : null);
      if(!classNames && !className) {
        return elements
      }
      var nodes = $(element).getElementsByTagName("*");
      className = " " + className + " ";
      for(var i = 0, child, cn; child = nodes[i]; i++) {
        if(child.className && ( cn = " " + child.className + " ") && (cn.include(className) || (classNames && classNames.all(function(name) {
          return !name.toString().blank() && cn.include(" " + name + " ")
        })))) {
          elements.push(Element.extend(child))
        }
      }
      return elements
    };
    return function(className, parentElement) {
      return $(parentElement || document.body).getElementsByClassName(className)
    }
  }(Element.Methods)
}
Element.ClassNames = Class.create();
Element.ClassNames.prototype = {
  initialize : function(element) {
    this.element = $(element)
  },
  _each : function(iterator) {
    this.element.className.split(/\s+/).select(function(name) {
      return name.length > 0
    })._each(iterator)
  },
  set : function(className) {
    this.element.className = className
  },
  add : function(classNameToAdd) {
    if(this.include(classNameToAdd)) {
      return
    }
    this.set($A(this).concat(classNameToAdd).join(" "))
  },
  remove : function(classNameToRemove) {
    if(!this.include(classNameToRemove)) {
      return
    }
    this.set($A(this).without(classNameToRemove).join(" "))
  },
  toString : function() {
    return $A(this).join(" ")
  }
};
Object.extend(Element.ClassNames.prototype, Enumerable);

/*script.aculo.us Effects.js 1.8.2*/
String.prototype.parseColor = function() {
  var A = "#";
  if(this.slice(0, 4) == "rgb(") {
    var C = this.slice(4, this.length - 1).split(",");
    var B = 0;
    do {
      A += parseInt(C[B]).toColorPart()
    } while(++B<3)
  } else {
    if(this.slice(0, 1) == "#") {
      if(this.length == 4) {
        for(var B = 1; B < 4; B++) {
          A += (this.charAt(B) + this.charAt(B)).toLowerCase()
        }
      }
      if(this.length == 7) {
        A = this.toLowerCase()
      }
    }
  }
  return (A.length == 7 ? A : (arguments[0] || this))
};
Element.collectTextNodes = function(A) {
  return $A($(A).childNodes).collect(function(B) {
    return (B.nodeType == 3 ? B.nodeValue : (B.hasChildNodes() ? Element.collectTextNodes(B) : ""))
  }).flatten().join("")
};
Element.collectTextNodesIgnoreClass = function(A, B) {
  return $A($(A).childNodes).collect(function(C) {
    return (C.nodeType == 3 ? C.nodeValue : ((C.hasChildNodes() && !Element.hasClassName(C, B)) ? Element.collectTextNodesIgnoreClass(C, B) : ""))
  }).flatten().join("")
};
Element.setContentZoom = function(A, B) {
  A = $(A);
  A.setStyle({
    fontSize : (B / 100) + "em"
  });
  if(Prototype.Browser.WebKit) {
    window.scrollBy(0, 0)
  }
  return A
};
Element.getInlineOpacity = function(A) {
  return $(A).style.opacity || ""
};
Element.forceRerendering = function(A) {
  try {
    A = $(A);
    var C = document.createTextNode(" ");
    A.appendChild(C);
    A.removeChild(C)
  } catch(B) {
  }
};
var Effect = {
  _elementDoesNotExistError : {
    name : "ElementDoesNotExistError",
    message : "The specified DOM element does not exist, but is required for this effect to operate"
  },
  Transitions : {
    linear : Prototype.K,
    sinoidal : function(A) {
      return (-Math.cos(A * Math.PI) / 2) + 0.5
    },
    reverse : function(A) {
      return 1 - A
    },
    flicker : function(A) {
      var A = ((-Math.cos(A * Math.PI) / 4) + 0.75) + Math.random() / 4;
      return A > 1 ? 1 : A
    },
    wobble : function(A) {
      return (-Math.cos(A * Math.PI * (9 * A)) / 2) + 0.5
    },
    pulse : function(B, A) {
      return (-Math.cos((B * ((A || 5) - 0.5) * 2) * Math.PI) / 2) + 0.5
    },
    spring : function(A) {
      return 1 - (Math.cos(A * 4.5 * Math.PI) * Math.exp(-A * 6))
    },
    none : function(A) {
      return 0
    },
    full : function(A) {
      return 1
    }
  },
  DefaultOptions : {
    duration : 1,
    fps : 100,
    sync : false,
    from : 0,
    to : 1,
    delay : 0,
    queue : "parallel"
  },
  tagifyText : function(A) {
    var B = "position:relative";
    if(Prototype.Browser.IE) {
      B += ";zoom:1"
    }
    A = $(A);
    $A(A.childNodes).each(function(C) {
      if(C.nodeType == 3) {
        C.nodeValue.toArray().each(function(D) {
          A.insertBefore(new Element("span", {
            style : B
          }).update(D == " " ? String.fromCharCode(160) : D), C)
        });
        Element.remove(C)
      }
    })
  },
  multiple : function(B, C) {
    var E;
    if((( typeof B == "object") || Object.isFunction(B)) && (B.length)) {
      E = B
    } else {
      E = $(B).childNodes
    }
    var A = Object.extend({
      speed : 0.1,
      delay : 0
    }, arguments[2] || {});
    var D = A.delay;
    $A(E).each(function(G, F) {
      new C(G, Object.extend(A, {
        delay : F * A.speed + D
      }))
    })
  },
  PAIRS : {
    "slide" : ["SlideDown", "SlideUp"],
    "blind" : ["BlindDown", "BlindUp"],
    "blindside" : ["BlindRight", "BlindLeft"],
    "appear" : ["Appear", "Fade"]
  },
  toggle : function(B, C) {
    B = $(B);
    C = (C || "appear").toLowerCase();
    var A = Object.extend({
      queue : {
        position : "end",
        scope : (B.id || "global"),
        limit : 1
      }
    }, arguments[2] || {});
    Effect[B.visible()?Effect.PAIRS[C][1]:Effect.PAIRS[C][0]](B, A)
  }
};
Effect.DefaultOptions.transition = Effect.Transitions.sinoidal;
Effect.ScopedQueue = Class.create(Enumerable, {
  initialize : function() {
    this.effects = [];
    this.interval = null
  },
  _each : function(A) {
    this.effects._each(A)
  },
  add : function(B) {
    var C = new Date().getTime();
    var A = Object.isString(B.options.queue) ? B.options.queue : B.options.queue.position;
    switch(A) {
      case"front":
        this.effects.findAll(function(D) {
          return D.state == "idle"
        }).each(function(D) {
          D.startOn += B.finishOn;
          D.finishOn += B.finishOn
        });
        break;
      case"with-last":
        C = this.effects.pluck("startOn").max() || C;
        break;
      case"end":
        C = this.effects.pluck("finishOn").max() || C;
        break
    }
    B.startOn += C;
    B.finishOn += C;
    if(!B.options.queue.limit || (this.effects.length < B.options.queue.limit)) {
      this.effects.push(B)
    }
    if(!this.interval) {
      this.interval = setInterval(this.loop.bind(this), 15)
    }
  },
  remove : function(A) {
    this.effects = this.effects.reject(function(B) {
      return B == A
    });
    if(this.effects.length == 0) {
      clearInterval(this.interval);
      this.interval = null
    }
  },
  loop : function() {
    var C = new Date().getTime();
    for(var B = 0, A = this.effects.length; B < A; B++) {
      this.effects[B] && this.effects[B].loop(C)
    }
  }
});
Effect.Queues = {
  instances : $H(),
  get : function(A) {
    if(!Object.isString(A)) {
      return A
    }
    return this.instances.get(A) || this.instances.set(A, new Effect.ScopedQueue())
  }
};
Effect.Queue = Effect.Queues.get("global");
Effect.Base = Class.create({
  position : null,
  start : function(A) {
    function B(D, C) {
      return ((D[C + "Internal"] ? "this.options." + C + "Internal(this);" : "") + (D[C] ? "this.options." + C + "(this);" : ""))
    }

    if(A && A.transition === false) {
      A.transition = Effect.Transitions.linear
    }
    this.options = Object.extend(Object.extend({}, Effect.DefaultOptions), A || {});
    this.currentFrame = 0;
    this.state = "idle";
    this.startOn = this.options.delay * 1000;
    this.finishOn = this.startOn + (this.options.duration * 1000);
    this.fromToDelta = this.options.to - this.options.from;
    this.totalTime = this.finishOn - this.startOn;
    this.totalFrames = this.options.fps * this.options.duration;
    this.render = (function() {
      function C(E, D) {
        if(E.options[D + "Internal"]) {
          E.options[D+"Internal"](E)
        }
        if(E.options[D]) {
          E.options[D](E)
        }
      }

      return function(D) {
        if(this.state === "idle") {
          this.state = "running";
          C(this, "beforeSetup");
          if(this.setup) {
            this.setup()
          }
          C(this, "afterSetup")
        }
        if(this.state === "running") {
          D = (this.options.transition(D) * this.fromToDelta) + this.options.from;
          this.position = D;
          C(this, "beforeUpdate");
          if(this.update) {
            this.update(D)
          }
          C(this, "afterUpdate")
        }
      }
    })();
    this.event("beforeStart");
    if(!this.options.sync) {
      Effect.Queues.get(Object.isString(this.options.queue) ? "global" : this.options.queue.scope).add(this)
    }
  },
  loop : function(C) {
    if(C >= this.startOn) {
      if(C >= this.finishOn) {
        this.render(1);
        this.cancel();
        this.event("beforeFinish");
        if(this.finish) {
          this.finish()
        }
        this.event("afterFinish");
        return
      }
      var B = (C - this.startOn) / this.totalTime, A = (B * this.totalFrames).round();
      if(A > this.currentFrame) {
        this.render(B);
        this.currentFrame = A
      }
    }
  },
  cancel : function() {
    if(!this.options.sync) {
      Effect.Queues.get(Object.isString(this.options.queue) ? "global" : this.options.queue.scope).remove(this)
    }
    this.state = "finished"
  },
  event : function(A) {
    if(this.options[A + "Internal"]) {
      this.options[A+"Internal"](this)
    }
    if(this.options[A]) {
      this.options[A](this)
    }
  },
  inspect : function() {
    var A = $H();
    for(property in this) {
      if(!Object.isFunction(this[property])) {
        A.set(property, this[property])
      }
    }
    return "#<Effect:" + A.inspect() + ",options:" + $H(this.options).inspect() + ">"
  }
});
Effect.Parallel = Class.create(Effect.Base, {
  initialize : function(A) {
    this.effects = A || [];
    this.start(arguments[1])
  },
  update : function(A) {
    this.effects.invoke("render", A)
  },
  finish : function(A) {
    this.effects.each(function(B) {
      B.render(1);
      B.cancel();
      B.event("beforeFinish");
      if(B.finish) {
        B.finish(A)
      }
      B.event("afterFinish")
    })
  }
});
Effect.Tween = Class.create(Effect.Base, {
  initialize : function(C, F, E) {
    C = Object.isString(C) ? $(C) : C;
    var B = $A(arguments), D = B.last(), A = B.length == 5 ? B[3] : null;
    this.method = Object.isFunction(D) ? D.bind(C) : Object.isFunction(C[D]) ? C[D].bind(C) : function(G) {
      C[D] = G
    };
    this.start(Object.extend({
      from : F,
      to : E
    }, A || {}))
  },
  update : function(A) {
    this.method(A)
  }
});
Effect.Event = Class.create(Effect.Base, {
  initialize : function() {
    this.start(Object.extend({
      duration : 0
    }, arguments[0] || {}))
  },
  update : Prototype.emptyFunction
});
Effect.Opacity = Class.create(Effect.Base, {
  initialize : function(B) {
    this.element = $(B);
    if(!this.element) {
      throw (Effect._elementDoesNotExistError)
    }
    if(Prototype.Browser.IE && (!this.element.currentStyle.hasLayout)) {
      this.element.setStyle({
        zoom : 1
      })
    }
    var A = Object.extend({
      from : this.element.getOpacity() || 0,
      to : 1
    }, arguments[1] || {});
    this.start(A)
  },
  update : function(A) {
    this.element.setOpacity(A)
  }
});
Effect.Move = Class.create(Effect.Base, {
  initialize : function(B) {
    this.element = $(B);
    if(!this.element) {
      throw (Effect._elementDoesNotExistError)
    }
    var A = Object.extend({
      x : 0,
      y : 0,
      mode : "relative"
    }, arguments[1] || {});
    this.start(A)
  },
  setup : function() {
    this.element.makePositioned();
    this.originalLeft = parseFloat(this.element.getStyle("left") || "0");
    this.originalTop = parseFloat(this.element.getStyle("top") || "0");
    if(this.options.mode == "absolute") {
      this.options.x = this.options.x - this.originalLeft;
      this.options.y = this.options.y - this.originalTop
    }
  },
  update : function(A) {
    this.element.setStyle({
      left : (this.options.x * A + this.originalLeft).round() + "px",
      top : (this.options.y * A + this.originalTop).round() + "px"
    })
  }
});
Effect.MoveBy = function(B, A, C) {
  return new Effect.Move(B, Object.extend({
    x : C,
    y : A
  }, arguments[3] || {}))
};
Effect.Scale = Class.create(Effect.Base, {
  initialize : function(B, C) {
    this.element = $(B);
    if(!this.element) {
      throw (Effect._elementDoesNotExistError)
    }
    var A = Object.extend({
      scaleX : true,
      scaleY : true,
      scaleContent : true,
      scaleFromCenter : false,
      scaleMode : "box",
      scaleFrom : 100,
      scaleTo : C
    }, arguments[2] || {});
    this.start(A)
  },
  setup : function() {
    this.restoreAfterFinish = this.options.restoreAfterFinish || false;
    this.elementPositioning = this.element.getStyle("position");
    this.originalStyle = {};
    ["top", "left", "width", "height", "fontSize"].each( function(B) {
      this.originalStyle[B] = this.element.style[B]
    }.bind(this));
    this.originalTop = this.element.offsetTop;
    this.originalLeft = this.element.offsetLeft;
    var A = this.element.getStyle("font-size") || "100%";
    ["em", "px", "%", "pt"].each( function(B) {
      if(A.indexOf(B) > 0) {
        this.fontSize = parseFloat(A);
        this.fontSizeType = B
      }
    }.bind(this));
    this.factor = (this.options.scaleTo - this.options.scaleFrom) / 100;
    this.dims = null;
    if(this.options.scaleMode == "box") {
      this.dims = [this.element.offsetHeight, this.element.offsetWidth]
    }
    if(/^content/.test(this.options.scaleMode)) {
      this.dims = [this.element.scrollHeight, this.element.scrollWidth]
    }
    if(!this.dims) {
      this.dims = [this.options.scaleMode.originalHeight, this.options.scaleMode.originalWidth]
    }
  },
  update : function(A) {
    var B = (this.options.scaleFrom / 100) + (this.factor * A);
    if(this.options.scaleContent && this.fontSize) {
      this.element.setStyle({
        fontSize : this.fontSize * B + this.fontSizeType
      })
    }
    this.setDimensions(this.dims[0] * B, this.dims[1] * B)
  },
  finish : function(A) {
    if(this.restoreAfterFinish) {
      this.element.setStyle(this.originalStyle)
    }
  },
  setDimensions : function(A, D) {
    var E = {};
    if(this.options.scaleX) {
      E.width = D.round() + "px"
    }
    if(this.options.scaleY) {
      E.height = A.round() + "px"
    }
    if(this.options.scaleFromCenter) {
      var C = (A - this.dims[0]) / 2;
      var B = (D - this.dims[1]) / 2;
      if(this.elementPositioning == "absolute") {
        if(this.options.scaleY) {
          E.top = this.originalTop - C + "px"
        }
        if(this.options.scaleX) {
          E.left = this.originalLeft - B + "px"
        }
      } else {
        if(this.options.scaleY) {
          E.top = -C + "px"
        }
        if(this.options.scaleX) {
          E.left = -B + "px"
        }
      }
    }
    this.element.setStyle(E)
  }
});
Effect.Highlight = Class.create(Effect.Base, {
  initialize : function(B) {
    this.element = $(B);
    if(!this.element) {
      throw (Effect._elementDoesNotExistError)
    }
    var A = Object.extend({
      startcolor : "#ffff99"
    }, arguments[1] || {});
    this.start(A)
  },
  setup : function() {
    if(this.element.getStyle("display") == "none") {
      this.cancel();
      return
    }
    this.oldStyle = {};
    if(!this.options.keepBackgroundImage) {
      this.oldStyle.backgroundImage = this.element.getStyle("background-image");
      this.element.setStyle({
        backgroundImage : "none"
      })
    }
    if(!this.options.endcolor) {
      this.options.endcolor = this.element.getStyle("background-color").parseColor("#ffffff")
    }
    if(!this.options.restorecolor) {
      this.options.restorecolor = this.element.getStyle("background-color")
    }
    this._base = $R(0, 2).map( function(A) {
      return parseInt(this.options.startcolor.slice(A * 2 + 1, A * 2 + 3), 16)
    }.bind(this));
    this._delta = $R(0, 2).map( function(A) {
      return parseInt(this.options.endcolor.slice(A * 2 + 1, A * 2 + 3), 16) - this._base[A]
    }.bind(this))
  },
  update : function(A) {
    this.element.setStyle({
      backgroundColor : $R(0, 2).inject("#", function(B, C, D) {
        return B + ((this._base[D] + (this._delta[D] * A)).round().toColorPart())
      }.bind(this))
    })
  },
  finish : function() {
    this.element.setStyle(Object.extend(this.oldStyle, {
      backgroundColor : this.options.restorecolor
    }))
  }
});
Effect.ScrollTo = function(C) {
  var B = arguments[1] || {}, A = document.viewport.getScrollOffsets(), D = $(C).cumulativeOffset();
  if(B.offset) {
    D[1] += B.offset
  }
  return new Effect.Tween(null, A.top, D[1], B, function(E) {
    scrollTo(A.left, E.round())
  })
};
Effect.Fade = function(C) {
  C = $(C);
  var A = C.getInlineOpacity();
  var B = Object.extend({
    from : C.getOpacity() || 1,
    to : 0,
    afterFinishInternal : function(D) {
      if(D.options.to != 0) {
        return
      }
      D.element.hide().setStyle({
        opacity : A
      })
    }
  }, arguments[1] || {});
  return new Effect.Opacity(C, B)
};
Effect.Appear = function(B) {
  B = $(B);
  var A = Object.extend({
    from : (B.getStyle("display") == "none" ? 0 : B.getOpacity() || 0),
    to : 1,
    afterFinishInternal : function(C) {
      C.element.forceRerendering()
    },
    beforeSetup : function(C) {
      C.element.setOpacity(C.options.from).show()
    }
  }, arguments[1] || {});
  return new Effect.Opacity(B, A)
};
Effect.Puff = function(B) {
  B = $(B);
  var A = {
    opacity : B.getInlineOpacity(),
    position : B.getStyle("position"),
    top : B.style.top,
    left : B.style.left,
    width : B.style.width,
    height : B.style.height
  };
  return new Effect.Parallel([new Effect.Scale(B, 200, {
    sync : true,
    scaleFromCenter : true,
    scaleContent : true,
    restoreAfterFinish : true
  }), new Effect.Opacity(B, {
    sync : true,
    to : 0
  })], Object.extend({
    duration : 1,
    beforeSetupInternal : function(C) {
      Position.absolutize(C.effects[0].element)
    },
    afterFinishInternal : function(C) {
      C.effects[0].element.hide().setStyle(A)
    }
  }, arguments[1] || {}))
};
Effect.BlindUp = function(A) {
  A = $(A);
  A.makeClipping();
  return new Effect.Scale(A, 0, Object.extend({
    scaleContent : false,
    scaleX : false,
    restoreAfterFinish : true,
    afterFinishInternal : function(B) {
      B.element.hide().undoClipping()
    }
  }, arguments[1] || {}))
};
Effect.BlindDown = function(B) {
  B = $(B);
  var A = B.getDimensions();
  return new Effect.Scale(B, 100, Object.extend({
    scaleContent : false,
    scaleX : false,
    scaleFrom : 0,
    scaleMode : {
      originalHeight : A.height,
      originalWidth : A.width
    },
    restoreAfterFinish : true,
    afterSetup : function(C) {
      C.element.makeClipping().setStyle({
        height : "0px"
      }).show()
    },
    afterFinishInternal : function(C) {
      C.element.undoClipping()
    }
  }, arguments[1] || {}))
};
Effect.BlindLeft = function(A) {
  A = $(A);
  A.makeClipping();
  return new Effect.Scale(A, 0, Object.extend({
    scaleContent : false,
    scaleY : false,
    restoreAfterFinish : true,
    afterFinishInternal : function(B) {
      B.element.hide().undoClipping()
    }
  }, arguments[1] || {}))
};
Effect.BlindRight = function(B) {
  B = $(B);
  var A = B.getDimensions();
  return new Effect.Scale(B, 100, Object.extend({
    scaleContent : false,
    scaleY : false,
    scaleFrom : 0,
    scaleMode : {
      originalHeight : A.height,
      originalWidth : A.width
    },
    restoreAfterFinish : true,
    afterSetup : function(C) {
      C.element.makeClipping().setStyle({
        width : "0px"
      }).show()
    },
    afterFinishInternal : function(C) {
      C.element.undoClipping()
    }
  }, arguments[1] || {}))
};
Effect.SwitchOff = function(B) {
  B = $(B);
  var A = B.getInlineOpacity();
  return new Effect.Appear(B, Object.extend({
    duration : 0.4,
    from : 0,
    transition : Effect.Transitions.flicker,
    afterFinishInternal : function(C) {
      new Effect.Scale(C.element, 1, {
        duration : 0.3,
        scaleFromCenter : true,
        scaleX : false,
        scaleContent : false,
        restoreAfterFinish : true,
        beforeSetup : function(D) {
          D.element.makePositioned().makeClipping()
        },
        afterFinishInternal : function(D) {
          D.element.hide().undoClipping().undoPositioned().setStyle({
            opacity : A
          })
        }
      })
    }
  }, arguments[1] || {}))
};
Effect.DropOut = function(B) {
  B = $(B);
  var A = {
    top : B.getStyle("top"),
    left : B.getStyle("left"),
    opacity : B.getInlineOpacity()
  };
  return new Effect.Parallel([new Effect.Move(B, {
    x : 0,
    y : 100,
    sync : true
  }), new Effect.Opacity(B, {
    sync : true,
    to : 0
  })], Object.extend({
    duration : 0.5,
    beforeSetup : function(C) {
      C.effects[0].element.makePositioned()
    },
    afterFinishInternal : function(C) {
      C.effects[0].element.hide().undoPositioned().setStyle(A)
    }
  }, arguments[1] || {}))
};
Effect.Shake = function(D) {
  D = $(D);
  var B = Object.extend({
    distance : 20,
    duration : 0.5
  }, arguments[1] || {});
  var E = parseFloat(B.distance);
  var C = parseFloat(B.duration) / 10;
  var A = {
    top : D.getStyle("top"),
    left : D.getStyle("left")
  };
  return new Effect.Move(D, {
    x : E,
    y : 0,
    duration : C,
    afterFinishInternal : function(F) {
      new Effect.Move(F.element, {
        x : -E * 2,
        y : 0,
        duration : C * 2,
        afterFinishInternal : function(G) {
          new Effect.Move(G.element, {
            x : E * 2,
            y : 0,
            duration : C * 2,
            afterFinishInternal : function(H) {
              new Effect.Move(H.element, {
                x : -E * 2,
                y : 0,
                duration : C * 2,
                afterFinishInternal : function(I) {
                  new Effect.Move(I.element, {
                    x : E * 2,
                    y : 0,
                    duration : C * 2,
                    afterFinishInternal : function(J) {
                      new Effect.Move(J.element, {
                        x : -E,
                        y : 0,
                        duration : C,
                        afterFinishInternal : function(K) {
                          K.element.undoPositioned().setStyle(A)
                        }
                      })
                    }
                  })
                }
              })
            }
          })
        }
      })
    }
  })
};
Effect.SlideDown = function(C) {
  C = $(C).cleanWhitespace();
  var A = C.down().getStyle("bottom");
  var B = C.getDimensions();
  return new Effect.Scale(C, 100, Object.extend({
    scaleContent : false,
    scaleX : false,
    scaleFrom : window.opera ? 0 : 1,
    scaleMode : {
      originalHeight : B.height,
      originalWidth : B.width
    },
    restoreAfterFinish : true,
    afterSetup : function(D) {
      D.element.makePositioned();
      D.element.down().makePositioned();
      if(window.opera) {
        D.element.setStyle({
          top : ""
        })
      }
      D.element.makeClipping().setStyle({
        height : "0px"
      }).show()
    },
    afterUpdateInternal : function(D) {
      D.element.down().setStyle({
        bottom : (D.dims[0] - D.element.clientHeight) + "px"
      })
    },
    afterFinishInternal : function(D) {
      D.element.undoClipping().undoPositioned();
      D.element.down().undoPositioned().setStyle({
        bottom : A
      })
    }
  }, arguments[1] || {}))
};
Effect.SlideUp = function(C) {
  C = $(C).cleanWhitespace();
  var A = C.down().getStyle("bottom");
  var B = C.getDimensions();
  return new Effect.Scale(C, window.opera ? 0 : 1, Object.extend({
    scaleContent : false,
    scaleX : false,
    scaleMode : "box",
    scaleFrom : 100,
    scaleMode : {
      originalHeight : B.height,
      originalWidth : B.width
    },
    restoreAfterFinish : true,
    afterSetup : function(D) {
      D.element.makePositioned();
      D.element.down().makePositioned();
      if(window.opera) {
        D.element.setStyle({
          top : ""
        })
      }
      D.element.makeClipping().show()
    },
    afterUpdateInternal : function(D) {
      D.element.down().setStyle({
        bottom : (D.dims[0] - D.element.clientHeight) + "px"
      })
    },
    afterFinishInternal : function(D) {
      D.element.hide().undoClipping().undoPositioned();
      D.element.down().undoPositioned().setStyle({
        bottom : A
      })
    }
  }, arguments[1] || {}))
};
Effect.Squish = function(A) {
  return new Effect.Scale(A, window.opera ? 1 : 0, {
    restoreAfterFinish : true,
    beforeSetup : function(B) {
      B.element.makeClipping()
    },
    afterFinishInternal : function(B) {
      B.element.hide().undoClipping()
    }
  })
};
Effect.Grow = function(C) {
  C = $(C);
  var B = Object.extend({
    direction : "center",
    moveTransition : Effect.Transitions.sinoidal,
    scaleTransition : Effect.Transitions.sinoidal,
    opacityTransition : Effect.Transitions.full
  }, arguments[1] || {});
  var A = {
    top : C.style.top,
    left : C.style.left,
    height : C.style.height,
    width : C.style.width,
    opacity : C.getInlineOpacity()
  };
  var G = C.getDimensions();
  var H, F;
  var E, D;
  switch(B.direction) {
    case"top-left":
      H = F = E = D = 0;
      break;
    case"top-right":
      H = G.width;
      F = D = 0;
      E = -G.width;
      break;
    case"bottom-left":
      H = E = 0;
      F = G.height;
      D = -G.height;
      break;
    case"bottom-right":
      H = G.width;
      F = G.height;
      E = -G.width;
      D = -G.height;
      break;
    case"center":
      H = G.width / 2;
      F = G.height / 2;
      E = -G.width / 2;
      D = -G.height / 2;
      break
  }
  return new Effect.Move(C, {
    x : H,
    y : F,
    duration : 0.01,
    beforeSetup : function(I) {
      I.element.hide().makeClipping().makePositioned()
    },
    afterFinishInternal : function(I) {
      new Effect.Parallel([new Effect.Opacity(I.element, {
        sync : true,
        to : 1,
        from : 0,
        transition : B.opacityTransition
      }), new Effect.Move(I.element, {
        x : E,
        y : D,
        sync : true,
        transition : B.moveTransition
      }), new Effect.Scale(I.element, 100, {
        scaleMode : {
          originalHeight : G.height,
          originalWidth : G.width
        },
        sync : true,
        scaleFrom : window.opera ? 1 : 0,
        transition : B.scaleTransition,
        restoreAfterFinish : true
      })], Object.extend({
        beforeSetup : function(J) {
          J.effects[0].element.setStyle({
            height : "0px"
          }).show()
        },
        afterFinishInternal : function(J) {
          J.effects[0].element.undoClipping().undoPositioned().setStyle(A)
        }
      }, B))
    }
  })
};
Effect.Shrink = function(C) {
  C = $(C);
  var B = Object.extend({
    direction : "center",
    moveTransition : Effect.Transitions.sinoidal,
    scaleTransition : Effect.Transitions.sinoidal,
    opacityTransition : Effect.Transitions.none
  }, arguments[1] || {});
  var A = {
    top : C.style.top,
    left : C.style.left,
    height : C.style.height,
    width : C.style.width,
    opacity : C.getInlineOpacity()
  };
  var F = C.getDimensions();
  var E, D;
  switch(B.direction) {
    case"top-left":
      E = D = 0;
      break;
    case"top-right":
      E = F.width;
      D = 0;
      break;
    case"bottom-left":
      E = 0;
      D = F.height;
      break;
    case"bottom-right":
      E = F.width;
      D = F.height;
      break;
    case"center":
      E = F.width / 2;
      D = F.height / 2;
      break
  }
  return new Effect.Parallel([new Effect.Opacity(C, {
    sync : true,
    to : 0,
    from : 1,
    transition : B.opacityTransition
  }), new Effect.Scale(C, window.opera ? 1 : 0, {
    sync : true,
    transition : B.scaleTransition,
    restoreAfterFinish : true
  }), new Effect.Move(C, {
    x : E,
    y : D,
    sync : true,
    transition : B.moveTransition
  })], Object.extend({
    beforeStartInternal : function(G) {
      G.effects[0].element.makePositioned().makeClipping()
    },
    afterFinishInternal : function(G) {
      G.effects[0].element.hide().undoClipping().undoPositioned().setStyle(A)
    }
  }, B))
};
Effect.Pulsate = function(C) {
  C = $(C);
  var B = arguments[1] || {}, A = C.getInlineOpacity(), E = B.transition || Effect.Transitions.linear, D = function(F) {
    return 1 - E((-Math.cos((F * (B.pulses || 5) * 2) * Math.PI) / 2) + 0.5)
  };
  return new Effect.Opacity(C, Object.extend(Object.extend({
    duration : 2,
    from : 0,
    afterFinishInternal : function(F) {
      F.element.setStyle({
        opacity : A
      })
    }
  }, B), {
    transition : D
  }))
};
Effect.Fold = function(B) {
  B = $(B);
  var A = {
    top : B.style.top,
    left : B.style.left,
    width : B.style.width,
    height : B.style.height
  };
  B.makeClipping();
  return new Effect.Scale(B, 5, Object.extend({
    scaleContent : false,
    scaleX : false,
    afterFinishInternal : function(C) {
      new Effect.Scale(B, 1, {
        scaleContent : false,
        scaleY : false,
        afterFinishInternal : function(D) {
          D.element.hide().undoClipping().setStyle(A)
        }
      })
    }
  }, arguments[1] || {}))
};
Effect.Morph = Class.create(Effect.Base, {
  initialize : function(C) {
    this.element = $(C);
    if(!this.element) {
      throw (Effect._elementDoesNotExistError)
    }
    var A = Object.extend({
      style : {}
    }, arguments[1] || {});
    if(!Object.isString(A.style)) {
      this.style = $H(A.style)
    } else {
      if(A.style.include(":")) {
        this.style = A.style.parseStyle()
      } else {
        this.element.addClassName(A.style);
        this.style = $H(this.element.getStyles());
        this.element.removeClassName(A.style);
        var B = this.element.getStyles();
        this.style = this.style.reject(function(D) {
          return D.value == B[D.key]
        });
        A.afterFinishInternal = function(D) {
          D.element.addClassName(D.options.style);
          D.transforms.each(function(E) {
            D.element.style[E.style] = ""
          })
        }
      }
    }
    this.start(A)
  },
  setup : function() {
    function A(B) {
      if(!B || ["rgba(0, 0, 0, 0)", "transparent"].include(B)) {
        B = "#ffffff"
      }
      B = B.parseColor();
      return $R(0, 2).map(function(C) {
        return parseInt(B.slice(C * 2 + 1, C * 2 + 3), 16)
      })
    }
    this.transforms = this.style.map( function(G) {
      var F = G[0], E = G[1], D = null;
      if(E.parseColor("#zzzzzz") != "#zzzzzz") {
        E = E.parseColor();
        D = "color"
      } else {
        if(F == "opacity") {
          E = parseFloat(E);
          if(Prototype.Browser.IE && (!this.element.currentStyle.hasLayout)) {
            this.element.setStyle({
              zoom : 1
            })
          }
        } else {
          if(Element.CSS_LENGTH.test(E)) {
            var C = E.match(/^([\+\-]?[0-9\.]+)(.*)$/);
            E = parseFloat(C[1]);
            D = (C.length == 3) ? C[2] : null
          }
        }
      }
      var B = this.element.getStyle(F);
      return {
        style : F.camelize(),
        originalValue : D == "color" ? A(B) : parseFloat(B || 0),
        targetValue : D == "color" ? A(E) : E,
        unit : D
      }
    }.bind(this)).reject(function(B) {
      return ((B.originalValue == B.targetValue) || (B.unit != "color" && (isNaN(B.originalValue) || isNaN(B.targetValue))))
    })
  },
  update : function(A) {
    var D = {}, B, C = this.transforms.length;
    while(C--) {
      D[( B = this.transforms[C]).style] = B.unit == "color" ? "#" + (Math.round(B.originalValue[0] + (B.targetValue[0] - B.originalValue[0]) * A)).toColorPart() + (Math.round(B.originalValue[1] + (B.targetValue[1] - B.originalValue[1]) * A)).toColorPart() + (Math.round(B.originalValue[2] + (B.targetValue[2] - B.originalValue[2]) * A)).toColorPart() : (B.originalValue + (B.targetValue - B.originalValue) * A).toFixed(3) + (B.unit === null ? "" : B.unit)
    }
    this.element.setStyle(D, true)
  }
});
Effect.Transform = Class.create({
  initialize : function(A) {
    this.tracks = [];
    this.options = arguments[1] || {};
    this.addTracks(A)
  },
  addTracks : function(A) {
    A.each( function(B) {
      B = $H(B);
      var C = B.values().first();
      this.tracks.push($H({
        ids : B.keys().first(),
        effect : Effect.Morph,
        options : {
          style : C
        }
      }))
    }.bind(this));
    return this
  },
  play : function() {
    return new Effect.Parallel(this.tracks.map(function(A) {
      var D = A.get("ids"), C = A.get("effect"), B = A.get("options");
      var E = [$(D) || $$(D)].flatten();
      return E.map(function(F) {
        return new C(F, Object.extend({
          sync : true
        }, B))
      })
    }).flatten(), this.options)
  }
});
Element.CSS_PROPERTIES = $w("backgroundColor backgroundPosition borderBottomColor borderBottomStyle borderBottomWidth borderLeftColor borderLeftStyle borderLeftWidth borderRightColor borderRightStyle borderRightWidth borderSpacing borderTopColor borderTopStyle borderTopWidth bottom clip color fontSize fontWeight height left letterSpacing lineHeight marginBottom marginLeft marginRight marginTop markerOffset maxHeight maxWidth minHeight minWidth opacity outlineColor outlineOffset outlineWidth paddingBottom paddingLeft paddingRight paddingTop right textIndent top width wordSpacing zIndex");
Element.CSS_LENGTH = /^(([\+\-]?[0-9\.]+)(em|ex|px|in|cm|mm|pt|pc|\%))|0$/;
String.__parseStyleElement = document.createElement("div");
String.prototype.parseStyle = function() {
  var B, A = $H();
  if(Prototype.Browser.WebKit) {
    B = new Element("div", {
      style : this
    }).style
  } else {
    String.__parseStyleElement.innerHTML = '<div style="' + this + '"></div>';
    B = String.__parseStyleElement.childNodes[0].style
  }
  Element.CSS_PROPERTIES.each(function(C) {
    if(B[C]) {
      A.set(C, B[C])
    }
  });
  if(Prototype.Browser.IE && this.include("opacity")) {
    A.set("opacity", this.match(/opacity:\s*((?:0|1)?(?:\.\d*)?)/)[1])
  }
  return A
};
if(document.defaultView && document.defaultView.getComputedStyle) {
  Element.getStyles = function(B) {
    var A = document.defaultView.getComputedStyle($(B), null);
    return Element.CSS_PROPERTIES.inject({}, function(C, D) {
      C[D] = A[D];
      return C
    })
  }
} else {
  Element.getStyles = function(B) {
    B = $(B);
    var A = B.currentStyle, C;
    C = Element.CSS_PROPERTIES.inject({}, function(D, E) {
      D[E] = A[E];
      return D
    });
    if(!C.opacity) {
      C.opacity = B.getOpacity()
    }
    return C
  }
}
Effect.Methods = {
  morph : function(A, B) {
    A = $(A);
    new Effect.Morph(A, Object.extend({
      style : B
    }, arguments[2] || {}));
    return A
  },
  visualEffect : function(C, E, B) {
    C = $(C);
    var D = E.dasherize().camelize(), A = D.charAt(0).toUpperCase() + D.substring(1);
    new Effect[A](C, B);
    return C
  },
  highlight : function(B, A) {
    B = $(B);
    new Effect.Highlight(B, A);
    return B
  }
};
$w("fade appear grow shrink fold blindUp blindDown slideUp slideDown pulsate shake puff squish switchOff dropOut").each(function(A) {
  Effect.Methods[A] = function(C, B) {
    C = $(C);
    Effect[A.charAt(0).toUpperCase()+A.substring(1)](C, B);
    return C
  }
});
$w("getInlineOpacity forceRerendering setContentZoom collectTextNodes collectTextNodesIgnoreClass getStyles").each(function(A) {
  Effect.Methods[A] = Element[A]
});
Element.addMethods(Effect.Methods)

/*SWFObject v2.2*/
var swfobject = function() {
  var D = "undefined", r = "object", S = "Shockwave Flash", W = "ShockwaveFlash.ShockwaveFlash", q = "application/x-shockwave-flash", R = "SWFObjectExprInst", x = "onreadystatechange", O = window, j = document, t = navigator, T = false, U = [h], o = [], N = [], I = [], l, Q, E, B, J = false, a = false, n, G, m = true, M = function() {
    var aa = typeof j.getElementById != D && typeof j.getElementsByTagName != D && typeof j.createElement != D, ah = t.userAgent.toLowerCase(), Y = t.platform.toLowerCase(), ae = Y ? /win/.test(Y) : /win/.test(ah), ac = Y ? /mac/.test(Y) : /mac/.test(ah), af = /webkit/.test(ah) ? parseFloat(ah.replace(/^.*webkit\/(\d+(\.\d+)?).*$/, "$1")) : false, X = !+"\v1", ag = [0, 0, 0], ab = null;
    if( typeof t.plugins != D && typeof t.plugins[S] == r) {
      ab = t.plugins[S].description;
      if(ab && !( typeof t.mimeTypes != D && t.mimeTypes[q] && !t.mimeTypes[q].enabledPlugin)) {
        T = true;
        X = false;
        ab = ab.replace(/^.*\s+(\S+\s+\S+$)/, "$1");
        ag[0] = parseInt(ab.replace(/^(.*)\..*$/, "$1"), 10);
        ag[1] = parseInt(ab.replace(/^.*\.(.*)\s.*$/, "$1"), 10);
        ag[2] = /[a-zA-Z]/.test(ab) ? parseInt(ab.replace(/^.*[a-zA-Z]+(.*)$/, "$1"), 10) : 0
      }
    } else {
      if( typeof O.ActiveXObject != D) {
        try {
          var ad = new ActiveXObject(W);
          if(ad) {
            ab = ad.GetVariable("$version");
            if(ab) {
              X = true;
              ab = ab.split(" ")[1].split(",");
              ag = [parseInt(ab[0], 10), parseInt(ab[1], 10), parseInt(ab[2], 10)]
            }
          }
        } catch(Z) {
        }
      }
    }
    return {
      w3 : aa,
      pv : ag,
      wk : af,
      ie : X,
      win : ae,
      mac : ac
    }
  }(), k = function() {
    if(!M.w3) {
      return
    }
    if(( typeof j.readyState != D && j.readyState == "complete") || ( typeof j.readyState == D && (j.getElementsByTagName("body")[0] || j.body))) {
      f()
    }
    if(!J) {
      if( typeof j.addEventListener != D) {
        j.addEventListener("DOMContentLoaded", f, false)
      }
      if(M.ie && M.win) {
        j.attachEvent(x, function() {
          if(j.readyState == "complete") {
            j.detachEvent(x, arguments.callee);
            f()
          }
        });
        if(O == top) {(function() {
            if(J) {
              return
            }
            try {
              j.documentElement.doScroll("left")
            } catch(X) {
              setTimeout(arguments.callee, 0);
              return
            }
            f()
          })()
        }
      }
      if(M.wk) {(function() {
          if(J) {
            return
          }
          if(!/loaded|complete/.test(j.readyState)) {
            setTimeout(arguments.callee, 0);
            return
          }
          f()
        })()
      }
      s(f)
    }
  }();
  function f() {
    if(J) {
      return
    }
    try {
      var Z = j.getElementsByTagName("body")[0].appendChild(C("span"));
      Z.parentNode.removeChild(Z)
    } catch(aa) {
      return
    }
    J = true;
    var X = U.length;
    for(var Y = 0; Y < X; Y++) {
      U[Y]()
    }
  }

  function K(X) {
    if(J) {
      X()
    } else {
      U[U.length] = X
    }
  }

  function s(Y) {
    if( typeof O.addEventListener != D) {
      O.addEventListener("load", Y, false)
    } else {
      if( typeof j.addEventListener != D) {
        j.addEventListener("load", Y, false)
      } else {
        if( typeof O.attachEvent != D) {
          i(O, "onload", Y)
        } else {
          if( typeof O.onload == "function") {
            var X = O.onload;
            O.onload = function() {
              X();
              Y()
            }
          } else {
            O.onload = Y
          }
        }
      }
    }
  }

  function h() {
    if(T) {
      V()
    } else {
      H()
    }
  }

  function V() {
    var X = j.getElementsByTagName("body")[0];
    var aa = C(r);
    aa.setAttribute("type", q);
    var Z = X.appendChild(aa);
    if(Z) {
      var Y = 0;
      (function() {
        if( typeof Z.GetVariable != D) {
          var ab = Z.GetVariable("$version");
          if(ab) {
            ab = ab.split(" ")[1].split(",");
            M.pv = [parseInt(ab[0], 10), parseInt(ab[1], 10), parseInt(ab[2], 10)]
          }
        } else {
          if(Y < 10) {
            Y++;
            setTimeout(arguments.callee, 10);
            return
          }
        }
        X.removeChild(aa);
        Z = null;
        H()
      })()
    } else {
      H()
    }
  }

  function H() {
    var ag = o.length;
    if(ag > 0) {
      for(var af = 0; af < ag; af++) {
        var Y = o[af].id;
        var ab = o[af].callbackFn;
        var aa = {
          success : false,
          id : Y
        };
        if(M.pv[0] > 0) {
          var ae = c(Y);
          if(ae) {
            if(F(o[af].swfVersion) && !(M.wk && M.wk < 312)) {
              w(Y, true);
              if(ab) {
                aa.success = true;
                aa.ref = z(Y);
                ab(aa)
              }
            } else {
              if(o[af].expressInstall && A()) {
                var ai = {};
                ai.data = o[af].expressInstall;
                ai.width = ae.getAttribute("width") || "0";
                ai.height = ae.getAttribute("height") || "0";
                if(ae.getAttribute("class")) {
                  ai.styleclass = ae.getAttribute("class")
                }
                if(ae.getAttribute("align")) {
                  ai.align = ae.getAttribute("align")
                }
                var ah = {};
                var X = ae.getElementsByTagName("param");
                var ac = X.length;
                for(var ad = 0; ad < ac; ad++) {
                  if(X[ad].getAttribute("name").toLowerCase() != "movie") {
                    ah[X[ad].getAttribute("name")] = X[ad].getAttribute("value")
                  }
                }
                P(ai, ah, Y, ab)
              } else {
                p(ae);
                if(ab) {
                  ab(aa)
                }
              }
            }
          }
        } else {
          w(Y, true);
          if(ab) {
            var Z = z(Y);
            if(Z && typeof Z.SetVariable != D) {
              aa.success = true;
              aa.ref = Z
            }
            ab(aa)
          }
        }
      }
    }
  }

  function z(aa) {
    var X = null;
    var Y = c(aa);
    if(Y && Y.nodeName == "OBJECT") {
      if( typeof Y.SetVariable != D) {
        X = Y
      } else {
        var Z = Y.getElementsByTagName(r)[0];
        if(Z) {
          X = Z
        }
      }
    }
    return X
  }

  function A() {
    return !a && F("6.0.65") && (M.win || M.mac) && !(M.wk && M.wk < 312)
  }

  function P(aa, ab, X, Z) {
    a = true;
    E = Z || null;
    B = {
      success : false,
      id : X
    };
    var ae = c(X);
    if(ae) {
      if(ae.nodeName == "OBJECT") {
        l = g(ae);
        Q = null
      } else {
        l = ae;
        Q = X
      }
      aa.id = R;
      if( typeof aa.width == D || (!/%$/.test(aa.width) && parseInt(aa.width, 10) < 310)) {
        aa.width = "310"
      }
      if( typeof aa.height == D || (!/%$/.test(aa.height) && parseInt(aa.height, 10) < 137)) {
        aa.height = "137"
      }
      j.title = j.title.slice(0, 47) + " - Flash Player Installation";
      var ad = M.ie && M.win ? "ActiveX" : "PlugIn", ac = "MMredirectURL=" + O.location.toString().replace(/&/g, "%26") + "&MMplayerType=" + ad + "&MMdoctitle=" + j.title;
      if( typeof ab.flashvars != D) {
        ab.flashvars += "&" + ac
      } else {
        ab.flashvars = ac
      }
      if(M.ie && M.win && ae.readyState != 4) {
        var Y = C("div");
        X += "SWFObjectNew";
        Y.setAttribute("id", X);
        ae.parentNode.insertBefore(Y, ae);
        ae.style.display = "none";
        (function() {
          if(ae.readyState == 4) {
            ae.parentNode.removeChild(ae)
          } else {
            setTimeout(arguments.callee, 10)
          }
        })()
      }
      u(aa, ab, X)
    }
  }

  function p(Y) {
    if(M.ie && M.win && Y.readyState != 4) {
      var X = C("div");
      Y.parentNode.insertBefore(X, Y);
      X.parentNode.replaceChild(g(Y), X);
      Y.style.display = "none";
      (function() {
        if(Y.readyState == 4) {
          Y.parentNode.removeChild(Y)
        } else {
          setTimeout(arguments.callee, 10)
        }
      })()
    } else {
      Y.parentNode.replaceChild(g(Y), Y)
    }
  }

  function g(ab) {
    var aa = C("div");
    if(M.win && M.ie) {
      aa.innerHTML = ab.innerHTML
    } else {
      var Y = ab.getElementsByTagName(r)[0];
      if(Y) {
        var ad = Y.childNodes;
        if(ad) {
          var X = ad.length;
          for(var Z = 0; Z < X; Z++) {
            if(!(ad[Z].nodeType == 1 && ad[Z].nodeName == "PARAM") && !(ad[Z].nodeType == 8)) {
              aa.appendChild(ad[Z].cloneNode(true))
            }
          }
        }
      }
    }
    return aa
  }

  function u(ai, ag, Y) {
    var X, aa = c(Y);
    if(M.wk && M.wk < 312) {
      return X
    }
    if(aa) {
      if( typeof ai.id == D) {
        ai.id = Y
      }
      if(M.ie && M.win) {
        var ah = "";
        for(var ae in ai) {
          if(ai[ae] != Object.prototype[ae]) {
            if(ae.toLowerCase() == "data") {
              ag.movie = ai[ae]
            } else {
              if(ae.toLowerCase() == "styleclass") {
                ah += ' class="' + ai[ae] + '"'
              } else {
                if(ae.toLowerCase() != "classid") {
                  ah += " " + ae + '="' + ai[ae] + '"'
                }
              }
            }
          }
        }
        var af = "";
        for(var ad in ag) {
          if(ag[ad] != Object.prototype[ad]) {
            af += '<param name="' + ad + '" value="' + ag[ad] + '" />'
          }
        }
        aa.outerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' + ah + ">" + af + "</object>";
        N[N.length] = ai.id;
        X = c(ai.id)
      } else {
        var Z = C(r);
        Z.setAttribute("type", q);
        for(var ac in ai) {
          if(ai[ac] != Object.prototype[ac]) {
            if(ac.toLowerCase() == "styleclass") {
              Z.setAttribute("class", ai[ac])
            } else {
              if(ac.toLowerCase() != "classid") {
                Z.setAttribute(ac, ai[ac])
              }
            }
          }
        }
        for(var ab in ag) {
          if(ag[ab] != Object.prototype[ab] && ab.toLowerCase() != "movie") {
            e(Z, ab, ag[ab])
          }
        }
        aa.parentNode.replaceChild(Z, aa);
        X = Z
      }
    }
    return X
  }

  function e(Z, X, Y) {
    var aa = C("param");
    aa.setAttribute("name", X);
    aa.setAttribute("value", Y);
    Z.appendChild(aa)
  }

  function y(Y) {
    var X = c(Y);
    if(X && X.nodeName == "OBJECT") {
      if(M.ie && M.win) {
        X.style.display = "none";
        (function() {
          if(X.readyState == 4) {
            b(Y)
          } else {
            setTimeout(arguments.callee, 10)
          }
        })()
      } else {
        X.parentNode.removeChild(X)
      }
    }
  }

  function b(Z) {
    var Y = c(Z);
    if(Y) {
      for(var X in Y) {
        if( typeof Y[X] == "function") {
          Y[X] = null
        }
      }
      Y.parentNode.removeChild(Y)
    }
  }

  function c(Z) {
    var X = null;
    try {
      X = j.getElementById(Z)
    } catch(Y) {
    }
    return X
  }

  function C(X) {
    return j.createElement(X)
  }

  function i(Z, X, Y) {
    Z.attachEvent(X, Y);
    I[I.length] = [Z, X, Y]
  }

  function F(Z) {
    var Y = M.pv, X = Z.split(".");
    X[0] = parseInt(X[0], 10);
    X[1] = parseInt(X[1], 10) || 0;
    X[2] = parseInt(X[2], 10) || 0;
    return (Y[0] > X[0] || (Y[0] == X[0] && Y[1] > X[1]) || (Y[0] == X[0] && Y[1] == X[1] && Y[2] >= X[2])) ? true : false
  }

  function v(ac, Y, ad, ab) {
    if(M.ie && M.mac) {
      return
    }
    var aa = j.getElementsByTagName("head")[0];
    if(!aa) {
      return
    }
    var X = (ad && typeof ad == "string") ? ad : "screen";
    if(ab) {
      n = null;
      G = null
    }
    if(!n || G != X) {
      var Z = C("style");
      Z.setAttribute("type", "text/css");
      Z.setAttribute("media", X);
      n = aa.appendChild(Z);
      if(M.ie && M.win && typeof j.styleSheets != D && j.styleSheets.length > 0) {
        n = j.styleSheets[j.styleSheets.length - 1]
      }
      G = X
    }
    if(M.ie && M.win) {
      if(n && typeof n.addRule == r) {
        n.addRule(ac, Y)
      }
    } else {
      if(n && typeof j.createTextNode != D) {
        n.appendChild(j.createTextNode(ac + " {" + Y + "}"))
      }
    }
  }

  function w(Z, X) {
    if(!m) {
      return
    }
    var Y = X ? "visible" : "hidden";
    if(J && c(Z)) {
      c(Z).style.visibility = Y
    } else {
      v("#" + Z, "visibility:" + Y)
    }
  }

  function L(Y) {
    var Z = /[\\\"<>\.;]/;
    var X = Z.exec(Y) != null;
    return X && typeof encodeURIComponent != D ? encodeURIComponent(Y) : Y
  }

  var d = function() {
    if(M.ie && M.win) {
      window.attachEvent("onunload", function() {
        var ac = I.length;
        for(var ab = 0; ab < ac; ab++) {
          I[ab][0].detachEvent(I[ab][1], I[ab][2])
        }
        var Z = N.length;
        for(var aa = 0; aa < Z; aa++) {
          y(N[aa])
        }
        for(var Y in M) {
          M[Y] = null
        }
        M = null;
        for(var X in swfobject) {
          swfobject[X] = null
        }
        swfobject = null
      })
    }
  }();
  return {
    registerObject : function(ab, X, aa, Z) {
      if(M.w3 && ab && X) {
        var Y = {};
        Y.id = ab;
        Y.swfVersion = X;
        Y.expressInstall = aa;
        Y.callbackFn = Z;
        o[o.length] = Y;
        w(ab, false)
      } else {
        if(Z) {
          Z({
            success : false,
            id : ab
          })
        }
      }
    },
    getObjectById : function(X) {
      if(M.w3) {
        return z(X)
      }
    },
    embedSWF : function(ab, ah, ae, ag, Y, aa, Z, ad, af, ac) {
      var X = {
        success : false,
        id : ah
      };
      if(M.w3 && !(M.wk && M.wk < 312) && ab && ah && ae && ag && Y) {
        w(ah, false);
        K(function() {
          ae += "";
          ag += "";
          var aj = {};
          if(af && typeof af === r) {
            for(var al in af) {
              aj[al] = af[al]
            }
          }
          aj.data = ab;
          aj.width = ae;
          aj.height = ag;
          var am = {};
          if(ad && typeof ad === r) {
            for(var ak in ad) {
              am[ak] = ad[ak]
            }
          }
          if(Z && typeof Z === r) {
            for(var ai in Z) {
              if( typeof am.flashvars != D) {
                am.flashvars += "&" + ai + "=" + Z[ai]
              } else {
                am.flashvars = ai + "=" + Z[ai]
              }
            }
          }
          if(F(Y)) {
            var an = u(aj, am, ah);
            if(aj.id == ah) {
              w(ah, true)
            }
            X.success = true;
            X.ref = an
          } else {
            if(aa && A()) {
              aj.data = aa;
              P(aj, am, ah, ac);
              return
            } else {
              w(ah, true)
            }
          }
          if(ac) {
            ac(X)
          }
        })
      } else {
        if(ac) {
          ac(X)
        }
      }
    },
    switchOffAutoHideShow : function() {
      m = false
    },
    ua : M,
    getFlashPlayerVersion : function() {
      return {
        major : M.pv[0],
        minor : M.pv[1],
        release : M.pv[2]
      }
    },
    hasFlashPlayerVersion : F,
    createSWF : function(Z, Y, X) {
      if(M.w3) {
        return u(Z, Y, X)
      } else {
        return undefined
      }
    },
    showExpressInstall : function(Z, aa, X, Y) {
      if(M.w3 && A()) {
        P(Z, aa, X, Y)
      }
    },
    removeSWF : function(X) {
      if(M.w3) {
        y(X)
      }
    },
    createCSS : function(aa, Z, Y, X) {
      if(M.w3) {
        v(aa, Z, Y, X)
      }
    },
    addDomLoadEvent : K,
    addLoadEvent : s,
    getQueryParamValue : function(aa) {
      var Z = j.location.search || j.location.hash;
      if(Z) {
        if(/\?/.test(Z)) {
          Z = Z.split("?")[1]
        }
        if(aa == null) {
          return L(Z)
        }
        var Y = Z.split("&");
        for(var X = 0; X < Y.length; X++) {
          if(Y[X].substring(0, Y[X].indexOf("=")) == aa) {
            return L(Y[X].substring((Y[X].indexOf("=") + 1)))
          }
        }
      }
      return ""
    },
    expressInstallCallback : function() {
      if(a) {
        var X = c(R);
        if(X && l) {
          X.parentNode.replaceChild(l, X);
          if(Q) {
            w(Q, true);
            if(M.ie && M.win) {
              l.style.display = "block"
            }
          }
          if(E) {
            E(B)
          }
        }
        a = false
      }
    }
  }
}();

/*Chrome Drop Down Menu v2.01- Author: Dynamic Drive (http://www.dynamicdrive.com)*/
var adrop = {
  dropmenuobj : null,
  ie : document.all,
  firefox : document.getElementById && !document.all,
  swipetimer : undefined,
  bottomclip : 0,
  disappeardelay : 250,
  disablemenuclick : false,
  enableswipe : 1,
  enableiframeshim : 1,
  oldclassname : undefined,
  obj : null,
  oldobj : null,
  getposOffset : function(G, H) {
    var E = (H == "left") ? G.offsetLeft : G.offsetTop;
    var F = G.offsetParent;
    while(F != null) {
      E = (H == "left") ? E + F.offsetLeft : E + F.offsetTop;
      F = F.offsetParent
    }
    return E
  },
  swipeeffect : function() {
    if(this.bottomclip < parseInt(this.dropmenuobj.offsetHeight)) {
      this.bottomclip += 10 + (this.bottomclip / 10);
      this.dropmenuobj.style.clip = "rect(0 auto " + this.bottomclip + "px 0)"
    } else {
      return
    }
    this.swipetimer = setTimeout("adrop.swipeeffect()", 10)
  },
  showhide : function(C, D) {
    if(this.ie || this.firefox) {
      this.dropmenuobj.style.left = this.dropmenuobj.style.top = "-500px"
    }
    if(D.type == "click" && C.visibility == hidden || D.type == "mouseover") {
      if(this.enableswipe == 1) {
        if( typeof this.swipetimer != "undefined") {
          clearTimeout(this.swipetimer)
        }
        C.clip = "rect(0 auto 0 0)";
        this.bottomclip = 0;
        this.swipeeffect()
      }
      C.visibility = "visible"
    } else {
      if(D.type == "click") {
        C.visibility = "hidden"
      }
    }
  },
  iecompattest : function() {
    return (document.compatMode && document.compatMode != "BackCompat") ? document.documentElement : document.body
  },
  clearbrowseredge : function(H, J) {
    var F = 0;
    if(J == "rightedge") {
      var I = this.ie && !window.opera ? this.iecompattest().scrollLeft + this.iecompattest().clientWidth - 15 : window.pageXOffset + window.innerWidth - 15;
      this.dropmenuobj.contentmeasure = this.dropmenuobj.offsetWidth;
      if(I - this.dropmenuobj.x < this.dropmenuobj.contentmeasure) {
        F = this.dropmenuobj.contentmeasure - H.offsetWidth
      }
    } else {
      var G = this.ie && !window.opera ? this.iecompattest().scrollTop : window.pageYOffset;
      var I = this.ie && !window.opera ? this.iecompattest().scrollTop + this.iecompattest().clientHeight - 15 : window.pageYOffset + window.innerHeight - 18;
      this.dropmenuobj.contentmeasure = this.dropmenuobj.offsetHeight;
      if(I - this.dropmenuobj.y < this.dropmenuobj.contentmeasure) {
        F = this.dropmenuobj.contentmeasure + H.offsetHeight;
        if((this.dropmenuobj.y - G) < this.dropmenuobj.contentmeasure) {
          F = this.dropmenuobj.y + H.offsetHeight - G
        }
      }
    }
    return F
  },
  down : function(H, I, G, L, J, F) {
    $(H).identify();
    if( typeof L != "undefined") {
      if(L == 1) {
        this.enableswipe = 1
      } else {
        this.enableswipe = 0
      }
    }
    if(this.dropmenuobj != null && $(H).identify() != $(this.obj).identify()) {
      this.dropmenuobj.style.visibility = "hidden"
    }
    this.clearOldClass();
    this.clearhidemenu();
    if(this.ie || this.firefox) {
      H.onmouseout = function() {
        adrop.delayhidemenu()
      };
      if( typeof J != "undefined" && J != null) {
        if( typeof this.oldclassname == "undefined") {
          this.oldclassname = H.className
        }
        $(H).addClassName(J)
      }
      this.obj = H;
      if( typeof G != "undefined") {
        this.dropmenuobj = $(G);
        this.dropmenuobj.onmouseover = function() {
          adrop.clearhidemenu()
        };
        this.dropmenuobj.onmouseout = function(A) {
          adrop.dynamichide(A)
        };
        if( typeof F == "undefined") {
          this.dropmenuobj.onclick = function() {
            adrop.delayhidemenu()
          }
        }
        if(this.dropmenuobj.style.visibility != "visible") {
          this.showhide(this.dropmenuobj.style, I);
          this.dropmenuobj.x = this.getposOffset(H, "left");
          this.dropmenuobj.y = this.getposOffset(H, "top");
          this.dropmenuobj.style.left = this.dropmenuobj.x - this.clearbrowseredge(H, "rightedge") + "px";
          this.dropmenuobj.style.top = this.dropmenuobj.y - this.clearbrowseredge(H, "bottomedge") + H.offsetHeight + 1 + "px";
          this.positionshim()
        }
      }
    }
  },
  positionshim : function() {
    if(this.enableiframeshim && typeof this.shimobject != "undefined") {
      if(this.dropmenuobj.style.visibility == "visible") {
        this.shimobject.style.width = this.dropmenuobj.offsetWidth + "px";
        this.shimobject.style.height = this.dropmenuobj.offsetHeight + "px";
        this.shimobject.style.left = this.dropmenuobj.style.left;
        this.shimobject.style.top = this.dropmenuobj.style.top
      }
      this.shimobject.style.display = (this.dropmenuobj.style.visibility == "visible") ? "block" : "none"
    }
  },
  hideshim : function() {
    if(this.enableiframeshim && typeof this.shimobject != "undefined") {
      this.shimobject.style.display = "none"
    }
  },
  contains_firefox : function(C, D) {
    while(D.parentNode) {
      if(( D = D.parentNode) == C) {
        return true
      }
    }
    return false
  },
  dynamichide : function(C) {
    var D = window.event ? window.event : C;
    if(this.ie && !this.dropmenuobj.contains(D.toElement)) {
      this.delayhidemenu()
    } else {
      if(this.firefox && C.currentTarget != D.relatedTarget && !this.contains_firefox(D.currentTarget, D.relatedTarget)) {
        this.delayhidemenu()
      }
    }
  },
  delayhidemenu : function() {
    this.delayhide = setTimeout("adrop.dropmenuobj.style.visibility='hidden'; adrop.hideshim();adrop.clearOldClass()", this.disappeardelay)
  },
  clearOldClass : function() {
    if( typeof this.oldclassname != "undefined") {
      this.obj.className = this.oldclassname
    }
    this.oldclassname = undefined
  },
  clearhidemenu : function() {
    if(this.delayhide != "undefined") {
      clearTimeout(this.delayhide)
    }
  },
  startchrome : function() {
    for(var H = 0; H < arguments.length; H++) {
      var G = document.getElementById(arguments[H]).getElementsByTagName("a");
      for(var E = 0; E < G.length; E++) {
        if(G[E].getAttribute("rel")) {
          var F = G[E].getAttribute("rel");
          G[E].onmouseover = function(B) {
            var A = typeof B != "undefined" ? B : window.event;
            adrop.down(this, A, this.getAttribute("rel"))
          }
        }
      }
    }
    if(window.createPopup && !window.XmlHttpRequest) {
      document.write('<IFRAME id="iframeshim"  src="" style="display: none; left: 0; top: 0; z-index: 90; position: absolute; filter: progid:DXImageTransform.Microsoft.Alpha(style=0,opacity=0)" frameBorder="0" scrolling="no"></IFRAME>');
      this.shimobject = $("iframeshim")
    }
  }
}

/*Tip*/
var offsetfromcursorX = 12;
var offsetfromcursorY = 10;
var offsetdivfrompointerX = 10;
var offsetdivfrompointerY = 14;
var ie = document.all;
var ns6 = document.getElementById && !document.all;
var enabletip = false;
var tipobj = false;
var pointerobj = false;
function ietruebody() {
  return (document.compatMode && document.compatMode != "BackCompat") ? document.documentElement : document.body
}

function appTip(B, C, A, D) {
  if(ns6 || ie) {
    if(!$("tip")) {
      $('blank').insert({
        bottom : '<div id="tip"></div><img id="tipPoint" src="/assets/images/layout/tip.gif">'
      });
      tipobj = $("tip");
      pointerobj = $("tipPoint")
    }
    if( typeof A != "undefined") {
      tipobj.style.width = A + "px"
    }
    if( typeof D != "undefined" && D != "") {
      tipobj.style.backgroundColor = D
    }
    tipobj.innerHTML = C;
    enabletip = true;
    return false
  }
}

function positiontip(H) {
  if(enabletip) {
    var C = false;
    var D = (ns6) ? H.pageX : event.clientX + ietruebody().scrollLeft;
    var B = (ns6) ? H.pageY : event.clientY + ietruebody().scrollTop;
    var G = ie && !window.opera ? ietruebody().clientWidth : window.innerWidth - 20;
    var A = ie && !window.opera ? ietruebody().clientHeight : window.innerHeight - 20;
    var F = ie && !window.opera ? G - event.clientX - offsetfromcursorX : G - H.clientX - offsetfromcursorX;
    var E = ie && !window.opera ? A - event.clientY - offsetfromcursorY : A - H.clientY - offsetfromcursorY;
    var I = (offsetfromcursorX < 0) ? offsetfromcursorX * (-1) : -1000;
    if(F < tipobj.offsetWidth) {
      tipobj.style.left = D - tipobj.offsetWidth + "px";
      C = true
    } else {
      if(D < I) {
        tipobj.style.left = "5px"
      } else {
        tipobj.style.left = D + offsetfromcursorX - offsetdivfrompointerX + "px";
        pointerobj.style.left = D + offsetfromcursorX + "px"
      }
    }
    if(E < tipobj.offsetHeight) {
      tipobj.style.top = B - tipobj.offsetHeight - offsetfromcursorY + "px";
      C = true
    } else {
      tipobj.style.top = B + offsetfromcursorY + offsetdivfrompointerY + "px";
      pointerobj.style.top = B + offsetfromcursorY + "px"
    }
    tipobj.style.visibility = "visible";
    if(!C) {
      pointerobj.style.visibility = "visible"
    } else {
      pointerobj.style.visibility = "hidden"
    }
  }
}

function hideTip() {
  if(ns6 || ie) {
    enabletip = false;
    tipobj.style.visibility = "hidden";
    pointerobj.style.visibility = "hidden";
    tipobj.style.left = "-1000px";
    tipobj.style.backgroundColor = "";
    tipobj.style.width = ""
  }
}
document.onmousemove = positiontip

/* OverLoader | overLoader.js */
function overLoader(D, I, J, F, A) {
  if( typeof (F) == "undefined") {
    F = 0
  }
  if( typeof (A) == "undefined") {
    A = 0
  }
  var C = "overLoader";
  var H = "loaderCon";
  var G = "overLoaderText";
  var K = "overLoaderInner";
  var B = "";
  if(D == "hide") {
    $(C).hide();
    return false
  }
  if(I == "bar") {
    var E = 'loaderBar.gif"';
    B = "loadBar"
  } else {
    if(I == "indi") {
      var E = 'loader.gif"';
      B = "loadIndy"
    }
  }
  var L = '<img src="/assets/images/layout/loader/' + E + '"/>';
  if(D == "show" || D == "show_ns") {
    if(!$(C)) {
      $(document.body).insert({
        bottom : '<div id="' + C + '" class="' + C + '" style="display:none;"><strong id="' + G + '"></strong><div id="' + H + '"></div><div class="' + K + '"></div></div>'
      });
      Event.observe(window, "resize", function() {
        overLoaderDim(C, F, A)
      })
    }
    $(H).className = B;
    $(H).update(L);
    $(G).update(J);
    $(C).show();
    if(D == "show") {
      Effect.ScrollTo("header", {
        duration : 0.3
      })
    }
  }
  overLoaderDim(C, F, A)
}

function overLoaderDim(B, F, C) {
  var D = $(B);
  var A = D.getDimensions();
  var E = document.viewport.getDimensions();
  var G = (E.height - A.height) / 2;
  var H = (E.width - A.width) / 2;
  G = G + F;
  H = H + C;
  var I = {
    position : "absolute",
    top : G + "px",
    left : H + "px"
  };
  D.setStyle(I)
}

//Quick Contact Form
function quickContact(id, url, success) {
  $('contactButton').hide();
  $('sendingForm').show();
  data = $(id).serialize();
  new Ajax.Request(url, {
    method : 'post',
    parameters : data,
    evalScripts : true,
    asynchronous : true,
    onSuccess : function(result) {
      $(success).innerHTML = result.responseText;
      $('contactButton').show();
      $('sendingForm').hide();
    },
    onFailure : function(result) {
      alert(result.responseText);
      $('contactButton').show();
      $('sendingForm').hide();
    }
  });
  return false;
}

//Fade Success
function sentQC() {
  Effect.Fade('qc_success', {
    duration : 0.3
  });
  $('quickContactForm').reset();
}

function validateEmailSignup(form_id, email) {
  var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
  var address = document.forms[form_id].elements[email].value;
  if(reg.test(address) == false) {
    alert('Please Enter a Valid Email Address');
    return false;
  } else {
    return true;
  }
}

function validateEmail(form_id) {
  var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
  var mail = document.forms[form_id].elements[1].value;
  if(reg.test(mail) == false) {
    alert('Please enter a valid email address');
    return false;
  } else {
    return true;
  }
}

// Contact
function contactClick(id, url, success) {
  if(validateEmail(id)) {
    $('contactButton').hide();
    $('c_sendingForm').show();
    data = $(id).serialize();
    new Ajax.Request(url, {
      method : 'post',
      parameters : data,
      evalScripts : true,
      asynchronous : true,
      onSuccess : function(result) {
        $(success).innerHTML = result.responseText;
        $('contactButton').show();
        $('c_sendingForm').hide();
        $('c_name').value = '';
        $('c_mail').value = '';
        $('c_message').value = '';
      },
      onFailure : function(result) {
        alert(result.responseText);
        $('contactButton').show();
        $('c_sendingForm').hide();
        $('c_name').value = '';
        $('c_mail').value = '';
        $('c_message').value = '';
      }
    });
    return false;
  }
}

// Download
function downloadClick(id, url, success) {
  if(validateEmail(id)) {
    $('downloadButton').hide();
    $('d_sendingForm').show();
    data = $(id).serialize();
    new Ajax.Request(url, {
      method : 'post',
      parameters : data,
      evalScripts : true,
      asynchronous : true,
      onSuccess : function(result) {
        $(success).innerHTML = result.responseText;
        $('downloadButton').show();
        $('d_sendingForm').hide();
        $('d_name').value = '';
        $('d_mail').value = '';
      },
      onFailure : function(result) {
        alert(result.responseText);
        $('downloadButton').show();
        $('d_sendingForm').hide();
        $('d_name').value = '';
        $('d_mail').value = '';
      }
    });
    return false;
  }
}

//Upload
function uploadClick(id, url, success) {
  if(validateEmail(id)) {
    $('uploadButton').hide();
    $('d_uploadingForm').show();
    data = $(id).serialize();
    new Ajax.Request(url, {
      method : 'post',
      parameters : data,
      evalScripts : true,
      asynchronous : true,
      onSuccess : function(result) {
	$(success).innerHTML = result.responseText;
	$('uploadButton').show();
	$('d_uploadingForm').hide();
	$('d_name').value = '';
        $('d_mail').value = '';
	$('d_file').value = '';
      },
      onFailure : function(result) {
	alert(result.responseText);
	$('uploadButton').show();
	$('d_uploadingForm').hide();
	$('d_name').value = '';
        $('d_mail').value = '';
	$('d_file').value = '';
      }
    });
  }
  return false;
}
