/**
 * QR code encoder (byte mode, versions 1 to 10), shared by the ticket page and
 * the /api/ticket-image function. Same code as Qr.gs in the Telegram bot.
 * encodeQR(text, level) returns { version, size, modules[y][x] } (true = dark).
 */
var QR = (function () {
  // Error-correction levels: ordinal for the tables, and the 2-bit format code.
  var ECL = { L: { ord: 0, bits: 1 }, M: { ord: 1, bits: 0 }, Q: { ord: 2, bits: 3 }, H: { ord: 3, bits: 2 } };
  // Index [level][version]; version 0 unused.
  var ECC_PER_BLOCK = [
    [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18],
    [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26],
    [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24],
    [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28]
  ];
  var NUM_BLOCKS = [
    [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4],
    [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5],
    [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8],
    [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8]
  ];
  var MAX_VERSION = 10;

  function utf8(str) {
    var out = [];
    for (var i = 0; i < str.length; i++) {
      var c = str.charCodeAt(i);
      if (c >= 0xd800 && c <= 0xdbff && i + 1 < str.length) {
        var d = str.charCodeAt(i + 1);
        if (d >= 0xdc00 && d <= 0xdfff) { c = 0x10000 + ((c - 0xd800) << 10) + (d - 0xdc00); i++; }
      }
      if (c < 0x80) out.push(c);
      else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 63));
      else if (c < 0x10000) out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
      else out.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    }
    return out;
  }

  function rawDataModules(ver) {
    var result = (16 * ver + 128) * ver + 64;
    if (ver >= 2) {
      var numAlign = Math.floor(ver / 7) + 2;
      result -= (25 * numAlign - 10) * numAlign - 55;
      if (ver >= 7) result -= 36;
    }
    return result;
  }

  function dataCodewords(ver, ecl) {
    return Math.floor(rawDataModules(ver) / 8) - ECC_PER_BLOCK[ecl.ord][ver] * NUM_BLOCKS[ecl.ord][ver];
  }

  function rsMul(x, y) {
    var z = 0;
    for (var i = 7; i >= 0; i--) {
      z = (z << 1) ^ ((z >>> 7) * 0x11d);
      z ^= ((y >>> i) & 1) * x;
    }
    return z;
  }

  function rsDivisor(degree) {
    var result = [];
    for (var i = 0; i < degree - 1; i++) result.push(0);
    result.push(1);
    var root = 1;
    for (var k = 0; k < degree; k++) {
      for (var j = 0; j < result.length; j++) {
        result[j] = rsMul(result[j], root);
        if (j + 1 < result.length) result[j] ^= result[j + 1];
      }
      root = rsMul(root, 0x02);
    }
    return result;
  }

  function rsRemainder(data, divisor) {
    var result = divisor.map(function () { return 0; });
    data.forEach(function (b) {
      var factor = b ^ result.shift();
      result.push(0);
      divisor.forEach(function (coef, i) { result[i] ^= rsMul(coef, factor); });
    });
    return result;
  }

  function pushBits(bits, val, len) {
    for (var i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1);
  }

  function getBit(x, i) { return ((x >>> i) & 1) !== 0; }

  /** Builds the module matrix for the text. Returns {version, size, modules[y][x]}. */
  function encode(text, level) {
    var ecl = ECL[level || 'Q'];
    var data = utf8(String(text));
    var ver, capBits;
    for (ver = 1; ver <= MAX_VERSION; ver++) {
      capBits = dataCodewords(ver, ecl) * 8;
      if (4 + (ver <= 9 ? 8 : 16) + data.length * 8 <= capBits) break;
    }
    if (ver > MAX_VERSION) throw new Error('QR text too long (' + data.length + ' bytes)');

    var bits = [];
    pushBits(bits, 4, 4);                         // byte mode
    pushBits(bits, data.length, ver <= 9 ? 8 : 16);
    data.forEach(function (b) { pushBits(bits, b, 8); });
    pushBits(bits, 0, Math.min(4, capBits - bits.length));
    pushBits(bits, 0, (8 - bits.length % 8) % 8);
    for (var pad = 0xec; bits.length < capBits; pad ^= 0xec ^ 0x11) pushBits(bits, pad, 8);
    var codewords = [];
    for (var i = 0; i < bits.length; i += 8) {
      var v = 0;
      for (var j = 0; j < 8; j++) v = (v << 1) | bits[i + j];
      codewords.push(v);
    }

    var size = ver * 4 + 17;
    var modules = [], isFn = [];
    for (var y = 0; y < size; y++) {
      modules.push(new Array(size).fill(false));
      isFn.push(new Array(size).fill(false));
    }
    function setFn(x, y, dark) { modules[y][x] = dark; isFn[y][x] = true; }

    function drawFormat(mask) {
      var d = (ecl.bits << 3) | mask;
      var rem = d;
      for (var i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
      var b = ((d << 10) | rem) ^ 0x5412;
      for (i = 0; i <= 5; i++) setFn(8, i, getBit(b, i));
      setFn(8, 7, getBit(b, 6));
      setFn(8, 8, getBit(b, 7));
      setFn(7, 8, getBit(b, 8));
      for (i = 9; i < 15; i++) setFn(14 - i, 8, getBit(b, i));
      for (i = 0; i < 8; i++) setFn(size - 1 - i, 8, getBit(b, i));
      for (i = 8; i < 15; i++) setFn(8, size - 15 + i, getBit(b, i));
      setFn(8, size - 8, true);
    }

    // Timing patterns
    for (i = 0; i < size; i++) { setFn(6, i, i % 2 === 0); setFn(i, 6, i % 2 === 0); }
    // Finder patterns
    [[3, 3], [size - 4, 3], [3, size - 4]].forEach(function (p) {
      for (var dy = -4; dy <= 4; dy++) {
        for (var dx = -4; dx <= 4; dx++) {
          var dist = Math.max(Math.abs(dx), Math.abs(dy));
          var xx = p[0] + dx, yy = p[1] + dy;
          if (xx >= 0 && xx < size && yy >= 0 && yy < size) setFn(xx, yy, dist !== 2 && dist !== 4);
        }
      }
    });
    // Alignment patterns
    var align = [];
    if (ver > 1) {
      var numAlign = Math.floor(ver / 7) + 2;
      var step = Math.ceil((ver * 4 + 4) / (numAlign * 2 - 2)) * 2;
      align = [6];
      for (var pos = size - 7; align.length < numAlign; pos -= step) align.splice(1, 0, pos);
    }
    for (var ai = 0; ai < align.length; ai++) {
      for (var aj = 0; aj < align.length; aj++) {
        var corner = (ai === 0 && aj === 0) || (ai === 0 && aj === align.length - 1) || (ai === align.length - 1 && aj === 0);
        if (corner) continue;
        for (var ddy = -2; ddy <= 2; ddy++) {
          for (var ddx = -2; ddx <= 2; ddx++) {
            setFn(align[ai] + ddx, align[aj] + ddy, Math.max(Math.abs(ddx), Math.abs(ddy)) !== 1);
          }
        }
      }
    }
    drawFormat(0);
    // Version information (versions 7+)
    if (ver >= 7) {
      var rem = ver;
      for (i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
      var vb = (ver << 12) | rem;
      for (i = 0; i < 18; i++) {
        var bit = getBit(vb, i), a = size - 11 + (i % 3), b2 = Math.floor(i / 3);
        setFn(a, b2, bit);
        setFn(b2, a, bit);
      }
    }

    // Error correction and interleaving
    var numBlocks = NUM_BLOCKS[ecl.ord][ver];
    var blockEcc = ECC_PER_BLOCK[ecl.ord][ver];
    var rawCw = Math.floor(rawDataModules(ver) / 8);
    var numShort = numBlocks - rawCw % numBlocks;
    var shortLen = Math.floor(rawCw / numBlocks);
    var div = rsDivisor(blockEcc);
    var blocks = [];
    for (var bi = 0, k = 0; bi < numBlocks; bi++) {
      var dat = codewords.slice(k, k + shortLen - blockEcc + (bi < numShort ? 0 : 1));
      k += dat.length;
      var ecc = rsRemainder(dat, div);
      if (bi < numShort) dat.push(0);
      blocks.push(dat.concat(ecc));
    }
    var all = [];
    for (i = 0; i < blocks[0].length; i++) {
      for (j = 0; j < blocks.length; j++) {
        if (i !== shortLen - blockEcc || j >= numShort) all.push(blocks[j][i]);
      }
    }

    // Place data bits in the zigzag order
    var bitIdx = 0;
    for (var right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (var vert = 0; vert < size; vert++) {
        for (var c = 0; c < 2; c++) {
          var x = right - c;
          var upward = ((right + 1) & 2) === 0;
          var yy2 = upward ? size - 1 - vert : vert;
          if (!isFn[yy2][x] && bitIdx < all.length * 8) {
            modules[yy2][x] = getBit(all[bitIdx >>> 3], 7 - (bitIdx & 7));
            bitIdx++;
          }
        }
      }
    }

    function applyMask(m) {
      for (var y = 0; y < size; y++) {
        for (var x = 0; x < size; x++) {
          var inv;
          switch (m) {
            case 0: inv = (x + y) % 2 === 0; break;
            case 1: inv = y % 2 === 0; break;
            case 2: inv = x % 3 === 0; break;
            case 3: inv = (x + y) % 3 === 0; break;
            case 4: inv = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; break;
            case 5: inv = (x * y) % 2 + (x * y) % 3 === 0; break;
            case 6: inv = ((x * y) % 2 + (x * y) % 3) % 2 === 0; break;
            default: inv = ((x + y) % 2 + (x * y) % 3) % 2 === 0;
          }
          if (inv && !isFn[y][x]) modules[y][x] = !modules[y][x];
        }
      }
    }

    function penalty() {
      var score = 0, y, x;
      function addHistory(len, hist) {
        if (hist[0] === 0) len += size;
        hist.pop();
        hist.unshift(len);
      }
      function countPatterns(h) {
        var n = h[1];
        var core = n > 0 && h[2] === n && h[3] === n * 3 && h[4] === n && h[5] === n;
        return (core && h[0] >= n * 4 && h[6] >= n ? 1 : 0) + (core && h[6] >= n * 4 && h[0] >= n ? 1 : 0);
      }
      function terminate(color, len, hist) {
        if (color) { addHistory(len, hist); len = 0; }
        len += size;
        addHistory(len, hist);
        return countPatterns(hist);
      }
      function scanLine(get) {
        var runColor = false, run = 0, hist = [0, 0, 0, 0, 0, 0, 0];
        for (var i = 0; i < size; i++) {
          if (get(i) === runColor) {
            run++;
            if (run === 5) score += 3;
            else if (run > 5) score++;
          } else {
            addHistory(run, hist);
            if (!runColor) score += countPatterns(hist) * 40;
            runColor = get(i);
            run = 1;
          }
        }
        score += terminate(runColor, run, hist) * 40;
      }
      for (y = 0; y < size; y++) scanLine(function (i) { return modules[y][i]; });
      for (x = 0; x < size; x++) scanLine(function (i) { return modules[i][x]; });
      for (y = 0; y < size - 1; y++) {
        for (x = 0; x < size - 1; x++) {
          var col = modules[y][x];
          if (col === modules[y][x + 1] && col === modules[y + 1][x] && col === modules[y + 1][x + 1]) score += 3;
        }
      }
      var dark = 0;
      modules.forEach(function (row) { row.forEach(function (m) { if (m) dark++; }); });
      var total = size * size;
      var kk = Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1;
      return score + kk * 10;
    }

    var best = 0, bestScore = Infinity;
    for (var m = 0; m < 8; m++) {
      applyMask(m);
      drawFormat(m);
      var s = penalty();
      if (s < bestScore) { bestScore = s; best = m; }
      applyMask(m);
    }
    applyMask(best);
    drawFormat(best);
    return { version: ver, size: size, modules: modules };
  }

  return { encode: encode };
})();

export const encodeQR = (text, level) => QR.encode(text, level);
