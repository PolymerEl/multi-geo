import './common/local-f0e67514.js';
import { s as select } from './common/select-8eacb60c.js';
import { r as rgb$1, c as color$1, a as cubehelix$1 } from './common/cubehelix-c56427ca.js';
import { e as exponent$1, a as formatSpecifier$1, b as formatPrefix$1, f as format$1 } from './common/defaultLocale-d5f1845c.js';
import { b as bisectRight } from './common/bisect-4c041d36.js';

function constant(x) {
  return function() {
    return x;
  };
}

function linear(a, d) {
  return function(t) {
    return a + t * d;
  };
}

function exponential(a, b, y) {
  return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
    return Math.pow(a + t * b, y);
  };
}

function hue(a, b) {
  var d = b - a;
  return d ? linear(a, d > 180 || d < -180 ? d - 360 * Math.round(d / 360) : d) : constant(isNaN(a) ? b : a);
}

function gamma(y) {
  return (y = +y) === 1 ? nogamma : function(a, b) {
    return b - a ? exponential(a, b, y) : constant(isNaN(a) ? b : a);
  };
}

function nogamma(a, b) {
  var d = b - a;
  return d ? linear(a, d) : constant(isNaN(a) ? b : a);
}

var rgb = (function rgbGamma(y) {
  var color = gamma(y);

  function rgb(start, end) {
    var r = color((start = rgb$1(start)).r, (end = rgb$1(end)).r),
        g = color(start.g, end.g),
        b = color(start.b, end.b),
        opacity = nogamma(start.opacity, end.opacity);
    return function(t) {
      start.r = r(t);
      start.g = g(t);
      start.b = b(t);
      start.opacity = opacity(t);
      return start + "";
    };
  }

  rgb.gamma = rgbGamma;

  return rgb;
})(1);

function numberArray(a, b) {
  if (!b) b = [];
  var n = a ? Math.min(b.length, a.length) : 0,
      c = b.slice(),
      i;
  return function(t) {
    for (i = 0; i < n; ++i) c[i] = a[i] * (1 - t) + b[i] * t;
    return c;
  };
}

function isNumberArray(x) {
  return ArrayBuffer.isView(x) && !(x instanceof DataView);
}

function genericArray(a, b) {
  var nb = b ? b.length : 0,
      na = a ? Math.min(nb, a.length) : 0,
      x = new Array(na),
      c = new Array(nb),
      i;

  for (i = 0; i < na; ++i) x[i] = interpolateValue(a[i], b[i]);
  for (; i < nb; ++i) c[i] = b[i];

  return function(t) {
    for (i = 0; i < na; ++i) c[i] = x[i](t);
    return c;
  };
}

function date(a, b) {
  var d = new Date;
  return a = +a, b = +b, function(t) {
    return d.setTime(a * (1 - t) + b * t), d;
  };
}

function reinterpolate(a, b) {
  return a = +a, b = +b, function(t) {
    return a * (1 - t) + b * t;
  };
}

function object(a, b) {
  var i = {},
      c = {},
      k;

  if (a === null || typeof a !== "object") a = {};
  if (b === null || typeof b !== "object") b = {};

  for (k in b) {
    if (k in a) {
      i[k] = interpolateValue(a[k], b[k]);
    } else {
      c[k] = b[k];
    }
  }

  return function(t) {
    for (k in i) c[k] = i[k](t);
    return c;
  };
}

var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
    reB = new RegExp(reA.source, "g");

function zero(b) {
  return function() {
    return b;
  };
}

function one(b) {
  return function(t) {
    return b(t) + "";
  };
}

function string(a, b) {
  var bi = reA.lastIndex = reB.lastIndex = 0, // scan index for next number in b
      am, // current match in a
      bm, // current match in b
      bs, // string preceding current number in b, if any
      i = -1, // index in s
      s = [], // string constants and placeholders
      q = []; // number interpolators

  // Coerce inputs to strings.
  a = a + "", b = b + "";

  // Interpolate pairs of numbers in a & b.
  while ((am = reA.exec(a))
      && (bm = reB.exec(b))) {
    if ((bs = bm.index) > bi) { // a string precedes the next number in b
      bs = b.slice(bi, bs);
      if (s[i]) s[i] += bs; // coalesce with previous string
      else s[++i] = bs;
    }
    if ((am = am[0]) === (bm = bm[0])) { // numbers in a & b match
      if (s[i]) s[i] += bm; // coalesce with previous string
      else s[++i] = bm;
    } else { // interpolate non-matching numbers
      s[++i] = null;
      q.push({i: i, x: reinterpolate(am, bm)});
    }
    bi = reB.lastIndex;
  }

  // Add remains of b.
  if (bi < b.length) {
    bs = b.slice(bi);
    if (s[i]) s[i] += bs; // coalesce with previous string
    else s[++i] = bs;
  }

  // Special optimization for only a single match.
  // Otherwise, interpolate each of the numbers and rejoin the string.
  return s.length < 2 ? (q[0]
      ? one(q[0].x)
      : zero(b))
      : (b = q.length, function(t) {
          for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
          return s.join("");
        });
}

function interpolateValue(a, b) {
  var t = typeof b, c;
  return b == null || t === "boolean" ? constant(b)
      : (t === "number" ? reinterpolate
      : t === "string" ? ((c = color$1(b)) ? (b = c, rgb) : string)
      : b instanceof color$1 ? rgb
      : b instanceof Date ? date
      : isNumberArray(b) ? numberArray
      : Array.isArray(b) ? genericArray
      : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object
      : reinterpolate)(a, b);
}

function interpolateRound(a, b) {
  return a = +a, b = +b, function(t) {
    return Math.round(a * (1 - t) + b * t);
  };
}

function cubehelix(hue) {
  return (function cubehelixGamma(y) {
    y = +y;

    function cubehelix(start, end) {
      var h = hue((start = cubehelix$1(start)).h, (end = cubehelix$1(end)).h),
          s = nogamma(start.s, end.s),
          l = nogamma(start.l, end.l),
          opacity = nogamma(start.opacity, end.opacity);
      return function(t) {
        start.h = h(t);
        start.s = s(t);
        start.l = l(Math.pow(t, y));
        start.opacity = opacity(t);
        return start + "";
      };
    }

    cubehelix.gamma = cubehelixGamma;

    return cubehelix;
  })(1);
}

cubehelix(hue);
var cubehelixLong = cubehelix(nogamma);

function precisionFixed(step) {
  return Math.max(0, -exponent$1(Math.abs(step)));
}

function precisionPrefix(step, value) {
  return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent$1(value) / 3))) * 3 - exponent$1(Math.abs(step)));
}

function precisionRound(step, max) {
  step = Math.abs(step), max = Math.abs(max) - step;
  return Math.max(0, exponent$1(max) - exponent$1(step)) + 1;
}

var e10 = Math.sqrt(50),
    e5 = Math.sqrt(10),
    e2 = Math.sqrt(2);

function ticks(start, stop, count) {
  var reverse,
      i = -1,
      n,
      ticks,
      step;

  stop = +stop, start = +start, count = +count;
  if (start === stop && count > 0) return [start];
  if (reverse = stop < start) n = start, start = stop, stop = n;
  if ((step = tickIncrement(start, stop, count)) === 0 || !isFinite(step)) return [];

  if (step > 0) {
    start = Math.ceil(start / step);
    stop = Math.floor(stop / step);
    ticks = new Array(n = Math.ceil(stop - start + 1));
    while (++i < n) ticks[i] = (start + i) * step;
  } else {
    start = Math.floor(start * step);
    stop = Math.ceil(stop * step);
    ticks = new Array(n = Math.ceil(start - stop + 1));
    while (++i < n) ticks[i] = (start - i) / step;
  }

  if (reverse) ticks.reverse();

  return ticks;
}

function tickIncrement(start, stop, count) {
  var step = (stop - start) / Math.max(0, count),
      power = Math.floor(Math.log(step) / Math.LN10),
      error = step / Math.pow(10, power);
  return power >= 0
      ? (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1) * Math.pow(10, power)
      : -Math.pow(10, -power) / (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1);
}

function tickStep(start, stop, count) {
  var step0 = Math.abs(stop - start) / Math.max(0, count),
      step1 = Math.pow(10, Math.floor(Math.log(step0) / Math.LN10)),
      error = step0 / step1;
  if (error >= e10) step1 *= 10;
  else if (error >= e5) step1 *= 5;
  else if (error >= e2) step1 *= 2;
  return stop < start ? -step1 : step1;
}

// Computes the decimal coefficient and exponent of the specified number x with
// significant digits p, where x is positive and p is in [1, 21] or undefined.
// For example, formatDecimal(1.23) returns ["123", 0].
function formatDecimal(x, p) {
  if ((i = (x = p ? x.toExponential(p - 1) : x.toExponential()).indexOf("e")) < 0) return null; // NaN, ±Infinity
  var i, coefficient = x.slice(0, i);

  // The string returned by toExponential either has the form \d\.\d+e[-+]\d+
  // (e.g., 1.2e+3) or the form \de[-+]\d+ (e.g., 1e+3).
  return [
    coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
    +x.slice(i + 1)
  ];
}

function exponent(x) {
  return x = formatDecimal(Math.abs(x)), x ? x[1] : NaN;
}

function formatGroup(grouping, thousands) {
  return function(value, width) {
    var i = value.length,
        t = [],
        j = 0,
        g = grouping[0],
        length = 0;

    while (i > 0 && g > 0) {
      if (length + g + 1 > width) g = Math.max(1, width - length);
      t.push(value.substring(i -= g, i + g));
      if ((length += g + 1) > width) break;
      g = grouping[j = (j + 1) % grouping.length];
    }

    return t.reverse().join(thousands);
  };
}

function formatDefault(x, p) {
  x = x.toPrecision(p);

  out: for (var n = x.length, i = 1, i0 = -1, i1; i < n; ++i) {
    switch (x[i]) {
      case ".": i0 = i1 = i; break;
      case "0": if (i0 === 0) i0 = i; i1 = i; break;
      case "e": break out;
      default: if (i0 > 0) i0 = 0; break;
    }
  }

  return i0 > 0 ? x.slice(0, i0) + x.slice(i1 + 1) : x;
}

var prefixExponent;

function formatPrefixAuto(x, p) {
  var d = formatDecimal(x, p);
  if (!d) return x + "";
  var coefficient = d[0],
      exponent = d[1],
      i = exponent - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3) + 1,
      n = coefficient.length;
  return i === n ? coefficient
      : i > n ? coefficient + new Array(i - n + 1).join("0")
      : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i)
      : "0." + new Array(1 - i).join("0") + formatDecimal(x, Math.max(0, p + i - 1))[0]; // less than 1y!
}

function formatRounded(x, p) {
  var d = formatDecimal(x, p);
  if (!d) return x + "";
  var coefficient = d[0],
      exponent = d[1];
  return exponent < 0 ? "0." + new Array(-exponent).join("0") + coefficient
      : coefficient.length > exponent + 1 ? coefficient.slice(0, exponent + 1) + "." + coefficient.slice(exponent + 1)
      : coefficient + new Array(exponent - coefficient.length + 2).join("0");
}

var formatTypes = {
  "": formatDefault,
  "%": function(x, p) { return (x * 100).toFixed(p); },
  "b": function(x) { return Math.round(x).toString(2); },
  "c": function(x) { return x + ""; },
  "d": function(x) { return Math.round(x).toString(10); },
  "e": function(x, p) { return x.toExponential(p); },
  "f": function(x, p) { return x.toFixed(p); },
  "g": function(x, p) { return x.toPrecision(p); },
  "o": function(x) { return Math.round(x).toString(8); },
  "p": function(x, p) { return formatRounded(x * 100, p); },
  "r": formatRounded,
  "s": formatPrefixAuto,
  "X": function(x) { return Math.round(x).toString(16).toUpperCase(); },
  "x": function(x) { return Math.round(x).toString(16); }
};

// [[fill]align][sign][symbol][0][width][,][.precision][type]
var re = /^(?:(.)?([<>=^]))?([+\-\( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?([a-z%])?$/i;

function formatSpecifier(specifier) {
  return new FormatSpecifier(specifier);
}

function FormatSpecifier(specifier) {
  if (!(match = re.exec(specifier))) throw new Error("invalid format: " + specifier);

  var match,
      fill = match[1] || " ",
      align = match[2] || ">",
      sign = match[3] || "-",
      symbol = match[4] || "",
      zero = !!match[5],
      width = match[6] && +match[6],
      comma = !!match[7],
      precision = match[8] && +match[8].slice(1),
      type = match[9] || "";

  // The "n" type is an alias for ",g".
  if (type === "n") comma = true, type = "g";

  // Map invalid types to the default format.
  else if (!formatTypes[type]) type = "";

  // If zero fill is specified, padding goes after sign and before digits.
  if (zero || (fill === "0" && align === "=")) zero = true, fill = "0", align = "=";

  this.fill = fill;
  this.align = align;
  this.sign = sign;
  this.symbol = symbol;
  this.zero = zero;
  this.width = width;
  this.comma = comma;
  this.precision = precision;
  this.type = type;
}

FormatSpecifier.prototype.toString = function() {
  return this.fill
      + this.align
      + this.sign
      + this.symbol
      + (this.zero ? "0" : "")
      + (this.width == null ? "" : Math.max(1, this.width | 0))
      + (this.comma ? "," : "")
      + (this.precision == null ? "" : "." + Math.max(0, this.precision | 0))
      + this.type;
};

var prefixes = ["y","z","a","f","p","n","µ","m","","k","M","G","T","P","E","Z","Y"];

function identity(x) {
  return x;
}

function formatLocale(locale) {
  var group = locale.grouping && locale.thousands ? formatGroup(locale.grouping, locale.thousands) : identity,
      currency = locale.currency,
      decimal = locale.decimal;

  function newFormat(specifier) {
    specifier = formatSpecifier(specifier);

    var fill = specifier.fill,
        align = specifier.align,
        sign = specifier.sign,
        symbol = specifier.symbol,
        zero = specifier.zero,
        width = specifier.width,
        comma = specifier.comma,
        precision = specifier.precision,
        type = specifier.type;

    // Compute the prefix and suffix.
    // For SI-prefix, the suffix is lazily computed.
    var prefix = symbol === "$" ? currency[0] : symbol === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : "",
        suffix = symbol === "$" ? currency[1] : /[%p]/.test(type) ? "%" : "";

    // What format function should we use?
    // Is this an integer type?
    // Can this type generate exponential notation?
    var formatType = formatTypes[type],
        maybeSuffix = !type || /[defgprs%]/.test(type);

    // Set the default precision if not specified,
    // or clamp the specified precision to the supported range.
    // For significant precision, it must be in [1, 21].
    // For fixed precision, it must be in [0, 20].
    precision = precision == null ? (type ? 6 : 12)
        : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision))
        : Math.max(0, Math.min(20, precision));

    function format(value) {
      var valuePrefix = prefix,
          valueSuffix = suffix,
          i, n, c;

      if (type === "c") {
        valueSuffix = formatType(value) + valueSuffix;
        value = "";
      } else {
        value = +value;

        // Convert negative to positive, and compute the prefix.
        // Note that -0 is not less than 0, but 1 / -0 is!
        var valueNegative = (value < 0 || 1 / value < 0) && (value *= -1, true);

        // Perform the initial formatting.
        value = formatType(value, precision);

        // If the original value was negative, it may be rounded to zero during
        // formatting; treat this as (positive) zero.
        if (valueNegative) {
          i = -1, n = value.length;
          valueNegative = false;
          while (++i < n) {
            if (c = value.charCodeAt(i), (48 < c && c < 58)
                || (type === "x" && 96 < c && c < 103)
                || (type === "X" && 64 < c && c < 71)) {
              valueNegative = true;
              break;
            }
          }
        }

        // Compute the prefix and suffix.
        valuePrefix = (valueNegative ? (sign === "(" ? sign : "-") : sign === "-" || sign === "(" ? "" : sign) + valuePrefix;
        valueSuffix = valueSuffix + (type === "s" ? prefixes[8 + prefixExponent / 3] : "") + (valueNegative && sign === "(" ? ")" : "");

        // Break the formatted value into the integer “value” part that can be
        // grouped, and fractional or exponential “suffix” part that is not.
        if (maybeSuffix) {
          i = -1, n = value.length;
          while (++i < n) {
            if (c = value.charCodeAt(i), 48 > c || c > 57) {
              valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
              value = value.slice(0, i);
              break;
            }
          }
        }
      }

      // If the fill character is not "0", grouping is applied before padding.
      if (comma && !zero) value = group(value, Infinity);

      // Compute the padding.
      var length = valuePrefix.length + value.length + valueSuffix.length,
          padding = length < width ? new Array(width - length + 1).join(fill) : "";

      // If the fill character is "0", grouping is applied after padding.
      if (comma && zero) value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";

      // Reconstruct the final output based on the desired alignment.
      switch (align) {
        case "<": return valuePrefix + value + valueSuffix + padding;
        case "=": return valuePrefix + padding + value + valueSuffix;
        case "^": return padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length);
      }
      return padding + valuePrefix + value + valueSuffix;
    }

    format.toString = function() {
      return specifier + "";
    };

    return format;
  }

  function formatPrefix(specifier, value) {
    var f = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier)),
        e = Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3,
        k = Math.pow(10, -e),
        prefix = prefixes[8 + e / 3];
    return function(value) {
      return f(k * value) + prefix;
    };
  }

  return {
    format: newFormat,
    formatPrefix: formatPrefix
  };
}

var locale;
var format;
var formatPrefix;

defaultLocale({
  decimal: ".",
  thousands: ",",
  grouping: [3],
  currency: ["$", ""]
});

function defaultLocale(definition) {
  locale = formatLocale(definition);
  format = locale.format;
  formatPrefix = locale.formatPrefix;
  return locale;
}

var noop = {value: function() {}};

function dispatch() {
  for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
    if (!(t = arguments[i] + "") || (t in _)) throw new Error("illegal type: " + t);
    _[t] = [];
  }
  return new Dispatch(_);
}

function Dispatch(_) {
  this._ = _;
}

function parseTypenames(typenames, types) {
  return typenames.trim().split(/^|\s+/).map(function(t) {
    var name = "", i = t.indexOf(".");
    if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
    if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
    return {type: t, name: name};
  });
}

Dispatch.prototype = dispatch.prototype = {
  constructor: Dispatch,
  on: function(typename, callback) {
    var _ = this._,
        T = parseTypenames(typename + "", _),
        t,
        i = -1,
        n = T.length;

    // If no callback was specified, return the callback of the given type and name.
    if (arguments.length < 2) {
      while (++i < n) if ((t = (typename = T[i]).type) && (t = get(_[t], typename.name))) return t;
      return;
    }

    // If a type was specified, set the callback for the given type and name.
    // Otherwise, if a null callback was specified, remove callbacks of the given name.
    if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
    while (++i < n) {
      if (t = (typename = T[i]).type) _[t] = set(_[t], typename.name, callback);
      else if (callback == null) for (t in _) _[t] = set(_[t], typename.name, null);
    }

    return this;
  },
  copy: function() {
    var copy = {}, _ = this._;
    for (var t in _) copy[t] = _[t].slice();
    return new Dispatch(copy);
  },
  call: function(type, that) {
    if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t; i < n; ++i) args[i] = arguments[i + 2];
    if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
    for (t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
  },
  apply: function(type, that, args) {
    if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
    for (var t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
  }
};

function get(type, name) {
  for (var i = 0, n = type.length, c; i < n; ++i) {
    if ((c = type[i]).name === name) {
      return c.value;
    }
  }
}

function set(type, name, callback) {
  for (var i = 0, n = type.length; i < n; ++i) {
    if (type[i].name === name) {
      type[i] = noop, type = type.slice(0, i).concat(type.slice(i + 1));
      break;
    }
  }
  if (callback != null) type.push({name: name, value: callback});
  return type;
}

var prefix = "$";

function Map() {}

Map.prototype = map.prototype = {
  constructor: Map,
  has: function(key) {
    return (prefix + key) in this;
  },
  get: function(key) {
    return this[prefix + key];
  },
  set: function(key, value) {
    this[prefix + key] = value;
    return this;
  },
  remove: function(key) {
    var property = prefix + key;
    return property in this && delete this[property];
  },
  clear: function() {
    for (var property in this) if (property[0] === prefix) delete this[property];
  },
  keys: function() {
    var keys = [];
    for (var property in this) if (property[0] === prefix) keys.push(property.slice(1));
    return keys;
  },
  values: function() {
    var values = [];
    for (var property in this) if (property[0] === prefix) values.push(this[property]);
    return values;
  },
  entries: function() {
    var entries = [];
    for (var property in this) if (property[0] === prefix) entries.push({key: property.slice(1), value: this[property]});
    return entries;
  },
  size: function() {
    var size = 0;
    for (var property in this) if (property[0] === prefix) ++size;
    return size;
  },
  empty: function() {
    for (var property in this) if (property[0] === prefix) return false;
    return true;
  },
  each: function(f) {
    for (var property in this) if (property[0] === prefix) f(this[property], property.slice(1), this);
  }
};

function map(object, f) {
  var map = new Map;

  // Copy constructor.
  if (object instanceof Map) object.each(function(value, key) { map.set(key, value); });

  // Index array by numeric index or specified key function.
  else if (Array.isArray(object)) {
    var i = -1,
        n = object.length,
        o;

    if (f == null) while (++i < n) map.set(i, object[i]);
    else while (++i < n) map.set(f(o = object[i], i, object), o);
  }

  // Convert object to map.
  else if (object) for (var key in object) map.set(key, object[key]);

  return map;
}

function Set() {}

var proto = map.prototype;

Set.prototype = set$1.prototype = {
  constructor: Set,
  has: proto.has,
  add: function(value) {
    value += "";
    this[prefix + value] = value;
    return this;
  },
  remove: proto.remove,
  clear: proto.clear,
  values: proto.keys,
  size: proto.size,
  empty: proto.empty,
  each: proto.each
};

function set$1(object, f) {
  var set = new Set;

  // Copy constructor.
  if (object instanceof Set) object.each(function(value) { set.add(value); });

  // Otherwise, assume it’s an array.
  else if (object) {
    var i = -1, n = object.length;
    if (f == null) while (++i < n) set.add(object[i]);
    else while (++i < n) set.add(f(object[i], i, object));
  }

  return set;
}

var array = Array.prototype;

var map$1 = array.map;
var slice = array.slice;

function constant$1(x) {
  return function() {
    return x;
  };
}

function number(x) {
  return +x;
}

var unit = [0, 1];

function deinterpolateLinear(a, b) {
  return (b -= (a = +a))
      ? function(x) { return (x - a) / b; }
      : constant$1(b);
}

function deinterpolateClamp(deinterpolate) {
  return function(a, b) {
    var d = deinterpolate(a = +a, b = +b);
    return function(x) { return x <= a ? 0 : x >= b ? 1 : d(x); };
  };
}

function reinterpolateClamp(reinterpolate) {
  return function(a, b) {
    var r = reinterpolate(a = +a, b = +b);
    return function(t) { return t <= 0 ? a : t >= 1 ? b : r(t); };
  };
}

function bimap(domain, range, deinterpolate, reinterpolate) {
  var d0 = domain[0], d1 = domain[1], r0 = range[0], r1 = range[1];
  if (d1 < d0) d0 = deinterpolate(d1, d0), r0 = reinterpolate(r1, r0);
  else d0 = deinterpolate(d0, d1), r0 = reinterpolate(r0, r1);
  return function(x) { return r0(d0(x)); };
}

function polymap(domain, range, deinterpolate, reinterpolate) {
  var j = Math.min(domain.length, range.length) - 1,
      d = new Array(j),
      r = new Array(j),
      i = -1;

  // Reverse descending domains.
  if (domain[j] < domain[0]) {
    domain = domain.slice().reverse();
    range = range.slice().reverse();
  }

  while (++i < j) {
    d[i] = deinterpolate(domain[i], domain[i + 1]);
    r[i] = reinterpolate(range[i], range[i + 1]);
  }

  return function(x) {
    var i = bisectRight(domain, x, 1, j) - 1;
    return r[i](d[i](x));
  };
}

function copy(source, target) {
  return target
      .domain(source.domain())
      .range(source.range())
      .interpolate(source.interpolate())
      .clamp(source.clamp());
}

// deinterpolate(a, b)(x) takes a domain value x in [a,b] and returns the corresponding parameter t in [0,1].
// reinterpolate(a, b)(t) takes a parameter t in [0,1] and returns the corresponding domain value x in [a,b].
function continuous(deinterpolate, reinterpolate) {
  var domain = unit,
      range = unit,
      interpolate = interpolateValue,
      clamp = false,
      piecewise,
      output,
      input;

  function rescale() {
    piecewise = Math.min(domain.length, range.length) > 2 ? polymap : bimap;
    output = input = null;
    return scale;
  }

  function scale(x) {
    return (output || (output = piecewise(domain, range, clamp ? deinterpolateClamp(deinterpolate) : deinterpolate, interpolate)))(+x);
  }

  scale.invert = function(y) {
    return (input || (input = piecewise(range, domain, deinterpolateLinear, clamp ? reinterpolateClamp(reinterpolate) : reinterpolate)))(+y);
  };

  scale.domain = function(_) {
    return arguments.length ? (domain = map$1.call(_, number), rescale()) : domain.slice();
  };

  scale.range = function(_) {
    return arguments.length ? (range = slice.call(_), rescale()) : range.slice();
  };

  scale.rangeRound = function(_) {
    return range = slice.call(_), interpolate = interpolateRound, rescale();
  };

  scale.clamp = function(_) {
    return arguments.length ? (clamp = !!_, rescale()) : clamp;
  };

  scale.interpolate = function(_) {
    return arguments.length ? (interpolate = _, rescale()) : interpolate;
  };

  return rescale();
}

function tickFormat(domain, count, specifier) {
  var start = domain[0],
      stop = domain[domain.length - 1],
      step = tickStep(start, stop, count == null ? 10 : count),
      precision;
  specifier = formatSpecifier$1(specifier == null ? ",f" : specifier);
  switch (specifier.type) {
    case "s": {
      var value = Math.max(Math.abs(start), Math.abs(stop));
      if (specifier.precision == null && !isNaN(precision = precisionPrefix(step, value))) specifier.precision = precision;
      return formatPrefix$1(specifier, value);
    }
    case "":
    case "e":
    case "g":
    case "p":
    case "r": {
      if (specifier.precision == null && !isNaN(precision = precisionRound(step, Math.max(Math.abs(start), Math.abs(stop))))) specifier.precision = precision - (specifier.type === "e");
      break;
    }
    case "f":
    case "%": {
      if (specifier.precision == null && !isNaN(precision = precisionFixed(step))) specifier.precision = precision - (specifier.type === "%") * 2;
      break;
    }
  }
  return format$1(specifier);
}

function linearish(scale) {
  var domain = scale.domain;

  scale.ticks = function(count) {
    var d = domain();
    return ticks(d[0], d[d.length - 1], count == null ? 10 : count);
  };

  scale.tickFormat = function(count, specifier) {
    return tickFormat(domain(), count, specifier);
  };

  scale.nice = function(count) {
    var d = domain(),
        i = d.length - 1,
        n = count == null ? 10 : count,
        start = d[0],
        stop = d[i],
        step = tickStep(start, stop, n);

    if (step) {
      step = tickStep(Math.floor(start / step) * step, Math.ceil(stop / step) * step, n);
      d[0] = Math.floor(start / step) * step;
      d[i] = Math.ceil(stop / step) * step;
      domain(d);
    }

    return scale;
  };

  return scale;
}

function linear$1() {
  var scale = continuous(deinterpolateLinear, reinterpolate);

  scale.copy = function() {
    return copy(scale, linear$1());
  };

  return linearish(scale);
}

function colors(s) {
  return s.match(/.{6}/g).map(function(x) {
    return "#" + x;
  });
}

colors("1f77b4ff7f0e2ca02cd627289467bd8c564be377c27f7f7fbcbd2217becf");

colors("393b795254a36b6ecf9c9ede6379398ca252b5cf6bcedb9c8c6d31bd9e39e7ba52e7cb94843c39ad494ad6616be7969c7b4173a55194ce6dbdde9ed6");

colors("3182bd6baed69ecae1c6dbefe6550dfd8d3cfdae6bfdd0a231a35474c476a1d99bc7e9c0756bb19e9ac8bcbddcdadaeb636363969696bdbdbdd9d9d9");

colors("1f77b4aec7e8ff7f0effbb782ca02c98df8ad62728ff98969467bdc5b0d58c564bc49c94e377c2f7b6d27f7f7fc7c7c7bcbd22dbdb8d17becf9edae5");

cubehelixLong(cubehelix$1(300, 0.5, 0.0), cubehelix$1(-240, 0.5, 1.0));

var warm = cubehelixLong(cubehelix$1(-100, 0.75, 0.35), cubehelix$1(80, 1.50, 0.8));

var cool = cubehelixLong(cubehelix$1(260, 0.75, 0.35), cubehelix$1(80, 1.50, 0.8));

var rainbow = cubehelix$1();

function ramp(range) {
  var n = range.length;
  return function(t) {
    return range[Math.max(0, Math.min(n - 1, Math.floor(t * n)))];
  };
}

ramp(colors("44015444025645045745055946075a46085c460a5d460b5e470d60470e6147106347116447136548146748166848176948186a481a6c481b6d481c6e481d6f481f70482071482173482374482475482576482677482878482979472a7a472c7a472d7b472e7c472f7d46307e46327e46337f463480453581453781453882443983443a83443b84433d84433e85423f854240864241864142874144874045884046883f47883f48893e49893e4a893e4c8a3d4d8a3d4e8a3c4f8a3c508b3b518b3b528b3a538b3a548c39558c39568c38588c38598c375a8c375b8d365c8d365d8d355e8d355f8d34608d34618d33628d33638d32648e32658e31668e31678e31688e30698e306a8e2f6b8e2f6c8e2e6d8e2e6e8e2e6f8e2d708e2d718e2c718e2c728e2c738e2b748e2b758e2a768e2a778e2a788e29798e297a8e297b8e287c8e287d8e277e8e277f8e27808e26818e26828e26828e25838e25848e25858e24868e24878e23888e23898e238a8d228b8d228c8d228d8d218e8d218f8d21908d21918c20928c20928c20938c1f948c1f958b1f968b1f978b1f988b1f998a1f9a8a1e9b8a1e9c891e9d891f9e891f9f881fa0881fa1881fa1871fa28720a38620a48621a58521a68522a78522a88423a98324aa8325ab8225ac8226ad8127ad8128ae8029af7f2ab07f2cb17e2db27d2eb37c2fb47c31b57b32b67a34b67935b77937b87838b9773aba763bbb753dbc743fbc7340bd7242be7144bf7046c06f48c16e4ac16d4cc26c4ec36b50c46a52c56954c56856c66758c7655ac8645cc8635ec96260ca6063cb5f65cb5e67cc5c69cd5b6ccd5a6ece5870cf5773d05675d05477d1537ad1517cd2507fd34e81d34d84d44b86d54989d5488bd6468ed64590d74393d74195d84098d83e9bd93c9dd93ba0da39a2da37a5db36a8db34aadc32addc30b0dd2fb2dd2db5de2bb8de29bade28bddf26c0df25c2df23c5e021c8e020cae11fcde11dd0e11cd2e21bd5e21ad8e219dae319dde318dfe318e2e418e5e419e7e419eae51aece51befe51cf1e51df4e61ef6e620f8e621fbe723fde725"));

var magma = ramp(colors("00000401000501010601010802010902020b02020d03030f03031204041405041606051806051a07061c08071e0907200a08220b09240c09260d0a290e0b2b100b2d110c2f120d31130d34140e36150e38160f3b180f3d19103f1a10421c10441d11471e114920114b21114e22115024125325125527125829115a2a115c2c115f2d11612f116331116533106734106936106b38106c390f6e3b0f703d0f713f0f72400f74420f75440f764510774710784910784a10794c117a4e117b4f127b51127c52137c54137d56147d57157e59157e5a167e5c167f5d177f5f187f601880621980641a80651a80671b80681c816a1c816b1d816d1d816e1e81701f81721f817320817521817621817822817922827b23827c23827e24828025828125818326818426818627818827818928818b29818c29818e2a81902a81912b81932b80942c80962c80982d80992d809b2e7f9c2e7f9e2f7fa02f7fa1307ea3307ea5317ea6317da8327daa337dab337cad347cae347bb0357bb2357bb3367ab5367ab73779b83779ba3878bc3978bd3977bf3a77c03a76c23b75c43c75c53c74c73d73c83e73ca3e72cc3f71cd4071cf4070d0416fd2426fd3436ed5446dd6456cd8456cd9466bdb476adc4869de4968df4a68e04c67e24d66e34e65e44f64e55064e75263e85362e95462ea5661eb5760ec5860ed5a5fee5b5eef5d5ef05f5ef1605df2625df2645cf3655cf4675cf4695cf56b5cf66c5cf66e5cf7705cf7725cf8745cf8765cf9785df9795df97b5dfa7d5efa7f5efa815ffb835ffb8560fb8761fc8961fc8a62fc8c63fc8e64fc9065fd9266fd9467fd9668fd9869fd9a6afd9b6bfe9d6cfe9f6dfea16efea36ffea571fea772fea973feaa74feac76feae77feb078feb27afeb47bfeb67cfeb77efeb97ffebb81febd82febf84fec185fec287fec488fec68afec88cfeca8dfecc8ffecd90fecf92fed194fed395fed597fed799fed89afdda9cfddc9efddea0fde0a1fde2a3fde3a5fde5a7fde7a9fde9aafdebacfcecaefceeb0fcf0b2fcf2b4fcf4b6fcf6b8fcf7b9fcf9bbfcfbbdfcfdbf"));

var inferno = ramp(colors("00000401000501010601010802010a02020c02020e03021004031204031405041706041907051b08051d09061f0a07220b07240c08260d08290e092b10092d110a30120a32140b34150b37160b39180c3c190c3e1b0c411c0c431e0c451f0c48210c4a230c4c240c4f260c51280b53290b552b0b572d0b592f0a5b310a5c320a5e340a5f3609613809623909633b09643d09653e0966400a67420a68440a68450a69470b6a490b6a4a0c6b4c0c6b4d0d6c4f0d6c510e6c520e6d540f6d550f6d57106e59106e5a116e5c126e5d126e5f136e61136e62146e64156e65156e67166e69166e6a176e6c186e6d186e6f196e71196e721a6e741a6e751b6e771c6d781c6d7a1d6d7c1d6d7d1e6d7f1e6c801f6c82206c84206b85216b87216b88226a8a226a8c23698d23698f24699025689225689326679526679727669827669a28659b29649d29649f2a63a02a63a22b62a32c61a52c60a62d60a82e5fa92e5eab2f5ead305dae305cb0315bb1325ab3325ab43359b63458b73557b93556ba3655bc3754bd3853bf3952c03a51c13a50c33b4fc43c4ec63d4dc73e4cc83f4bca404acb4149cc4248ce4347cf4446d04545d24644d34743d44842d54a41d74b3fd84c3ed94d3dda4e3cdb503bdd513ade5238df5337e05536e15635e25734e35933e45a31e55c30e65d2fe75e2ee8602de9612bea632aeb6429eb6628ec6726ed6925ee6a24ef6c23ef6e21f06f20f1711ff1731df2741cf3761bf37819f47918f57b17f57d15f67e14f68013f78212f78410f8850ff8870ef8890cf98b0bf98c0af98e09fa9008fa9207fa9407fb9606fb9706fb9906fb9b06fb9d07fc9f07fca108fca309fca50afca60cfca80dfcaa0ffcac11fcae12fcb014fcb216fcb418fbb61afbb81dfbba1ffbbc21fbbe23fac026fac228fac42afac62df9c72ff9c932f9cb35f8cd37f8cf3af7d13df7d340f6d543f6d746f5d949f5db4cf4dd4ff4df53f4e156f3e35af3e55df2e661f2e865f2ea69f1ec6df1ed71f1ef75f1f179f2f27df2f482f3f586f3f68af4f88ef5f992f6fa96f8fb9af9fc9dfafda1fcffa4"));

var plasma = ramp(colors("0d088710078813078916078a19068c1b068d1d068e20068f2206902406912605912805922a05932c05942e05952f059631059733059735049837049938049a3a049a3c049b3e049c3f049c41049d43039e44039e46039f48039f4903a04b03a14c02a14e02a25002a25102a35302a35502a45601a45801a45901a55b01a55c01a65e01a66001a66100a76300a76400a76600a76700a86900a86a00a86c00a86e00a86f00a87100a87201a87401a87501a87701a87801a87a02a87b02a87d03a87e03a88004a88104a78305a78405a78606a68707a68808a68a09a58b0aa58d0ba58e0ca48f0da4910ea3920fa39410a29511a19613a19814a099159f9a169f9c179e9d189d9e199da01a9ca11b9ba21d9aa31e9aa51f99a62098a72197a82296aa2395ab2494ac2694ad2793ae2892b02991b12a90b22b8fb32c8eb42e8db52f8cb6308bb7318ab83289ba3388bb3488bc3587bd3786be3885bf3984c03a83c13b82c23c81c33d80c43e7fc5407ec6417dc7427cc8437bc9447aca457acb4679cc4778cc4977cd4a76ce4b75cf4c74d04d73d14e72d24f71d35171d45270d5536fd5546ed6556dd7566cd8576bd9586ada5a6ada5b69db5c68dc5d67dd5e66de5f65de6164df6263e06363e16462e26561e26660e3685fe4695ee56a5de56b5de66c5ce76e5be76f5ae87059e97158e97257ea7457eb7556eb7655ec7754ed7953ed7a52ee7b51ef7c51ef7e50f07f4ff0804ef1814df1834cf2844bf3854bf3874af48849f48948f58b47f58c46f68d45f68f44f79044f79143f79342f89441f89540f9973ff9983ef99a3efa9b3dfa9c3cfa9e3bfb9f3afba139fba238fca338fca537fca636fca835fca934fdab33fdac33fdae32fdaf31fdb130fdb22ffdb42ffdb52efeb72dfeb82cfeba2cfebb2bfebd2afebe2afec029fdc229fdc328fdc527fdc627fdc827fdca26fdcb26fccd25fcce25fcd025fcd225fbd324fbd524fbd724fad824fada24f9dc24f9dd25f8df25f8e125f7e225f7e425f6e626f6e826f5e926f5eb27f4ed27f3ee27f3f027f2f227f1f426f1f525f0f724f0f921"));

function ascending(a, b) {
  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}

function bisector(compare) {
  if (compare.length === 1) compare = ascendingComparator(compare);
  return {
    left: function(a, x, lo, hi) {
      if (lo == null) lo = 0;
      if (hi == null) hi = a.length;
      while (lo < hi) {
        var mid = lo + hi >>> 1;
        if (compare(a[mid], x) < 0) lo = mid + 1;
        else hi = mid;
      }
      return lo;
    },
    right: function(a, x, lo, hi) {
      if (lo == null) lo = 0;
      if (hi == null) hi = a.length;
      while (lo < hi) {
        var mid = lo + hi >>> 1;
        if (compare(a[mid], x) > 0) hi = mid;
        else lo = mid + 1;
      }
      return lo;
    }
  };
}

function ascendingComparator(f) {
  return function(d, x) {
    return ascending(f(d), x);
  };
}

var ascendingBisect = bisector(ascending);

function max(array, f) {
  var i = -1,
      n = array.length,
      a,
      b;

  if (f == null) {
    while (++i < n) if ((b = array[i]) != null && b >= b) { a = b; break; }
    while (++i < n) if ((b = array[i]) != null && b > a) a = b;
  }

  else {
    while (++i < n) if ((b = f(array[i], i, array)) != null && b >= b) { a = b; break; }
    while (++i < n) if ((b = f(array[i], i, array)) != null && b > a) a = b;
  }

  return a;
}

function sum(array, f) {
  var s = 0,
      n = array.length,
      a,
      i = -1;

  if (f == null) {
    while (++i < n) if (a = +array[i]) s += a; // Note: zero and null are equivalent.
  }

  else {
    while (++i < n) if (a = +f(array[i], i, array)) s += a;
  }

  return s;
}

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var d3_identity = function d3_identity(d) {
  return d;
};

var d3_reverse = function d3_reverse(arr) {
  var mirror = [];
  for (var i = 0, l = arr.length; i < l; i++) {
    mirror[i] = arr[l - i - 1];
  }
  return mirror;
};

//Text wrapping code adapted from Mike Bostock
var d3_textWrapping = function d3_textWrapping(text, width) {
  text.each(function () {
    var text = select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineHeight = 1.2,
        //ems
    y = text.attr("y"),
        dy = parseFloat(text.attr("dy")) || 0,
        tspan = text.text(null).append("tspan").attr("x", 0).attr("dy", dy + "em");

    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width && line.length > 1) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("dy", lineHeight + dy + "em").text(word);
      }
    }
  });
};

var d3_mergeLabels = function d3_mergeLabels() {
  var gen = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
  var labels = arguments[1];
  var domain = arguments[2];
  var range = arguments[3];
  var labelDelimiter = arguments[4];

  if ((typeof labels === "undefined" ? "undefined" : _typeof(labels)) === "object") {
    if (labels.length === 0) return gen;

    var i = labels.length;
    for (; i < gen.length; i++) {
      labels.push(gen[i]);
    }
    return labels;
  } else if (typeof labels === "function") {
    var customLabels = [];
    var genLength = gen.length;
    for (var _i = 0; _i < genLength; _i++) {
      customLabels.push(labels({
        i: _i,
        genLength: genLength,
        generatedLabels: gen,
        domain: domain,
        range: range,
        labelDelimiter: labelDelimiter
      }));
    }
    return customLabels;
  }

  return gen;
};

var d3_linearLegend = function d3_linearLegend(scale, cells, labelFormat) {
  var data = [];

  if (cells.length > 1) {
    data = cells;
  } else {
    var domain = scale.domain(),
        increment = (domain[domain.length - 1] - domain[0]) / (cells - 1);
    var i = 0;

    for (; i < cells; i++) {
      data.push(domain[0] + i * increment);
    }
  }

  var labels = data.map(labelFormat);
  return {
    data: data,
    labels: labels,
    feature: function feature(d) {
      return scale(d);
    }
  };
};

var d3_quantLegend = function d3_quantLegend(scale, labelFormat, labelDelimiter) {
  var labels = scale.range().map(function (d) {
    var invert = scale.invertExtent(d);
    return labelFormat(invert[0]) + " " + labelDelimiter + " " + labelFormat(invert[1]);
  });

  return {
    data: scale.range(),
    labels: labels,
    feature: d3_identity
  };
};

var d3_ordinalLegend = function d3_ordinalLegend(scale) {
  return {
    data: scale.domain(),
    labels: scale.domain(),
    feature: function feature(d) {
      return scale(d);
    }
  };
};

var d3_cellOver = function d3_cellOver(cellDispatcher, d, obj) {
  cellDispatcher.call("cellover", obj, d);
};

var d3_cellOut = function d3_cellOut(cellDispatcher, d, obj) {
  cellDispatcher.call("cellout", obj, d);
};

var d3_cellClick = function d3_cellClick(cellDispatcher, d, obj) {
  cellDispatcher.call("cellclick", obj, d);
};

var helper = {
  d3_drawShapes: function d3_drawShapes(shape, shapes, shapeHeight, shapeWidth, shapeRadius, path) {
    if (shape === "rect") {
      shapes.attr("height", shapeHeight).attr("width", shapeWidth);
    } else if (shape === "circle") {
      shapes.attr("r", shapeRadius);
    } else if (shape === "line") {
      shapes.attr("x1", 0).attr("x2", shapeWidth).attr("y1", 0).attr("y2", 0);
    } else if (shape === "path") {
      shapes.attr("d", path);
    }
  },

  d3_addText: function d3_addText(svg, enter, labels, classPrefix, labelWidth) {
    return Promise.all(labels).then(function (resolvedLabels) {
      enter.append("text").attr("class", classPrefix + "label");
      var text = svg.selectAll("g." + classPrefix + "cell text." + classPrefix + "label").data(resolvedLabels).text(d3_identity);

      if (labelWidth) {
        svg.selectAll("g." + classPrefix + "cell text." + classPrefix + "label").call(d3_textWrapping, labelWidth);
      }
      return text;
    });
  },

  d3_calcType: function d3_calcType(scale, ascending, cells, labels, labelFormat, labelDelimiter) {
    var type = scale.invertExtent ? d3_quantLegend(scale, labelFormat, labelDelimiter) : scale.ticks ? d3_linearLegend(scale, cells, labelFormat) : d3_ordinalLegend(scale);

    //for d3.scaleSequential that doesn't have a range function
    var range = scale.range && scale.range() || scale.domain();
    type.labels = d3_mergeLabels(type.labels, labels, scale.domain(), range, labelDelimiter);

    if (ascending) {
      type.labels = d3_reverse(type.labels);
      type.data = d3_reverse(type.data);
    }

    return type;
  },

  d3_filterCells: function d3_filterCells(type, cellFilter) {
    var filterCells = type.data.map(function (d, i) {
      return { data: d, label: type.labels[i] };
    }).filter(cellFilter);
    var dataValues = filterCells.map(function (d) {
      return d.data;
    });
    var labelValues = filterCells.map(function (d) {
      return d.label;
    });
    type.data = type.data.filter(function (d) {
      return dataValues.indexOf(d) !== -1;
    });
    type.labels = type.labels.filter(function (d) {
      return labelValues.indexOf(d) !== -1;
    });
    return type;
  },

  d3_placement: function d3_placement(orient, cell, cellTrans, text, textTrans, labelAlign) {
    cell.attr("transform", cellTrans);
    text.attr("transform", textTrans);
    if (orient === "horizontal") {
      text.style("text-anchor", labelAlign);
    }
  },

  d3_addEvents: function d3_addEvents(cells, dispatcher) {
    cells.on("mouseover.legend", function (d) {
      d3_cellOver(dispatcher, d, this);
    }).on("mouseout.legend", function (d) {
      d3_cellOut(dispatcher, d, this);
    }).on("click.legend", function (d) {
      d3_cellClick(dispatcher, d, this);
    });
  },

  d3_title: function d3_title(svg, title, classPrefix, titleWidth) {
    if (title !== "") {
      var titleText = svg.selectAll("text." + classPrefix + "legendTitle");

      titleText.data([title]).enter().append("text").attr("class", classPrefix + "legendTitle");

      svg.selectAll("text." + classPrefix + "legendTitle").text(title);

      if (titleWidth) {
        svg.selectAll("text." + classPrefix + "legendTitle").call(d3_textWrapping, titleWidth);
      }

      var cellsSvg = svg.select("." + classPrefix + "legendCells");
      var yOffset = svg.select("." + classPrefix + "legendTitle").nodes().map(function (d) {
        return d.getBBox().height;
      })[0],
          xOffset = -cellsSvg.nodes().map(function (d) {
        return d.getBBox().x;
      })[0];
      cellsSvg.attr("transform", "translate(" + xOffset + "," + yOffset + ")");
    }
  },

  d3_defaultLocale: {
    format: format,
    formatPrefix: formatPrefix
  },

  d3_defaultFormatSpecifier: ".01f",

  d3_defaultDelimiter: "to"
};

function color() {
  var scale = linear$1(),
      shape = "rect",
      shapeWidth = 15,
      shapeHeight = 15,
      shapeRadius = 10,
      shapePadding = 2,
      cells = [5],
      cellFilter = void 0,
      labels = [],
      classPrefix = "",
      useClass = false,
      title = "",
      locale = helper.d3_defaultLocale,
      specifier = helper.d3_defaultFormatSpecifier,
      labelOffset = 10,
      labelAlign = "middle",
      labelDelimiter = helper.d3_defaultDelimiter,
      labelWrap = void 0,
      orient = "vertical",
      ascending = false,
      path = void 0,
      titleWidth = void 0,
      legendDispatcher = dispatch("cellover", "cellout", "cellclick");

  function legend(svg) {
    var type = helper.d3_calcType(scale, ascending, cells, labels, locale.format(specifier), labelDelimiter),
        legendG = svg.selectAll("g").data([scale]);

    legendG.enter().append("g").attr("class", classPrefix + "legendCells");

    if (cellFilter) {
      helper.d3_filterCells(type, cellFilter);
    }

    var cell = svg.select("." + classPrefix + "legendCells").selectAll("." + classPrefix + "cell").data(type.data);

    var cellEnter = cell.enter().append("g").attr("class", classPrefix + "cell");
    cellEnter.append(shape).attr("class", classPrefix + "swatch");

    var shapes = svg.selectAll("g." + classPrefix + "cell " + shape + "." + classPrefix + "swatch").data(type.data);

    //add event handlers
    helper.d3_addEvents(cellEnter, legendDispatcher);

    cell.exit().transition().style("opacity", 0).remove();

    shapes.exit().transition().style("opacity", 0).remove();

    shapes = shapes.merge(shapes);
    // we need to merge the selection, otherwise changes in the legend (e.g. change of orientation) are applied only to the new cells and not the existing ones.
    cell = cellEnter.merge(cell);

    helper.d3_drawShapes(shape, shapes, shapeHeight, shapeWidth, shapeRadius, path);

    helper.d3_addText(svg, cellEnter, type.labels, classPrefix, labelWrap).then(function (text) {

      // sets placement
      var textSize = text.nodes().map(function (d) {
        return d.getBBox();
      }),
          shapeSize = shapes.nodes().map(function (d) {
        return d.getBBox();
      });
      //sets scale
      //everything is fill except for line which is stroke,
      if (!useClass) {
        if (shape == "line") {
          shapes.style("stroke", type.feature);
        } else {
          shapes.style("fill", type.feature);
        }
      } else {
        shapes.attr("class", function (d) {
          return classPrefix + "swatch " + type.feature(d);
        });
      }

      var cellTrans = void 0,
          textTrans = void 0,
          textAlign = labelAlign == "start" ? 0 : labelAlign == "middle" ? 0.5 : 1;

      //positions cells and text
      if (orient === "vertical") {
        var cellSize = textSize.map(function (d, i) {
          return Math.max(d.height, shapeSize[i].height);
        });

        cellTrans = function cellTrans(d, i) {
          var height = sum(cellSize.slice(0, i));
          return "translate(0, " + (height + i * shapePadding) + ")";
        };

        textTrans = function textTrans(d, i) {
          return "translate( " + (shapeSize[i].width + shapeSize[i].x + labelOffset) + ", " + (shapeSize[i].y + shapeSize[i].height / 2 + 5) + ")";
        };
      } else if (orient === "horizontal") {
        cellTrans = function cellTrans(d, i) {
          return "translate(" + i * (shapeSize[i].width + shapePadding) + ",0)";
        };
        textTrans = function textTrans(d, i) {
          return "translate(" + (shapeSize[i].width * textAlign + shapeSize[i].x) + ",\n            " + (shapeSize[i].height + shapeSize[i].y + labelOffset + 8) + ")";
        };
      }

      helper.d3_placement(orient, cell, cellTrans, text, textTrans, labelAlign);
      helper.d3_title(svg, title, classPrefix, titleWidth);

      cell.transition().style("opacity", 1);
    });
  }

  legend.scale = function (_) {
    if (!arguments.length) return scale;
    scale = _;
    return legend;
  };

  legend.cells = function (_) {
    if (!arguments.length) return cells;
    if (_.length > 1 || _ >= 2) {
      cells = _;
    }
    return legend;
  };

  legend.cellFilter = function (_) {
    if (!arguments.length) return cellFilter;
    cellFilter = _;
    return legend;
  };

  legend.shape = function (_, d) {
    if (!arguments.length) return shape;
    if (_ == "rect" || _ == "circle" || _ == "line" || _ == "path" && typeof d === "string") {
      shape = _;
      path = d;
    }
    return legend;
  };

  legend.shapeWidth = function (_) {
    if (!arguments.length) return shapeWidth;
    shapeWidth = +_;
    return legend;
  };

  legend.shapeHeight = function (_) {
    if (!arguments.length) return shapeHeight;
    shapeHeight = +_;
    return legend;
  };

  legend.shapeRadius = function (_) {
    if (!arguments.length) return shapeRadius;
    shapeRadius = +_;
    return legend;
  };

  legend.shapePadding = function (_) {
    if (!arguments.length) return shapePadding;
    shapePadding = +_;
    return legend;
  };

  legend.labels = function (_) {
    if (!arguments.length) return labels;
    labels = _;
    return legend;
  };

  legend.labelAlign = function (_) {
    if (!arguments.length) return labelAlign;
    if (_ == "start" || _ == "end" || _ == "middle") {
      labelAlign = _;
    }
    return legend;
  };

  legend.locale = function (_) {
    if (!arguments.length) return locale;
    locale = formatLocale(_);
    return legend;
  };

  legend.labelFormat = function (_) {
    if (!arguments.length) return legend.locale().format(specifier);
    specifier = formatSpecifier(_);
    return legend;
  };

  legend.labelOffset = function (_) {
    if (!arguments.length) return labelOffset;
    labelOffset = +_;
    return legend;
  };

  legend.labelDelimiter = function (_) {
    if (!arguments.length) return labelDelimiter;
    labelDelimiter = _;
    return legend;
  };

  legend.labelWrap = function (_) {
    if (!arguments.length) return labelWrap;
    labelWrap = _;
    return legend;
  };

  legend.useClass = function (_) {
    if (!arguments.length) return useClass;
    if (_ === true || _ === false) {
      useClass = _;
    }
    return legend;
  };

  legend.orient = function (_) {
    if (!arguments.length) return orient;
    _ = _.toLowerCase();
    if (_ == "horizontal" || _ == "vertical") {
      orient = _;
    }
    return legend;
  };

  legend.ascending = function (_) {
    if (!arguments.length) return ascending;
    ascending = !!_;
    return legend;
  };

  legend.classPrefix = function (_) {
    if (!arguments.length) return classPrefix;
    classPrefix = _;
    return legend;
  };

  legend.title = function (_) {
    if (!arguments.length) return title;
    title = _;
    return legend;
  };

  legend.titleWidth = function (_) {
    if (!arguments.length) return titleWidth;
    titleWidth = _;
    return legend;
  };

  legend.textWrap = function (_) {
    if (!arguments.length) return textWrap;
    textWrap = _;
    return legend;
  };

  legend.on = function () {
    var value = legendDispatcher.on.apply(legendDispatcher, arguments);
    return value === legendDispatcher ? legend : value;
  };

  return legend;
}

function size() {
  var scale = linear$1(),
      shape = "rect",
      shapeWidth = 15,
      shapePadding = 2,
      cells = [5],
      cellFilter = void 0,
      labels = [],
      classPrefix = "",
      title = "",
      locale = helper.d3_defaultLocale,
      specifier = helper.d3_defaultFormatSpecifier,
      labelOffset = 10,
      labelAlign = "middle",
      labelDelimiter = helper.d3_defaultDelimiter,
      labelWrap = void 0,
      orient = "vertical",
      ascending = false,
      path = void 0,
      titleWidth = void 0,
      legendDispatcher = dispatch("cellover", "cellout", "cellclick");

  function legend(svg) {
    var type = helper.d3_calcType(scale, ascending, cells, labels, locale.format(specifier), labelDelimiter),
        legendG = svg.selectAll("g").data([scale]);

    if (cellFilter) {
      helper.d3_filterCells(type, cellFilter);
    }

    legendG.enter().append("g").attr("class", classPrefix + "legendCells");

    var cell = svg.select("." + classPrefix + "legendCells").selectAll("." + classPrefix + "cell").data(type.data);
    var cellEnter = cell.enter().append("g").attr("class", classPrefix + "cell");
    cellEnter.append(shape).attr("class", classPrefix + "swatch");

    var shapes = svg.selectAll("g." + classPrefix + "cell " + shape + "." + classPrefix + "swatch");

    //add event handlers
    helper.d3_addEvents(cellEnter, legendDispatcher);

    cell.exit().transition().style("opacity", 0).remove();

    shapes.exit().transition().style("opacity", 0).remove();

    shapes = shapes.merge(shapes);
    // we need to merge the selection, otherwise changes in the legend (e.g. change of orientation) are applied only to the new cells and not the existing ones.
    cell = cellEnter.merge(cell);

    //creates shape
    if (shape === "line") {
      helper.d3_drawShapes(shape, shapes, 0, shapeWidth);
      shapes.attr("stroke-width", type.feature);
    } else {
      helper.d3_drawShapes(shape, shapes, type.feature, type.feature, type.feature, path);
    }

    helper.d3_addText(svg, cellEnter, type.labels, classPrefix, labelWrap).then(function (text) {

      //sets placement
      var textSize = text.nodes().map(function (d) {
        return d.getBBox();
      }),
          shapeSize = shapes.nodes().map(function (d, i) {
        var bbox = d.getBBox();
        var stroke = scale(type.data[i]);

        if (shape === "line" && orient === "horizontal") {
          bbox.height = bbox.height + stroke;
        } else if (shape === "line" && orient === "vertical") {
          bbox.width = bbox.width;
        }
        return bbox;
      });

      var maxH = max(shapeSize, function (d) {
        return d.height + d.y;
      }),
          maxW = max(shapeSize, function (d) {
        return d.width + d.x;
      });

      var cellTrans = void 0,
          textTrans = void 0,
          textAlign = labelAlign == "start" ? 0 : labelAlign == "middle" ? 0.5 : 1;

      //positions cells and text
      if (orient === "vertical") {
        var cellSize = textSize.map(function (d, i) {
          return Math.max(d.height, shapeSize[i].height);
        });
        var y = shape == "circle" || shape == "line" ? shapeSize[0].height / 2 : 0;
        cellTrans = function cellTrans(d, i) {
          var height = sum(cellSize.slice(0, i));

          return "translate(0, " + (y + height + i * shapePadding) + ")";
        };

        textTrans = function textTrans(d, i) {
          return "translate( " + (maxW + labelOffset) + ",\n            " + (shapeSize[i].y + shapeSize[i].height / 2 + 5) + ")";
        };
      } else if (orient === "horizontal") {
        cellTrans = function cellTrans(d, i) {
          var width = sum(shapeSize.slice(0, i), function (d) {
            return d.width;
          });
          var y = shape == "circle" || shape == "line" ? maxH / 2 : 0;
          return "translate(" + (width + i * shapePadding) + ", " + y + ")";
        };

        var offset = shape == "line" ? maxH / 2 : maxH;
        textTrans = function textTrans(d, i) {
          return "translate( " + (shapeSize[i].width * textAlign + shapeSize[i].x) + ",\n                " + (offset + labelOffset) + ")";
        };
      }

      helper.d3_placement(orient, cell, cellTrans, text, textTrans, labelAlign);
      helper.d3_title(svg, title, classPrefix, titleWidth);

      cell.transition().style("opacity", 1);
    });
  }

  legend.scale = function (_) {
    if (!arguments.length) return scale;
    scale = _;
    return legend;
  };

  legend.cells = function (_) {
    if (!arguments.length) return cells;
    if (_.length > 1 || _ >= 2) {
      cells = _;
    }
    return legend;
  };

  legend.cellFilter = function (_) {
    if (!arguments.length) return cellFilter;
    cellFilter = _;
    return legend;
  };

  legend.shape = function (_, d) {
    if (!arguments.length) return shape;
    if (_ == "rect" || _ == "circle" || _ == "line") {
      shape = _;
      path = d;
    }
    return legend;
  };

  legend.shapeWidth = function (_) {
    if (!arguments.length) return shapeWidth;
    shapeWidth = +_;
    return legend;
  };

  legend.shapePadding = function (_) {
    if (!arguments.length) return shapePadding;
    shapePadding = +_;
    return legend;
  };

  legend.labels = function (_) {
    if (!arguments.length) return labels;
    labels = _;
    return legend;
  };

  legend.labelAlign = function (_) {
    if (!arguments.length) return labelAlign;
    if (_ == "start" || _ == "end" || _ == "middle") {
      labelAlign = _;
    }
    return legend;
  };

  legend.locale = function (_) {
    if (!arguments.length) return locale;
    locale = formatLocale(_);
    return legend;
  };

  legend.labelFormat = function (_) {
    if (!arguments.length) return legend.locale().format(specifier);
    specifier = formatSpecifier(_);
    return legend;
  };

  legend.labelOffset = function (_) {
    if (!arguments.length) return labelOffset;
    labelOffset = +_;
    return legend;
  };

  legend.labelDelimiter = function (_) {
    if (!arguments.length) return labelDelimiter;
    labelDelimiter = _;
    return legend;
  };

  legend.labelWrap = function (_) {
    if (!arguments.length) return labelWrap;
    labelWrap = _;
    return legend;
  };

  legend.orient = function (_) {
    if (!arguments.length) return orient;
    _ = _.toLowerCase();
    if (_ == "horizontal" || _ == "vertical") {
      orient = _;
    }
    return legend;
  };

  legend.ascending = function (_) {
    if (!arguments.length) return ascending;
    ascending = !!_;
    return legend;
  };

  legend.classPrefix = function (_) {
    if (!arguments.length) return classPrefix;
    classPrefix = _;
    return legend;
  };

  legend.title = function (_) {
    if (!arguments.length) return title;
    title = _;
    return legend;
  };

  legend.titleWidth = function (_) {
    if (!arguments.length) return titleWidth;
    titleWidth = _;
    return legend;
  };

  legend.on = function () {
    var value = legendDispatcher.on.apply(legendDispatcher, arguments);
    return value === legendDispatcher ? legend : value;
  };

  return legend;
}

function symbol() {
  var scale = linear$1(),
      shape = "path",
      shapeWidth = 15,
      shapeHeight = 15,
      shapeRadius = 10,
      shapePadding = 5,
      cells = [5],
      cellFilter = void 0,
      labels = [],
      classPrefix = "",
      title = "",
      locale = helper.d3_defaultLocale,
      specifier = helper.d3_defaultFormatSpecifier,
      labelAlign = "middle",
      labelOffset = 10,
      labelDelimiter = helper.d3_defaultDelimiter,
      labelWrap = void 0,
      orient = "vertical",
      ascending = false,
      titleWidth = void 0,
      legendDispatcher = dispatch("cellover", "cellout", "cellclick");

  function legend(svg) {
    var type = helper.d3_calcType(scale, ascending, cells, labels, locale.format(specifier), labelDelimiter),
        legendG = svg.selectAll("g").data([scale]);

    if (cellFilter) {
      helper.d3_filterCells(type, cellFilter);
    }

    legendG.enter().append("g").attr("class", classPrefix + "legendCells");

    var cell = svg.select("." + classPrefix + "legendCells").selectAll("." + classPrefix + "cell").data(type.data);
    var cellEnter = cell.enter().append("g").attr("class", classPrefix + "cell");
    cellEnter.append(shape).attr("class", classPrefix + "swatch");

    var shapes = svg.selectAll("g." + classPrefix + "cell " + shape + "." + classPrefix + "swatch");

    //add event handlers
    helper.d3_addEvents(cellEnter, legendDispatcher);

    //remove old shapes
    cell.exit().transition().style("opacity", 0).remove();
    shapes.exit().transition().style("opacity", 0).remove();

    shapes = shapes.merge(shapes);
    // we need to merge the selection, otherwise changes in the legend (e.g. change of orientation) are applied only to the new cells and not the existing ones.
    cell = cellEnter.merge(cell);

    helper.d3_drawShapes(shape, shapes, shapeHeight, shapeWidth, shapeRadius, type.feature);

    helper.d3_addText(svg, cellEnter, type.labels, classPrefix, labelWrap).then(function (text) {

      // sets placement
      var textSize = text.nodes().map(function (d) {
        return d.getBBox();
      }),
          shapeSize = shapes.nodes().map(function (d) {
        return d.getBBox();
      });

      var maxH = max(shapeSize, function (d) {
        return d.height;
      }),
          maxW = max(shapeSize, function (d) {
        return d.width;
      });

      var cellTrans = void 0,
          textTrans = void 0,
          textAlign = labelAlign == "start" ? 0 : labelAlign == "middle" ? 0.5 : 1;

      //positions cells and text
      if (orient === "vertical") {
        var cellSize = textSize.map(function (d, i) {
          return Math.max(maxH, d.height);
        });

        cellTrans = function cellTrans(d, i) {
          var height = sum(cellSize.slice(0, i));
          return "translate(0, " + (height + i * shapePadding) + " )";
        };
        textTrans = function textTrans(d, i) {
          return "translate( " + (maxW + labelOffset) + ",\n                " + (shapeSize[i].y + shapeSize[i].height / 2 + 5) + ")";
        };
      } else if (orient === "horizontal") {
        cellTrans = function cellTrans(d, i) {
          return "translate( " + i * (maxW + shapePadding) + ",0)";
        };
        textTrans = function textTrans(d, i) {
          return "translate( " + (shapeSize[i].width * textAlign + shapeSize[i].x) + ",\n                " + (maxH + labelOffset) + ")";
        };
      }

      helper.d3_placement(orient, cell, cellTrans, text, textTrans, labelAlign);
      helper.d3_title(svg, title, classPrefix, titleWidth);
      cell.transition().style("opacity", 1);
    });
  }

  legend.scale = function (_) {
    if (!arguments.length) return scale;
    scale = _;
    return legend;
  };

  legend.cells = function (_) {
    if (!arguments.length) return cells;
    if (_.length > 1 || _ >= 2) {
      cells = _;
    }
    return legend;
  };

  legend.cellFilter = function (_) {
    if (!arguments.length) return cellFilter;
    cellFilter = _;
    return legend;
  };

  legend.shapePadding = function (_) {
    if (!arguments.length) return shapePadding;
    shapePadding = +_;
    return legend;
  };

  legend.labels = function (_) {
    if (!arguments.length) return labels;
    labels = _;
    return legend;
  };

  legend.labelAlign = function (_) {
    if (!arguments.length) return labelAlign;
    if (_ == "start" || _ == "end" || _ == "middle") {
      labelAlign = _;
    }
    return legend;
  };

  legend.locale = function (_) {
    if (!arguments.length) return locale;
    locale = formatLocale(_);
    return legend;
  };

  legend.labelFormat = function (_) {
    if (!arguments.length) return legend.locale().format(specifier);
    specifier = formatSpecifier(_);
    return legend;
  };

  legend.labelOffset = function (_) {
    if (!arguments.length) return labelOffset;
    labelOffset = +_;
    return legend;
  };

  legend.labelDelimiter = function (_) {
    if (!arguments.length) return labelDelimiter;
    labelDelimiter = _;
    return legend;
  };

  legend.labelWrap = function (_) {
    if (!arguments.length) return labelWrap;
    labelWrap = _;
    return legend;
  };

  legend.orient = function (_) {
    if (!arguments.length) return orient;
    _ = _.toLowerCase();
    if (_ == "horizontal" || _ == "vertical") {
      orient = _;
    }
    return legend;
  };

  legend.ascending = function (_) {
    if (!arguments.length) return ascending;
    ascending = !!_;
    return legend;
  };

  legend.classPrefix = function (_) {
    if (!arguments.length) return classPrefix;
    classPrefix = _;
    return legend;
  };

  legend.title = function (_) {
    if (!arguments.length) return title;
    title = _;
    return legend;
  };

  legend.titleWidth = function (_) {
    if (!arguments.length) return titleWidth;
    titleWidth = _;
    return legend;
  };

  legend.on = function () {
    var value = legendDispatcher.on.apply(legendDispatcher, arguments);
    return value === legendDispatcher ? legend : value;
  };

  return legend;
}

var thresholdLabels = function thresholdLabels(_ref) {
  var i = _ref.i,
      genLength = _ref.genLength,
      generatedLabels = _ref.generatedLabels,
      labelDelimiter = _ref.labelDelimiter;

  if (i === 0) {
    var values = generatedLabels[i].split(" " + labelDelimiter + " ");
    return "Less than " + values[1];
  } else if (i === genLength - 1) {
    var _values = generatedLabels[i].split(" " + labelDelimiter + " ");
    return _values[0] + " or more";
  }
  return generatedLabels[i];
};

var legendHelpers = {
  thresholdLabels: thresholdLabels
};

var index = {
  legendColor: color,
  legendSize: size,
  legendSymbol: symbol,
  legendHelpers: legendHelpers
};

export default index;
export { color as legendColor, legendHelpers, size as legendSize, symbol as legendSymbol };
