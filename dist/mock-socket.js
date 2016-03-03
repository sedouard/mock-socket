(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
 * URI.js - Mutating URLs
 * IPv6 Support
 *
 * Version: 1.17.1
 *
 * Author: Rodney Rehm
 * Web: http://medialize.github.io/URI.js/
 *
 * Licensed under
 *   MIT License http://www.opensource.org/licenses/mit-license
 *
 */

(function (root, factory) {
  'use strict';
  // https://github.com/umdjs/umd/blob/master/returnExports.js
  if (typeof exports === 'object') {
    // Node
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(factory);
  } else {
    // Browser globals (root is window)
    root.IPv6 = factory(root);
  }
}(this, function (root) {
  'use strict';

  /*
  var _in = "fe80:0000:0000:0000:0204:61ff:fe9d:f156";
  var _out = IPv6.best(_in);
  var _expected = "fe80::204:61ff:fe9d:f156";

  console.log(_in, _out, _expected, _out === _expected);
  */

  // save current IPv6 variable, if any
  var _IPv6 = root && root.IPv6;

  function bestPresentation(address) {
    // based on:
    // Javascript to test an IPv6 address for proper format, and to
    // present the "best text representation" according to IETF Draft RFC at
    // http://tools.ietf.org/html/draft-ietf-6man-text-addr-representation-04
    // 8 Feb 2010 Rich Brown, Dartware, LLC
    // Please feel free to use this code as long as you provide a link to
    // http://www.intermapper.com
    // http://intermapper.com/support/tools/IPV6-Validator.aspx
    // http://download.dartware.com/thirdparty/ipv6validator.js

    var _address = address.toLowerCase();
    var segments = _address.split(':');
    var length = segments.length;
    var total = 8;

    // trim colons (:: or ::a:b:c… or …a:b:c::)
    if (segments[0] === '' && segments[1] === '' && segments[2] === '') {
      // must have been ::
      // remove first two items
      segments.shift();
      segments.shift();
    } else if (segments[0] === '' && segments[1] === '') {
      // must have been ::xxxx
      // remove the first item
      segments.shift();
    } else if (segments[length - 1] === '' && segments[length - 2] === '') {
      // must have been xxxx::
      segments.pop();
    }

    length = segments.length;

    // adjust total segments for IPv4 trailer
    if (segments[length - 1].indexOf('.') !== -1) {
      // found a "." which means IPv4
      total = 7;
    }

    // fill empty segments them with "0000"
    var pos;
    for (pos = 0; pos < length; pos++) {
      if (segments[pos] === '') {
        break;
      }
    }

    if (pos < total) {
      segments.splice(pos, 1, '0000');
      while (segments.length < total) {
        segments.splice(pos, 0, '0000');
      }

      length = segments.length;
    }

    // strip leading zeros
    var _segments;
    for (var i = 0; i < total; i++) {
      _segments = segments[i].split('');
      for (var j = 0; j < 3 ; j++) {
        if (_segments[0] === '0' && _segments.length > 1) {
          _segments.splice(0,1);
        } else {
          break;
        }
      }

      segments[i] = _segments.join('');
    }

    // find longest sequence of zeroes and coalesce them into one segment
    var best = -1;
    var _best = 0;
    var _current = 0;
    var current = -1;
    var inzeroes = false;
    // i; already declared

    for (i = 0; i < total; i++) {
      if (inzeroes) {
        if (segments[i] === '0') {
          _current += 1;
        } else {
          inzeroes = false;
          if (_current > _best) {
            best = current;
            _best = _current;
          }
        }
      } else {
        if (segments[i] === '0') {
          inzeroes = true;
          current = i;
          _current = 1;
        }
      }
    }

    if (_current > _best) {
      best = current;
      _best = _current;
    }

    if (_best > 1) {
      segments.splice(best, _best, '');
    }

    length = segments.length;

    // assemble remaining segments
    var result = '';
    if (segments[0] === '')  {
      result = ':';
    }

    for (i = 0; i < length; i++) {
      result += segments[i];
      if (i === length - 1) {
        break;
      }

      result += ':';
    }

    if (segments[length - 1] === '') {
      result += ':';
    }

    return result;
  }

  function noConflict() {
    /*jshint validthis: true */
    if (root.IPv6 === this) {
      root.IPv6 = _IPv6;
    }
  
    return this;
  }

  return {
    best: bestPresentation,
    noConflict: noConflict
  };
}));

},{}],2:[function(require,module,exports){
/*!
 * URI.js - Mutating URLs
 * Second Level Domain (SLD) Support
 *
 * Version: 1.17.1
 *
 * Author: Rodney Rehm
 * Web: http://medialize.github.io/URI.js/
 *
 * Licensed under
 *   MIT License http://www.opensource.org/licenses/mit-license
 *
 */

(function (root, factory) {
  'use strict';
  // https://github.com/umdjs/umd/blob/master/returnExports.js
  if (typeof exports === 'object') {
    // Node
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(factory);
  } else {
    // Browser globals (root is window)
    root.SecondLevelDomains = factory(root);
  }
}(this, function (root) {
  'use strict';

  // save current SecondLevelDomains variable, if any
  var _SecondLevelDomains = root && root.SecondLevelDomains;

  var SLD = {
    // list of known Second Level Domains
    // converted list of SLDs from https://github.com/gavingmiller/second-level-domains
    // ----
    // publicsuffix.org is more current and actually used by a couple of browsers internally.
    // downside is it also contains domains like "dyndns.org" - which is fine for the security
    // issues browser have to deal with (SOP for cookies, etc) - but is way overboard for URI.js
    // ----
    list: {
      'ac':' com gov mil net org ',
      'ae':' ac co gov mil name net org pro sch ',
      'af':' com edu gov net org ',
      'al':' com edu gov mil net org ',
      'ao':' co ed gv it og pb ',
      'ar':' com edu gob gov int mil net org tur ',
      'at':' ac co gv or ',
      'au':' asn com csiro edu gov id net org ',
      'ba':' co com edu gov mil net org rs unbi unmo unsa untz unze ',
      'bb':' biz co com edu gov info net org store tv ',
      'bh':' biz cc com edu gov info net org ',
      'bn':' com edu gov net org ',
      'bo':' com edu gob gov int mil net org tv ',
      'br':' adm adv agr am arq art ato b bio blog bmd cim cng cnt com coop ecn edu eng esp etc eti far flog fm fnd fot fst g12 ggf gov imb ind inf jor jus lel mat med mil mus net nom not ntr odo org ppg pro psc psi qsl rec slg srv tmp trd tur tv vet vlog wiki zlg ',
      'bs':' com edu gov net org ',
      'bz':' du et om ov rg ',
      'ca':' ab bc mb nb nf nl ns nt nu on pe qc sk yk ',
      'ck':' biz co edu gen gov info net org ',
      'cn':' ac ah bj com cq edu fj gd gov gs gx gz ha hb he hi hl hn jl js jx ln mil net nm nx org qh sc sd sh sn sx tj tw xj xz yn zj ',
      'co':' com edu gov mil net nom org ',
      'cr':' ac c co ed fi go or sa ',
      'cy':' ac biz com ekloges gov ltd name net org parliament press pro tm ',
      'do':' art com edu gob gov mil net org sld web ',
      'dz':' art asso com edu gov net org pol ',
      'ec':' com edu fin gov info med mil net org pro ',
      'eg':' com edu eun gov mil name net org sci ',
      'er':' com edu gov ind mil net org rochest w ',
      'es':' com edu gob nom org ',
      'et':' biz com edu gov info name net org ',
      'fj':' ac biz com info mil name net org pro ',
      'fk':' ac co gov net nom org ',
      'fr':' asso com f gouv nom prd presse tm ',
      'gg':' co net org ',
      'gh':' com edu gov mil org ',
      'gn':' ac com gov net org ',
      'gr':' com edu gov mil net org ',
      'gt':' com edu gob ind mil net org ',
      'gu':' com edu gov net org ',
      'hk':' com edu gov idv net org ',
      'hu':' 2000 agrar bolt casino city co erotica erotika film forum games hotel info ingatlan jogasz konyvelo lakas media news org priv reklam sex shop sport suli szex tm tozsde utazas video ',
      'id':' ac co go mil net or sch web ',
      'il':' ac co gov idf k12 muni net org ',
      'in':' ac co edu ernet firm gen gov i ind mil net nic org res ',
      'iq':' com edu gov i mil net org ',
      'ir':' ac co dnssec gov i id net org sch ',
      'it':' edu gov ',
      'je':' co net org ',
      'jo':' com edu gov mil name net org sch ',
      'jp':' ac ad co ed go gr lg ne or ',
      'ke':' ac co go info me mobi ne or sc ',
      'kh':' com edu gov mil net org per ',
      'ki':' biz com de edu gov info mob net org tel ',
      'km':' asso com coop edu gouv k medecin mil nom notaires pharmaciens presse tm veterinaire ',
      'kn':' edu gov net org ',
      'kr':' ac busan chungbuk chungnam co daegu daejeon es gangwon go gwangju gyeongbuk gyeonggi gyeongnam hs incheon jeju jeonbuk jeonnam k kg mil ms ne or pe re sc seoul ulsan ',
      'kw':' com edu gov net org ',
      'ky':' com edu gov net org ',
      'kz':' com edu gov mil net org ',
      'lb':' com edu gov net org ',
      'lk':' assn com edu gov grp hotel int ltd net ngo org sch soc web ',
      'lr':' com edu gov net org ',
      'lv':' asn com conf edu gov id mil net org ',
      'ly':' com edu gov id med net org plc sch ',
      'ma':' ac co gov m net org press ',
      'mc':' asso tm ',
      'me':' ac co edu gov its net org priv ',
      'mg':' com edu gov mil nom org prd tm ',
      'mk':' com edu gov inf name net org pro ',
      'ml':' com edu gov net org presse ',
      'mn':' edu gov org ',
      'mo':' com edu gov net org ',
      'mt':' com edu gov net org ',
      'mv':' aero biz com coop edu gov info int mil museum name net org pro ',
      'mw':' ac co com coop edu gov int museum net org ',
      'mx':' com edu gob net org ',
      'my':' com edu gov mil name net org sch ',
      'nf':' arts com firm info net other per rec store web ',
      'ng':' biz com edu gov mil mobi name net org sch ',
      'ni':' ac co com edu gob mil net nom org ',
      'np':' com edu gov mil net org ',
      'nr':' biz com edu gov info net org ',
      'om':' ac biz co com edu gov med mil museum net org pro sch ',
      'pe':' com edu gob mil net nom org sld ',
      'ph':' com edu gov i mil net ngo org ',
      'pk':' biz com edu fam gob gok gon gop gos gov net org web ',
      'pl':' art bialystok biz com edu gda gdansk gorzow gov info katowice krakow lodz lublin mil net ngo olsztyn org poznan pwr radom slupsk szczecin torun warszawa waw wroc wroclaw zgora ',
      'pr':' ac biz com edu est gov info isla name net org pro prof ',
      'ps':' com edu gov net org plo sec ',
      'pw':' belau co ed go ne or ',
      'ro':' arts com firm info nom nt org rec store tm www ',
      'rs':' ac co edu gov in org ',
      'sb':' com edu gov net org ',
      'sc':' com edu gov net org ',
      'sh':' co com edu gov net nom org ',
      'sl':' com edu gov net org ',
      'st':' co com consulado edu embaixada gov mil net org principe saotome store ',
      'sv':' com edu gob org red ',
      'sz':' ac co org ',
      'tr':' av bbs bel biz com dr edu gen gov info k12 name net org pol tel tsk tv web ',
      'tt':' aero biz cat co com coop edu gov info int jobs mil mobi museum name net org pro tel travel ',
      'tw':' club com ebiz edu game gov idv mil net org ',
      'mu':' ac co com gov net or org ',
      'mz':' ac co edu gov org ',
      'na':' co com ',
      'nz':' ac co cri geek gen govt health iwi maori mil net org parliament school ',
      'pa':' abo ac com edu gob ing med net nom org sld ',
      'pt':' com edu gov int net nome org publ ',
      'py':' com edu gov mil net org ',
      'qa':' com edu gov mil net org ',
      're':' asso com nom ',
      'ru':' ac adygeya altai amur arkhangelsk astrakhan bashkiria belgorod bir bryansk buryatia cbg chel chelyabinsk chita chukotka chuvashia com dagestan e-burg edu gov grozny int irkutsk ivanovo izhevsk jar joshkar-ola kalmykia kaluga kamchatka karelia kazan kchr kemerovo khabarovsk khakassia khv kirov koenig komi kostroma kranoyarsk kuban kurgan kursk lipetsk magadan mari mari-el marine mil mordovia mosreg msk murmansk nalchik net nnov nov novosibirsk nsk omsk orenburg org oryol penza perm pp pskov ptz rnd ryazan sakhalin samara saratov simbirsk smolensk spb stavropol stv surgut tambov tatarstan tom tomsk tsaritsyn tsk tula tuva tver tyumen udm udmurtia ulan-ude vladikavkaz vladimir vladivostok volgograd vologda voronezh vrn vyatka yakutia yamal yekaterinburg yuzhno-sakhalinsk ',
      'rw':' ac co com edu gouv gov int mil net ',
      'sa':' com edu gov med net org pub sch ',
      'sd':' com edu gov info med net org tv ',
      'se':' a ac b bd c d e f g h i k l m n o org p parti pp press r s t tm u w x y z ',
      'sg':' com edu gov idn net org per ',
      'sn':' art com edu gouv org perso univ ',
      'sy':' com edu gov mil net news org ',
      'th':' ac co go in mi net or ',
      'tj':' ac biz co com edu go gov info int mil name net nic org test web ',
      'tn':' agrinet com defense edunet ens fin gov ind info intl mincom nat net org perso rnrt rns rnu tourism ',
      'tz':' ac co go ne or ',
      'ua':' biz cherkassy chernigov chernovtsy ck cn co com crimea cv dn dnepropetrovsk donetsk dp edu gov if in ivano-frankivsk kh kharkov kherson khmelnitskiy kiev kirovograd km kr ks kv lg lugansk lutsk lviv me mk net nikolaev od odessa org pl poltava pp rovno rv sebastopol sumy te ternopil uzhgorod vinnica vn zaporizhzhe zhitomir zp zt ',
      'ug':' ac co go ne or org sc ',
      'uk':' ac bl british-library co cym gov govt icnet jet lea ltd me mil mod national-library-scotland nel net nhs nic nls org orgn parliament plc police sch scot soc ',
      'us':' dni fed isa kids nsn ',
      'uy':' com edu gub mil net org ',
      've':' co com edu gob info mil net org web ',
      'vi':' co com k12 net org ',
      'vn':' ac biz com edu gov health info int name net org pro ',
      'ye':' co com gov ltd me net org plc ',
      'yu':' ac co edu gov org ',
      'za':' ac agric alt bourse city co cybernet db edu gov grondar iaccess imt inca landesign law mil net ngo nis nom olivetti org pix school tm web ',
      'zm':' ac co com edu gov net org sch '
    },
    // gorhill 2013-10-25: Using indexOf() instead Regexp(). Significant boost
    // in both performance and memory footprint. No initialization required.
    // http://jsperf.com/uri-js-sld-regex-vs-binary-search/4
    // Following methods use lastIndexOf() rather than array.split() in order
    // to avoid any memory allocations.
    has: function(domain) {
      var tldOffset = domain.lastIndexOf('.');
      if (tldOffset <= 0 || tldOffset >= (domain.length-1)) {
        return false;
      }
      var sldOffset = domain.lastIndexOf('.', tldOffset-1);
      if (sldOffset <= 0 || sldOffset >= (tldOffset-1)) {
        return false;
      }
      var sldList = SLD.list[domain.slice(tldOffset+1)];
      if (!sldList) {
        return false;
      }
      return sldList.indexOf(' ' + domain.slice(sldOffset+1, tldOffset) + ' ') >= 0;
    },
    is: function(domain) {
      var tldOffset = domain.lastIndexOf('.');
      if (tldOffset <= 0 || tldOffset >= (domain.length-1)) {
        return false;
      }
      var sldOffset = domain.lastIndexOf('.', tldOffset-1);
      if (sldOffset >= 0) {
        return false;
      }
      var sldList = SLD.list[domain.slice(tldOffset+1)];
      if (!sldList) {
        return false;
      }
      return sldList.indexOf(' ' + domain.slice(0, tldOffset) + ' ') >= 0;
    },
    get: function(domain) {
      var tldOffset = domain.lastIndexOf('.');
      if (tldOffset <= 0 || tldOffset >= (domain.length-1)) {
        return null;
      }
      var sldOffset = domain.lastIndexOf('.', tldOffset-1);
      if (sldOffset <= 0 || sldOffset >= (tldOffset-1)) {
        return null;
      }
      var sldList = SLD.list[domain.slice(tldOffset+1)];
      if (!sldList) {
        return null;
      }
      if (sldList.indexOf(' ' + domain.slice(sldOffset+1, tldOffset) + ' ') < 0) {
        return null;
      }
      return domain.slice(sldOffset+1);
    },
    noConflict: function(){
      if (root.SecondLevelDomains === this) {
        root.SecondLevelDomains = _SecondLevelDomains;
      }
      return this;
    }
  };

  return SLD;
}));

},{}],3:[function(require,module,exports){
/*!
 * URI.js - Mutating URLs
 *
 * Version: 1.17.1
 *
 * Author: Rodney Rehm
 * Web: http://medialize.github.io/URI.js/
 *
 * Licensed under
 *   MIT License http://www.opensource.org/licenses/mit-license
 *
 */
(function (root, factory) {
  'use strict';
  // https://github.com/umdjs/umd/blob/master/returnExports.js
  if (typeof exports === 'object') {
    // Node
    module.exports = factory(require('./punycode'), require('./IPv6'), require('./SecondLevelDomains'));
  } else if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['./punycode', './IPv6', './SecondLevelDomains'], factory);
  } else {
    // Browser globals (root is window)
    root.URI = factory(root.punycode, root.IPv6, root.SecondLevelDomains, root);
  }
}(this, function (punycode, IPv6, SLD, root) {
  'use strict';
  /*global location, escape, unescape */
  // FIXME: v2.0.0 renamce non-camelCase properties to uppercase
  /*jshint camelcase: false */

  // save current URI variable, if any
  var _URI = root && root.URI;

  function URI(url, base) {
    var _urlSupplied = arguments.length >= 1;
    var _baseSupplied = arguments.length >= 2;

    // Allow instantiation without the 'new' keyword
    if (!(this instanceof URI)) {
      if (_urlSupplied) {
        if (_baseSupplied) {
          return new URI(url, base);
        }

        return new URI(url);
      }

      return new URI();
    }

    if (url === undefined) {
      if (_urlSupplied) {
        throw new TypeError('undefined is not a valid argument for URI');
      }

      if (typeof location !== 'undefined') {
        url = location.href + '';
      } else {
        url = '';
      }
    }

    this.href(url);

    // resolve to base according to http://dvcs.w3.org/hg/url/raw-file/tip/Overview.html#constructor
    if (base !== undefined) {
      return this.absoluteTo(base);
    }

    return this;
  }

  URI.version = '1.17.1';

  var p = URI.prototype;
  var hasOwn = Object.prototype.hasOwnProperty;

  function escapeRegEx(string) {
    // https://github.com/medialize/URI.js/commit/85ac21783c11f8ccab06106dba9735a31a86924d#commitcomment-821963
    return string.replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
  }

  function getType(value) {
    // IE8 doesn't return [Object Undefined] but [Object Object] for undefined value
    if (value === undefined) {
      return 'Undefined';
    }

    return String(Object.prototype.toString.call(value)).slice(8, -1);
  }

  function isArray(obj) {
    return getType(obj) === 'Array';
  }

  function filterArrayValues(data, value) {
    var lookup = {};
    var i, length;

    if (getType(value) === 'RegExp') {
      lookup = null;
    } else if (isArray(value)) {
      for (i = 0, length = value.length; i < length; i++) {
        lookup[value[i]] = true;
      }
    } else {
      lookup[value] = true;
    }

    for (i = 0, length = data.length; i < length; i++) {
      /*jshint laxbreak: true */
      var _match = lookup && lookup[data[i]] !== undefined
        || !lookup && value.test(data[i]);
      /*jshint laxbreak: false */
      if (_match) {
        data.splice(i, 1);
        length--;
        i--;
      }
    }

    return data;
  }

  function arrayContains(list, value) {
    var i, length;

    // value may be string, number, array, regexp
    if (isArray(value)) {
      // Note: this can be optimized to O(n) (instead of current O(m * n))
      for (i = 0, length = value.length; i < length; i++) {
        if (!arrayContains(list, value[i])) {
          return false;
        }
      }

      return true;
    }

    var _type = getType(value);
    for (i = 0, length = list.length; i < length; i++) {
      if (_type === 'RegExp') {
        if (typeof list[i] === 'string' && list[i].match(value)) {
          return true;
        }
      } else if (list[i] === value) {
        return true;
      }
    }

    return false;
  }

  function arraysEqual(one, two) {
    if (!isArray(one) || !isArray(two)) {
      return false;
    }

    // arrays can't be equal if they have different amount of content
    if (one.length !== two.length) {
      return false;
    }

    one.sort();
    two.sort();

    for (var i = 0, l = one.length; i < l; i++) {
      if (one[i] !== two[i]) {
        return false;
      }
    }

    return true;
  }

  function trimSlashes(text) {
    var trim_expression = /^\/+|\/+$/g;
    return text.replace(trim_expression, '');
  }

  URI._parts = function() {
    return {
      protocol: null,
      username: null,
      password: null,
      hostname: null,
      urn: null,
      port: null,
      path: null,
      query: null,
      fragment: null,
      // state
      duplicateQueryParameters: URI.duplicateQueryParameters,
      escapeQuerySpace: URI.escapeQuerySpace
    };
  };
  // state: allow duplicate query parameters (a=1&a=1)
  URI.duplicateQueryParameters = false;
  // state: replaces + with %20 (space in query strings)
  URI.escapeQuerySpace = true;
  // static properties
  URI.protocol_expression = /^[a-z][a-z0-9.+-]*$/i;
  URI.idn_expression = /[^a-z0-9\.-]/i;
  URI.punycode_expression = /(xn--)/i;
  // well, 333.444.555.666 matches, but it sure ain't no IPv4 - do we care?
  URI.ip4_expression = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
  // credits to Rich Brown
  // source: http://forums.intermapper.com/viewtopic.php?p=1096#1096
  // specification: http://www.ietf.org/rfc/rfc4291.txt
  URI.ip6_expression = /^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/;
  // expression used is "gruber revised" (@gruber v2) determined to be the
  // best solution in a regex-golf we did a couple of ages ago at
  // * http://mathiasbynens.be/demo/url-regex
  // * http://rodneyrehm.de/t/url-regex.html
  URI.find_uri_expression = /\b((?:[a-z][\w-]+:(?:\/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/ig;
  URI.findUri = {
    // valid "scheme://" or "www."
    start: /\b(?:([a-z][a-z0-9.+-]*:\/\/)|www\.)/gi,
    // everything up to the next whitespace
    end: /[\s\r\n]|$/,
    // trim trailing punctuation captured by end RegExp
    trim: /[`!()\[\]{};:'".,<>?«»“”„‘’]+$/
  };
  // http://www.iana.org/assignments/uri-schemes.html
  // http://en.wikipedia.org/wiki/List_of_TCP_and_UDP_port_numbers#Well-known_ports
  URI.defaultPorts = {
    http: '80',
    https: '443',
    ftp: '21',
    gopher: '70',
    ws: '80',
    wss: '443'
  };
  // allowed hostname characters according to RFC 3986
  // ALPHA DIGIT "-" "." "_" "~" "!" "$" "&" "'" "(" ")" "*" "+" "," ";" "=" %encoded
  // I've never seen a (non-IDN) hostname other than: ALPHA DIGIT . -
  URI.invalid_hostname_characters = /[^a-zA-Z0-9\.-]/;
  // map DOM Elements to their URI attribute
  URI.domAttributes = {
    'a': 'href',
    'blockquote': 'cite',
    'link': 'href',
    'base': 'href',
    'script': 'src',
    'form': 'action',
    'img': 'src',
    'area': 'href',
    'iframe': 'src',
    'embed': 'src',
    'source': 'src',
    'track': 'src',
    'input': 'src', // but only if type="image"
    'audio': 'src',
    'video': 'src'
  };
  URI.getDomAttribute = function(node) {
    if (!node || !node.nodeName) {
      return undefined;
    }

    var nodeName = node.nodeName.toLowerCase();
    // <input> should only expose src for type="image"
    if (nodeName === 'input' && node.type !== 'image') {
      return undefined;
    }

    return URI.domAttributes[nodeName];
  };

  function escapeForDumbFirefox36(value) {
    // https://github.com/medialize/URI.js/issues/91
    return escape(value);
  }

  // encoding / decoding according to RFC3986
  function strictEncodeURIComponent(string) {
    // see https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/encodeURIComponent
    return encodeURIComponent(string)
      .replace(/[!'()*]/g, escapeForDumbFirefox36)
      .replace(/\*/g, '%2A');
  }
  URI.encode = strictEncodeURIComponent;
  URI.decode = decodeURIComponent;
  URI.iso8859 = function() {
    URI.encode = escape;
    URI.decode = unescape;
  };
  URI.unicode = function() {
    URI.encode = strictEncodeURIComponent;
    URI.decode = decodeURIComponent;
  };
  URI.characters = {
    pathname: {
      encode: {
        // RFC3986 2.1: For consistency, URI producers and normalizers should
        // use uppercase hexadecimal digits for all percent-encodings.
        expression: /%(24|26|2B|2C|3B|3D|3A|40)/ig,
        map: {
          // -._~!'()*
          '%24': '$',
          '%26': '&',
          '%2B': '+',
          '%2C': ',',
          '%3B': ';',
          '%3D': '=',
          '%3A': ':',
          '%40': '@'
        }
      },
      decode: {
        expression: /[\/\?#]/g,
        map: {
          '/': '%2F',
          '?': '%3F',
          '#': '%23'
        }
      }
    },
    reserved: {
      encode: {
        // RFC3986 2.1: For consistency, URI producers and normalizers should
        // use uppercase hexadecimal digits for all percent-encodings.
        expression: /%(21|23|24|26|27|28|29|2A|2B|2C|2F|3A|3B|3D|3F|40|5B|5D)/ig,
        map: {
          // gen-delims
          '%3A': ':',
          '%2F': '/',
          '%3F': '?',
          '%23': '#',
          '%5B': '[',
          '%5D': ']',
          '%40': '@',
          // sub-delims
          '%21': '!',
          '%24': '$',
          '%26': '&',
          '%27': '\'',
          '%28': '(',
          '%29': ')',
          '%2A': '*',
          '%2B': '+',
          '%2C': ',',
          '%3B': ';',
          '%3D': '='
        }
      }
    },
    urnpath: {
      // The characters under `encode` are the characters called out by RFC 2141 as being acceptable
      // for usage in a URN. RFC2141 also calls out "-", ".", and "_" as acceptable characters, but
      // these aren't encoded by encodeURIComponent, so we don't have to call them out here. Also
      // note that the colon character is not featured in the encoding map; this is because URI.js
      // gives the colons in URNs semantic meaning as the delimiters of path segements, and so it
      // should not appear unencoded in a segment itself.
      // See also the note above about RFC3986 and capitalalized hex digits.
      encode: {
        expression: /%(21|24|27|28|29|2A|2B|2C|3B|3D|40)/ig,
        map: {
          '%21': '!',
          '%24': '$',
          '%27': '\'',
          '%28': '(',
          '%29': ')',
          '%2A': '*',
          '%2B': '+',
          '%2C': ',',
          '%3B': ';',
          '%3D': '=',
          '%40': '@'
        }
      },
      // These characters are the characters called out by RFC2141 as "reserved" characters that
      // should never appear in a URN, plus the colon character (see note above).
      decode: {
        expression: /[\/\?#:]/g,
        map: {
          '/': '%2F',
          '?': '%3F',
          '#': '%23',
          ':': '%3A'
        }
      }
    }
  };
  URI.encodeQuery = function(string, escapeQuerySpace) {
    var escaped = URI.encode(string + '');
    if (escapeQuerySpace === undefined) {
      escapeQuerySpace = URI.escapeQuerySpace;
    }

    return escapeQuerySpace ? escaped.replace(/%20/g, '+') : escaped;
  };
  URI.decodeQuery = function(string, escapeQuerySpace) {
    string += '';
    if (escapeQuerySpace === undefined) {
      escapeQuerySpace = URI.escapeQuerySpace;
    }

    try {
      return URI.decode(escapeQuerySpace ? string.replace(/\+/g, '%20') : string);
    } catch(e) {
      // we're not going to mess with weird encodings,
      // give up and return the undecoded original string
      // see https://github.com/medialize/URI.js/issues/87
      // see https://github.com/medialize/URI.js/issues/92
      return string;
    }
  };
  // generate encode/decode path functions
  var _parts = {'encode':'encode', 'decode':'decode'};
  var _part;
  var generateAccessor = function(_group, _part) {
    return function(string) {
      try {
        return URI[_part](string + '').replace(URI.characters[_group][_part].expression, function(c) {
          return URI.characters[_group][_part].map[c];
        });
      } catch (e) {
        // we're not going to mess with weird encodings,
        // give up and return the undecoded original string
        // see https://github.com/medialize/URI.js/issues/87
        // see https://github.com/medialize/URI.js/issues/92
        return string;
      }
    };
  };

  for (_part in _parts) {
    URI[_part + 'PathSegment'] = generateAccessor('pathname', _parts[_part]);
    URI[_part + 'UrnPathSegment'] = generateAccessor('urnpath', _parts[_part]);
  }

  var generateSegmentedPathFunction = function(_sep, _codingFuncName, _innerCodingFuncName) {
    return function(string) {
      // Why pass in names of functions, rather than the function objects themselves? The
      // definitions of some functions (but in particular, URI.decode) will occasionally change due
      // to URI.js having ISO8859 and Unicode modes. Passing in the name and getting it will ensure
      // that the functions we use here are "fresh".
      var actualCodingFunc;
      if (!_innerCodingFuncName) {
        actualCodingFunc = URI[_codingFuncName];
      } else {
        actualCodingFunc = function(string) {
          return URI[_codingFuncName](URI[_innerCodingFuncName](string));
        };
      }

      var segments = (string + '').split(_sep);

      for (var i = 0, length = segments.length; i < length; i++) {
        segments[i] = actualCodingFunc(segments[i]);
      }

      return segments.join(_sep);
    };
  };

  // This takes place outside the above loop because we don't want, e.g., encodeUrnPath functions.
  URI.decodePath = generateSegmentedPathFunction('/', 'decodePathSegment');
  URI.decodeUrnPath = generateSegmentedPathFunction(':', 'decodeUrnPathSegment');
  URI.recodePath = generateSegmentedPathFunction('/', 'encodePathSegment', 'decode');
  URI.recodeUrnPath = generateSegmentedPathFunction(':', 'encodeUrnPathSegment', 'decode');

  URI.encodeReserved = generateAccessor('reserved', 'encode');

  URI.parse = function(string, parts) {
    var pos;
    if (!parts) {
      parts = {};
    }
    // [protocol"://"[username[":"password]"@"]hostname[":"port]"/"?][path]["?"querystring]["#"fragment]

    // extract fragment
    pos = string.indexOf('#');
    if (pos > -1) {
      // escaping?
      parts.fragment = string.substring(pos + 1) || null;
      string = string.substring(0, pos);
    }

    // extract query
    pos = string.indexOf('?');
    if (pos > -1) {
      // escaping?
      parts.query = string.substring(pos + 1) || null;
      string = string.substring(0, pos);
    }

    // extract protocol
    if (string.substring(0, 2) === '//') {
      // relative-scheme
      parts.protocol = null;
      string = string.substring(2);
      // extract "user:pass@host:port"
      string = URI.parseAuthority(string, parts);
    } else {
      pos = string.indexOf(':');
      if (pos > -1) {
        parts.protocol = string.substring(0, pos) || null;
        if (parts.protocol && !parts.protocol.match(URI.protocol_expression)) {
          // : may be within the path
          parts.protocol = undefined;
        } else if (string.substring(pos + 1, pos + 3) === '//') {
          string = string.substring(pos + 3);

          // extract "user:pass@host:port"
          string = URI.parseAuthority(string, parts);
        } else {
          string = string.substring(pos + 1);
          parts.urn = true;
        }
      }
    }

    // what's left must be the path
    parts.path = string;

    // and we're done
    return parts;
  };
  URI.parseHost = function(string, parts) {
    // Copy chrome, IE, opera backslash-handling behavior.
    // Back slashes before the query string get converted to forward slashes
    // See: https://github.com/joyent/node/blob/386fd24f49b0e9d1a8a076592a404168faeecc34/lib/url.js#L115-L124
    // See: https://code.google.com/p/chromium/issues/detail?id=25916
    // https://github.com/medialize/URI.js/pull/233
    string = string.replace(/\\/g, '/');

    // extract host:port
    var pos = string.indexOf('/');
    var bracketPos;
    var t;

    if (pos === -1) {
      pos = string.length;
    }

    if (string.charAt(0) === '[') {
      // IPv6 host - http://tools.ietf.org/html/draft-ietf-6man-text-addr-representation-04#section-6
      // I claim most client software breaks on IPv6 anyways. To simplify things, URI only accepts
      // IPv6+port in the format [2001:db8::1]:80 (for the time being)
      bracketPos = string.indexOf(']');
      parts.hostname = string.substring(1, bracketPos) || null;
      parts.port = string.substring(bracketPos + 2, pos) || null;
      if (parts.port === '/') {
        parts.port = null;
      }
    } else {
      var firstColon = string.indexOf(':');
      var firstSlash = string.indexOf('/');
      var nextColon = string.indexOf(':', firstColon + 1);
      if (nextColon !== -1 && (firstSlash === -1 || nextColon < firstSlash)) {
        // IPv6 host contains multiple colons - but no port
        // this notation is actually not allowed by RFC 3986, but we're a liberal parser
        parts.hostname = string.substring(0, pos) || null;
        parts.port = null;
      } else {
        t = string.substring(0, pos).split(':');
        parts.hostname = t[0] || null;
        parts.port = t[1] || null;
      }
    }

    if (parts.hostname && string.substring(pos).charAt(0) !== '/') {
      pos++;
      string = '/' + string;
    }

    return string.substring(pos) || '/';
  };
  URI.parseAuthority = function(string, parts) {
    string = URI.parseUserinfo(string, parts);
    return URI.parseHost(string, parts);
  };
  URI.parseUserinfo = function(string, parts) {
    // extract username:password
    var firstSlash = string.indexOf('/');
    var pos = string.lastIndexOf('@', firstSlash > -1 ? firstSlash : string.length - 1);
    var t;

    // authority@ must come before /path
    if (pos > -1 && (firstSlash === -1 || pos < firstSlash)) {
      t = string.substring(0, pos).split(':');
      parts.username = t[0] ? URI.decode(t[0]) : null;
      t.shift();
      parts.password = t[0] ? URI.decode(t.join(':')) : null;
      string = string.substring(pos + 1);
    } else {
      parts.username = null;
      parts.password = null;
    }

    return string;
  };
  URI.parseQuery = function(string, escapeQuerySpace) {
    if (!string) {
      return {};
    }

    // throw out the funky business - "?"[name"="value"&"]+
    string = string.replace(/&+/g, '&').replace(/^\?*&*|&+$/g, '');

    if (!string) {
      return {};
    }

    var items = {};
    var splits = string.split('&');
    var length = splits.length;
    var v, name, value;

    for (var i = 0; i < length; i++) {
      v = splits[i].split('=');
      name = URI.decodeQuery(v.shift(), escapeQuerySpace);
      // no "=" is null according to http://dvcs.w3.org/hg/url/raw-file/tip/Overview.html#collect-url-parameters
      value = v.length ? URI.decodeQuery(v.join('='), escapeQuerySpace) : null;

      if (hasOwn.call(items, name)) {
        if (typeof items[name] === 'string' || items[name] === null) {
          items[name] = [items[name]];
        }

        items[name].push(value);
      } else {
        items[name] = value;
      }
    }

    return items;
  };

  URI.build = function(parts) {
    var t = '';

    if (parts.protocol) {
      t += parts.protocol + ':';
    }

    if (!parts.urn && (t || parts.hostname)) {
      t += '//';
    }

    t += (URI.buildAuthority(parts) || '');

    if (typeof parts.path === 'string') {
      if (parts.path.charAt(0) !== '/' && typeof parts.hostname === 'string') {
        t += '/';
      }

      t += parts.path;
    }

    if (typeof parts.query === 'string' && parts.query) {
      t += '?' + parts.query;
    }

    if (typeof parts.fragment === 'string' && parts.fragment) {
      t += '#' + parts.fragment;
    }
    return t;
  };
  URI.buildHost = function(parts) {
    var t = '';

    if (!parts.hostname) {
      return '';
    } else if (URI.ip6_expression.test(parts.hostname)) {
      t += '[' + parts.hostname + ']';
    } else {
      t += parts.hostname;
    }

    if (parts.port) {
      t += ':' + parts.port;
    }

    return t;
  };
  URI.buildAuthority = function(parts) {
    return URI.buildUserinfo(parts) + URI.buildHost(parts);
  };
  URI.buildUserinfo = function(parts) {
    var t = '';

    if (parts.username) {
      t += URI.encode(parts.username);

      if (parts.password) {
        t += ':' + URI.encode(parts.password);
      }

      t += '@';
    }

    return t;
  };
  URI.buildQuery = function(data, duplicateQueryParameters, escapeQuerySpace) {
    // according to http://tools.ietf.org/html/rfc3986 or http://labs.apache.org/webarch/uri/rfc/rfc3986.html
    // being »-._~!$&'()*+,;=:@/?« %HEX and alnum are allowed
    // the RFC explicitly states ?/foo being a valid use case, no mention of parameter syntax!
    // URI.js treats the query string as being application/x-www-form-urlencoded
    // see http://www.w3.org/TR/REC-html40/interact/forms.html#form-content-type

    var t = '';
    var unique, key, i, length;
    for (key in data) {
      if (hasOwn.call(data, key) && key) {
        if (isArray(data[key])) {
          unique = {};
          for (i = 0, length = data[key].length; i < length; i++) {
            if (data[key][i] !== undefined && unique[data[key][i] + ''] === undefined) {
              t += '&' + URI.buildQueryParameter(key, data[key][i], escapeQuerySpace);
              if (duplicateQueryParameters !== true) {
                unique[data[key][i] + ''] = true;
              }
            }
          }
        } else if (data[key] !== undefined) {
          t += '&' + URI.buildQueryParameter(key, data[key], escapeQuerySpace);
        }
      }
    }

    return t.substring(1);
  };
  URI.buildQueryParameter = function(name, value, escapeQuerySpace) {
    // http://www.w3.org/TR/REC-html40/interact/forms.html#form-content-type -- application/x-www-form-urlencoded
    // don't append "=" for null values, according to http://dvcs.w3.org/hg/url/raw-file/tip/Overview.html#url-parameter-serialization
    return URI.encodeQuery(name, escapeQuerySpace) + (value !== null ? '=' + URI.encodeQuery(value, escapeQuerySpace) : '');
  };

  URI.addQuery = function(data, name, value) {
    if (typeof name === 'object') {
      for (var key in name) {
        if (hasOwn.call(name, key)) {
          URI.addQuery(data, key, name[key]);
        }
      }
    } else if (typeof name === 'string') {
      if (data[name] === undefined) {
        data[name] = value;
        return;
      } else if (typeof data[name] === 'string') {
        data[name] = [data[name]];
      }

      if (!isArray(value)) {
        value = [value];
      }

      data[name] = (data[name] || []).concat(value);
    } else {
      throw new TypeError('URI.addQuery() accepts an object, string as the name parameter');
    }
  };
  URI.removeQuery = function(data, name, value) {
    var i, length, key;

    if (isArray(name)) {
      for (i = 0, length = name.length; i < length; i++) {
        data[name[i]] = undefined;
      }
    } else if (getType(name) === 'RegExp') {
      for (key in data) {
        if (name.test(key)) {
          data[key] = undefined;
        }
      }
    } else if (typeof name === 'object') {
      for (key in name) {
        if (hasOwn.call(name, key)) {
          URI.removeQuery(data, key, name[key]);
        }
      }
    } else if (typeof name === 'string') {
      if (value !== undefined) {
        if (getType(value) === 'RegExp') {
          if (!isArray(data[name]) && value.test(data[name])) {
            data[name] = undefined;
          } else {
            data[name] = filterArrayValues(data[name], value);
          }
        } else if (data[name] === String(value) && (!isArray(value) || value.length === 1)) {
          data[name] = undefined;
        } else if (isArray(data[name])) {
          data[name] = filterArrayValues(data[name], value);
        }
      } else {
        data[name] = undefined;
      }
    } else {
      throw new TypeError('URI.removeQuery() accepts an object, string, RegExp as the first parameter');
    }
  };
  URI.hasQuery = function(data, name, value, withinArray) {
    switch (getType(name)) {
      case 'String':
        // Nothing to do here
        break;

      case 'RegExp':
        for (var key in data) {
          if (hasOwn.call(data, key)) {
            if (name.test(key) && (value === undefined || URI.hasQuery(data, key, value))) {
              return true;
            }
          }
        }

        return false;

      case 'Object':
        for (var _key in name) {
          if (hasOwn.call(name, _key)) {
            if (!URI.hasQuery(data, _key, name[_key])) {
              return false;
            }
          }
        }

        return true;

      default:
        throw new TypeError('URI.hasQuery() accepts a string, regular expression or object as the name parameter');
    }

    switch (getType(value)) {
      case 'Undefined':
        // true if exists (but may be empty)
        return name in data; // data[name] !== undefined;

      case 'Boolean':
        // true if exists and non-empty
        var _booly = Boolean(isArray(data[name]) ? data[name].length : data[name]);
        return value === _booly;

      case 'Function':
        // allow complex comparison
        return !!value(data[name], name, data);

      case 'Array':
        if (!isArray(data[name])) {
          return false;
        }

        var op = withinArray ? arrayContains : arraysEqual;
        return op(data[name], value);

      case 'RegExp':
        if (!isArray(data[name])) {
          return Boolean(data[name] && data[name].match(value));
        }

        if (!withinArray) {
          return false;
        }

        return arrayContains(data[name], value);

      case 'Number':
        value = String(value);
        /* falls through */
      case 'String':
        if (!isArray(data[name])) {
          return data[name] === value;
        }

        if (!withinArray) {
          return false;
        }

        return arrayContains(data[name], value);

      default:
        throw new TypeError('URI.hasQuery() accepts undefined, boolean, string, number, RegExp, Function as the value parameter');
    }
  };


  URI.commonPath = function(one, two) {
    var length = Math.min(one.length, two.length);
    var pos;

    // find first non-matching character
    for (pos = 0; pos < length; pos++) {
      if (one.charAt(pos) !== two.charAt(pos)) {
        pos--;
        break;
      }
    }

    if (pos < 1) {
      return one.charAt(0) === two.charAt(0) && one.charAt(0) === '/' ? '/' : '';
    }

    // revert to last /
    if (one.charAt(pos) !== '/' || two.charAt(pos) !== '/') {
      pos = one.substring(0, pos).lastIndexOf('/');
    }

    return one.substring(0, pos + 1);
  };

  URI.withinString = function(string, callback, options) {
    options || (options = {});
    var _start = options.start || URI.findUri.start;
    var _end = options.end || URI.findUri.end;
    var _trim = options.trim || URI.findUri.trim;
    var _attributeOpen = /[a-z0-9-]=["']?$/i;

    _start.lastIndex = 0;
    while (true) {
      var match = _start.exec(string);
      if (!match) {
        break;
      }

      var start = match.index;
      if (options.ignoreHtml) {
        // attribut(e=["']?$)
        var attributeOpen = string.slice(Math.max(start - 3, 0), start);
        if (attributeOpen && _attributeOpen.test(attributeOpen)) {
          continue;
        }
      }

      var end = start + string.slice(start).search(_end);
      var slice = string.slice(start, end).replace(_trim, '');
      if (options.ignore && options.ignore.test(slice)) {
        continue;
      }

      end = start + slice.length;
      var result = callback(slice, start, end, string);
      string = string.slice(0, start) + result + string.slice(end);
      _start.lastIndex = start + result.length;
    }

    _start.lastIndex = 0;
    return string;
  };

  URI.ensureValidHostname = function(v) {
    // Theoretically URIs allow percent-encoding in Hostnames (according to RFC 3986)
    // they are not part of DNS and therefore ignored by URI.js

    if (v.match(URI.invalid_hostname_characters)) {
      // test punycode
      if (!punycode) {
        throw new TypeError('Hostname "' + v + '" contains characters other than [A-Z0-9.-] and Punycode.js is not available');
      }

      if (punycode.toASCII(v).match(URI.invalid_hostname_characters)) {
        throw new TypeError('Hostname "' + v + '" contains characters other than [A-Z0-9.-]');
      }
    }
  };

  // noConflict
  URI.noConflict = function(removeAll) {
    if (removeAll) {
      var unconflicted = {
        URI: this.noConflict()
      };

      if (root.URITemplate && typeof root.URITemplate.noConflict === 'function') {
        unconflicted.URITemplate = root.URITemplate.noConflict();
      }

      if (root.IPv6 && typeof root.IPv6.noConflict === 'function') {
        unconflicted.IPv6 = root.IPv6.noConflict();
      }

      if (root.SecondLevelDomains && typeof root.SecondLevelDomains.noConflict === 'function') {
        unconflicted.SecondLevelDomains = root.SecondLevelDomains.noConflict();
      }

      return unconflicted;
    } else if (root.URI === this) {
      root.URI = _URI;
    }

    return this;
  };

  p.build = function(deferBuild) {
    if (deferBuild === true) {
      this._deferred_build = true;
    } else if (deferBuild === undefined || this._deferred_build) {
      this._string = URI.build(this._parts);
      this._deferred_build = false;
    }

    return this;
  };

  p.clone = function() {
    return new URI(this);
  };

  p.valueOf = p.toString = function() {
    return this.build(false)._string;
  };


  function generateSimpleAccessor(_part){
    return function(v, build) {
      if (v === undefined) {
        return this._parts[_part] || '';
      } else {
        this._parts[_part] = v || null;
        this.build(!build);
        return this;
      }
    };
  }

  function generatePrefixAccessor(_part, _key){
    return function(v, build) {
      if (v === undefined) {
        return this._parts[_part] || '';
      } else {
        if (v !== null) {
          v = v + '';
          if (v.charAt(0) === _key) {
            v = v.substring(1);
          }
        }

        this._parts[_part] = v;
        this.build(!build);
        return this;
      }
    };
  }

  p.protocol = generateSimpleAccessor('protocol');
  p.username = generateSimpleAccessor('username');
  p.password = generateSimpleAccessor('password');
  p.hostname = generateSimpleAccessor('hostname');
  p.port = generateSimpleAccessor('port');
  p.query = generatePrefixAccessor('query', '?');
  p.fragment = generatePrefixAccessor('fragment', '#');

  p.search = function(v, build) {
    var t = this.query(v, build);
    return typeof t === 'string' && t.length ? ('?' + t) : t;
  };
  p.hash = function(v, build) {
    var t = this.fragment(v, build);
    return typeof t === 'string' && t.length ? ('#' + t) : t;
  };

  p.pathname = function(v, build) {
    if (v === undefined || v === true) {
      var res = this._parts.path || (this._parts.hostname ? '/' : '');
      return v ? (this._parts.urn ? URI.decodeUrnPath : URI.decodePath)(res) : res;
    } else {
      if (this._parts.urn) {
        this._parts.path = v ? URI.recodeUrnPath(v) : '';
      } else {
        this._parts.path = v ? URI.recodePath(v) : '/';
      }
      this.build(!build);
      return this;
    }
  };
  p.path = p.pathname;
  p.href = function(href, build) {
    var key;

    if (href === undefined) {
      return this.toString();
    }

    this._string = '';
    this._parts = URI._parts();

    var _URI = href instanceof URI;
    var _object = typeof href === 'object' && (href.hostname || href.path || href.pathname);
    if (href.nodeName) {
      var attribute = URI.getDomAttribute(href);
      href = href[attribute] || '';
      _object = false;
    }

    // window.location is reported to be an object, but it's not the sort
    // of object we're looking for:
    // * location.protocol ends with a colon
    // * location.query != object.search
    // * location.hash != object.fragment
    // simply serializing the unknown object should do the trick
    // (for location, not for everything...)
    if (!_URI && _object && href.pathname !== undefined) {
      href = href.toString();
    }

    if (typeof href === 'string' || href instanceof String) {
      this._parts = URI.parse(String(href), this._parts);
    } else if (_URI || _object) {
      var src = _URI ? href._parts : href;
      for (key in src) {
        if (hasOwn.call(this._parts, key)) {
          this._parts[key] = src[key];
        }
      }
    } else {
      throw new TypeError('invalid input');
    }

    this.build(!build);
    return this;
  };

  // identification accessors
  p.is = function(what) {
    var ip = false;
    var ip4 = false;
    var ip6 = false;
    var name = false;
    var sld = false;
    var idn = false;
    var punycode = false;
    var relative = !this._parts.urn;

    if (this._parts.hostname) {
      relative = false;
      ip4 = URI.ip4_expression.test(this._parts.hostname);
      ip6 = URI.ip6_expression.test(this._parts.hostname);
      ip = ip4 || ip6;
      name = !ip;
      sld = name && SLD && SLD.has(this._parts.hostname);
      idn = name && URI.idn_expression.test(this._parts.hostname);
      punycode = name && URI.punycode_expression.test(this._parts.hostname);
    }

    switch (what.toLowerCase()) {
      case 'relative':
        return relative;

      case 'absolute':
        return !relative;

      // hostname identification
      case 'domain':
      case 'name':
        return name;

      case 'sld':
        return sld;

      case 'ip':
        return ip;

      case 'ip4':
      case 'ipv4':
      case 'inet4':
        return ip4;

      case 'ip6':
      case 'ipv6':
      case 'inet6':
        return ip6;

      case 'idn':
        return idn;

      case 'url':
        return !this._parts.urn;

      case 'urn':
        return !!this._parts.urn;

      case 'punycode':
        return punycode;
    }

    return null;
  };

  // component specific input validation
  var _protocol = p.protocol;
  var _port = p.port;
  var _hostname = p.hostname;

  p.protocol = function(v, build) {
    if (v !== undefined) {
      if (v) {
        // accept trailing ://
        v = v.replace(/:(\/\/)?$/, '');

        if (!v.match(URI.protocol_expression)) {
          throw new TypeError('Protocol "' + v + '" contains characters other than [A-Z0-9.+-] or doesn\'t start with [A-Z]');
        }
      }
    }
    return _protocol.call(this, v, build);
  };
  p.scheme = p.protocol;
  p.port = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v !== undefined) {
      if (v === 0) {
        v = null;
      }

      if (v) {
        v += '';
        if (v.charAt(0) === ':') {
          v = v.substring(1);
        }

        if (v.match(/[^0-9]/)) {
          throw new TypeError('Port "' + v + '" contains characters other than [0-9]');
        }
      }
    }
    return _port.call(this, v, build);
  };
  p.hostname = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v !== undefined) {
      var x = {};
      var res = URI.parseHost(v, x);
      if (res !== '/') {
        throw new TypeError('Hostname "' + v + '" contains characters other than [A-Z0-9.-]');
      }

      v = x.hostname;
    }
    return _hostname.call(this, v, build);
  };

  // compound accessors
  p.origin = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined) {
      var protocol = this.protocol();
      var authority = this.authority();
      if (!authority) {
        return '';
      }

      return (protocol ? protocol + '://' : '') + this.authority();
    } else {
      var origin = URI(v);
      this
        .protocol(origin.protocol())
        .authority(origin.authority())
        .build(!build);
      return this;
    }
  };
  p.host = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined) {
      return this._parts.hostname ? URI.buildHost(this._parts) : '';
    } else {
      var res = URI.parseHost(v, this._parts);
      if (res !== '/') {
        throw new TypeError('Hostname "' + v + '" contains characters other than [A-Z0-9.-]');
      }

      this.build(!build);
      return this;
    }
  };
  p.authority = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined) {
      return this._parts.hostname ? URI.buildAuthority(this._parts) : '';
    } else {
      var res = URI.parseAuthority(v, this._parts);
      if (res !== '/') {
        throw new TypeError('Hostname "' + v + '" contains characters other than [A-Z0-9.-]');
      }

      this.build(!build);
      return this;
    }
  };
  p.userinfo = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined) {
      if (!this._parts.username) {
        return '';
      }

      var t = URI.buildUserinfo(this._parts);
      return t.substring(0, t.length -1);
    } else {
      if (v[v.length-1] !== '@') {
        v += '@';
      }

      URI.parseUserinfo(v, this._parts);
      this.build(!build);
      return this;
    }
  };
  p.resource = function(v, build) {
    var parts;

    if (v === undefined) {
      return this.path() + this.search() + this.hash();
    }

    parts = URI.parse(v);
    this._parts.path = parts.path;
    this._parts.query = parts.query;
    this._parts.fragment = parts.fragment;
    this.build(!build);
    return this;
  };

  // fraction accessors
  p.subdomain = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    // convenience, return "www" from "www.example.org"
    if (v === undefined) {
      if (!this._parts.hostname || this.is('IP')) {
        return '';
      }

      // grab domain and add another segment
      var end = this._parts.hostname.length - this.domain().length - 1;
      return this._parts.hostname.substring(0, end) || '';
    } else {
      var e = this._parts.hostname.length - this.domain().length;
      var sub = this._parts.hostname.substring(0, e);
      var replace = new RegExp('^' + escapeRegEx(sub));

      if (v && v.charAt(v.length - 1) !== '.') {
        v += '.';
      }

      if (v) {
        URI.ensureValidHostname(v);
      }

      this._parts.hostname = this._parts.hostname.replace(replace, v);
      this.build(!build);
      return this;
    }
  };
  p.domain = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (typeof v === 'boolean') {
      build = v;
      v = undefined;
    }

    // convenience, return "example.org" from "www.example.org"
    if (v === undefined) {
      if (!this._parts.hostname || this.is('IP')) {
        return '';
      }

      // if hostname consists of 1 or 2 segments, it must be the domain
      var t = this._parts.hostname.match(/\./g);
      if (t && t.length < 2) {
        return this._parts.hostname;
      }

      // grab tld and add another segment
      var end = this._parts.hostname.length - this.tld(build).length - 1;
      end = this._parts.hostname.lastIndexOf('.', end -1) + 1;
      return this._parts.hostname.substring(end) || '';
    } else {
      if (!v) {
        throw new TypeError('cannot set domain empty');
      }

      URI.ensureValidHostname(v);

      if (!this._parts.hostname || this.is('IP')) {
        this._parts.hostname = v;
      } else {
        var replace = new RegExp(escapeRegEx(this.domain()) + '$');
        this._parts.hostname = this._parts.hostname.replace(replace, v);
      }

      this.build(!build);
      return this;
    }
  };
  p.tld = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (typeof v === 'boolean') {
      build = v;
      v = undefined;
    }

    // return "org" from "www.example.org"
    if (v === undefined) {
      if (!this._parts.hostname || this.is('IP')) {
        return '';
      }

      var pos = this._parts.hostname.lastIndexOf('.');
      var tld = this._parts.hostname.substring(pos + 1);

      if (build !== true && SLD && SLD.list[tld.toLowerCase()]) {
        return SLD.get(this._parts.hostname) || tld;
      }

      return tld;
    } else {
      var replace;

      if (!v) {
        throw new TypeError('cannot set TLD empty');
      } else if (v.match(/[^a-zA-Z0-9-]/)) {
        if (SLD && SLD.is(v)) {
          replace = new RegExp(escapeRegEx(this.tld()) + '$');
          this._parts.hostname = this._parts.hostname.replace(replace, v);
        } else {
          throw new TypeError('TLD "' + v + '" contains characters other than [A-Z0-9]');
        }
      } else if (!this._parts.hostname || this.is('IP')) {
        throw new ReferenceError('cannot set TLD on non-domain host');
      } else {
        replace = new RegExp(escapeRegEx(this.tld()) + '$');
        this._parts.hostname = this._parts.hostname.replace(replace, v);
      }

      this.build(!build);
      return this;
    }
  };
  p.directory = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined || v === true) {
      if (!this._parts.path && !this._parts.hostname) {
        return '';
      }

      if (this._parts.path === '/') {
        return '/';
      }

      var end = this._parts.path.length - this.filename().length - 1;
      var res = this._parts.path.substring(0, end) || (this._parts.hostname ? '/' : '');

      return v ? URI.decodePath(res) : res;

    } else {
      var e = this._parts.path.length - this.filename().length;
      var directory = this._parts.path.substring(0, e);
      var replace = new RegExp('^' + escapeRegEx(directory));

      // fully qualifier directories begin with a slash
      if (!this.is('relative')) {
        if (!v) {
          v = '/';
        }

        if (v.charAt(0) !== '/') {
          v = '/' + v;
        }
      }

      // directories always end with a slash
      if (v && v.charAt(v.length - 1) !== '/') {
        v += '/';
      }

      v = URI.recodePath(v);
      this._parts.path = this._parts.path.replace(replace, v);
      this.build(!build);
      return this;
    }
  };
  p.filename = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined || v === true) {
      if (!this._parts.path || this._parts.path === '/') {
        return '';
      }

      var pos = this._parts.path.lastIndexOf('/');
      var res = this._parts.path.substring(pos+1);

      return v ? URI.decodePathSegment(res) : res;
    } else {
      var mutatedDirectory = false;

      if (v.charAt(0) === '/') {
        v = v.substring(1);
      }

      if (v.match(/\.?\//)) {
        mutatedDirectory = true;
      }

      var replace = new RegExp(escapeRegEx(this.filename()) + '$');
      v = URI.recodePath(v);
      this._parts.path = this._parts.path.replace(replace, v);

      if (mutatedDirectory) {
        this.normalizePath(build);
      } else {
        this.build(!build);
      }

      return this;
    }
  };
  p.suffix = function(v, build) {
    if (this._parts.urn) {
      return v === undefined ? '' : this;
    }

    if (v === undefined || v === true) {
      if (!this._parts.path || this._parts.path === '/') {
        return '';
      }

      var filename = this.filename();
      var pos = filename.lastIndexOf('.');
      var s, res;

      if (pos === -1) {
        return '';
      }

      // suffix may only contain alnum characters (yup, I made this up.)
      s = filename.substring(pos+1);
      res = (/^[a-z0-9%]+$/i).test(s) ? s : '';
      return v ? URI.decodePathSegment(res) : res;
    } else {
      if (v.charAt(0) === '.') {
        v = v.substring(1);
      }

      var suffix = this.suffix();
      var replace;

      if (!suffix) {
        if (!v) {
          return this;
        }

        this._parts.path += '.' + URI.recodePath(v);
      } else if (!v) {
        replace = new RegExp(escapeRegEx('.' + suffix) + '$');
      } else {
        replace = new RegExp(escapeRegEx(suffix) + '$');
      }

      if (replace) {
        v = URI.recodePath(v);
        this._parts.path = this._parts.path.replace(replace, v);
      }

      this.build(!build);
      return this;
    }
  };
  p.segment = function(segment, v, build) {
    var separator = this._parts.urn ? ':' : '/';
    var path = this.path();
    var absolute = path.substring(0, 1) === '/';
    var segments = path.split(separator);

    if (segment !== undefined && typeof segment !== 'number') {
      build = v;
      v = segment;
      segment = undefined;
    }

    if (segment !== undefined && typeof segment !== 'number') {
      throw new Error('Bad segment "' + segment + '", must be 0-based integer');
    }

    if (absolute) {
      segments.shift();
    }

    if (segment < 0) {
      // allow negative indexes to address from the end
      segment = Math.max(segments.length + segment, 0);
    }

    if (v === undefined) {
      /*jshint laxbreak: true */
      return segment === undefined
        ? segments
        : segments[segment];
      /*jshint laxbreak: false */
    } else if (segment === null || segments[segment] === undefined) {
      if (isArray(v)) {
        segments = [];
        // collapse empty elements within array
        for (var i=0, l=v.length; i < l; i++) {
          if (!v[i].length && (!segments.length || !segments[segments.length -1].length)) {
            continue;
          }

          if (segments.length && !segments[segments.length -1].length) {
            segments.pop();
          }

          segments.push(trimSlashes(v[i]));
        }
      } else if (v || typeof v === 'string') {
        v = trimSlashes(v);
        if (segments[segments.length -1] === '') {
          // empty trailing elements have to be overwritten
          // to prevent results such as /foo//bar
          segments[segments.length -1] = v;
        } else {
          segments.push(v);
        }
      }
    } else {
      if (v) {
        segments[segment] = trimSlashes(v);
      } else {
        segments.splice(segment, 1);
      }
    }

    if (absolute) {
      segments.unshift('');
    }

    return this.path(segments.join(separator), build);
  };
  p.segmentCoded = function(segment, v, build) {
    var segments, i, l;

    if (typeof segment !== 'number') {
      build = v;
      v = segment;
      segment = undefined;
    }

    if (v === undefined) {
      segments = this.segment(segment, v, build);
      if (!isArray(segments)) {
        segments = segments !== undefined ? URI.decode(segments) : undefined;
      } else {
        for (i = 0, l = segments.length; i < l; i++) {
          segments[i] = URI.decode(segments[i]);
        }
      }

      return segments;
    }

    if (!isArray(v)) {
      v = (typeof v === 'string' || v instanceof String) ? URI.encode(v) : v;
    } else {
      for (i = 0, l = v.length; i < l; i++) {
        v[i] = URI.encode(v[i]);
      }
    }

    return this.segment(segment, v, build);
  };

  // mutating query string
  var q = p.query;
  p.query = function(v, build) {
    if (v === true) {
      return URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
    } else if (typeof v === 'function') {
      var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
      var result = v.call(this, data);
      this._parts.query = URI.buildQuery(result || data, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
      this.build(!build);
      return this;
    } else if (v !== undefined && typeof v !== 'string') {
      this._parts.query = URI.buildQuery(v, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
      this.build(!build);
      return this;
    } else {
      return q.call(this, v, build);
    }
  };
  p.setQuery = function(name, value, build) {
    var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);

    if (typeof name === 'string' || name instanceof String) {
      data[name] = value !== undefined ? value : null;
    } else if (typeof name === 'object') {
      for (var key in name) {
        if (hasOwn.call(name, key)) {
          data[key] = name[key];
        }
      }
    } else {
      throw new TypeError('URI.addQuery() accepts an object, string as the name parameter');
    }

    this._parts.query = URI.buildQuery(data, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
    if (typeof name !== 'string') {
      build = value;
    }

    this.build(!build);
    return this;
  };
  p.addQuery = function(name, value, build) {
    var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
    URI.addQuery(data, name, value === undefined ? null : value);
    this._parts.query = URI.buildQuery(data, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
    if (typeof name !== 'string') {
      build = value;
    }

    this.build(!build);
    return this;
  };
  p.removeQuery = function(name, value, build) {
    var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
    URI.removeQuery(data, name, value);
    this._parts.query = URI.buildQuery(data, this._parts.duplicateQueryParameters, this._parts.escapeQuerySpace);
    if (typeof name !== 'string') {
      build = value;
    }

    this.build(!build);
    return this;
  };
  p.hasQuery = function(name, value, withinArray) {
    var data = URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace);
    return URI.hasQuery(data, name, value, withinArray);
  };
  p.setSearch = p.setQuery;
  p.addSearch = p.addQuery;
  p.removeSearch = p.removeQuery;
  p.hasSearch = p.hasQuery;

  // sanitizing URLs
  p.normalize = function() {
    if (this._parts.urn) {
      return this
        .normalizeProtocol(false)
        .normalizePath(false)
        .normalizeQuery(false)
        .normalizeFragment(false)
        .build();
    }

    return this
      .normalizeProtocol(false)
      .normalizeHostname(false)
      .normalizePort(false)
      .normalizePath(false)
      .normalizeQuery(false)
      .normalizeFragment(false)
      .build();
  };
  p.normalizeProtocol = function(build) {
    if (typeof this._parts.protocol === 'string') {
      this._parts.protocol = this._parts.protocol.toLowerCase();
      this.build(!build);
    }

    return this;
  };
  p.normalizeHostname = function(build) {
    if (this._parts.hostname) {
      if (this.is('IDN') && punycode) {
        this._parts.hostname = punycode.toASCII(this._parts.hostname);
      } else if (this.is('IPv6') && IPv6) {
        this._parts.hostname = IPv6.best(this._parts.hostname);
      }

      this._parts.hostname = this._parts.hostname.toLowerCase();
      this.build(!build);
    }

    return this;
  };
  p.normalizePort = function(build) {
    // remove port of it's the protocol's default
    if (typeof this._parts.protocol === 'string' && this._parts.port === URI.defaultPorts[this._parts.protocol]) {
      this._parts.port = null;
      this.build(!build);
    }

    return this;
  };
  p.normalizePath = function(build) {
    var _path = this._parts.path;
    if (!_path) {
      return this;
    }

    if (this._parts.urn) {
      this._parts.path = URI.recodeUrnPath(this._parts.path);
      this.build(!build);
      return this;
    }

    if (this._parts.path === '/') {
      return this;
    }

    _path = URI.recodePath(_path);

    var _was_relative;
    var _leadingParents = '';
    var _parent, _pos;

    // handle relative paths
    if (_path.charAt(0) !== '/') {
      _was_relative = true;
      _path = '/' + _path;
    }

    // handle relative files (as opposed to directories)
    if (_path.slice(-3) === '/..' || _path.slice(-2) === '/.') {
      _path += '/';
    }

    // resolve simples
    _path = _path
      .replace(/(\/(\.\/)+)|(\/\.$)/g, '/')
      .replace(/\/{2,}/g, '/');

    // remember leading parents
    if (_was_relative) {
      _leadingParents = _path.substring(1).match(/^(\.\.\/)+/) || '';
      if (_leadingParents) {
        _leadingParents = _leadingParents[0];
      }
    }

    // resolve parents
    while (true) {
      _parent = _path.search(/\/\.\.(\/|$)/);
      if (_parent === -1) {
        // no more ../ to resolve
        break;
      } else if (_parent === 0) {
        // top level cannot be relative, skip it
        _path = _path.substring(3);
        continue;
      }

      _pos = _path.substring(0, _parent).lastIndexOf('/');
      if (_pos === -1) {
        _pos = _parent;
      }
      _path = _path.substring(0, _pos) + _path.substring(_parent + 3);
    }

    // revert to relative
    if (_was_relative && this.is('relative')) {
      _path = _leadingParents + _path.substring(1);
    }

    this._parts.path = _path;
    this.build(!build);
    return this;
  };
  p.normalizePathname = p.normalizePath;
  p.normalizeQuery = function(build) {
    if (typeof this._parts.query === 'string') {
      if (!this._parts.query.length) {
        this._parts.query = null;
      } else {
        this.query(URI.parseQuery(this._parts.query, this._parts.escapeQuerySpace));
      }

      this.build(!build);
    }

    return this;
  };
  p.normalizeFragment = function(build) {
    if (!this._parts.fragment) {
      this._parts.fragment = null;
      this.build(!build);
    }

    return this;
  };
  p.normalizeSearch = p.normalizeQuery;
  p.normalizeHash = p.normalizeFragment;

  p.iso8859 = function() {
    // expect unicode input, iso8859 output
    var e = URI.encode;
    var d = URI.decode;

    URI.encode = escape;
    URI.decode = decodeURIComponent;
    try {
      this.normalize();
    } finally {
      URI.encode = e;
      URI.decode = d;
    }
    return this;
  };

  p.unicode = function() {
    // expect iso8859 input, unicode output
    var e = URI.encode;
    var d = URI.decode;

    URI.encode = strictEncodeURIComponent;
    URI.decode = unescape;
    try {
      this.normalize();
    } finally {
      URI.encode = e;
      URI.decode = d;
    }
    return this;
  };

  p.readable = function() {
    var uri = this.clone();
    // removing username, password, because they shouldn't be displayed according to RFC 3986
    uri.username('').password('').normalize();
    var t = '';
    if (uri._parts.protocol) {
      t += uri._parts.protocol + '://';
    }

    if (uri._parts.hostname) {
      if (uri.is('punycode') && punycode) {
        t += punycode.toUnicode(uri._parts.hostname);
        if (uri._parts.port) {
          t += ':' + uri._parts.port;
        }
      } else {
        t += uri.host();
      }
    }

    if (uri._parts.hostname && uri._parts.path && uri._parts.path.charAt(0) !== '/') {
      t += '/';
    }

    t += uri.path(true);
    if (uri._parts.query) {
      var q = '';
      for (var i = 0, qp = uri._parts.query.split('&'), l = qp.length; i < l; i++) {
        var kv = (qp[i] || '').split('=');
        q += '&' + URI.decodeQuery(kv[0], this._parts.escapeQuerySpace)
          .replace(/&/g, '%26');

        if (kv[1] !== undefined) {
          q += '=' + URI.decodeQuery(kv[1], this._parts.escapeQuerySpace)
            .replace(/&/g, '%26');
        }
      }
      t += '?' + q.substring(1);
    }

    t += URI.decodeQuery(uri.hash(), true);
    return t;
  };

  // resolving relative and absolute URLs
  p.absoluteTo = function(base) {
    var resolved = this.clone();
    var properties = ['protocol', 'username', 'password', 'hostname', 'port'];
    var basedir, i, p;

    if (this._parts.urn) {
      throw new Error('URNs do not have any generally defined hierarchical components');
    }

    if (!(base instanceof URI)) {
      base = new URI(base);
    }

    if (!resolved._parts.protocol) {
      resolved._parts.protocol = base._parts.protocol;
    }

    if (this._parts.hostname) {
      return resolved;
    }

    for (i = 0; (p = properties[i]); i++) {
      resolved._parts[p] = base._parts[p];
    }

    if (!resolved._parts.path) {
      resolved._parts.path = base._parts.path;
      if (!resolved._parts.query) {
        resolved._parts.query = base._parts.query;
      }
    } else if (resolved._parts.path.substring(-2) === '..') {
      resolved._parts.path += '/';
    }

    if (resolved.path().charAt(0) !== '/') {
      basedir = base.directory();
      basedir = basedir ? basedir : base.path().indexOf('/') === 0 ? '/' : '';
      resolved._parts.path = (basedir ? (basedir + '/') : '') + resolved._parts.path;
      resolved.normalizePath();
    }

    resolved.build();
    return resolved;
  };
  p.relativeTo = function(base) {
    var relative = this.clone().normalize();
    var relativeParts, baseParts, common, relativePath, basePath;

    if (relative._parts.urn) {
      throw new Error('URNs do not have any generally defined hierarchical components');
    }

    base = new URI(base).normalize();
    relativeParts = relative._parts;
    baseParts = base._parts;
    relativePath = relative.path();
    basePath = base.path();

    if (relativePath.charAt(0) !== '/') {
      throw new Error('URI is already relative');
    }

    if (basePath.charAt(0) !== '/') {
      throw new Error('Cannot calculate a URI relative to another relative URI');
    }

    if (relativeParts.protocol === baseParts.protocol) {
      relativeParts.protocol = null;
    }

    if (relativeParts.username !== baseParts.username || relativeParts.password !== baseParts.password) {
      return relative.build();
    }

    if (relativeParts.protocol !== null || relativeParts.username !== null || relativeParts.password !== null) {
      return relative.build();
    }

    if (relativeParts.hostname === baseParts.hostname && relativeParts.port === baseParts.port) {
      relativeParts.hostname = null;
      relativeParts.port = null;
    } else {
      return relative.build();
    }

    if (relativePath === basePath) {
      relativeParts.path = '';
      return relative.build();
    }

    // determine common sub path
    common = URI.commonPath(relativePath, basePath);

    // If the paths have nothing in common, return a relative URL with the absolute path.
    if (!common) {
      return relative.build();
    }

    var parents = baseParts.path
      .substring(common.length)
      .replace(/[^\/]*$/, '')
      .replace(/.*?\//g, '../');

    relativeParts.path = (parents + relativeParts.path.substring(common.length)) || './';

    return relative.build();
  };

  // comparing URIs
  p.equals = function(uri) {
    var one = this.clone();
    var two = new URI(uri);
    var one_map = {};
    var two_map = {};
    var checked = {};
    var one_query, two_query, key;

    one.normalize();
    two.normalize();

    // exact match
    if (one.toString() === two.toString()) {
      return true;
    }

    // extract query string
    one_query = one.query();
    two_query = two.query();
    one.query('');
    two.query('');

    // definitely not equal if not even non-query parts match
    if (one.toString() !== two.toString()) {
      return false;
    }

    // query parameters have the same length, even if they're permuted
    if (one_query.length !== two_query.length) {
      return false;
    }

    one_map = URI.parseQuery(one_query, this._parts.escapeQuerySpace);
    two_map = URI.parseQuery(two_query, this._parts.escapeQuerySpace);

    for (key in one_map) {
      if (hasOwn.call(one_map, key)) {
        if (!isArray(one_map[key])) {
          if (one_map[key] !== two_map[key]) {
            return false;
          }
        } else if (!arraysEqual(one_map[key], two_map[key])) {
          return false;
        }

        checked[key] = true;
      }
    }

    for (key in two_map) {
      if (hasOwn.call(two_map, key)) {
        if (!checked[key]) {
          // two contains a parameter not present in one
          return false;
        }
      }
    }

    return true;
  };

  // state
  p.duplicateQueryParameters = function(v) {
    this._parts.duplicateQueryParameters = !!v;
    return this;
  };

  p.escapeQuerySpace = function(v) {
    this._parts.escapeQuerySpace = !!v;
    return this;
  };

  return URI;
}));

},{"./IPv6":1,"./SecondLevelDomains":2,"./punycode":4}],4:[function(require,module,exports){
(function (global){
/*! https://mths.be/punycode v1.4.0 by @mathias */
;(function(root) {

	/** Detect free variables */
	var freeExports = typeof exports == 'object' && exports &&
		!exports.nodeType && exports;
	var freeModule = typeof module == 'object' && module &&
		!module.nodeType && module;
	var freeGlobal = typeof global == 'object' && global;
	if (
		freeGlobal.global === freeGlobal ||
		freeGlobal.window === freeGlobal ||
		freeGlobal.self === freeGlobal
	) {
		root = freeGlobal;
	}

	/**
	 * The `punycode` object.
	 * @name punycode
	 * @type Object
	 */
	var punycode,

	/** Highest positive signed 32-bit float value */
	maxInt = 2147483647, // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	base = 36,
	tMin = 1,
	tMax = 26,
	skew = 38,
	damp = 700,
	initialBias = 72,
	initialN = 128, // 0x80
	delimiter = '-', // '\x2D'

	/** Regular expressions */
	regexPunycode = /^xn--/,
	regexNonASCII = /[^\x20-\x7E]/, // unprintable ASCII chars + non-ASCII chars
	regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, // RFC 3490 separators

	/** Error messages */
	errors = {
		'overflow': 'Overflow: input needs wider integers to process',
		'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
		'invalid-input': 'Invalid input'
	},

	/** Convenience shortcuts */
	baseMinusTMin = base - tMin,
	floor = Math.floor,
	stringFromCharCode = String.fromCharCode,

	/** Temporary variable */
	key;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
		throw new RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
		var length = array.length;
		var result = [];
		while (length--) {
			result[length] = fn(array[length]);
		}
		return result;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings or email
	 * addresses.
	 * @private
	 * @param {String} domain The domain name or email address.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
		var parts = string.split('@');
		var result = '';
		if (parts.length > 1) {
			// In email addresses, only the domain name should be punycoded. Leave
			// the local part (i.e. everything up to `@`) intact.
			result = parts[0] + '@';
			string = parts[1];
		}
		// Avoid `split(regex)` for IE8 compatibility. See #17.
		string = string.replace(regexSeparators, '\x2E');
		var labels = string.split('.');
		var encoded = map(labels, fn).join('.');
		return result + encoded;
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <https://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
		var output = [],
		    counter = 0,
		    length = string.length,
		    value,
		    extra;
		while (counter < length) {
			value = string.charCodeAt(counter++);
			if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
				// high surrogate, and there is a next character
				extra = string.charCodeAt(counter++);
				if ((extra & 0xFC00) == 0xDC00) { // low surrogate
					output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
				} else {
					// unmatched surrogate; only append this code unit, in case the next
					// code unit is the high surrogate of a surrogate pair
					output.push(value);
					counter--;
				}
			} else {
				output.push(value);
			}
		}
		return output;
	}

	/**
	 * Creates a string based on an array of numeric code points.
	 * @see `punycode.ucs2.decode`
	 * @memberOf punycode.ucs2
	 * @name encode
	 * @param {Array} codePoints The array of numeric code points.
	 * @returns {String} The new Unicode string (UCS-2).
	 */
	function ucs2encode(array) {
		return map(array, function(value) {
			var output = '';
			if (value > 0xFFFF) {
				value -= 0x10000;
				output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
				value = 0xDC00 | value & 0x3FF;
			}
			output += stringFromCharCode(value);
			return output;
		}).join('');
	}

	/**
	 * Converts a basic code point into a digit/integer.
	 * @see `digitToBasic()`
	 * @private
	 * @param {Number} codePoint The basic numeric code point value.
	 * @returns {Number} The numeric value of a basic code point (for use in
	 * representing integers) in the range `0` to `base - 1`, or `base` if
	 * the code point does not represent a value.
	 */
	function basicToDigit(codePoint) {
		if (codePoint - 48 < 10) {
			return codePoint - 22;
		}
		if (codePoint - 65 < 26) {
			return codePoint - 65;
		}
		if (codePoint - 97 < 26) {
			return codePoint - 97;
		}
		return base;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
		//  0..25 map to ASCII a..z or A..Z
		// 26..35 map to ASCII 0..9
		return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * https://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
		var k = 0;
		delta = firstTime ? floor(delta / damp) : delta >> 1;
		delta += floor(delta / numPoints);
		for (/* no initialization */; delta > baseMinusTMin * tMax >> 1; k += base) {
			delta = floor(delta / baseMinusTMin);
		}
		return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a Punycode string of ASCII-only symbols to a string of Unicode
	 * symbols.
	 * @memberOf punycode
	 * @param {String} input The Punycode string of ASCII-only symbols.
	 * @returns {String} The resulting string of Unicode symbols.
	 */
	function decode(input) {
		// Don't use UCS-2
		var output = [],
		    inputLength = input.length,
		    out,
		    i = 0,
		    n = initialN,
		    bias = initialBias,
		    basic,
		    j,
		    index,
		    oldi,
		    w,
		    k,
		    digit,
		    t,
		    /** Cached calculation results */
		    baseMinusT;

		// Handle the basic code points: let `basic` be the number of input code
		// points before the last delimiter, or `0` if there is none, then copy
		// the first basic code points to the output.

		basic = input.lastIndexOf(delimiter);
		if (basic < 0) {
			basic = 0;
		}

		for (j = 0; j < basic; ++j) {
			// if it's not a basic code point
			if (input.charCodeAt(j) >= 0x80) {
				error('not-basic');
			}
			output.push(input.charCodeAt(j));
		}

		// Main decoding loop: start just after the last delimiter if any basic code
		// points were copied; start at the beginning otherwise.

		for (index = basic > 0 ? basic + 1 : 0; index < inputLength; /* no final expression */) {

			// `index` is the index of the next character to be consumed.
			// Decode a generalized variable-length integer into `delta`,
			// which gets added to `i`. The overflow checking is easier
			// if we increase `i` as we go, then subtract off its starting
			// value at the end to obtain `delta`.
			for (oldi = i, w = 1, k = base; /* no condition */; k += base) {

				if (index >= inputLength) {
					error('invalid-input');
				}

				digit = basicToDigit(input.charCodeAt(index++));

				if (digit >= base || digit > floor((maxInt - i) / w)) {
					error('overflow');
				}

				i += digit * w;
				t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);

				if (digit < t) {
					break;
				}

				baseMinusT = base - t;
				if (w > floor(maxInt / baseMinusT)) {
					error('overflow');
				}

				w *= baseMinusT;

			}

			out = output.length + 1;
			bias = adapt(i - oldi, out, oldi == 0);

			// `i` was supposed to wrap around from `out` to `0`,
			// incrementing `n` each time, so we'll fix that now:
			if (floor(i / out) > maxInt - n) {
				error('overflow');
			}

			n += floor(i / out);
			i %= out;

			// Insert `n` at position `i` of the output
			output.splice(i++, 0, n);

		}

		return ucs2encode(output);
	}

	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
		var n,
		    delta,
		    handledCPCount,
		    basicLength,
		    bias,
		    j,
		    m,
		    q,
		    k,
		    t,
		    currentValue,
		    output = [],
		    /** `inputLength` will hold the number of code points in `input`. */
		    inputLength,
		    /** Cached calculation results */
		    handledCPCountPlusOne,
		    baseMinusT,
		    qMinusT;

		// Convert the input in UCS-2 to Unicode
		input = ucs2decode(input);

		// Cache the length
		inputLength = input.length;

		// Initialize the state
		n = initialN;
		delta = 0;
		bias = initialBias;

		// Handle the basic code points
		for (j = 0; j < inputLength; ++j) {
			currentValue = input[j];
			if (currentValue < 0x80) {
				output.push(stringFromCharCode(currentValue));
			}
		}

		handledCPCount = basicLength = output.length;

		// `handledCPCount` is the number of code points that have been handled;
		// `basicLength` is the number of basic code points.

		// Finish the basic string - if it is not empty - with a delimiter
		if (basicLength) {
			output.push(delimiter);
		}

		// Main encoding loop:
		while (handledCPCount < inputLength) {

			// All non-basic code points < n have been handled already. Find the next
			// larger one:
			for (m = maxInt, j = 0; j < inputLength; ++j) {
				currentValue = input[j];
				if (currentValue >= n && currentValue < m) {
					m = currentValue;
				}
			}

			// Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
			// but guard against overflow
			handledCPCountPlusOne = handledCPCount + 1;
			if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
				error('overflow');
			}

			delta += (m - n) * handledCPCountPlusOne;
			n = m;

			for (j = 0; j < inputLength; ++j) {
				currentValue = input[j];

				if (currentValue < n && ++delta > maxInt) {
					error('overflow');
				}

				if (currentValue == n) {
					// Represent delta as a generalized variable-length integer
					for (q = delta, k = base; /* no condition */; k += base) {
						t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
						if (q < t) {
							break;
						}
						qMinusT = q - t;
						baseMinusT = base - t;
						output.push(
							stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
						);
						q = floor(qMinusT / baseMinusT);
					}

					output.push(stringFromCharCode(digitToBasic(q, 0)));
					bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
					delta = 0;
					++handledCPCount;
				}
			}

			++delta;
			++n;

		}
		return output.join('');
	}

	/**
	 * Converts a Punycode string representing a domain name or an email address
	 * to Unicode. Only the Punycoded parts of the input will be converted, i.e.
	 * it doesn't matter if you call it on a string that has already been
	 * converted to Unicode.
	 * @memberOf punycode
	 * @param {String} input The Punycoded domain name or email address to
	 * convert to Unicode.
	 * @returns {String} The Unicode representation of the given Punycode
	 * string.
	 */
	function toUnicode(input) {
		return mapDomain(input, function(string) {
			return regexPunycode.test(string)
				? decode(string.slice(4).toLowerCase())
				: string;
		});
	}

	/**
	 * Converts a Unicode string representing a domain name or an email address to
	 * Punycode. Only the non-ASCII parts of the domain name will be converted,
	 * i.e. it doesn't matter if you call it with a domain that's already in
	 * ASCII.
	 * @memberOf punycode
	 * @param {String} input The domain name or email address to convert, as a
	 * Unicode string.
	 * @returns {String} The Punycode representation of the given domain name or
	 * email address.
	 */
	function toASCII(input) {
		return mapDomain(input, function(string) {
			return regexNonASCII.test(string)
				? 'xn--' + encode(string)
				: string;
		});
	}

	/*--------------------------------------------------------------------------*/

	/** Define the public API */
	punycode = {
		/**
		 * A string representing the current Punycode.js version number.
		 * @memberOf punycode
		 * @type String
		 */
		'version': '1.3.2',
		/**
		 * An object of methods to convert from JavaScript's internal character
		 * representation (UCS-2) to Unicode code points, and back.
		 * @see <https://mathiasbynens.be/notes/javascript-encoding>
		 * @memberOf punycode
		 * @type Object
		 */
		'ucs2': {
			'decode': ucs2decode,
			'encode': ucs2encode
		},
		'decode': decode,
		'encode': encode,
		'toASCII': toASCII,
		'toUnicode': toUnicode
	};

	/** Expose `punycode` */
	// Some AMD build optimizers, like r.js, check for specific condition patterns
	// like the following:
	if (
		typeof define == 'function' &&
		typeof define.amd == 'object' &&
		define.amd
	) {
		define('punycode', function() {
			return punycode;
		});
	} else if (freeExports && freeModule) {
		if (module.exports == freeExports) {
			// in Node.js, io.js, or RingoJS v0.8.0+
			freeModule.exports = punycode;
		} else {
			// in Narwhal or RingoJS v0.7.0-
			for (key in punycode) {
				punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
			}
		}
	} else {
		// in Rhino or a web browser
		root.punycode = punycode;
	}

}(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _helpersEvent = require('./helpers/event');

var _helpersEvent2 = _interopRequireDefault(_helpersEvent);

var _helpersMessageEvent = require('./helpers/message-event');

var _helpersMessageEvent2 = _interopRequireDefault(_helpersMessageEvent);

var _helpersCloseEvent = require('./helpers/close-event');

var _helpersCloseEvent2 = _interopRequireDefault(_helpersCloseEvent);

/*
* Creates an Event object and extends it to allow full modification of
* its properties.
*
* @param {object} config - within config you will need to pass type and optionally target
*/
function createEvent(config) {
  var type = config.type;
  var target = config.target;

  var eventObject = new _helpersEvent2['default'](type);

  if (target) {
    eventObject.target = target;
    eventObject.srcElement = target;
    eventObject.currentTarget = target;
  }

  return eventObject;
}

/*
* Creates a MessageEvent object and extends it to allow full modification of
* its properties.
*
* @param {object} config - within config you will need to pass type, origin, data and optionally target
*/
function createMessageEvent(config) {
  var type = config.type;
  var origin = config.origin;
  var data = config.data;
  var target = config.target;

  var messageEvent = new _helpersMessageEvent2['default'](type, {
    data: data,
    origin: origin
  });

  if (target) {
    messageEvent.target = target;
    messageEvent.srcElement = target;
    messageEvent.currentTarget = target;
  }

  return messageEvent;
}

/*
* Creates a CloseEvent object and extends it to allow full modification of
* its properties.
*
* @param {object} config - within config you will need to pass type and optionally target, code, and reason
*/
function createCloseEvent(config) {
  var code = config.code;
  var reason = config.reason;
  var type = config.type;
  var target = config.target;
  var wasClean = config.wasClean;

  if (!wasClean) {
    wasClean = code === 1000;
  }

  var closeEvent = new _helpersCloseEvent2['default'](type, {
    code: code,
    reason: reason,
    wasClean: wasClean
  });

  if (target) {
    closeEvent.target = target;
    closeEvent.srcElement = target;
    closeEvent.currentTarget = target;
  }

  return closeEvent;
}

exports.createEvent = createEvent;
exports.createMessageEvent = createMessageEvent;
exports.createCloseEvent = createCloseEvent;
},{"./helpers/close-event":9,"./helpers/event":12,"./helpers/message-event":13}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _helpersArrayHelpers = require('./helpers/array-helpers');

/*
* EventTarget is an interface implemented by objects that can
* receive events and may have listeners for them.
*
* https://developer.mozilla.org/en-US/docs/Web/API/EventTarget
*/

var EventTarget = (function () {
  function EventTarget() {
    _classCallCheck(this, EventTarget);

    this.listeners = {};
  }

  /*
  * Ties a listener function to a event type which can later be invoked via the
  * dispatchEvent method.
  *
  * @param {string} type - the type of event (ie: 'open', 'message', etc.)
  * @param {function} listener - the callback function to invoke whenever a event is dispatched matching the given type
  * @param {boolean} useCapture - N/A TODO: implement useCapture functionality
  */

  _createClass(EventTarget, [{
    key: 'addEventListener',
    value: function addEventListener(type, listener /* , useCapture */) {
      if (typeof listener === 'function') {
        if (!Array.isArray(this.listeners[type])) {
          this.listeners[type] = [];
        }

        // Only add the same function once
        if ((0, _helpersArrayHelpers.filter)(this.listeners[type], function (item) {
          return item === listener;
        }).length === 0) {
          this.listeners[type].push(listener);
        }
      }
    }

    /*
    * Removes the listener so it will no longer be invoked via the dispatchEvent method.
    *
    * @param {string} type - the type of event (ie: 'open', 'message', etc.)
    * @param {function} listener - the callback function to invoke whenever a event is dispatched matching the given type
    * @param {boolean} useCapture - N/A TODO: implement useCapture functionality
    */
  }, {
    key: 'removeEventListener',
    value: function removeEventListener(type, removingListener /* , useCapture */) {
      var arrayOfListeners = this.listeners[type];
      this.listeners[type] = (0, _helpersArrayHelpers.reject)(arrayOfListeners, function (listener) {
        return listener === removingListener;
      });
    }

    /*
    * Invokes all listener functions that are listening to the given event.type property. Each
    * listener will be passed the event as the first argument.
    *
    * @param {object} event - event object which will be passed to all listeners of the event.type property
    */
  }, {
    key: 'dispatchEvent',
    value: function dispatchEvent(event) {
      var _this = this;

      for (var _len = arguments.length, customArguments = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        customArguments[_key - 1] = arguments[_key];
      }

      var eventName = event.type;
      var listeners = this.listeners[eventName];

      if (!Array.isArray(listeners)) {
        return false;
      }

      listeners.forEach(function (listener) {
        if (customArguments.length > 0) {
          listener.apply(_this, customArguments);
        } else {
          listener.call(_this, event);
        }
      });
    }
  }]);

  return EventTarget;
})();

exports['default'] = EventTarget;
module.exports = exports['default'];
},{"./helpers/array-helpers":7}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.reject = reject;
exports.filter = filter;

function reject(array, callback) {
  var results = [];
  array.forEach(function (itemInArray) {
    if (!callback(itemInArray)) {
      results.push(itemInArray);
    }
  });

  return results;
}

function filter(array, callback) {
  var results = [];
  array.forEach(function (itemInArray) {
    if (callback(itemInArray)) {
      results.push(itemInArray);
    }
  });

  return results;
}
},{}],8:[function(require,module,exports){
/*
* https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
*/
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var codes = {
  CLOSE_NORMAL: 1000,
  CLOSE_GOING_AWAY: 1001,
  CLOSE_PROTOCOL_ERROR: 1002,
  CLOSE_UNSUPPORTED: 1003,
  CLOSE_NO_STATUS: 1005,
  CLOSE_ABNORMAL: 1006,
  CLOSE_TOO_LARGE: 1009
};

exports["default"] = codes;
module.exports = exports["default"];
},{}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _eventPrototype = require('./event-prototype');

var _eventPrototype2 = _interopRequireDefault(_eventPrototype);

var CloseEvent = (function (_EventPrototype) {
  _inherits(CloseEvent, _EventPrototype);

  function CloseEvent(type) {
    var eventInitConfig = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, CloseEvent);

    _get(Object.getPrototypeOf(CloseEvent.prototype), 'constructor', this).call(this);

    if (!type) {
      throw new TypeError('Failed to construct \'CloseEvent\': 1 argument required, but only 0 present.');
    }

    if (typeof eventInitConfig !== 'object') {
      throw new TypeError('Failed to construct \'CloseEvent\': parameter 2 (\'eventInitDict\') is not an object');
    }

    var bubbles = eventInitConfig.bubbles;
    var cancelable = eventInitConfig.cancelable;
    var code = eventInitConfig.code;
    var reason = eventInitConfig.reason;
    var wasClean = eventInitConfig.wasClean;

    this.type = String(type);
    this.timeStamp = Date.now();
    this.target = null;
    this.srcElement = null;
    this.returnValue = true;
    this.isTrusted = false;
    this.eventPhase = 0;
    this.defaultPrevented = false;
    this.currentTarget = null;
    this.cancelable = cancelable ? Boolean(cancelable) : false;
    this.canncelBubble = false;
    this.bubbles = bubbles ? Boolean(bubbles) : false;
    this.code = typeof code === 'number' ? Number(code) : 0;
    this.reason = reason ? String(reason) : '';
    this.wasClean = wasClean ? Boolean(wasClean) : false;
  }

  return CloseEvent;
})(_eventPrototype2['default']);

exports['default'] = CloseEvent;
module.exports = exports['default'];
},{"./event-prototype":11}],10:[function(require,module,exports){
/*
* This delay allows the thread to finish assigning its on* methods
* before invoking the delay callback. This is purely a timing hack.
* http://geekabyte.blogspot.com/2014/01/javascript-effect-of-setting-settimeout.html
*
* @param {callback: function} the callback which will be invoked after the timeout
* @parma {context: object} the context in which to invoke the function
*/
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
function delay(callback, context) {
  setTimeout(function timeout(timeoutContext) {
    callback.call(timeoutContext);
  }, 4, context);
}

exports["default"] = delay;
module.exports = exports["default"];
},{}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var EventPrototype = (function () {
  function EventPrototype() {
    _classCallCheck(this, EventPrototype);
  }

  _createClass(EventPrototype, [{
    key: 'stopPropagation',

    // Noops
    value: function stopPropagation() {}
  }, {
    key: 'stopImmediatePropagation',
    value: function stopImmediatePropagation() {}

    // if no arguments are passed then the type is set to "undefined" on
    // chrome and safari.
  }, {
    key: 'initEvent',
    value: function initEvent() {
      var type = arguments.length <= 0 || arguments[0] === undefined ? 'undefined' : arguments[0];
      var bubbles = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
      var cancelable = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

      this.type = String(type);
      this.bubbles = Boolean(bubbles);
      this.cancelable = Boolean(cancelable);
    }
  }]);

  return EventPrototype;
})();

exports['default'] = EventPrototype;
module.exports = exports['default'];
},{}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _eventPrototype = require('./event-prototype');

var _eventPrototype2 = _interopRequireDefault(_eventPrototype);

var Event = (function (_EventPrototype) {
  _inherits(Event, _EventPrototype);

  function Event(type) {
    var eventInitConfig = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, Event);

    _get(Object.getPrototypeOf(Event.prototype), 'constructor', this).call(this);

    if (!type) {
      throw new TypeError('Failed to construct \'Event\': 1 argument required, but only 0 present.');
    }

    if (typeof eventInitConfig !== 'object') {
      throw new TypeError('Failed to construct \'Event\': parameter 2 (\'eventInitDict\') is not an object');
    }

    var bubbles = eventInitConfig.bubbles;
    var cancelable = eventInitConfig.cancelable;

    this.type = String(type);
    this.timeStamp = Date.now();
    this.target = null;
    this.srcElement = null;
    this.returnValue = true;
    this.isTrusted = false;
    this.eventPhase = 0;
    this.defaultPrevented = false;
    this.currentTarget = null;
    this.cancelable = cancelable ? Boolean(cancelable) : false;
    this.canncelBubble = false;
    this.bubbles = bubbles ? Boolean(bubbles) : false;
  }

  return Event;
})(_eventPrototype2['default']);

exports['default'] = Event;
module.exports = exports['default'];
},{"./event-prototype":11}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _eventPrototype = require('./event-prototype');

var _eventPrototype2 = _interopRequireDefault(_eventPrototype);

var MessageEvent = (function (_EventPrototype) {
  _inherits(MessageEvent, _EventPrototype);

  function MessageEvent(type) {
    var eventInitConfig = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, MessageEvent);

    _get(Object.getPrototypeOf(MessageEvent.prototype), 'constructor', this).call(this);

    if (!type) {
      throw new TypeError('Failed to construct \'MessageEvent\': 1 argument required, but only 0 present.');
    }

    if (typeof eventInitConfig !== 'object') {
      throw new TypeError('Failed to construct \'MessageEvent\': parameter 2 (\'eventInitDict\') is not an object');
    }

    var bubbles = eventInitConfig.bubbles;
    var cancelable = eventInitConfig.cancelable;
    var data = eventInitConfig.data;
    var origin = eventInitConfig.origin;
    var lastEventId = eventInitConfig.lastEventId;
    var ports = eventInitConfig.ports;

    this.type = String(type);
    this.timeStamp = Date.now();
    this.target = null;
    this.srcElement = null;
    this.returnValue = true;
    this.isTrusted = false;
    this.eventPhase = 0;
    this.defaultPrevented = false;
    this.currentTarget = null;
    this.cancelable = cancelable ? Boolean(cancelable) : false;
    this.canncelBubble = false;
    this.bubbles = bubbles ? Boolean(bubbles) : false;
    this.origin = origin ? String(origin) : '';
    this.ports = typeof ports === 'undefined' ? null : ports;
    this.data = typeof data === 'undefined' ? null : data;
    this.lastEventId = lastEventId ? String(lastEventId) : '';
  }

  return MessageEvent;
})(_eventPrototype2['default']);

exports['default'] = MessageEvent;
module.exports = exports['default'];
},{"./event-prototype":11}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _server = require('./server');

var _server2 = _interopRequireDefault(_server);

var _socketIo = require('./socket-io');

var _socketIo2 = _interopRequireDefault(_socketIo);

var _websocket = require('./websocket');

var _websocket2 = _interopRequireDefault(_websocket);

if (typeof window !== 'undefined') {
  window.MockServer = _server2['default'];
  window.MockWebSocket = _websocket2['default'];
  window.MockSocketIO = _socketIo2['default'];
}

var Server = _server2['default'];
exports.Server = Server;
var WebSocket = _websocket2['default'];
exports.WebSocket = WebSocket;
var SocketIO = _socketIo2['default'];
exports.SocketIO = SocketIO;
},{"./server":16,"./socket-io":17,"./websocket":18}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _helpersArrayHelpers = require('./helpers/array-helpers');

/*
* The network bridge is a way for the mock websocket object to 'communicate' with
* all avalible servers. This is a singleton object so it is important that you
* clean up urlMap whenever you are finished.
*/

var NetworkBridge = (function () {
  function NetworkBridge() {
    _classCallCheck(this, NetworkBridge);

    this.urlMap = {};
  }

  /*
  * Attaches a websocket object to the urlMap hash so that it can find the server
  * it is connected to and the server in turn can find it.
  *
  * @param {object} websocket - websocket object to add to the urlMap hash
  * @param {string} url
  */

  _createClass(NetworkBridge, [{
    key: 'attachWebSocket',
    value: function attachWebSocket(websocket, url) {
      var connectionLookup = this.urlMap[url];

      if (connectionLookup && connectionLookup.server && connectionLookup.websockets.indexOf(websocket) === -1) {
        connectionLookup.websockets.push(websocket);
        return connectionLookup.server;
      }
    }

    /*
    * Attaches a websocket to a room
    */
  }, {
    key: 'addMembershipToRoom',
    value: function addMembershipToRoom(websocket, room) {
      var connectionLookup = this.urlMap[websocket.url];

      if (connectionLookup && connectionLookup.server && connectionLookup.websockets.indexOf(websocket) !== -1) {
        if (!connectionLookup.roomMemberships[room]) {
          connectionLookup.roomMemberships[room] = [];
        }

        connectionLookup.roomMemberships[room].push(websocket);
      }
    }

    /*
    * Attaches a server object to the urlMap hash so that it can find a websockets
    * which are connected to it and so that websockets can in turn can find it.
    *
    * @param {object} server - server object to add to the urlMap hash
    * @param {string} url
    */
  }, {
    key: 'attachServer',
    value: function attachServer(server, url) {
      var connectionLookup = this.urlMap[url];

      if (!connectionLookup) {
        this.urlMap[url] = {
          server: server,
          websockets: [],
          roomMemberships: {}
        };

        return server;
      }
    }

    /*
    * Finds the server which is 'running' on the given url.
    *
    * @param {string} url - the url to use to find which server is running on it
    */
  }, {
    key: 'serverLookup',
    value: function serverLookup(url) {
      var connectionLookup = this.urlMap[url];

      if (connectionLookup) {
        return connectionLookup.server;
      }
    }

    /*
    * Finds all websockets which is 'listening' on the given url.
    *
    * @param {string} url - the url to use to find all websockets which are associated with it
    * @param {string} room - if a room is provided, will only return sockets in this room
    */
  }, {
    key: 'websocketsLookup',
    value: function websocketsLookup(url, room) {
      var connectionLookup = this.urlMap[url];

      if (!connectionLookup) {
        return [];
      }

      if (room) {
        var members = connectionLookup.roomMemberships[room];
        return members ? members : [];
      }

      return connectionLookup.websockets;
    }

    /*
    * Removes the entry associated with the url.
    *
    * @param {string} url
    */
  }, {
    key: 'removeServer',
    value: function removeServer(url) {
      delete this.urlMap[url];
    }

    /*
    * Removes the individual websocket from the map of associated websockets.
    *
    * @param {object} websocket - websocket object to remove from the url map
    * @param {string} url
    */
  }, {
    key: 'removeWebSocket',
    value: function removeWebSocket(websocket, url) {
      var connectionLookup = this.urlMap[url];

      if (connectionLookup) {
        connectionLookup.websockets = (0, _helpersArrayHelpers.reject)(connectionLookup.websockets, function (socket) {
          return socket === websocket;
        });
      }
    }

    /*
    * Removes a websocket from a room
    */
  }, {
    key: 'removeMembershipFromRoom',
    value: function removeMembershipFromRoom(websocket, room) {
      var connectionLookup = this.urlMap[websocket.url];
      var memberships = connectionLookup.roomMemberships[room];

      if (connectionLookup && memberships !== null) {
        connectionLookup.roomMemberships[room] = (0, _helpersArrayHelpers.reject)(memberships, function (socket) {
          return socket === websocket;
        });
      }
    }
  }]);

  return NetworkBridge;
})();

exports['default'] = new NetworkBridge();
// Note: this is a singleton
module.exports = exports['default'];
},{"./helpers/array-helpers":7}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x4, _x5, _x6) { var _again = true; _function: while (_again) { var object = _x4, property = _x5, receiver = _x6; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x4 = parent; _x5 = property; _x6 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _urijs = require('urijs');

var _urijs2 = _interopRequireDefault(_urijs);

var _websocket = require('./websocket');

var _websocket2 = _interopRequireDefault(_websocket);

var _eventTarget = require('./event-target');

var _eventTarget2 = _interopRequireDefault(_eventTarget);

var _networkBridge = require('./network-bridge');

var _networkBridge2 = _interopRequireDefault(_networkBridge);

var _helpersCloseCodes = require('./helpers/close-codes');

var _helpersCloseCodes2 = _interopRequireDefault(_helpersCloseCodes);

var _eventFactory = require('./event-factory');

/*
* https://github.com/websockets/ws#server-example
*/

var Server = (function (_EventTarget) {
  _inherits(Server, _EventTarget);

  /*
  * @param {string} url
  */

  function Server(url) {
    _classCallCheck(this, Server);

    _get(Object.getPrototypeOf(Server.prototype), 'constructor', this).call(this);
    this.url = (0, _urijs2['default'])(url).toString();
    var server = _networkBridge2['default'].attachServer(this, this.url);

    if (!server) {
      this.dispatchEvent((0, _eventFactory.createEvent)({ type: 'error' }));
      throw new Error('A mock server is already listening on this url');
    }
  }

  /*
   * Alternative constructor to support namespaces in socket.io
   *
   * http://socket.io/docs/rooms-and-namespaces/#custom-namespaces
   */

  /*
  * This is the main function for the mock server to subscribe to the on events.
  *
  * ie: mockServer.on('connection', function() { console.log('a mock client connected'); });
  *
  * @param {string} type - The event key to subscribe to. Valid keys are: connection, message, and close.
  * @param {function} callback - The callback which should be called when a certain event is fired.
  */

  _createClass(Server, [{
    key: 'on',
    value: function on(type, callback) {
      this.addEventListener(type, callback);
    }

    /*
    * This send function will notify all mock clients via their onmessage callbacks that the server
    * has a message for them.
    *
    * @param {*} data - Any javascript object which will be crafted into a MessageObject.
    */
  }, {
    key: 'send',
    value: function send(data) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      this.emit('message', data, options);
    }

    /*
    * Sends a generic message event to all mock clients.
    */
  }, {
    key: 'emit',
    value: function emit(event, data) {
      var _this2 = this;

      var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];
      var websockets = options.websockets;

      if (!websockets) {
        websockets = _networkBridge2['default'].websocketsLookup(this.url);
      }

      websockets.forEach(function (socket) {
        socket.dispatchEvent((0, _eventFactory.createMessageEvent)({
          type: event,
          data: data,
          origin: _this2.url,
          target: socket
        }));
      });
    }

    /*
    * Closes the connection and triggers the onclose method of all listening
    * websockets. After that it removes itself from the urlMap so another server
    * could add itself to the url.
    *
    * @param {object} options
    */
  }, {
    key: 'close',
    value: function close() {
      var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
      var code = options.code;
      var reason = options.reason;
      var wasClean = options.wasClean;

      var listeners = _networkBridge2['default'].websocketsLookup(this.url);

      listeners.forEach(function (socket) {
        socket.readyState = _websocket2['default'].CLOSE;
        socket.dispatchEvent((0, _eventFactory.createCloseEvent)({
          type: 'close',
          target: socket,
          code: code || _helpersCloseCodes2['default'].CLOSE_NORMAL,
          reason: reason || '',
          wasClean: wasClean
        }));
      });

      this.dispatchEvent((0, _eventFactory.createCloseEvent)({ type: 'close' }), this);
      _networkBridge2['default'].removeServer(this.url);
    }

    /*
    * Returns an array of websockets which are listening to this server
    */
  }, {
    key: 'clients',
    value: function clients() {
      return _networkBridge2['default'].websocketsLookup(this.url);
    }

    /*
    * Prepares a method to submit an event to members of the room
    *
    * e.g. server.to('my-room').emit('hi!');
    */
  }, {
    key: 'to',
    value: function to(room) {
      var _this = this;
      var websockets = _networkBridge2['default'].websocketsLookup(this.url, room);
      return {
        emit: function emit(event, data) {
          _this.emit(event, data, { websockets: websockets });
        }
      };
    }
  }]);

  return Server;
})(_eventTarget2['default']);

Server.of = function of(url) {
  return new Server(url);
};

exports['default'] = Server;
module.exports = exports['default'];
},{"./event-factory":5,"./event-target":6,"./helpers/close-codes":8,"./network-bridge":15,"./websocket":18,"urijs":3}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _urijs = require('urijs');

var _urijs2 = _interopRequireDefault(_urijs);

var _helpersDelay = require('./helpers/delay');

var _helpersDelay2 = _interopRequireDefault(_helpersDelay);

var _eventTarget = require('./event-target');

var _eventTarget2 = _interopRequireDefault(_eventTarget);

var _networkBridge = require('./network-bridge');

var _networkBridge2 = _interopRequireDefault(_networkBridge);

var _helpersCloseCodes = require('./helpers/close-codes');

var _helpersCloseCodes2 = _interopRequireDefault(_helpersCloseCodes);

var _eventFactory = require('./event-factory');

/*
* The socket-io class is designed to mimick the real API as closely as possible.
*
* http://socket.io/docs/
*/

var SocketIO = (function (_EventTarget) {
  _inherits(SocketIO, _EventTarget);

  /*
  * @param {string} url
  */

  function SocketIO() {
    var _this = this;

    var url = arguments.length <= 0 || arguments[0] === undefined ? 'socket.io' : arguments[0];
    var protocol = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

    _classCallCheck(this, SocketIO);

    _get(Object.getPrototypeOf(SocketIO.prototype), 'constructor', this).call(this);

    this.binaryType = 'blob';
    this.url = (0, _urijs2['default'])(url).toString();
    this.readyState = SocketIO.CONNECTING;
    this.protocol = '';

    if (typeof protocol === 'string') {
      this.protocol = protocol;
    } else if (Array.isArray(protocol) && protocol.length > 0) {
      this.protocol = protocol[0];
    }

    var server = _networkBridge2['default'].attachWebSocket(this, this.url);

    /*
    * Delay triggering the connection events so they can be defined in time.
    */
    (0, _helpersDelay2['default'])(function delayCallback() {
      if (server) {
        this.readyState = SocketIO.OPEN;
        server.dispatchEvent((0, _eventFactory.createEvent)({ type: 'connection' }), server, this);
        server.dispatchEvent((0, _eventFactory.createEvent)({ type: 'connect' }), server, this); // alias
        this.dispatchEvent((0, _eventFactory.createEvent)({ type: 'connect', target: this }));
      } else {
        this.readyState = SocketIO.CLOSED;
        this.dispatchEvent((0, _eventFactory.createEvent)({ type: 'error', target: this }));
        this.dispatchEvent((0, _eventFactory.createCloseEvent)({
          type: 'close',
          target: this,
          code: _helpersCloseCodes2['default'].CLOSE_NORMAL
        }));

        console.error('Socket.io connection to \'' + this.url + '\' failed');
      }
    }, this);

    /**
      Add an aliased event listener for close / disconnect
     */
    this.addEventListener('close', function (event) {
      _this.dispatchEvent((0, _eventFactory.createCloseEvent)({
        type: 'disconnect',
        target: event.target,
        code: event.code
      }));
    });
  }

  /*
  * Closes the SocketIO connection or connection attempt, if any.
  * If the connection is already CLOSED, this method does nothing.
  */

  _createClass(SocketIO, [{
    key: 'close',
    value: function close() {
      if (this.readyState !== SocketIO.OPEN) {
        return undefined;
      }

      var server = _networkBridge2['default'].serverLookup(this.url);
      _networkBridge2['default'].removeWebSocket(this, this.url);

      this.readyState = SocketIO.CLOSED;
      this.dispatchEvent((0, _eventFactory.createCloseEvent)({
        type: 'close',
        target: this,
        code: _helpersCloseCodes2['default'].CLOSE_NORMAL
      }));

      if (server) {
        server.dispatchEvent((0, _eventFactory.createCloseEvent)({
          type: 'disconnect',
          target: this,
          code: _helpersCloseCodes2['default'].CLOSE_NORMAL
        }), server);
      }
    }

    /*
    * Alias for Socket#close
    *
    * https://github.com/socketio/socket.io-client/blob/master/lib/socket.js#L383
    */
  }, {
    key: 'disconnect',
    value: function disconnect() {
      this.close();
    }

    /*
    * Submits an event to the server with a payload
    */
  }, {
    key: 'emit',
    value: function emit(event, data) {
      if (this.readyState !== SocketIO.OPEN) {
        throw new Error('SocketIO is already in CLOSING or CLOSED state');
      }

      var messageEvent = (0, _eventFactory.createMessageEvent)({
        type: event,
        origin: this.url,
        data: data
      });

      var server = _networkBridge2['default'].serverLookup(this.url);

      if (server) {
        server.dispatchEvent(messageEvent, data);
      }
    }

    /*
    * Submits a 'message' event to the server.
    *
    * Should behave exactly like WebSocket#send
    *
    * https://github.com/socketio/socket.io-client/blob/master/lib/socket.js#L113
    */
  }, {
    key: 'send',
    value: function send(data) {
      this.emit('message', data);
    }

    /*
    * For registering events to be received from the server
    */
  }, {
    key: 'on',
    value: function on(type, callback) {
      this.addEventListener(type, callback);
    }

    /*
    * For connection management
    */
  }, {
    key: 'once',
    value: function once(type, callback) {
      this.addEventListener(type, callback);
    }

    /*
     * Join a room on a server
     *
     * http://socket.io/docs/rooms-and-namespaces/#joining-and-leaving
     */
  }, {
    key: 'join',
    value: function join(room) {
      _networkBridge2['default'].addMembershipToRoom(this, room);
    }

    /*
     * Get the websocket to leave the room
     *
     * http://socket.io/docs/rooms-and-namespaces/#joining-and-leaving
     */
  }, {
    key: 'leave',
    value: function leave(room) {
      _networkBridge2['default'].removeMembershipFromRoom(this, room);
    }

    /*
     * Invokes all listener functions that are listening to the given event.type property. Each
     * listener will be passed the event as the first argument.
     *
     * @param {object} event - event object which will be passed to all listeners of the event.type property
     */
  }, {
    key: 'dispatchEvent',
    value: function dispatchEvent(event) {
      var _this2 = this;

      for (var _len = arguments.length, customArguments = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        customArguments[_key - 1] = arguments[_key];
      }

      var eventName = event.type;
      var listeners = this.listeners[eventName];

      if (!Array.isArray(listeners)) {
        return false;
      }

      listeners.forEach(function (listener) {
        if (customArguments.length > 0) {
          listener.apply(_this2, customArguments);
        } else {
          // Regular WebSockets expect a MessageEvent but Socketio.io just wants raw data
          //  payload instanceof MessageEvent works, but you can't isntance of NodeEvent
          //  for now we detect if the output has data defined on it
          listener.call(_this2, event.data ? event.data : event);
        }
      });
    }
  }]);

  return SocketIO;
})(_eventTarget2['default']);

SocketIO.CONNECTING = 0;
SocketIO.OPEN = 1;
SocketIO.CLOSING = 2;
SocketIO.CLOSED = 3;

/*
* Static constructor methods for the IO Socket
*/
var IO = function ioConstructor(url) {
  return new SocketIO(url);
};

/*
* Alias the raw IO() constructor
*/
IO.connect = function ioConnect(url) {
  /* eslint-disable new-cap */
  return IO(url);
  /* eslint-enable new-cap */
};

exports['default'] = IO;
module.exports = exports['default'];
},{"./event-factory":5,"./event-target":6,"./helpers/close-codes":8,"./helpers/delay":10,"./network-bridge":15,"urijs":3}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _urijs = require('urijs');

var _urijs2 = _interopRequireDefault(_urijs);

var _helpersDelay = require('./helpers/delay');

var _helpersDelay2 = _interopRequireDefault(_helpersDelay);

var _eventTarget = require('./event-target');

var _eventTarget2 = _interopRequireDefault(_eventTarget);

var _networkBridge = require('./network-bridge');

var _networkBridge2 = _interopRequireDefault(_networkBridge);

var _helpersCloseCodes = require('./helpers/close-codes');

var _helpersCloseCodes2 = _interopRequireDefault(_helpersCloseCodes);

var _eventFactory = require('./event-factory');

/*
* The main websocket class which is designed to mimick the native WebSocket class as close
* as possible.
*
* https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
*/

var WebSocket = (function (_EventTarget) {
  _inherits(WebSocket, _EventTarget);

  /*
  * @param {string} url
  */

  function WebSocket(url) {
    var protocol = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

    _classCallCheck(this, WebSocket);

    _get(Object.getPrototypeOf(WebSocket.prototype), 'constructor', this).call(this);

    if (!url) {
      throw new TypeError('Failed to construct \'WebSocket\': 1 argument required, but only 0 present.');
    }

    this.binaryType = 'blob';
    this.url = (0, _urijs2['default'])(url).toString();
    this.readyState = WebSocket.CONNECTING;
    this.protocol = '';

    if (typeof protocol === 'string') {
      this.protocol = protocol;
    } else if (Array.isArray(protocol) && protocol.length > 0) {
      this.protocol = protocol[0];
    }

    /*
    * In order to capture the callback function we need to define custom setters.
    * To illustrate:
    *   mySocket.onopen = function() { alert(true) };
    *
    * The only way to capture that function and hold onto it for later is with the
    * below code:
    */
    Object.defineProperties(this, {
      onopen: {
        configurable: true,
        enumerable: true,
        get: function get() {
          return this.listeners.open;
        },
        set: function set(listener) {
          this.addEventListener('open', listener);
        }
      },
      onmessage: {
        configurable: true,
        enumerable: true,
        get: function get() {
          return this.listeners.message;
        },
        set: function set(listener) {
          this.addEventListener('message', listener);
        }
      },
      onclose: {
        configurable: true,
        enumerable: true,
        get: function get() {
          return this.listeners.close;
        },
        set: function set(listener) {
          this.addEventListener('close', listener);
        }
      },
      onerror: {
        configurable: true,
        enumerable: true,
        get: function get() {
          return this.listeners.error;
        },
        set: function set(listener) {
          this.addEventListener('error', listener);
        }
      }
    });

    var server = _networkBridge2['default'].attachWebSocket(this, this.url);

    /*
    * This delay is needed so that we dont trigger an event before the callbacks have been
    * setup. For example:
    *
    * var socket = new WebSocket('ws://localhost');
    *
    * // If we dont have the delay then the event would be triggered right here and this is
    * // before the onopen had a chance to register itself.
    *
    * socket.onopen = () => { // this would never be called };
    *
    * // and with the delay the event gets triggered here after all of the callbacks have been
    * // registered :-)
    */
    (0, _helpersDelay2['default'])(function delayCallback() {
      if (server) {
        this.readyState = WebSocket.OPEN;
        server.dispatchEvent((0, _eventFactory.createEvent)({ type: 'connection' }), server, this);
        this.dispatchEvent((0, _eventFactory.createEvent)({ type: 'open', target: this }));
      } else {
        this.readyState = WebSocket.CLOSED;
        this.dispatchEvent((0, _eventFactory.createEvent)({ type: 'error', target: this }));
        this.dispatchEvent((0, _eventFactory.createCloseEvent)({ type: 'close', target: this, code: _helpersCloseCodes2['default'].CLOSE_NORMAL }));

        console.error('WebSocket connection to \'' + this.url + '\' failed');
      }
    }, this);
  }

  /*
  * Transmits data to the server over the WebSocket connection.
  *
  * https://developer.mozilla.org/en-US/docs/Web/API/WebSocket#send()
  */

  _createClass(WebSocket, [{
    key: 'send',
    value: function send(data) {
      if (this.readyState === WebSocket.CLOSING || this.readyState === WebSocket.CLOSED) {
        throw new Error('WebSocket is already in CLOSING or CLOSED state');
      }

      var messageEvent = (0, _eventFactory.createMessageEvent)({
        type: 'message',
        origin: this.url,
        data: data
      });

      var server = _networkBridge2['default'].serverLookup(this.url);

      if (server) {
        server.dispatchEvent(messageEvent, data);
      }
    }

    /*
    * Closes the WebSocket connection or connection attempt, if any.
    * If the connection is already CLOSED, this method does nothing.
    *
    * https://developer.mozilla.org/en-US/docs/Web/API/WebSocket#close()
    */
  }, {
    key: 'close',
    value: function close() {
      if (this.readyState !== WebSocket.OPEN) {
        return undefined;
      }

      var server = _networkBridge2['default'].serverLookup(this.url);
      var closeEvent = (0, _eventFactory.createCloseEvent)({
        type: 'close',
        target: this,
        code: _helpersCloseCodes2['default'].CLOSE_NORMAL
      });

      _networkBridge2['default'].removeWebSocket(this, this.url);

      this.readyState = WebSocket.CLOSED;
      this.dispatchEvent(closeEvent);

      if (server) {
        server.dispatchEvent(closeEvent, server);
      }
    }
  }]);

  return WebSocket;
})(_eventTarget2['default']);

WebSocket.CONNECTING = 0;
WebSocket.OPEN = 1;
WebSocket.CLOSING = 2;
WebSocket.CLOSED = 3;

exports['default'] = WebSocket;
module.exports = exports['default'];
},{"./event-factory":5,"./event-target":6,"./helpers/close-codes":8,"./helpers/delay":10,"./network-bridge":15,"urijs":3}]},{},[14])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvdXJpanMvc3JjL0lQdjYuanMiLCIuLi8uLi9ub2RlX21vZHVsZXMvdXJpanMvc3JjL1NlY29uZExldmVsRG9tYWlucy5qcyIsIi4uLy4uL25vZGVfbW9kdWxlcy91cmlqcy9zcmMvVVJJLmpzIiwiLi4vLi4vbm9kZV9tb2R1bGVzL3VyaWpzL3NyYy9wdW55Y29kZS5qcyIsImV2ZW50LWZhY3RvcnkuanMiLCJldmVudC10YXJnZXQuanMiLCJoZWxwZXJzL2FycmF5LWhlbHBlcnMuanMiLCJoZWxwZXJzL2Nsb3NlLWNvZGVzLmpzIiwiaGVscGVycy9jbG9zZS1ldmVudC5qcyIsImhlbHBlcnMvZGVsYXkuanMiLCJoZWxwZXJzL2V2ZW50LXByb3RvdHlwZS5qcyIsImhlbHBlcnMvZXZlbnQuanMiLCJoZWxwZXJzL21lc3NhZ2UtZXZlbnQuanMiLCJtYWluLmpzIiwibmV0d29yay1icmlkZ2UuanMiLCJzZXJ2ZXIuanMiLCJzb2NrZXQtaW8uanMiLCJ3ZWJzb2NrZXQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDbm9FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNyaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0tBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiFcbiAqIFVSSS5qcyAtIE11dGF0aW5nIFVSTHNcbiAqIElQdjYgU3VwcG9ydFxuICpcbiAqIFZlcnNpb246IDEuMTcuMVxuICpcbiAqIEF1dGhvcjogUm9kbmV5IFJlaG1cbiAqIFdlYjogaHR0cDovL21lZGlhbGl6ZS5naXRodWIuaW8vVVJJLmpzL1xuICpcbiAqIExpY2Vuc2VkIHVuZGVyXG4gKiAgIE1JVCBMaWNlbnNlIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2VcbiAqXG4gKi9cblxuKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG4gICd1c2Ugc3RyaWN0JztcbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3VtZGpzL3VtZC9ibG9iL21hc3Rlci9yZXR1cm5FeHBvcnRzLmpzXG4gIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpIHtcbiAgICAvLyBOb2RlXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgLy8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuICAgIGRlZmluZShmYWN0b3J5KTtcbiAgfSBlbHNlIHtcbiAgICAvLyBCcm93c2VyIGdsb2JhbHMgKHJvb3QgaXMgd2luZG93KVxuICAgIHJvb3QuSVB2NiA9IGZhY3Rvcnkocm9vdCk7XG4gIH1cbn0odGhpcywgZnVuY3Rpb24gKHJvb3QpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8qXG4gIHZhciBfaW4gPSBcImZlODA6MDAwMDowMDAwOjAwMDA6MDIwNDo2MWZmOmZlOWQ6ZjE1NlwiO1xuICB2YXIgX291dCA9IElQdjYuYmVzdChfaW4pO1xuICB2YXIgX2V4cGVjdGVkID0gXCJmZTgwOjoyMDQ6NjFmZjpmZTlkOmYxNTZcIjtcblxuICBjb25zb2xlLmxvZyhfaW4sIF9vdXQsIF9leHBlY3RlZCwgX291dCA9PT0gX2V4cGVjdGVkKTtcbiAgKi9cblxuICAvLyBzYXZlIGN1cnJlbnQgSVB2NiB2YXJpYWJsZSwgaWYgYW55XG4gIHZhciBfSVB2NiA9IHJvb3QgJiYgcm9vdC5JUHY2O1xuXG4gIGZ1bmN0aW9uIGJlc3RQcmVzZW50YXRpb24oYWRkcmVzcykge1xuICAgIC8vIGJhc2VkIG9uOlxuICAgIC8vIEphdmFzY3JpcHQgdG8gdGVzdCBhbiBJUHY2IGFkZHJlc3MgZm9yIHByb3BlciBmb3JtYXQsIGFuZCB0b1xuICAgIC8vIHByZXNlbnQgdGhlIFwiYmVzdCB0ZXh0IHJlcHJlc2VudGF0aW9uXCIgYWNjb3JkaW5nIHRvIElFVEYgRHJhZnQgUkZDIGF0XG4gICAgLy8gaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvZHJhZnQtaWV0Zi02bWFuLXRleHQtYWRkci1yZXByZXNlbnRhdGlvbi0wNFxuICAgIC8vIDggRmViIDIwMTAgUmljaCBCcm93biwgRGFydHdhcmUsIExMQ1xuICAgIC8vIFBsZWFzZSBmZWVsIGZyZWUgdG8gdXNlIHRoaXMgY29kZSBhcyBsb25nIGFzIHlvdSBwcm92aWRlIGEgbGluayB0b1xuICAgIC8vIGh0dHA6Ly93d3cuaW50ZXJtYXBwZXIuY29tXG4gICAgLy8gaHR0cDovL2ludGVybWFwcGVyLmNvbS9zdXBwb3J0L3Rvb2xzL0lQVjYtVmFsaWRhdG9yLmFzcHhcbiAgICAvLyBodHRwOi8vZG93bmxvYWQuZGFydHdhcmUuY29tL3RoaXJkcGFydHkvaXB2NnZhbGlkYXRvci5qc1xuXG4gICAgdmFyIF9hZGRyZXNzID0gYWRkcmVzcy50b0xvd2VyQ2FzZSgpO1xuICAgIHZhciBzZWdtZW50cyA9IF9hZGRyZXNzLnNwbGl0KCc6Jyk7XG4gICAgdmFyIGxlbmd0aCA9IHNlZ21lbnRzLmxlbmd0aDtcbiAgICB2YXIgdG90YWwgPSA4O1xuXG4gICAgLy8gdHJpbSBjb2xvbnMgKDo6IG9yIDo6YTpiOmPigKYgb3Ig4oCmYTpiOmM6OilcbiAgICBpZiAoc2VnbWVudHNbMF0gPT09ICcnICYmIHNlZ21lbnRzWzFdID09PSAnJyAmJiBzZWdtZW50c1syXSA9PT0gJycpIHtcbiAgICAgIC8vIG11c3QgaGF2ZSBiZWVuIDo6XG4gICAgICAvLyByZW1vdmUgZmlyc3QgdHdvIGl0ZW1zXG4gICAgICBzZWdtZW50cy5zaGlmdCgpO1xuICAgICAgc2VnbWVudHMuc2hpZnQoKTtcbiAgICB9IGVsc2UgaWYgKHNlZ21lbnRzWzBdID09PSAnJyAmJiBzZWdtZW50c1sxXSA9PT0gJycpIHtcbiAgICAgIC8vIG11c3QgaGF2ZSBiZWVuIDo6eHh4eFxuICAgICAgLy8gcmVtb3ZlIHRoZSBmaXJzdCBpdGVtXG4gICAgICBzZWdtZW50cy5zaGlmdCgpO1xuICAgIH0gZWxzZSBpZiAoc2VnbWVudHNbbGVuZ3RoIC0gMV0gPT09ICcnICYmIHNlZ21lbnRzW2xlbmd0aCAtIDJdID09PSAnJykge1xuICAgICAgLy8gbXVzdCBoYXZlIGJlZW4geHh4eDo6XG4gICAgICBzZWdtZW50cy5wb3AoKTtcbiAgICB9XG5cbiAgICBsZW5ndGggPSBzZWdtZW50cy5sZW5ndGg7XG5cbiAgICAvLyBhZGp1c3QgdG90YWwgc2VnbWVudHMgZm9yIElQdjQgdHJhaWxlclxuICAgIGlmIChzZWdtZW50c1tsZW5ndGggLSAxXS5pbmRleE9mKCcuJykgIT09IC0xKSB7XG4gICAgICAvLyBmb3VuZCBhIFwiLlwiIHdoaWNoIG1lYW5zIElQdjRcbiAgICAgIHRvdGFsID0gNztcbiAgICB9XG5cbiAgICAvLyBmaWxsIGVtcHR5IHNlZ21lbnRzIHRoZW0gd2l0aCBcIjAwMDBcIlxuICAgIHZhciBwb3M7XG4gICAgZm9yIChwb3MgPSAwOyBwb3MgPCBsZW5ndGg7IHBvcysrKSB7XG4gICAgICBpZiAoc2VnbWVudHNbcG9zXSA9PT0gJycpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBvcyA8IHRvdGFsKSB7XG4gICAgICBzZWdtZW50cy5zcGxpY2UocG9zLCAxLCAnMDAwMCcpO1xuICAgICAgd2hpbGUgKHNlZ21lbnRzLmxlbmd0aCA8IHRvdGFsKSB7XG4gICAgICAgIHNlZ21lbnRzLnNwbGljZShwb3MsIDAsICcwMDAwJyk7XG4gICAgICB9XG5cbiAgICAgIGxlbmd0aCA9IHNlZ21lbnRzLmxlbmd0aDtcbiAgICB9XG5cbiAgICAvLyBzdHJpcCBsZWFkaW5nIHplcm9zXG4gICAgdmFyIF9zZWdtZW50cztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRvdGFsOyBpKyspIHtcbiAgICAgIF9zZWdtZW50cyA9IHNlZ21lbnRzW2ldLnNwbGl0KCcnKTtcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgMyA7IGorKykge1xuICAgICAgICBpZiAoX3NlZ21lbnRzWzBdID09PSAnMCcgJiYgX3NlZ21lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICBfc2VnbWVudHMuc3BsaWNlKDAsMSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgc2VnbWVudHNbaV0gPSBfc2VnbWVudHMuam9pbignJyk7XG4gICAgfVxuXG4gICAgLy8gZmluZCBsb25nZXN0IHNlcXVlbmNlIG9mIHplcm9lcyBhbmQgY29hbGVzY2UgdGhlbSBpbnRvIG9uZSBzZWdtZW50XG4gICAgdmFyIGJlc3QgPSAtMTtcbiAgICB2YXIgX2Jlc3QgPSAwO1xuICAgIHZhciBfY3VycmVudCA9IDA7XG4gICAgdmFyIGN1cnJlbnQgPSAtMTtcbiAgICB2YXIgaW56ZXJvZXMgPSBmYWxzZTtcbiAgICAvLyBpOyBhbHJlYWR5IGRlY2xhcmVkXG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgdG90YWw7IGkrKykge1xuICAgICAgaWYgKGluemVyb2VzKSB7XG4gICAgICAgIGlmIChzZWdtZW50c1tpXSA9PT0gJzAnKSB7XG4gICAgICAgICAgX2N1cnJlbnQgKz0gMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpbnplcm9lcyA9IGZhbHNlO1xuICAgICAgICAgIGlmIChfY3VycmVudCA+IF9iZXN0KSB7XG4gICAgICAgICAgICBiZXN0ID0gY3VycmVudDtcbiAgICAgICAgICAgIF9iZXN0ID0gX2N1cnJlbnQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoc2VnbWVudHNbaV0gPT09ICcwJykge1xuICAgICAgICAgIGluemVyb2VzID0gdHJ1ZTtcbiAgICAgICAgICBjdXJyZW50ID0gaTtcbiAgICAgICAgICBfY3VycmVudCA9IDE7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoX2N1cnJlbnQgPiBfYmVzdCkge1xuICAgICAgYmVzdCA9IGN1cnJlbnQ7XG4gICAgICBfYmVzdCA9IF9jdXJyZW50O1xuICAgIH1cblxuICAgIGlmIChfYmVzdCA+IDEpIHtcbiAgICAgIHNlZ21lbnRzLnNwbGljZShiZXN0LCBfYmVzdCwgJycpO1xuICAgIH1cblxuICAgIGxlbmd0aCA9IHNlZ21lbnRzLmxlbmd0aDtcblxuICAgIC8vIGFzc2VtYmxlIHJlbWFpbmluZyBzZWdtZW50c1xuICAgIHZhciByZXN1bHQgPSAnJztcbiAgICBpZiAoc2VnbWVudHNbMF0gPT09ICcnKSAge1xuICAgICAgcmVzdWx0ID0gJzonO1xuICAgIH1cblxuICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgcmVzdWx0ICs9IHNlZ21lbnRzW2ldO1xuICAgICAgaWYgKGkgPT09IGxlbmd0aCAtIDEpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIHJlc3VsdCArPSAnOic7XG4gICAgfVxuXG4gICAgaWYgKHNlZ21lbnRzW2xlbmd0aCAtIDFdID09PSAnJykge1xuICAgICAgcmVzdWx0ICs9ICc6JztcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgZnVuY3Rpb24gbm9Db25mbGljdCgpIHtcbiAgICAvKmpzaGludCB2YWxpZHRoaXM6IHRydWUgKi9cbiAgICBpZiAocm9vdC5JUHY2ID09PSB0aGlzKSB7XG4gICAgICByb290LklQdjYgPSBfSVB2NjtcbiAgICB9XG4gIFxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBiZXN0OiBiZXN0UHJlc2VudGF0aW9uLFxuICAgIG5vQ29uZmxpY3Q6IG5vQ29uZmxpY3RcbiAgfTtcbn0pKTtcbiIsIi8qIVxuICogVVJJLmpzIC0gTXV0YXRpbmcgVVJMc1xuICogU2Vjb25kIExldmVsIERvbWFpbiAoU0xEKSBTdXBwb3J0XG4gKlxuICogVmVyc2lvbjogMS4xNy4xXG4gKlxuICogQXV0aG9yOiBSb2RuZXkgUmVobVxuICogV2ViOiBodHRwOi8vbWVkaWFsaXplLmdpdGh1Yi5pby9VUkkuanMvXG4gKlxuICogTGljZW5zZWQgdW5kZXJcbiAqICAgTUlUIExpY2Vuc2UgaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZVxuICpcbiAqL1xuXG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuICAvLyBodHRwczovL2dpdGh1Yi5jb20vdW1kanMvdW1kL2Jsb2IvbWFzdGVyL3JldHVybkV4cG9ydHMuanNcbiAgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgIC8vIE5vZGVcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG4gICAgZGVmaW5lKGZhY3RvcnkpO1xuICB9IGVsc2Uge1xuICAgIC8vIEJyb3dzZXIgZ2xvYmFscyAocm9vdCBpcyB3aW5kb3cpXG4gICAgcm9vdC5TZWNvbmRMZXZlbERvbWFpbnMgPSBmYWN0b3J5KHJvb3QpO1xuICB9XG59KHRoaXMsIGZ1bmN0aW9uIChyb290KSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvLyBzYXZlIGN1cnJlbnQgU2Vjb25kTGV2ZWxEb21haW5zIHZhcmlhYmxlLCBpZiBhbnlcbiAgdmFyIF9TZWNvbmRMZXZlbERvbWFpbnMgPSByb290ICYmIHJvb3QuU2Vjb25kTGV2ZWxEb21haW5zO1xuXG4gIHZhciBTTEQgPSB7XG4gICAgLy8gbGlzdCBvZiBrbm93biBTZWNvbmQgTGV2ZWwgRG9tYWluc1xuICAgIC8vIGNvbnZlcnRlZCBsaXN0IG9mIFNMRHMgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vZ2F2aW5nbWlsbGVyL3NlY29uZC1sZXZlbC1kb21haW5zXG4gICAgLy8gLS0tLVxuICAgIC8vIHB1YmxpY3N1ZmZpeC5vcmcgaXMgbW9yZSBjdXJyZW50IGFuZCBhY3R1YWxseSB1c2VkIGJ5IGEgY291cGxlIG9mIGJyb3dzZXJzIGludGVybmFsbHkuXG4gICAgLy8gZG93bnNpZGUgaXMgaXQgYWxzbyBjb250YWlucyBkb21haW5zIGxpa2UgXCJkeW5kbnMub3JnXCIgLSB3aGljaCBpcyBmaW5lIGZvciB0aGUgc2VjdXJpdHlcbiAgICAvLyBpc3N1ZXMgYnJvd3NlciBoYXZlIHRvIGRlYWwgd2l0aCAoU09QIGZvciBjb29raWVzLCBldGMpIC0gYnV0IGlzIHdheSBvdmVyYm9hcmQgZm9yIFVSSS5qc1xuICAgIC8vIC0tLS1cbiAgICBsaXN0OiB7XG4gICAgICAnYWMnOicgY29tIGdvdiBtaWwgbmV0IG9yZyAnLFxuICAgICAgJ2FlJzonIGFjIGNvIGdvdiBtaWwgbmFtZSBuZXQgb3JnIHBybyBzY2ggJyxcbiAgICAgICdhZic6JyBjb20gZWR1IGdvdiBuZXQgb3JnICcsXG4gICAgICAnYWwnOicgY29tIGVkdSBnb3YgbWlsIG5ldCBvcmcgJyxcbiAgICAgICdhbyc6JyBjbyBlZCBndiBpdCBvZyBwYiAnLFxuICAgICAgJ2FyJzonIGNvbSBlZHUgZ29iIGdvdiBpbnQgbWlsIG5ldCBvcmcgdHVyICcsXG4gICAgICAnYXQnOicgYWMgY28gZ3Ygb3IgJyxcbiAgICAgICdhdSc6JyBhc24gY29tIGNzaXJvIGVkdSBnb3YgaWQgbmV0IG9yZyAnLFxuICAgICAgJ2JhJzonIGNvIGNvbSBlZHUgZ292IG1pbCBuZXQgb3JnIHJzIHVuYmkgdW5tbyB1bnNhIHVudHogdW56ZSAnLFxuICAgICAgJ2JiJzonIGJpeiBjbyBjb20gZWR1IGdvdiBpbmZvIG5ldCBvcmcgc3RvcmUgdHYgJyxcbiAgICAgICdiaCc6JyBiaXogY2MgY29tIGVkdSBnb3YgaW5mbyBuZXQgb3JnICcsXG4gICAgICAnYm4nOicgY29tIGVkdSBnb3YgbmV0IG9yZyAnLFxuICAgICAgJ2JvJzonIGNvbSBlZHUgZ29iIGdvdiBpbnQgbWlsIG5ldCBvcmcgdHYgJyxcbiAgICAgICdicic6JyBhZG0gYWR2IGFnciBhbSBhcnEgYXJ0IGF0byBiIGJpbyBibG9nIGJtZCBjaW0gY25nIGNudCBjb20gY29vcCBlY24gZWR1IGVuZyBlc3AgZXRjIGV0aSBmYXIgZmxvZyBmbSBmbmQgZm90IGZzdCBnMTIgZ2dmIGdvdiBpbWIgaW5kIGluZiBqb3IganVzIGxlbCBtYXQgbWVkIG1pbCBtdXMgbmV0IG5vbSBub3QgbnRyIG9kbyBvcmcgcHBnIHBybyBwc2MgcHNpIHFzbCByZWMgc2xnIHNydiB0bXAgdHJkIHR1ciB0diB2ZXQgdmxvZyB3aWtpIHpsZyAnLFxuICAgICAgJ2JzJzonIGNvbSBlZHUgZ292IG5ldCBvcmcgJyxcbiAgICAgICdieic6JyBkdSBldCBvbSBvdiByZyAnLFxuICAgICAgJ2NhJzonIGFiIGJjIG1iIG5iIG5mIG5sIG5zIG50IG51IG9uIHBlIHFjIHNrIHlrICcsXG4gICAgICAnY2snOicgYml6IGNvIGVkdSBnZW4gZ292IGluZm8gbmV0IG9yZyAnLFxuICAgICAgJ2NuJzonIGFjIGFoIGJqIGNvbSBjcSBlZHUgZmogZ2QgZ292IGdzIGd4IGd6IGhhIGhiIGhlIGhpIGhsIGhuIGpsIGpzIGp4IGxuIG1pbCBuZXQgbm0gbnggb3JnIHFoIHNjIHNkIHNoIHNuIHN4IHRqIHR3IHhqIHh6IHluIHpqICcsXG4gICAgICAnY28nOicgY29tIGVkdSBnb3YgbWlsIG5ldCBub20gb3JnICcsXG4gICAgICAnY3InOicgYWMgYyBjbyBlZCBmaSBnbyBvciBzYSAnLFxuICAgICAgJ2N5JzonIGFjIGJpeiBjb20gZWtsb2dlcyBnb3YgbHRkIG5hbWUgbmV0IG9yZyBwYXJsaWFtZW50IHByZXNzIHBybyB0bSAnLFxuICAgICAgJ2RvJzonIGFydCBjb20gZWR1IGdvYiBnb3YgbWlsIG5ldCBvcmcgc2xkIHdlYiAnLFxuICAgICAgJ2R6JzonIGFydCBhc3NvIGNvbSBlZHUgZ292IG5ldCBvcmcgcG9sICcsXG4gICAgICAnZWMnOicgY29tIGVkdSBmaW4gZ292IGluZm8gbWVkIG1pbCBuZXQgb3JnIHBybyAnLFxuICAgICAgJ2VnJzonIGNvbSBlZHUgZXVuIGdvdiBtaWwgbmFtZSBuZXQgb3JnIHNjaSAnLFxuICAgICAgJ2VyJzonIGNvbSBlZHUgZ292IGluZCBtaWwgbmV0IG9yZyByb2NoZXN0IHcgJyxcbiAgICAgICdlcyc6JyBjb20gZWR1IGdvYiBub20gb3JnICcsXG4gICAgICAnZXQnOicgYml6IGNvbSBlZHUgZ292IGluZm8gbmFtZSBuZXQgb3JnICcsXG4gICAgICAnZmonOicgYWMgYml6IGNvbSBpbmZvIG1pbCBuYW1lIG5ldCBvcmcgcHJvICcsXG4gICAgICAnZmsnOicgYWMgY28gZ292IG5ldCBub20gb3JnICcsXG4gICAgICAnZnInOicgYXNzbyBjb20gZiBnb3V2IG5vbSBwcmQgcHJlc3NlIHRtICcsXG4gICAgICAnZ2cnOicgY28gbmV0IG9yZyAnLFxuICAgICAgJ2doJzonIGNvbSBlZHUgZ292IG1pbCBvcmcgJyxcbiAgICAgICdnbic6JyBhYyBjb20gZ292IG5ldCBvcmcgJyxcbiAgICAgICdncic6JyBjb20gZWR1IGdvdiBtaWwgbmV0IG9yZyAnLFxuICAgICAgJ2d0JzonIGNvbSBlZHUgZ29iIGluZCBtaWwgbmV0IG9yZyAnLFxuICAgICAgJ2d1JzonIGNvbSBlZHUgZ292IG5ldCBvcmcgJyxcbiAgICAgICdoayc6JyBjb20gZWR1IGdvdiBpZHYgbmV0IG9yZyAnLFxuICAgICAgJ2h1JzonIDIwMDAgYWdyYXIgYm9sdCBjYXNpbm8gY2l0eSBjbyBlcm90aWNhIGVyb3Rpa2EgZmlsbSBmb3J1bSBnYW1lcyBob3RlbCBpbmZvIGluZ2F0bGFuIGpvZ2FzeiBrb255dmVsbyBsYWthcyBtZWRpYSBuZXdzIG9yZyBwcml2IHJla2xhbSBzZXggc2hvcCBzcG9ydCBzdWxpIHN6ZXggdG0gdG96c2RlIHV0YXphcyB2aWRlbyAnLFxuICAgICAgJ2lkJzonIGFjIGNvIGdvIG1pbCBuZXQgb3Igc2NoIHdlYiAnLFxuICAgICAgJ2lsJzonIGFjIGNvIGdvdiBpZGYgazEyIG11bmkgbmV0IG9yZyAnLFxuICAgICAgJ2luJzonIGFjIGNvIGVkdSBlcm5ldCBmaXJtIGdlbiBnb3YgaSBpbmQgbWlsIG5ldCBuaWMgb3JnIHJlcyAnLFxuICAgICAgJ2lxJzonIGNvbSBlZHUgZ292IGkgbWlsIG5ldCBvcmcgJyxcbiAgICAgICdpcic6JyBhYyBjbyBkbnNzZWMgZ292IGkgaWQgbmV0IG9yZyBzY2ggJyxcbiAgICAgICdpdCc6JyBlZHUgZ292ICcsXG4gICAgICAnamUnOicgY28gbmV0IG9yZyAnLFxuICAgICAgJ2pvJzonIGNvbSBlZHUgZ292IG1pbCBuYW1lIG5ldCBvcmcgc2NoICcsXG4gICAgICAnanAnOicgYWMgYWQgY28gZWQgZ28gZ3IgbGcgbmUgb3IgJyxcbiAgICAgICdrZSc6JyBhYyBjbyBnbyBpbmZvIG1lIG1vYmkgbmUgb3Igc2MgJyxcbiAgICAgICdraCc6JyBjb20gZWR1IGdvdiBtaWwgbmV0IG9yZyBwZXIgJyxcbiAgICAgICdraSc6JyBiaXogY29tIGRlIGVkdSBnb3YgaW5mbyBtb2IgbmV0IG9yZyB0ZWwgJyxcbiAgICAgICdrbSc6JyBhc3NvIGNvbSBjb29wIGVkdSBnb3V2IGsgbWVkZWNpbiBtaWwgbm9tIG5vdGFpcmVzIHBoYXJtYWNpZW5zIHByZXNzZSB0bSB2ZXRlcmluYWlyZSAnLFxuICAgICAgJ2tuJzonIGVkdSBnb3YgbmV0IG9yZyAnLFxuICAgICAgJ2tyJzonIGFjIGJ1c2FuIGNodW5nYnVrIGNodW5nbmFtIGNvIGRhZWd1IGRhZWplb24gZXMgZ2FuZ3dvbiBnbyBnd2FuZ2p1IGd5ZW9uZ2J1ayBneWVvbmdnaSBneWVvbmduYW0gaHMgaW5jaGVvbiBqZWp1IGplb25idWsgamVvbm5hbSBrIGtnIG1pbCBtcyBuZSBvciBwZSByZSBzYyBzZW91bCB1bHNhbiAnLFxuICAgICAgJ2t3JzonIGNvbSBlZHUgZ292IG5ldCBvcmcgJyxcbiAgICAgICdreSc6JyBjb20gZWR1IGdvdiBuZXQgb3JnICcsXG4gICAgICAna3onOicgY29tIGVkdSBnb3YgbWlsIG5ldCBvcmcgJyxcbiAgICAgICdsYic6JyBjb20gZWR1IGdvdiBuZXQgb3JnICcsXG4gICAgICAnbGsnOicgYXNzbiBjb20gZWR1IGdvdiBncnAgaG90ZWwgaW50IGx0ZCBuZXQgbmdvIG9yZyBzY2ggc29jIHdlYiAnLFxuICAgICAgJ2xyJzonIGNvbSBlZHUgZ292IG5ldCBvcmcgJyxcbiAgICAgICdsdic6JyBhc24gY29tIGNvbmYgZWR1IGdvdiBpZCBtaWwgbmV0IG9yZyAnLFxuICAgICAgJ2x5JzonIGNvbSBlZHUgZ292IGlkIG1lZCBuZXQgb3JnIHBsYyBzY2ggJyxcbiAgICAgICdtYSc6JyBhYyBjbyBnb3YgbSBuZXQgb3JnIHByZXNzICcsXG4gICAgICAnbWMnOicgYXNzbyB0bSAnLFxuICAgICAgJ21lJzonIGFjIGNvIGVkdSBnb3YgaXRzIG5ldCBvcmcgcHJpdiAnLFxuICAgICAgJ21nJzonIGNvbSBlZHUgZ292IG1pbCBub20gb3JnIHByZCB0bSAnLFxuICAgICAgJ21rJzonIGNvbSBlZHUgZ292IGluZiBuYW1lIG5ldCBvcmcgcHJvICcsXG4gICAgICAnbWwnOicgY29tIGVkdSBnb3YgbmV0IG9yZyBwcmVzc2UgJyxcbiAgICAgICdtbic6JyBlZHUgZ292IG9yZyAnLFxuICAgICAgJ21vJzonIGNvbSBlZHUgZ292IG5ldCBvcmcgJyxcbiAgICAgICdtdCc6JyBjb20gZWR1IGdvdiBuZXQgb3JnICcsXG4gICAgICAnbXYnOicgYWVybyBiaXogY29tIGNvb3AgZWR1IGdvdiBpbmZvIGludCBtaWwgbXVzZXVtIG5hbWUgbmV0IG9yZyBwcm8gJyxcbiAgICAgICdtdyc6JyBhYyBjbyBjb20gY29vcCBlZHUgZ292IGludCBtdXNldW0gbmV0IG9yZyAnLFxuICAgICAgJ214JzonIGNvbSBlZHUgZ29iIG5ldCBvcmcgJyxcbiAgICAgICdteSc6JyBjb20gZWR1IGdvdiBtaWwgbmFtZSBuZXQgb3JnIHNjaCAnLFxuICAgICAgJ25mJzonIGFydHMgY29tIGZpcm0gaW5mbyBuZXQgb3RoZXIgcGVyIHJlYyBzdG9yZSB3ZWIgJyxcbiAgICAgICduZyc6JyBiaXogY29tIGVkdSBnb3YgbWlsIG1vYmkgbmFtZSBuZXQgb3JnIHNjaCAnLFxuICAgICAgJ25pJzonIGFjIGNvIGNvbSBlZHUgZ29iIG1pbCBuZXQgbm9tIG9yZyAnLFxuICAgICAgJ25wJzonIGNvbSBlZHUgZ292IG1pbCBuZXQgb3JnICcsXG4gICAgICAnbnInOicgYml6IGNvbSBlZHUgZ292IGluZm8gbmV0IG9yZyAnLFxuICAgICAgJ29tJzonIGFjIGJpeiBjbyBjb20gZWR1IGdvdiBtZWQgbWlsIG11c2V1bSBuZXQgb3JnIHBybyBzY2ggJyxcbiAgICAgICdwZSc6JyBjb20gZWR1IGdvYiBtaWwgbmV0IG5vbSBvcmcgc2xkICcsXG4gICAgICAncGgnOicgY29tIGVkdSBnb3YgaSBtaWwgbmV0IG5nbyBvcmcgJyxcbiAgICAgICdwayc6JyBiaXogY29tIGVkdSBmYW0gZ29iIGdvayBnb24gZ29wIGdvcyBnb3YgbmV0IG9yZyB3ZWIgJyxcbiAgICAgICdwbCc6JyBhcnQgYmlhbHlzdG9rIGJpeiBjb20gZWR1IGdkYSBnZGFuc2sgZ29yem93IGdvdiBpbmZvIGthdG93aWNlIGtyYWtvdyBsb2R6IGx1YmxpbiBtaWwgbmV0IG5nbyBvbHN6dHluIG9yZyBwb3puYW4gcHdyIHJhZG9tIHNsdXBzayBzemN6ZWNpbiB0b3J1biB3YXJzemF3YSB3YXcgd3JvYyB3cm9jbGF3IHpnb3JhICcsXG4gICAgICAncHInOicgYWMgYml6IGNvbSBlZHUgZXN0IGdvdiBpbmZvIGlzbGEgbmFtZSBuZXQgb3JnIHBybyBwcm9mICcsXG4gICAgICAncHMnOicgY29tIGVkdSBnb3YgbmV0IG9yZyBwbG8gc2VjICcsXG4gICAgICAncHcnOicgYmVsYXUgY28gZWQgZ28gbmUgb3IgJyxcbiAgICAgICdybyc6JyBhcnRzIGNvbSBmaXJtIGluZm8gbm9tIG50IG9yZyByZWMgc3RvcmUgdG0gd3d3ICcsXG4gICAgICAncnMnOicgYWMgY28gZWR1IGdvdiBpbiBvcmcgJyxcbiAgICAgICdzYic6JyBjb20gZWR1IGdvdiBuZXQgb3JnICcsXG4gICAgICAnc2MnOicgY29tIGVkdSBnb3YgbmV0IG9yZyAnLFxuICAgICAgJ3NoJzonIGNvIGNvbSBlZHUgZ292IG5ldCBub20gb3JnICcsXG4gICAgICAnc2wnOicgY29tIGVkdSBnb3YgbmV0IG9yZyAnLFxuICAgICAgJ3N0JzonIGNvIGNvbSBjb25zdWxhZG8gZWR1IGVtYmFpeGFkYSBnb3YgbWlsIG5ldCBvcmcgcHJpbmNpcGUgc2FvdG9tZSBzdG9yZSAnLFxuICAgICAgJ3N2JzonIGNvbSBlZHUgZ29iIG9yZyByZWQgJyxcbiAgICAgICdzeic6JyBhYyBjbyBvcmcgJyxcbiAgICAgICd0cic6JyBhdiBiYnMgYmVsIGJpeiBjb20gZHIgZWR1IGdlbiBnb3YgaW5mbyBrMTIgbmFtZSBuZXQgb3JnIHBvbCB0ZWwgdHNrIHR2IHdlYiAnLFxuICAgICAgJ3R0JzonIGFlcm8gYml6IGNhdCBjbyBjb20gY29vcCBlZHUgZ292IGluZm8gaW50IGpvYnMgbWlsIG1vYmkgbXVzZXVtIG5hbWUgbmV0IG9yZyBwcm8gdGVsIHRyYXZlbCAnLFxuICAgICAgJ3R3JzonIGNsdWIgY29tIGViaXogZWR1IGdhbWUgZ292IGlkdiBtaWwgbmV0IG9yZyAnLFxuICAgICAgJ211JzonIGFjIGNvIGNvbSBnb3YgbmV0IG9yIG9yZyAnLFxuICAgICAgJ216JzonIGFjIGNvIGVkdSBnb3Ygb3JnICcsXG4gICAgICAnbmEnOicgY28gY29tICcsXG4gICAgICAnbnonOicgYWMgY28gY3JpIGdlZWsgZ2VuIGdvdnQgaGVhbHRoIGl3aSBtYW9yaSBtaWwgbmV0IG9yZyBwYXJsaWFtZW50IHNjaG9vbCAnLFxuICAgICAgJ3BhJzonIGFibyBhYyBjb20gZWR1IGdvYiBpbmcgbWVkIG5ldCBub20gb3JnIHNsZCAnLFxuICAgICAgJ3B0JzonIGNvbSBlZHUgZ292IGludCBuZXQgbm9tZSBvcmcgcHVibCAnLFxuICAgICAgJ3B5JzonIGNvbSBlZHUgZ292IG1pbCBuZXQgb3JnICcsXG4gICAgICAncWEnOicgY29tIGVkdSBnb3YgbWlsIG5ldCBvcmcgJyxcbiAgICAgICdyZSc6JyBhc3NvIGNvbSBub20gJyxcbiAgICAgICdydSc6JyBhYyBhZHlnZXlhIGFsdGFpIGFtdXIgYXJraGFuZ2Vsc2sgYXN0cmFraGFuIGJhc2hraXJpYSBiZWxnb3JvZCBiaXIgYnJ5YW5zayBidXJ5YXRpYSBjYmcgY2hlbCBjaGVseWFiaW5zayBjaGl0YSBjaHVrb3RrYSBjaHV2YXNoaWEgY29tIGRhZ2VzdGFuIGUtYnVyZyBlZHUgZ292IGdyb3pueSBpbnQgaXJrdXRzayBpdmFub3ZvIGl6aGV2c2sgamFyIGpvc2hrYXItb2xhIGthbG15a2lhIGthbHVnYSBrYW1jaGF0a2Ega2FyZWxpYSBrYXphbiBrY2hyIGtlbWVyb3ZvIGtoYWJhcm92c2sga2hha2Fzc2lhIGtodiBraXJvdiBrb2VuaWcga29taSBrb3N0cm9tYSBrcmFub3lhcnNrIGt1YmFuIGt1cmdhbiBrdXJzayBsaXBldHNrIG1hZ2FkYW4gbWFyaSBtYXJpLWVsIG1hcmluZSBtaWwgbW9yZG92aWEgbW9zcmVnIG1zayBtdXJtYW5zayBuYWxjaGlrIG5ldCBubm92IG5vdiBub3Zvc2liaXJzayBuc2sgb21zayBvcmVuYnVyZyBvcmcgb3J5b2wgcGVuemEgcGVybSBwcCBwc2tvdiBwdHogcm5kIHJ5YXphbiBzYWtoYWxpbiBzYW1hcmEgc2FyYXRvdiBzaW1iaXJzayBzbW9sZW5zayBzcGIgc3RhdnJvcG9sIHN0diBzdXJndXQgdGFtYm92IHRhdGFyc3RhbiB0b20gdG9tc2sgdHNhcml0c3luIHRzayB0dWxhIHR1dmEgdHZlciB0eXVtZW4gdWRtIHVkbXVydGlhIHVsYW4tdWRlIHZsYWRpa2F2a2F6IHZsYWRpbWlyIHZsYWRpdm9zdG9rIHZvbGdvZ3JhZCB2b2xvZ2RhIHZvcm9uZXpoIHZybiB2eWF0a2EgeWFrdXRpYSB5YW1hbCB5ZWthdGVyaW5idXJnIHl1emhuby1zYWtoYWxpbnNrICcsXG4gICAgICAncncnOicgYWMgY28gY29tIGVkdSBnb3V2IGdvdiBpbnQgbWlsIG5ldCAnLFxuICAgICAgJ3NhJzonIGNvbSBlZHUgZ292IG1lZCBuZXQgb3JnIHB1YiBzY2ggJyxcbiAgICAgICdzZCc6JyBjb20gZWR1IGdvdiBpbmZvIG1lZCBuZXQgb3JnIHR2ICcsXG4gICAgICAnc2UnOicgYSBhYyBiIGJkIGMgZCBlIGYgZyBoIGkgayBsIG0gbiBvIG9yZyBwIHBhcnRpIHBwIHByZXNzIHIgcyB0IHRtIHUgdyB4IHkgeiAnLFxuICAgICAgJ3NnJzonIGNvbSBlZHUgZ292IGlkbiBuZXQgb3JnIHBlciAnLFxuICAgICAgJ3NuJzonIGFydCBjb20gZWR1IGdvdXYgb3JnIHBlcnNvIHVuaXYgJyxcbiAgICAgICdzeSc6JyBjb20gZWR1IGdvdiBtaWwgbmV0IG5ld3Mgb3JnICcsXG4gICAgICAndGgnOicgYWMgY28gZ28gaW4gbWkgbmV0IG9yICcsXG4gICAgICAndGonOicgYWMgYml6IGNvIGNvbSBlZHUgZ28gZ292IGluZm8gaW50IG1pbCBuYW1lIG5ldCBuaWMgb3JnIHRlc3Qgd2ViICcsXG4gICAgICAndG4nOicgYWdyaW5ldCBjb20gZGVmZW5zZSBlZHVuZXQgZW5zIGZpbiBnb3YgaW5kIGluZm8gaW50bCBtaW5jb20gbmF0IG5ldCBvcmcgcGVyc28gcm5ydCBybnMgcm51IHRvdXJpc20gJyxcbiAgICAgICd0eic6JyBhYyBjbyBnbyBuZSBvciAnLFxuICAgICAgJ3VhJzonIGJpeiBjaGVya2Fzc3kgY2hlcm5pZ292IGNoZXJub3Z0c3kgY2sgY24gY28gY29tIGNyaW1lYSBjdiBkbiBkbmVwcm9wZXRyb3ZzayBkb25ldHNrIGRwIGVkdSBnb3YgaWYgaW4gaXZhbm8tZnJhbmtpdnNrIGtoIGtoYXJrb3Yga2hlcnNvbiBraG1lbG5pdHNraXkga2lldiBraXJvdm9ncmFkIGttIGtyIGtzIGt2IGxnIGx1Z2Fuc2sgbHV0c2sgbHZpdiBtZSBtayBuZXQgbmlrb2xhZXYgb2Qgb2Rlc3NhIG9yZyBwbCBwb2x0YXZhIHBwIHJvdm5vIHJ2IHNlYmFzdG9wb2wgc3VteSB0ZSB0ZXJub3BpbCB1emhnb3JvZCB2aW5uaWNhIHZuIHphcG9yaXpoemhlIHpoaXRvbWlyIHpwIHp0ICcsXG4gICAgICAndWcnOicgYWMgY28gZ28gbmUgb3Igb3JnIHNjICcsXG4gICAgICAndWsnOicgYWMgYmwgYnJpdGlzaC1saWJyYXJ5IGNvIGN5bSBnb3YgZ292dCBpY25ldCBqZXQgbGVhIGx0ZCBtZSBtaWwgbW9kIG5hdGlvbmFsLWxpYnJhcnktc2NvdGxhbmQgbmVsIG5ldCBuaHMgbmljIG5scyBvcmcgb3JnbiBwYXJsaWFtZW50IHBsYyBwb2xpY2Ugc2NoIHNjb3Qgc29jICcsXG4gICAgICAndXMnOicgZG5pIGZlZCBpc2Ega2lkcyBuc24gJyxcbiAgICAgICd1eSc6JyBjb20gZWR1IGd1YiBtaWwgbmV0IG9yZyAnLFxuICAgICAgJ3ZlJzonIGNvIGNvbSBlZHUgZ29iIGluZm8gbWlsIG5ldCBvcmcgd2ViICcsXG4gICAgICAndmknOicgY28gY29tIGsxMiBuZXQgb3JnICcsXG4gICAgICAndm4nOicgYWMgYml6IGNvbSBlZHUgZ292IGhlYWx0aCBpbmZvIGludCBuYW1lIG5ldCBvcmcgcHJvICcsXG4gICAgICAneWUnOicgY28gY29tIGdvdiBsdGQgbWUgbmV0IG9yZyBwbGMgJyxcbiAgICAgICd5dSc6JyBhYyBjbyBlZHUgZ292IG9yZyAnLFxuICAgICAgJ3phJzonIGFjIGFncmljIGFsdCBib3Vyc2UgY2l0eSBjbyBjeWJlcm5ldCBkYiBlZHUgZ292IGdyb25kYXIgaWFjY2VzcyBpbXQgaW5jYSBsYW5kZXNpZ24gbGF3IG1pbCBuZXQgbmdvIG5pcyBub20gb2xpdmV0dGkgb3JnIHBpeCBzY2hvb2wgdG0gd2ViICcsXG4gICAgICAnem0nOicgYWMgY28gY29tIGVkdSBnb3YgbmV0IG9yZyBzY2ggJ1xuICAgIH0sXG4gICAgLy8gZ29yaGlsbCAyMDEzLTEwLTI1OiBVc2luZyBpbmRleE9mKCkgaW5zdGVhZCBSZWdleHAoKS4gU2lnbmlmaWNhbnQgYm9vc3RcbiAgICAvLyBpbiBib3RoIHBlcmZvcm1hbmNlIGFuZCBtZW1vcnkgZm9vdHByaW50LiBObyBpbml0aWFsaXphdGlvbiByZXF1aXJlZC5cbiAgICAvLyBodHRwOi8vanNwZXJmLmNvbS91cmktanMtc2xkLXJlZ2V4LXZzLWJpbmFyeS1zZWFyY2gvNFxuICAgIC8vIEZvbGxvd2luZyBtZXRob2RzIHVzZSBsYXN0SW5kZXhPZigpIHJhdGhlciB0aGFuIGFycmF5LnNwbGl0KCkgaW4gb3JkZXJcbiAgICAvLyB0byBhdm9pZCBhbnkgbWVtb3J5IGFsbG9jYXRpb25zLlxuICAgIGhhczogZnVuY3Rpb24oZG9tYWluKSB7XG4gICAgICB2YXIgdGxkT2Zmc2V0ID0gZG9tYWluLmxhc3RJbmRleE9mKCcuJyk7XG4gICAgICBpZiAodGxkT2Zmc2V0IDw9IDAgfHwgdGxkT2Zmc2V0ID49IChkb21haW4ubGVuZ3RoLTEpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHZhciBzbGRPZmZzZXQgPSBkb21haW4ubGFzdEluZGV4T2YoJy4nLCB0bGRPZmZzZXQtMSk7XG4gICAgICBpZiAoc2xkT2Zmc2V0IDw9IDAgfHwgc2xkT2Zmc2V0ID49ICh0bGRPZmZzZXQtMSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgdmFyIHNsZExpc3QgPSBTTEQubGlzdFtkb21haW4uc2xpY2UodGxkT2Zmc2V0KzEpXTtcbiAgICAgIGlmICghc2xkTGlzdCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICByZXR1cm4gc2xkTGlzdC5pbmRleE9mKCcgJyArIGRvbWFpbi5zbGljZShzbGRPZmZzZXQrMSwgdGxkT2Zmc2V0KSArICcgJykgPj0gMDtcbiAgICB9LFxuICAgIGlzOiBmdW5jdGlvbihkb21haW4pIHtcbiAgICAgIHZhciB0bGRPZmZzZXQgPSBkb21haW4ubGFzdEluZGV4T2YoJy4nKTtcbiAgICAgIGlmICh0bGRPZmZzZXQgPD0gMCB8fCB0bGRPZmZzZXQgPj0gKGRvbWFpbi5sZW5ndGgtMSkpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgdmFyIHNsZE9mZnNldCA9IGRvbWFpbi5sYXN0SW5kZXhPZignLicsIHRsZE9mZnNldC0xKTtcbiAgICAgIGlmIChzbGRPZmZzZXQgPj0gMCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICB2YXIgc2xkTGlzdCA9IFNMRC5saXN0W2RvbWFpbi5zbGljZSh0bGRPZmZzZXQrMSldO1xuICAgICAgaWYgKCFzbGRMaXN0KSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzbGRMaXN0LmluZGV4T2YoJyAnICsgZG9tYWluLnNsaWNlKDAsIHRsZE9mZnNldCkgKyAnICcpID49IDA7XG4gICAgfSxcbiAgICBnZXQ6IGZ1bmN0aW9uKGRvbWFpbikge1xuICAgICAgdmFyIHRsZE9mZnNldCA9IGRvbWFpbi5sYXN0SW5kZXhPZignLicpO1xuICAgICAgaWYgKHRsZE9mZnNldCA8PSAwIHx8IHRsZE9mZnNldCA+PSAoZG9tYWluLmxlbmd0aC0xKSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIHZhciBzbGRPZmZzZXQgPSBkb21haW4ubGFzdEluZGV4T2YoJy4nLCB0bGRPZmZzZXQtMSk7XG4gICAgICBpZiAoc2xkT2Zmc2V0IDw9IDAgfHwgc2xkT2Zmc2V0ID49ICh0bGRPZmZzZXQtMSkpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICB2YXIgc2xkTGlzdCA9IFNMRC5saXN0W2RvbWFpbi5zbGljZSh0bGRPZmZzZXQrMSldO1xuICAgICAgaWYgKCFzbGRMaXN0KSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgICAgaWYgKHNsZExpc3QuaW5kZXhPZignICcgKyBkb21haW4uc2xpY2Uoc2xkT2Zmc2V0KzEsIHRsZE9mZnNldCkgKyAnICcpIDwgMCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBkb21haW4uc2xpY2Uoc2xkT2Zmc2V0KzEpO1xuICAgIH0sXG4gICAgbm9Db25mbGljdDogZnVuY3Rpb24oKXtcbiAgICAgIGlmIChyb290LlNlY29uZExldmVsRG9tYWlucyA9PT0gdGhpcykge1xuICAgICAgICByb290LlNlY29uZExldmVsRG9tYWlucyA9IF9TZWNvbmRMZXZlbERvbWFpbnM7XG4gICAgICB9XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH07XG5cbiAgcmV0dXJuIFNMRDtcbn0pKTtcbiIsIi8qIVxuICogVVJJLmpzIC0gTXV0YXRpbmcgVVJMc1xuICpcbiAqIFZlcnNpb246IDEuMTcuMVxuICpcbiAqIEF1dGhvcjogUm9kbmV5IFJlaG1cbiAqIFdlYjogaHR0cDovL21lZGlhbGl6ZS5naXRodWIuaW8vVVJJLmpzL1xuICpcbiAqIExpY2Vuc2VkIHVuZGVyXG4gKiAgIE1JVCBMaWNlbnNlIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2VcbiAqXG4gKi9cbihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuICAndXNlIHN0cmljdCc7XG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS91bWRqcy91bWQvYmxvYi9tYXN0ZXIvcmV0dXJuRXhwb3J0cy5qc1xuICBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSB7XG4gICAgLy8gTm9kZVxuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShyZXF1aXJlKCcuL3B1bnljb2RlJyksIHJlcXVpcmUoJy4vSVB2NicpLCByZXF1aXJlKCcuL1NlY29uZExldmVsRG9tYWlucycpKTtcbiAgfSBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAvLyBBTUQuIFJlZ2lzdGVyIGFzIGFuIGFub255bW91cyBtb2R1bGUuXG4gICAgZGVmaW5lKFsnLi9wdW55Y29kZScsICcuL0lQdjYnLCAnLi9TZWNvbmRMZXZlbERvbWFpbnMnXSwgZmFjdG9yeSk7XG4gIH0gZWxzZSB7XG4gICAgLy8gQnJvd3NlciBnbG9iYWxzIChyb290IGlzIHdpbmRvdylcbiAgICByb290LlVSSSA9IGZhY3Rvcnkocm9vdC5wdW55Y29kZSwgcm9vdC5JUHY2LCByb290LlNlY29uZExldmVsRG9tYWlucywgcm9vdCk7XG4gIH1cbn0odGhpcywgZnVuY3Rpb24gKHB1bnljb2RlLCBJUHY2LCBTTEQsIHJvb3QpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuICAvKmdsb2JhbCBsb2NhdGlvbiwgZXNjYXBlLCB1bmVzY2FwZSAqL1xuICAvLyBGSVhNRTogdjIuMC4wIHJlbmFtY2Ugbm9uLWNhbWVsQ2FzZSBwcm9wZXJ0aWVzIHRvIHVwcGVyY2FzZVxuICAvKmpzaGludCBjYW1lbGNhc2U6IGZhbHNlICovXG5cbiAgLy8gc2F2ZSBjdXJyZW50IFVSSSB2YXJpYWJsZSwgaWYgYW55XG4gIHZhciBfVVJJID0gcm9vdCAmJiByb290LlVSSTtcblxuICBmdW5jdGlvbiBVUkkodXJsLCBiYXNlKSB7XG4gICAgdmFyIF91cmxTdXBwbGllZCA9IGFyZ3VtZW50cy5sZW5ndGggPj0gMTtcbiAgICB2YXIgX2Jhc2VTdXBwbGllZCA9IGFyZ3VtZW50cy5sZW5ndGggPj0gMjtcblxuICAgIC8vIEFsbG93IGluc3RhbnRpYXRpb24gd2l0aG91dCB0aGUgJ25ldycga2V5d29yZFxuICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBVUkkpKSB7XG4gICAgICBpZiAoX3VybFN1cHBsaWVkKSB7XG4gICAgICAgIGlmIChfYmFzZVN1cHBsaWVkKSB7XG4gICAgICAgICAgcmV0dXJuIG5ldyBVUkkodXJsLCBiYXNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgVVJJKHVybCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBuZXcgVVJJKCk7XG4gICAgfVxuXG4gICAgaWYgKHVybCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAoX3VybFN1cHBsaWVkKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ3VuZGVmaW5lZCBpcyBub3QgYSB2YWxpZCBhcmd1bWVudCBmb3IgVVJJJyk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2YgbG9jYXRpb24gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHVybCA9IGxvY2F0aW9uLmhyZWYgKyAnJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHVybCA9ICcnO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuaHJlZih1cmwpO1xuXG4gICAgLy8gcmVzb2x2ZSB0byBiYXNlIGFjY29yZGluZyB0byBodHRwOi8vZHZjcy53My5vcmcvaGcvdXJsL3Jhdy1maWxlL3RpcC9PdmVydmlldy5odG1sI2NvbnN0cnVjdG9yXG4gICAgaWYgKGJhc2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHRoaXMuYWJzb2x1dGVUbyhiYXNlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIFVSSS52ZXJzaW9uID0gJzEuMTcuMSc7XG5cbiAgdmFyIHAgPSBVUkkucHJvdG90eXBlO1xuICB2YXIgaGFzT3duID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblxuICBmdW5jdGlvbiBlc2NhcGVSZWdFeChzdHJpbmcpIHtcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vbWVkaWFsaXplL1VSSS5qcy9jb21taXQvODVhYzIxNzgzYzExZjhjY2FiMDYxMDZkYmE5NzM1YTMxYTg2OTI0ZCNjb21taXRjb21tZW50LTgyMTk2M1xuICAgIHJldHVybiBzdHJpbmcucmVwbGFjZSgvKFsuKis/Xj0hOiR7fSgpfFtcXF1cXC9cXFxcXSkvZywgJ1xcXFwkMScpO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0VHlwZSh2YWx1ZSkge1xuICAgIC8vIElFOCBkb2Vzbid0IHJldHVybiBbT2JqZWN0IFVuZGVmaW5lZF0gYnV0IFtPYmplY3QgT2JqZWN0XSBmb3IgdW5kZWZpbmVkIHZhbHVlXG4gICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiAnVW5kZWZpbmVkJztcbiAgICB9XG5cbiAgICByZXR1cm4gU3RyaW5nKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSkpLnNsaWNlKDgsIC0xKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzQXJyYXkob2JqKSB7XG4gICAgcmV0dXJuIGdldFR5cGUob2JqKSA9PT0gJ0FycmF5JztcbiAgfVxuXG4gIGZ1bmN0aW9uIGZpbHRlckFycmF5VmFsdWVzKGRhdGEsIHZhbHVlKSB7XG4gICAgdmFyIGxvb2t1cCA9IHt9O1xuICAgIHZhciBpLCBsZW5ndGg7XG5cbiAgICBpZiAoZ2V0VHlwZSh2YWx1ZSkgPT09ICdSZWdFeHAnKSB7XG4gICAgICBsb29rdXAgPSBudWxsO1xuICAgIH0gZWxzZSBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgIGZvciAoaSA9IDAsIGxlbmd0aCA9IHZhbHVlLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxvb2t1cFt2YWx1ZVtpXV0gPSB0cnVlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBsb29rdXBbdmFsdWVdID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBmb3IgKGkgPSAwLCBsZW5ndGggPSBkYXRhLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAvKmpzaGludCBsYXhicmVhazogdHJ1ZSAqL1xuICAgICAgdmFyIF9tYXRjaCA9IGxvb2t1cCAmJiBsb29rdXBbZGF0YVtpXV0gIT09IHVuZGVmaW5lZFxuICAgICAgICB8fCAhbG9va3VwICYmIHZhbHVlLnRlc3QoZGF0YVtpXSk7XG4gICAgICAvKmpzaGludCBsYXhicmVhazogZmFsc2UgKi9cbiAgICAgIGlmIChfbWF0Y2gpIHtcbiAgICAgICAgZGF0YS5zcGxpY2UoaSwgMSk7XG4gICAgICAgIGxlbmd0aC0tO1xuICAgICAgICBpLS07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGRhdGE7XG4gIH1cblxuICBmdW5jdGlvbiBhcnJheUNvbnRhaW5zKGxpc3QsIHZhbHVlKSB7XG4gICAgdmFyIGksIGxlbmd0aDtcblxuICAgIC8vIHZhbHVlIG1heSBiZSBzdHJpbmcsIG51bWJlciwgYXJyYXksIHJlZ2V4cFxuICAgIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgICAgLy8gTm90ZTogdGhpcyBjYW4gYmUgb3B0aW1pemVkIHRvIE8obikgKGluc3RlYWQgb2YgY3VycmVudCBPKG0gKiBuKSlcbiAgICAgIGZvciAoaSA9IDAsIGxlbmd0aCA9IHZhbHVlLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICghYXJyYXlDb250YWlucyhsaXN0LCB2YWx1ZVtpXSkpIHtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgdmFyIF90eXBlID0gZ2V0VHlwZSh2YWx1ZSk7XG4gICAgZm9yIChpID0gMCwgbGVuZ3RoID0gbGlzdC5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKF90eXBlID09PSAnUmVnRXhwJykge1xuICAgICAgICBpZiAodHlwZW9mIGxpc3RbaV0gPT09ICdzdHJpbmcnICYmIGxpc3RbaV0ubWF0Y2godmFsdWUpKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAobGlzdFtpXSA9PT0gdmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgZnVuY3Rpb24gYXJyYXlzRXF1YWwob25lLCB0d28pIHtcbiAgICBpZiAoIWlzQXJyYXkob25lKSB8fCAhaXNBcnJheSh0d28pKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gYXJyYXlzIGNhbid0IGJlIGVxdWFsIGlmIHRoZXkgaGF2ZSBkaWZmZXJlbnQgYW1vdW50IG9mIGNvbnRlbnRcbiAgICBpZiAob25lLmxlbmd0aCAhPT0gdHdvLmxlbmd0aCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIG9uZS5zb3J0KCk7XG4gICAgdHdvLnNvcnQoKTtcblxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gb25lLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgaWYgKG9uZVtpXSAhPT0gdHdvW2ldKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRyaW1TbGFzaGVzKHRleHQpIHtcbiAgICB2YXIgdHJpbV9leHByZXNzaW9uID0gL15cXC8rfFxcLyskL2c7XG4gICAgcmV0dXJuIHRleHQucmVwbGFjZSh0cmltX2V4cHJlc3Npb24sICcnKTtcbiAgfVxuXG4gIFVSSS5fcGFydHMgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcHJvdG9jb2w6IG51bGwsXG4gICAgICB1c2VybmFtZTogbnVsbCxcbiAgICAgIHBhc3N3b3JkOiBudWxsLFxuICAgICAgaG9zdG5hbWU6IG51bGwsXG4gICAgICB1cm46IG51bGwsXG4gICAgICBwb3J0OiBudWxsLFxuICAgICAgcGF0aDogbnVsbCxcbiAgICAgIHF1ZXJ5OiBudWxsLFxuICAgICAgZnJhZ21lbnQ6IG51bGwsXG4gICAgICAvLyBzdGF0ZVxuICAgICAgZHVwbGljYXRlUXVlcnlQYXJhbWV0ZXJzOiBVUkkuZHVwbGljYXRlUXVlcnlQYXJhbWV0ZXJzLFxuICAgICAgZXNjYXBlUXVlcnlTcGFjZTogVVJJLmVzY2FwZVF1ZXJ5U3BhY2VcbiAgICB9O1xuICB9O1xuICAvLyBzdGF0ZTogYWxsb3cgZHVwbGljYXRlIHF1ZXJ5IHBhcmFtZXRlcnMgKGE9MSZhPTEpXG4gIFVSSS5kdXBsaWNhdGVRdWVyeVBhcmFtZXRlcnMgPSBmYWxzZTtcbiAgLy8gc3RhdGU6IHJlcGxhY2VzICsgd2l0aCAlMjAgKHNwYWNlIGluIHF1ZXJ5IHN0cmluZ3MpXG4gIFVSSS5lc2NhcGVRdWVyeVNwYWNlID0gdHJ1ZTtcbiAgLy8gc3RhdGljIHByb3BlcnRpZXNcbiAgVVJJLnByb3RvY29sX2V4cHJlc3Npb24gPSAvXlthLXpdW2EtejAtOS4rLV0qJC9pO1xuICBVUkkuaWRuX2V4cHJlc3Npb24gPSAvW15hLXowLTlcXC4tXS9pO1xuICBVUkkucHVueWNvZGVfZXhwcmVzc2lvbiA9IC8oeG4tLSkvaTtcbiAgLy8gd2VsbCwgMzMzLjQ0NC41NTUuNjY2IG1hdGNoZXMsIGJ1dCBpdCBzdXJlIGFpbid0IG5vIElQdjQgLSBkbyB3ZSBjYXJlP1xuICBVUkkuaXA0X2V4cHJlc3Npb24gPSAvXlxcZHsxLDN9XFwuXFxkezEsM31cXC5cXGR7MSwzfVxcLlxcZHsxLDN9JC87XG4gIC8vIGNyZWRpdHMgdG8gUmljaCBCcm93blxuICAvLyBzb3VyY2U6IGh0dHA6Ly9mb3J1bXMuaW50ZXJtYXBwZXIuY29tL3ZpZXd0b3BpYy5waHA/cD0xMDk2IzEwOTZcbiAgLy8gc3BlY2lmaWNhdGlvbjogaHR0cDovL3d3dy5pZXRmLm9yZy9yZmMvcmZjNDI5MS50eHRcbiAgVVJJLmlwNl9leHByZXNzaW9uID0gL15cXHMqKCgoWzAtOUEtRmEtZl17MSw0fTopezd9KFswLTlBLUZhLWZdezEsNH18OikpfCgoWzAtOUEtRmEtZl17MSw0fTopezZ9KDpbMC05QS1GYS1mXXsxLDR9fCgoMjVbMC01XXwyWzAtNF1cXGR8MVxcZFxcZHxbMS05XT9cXGQpKFxcLigyNVswLTVdfDJbMC00XVxcZHwxXFxkXFxkfFsxLTldP1xcZCkpezN9KXw6KSl8KChbMC05QS1GYS1mXXsxLDR9Oil7NX0oKCg6WzAtOUEtRmEtZl17MSw0fSl7MSwyfSl8OigoMjVbMC01XXwyWzAtNF1cXGR8MVxcZFxcZHxbMS05XT9cXGQpKFxcLigyNVswLTVdfDJbMC00XVxcZHwxXFxkXFxkfFsxLTldP1xcZCkpezN9KXw6KSl8KChbMC05QS1GYS1mXXsxLDR9Oil7NH0oKCg6WzAtOUEtRmEtZl17MSw0fSl7MSwzfSl8KCg6WzAtOUEtRmEtZl17MSw0fSk/OigoMjVbMC01XXwyWzAtNF1cXGR8MVxcZFxcZHxbMS05XT9cXGQpKFxcLigyNVswLTVdfDJbMC00XVxcZHwxXFxkXFxkfFsxLTldP1xcZCkpezN9KSl8OikpfCgoWzAtOUEtRmEtZl17MSw0fTopezN9KCgoOlswLTlBLUZhLWZdezEsNH0pezEsNH0pfCgoOlswLTlBLUZhLWZdezEsNH0pezAsMn06KCgyNVswLTVdfDJbMC00XVxcZHwxXFxkXFxkfFsxLTldP1xcZCkoXFwuKDI1WzAtNV18MlswLTRdXFxkfDFcXGRcXGR8WzEtOV0/XFxkKSl7M30pKXw6KSl8KChbMC05QS1GYS1mXXsxLDR9Oil7Mn0oKCg6WzAtOUEtRmEtZl17MSw0fSl7MSw1fSl8KCg6WzAtOUEtRmEtZl17MSw0fSl7MCwzfTooKDI1WzAtNV18MlswLTRdXFxkfDFcXGRcXGR8WzEtOV0/XFxkKShcXC4oMjVbMC01XXwyWzAtNF1cXGR8MVxcZFxcZHxbMS05XT9cXGQpKXszfSkpfDopKXwoKFswLTlBLUZhLWZdezEsNH06KXsxfSgoKDpbMC05QS1GYS1mXXsxLDR9KXsxLDZ9KXwoKDpbMC05QS1GYS1mXXsxLDR9KXswLDR9OigoMjVbMC01XXwyWzAtNF1cXGR8MVxcZFxcZHxbMS05XT9cXGQpKFxcLigyNVswLTVdfDJbMC00XVxcZHwxXFxkXFxkfFsxLTldP1xcZCkpezN9KSl8OikpfCg6KCgoOlswLTlBLUZhLWZdezEsNH0pezEsN30pfCgoOlswLTlBLUZhLWZdezEsNH0pezAsNX06KCgyNVswLTVdfDJbMC00XVxcZHwxXFxkXFxkfFsxLTldP1xcZCkoXFwuKDI1WzAtNV18MlswLTRdXFxkfDFcXGRcXGR8WzEtOV0/XFxkKSl7M30pKXw6KSkpKCUuKyk/XFxzKiQvO1xuICAvLyBleHByZXNzaW9uIHVzZWQgaXMgXCJncnViZXIgcmV2aXNlZFwiIChAZ3J1YmVyIHYyKSBkZXRlcm1pbmVkIHRvIGJlIHRoZVxuICAvLyBiZXN0IHNvbHV0aW9uIGluIGEgcmVnZXgtZ29sZiB3ZSBkaWQgYSBjb3VwbGUgb2YgYWdlcyBhZ28gYXRcbiAgLy8gKiBodHRwOi8vbWF0aGlhc2J5bmVucy5iZS9kZW1vL3VybC1yZWdleFxuICAvLyAqIGh0dHA6Ly9yb2RuZXlyZWhtLmRlL3QvdXJsLXJlZ2V4Lmh0bWxcbiAgVVJJLmZpbmRfdXJpX2V4cHJlc3Npb24gPSAvXFxiKCg/OlthLXpdW1xcdy1dKzooPzpcXC97MSwzfXxbYS16MC05JV0pfHd3d1xcZHswLDN9Wy5dfFthLXowLTkuXFwtXStbLl1bYS16XXsyLDR9XFwvKSg/OlteXFxzKCk8Pl0rfFxcKChbXlxccygpPD5dK3woXFwoW15cXHMoKTw+XStcXCkpKSpcXCkpKyg/OlxcKChbXlxccygpPD5dK3woXFwoW15cXHMoKTw+XStcXCkpKSpcXCl8W15cXHNgISgpXFxbXFxde307OidcIi4sPD4/wqvCu+KAnOKAneKAmOKAmV0pKS9pZztcbiAgVVJJLmZpbmRVcmkgPSB7XG4gICAgLy8gdmFsaWQgXCJzY2hlbWU6Ly9cIiBvciBcInd3dy5cIlxuICAgIHN0YXJ0OiAvXFxiKD86KFthLXpdW2EtejAtOS4rLV0qOlxcL1xcLyl8d3d3XFwuKS9naSxcbiAgICAvLyBldmVyeXRoaW5nIHVwIHRvIHRoZSBuZXh0IHdoaXRlc3BhY2VcbiAgICBlbmQ6IC9bXFxzXFxyXFxuXXwkLyxcbiAgICAvLyB0cmltIHRyYWlsaW5nIHB1bmN0dWF0aW9uIGNhcHR1cmVkIGJ5IGVuZCBSZWdFeHBcbiAgICB0cmltOiAvW2AhKClcXFtcXF17fTs6J1wiLiw8Pj/Cq8K74oCc4oCd4oCe4oCY4oCZXSskL1xuICB9O1xuICAvLyBodHRwOi8vd3d3LmlhbmEub3JnL2Fzc2lnbm1lbnRzL3VyaS1zY2hlbWVzLmh0bWxcbiAgLy8gaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9MaXN0X29mX1RDUF9hbmRfVURQX3BvcnRfbnVtYmVycyNXZWxsLWtub3duX3BvcnRzXG4gIFVSSS5kZWZhdWx0UG9ydHMgPSB7XG4gICAgaHR0cDogJzgwJyxcbiAgICBodHRwczogJzQ0MycsXG4gICAgZnRwOiAnMjEnLFxuICAgIGdvcGhlcjogJzcwJyxcbiAgICB3czogJzgwJyxcbiAgICB3c3M6ICc0NDMnXG4gIH07XG4gIC8vIGFsbG93ZWQgaG9zdG5hbWUgY2hhcmFjdGVycyBhY2NvcmRpbmcgdG8gUkZDIDM5ODZcbiAgLy8gQUxQSEEgRElHSVQgXCItXCIgXCIuXCIgXCJfXCIgXCJ+XCIgXCIhXCIgXCIkXCIgXCImXCIgXCInXCIgXCIoXCIgXCIpXCIgXCIqXCIgXCIrXCIgXCIsXCIgXCI7XCIgXCI9XCIgJWVuY29kZWRcbiAgLy8gSSd2ZSBuZXZlciBzZWVuIGEgKG5vbi1JRE4pIGhvc3RuYW1lIG90aGVyIHRoYW46IEFMUEhBIERJR0lUIC4gLVxuICBVUkkuaW52YWxpZF9ob3N0bmFtZV9jaGFyYWN0ZXJzID0gL1teYS16QS1aMC05XFwuLV0vO1xuICAvLyBtYXAgRE9NIEVsZW1lbnRzIHRvIHRoZWlyIFVSSSBhdHRyaWJ1dGVcbiAgVVJJLmRvbUF0dHJpYnV0ZXMgPSB7XG4gICAgJ2EnOiAnaHJlZicsXG4gICAgJ2Jsb2NrcXVvdGUnOiAnY2l0ZScsXG4gICAgJ2xpbmsnOiAnaHJlZicsXG4gICAgJ2Jhc2UnOiAnaHJlZicsXG4gICAgJ3NjcmlwdCc6ICdzcmMnLFxuICAgICdmb3JtJzogJ2FjdGlvbicsXG4gICAgJ2ltZyc6ICdzcmMnLFxuICAgICdhcmVhJzogJ2hyZWYnLFxuICAgICdpZnJhbWUnOiAnc3JjJyxcbiAgICAnZW1iZWQnOiAnc3JjJyxcbiAgICAnc291cmNlJzogJ3NyYycsXG4gICAgJ3RyYWNrJzogJ3NyYycsXG4gICAgJ2lucHV0JzogJ3NyYycsIC8vIGJ1dCBvbmx5IGlmIHR5cGU9XCJpbWFnZVwiXG4gICAgJ2F1ZGlvJzogJ3NyYycsXG4gICAgJ3ZpZGVvJzogJ3NyYydcbiAgfTtcbiAgVVJJLmdldERvbUF0dHJpYnV0ZSA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICBpZiAoIW5vZGUgfHwgIW5vZGUubm9kZU5hbWUpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgdmFyIG5vZGVOYW1lID0gbm9kZS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgIC8vIDxpbnB1dD4gc2hvdWxkIG9ubHkgZXhwb3NlIHNyYyBmb3IgdHlwZT1cImltYWdlXCJcbiAgICBpZiAobm9kZU5hbWUgPT09ICdpbnB1dCcgJiYgbm9kZS50eXBlICE9PSAnaW1hZ2UnKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHJldHVybiBVUkkuZG9tQXR0cmlidXRlc1tub2RlTmFtZV07XG4gIH07XG5cbiAgZnVuY3Rpb24gZXNjYXBlRm9yRHVtYkZpcmVmb3gzNih2YWx1ZSkge1xuICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9tZWRpYWxpemUvVVJJLmpzL2lzc3Vlcy85MVxuICAgIHJldHVybiBlc2NhcGUodmFsdWUpO1xuICB9XG5cbiAgLy8gZW5jb2RpbmcgLyBkZWNvZGluZyBhY2NvcmRpbmcgdG8gUkZDMzk4NlxuICBmdW5jdGlvbiBzdHJpY3RFbmNvZGVVUklDb21wb25lbnQoc3RyaW5nKSB7XG4gICAgLy8gc2VlIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvZW5jb2RlVVJJQ29tcG9uZW50XG4gICAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudChzdHJpbmcpXG4gICAgICAucmVwbGFjZSgvWyEnKCkqXS9nLCBlc2NhcGVGb3JEdW1iRmlyZWZveDM2KVxuICAgICAgLnJlcGxhY2UoL1xcKi9nLCAnJTJBJyk7XG4gIH1cbiAgVVJJLmVuY29kZSA9IHN0cmljdEVuY29kZVVSSUNvbXBvbmVudDtcbiAgVVJJLmRlY29kZSA9IGRlY29kZVVSSUNvbXBvbmVudDtcbiAgVVJJLmlzbzg4NTkgPSBmdW5jdGlvbigpIHtcbiAgICBVUkkuZW5jb2RlID0gZXNjYXBlO1xuICAgIFVSSS5kZWNvZGUgPSB1bmVzY2FwZTtcbiAgfTtcbiAgVVJJLnVuaWNvZGUgPSBmdW5jdGlvbigpIHtcbiAgICBVUkkuZW5jb2RlID0gc3RyaWN0RW5jb2RlVVJJQ29tcG9uZW50O1xuICAgIFVSSS5kZWNvZGUgPSBkZWNvZGVVUklDb21wb25lbnQ7XG4gIH07XG4gIFVSSS5jaGFyYWN0ZXJzID0ge1xuICAgIHBhdGhuYW1lOiB7XG4gICAgICBlbmNvZGU6IHtcbiAgICAgICAgLy8gUkZDMzk4NiAyLjE6IEZvciBjb25zaXN0ZW5jeSwgVVJJIHByb2R1Y2VycyBhbmQgbm9ybWFsaXplcnMgc2hvdWxkXG4gICAgICAgIC8vIHVzZSB1cHBlcmNhc2UgaGV4YWRlY2ltYWwgZGlnaXRzIGZvciBhbGwgcGVyY2VudC1lbmNvZGluZ3MuXG4gICAgICAgIGV4cHJlc3Npb246IC8lKDI0fDI2fDJCfDJDfDNCfDNEfDNBfDQwKS9pZyxcbiAgICAgICAgbWFwOiB7XG4gICAgICAgICAgLy8gLS5ffiEnKCkqXG4gICAgICAgICAgJyUyNCc6ICckJyxcbiAgICAgICAgICAnJTI2JzogJyYnLFxuICAgICAgICAgICclMkInOiAnKycsXG4gICAgICAgICAgJyUyQyc6ICcsJyxcbiAgICAgICAgICAnJTNCJzogJzsnLFxuICAgICAgICAgICclM0QnOiAnPScsXG4gICAgICAgICAgJyUzQSc6ICc6JyxcbiAgICAgICAgICAnJTQwJzogJ0AnXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBkZWNvZGU6IHtcbiAgICAgICAgZXhwcmVzc2lvbjogL1tcXC9cXD8jXS9nLFxuICAgICAgICBtYXA6IHtcbiAgICAgICAgICAnLyc6ICclMkYnLFxuICAgICAgICAgICc/JzogJyUzRicsXG4gICAgICAgICAgJyMnOiAnJTIzJ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICByZXNlcnZlZDoge1xuICAgICAgZW5jb2RlOiB7XG4gICAgICAgIC8vIFJGQzM5ODYgMi4xOiBGb3IgY29uc2lzdGVuY3ksIFVSSSBwcm9kdWNlcnMgYW5kIG5vcm1hbGl6ZXJzIHNob3VsZFxuICAgICAgICAvLyB1c2UgdXBwZXJjYXNlIGhleGFkZWNpbWFsIGRpZ2l0cyBmb3IgYWxsIHBlcmNlbnQtZW5jb2RpbmdzLlxuICAgICAgICBleHByZXNzaW9uOiAvJSgyMXwyM3wyNHwyNnwyN3wyOHwyOXwyQXwyQnwyQ3wyRnwzQXwzQnwzRHwzRnw0MHw1Qnw1RCkvaWcsXG4gICAgICAgIG1hcDoge1xuICAgICAgICAgIC8vIGdlbi1kZWxpbXNcbiAgICAgICAgICAnJTNBJzogJzonLFxuICAgICAgICAgICclMkYnOiAnLycsXG4gICAgICAgICAgJyUzRic6ICc/JyxcbiAgICAgICAgICAnJTIzJzogJyMnLFxuICAgICAgICAgICclNUInOiAnWycsXG4gICAgICAgICAgJyU1RCc6ICddJyxcbiAgICAgICAgICAnJTQwJzogJ0AnLFxuICAgICAgICAgIC8vIHN1Yi1kZWxpbXNcbiAgICAgICAgICAnJTIxJzogJyEnLFxuICAgICAgICAgICclMjQnOiAnJCcsXG4gICAgICAgICAgJyUyNic6ICcmJyxcbiAgICAgICAgICAnJTI3JzogJ1xcJycsXG4gICAgICAgICAgJyUyOCc6ICcoJyxcbiAgICAgICAgICAnJTI5JzogJyknLFxuICAgICAgICAgICclMkEnOiAnKicsXG4gICAgICAgICAgJyUyQic6ICcrJyxcbiAgICAgICAgICAnJTJDJzogJywnLFxuICAgICAgICAgICclM0InOiAnOycsXG4gICAgICAgICAgJyUzRCc6ICc9J1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICB1cm5wYXRoOiB7XG4gICAgICAvLyBUaGUgY2hhcmFjdGVycyB1bmRlciBgZW5jb2RlYCBhcmUgdGhlIGNoYXJhY3RlcnMgY2FsbGVkIG91dCBieSBSRkMgMjE0MSBhcyBiZWluZyBhY2NlcHRhYmxlXG4gICAgICAvLyBmb3IgdXNhZ2UgaW4gYSBVUk4uIFJGQzIxNDEgYWxzbyBjYWxscyBvdXQgXCItXCIsIFwiLlwiLCBhbmQgXCJfXCIgYXMgYWNjZXB0YWJsZSBjaGFyYWN0ZXJzLCBidXRcbiAgICAgIC8vIHRoZXNlIGFyZW4ndCBlbmNvZGVkIGJ5IGVuY29kZVVSSUNvbXBvbmVudCwgc28gd2UgZG9uJ3QgaGF2ZSB0byBjYWxsIHRoZW0gb3V0IGhlcmUuIEFsc29cbiAgICAgIC8vIG5vdGUgdGhhdCB0aGUgY29sb24gY2hhcmFjdGVyIGlzIG5vdCBmZWF0dXJlZCBpbiB0aGUgZW5jb2RpbmcgbWFwOyB0aGlzIGlzIGJlY2F1c2UgVVJJLmpzXG4gICAgICAvLyBnaXZlcyB0aGUgY29sb25zIGluIFVSTnMgc2VtYW50aWMgbWVhbmluZyBhcyB0aGUgZGVsaW1pdGVycyBvZiBwYXRoIHNlZ2VtZW50cywgYW5kIHNvIGl0XG4gICAgICAvLyBzaG91bGQgbm90IGFwcGVhciB1bmVuY29kZWQgaW4gYSBzZWdtZW50IGl0c2VsZi5cbiAgICAgIC8vIFNlZSBhbHNvIHRoZSBub3RlIGFib3ZlIGFib3V0IFJGQzM5ODYgYW5kIGNhcGl0YWxhbGl6ZWQgaGV4IGRpZ2l0cy5cbiAgICAgIGVuY29kZToge1xuICAgICAgICBleHByZXNzaW9uOiAvJSgyMXwyNHwyN3wyOHwyOXwyQXwyQnwyQ3wzQnwzRHw0MCkvaWcsXG4gICAgICAgIG1hcDoge1xuICAgICAgICAgICclMjEnOiAnIScsXG4gICAgICAgICAgJyUyNCc6ICckJyxcbiAgICAgICAgICAnJTI3JzogJ1xcJycsXG4gICAgICAgICAgJyUyOCc6ICcoJyxcbiAgICAgICAgICAnJTI5JzogJyknLFxuICAgICAgICAgICclMkEnOiAnKicsXG4gICAgICAgICAgJyUyQic6ICcrJyxcbiAgICAgICAgICAnJTJDJzogJywnLFxuICAgICAgICAgICclM0InOiAnOycsXG4gICAgICAgICAgJyUzRCc6ICc9JyxcbiAgICAgICAgICAnJTQwJzogJ0AnXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICAvLyBUaGVzZSBjaGFyYWN0ZXJzIGFyZSB0aGUgY2hhcmFjdGVycyBjYWxsZWQgb3V0IGJ5IFJGQzIxNDEgYXMgXCJyZXNlcnZlZFwiIGNoYXJhY3RlcnMgdGhhdFxuICAgICAgLy8gc2hvdWxkIG5ldmVyIGFwcGVhciBpbiBhIFVSTiwgcGx1cyB0aGUgY29sb24gY2hhcmFjdGVyIChzZWUgbm90ZSBhYm92ZSkuXG4gICAgICBkZWNvZGU6IHtcbiAgICAgICAgZXhwcmVzc2lvbjogL1tcXC9cXD8jOl0vZyxcbiAgICAgICAgbWFwOiB7XG4gICAgICAgICAgJy8nOiAnJTJGJyxcbiAgICAgICAgICAnPyc6ICclM0YnLFxuICAgICAgICAgICcjJzogJyUyMycsXG4gICAgICAgICAgJzonOiAnJTNBJ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9O1xuICBVUkkuZW5jb2RlUXVlcnkgPSBmdW5jdGlvbihzdHJpbmcsIGVzY2FwZVF1ZXJ5U3BhY2UpIHtcbiAgICB2YXIgZXNjYXBlZCA9IFVSSS5lbmNvZGUoc3RyaW5nICsgJycpO1xuICAgIGlmIChlc2NhcGVRdWVyeVNwYWNlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGVzY2FwZVF1ZXJ5U3BhY2UgPSBVUkkuZXNjYXBlUXVlcnlTcGFjZTtcbiAgICB9XG5cbiAgICByZXR1cm4gZXNjYXBlUXVlcnlTcGFjZSA/IGVzY2FwZWQucmVwbGFjZSgvJTIwL2csICcrJykgOiBlc2NhcGVkO1xuICB9O1xuICBVUkkuZGVjb2RlUXVlcnkgPSBmdW5jdGlvbihzdHJpbmcsIGVzY2FwZVF1ZXJ5U3BhY2UpIHtcbiAgICBzdHJpbmcgKz0gJyc7XG4gICAgaWYgKGVzY2FwZVF1ZXJ5U3BhY2UgPT09IHVuZGVmaW5lZCkge1xuICAgICAgZXNjYXBlUXVlcnlTcGFjZSA9IFVSSS5lc2NhcGVRdWVyeVNwYWNlO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICByZXR1cm4gVVJJLmRlY29kZShlc2NhcGVRdWVyeVNwYWNlID8gc3RyaW5nLnJlcGxhY2UoL1xcKy9nLCAnJTIwJykgOiBzdHJpbmcpO1xuICAgIH0gY2F0Y2goZSkge1xuICAgICAgLy8gd2UncmUgbm90IGdvaW5nIHRvIG1lc3Mgd2l0aCB3ZWlyZCBlbmNvZGluZ3MsXG4gICAgICAvLyBnaXZlIHVwIGFuZCByZXR1cm4gdGhlIHVuZGVjb2RlZCBvcmlnaW5hbCBzdHJpbmdcbiAgICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vbWVkaWFsaXplL1VSSS5qcy9pc3N1ZXMvODdcbiAgICAgIC8vIHNlZSBodHRwczovL2dpdGh1Yi5jb20vbWVkaWFsaXplL1VSSS5qcy9pc3N1ZXMvOTJcbiAgICAgIHJldHVybiBzdHJpbmc7XG4gICAgfVxuICB9O1xuICAvLyBnZW5lcmF0ZSBlbmNvZGUvZGVjb2RlIHBhdGggZnVuY3Rpb25zXG4gIHZhciBfcGFydHMgPSB7J2VuY29kZSc6J2VuY29kZScsICdkZWNvZGUnOidkZWNvZGUnfTtcbiAgdmFyIF9wYXJ0O1xuICB2YXIgZ2VuZXJhdGVBY2Nlc3NvciA9IGZ1bmN0aW9uKF9ncm91cCwgX3BhcnQpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgICB0cnkge1xuICAgICAgICByZXR1cm4gVVJJW19wYXJ0XShzdHJpbmcgKyAnJykucmVwbGFjZShVUkkuY2hhcmFjdGVyc1tfZ3JvdXBdW19wYXJ0XS5leHByZXNzaW9uLCBmdW5jdGlvbihjKSB7XG4gICAgICAgICAgcmV0dXJuIFVSSS5jaGFyYWN0ZXJzW19ncm91cF1bX3BhcnRdLm1hcFtjXTtcbiAgICAgICAgfSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8vIHdlJ3JlIG5vdCBnb2luZyB0byBtZXNzIHdpdGggd2VpcmQgZW5jb2RpbmdzLFxuICAgICAgICAvLyBnaXZlIHVwIGFuZCByZXR1cm4gdGhlIHVuZGVjb2RlZCBvcmlnaW5hbCBzdHJpbmdcbiAgICAgICAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9tZWRpYWxpemUvVVJJLmpzL2lzc3Vlcy84N1xuICAgICAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL21lZGlhbGl6ZS9VUkkuanMvaXNzdWVzLzkyXG4gICAgICAgIHJldHVybiBzdHJpbmc7XG4gICAgICB9XG4gICAgfTtcbiAgfTtcblxuICBmb3IgKF9wYXJ0IGluIF9wYXJ0cykge1xuICAgIFVSSVtfcGFydCArICdQYXRoU2VnbWVudCddID0gZ2VuZXJhdGVBY2Nlc3NvcigncGF0aG5hbWUnLCBfcGFydHNbX3BhcnRdKTtcbiAgICBVUklbX3BhcnQgKyAnVXJuUGF0aFNlZ21lbnQnXSA9IGdlbmVyYXRlQWNjZXNzb3IoJ3VybnBhdGgnLCBfcGFydHNbX3BhcnRdKTtcbiAgfVxuXG4gIHZhciBnZW5lcmF0ZVNlZ21lbnRlZFBhdGhGdW5jdGlvbiA9IGZ1bmN0aW9uKF9zZXAsIF9jb2RpbmdGdW5jTmFtZSwgX2lubmVyQ29kaW5nRnVuY05hbWUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgICAvLyBXaHkgcGFzcyBpbiBuYW1lcyBvZiBmdW5jdGlvbnMsIHJhdGhlciB0aGFuIHRoZSBmdW5jdGlvbiBvYmplY3RzIHRoZW1zZWx2ZXM/IFRoZVxuICAgICAgLy8gZGVmaW5pdGlvbnMgb2Ygc29tZSBmdW5jdGlvbnMgKGJ1dCBpbiBwYXJ0aWN1bGFyLCBVUkkuZGVjb2RlKSB3aWxsIG9jY2FzaW9uYWxseSBjaGFuZ2UgZHVlXG4gICAgICAvLyB0byBVUkkuanMgaGF2aW5nIElTTzg4NTkgYW5kIFVuaWNvZGUgbW9kZXMuIFBhc3NpbmcgaW4gdGhlIG5hbWUgYW5kIGdldHRpbmcgaXQgd2lsbCBlbnN1cmVcbiAgICAgIC8vIHRoYXQgdGhlIGZ1bmN0aW9ucyB3ZSB1c2UgaGVyZSBhcmUgXCJmcmVzaFwiLlxuICAgICAgdmFyIGFjdHVhbENvZGluZ0Z1bmM7XG4gICAgICBpZiAoIV9pbm5lckNvZGluZ0Z1bmNOYW1lKSB7XG4gICAgICAgIGFjdHVhbENvZGluZ0Z1bmMgPSBVUklbX2NvZGluZ0Z1bmNOYW1lXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFjdHVhbENvZGluZ0Z1bmMgPSBmdW5jdGlvbihzdHJpbmcpIHtcbiAgICAgICAgICByZXR1cm4gVVJJW19jb2RpbmdGdW5jTmFtZV0oVVJJW19pbm5lckNvZGluZ0Z1bmNOYW1lXShzdHJpbmcpKTtcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgdmFyIHNlZ21lbnRzID0gKHN0cmluZyArICcnKS5zcGxpdChfc2VwKTtcblxuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IHNlZ21lbnRzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHNlZ21lbnRzW2ldID0gYWN0dWFsQ29kaW5nRnVuYyhzZWdtZW50c1tpXSk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzZWdtZW50cy5qb2luKF9zZXApO1xuICAgIH07XG4gIH07XG5cbiAgLy8gVGhpcyB0YWtlcyBwbGFjZSBvdXRzaWRlIHRoZSBhYm92ZSBsb29wIGJlY2F1c2Ugd2UgZG9uJ3Qgd2FudCwgZS5nLiwgZW5jb2RlVXJuUGF0aCBmdW5jdGlvbnMuXG4gIFVSSS5kZWNvZGVQYXRoID0gZ2VuZXJhdGVTZWdtZW50ZWRQYXRoRnVuY3Rpb24oJy8nLCAnZGVjb2RlUGF0aFNlZ21lbnQnKTtcbiAgVVJJLmRlY29kZVVyblBhdGggPSBnZW5lcmF0ZVNlZ21lbnRlZFBhdGhGdW5jdGlvbignOicsICdkZWNvZGVVcm5QYXRoU2VnbWVudCcpO1xuICBVUkkucmVjb2RlUGF0aCA9IGdlbmVyYXRlU2VnbWVudGVkUGF0aEZ1bmN0aW9uKCcvJywgJ2VuY29kZVBhdGhTZWdtZW50JywgJ2RlY29kZScpO1xuICBVUkkucmVjb2RlVXJuUGF0aCA9IGdlbmVyYXRlU2VnbWVudGVkUGF0aEZ1bmN0aW9uKCc6JywgJ2VuY29kZVVyblBhdGhTZWdtZW50JywgJ2RlY29kZScpO1xuXG4gIFVSSS5lbmNvZGVSZXNlcnZlZCA9IGdlbmVyYXRlQWNjZXNzb3IoJ3Jlc2VydmVkJywgJ2VuY29kZScpO1xuXG4gIFVSSS5wYXJzZSA9IGZ1bmN0aW9uKHN0cmluZywgcGFydHMpIHtcbiAgICB2YXIgcG9zO1xuICAgIGlmICghcGFydHMpIHtcbiAgICAgIHBhcnRzID0ge307XG4gICAgfVxuICAgIC8vIFtwcm90b2NvbFwiOi8vXCJbdXNlcm5hbWVbXCI6XCJwYXNzd29yZF1cIkBcIl1ob3N0bmFtZVtcIjpcInBvcnRdXCIvXCI/XVtwYXRoXVtcIj9cInF1ZXJ5c3RyaW5nXVtcIiNcImZyYWdtZW50XVxuXG4gICAgLy8gZXh0cmFjdCBmcmFnbWVudFxuICAgIHBvcyA9IHN0cmluZy5pbmRleE9mKCcjJyk7XG4gICAgaWYgKHBvcyA+IC0xKSB7XG4gICAgICAvLyBlc2NhcGluZz9cbiAgICAgIHBhcnRzLmZyYWdtZW50ID0gc3RyaW5nLnN1YnN0cmluZyhwb3MgKyAxKSB8fCBudWxsO1xuICAgICAgc3RyaW5nID0gc3RyaW5nLnN1YnN0cmluZygwLCBwb3MpO1xuICAgIH1cblxuICAgIC8vIGV4dHJhY3QgcXVlcnlcbiAgICBwb3MgPSBzdHJpbmcuaW5kZXhPZignPycpO1xuICAgIGlmIChwb3MgPiAtMSkge1xuICAgICAgLy8gZXNjYXBpbmc/XG4gICAgICBwYXJ0cy5xdWVyeSA9IHN0cmluZy5zdWJzdHJpbmcocG9zICsgMSkgfHwgbnVsbDtcbiAgICAgIHN0cmluZyA9IHN0cmluZy5zdWJzdHJpbmcoMCwgcG9zKTtcbiAgICB9XG5cbiAgICAvLyBleHRyYWN0IHByb3RvY29sXG4gICAgaWYgKHN0cmluZy5zdWJzdHJpbmcoMCwgMikgPT09ICcvLycpIHtcbiAgICAgIC8vIHJlbGF0aXZlLXNjaGVtZVxuICAgICAgcGFydHMucHJvdG9jb2wgPSBudWxsO1xuICAgICAgc3RyaW5nID0gc3RyaW5nLnN1YnN0cmluZygyKTtcbiAgICAgIC8vIGV4dHJhY3QgXCJ1c2VyOnBhc3NAaG9zdDpwb3J0XCJcbiAgICAgIHN0cmluZyA9IFVSSS5wYXJzZUF1dGhvcml0eShzdHJpbmcsIHBhcnRzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcG9zID0gc3RyaW5nLmluZGV4T2YoJzonKTtcbiAgICAgIGlmIChwb3MgPiAtMSkge1xuICAgICAgICBwYXJ0cy5wcm90b2NvbCA9IHN0cmluZy5zdWJzdHJpbmcoMCwgcG9zKSB8fCBudWxsO1xuICAgICAgICBpZiAocGFydHMucHJvdG9jb2wgJiYgIXBhcnRzLnByb3RvY29sLm1hdGNoKFVSSS5wcm90b2NvbF9leHByZXNzaW9uKSkge1xuICAgICAgICAgIC8vIDogbWF5IGJlIHdpdGhpbiB0aGUgcGF0aFxuICAgICAgICAgIHBhcnRzLnByb3RvY29sID0gdW5kZWZpbmVkO1xuICAgICAgICB9IGVsc2UgaWYgKHN0cmluZy5zdWJzdHJpbmcocG9zICsgMSwgcG9zICsgMykgPT09ICcvLycpIHtcbiAgICAgICAgICBzdHJpbmcgPSBzdHJpbmcuc3Vic3RyaW5nKHBvcyArIDMpO1xuXG4gICAgICAgICAgLy8gZXh0cmFjdCBcInVzZXI6cGFzc0Bob3N0OnBvcnRcIlxuICAgICAgICAgIHN0cmluZyA9IFVSSS5wYXJzZUF1dGhvcml0eShzdHJpbmcsIHBhcnRzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdHJpbmcgPSBzdHJpbmcuc3Vic3RyaW5nKHBvcyArIDEpO1xuICAgICAgICAgIHBhcnRzLnVybiA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyB3aGF0J3MgbGVmdCBtdXN0IGJlIHRoZSBwYXRoXG4gICAgcGFydHMucGF0aCA9IHN0cmluZztcblxuICAgIC8vIGFuZCB3ZSdyZSBkb25lXG4gICAgcmV0dXJuIHBhcnRzO1xuICB9O1xuICBVUkkucGFyc2VIb3N0ID0gZnVuY3Rpb24oc3RyaW5nLCBwYXJ0cykge1xuICAgIC8vIENvcHkgY2hyb21lLCBJRSwgb3BlcmEgYmFja3NsYXNoLWhhbmRsaW5nIGJlaGF2aW9yLlxuICAgIC8vIEJhY2sgc2xhc2hlcyBiZWZvcmUgdGhlIHF1ZXJ5IHN0cmluZyBnZXQgY29udmVydGVkIHRvIGZvcndhcmQgc2xhc2hlc1xuICAgIC8vIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL2pveWVudC9ub2RlL2Jsb2IvMzg2ZmQyNGY0OWIwZTlkMWE4YTA3NjU5MmE0MDQxNjhmYWVlY2MzNC9saWIvdXJsLmpzI0wxMTUtTDEyNFxuICAgIC8vIFNlZTogaHR0cHM6Ly9jb2RlLmdvb2dsZS5jb20vcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTI1OTE2XG4gICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL21lZGlhbGl6ZS9VUkkuanMvcHVsbC8yMzNcbiAgICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZSgvXFxcXC9nLCAnLycpO1xuXG4gICAgLy8gZXh0cmFjdCBob3N0OnBvcnRcbiAgICB2YXIgcG9zID0gc3RyaW5nLmluZGV4T2YoJy8nKTtcbiAgICB2YXIgYnJhY2tldFBvcztcbiAgICB2YXIgdDtcblxuICAgIGlmIChwb3MgPT09IC0xKSB7XG4gICAgICBwb3MgPSBzdHJpbmcubGVuZ3RoO1xuICAgIH1cblxuICAgIGlmIChzdHJpbmcuY2hhckF0KDApID09PSAnWycpIHtcbiAgICAgIC8vIElQdjYgaG9zdCAtIGh0dHA6Ly90b29scy5pZXRmLm9yZy9odG1sL2RyYWZ0LWlldGYtNm1hbi10ZXh0LWFkZHItcmVwcmVzZW50YXRpb24tMDQjc2VjdGlvbi02XG4gICAgICAvLyBJIGNsYWltIG1vc3QgY2xpZW50IHNvZnR3YXJlIGJyZWFrcyBvbiBJUHY2IGFueXdheXMuIFRvIHNpbXBsaWZ5IHRoaW5ncywgVVJJIG9ubHkgYWNjZXB0c1xuICAgICAgLy8gSVB2Nitwb3J0IGluIHRoZSBmb3JtYXQgWzIwMDE6ZGI4OjoxXTo4MCAoZm9yIHRoZSB0aW1lIGJlaW5nKVxuICAgICAgYnJhY2tldFBvcyA9IHN0cmluZy5pbmRleE9mKCddJyk7XG4gICAgICBwYXJ0cy5ob3N0bmFtZSA9IHN0cmluZy5zdWJzdHJpbmcoMSwgYnJhY2tldFBvcykgfHwgbnVsbDtcbiAgICAgIHBhcnRzLnBvcnQgPSBzdHJpbmcuc3Vic3RyaW5nKGJyYWNrZXRQb3MgKyAyLCBwb3MpIHx8IG51bGw7XG4gICAgICBpZiAocGFydHMucG9ydCA9PT0gJy8nKSB7XG4gICAgICAgIHBhcnRzLnBvcnQgPSBudWxsO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgZmlyc3RDb2xvbiA9IHN0cmluZy5pbmRleE9mKCc6Jyk7XG4gICAgICB2YXIgZmlyc3RTbGFzaCA9IHN0cmluZy5pbmRleE9mKCcvJyk7XG4gICAgICB2YXIgbmV4dENvbG9uID0gc3RyaW5nLmluZGV4T2YoJzonLCBmaXJzdENvbG9uICsgMSk7XG4gICAgICBpZiAobmV4dENvbG9uICE9PSAtMSAmJiAoZmlyc3RTbGFzaCA9PT0gLTEgfHwgbmV4dENvbG9uIDwgZmlyc3RTbGFzaCkpIHtcbiAgICAgICAgLy8gSVB2NiBob3N0IGNvbnRhaW5zIG11bHRpcGxlIGNvbG9ucyAtIGJ1dCBubyBwb3J0XG4gICAgICAgIC8vIHRoaXMgbm90YXRpb24gaXMgYWN0dWFsbHkgbm90IGFsbG93ZWQgYnkgUkZDIDM5ODYsIGJ1dCB3ZSdyZSBhIGxpYmVyYWwgcGFyc2VyXG4gICAgICAgIHBhcnRzLmhvc3RuYW1lID0gc3RyaW5nLnN1YnN0cmluZygwLCBwb3MpIHx8IG51bGw7XG4gICAgICAgIHBhcnRzLnBvcnQgPSBudWxsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdCA9IHN0cmluZy5zdWJzdHJpbmcoMCwgcG9zKS5zcGxpdCgnOicpO1xuICAgICAgICBwYXJ0cy5ob3N0bmFtZSA9IHRbMF0gfHwgbnVsbDtcbiAgICAgICAgcGFydHMucG9ydCA9IHRbMV0gfHwgbnVsbDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocGFydHMuaG9zdG5hbWUgJiYgc3RyaW5nLnN1YnN0cmluZyhwb3MpLmNoYXJBdCgwKSAhPT0gJy8nKSB7XG4gICAgICBwb3MrKztcbiAgICAgIHN0cmluZyA9ICcvJyArIHN0cmluZztcbiAgICB9XG5cbiAgICByZXR1cm4gc3RyaW5nLnN1YnN0cmluZyhwb3MpIHx8ICcvJztcbiAgfTtcbiAgVVJJLnBhcnNlQXV0aG9yaXR5ID0gZnVuY3Rpb24oc3RyaW5nLCBwYXJ0cykge1xuICAgIHN0cmluZyA9IFVSSS5wYXJzZVVzZXJpbmZvKHN0cmluZywgcGFydHMpO1xuICAgIHJldHVybiBVUkkucGFyc2VIb3N0KHN0cmluZywgcGFydHMpO1xuICB9O1xuICBVUkkucGFyc2VVc2VyaW5mbyA9IGZ1bmN0aW9uKHN0cmluZywgcGFydHMpIHtcbiAgICAvLyBleHRyYWN0IHVzZXJuYW1lOnBhc3N3b3JkXG4gICAgdmFyIGZpcnN0U2xhc2ggPSBzdHJpbmcuaW5kZXhPZignLycpO1xuICAgIHZhciBwb3MgPSBzdHJpbmcubGFzdEluZGV4T2YoJ0AnLCBmaXJzdFNsYXNoID4gLTEgPyBmaXJzdFNsYXNoIDogc3RyaW5nLmxlbmd0aCAtIDEpO1xuICAgIHZhciB0O1xuXG4gICAgLy8gYXV0aG9yaXR5QCBtdXN0IGNvbWUgYmVmb3JlIC9wYXRoXG4gICAgaWYgKHBvcyA+IC0xICYmIChmaXJzdFNsYXNoID09PSAtMSB8fCBwb3MgPCBmaXJzdFNsYXNoKSkge1xuICAgICAgdCA9IHN0cmluZy5zdWJzdHJpbmcoMCwgcG9zKS5zcGxpdCgnOicpO1xuICAgICAgcGFydHMudXNlcm5hbWUgPSB0WzBdID8gVVJJLmRlY29kZSh0WzBdKSA6IG51bGw7XG4gICAgICB0LnNoaWZ0KCk7XG4gICAgICBwYXJ0cy5wYXNzd29yZCA9IHRbMF0gPyBVUkkuZGVjb2RlKHQuam9pbignOicpKSA6IG51bGw7XG4gICAgICBzdHJpbmcgPSBzdHJpbmcuc3Vic3RyaW5nKHBvcyArIDEpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXJ0cy51c2VybmFtZSA9IG51bGw7XG4gICAgICBwYXJ0cy5wYXNzd29yZCA9IG51bGw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0cmluZztcbiAgfTtcbiAgVVJJLnBhcnNlUXVlcnkgPSBmdW5jdGlvbihzdHJpbmcsIGVzY2FwZVF1ZXJ5U3BhY2UpIHtcbiAgICBpZiAoIXN0cmluZykge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cblxuICAgIC8vIHRocm93IG91dCB0aGUgZnVua3kgYnVzaW5lc3MgLSBcIj9cIltuYW1lXCI9XCJ2YWx1ZVwiJlwiXStcbiAgICBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZSgvJisvZywgJyYnKS5yZXBsYWNlKC9eXFw/KiYqfCYrJC9nLCAnJyk7XG5cbiAgICBpZiAoIXN0cmluZykge1xuICAgICAgcmV0dXJuIHt9O1xuICAgIH1cblxuICAgIHZhciBpdGVtcyA9IHt9O1xuICAgIHZhciBzcGxpdHMgPSBzdHJpbmcuc3BsaXQoJyYnKTtcbiAgICB2YXIgbGVuZ3RoID0gc3BsaXRzLmxlbmd0aDtcbiAgICB2YXIgdiwgbmFtZSwgdmFsdWU7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICB2ID0gc3BsaXRzW2ldLnNwbGl0KCc9Jyk7XG4gICAgICBuYW1lID0gVVJJLmRlY29kZVF1ZXJ5KHYuc2hpZnQoKSwgZXNjYXBlUXVlcnlTcGFjZSk7XG4gICAgICAvLyBubyBcIj1cIiBpcyBudWxsIGFjY29yZGluZyB0byBodHRwOi8vZHZjcy53My5vcmcvaGcvdXJsL3Jhdy1maWxlL3RpcC9PdmVydmlldy5odG1sI2NvbGxlY3QtdXJsLXBhcmFtZXRlcnNcbiAgICAgIHZhbHVlID0gdi5sZW5ndGggPyBVUkkuZGVjb2RlUXVlcnkodi5qb2luKCc9JyksIGVzY2FwZVF1ZXJ5U3BhY2UpIDogbnVsbDtcblxuICAgICAgaWYgKGhhc093bi5jYWxsKGl0ZW1zLCBuYW1lKSkge1xuICAgICAgICBpZiAodHlwZW9mIGl0ZW1zW25hbWVdID09PSAnc3RyaW5nJyB8fCBpdGVtc1tuYW1lXSA9PT0gbnVsbCkge1xuICAgICAgICAgIGl0ZW1zW25hbWVdID0gW2l0ZW1zW25hbWVdXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGl0ZW1zW25hbWVdLnB1c2godmFsdWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaXRlbXNbbmFtZV0gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gaXRlbXM7XG4gIH07XG5cbiAgVVJJLmJ1aWxkID0gZnVuY3Rpb24ocGFydHMpIHtcbiAgICB2YXIgdCA9ICcnO1xuXG4gICAgaWYgKHBhcnRzLnByb3RvY29sKSB7XG4gICAgICB0ICs9IHBhcnRzLnByb3RvY29sICsgJzonO1xuICAgIH1cblxuICAgIGlmICghcGFydHMudXJuICYmICh0IHx8IHBhcnRzLmhvc3RuYW1lKSkge1xuICAgICAgdCArPSAnLy8nO1xuICAgIH1cblxuICAgIHQgKz0gKFVSSS5idWlsZEF1dGhvcml0eShwYXJ0cykgfHwgJycpO1xuXG4gICAgaWYgKHR5cGVvZiBwYXJ0cy5wYXRoID09PSAnc3RyaW5nJykge1xuICAgICAgaWYgKHBhcnRzLnBhdGguY2hhckF0KDApICE9PSAnLycgJiYgdHlwZW9mIHBhcnRzLmhvc3RuYW1lID09PSAnc3RyaW5nJykge1xuICAgICAgICB0ICs9ICcvJztcbiAgICAgIH1cblxuICAgICAgdCArPSBwYXJ0cy5wYXRoO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgcGFydHMucXVlcnkgPT09ICdzdHJpbmcnICYmIHBhcnRzLnF1ZXJ5KSB7XG4gICAgICB0ICs9ICc/JyArIHBhcnRzLnF1ZXJ5O1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgcGFydHMuZnJhZ21lbnQgPT09ICdzdHJpbmcnICYmIHBhcnRzLmZyYWdtZW50KSB7XG4gICAgICB0ICs9ICcjJyArIHBhcnRzLmZyYWdtZW50O1xuICAgIH1cbiAgICByZXR1cm4gdDtcbiAgfTtcbiAgVVJJLmJ1aWxkSG9zdCA9IGZ1bmN0aW9uKHBhcnRzKSB7XG4gICAgdmFyIHQgPSAnJztcblxuICAgIGlmICghcGFydHMuaG9zdG5hbWUpIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9IGVsc2UgaWYgKFVSSS5pcDZfZXhwcmVzc2lvbi50ZXN0KHBhcnRzLmhvc3RuYW1lKSkge1xuICAgICAgdCArPSAnWycgKyBwYXJ0cy5ob3N0bmFtZSArICddJztcbiAgICB9IGVsc2Uge1xuICAgICAgdCArPSBwYXJ0cy5ob3N0bmFtZTtcbiAgICB9XG5cbiAgICBpZiAocGFydHMucG9ydCkge1xuICAgICAgdCArPSAnOicgKyBwYXJ0cy5wb3J0O1xuICAgIH1cblxuICAgIHJldHVybiB0O1xuICB9O1xuICBVUkkuYnVpbGRBdXRob3JpdHkgPSBmdW5jdGlvbihwYXJ0cykge1xuICAgIHJldHVybiBVUkkuYnVpbGRVc2VyaW5mbyhwYXJ0cykgKyBVUkkuYnVpbGRIb3N0KHBhcnRzKTtcbiAgfTtcbiAgVVJJLmJ1aWxkVXNlcmluZm8gPSBmdW5jdGlvbihwYXJ0cykge1xuICAgIHZhciB0ID0gJyc7XG5cbiAgICBpZiAocGFydHMudXNlcm5hbWUpIHtcbiAgICAgIHQgKz0gVVJJLmVuY29kZShwYXJ0cy51c2VybmFtZSk7XG5cbiAgICAgIGlmIChwYXJ0cy5wYXNzd29yZCkge1xuICAgICAgICB0ICs9ICc6JyArIFVSSS5lbmNvZGUocGFydHMucGFzc3dvcmQpO1xuICAgICAgfVxuXG4gICAgICB0ICs9ICdAJztcbiAgICB9XG5cbiAgICByZXR1cm4gdDtcbiAgfTtcbiAgVVJJLmJ1aWxkUXVlcnkgPSBmdW5jdGlvbihkYXRhLCBkdXBsaWNhdGVRdWVyeVBhcmFtZXRlcnMsIGVzY2FwZVF1ZXJ5U3BhY2UpIHtcbiAgICAvLyBhY2NvcmRpbmcgdG8gaHR0cDovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzk4NiBvciBodHRwOi8vbGFicy5hcGFjaGUub3JnL3dlYmFyY2gvdXJpL3JmYy9yZmMzOTg2Lmh0bWxcbiAgICAvLyBiZWluZyDCuy0uX34hJCYnKCkqKyw7PTpALz/CqyAlSEVYIGFuZCBhbG51bSBhcmUgYWxsb3dlZFxuICAgIC8vIHRoZSBSRkMgZXhwbGljaXRseSBzdGF0ZXMgPy9mb28gYmVpbmcgYSB2YWxpZCB1c2UgY2FzZSwgbm8gbWVudGlvbiBvZiBwYXJhbWV0ZXIgc3ludGF4IVxuICAgIC8vIFVSSS5qcyB0cmVhdHMgdGhlIHF1ZXJ5IHN0cmluZyBhcyBiZWluZyBhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWRcbiAgICAvLyBzZWUgaHR0cDovL3d3dy53My5vcmcvVFIvUkVDLWh0bWw0MC9pbnRlcmFjdC9mb3Jtcy5odG1sI2Zvcm0tY29udGVudC10eXBlXG5cbiAgICB2YXIgdCA9ICcnO1xuICAgIHZhciB1bmlxdWUsIGtleSwgaSwgbGVuZ3RoO1xuICAgIGZvciAoa2V5IGluIGRhdGEpIHtcbiAgICAgIGlmIChoYXNPd24uY2FsbChkYXRhLCBrZXkpICYmIGtleSkge1xuICAgICAgICBpZiAoaXNBcnJheShkYXRhW2tleV0pKSB7XG4gICAgICAgICAgdW5pcXVlID0ge307XG4gICAgICAgICAgZm9yIChpID0gMCwgbGVuZ3RoID0gZGF0YVtrZXldLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoZGF0YVtrZXldW2ldICE9PSB1bmRlZmluZWQgJiYgdW5pcXVlW2RhdGFba2V5XVtpXSArICcnXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgIHQgKz0gJyYnICsgVVJJLmJ1aWxkUXVlcnlQYXJhbWV0ZXIoa2V5LCBkYXRhW2tleV1baV0sIGVzY2FwZVF1ZXJ5U3BhY2UpO1xuICAgICAgICAgICAgICBpZiAoZHVwbGljYXRlUXVlcnlQYXJhbWV0ZXJzICE9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgdW5pcXVlW2RhdGFba2V5XVtpXSArICcnXSA9IHRydWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoZGF0YVtrZXldICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB0ICs9ICcmJyArIFVSSS5idWlsZFF1ZXJ5UGFyYW1ldGVyKGtleSwgZGF0YVtrZXldLCBlc2NhcGVRdWVyeVNwYWNlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0LnN1YnN0cmluZygxKTtcbiAgfTtcbiAgVVJJLmJ1aWxkUXVlcnlQYXJhbWV0ZXIgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSwgZXNjYXBlUXVlcnlTcGFjZSkge1xuICAgIC8vIGh0dHA6Ly93d3cudzMub3JnL1RSL1JFQy1odG1sNDAvaW50ZXJhY3QvZm9ybXMuaHRtbCNmb3JtLWNvbnRlbnQtdHlwZSAtLSBhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWRcbiAgICAvLyBkb24ndCBhcHBlbmQgXCI9XCIgZm9yIG51bGwgdmFsdWVzLCBhY2NvcmRpbmcgdG8gaHR0cDovL2R2Y3MudzMub3JnL2hnL3VybC9yYXctZmlsZS90aXAvT3ZlcnZpZXcuaHRtbCN1cmwtcGFyYW1ldGVyLXNlcmlhbGl6YXRpb25cbiAgICByZXR1cm4gVVJJLmVuY29kZVF1ZXJ5KG5hbWUsIGVzY2FwZVF1ZXJ5U3BhY2UpICsgKHZhbHVlICE9PSBudWxsID8gJz0nICsgVVJJLmVuY29kZVF1ZXJ5KHZhbHVlLCBlc2NhcGVRdWVyeVNwYWNlKSA6ICcnKTtcbiAgfTtcblxuICBVUkkuYWRkUXVlcnkgPSBmdW5jdGlvbihkYXRhLCBuYW1lLCB2YWx1ZSkge1xuICAgIGlmICh0eXBlb2YgbmFtZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGZvciAodmFyIGtleSBpbiBuYW1lKSB7XG4gICAgICAgIGlmIChoYXNPd24uY2FsbChuYW1lLCBrZXkpKSB7XG4gICAgICAgICAgVVJJLmFkZFF1ZXJ5KGRhdGEsIGtleSwgbmFtZVtrZXldKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIG5hbWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICBpZiAoZGF0YVtuYW1lXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGRhdGFbbmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZGF0YVtuYW1lXSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgZGF0YVtuYW1lXSA9IFtkYXRhW25hbWVdXTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFpc0FycmF5KHZhbHVlKSkge1xuICAgICAgICB2YWx1ZSA9IFt2YWx1ZV07XG4gICAgICB9XG5cbiAgICAgIGRhdGFbbmFtZV0gPSAoZGF0YVtuYW1lXSB8fCBbXSkuY29uY2F0KHZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVVJJLmFkZFF1ZXJ5KCkgYWNjZXB0cyBhbiBvYmplY3QsIHN0cmluZyBhcyB0aGUgbmFtZSBwYXJhbWV0ZXInKTtcbiAgICB9XG4gIH07XG4gIFVSSS5yZW1vdmVRdWVyeSA9IGZ1bmN0aW9uKGRhdGEsIG5hbWUsIHZhbHVlKSB7XG4gICAgdmFyIGksIGxlbmd0aCwga2V5O1xuXG4gICAgaWYgKGlzQXJyYXkobmFtZSkpIHtcbiAgICAgIGZvciAoaSA9IDAsIGxlbmd0aCA9IG5hbWUubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZGF0YVtuYW1lW2ldXSA9IHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGdldFR5cGUobmFtZSkgPT09ICdSZWdFeHAnKSB7XG4gICAgICBmb3IgKGtleSBpbiBkYXRhKSB7XG4gICAgICAgIGlmIChuYW1lLnRlc3Qoa2V5KSkge1xuICAgICAgICAgIGRhdGFba2V5XSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIG5hbWUgPT09ICdvYmplY3QnKSB7XG4gICAgICBmb3IgKGtleSBpbiBuYW1lKSB7XG4gICAgICAgIGlmIChoYXNPd24uY2FsbChuYW1lLCBrZXkpKSB7XG4gICAgICAgICAgVVJJLnJlbW92ZVF1ZXJ5KGRhdGEsIGtleSwgbmFtZVtrZXldKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIG5hbWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICBpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpZiAoZ2V0VHlwZSh2YWx1ZSkgPT09ICdSZWdFeHAnKSB7XG4gICAgICAgICAgaWYgKCFpc0FycmF5KGRhdGFbbmFtZV0pICYmIHZhbHVlLnRlc3QoZGF0YVtuYW1lXSkpIHtcbiAgICAgICAgICAgIGRhdGFbbmFtZV0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRhdGFbbmFtZV0gPSBmaWx0ZXJBcnJheVZhbHVlcyhkYXRhW25hbWVdLCB2YWx1ZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGRhdGFbbmFtZV0gPT09IFN0cmluZyh2YWx1ZSkgJiYgKCFpc0FycmF5KHZhbHVlKSB8fCB2YWx1ZS5sZW5ndGggPT09IDEpKSB7XG4gICAgICAgICAgZGF0YVtuYW1lXSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfSBlbHNlIGlmIChpc0FycmF5KGRhdGFbbmFtZV0pKSB7XG4gICAgICAgICAgZGF0YVtuYW1lXSA9IGZpbHRlckFycmF5VmFsdWVzKGRhdGFbbmFtZV0sIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGF0YVtuYW1lXSA9IHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVVJJLnJlbW92ZVF1ZXJ5KCkgYWNjZXB0cyBhbiBvYmplY3QsIHN0cmluZywgUmVnRXhwIGFzIHRoZSBmaXJzdCBwYXJhbWV0ZXInKTtcbiAgICB9XG4gIH07XG4gIFVSSS5oYXNRdWVyeSA9IGZ1bmN0aW9uKGRhdGEsIG5hbWUsIHZhbHVlLCB3aXRoaW5BcnJheSkge1xuICAgIHN3aXRjaCAoZ2V0VHlwZShuYW1lKSkge1xuICAgICAgY2FzZSAnU3RyaW5nJzpcbiAgICAgICAgLy8gTm90aGluZyB0byBkbyBoZXJlXG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdSZWdFeHAnOlxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gZGF0YSkge1xuICAgICAgICAgIGlmIChoYXNPd24uY2FsbChkYXRhLCBrZXkpKSB7XG4gICAgICAgICAgICBpZiAobmFtZS50ZXN0KGtleSkgJiYgKHZhbHVlID09PSB1bmRlZmluZWQgfHwgVVJJLmhhc1F1ZXJ5KGRhdGEsIGtleSwgdmFsdWUpKSkge1xuICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgIGNhc2UgJ09iamVjdCc6XG4gICAgICAgIGZvciAodmFyIF9rZXkgaW4gbmFtZSkge1xuICAgICAgICAgIGlmIChoYXNPd24uY2FsbChuYW1lLCBfa2V5KSkge1xuICAgICAgICAgICAgaWYgKCFVUkkuaGFzUXVlcnkoZGF0YSwgX2tleSwgbmFtZVtfa2V5XSkpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdVUkkuaGFzUXVlcnkoKSBhY2NlcHRzIGEgc3RyaW5nLCByZWd1bGFyIGV4cHJlc3Npb24gb3Igb2JqZWN0IGFzIHRoZSBuYW1lIHBhcmFtZXRlcicpO1xuICAgIH1cblxuICAgIHN3aXRjaCAoZ2V0VHlwZSh2YWx1ZSkpIHtcbiAgICAgIGNhc2UgJ1VuZGVmaW5lZCc6XG4gICAgICAgIC8vIHRydWUgaWYgZXhpc3RzIChidXQgbWF5IGJlIGVtcHR5KVxuICAgICAgICByZXR1cm4gbmFtZSBpbiBkYXRhOyAvLyBkYXRhW25hbWVdICE9PSB1bmRlZmluZWQ7XG5cbiAgICAgIGNhc2UgJ0Jvb2xlYW4nOlxuICAgICAgICAvLyB0cnVlIGlmIGV4aXN0cyBhbmQgbm9uLWVtcHR5XG4gICAgICAgIHZhciBfYm9vbHkgPSBCb29sZWFuKGlzQXJyYXkoZGF0YVtuYW1lXSkgPyBkYXRhW25hbWVdLmxlbmd0aCA6IGRhdGFbbmFtZV0pO1xuICAgICAgICByZXR1cm4gdmFsdWUgPT09IF9ib29seTtcblxuICAgICAgY2FzZSAnRnVuY3Rpb24nOlxuICAgICAgICAvLyBhbGxvdyBjb21wbGV4IGNvbXBhcmlzb25cbiAgICAgICAgcmV0dXJuICEhdmFsdWUoZGF0YVtuYW1lXSwgbmFtZSwgZGF0YSk7XG5cbiAgICAgIGNhc2UgJ0FycmF5JzpcbiAgICAgICAgaWYgKCFpc0FycmF5KGRhdGFbbmFtZV0pKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIG9wID0gd2l0aGluQXJyYXkgPyBhcnJheUNvbnRhaW5zIDogYXJyYXlzRXF1YWw7XG4gICAgICAgIHJldHVybiBvcChkYXRhW25hbWVdLCB2YWx1ZSk7XG5cbiAgICAgIGNhc2UgJ1JlZ0V4cCc6XG4gICAgICAgIGlmICghaXNBcnJheShkYXRhW25hbWVdKSkge1xuICAgICAgICAgIHJldHVybiBCb29sZWFuKGRhdGFbbmFtZV0gJiYgZGF0YVtuYW1lXS5tYXRjaCh2YWx1ZSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF3aXRoaW5BcnJheSkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBhcnJheUNvbnRhaW5zKGRhdGFbbmFtZV0sIHZhbHVlKTtcblxuICAgICAgY2FzZSAnTnVtYmVyJzpcbiAgICAgICAgdmFsdWUgPSBTdHJpbmcodmFsdWUpO1xuICAgICAgICAvKiBmYWxscyB0aHJvdWdoICovXG4gICAgICBjYXNlICdTdHJpbmcnOlxuICAgICAgICBpZiAoIWlzQXJyYXkoZGF0YVtuYW1lXSkpIHtcbiAgICAgICAgICByZXR1cm4gZGF0YVtuYW1lXSA9PT0gdmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXdpdGhpbkFycmF5KSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGFycmF5Q29udGFpbnMoZGF0YVtuYW1lXSwgdmFsdWUpO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdVUkkuaGFzUXVlcnkoKSBhY2NlcHRzIHVuZGVmaW5lZCwgYm9vbGVhbiwgc3RyaW5nLCBudW1iZXIsIFJlZ0V4cCwgRnVuY3Rpb24gYXMgdGhlIHZhbHVlIHBhcmFtZXRlcicpO1xuICAgIH1cbiAgfTtcblxuXG4gIFVSSS5jb21tb25QYXRoID0gZnVuY3Rpb24ob25lLCB0d28pIHtcbiAgICB2YXIgbGVuZ3RoID0gTWF0aC5taW4ob25lLmxlbmd0aCwgdHdvLmxlbmd0aCk7XG4gICAgdmFyIHBvcztcblxuICAgIC8vIGZpbmQgZmlyc3Qgbm9uLW1hdGNoaW5nIGNoYXJhY3RlclxuICAgIGZvciAocG9zID0gMDsgcG9zIDwgbGVuZ3RoOyBwb3MrKykge1xuICAgICAgaWYgKG9uZS5jaGFyQXQocG9zKSAhPT0gdHdvLmNoYXJBdChwb3MpKSB7XG4gICAgICAgIHBvcy0tO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocG9zIDwgMSkge1xuICAgICAgcmV0dXJuIG9uZS5jaGFyQXQoMCkgPT09IHR3by5jaGFyQXQoMCkgJiYgb25lLmNoYXJBdCgwKSA9PT0gJy8nID8gJy8nIDogJyc7XG4gICAgfVxuXG4gICAgLy8gcmV2ZXJ0IHRvIGxhc3QgL1xuICAgIGlmIChvbmUuY2hhckF0KHBvcykgIT09ICcvJyB8fCB0d28uY2hhckF0KHBvcykgIT09ICcvJykge1xuICAgICAgcG9zID0gb25lLnN1YnN0cmluZygwLCBwb3MpLmxhc3RJbmRleE9mKCcvJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG9uZS5zdWJzdHJpbmcoMCwgcG9zICsgMSk7XG4gIH07XG5cbiAgVVJJLndpdGhpblN0cmluZyA9IGZ1bmN0aW9uKHN0cmluZywgY2FsbGJhY2ssIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zIHx8IChvcHRpb25zID0ge30pO1xuICAgIHZhciBfc3RhcnQgPSBvcHRpb25zLnN0YXJ0IHx8IFVSSS5maW5kVXJpLnN0YXJ0O1xuICAgIHZhciBfZW5kID0gb3B0aW9ucy5lbmQgfHwgVVJJLmZpbmRVcmkuZW5kO1xuICAgIHZhciBfdHJpbSA9IG9wdGlvbnMudHJpbSB8fCBVUkkuZmluZFVyaS50cmltO1xuICAgIHZhciBfYXR0cmlidXRlT3BlbiA9IC9bYS16MC05LV09W1wiJ10/JC9pO1xuXG4gICAgX3N0YXJ0Lmxhc3RJbmRleCA9IDA7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIHZhciBtYXRjaCA9IF9zdGFydC5leGVjKHN0cmluZyk7XG4gICAgICBpZiAoIW1hdGNoKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICB2YXIgc3RhcnQgPSBtYXRjaC5pbmRleDtcbiAgICAgIGlmIChvcHRpb25zLmlnbm9yZUh0bWwpIHtcbiAgICAgICAgLy8gYXR0cmlidXQoZT1bXCInXT8kKVxuICAgICAgICB2YXIgYXR0cmlidXRlT3BlbiA9IHN0cmluZy5zbGljZShNYXRoLm1heChzdGFydCAtIDMsIDApLCBzdGFydCk7XG4gICAgICAgIGlmIChhdHRyaWJ1dGVPcGVuICYmIF9hdHRyaWJ1dGVPcGVuLnRlc3QoYXR0cmlidXRlT3BlbikpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB2YXIgZW5kID0gc3RhcnQgKyBzdHJpbmcuc2xpY2Uoc3RhcnQpLnNlYXJjaChfZW5kKTtcbiAgICAgIHZhciBzbGljZSA9IHN0cmluZy5zbGljZShzdGFydCwgZW5kKS5yZXBsYWNlKF90cmltLCAnJyk7XG4gICAgICBpZiAob3B0aW9ucy5pZ25vcmUgJiYgb3B0aW9ucy5pZ25vcmUudGVzdChzbGljZSkpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGVuZCA9IHN0YXJ0ICsgc2xpY2UubGVuZ3RoO1xuICAgICAgdmFyIHJlc3VsdCA9IGNhbGxiYWNrKHNsaWNlLCBzdGFydCwgZW5kLCBzdHJpbmcpO1xuICAgICAgc3RyaW5nID0gc3RyaW5nLnNsaWNlKDAsIHN0YXJ0KSArIHJlc3VsdCArIHN0cmluZy5zbGljZShlbmQpO1xuICAgICAgX3N0YXJ0Lmxhc3RJbmRleCA9IHN0YXJ0ICsgcmVzdWx0Lmxlbmd0aDtcbiAgICB9XG5cbiAgICBfc3RhcnQubGFzdEluZGV4ID0gMDtcbiAgICByZXR1cm4gc3RyaW5nO1xuICB9O1xuXG4gIFVSSS5lbnN1cmVWYWxpZEhvc3RuYW1lID0gZnVuY3Rpb24odikge1xuICAgIC8vIFRoZW9yZXRpY2FsbHkgVVJJcyBhbGxvdyBwZXJjZW50LWVuY29kaW5nIGluIEhvc3RuYW1lcyAoYWNjb3JkaW5nIHRvIFJGQyAzOTg2KVxuICAgIC8vIHRoZXkgYXJlIG5vdCBwYXJ0IG9mIEROUyBhbmQgdGhlcmVmb3JlIGlnbm9yZWQgYnkgVVJJLmpzXG5cbiAgICBpZiAodi5tYXRjaChVUkkuaW52YWxpZF9ob3N0bmFtZV9jaGFyYWN0ZXJzKSkge1xuICAgICAgLy8gdGVzdCBwdW55Y29kZVxuICAgICAgaWYgKCFwdW55Y29kZSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdIb3N0bmFtZSBcIicgKyB2ICsgJ1wiIGNvbnRhaW5zIGNoYXJhY3RlcnMgb3RoZXIgdGhhbiBbQS1aMC05Li1dIGFuZCBQdW55Y29kZS5qcyBpcyBub3QgYXZhaWxhYmxlJyk7XG4gICAgICB9XG5cbiAgICAgIGlmIChwdW55Y29kZS50b0FTQ0lJKHYpLm1hdGNoKFVSSS5pbnZhbGlkX2hvc3RuYW1lX2NoYXJhY3RlcnMpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0hvc3RuYW1lIFwiJyArIHYgKyAnXCIgY29udGFpbnMgY2hhcmFjdGVycyBvdGhlciB0aGFuIFtBLVowLTkuLV0nKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgLy8gbm9Db25mbGljdFxuICBVUkkubm9Db25mbGljdCA9IGZ1bmN0aW9uKHJlbW92ZUFsbCkge1xuICAgIGlmIChyZW1vdmVBbGwpIHtcbiAgICAgIHZhciB1bmNvbmZsaWN0ZWQgPSB7XG4gICAgICAgIFVSSTogdGhpcy5ub0NvbmZsaWN0KClcbiAgICAgIH07XG5cbiAgICAgIGlmIChyb290LlVSSVRlbXBsYXRlICYmIHR5cGVvZiByb290LlVSSVRlbXBsYXRlLm5vQ29uZmxpY3QgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdW5jb25mbGljdGVkLlVSSVRlbXBsYXRlID0gcm9vdC5VUklUZW1wbGF0ZS5ub0NvbmZsaWN0KCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChyb290LklQdjYgJiYgdHlwZW9mIHJvb3QuSVB2Ni5ub0NvbmZsaWN0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHVuY29uZmxpY3RlZC5JUHY2ID0gcm9vdC5JUHY2Lm5vQ29uZmxpY3QoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHJvb3QuU2Vjb25kTGV2ZWxEb21haW5zICYmIHR5cGVvZiByb290LlNlY29uZExldmVsRG9tYWlucy5ub0NvbmZsaWN0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHVuY29uZmxpY3RlZC5TZWNvbmRMZXZlbERvbWFpbnMgPSByb290LlNlY29uZExldmVsRG9tYWlucy5ub0NvbmZsaWN0KCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB1bmNvbmZsaWN0ZWQ7XG4gICAgfSBlbHNlIGlmIChyb290LlVSSSA9PT0gdGhpcykge1xuICAgICAgcm9vdC5VUkkgPSBfVVJJO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIHAuYnVpbGQgPSBmdW5jdGlvbihkZWZlckJ1aWxkKSB7XG4gICAgaWYgKGRlZmVyQnVpbGQgPT09IHRydWUpIHtcbiAgICAgIHRoaXMuX2RlZmVycmVkX2J1aWxkID0gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKGRlZmVyQnVpbGQgPT09IHVuZGVmaW5lZCB8fCB0aGlzLl9kZWZlcnJlZF9idWlsZCkge1xuICAgICAgdGhpcy5fc3RyaW5nID0gVVJJLmJ1aWxkKHRoaXMuX3BhcnRzKTtcbiAgICAgIHRoaXMuX2RlZmVycmVkX2J1aWxkID0gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgcC5jbG9uZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgVVJJKHRoaXMpO1xuICB9O1xuXG4gIHAudmFsdWVPZiA9IHAudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5idWlsZChmYWxzZSkuX3N0cmluZztcbiAgfTtcblxuXG4gIGZ1bmN0aW9uIGdlbmVyYXRlU2ltcGxlQWNjZXNzb3IoX3BhcnQpe1xuICAgIHJldHVybiBmdW5jdGlvbih2LCBidWlsZCkge1xuICAgICAgaWYgKHYgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fcGFydHNbX3BhcnRdIHx8ICcnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fcGFydHNbX3BhcnRdID0gdiB8fCBudWxsO1xuICAgICAgICB0aGlzLmJ1aWxkKCFidWlsZCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBnZW5lcmF0ZVByZWZpeEFjY2Vzc29yKF9wYXJ0LCBfa2V5KXtcbiAgICByZXR1cm4gZnVuY3Rpb24odiwgYnVpbGQpIHtcbiAgICAgIGlmICh2ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhcnRzW19wYXJ0XSB8fCAnJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICh2ICE9PSBudWxsKSB7XG4gICAgICAgICAgdiA9IHYgKyAnJztcbiAgICAgICAgICBpZiAodi5jaGFyQXQoMCkgPT09IF9rZXkpIHtcbiAgICAgICAgICAgIHYgPSB2LnN1YnN0cmluZygxKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9wYXJ0c1tfcGFydF0gPSB2O1xuICAgICAgICB0aGlzLmJ1aWxkKCFidWlsZCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICBwLnByb3RvY29sID0gZ2VuZXJhdGVTaW1wbGVBY2Nlc3NvcigncHJvdG9jb2wnKTtcbiAgcC51c2VybmFtZSA9IGdlbmVyYXRlU2ltcGxlQWNjZXNzb3IoJ3VzZXJuYW1lJyk7XG4gIHAucGFzc3dvcmQgPSBnZW5lcmF0ZVNpbXBsZUFjY2Vzc29yKCdwYXNzd29yZCcpO1xuICBwLmhvc3RuYW1lID0gZ2VuZXJhdGVTaW1wbGVBY2Nlc3NvcignaG9zdG5hbWUnKTtcbiAgcC5wb3J0ID0gZ2VuZXJhdGVTaW1wbGVBY2Nlc3NvcigncG9ydCcpO1xuICBwLnF1ZXJ5ID0gZ2VuZXJhdGVQcmVmaXhBY2Nlc3NvcigncXVlcnknLCAnPycpO1xuICBwLmZyYWdtZW50ID0gZ2VuZXJhdGVQcmVmaXhBY2Nlc3NvcignZnJhZ21lbnQnLCAnIycpO1xuXG4gIHAuc2VhcmNoID0gZnVuY3Rpb24odiwgYnVpbGQpIHtcbiAgICB2YXIgdCA9IHRoaXMucXVlcnkodiwgYnVpbGQpO1xuICAgIHJldHVybiB0eXBlb2YgdCA9PT0gJ3N0cmluZycgJiYgdC5sZW5ndGggPyAoJz8nICsgdCkgOiB0O1xuICB9O1xuICBwLmhhc2ggPSBmdW5jdGlvbih2LCBidWlsZCkge1xuICAgIHZhciB0ID0gdGhpcy5mcmFnbWVudCh2LCBidWlsZCk7XG4gICAgcmV0dXJuIHR5cGVvZiB0ID09PSAnc3RyaW5nJyAmJiB0Lmxlbmd0aCA/ICgnIycgKyB0KSA6IHQ7XG4gIH07XG5cbiAgcC5wYXRobmFtZSA9IGZ1bmN0aW9uKHYsIGJ1aWxkKSB7XG4gICAgaWYgKHYgPT09IHVuZGVmaW5lZCB8fCB2ID09PSB0cnVlKSB7XG4gICAgICB2YXIgcmVzID0gdGhpcy5fcGFydHMucGF0aCB8fCAodGhpcy5fcGFydHMuaG9zdG5hbWUgPyAnLycgOiAnJyk7XG4gICAgICByZXR1cm4gdiA/ICh0aGlzLl9wYXJ0cy51cm4gPyBVUkkuZGVjb2RlVXJuUGF0aCA6IFVSSS5kZWNvZGVQYXRoKShyZXMpIDogcmVzO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGhpcy5fcGFydHMudXJuKSB7XG4gICAgICAgIHRoaXMuX3BhcnRzLnBhdGggPSB2ID8gVVJJLnJlY29kZVVyblBhdGgodikgOiAnJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3BhcnRzLnBhdGggPSB2ID8gVVJJLnJlY29kZVBhdGgodikgOiAnLyc7XG4gICAgICB9XG4gICAgICB0aGlzLmJ1aWxkKCFidWlsZCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH07XG4gIHAucGF0aCA9IHAucGF0aG5hbWU7XG4gIHAuaHJlZiA9IGZ1bmN0aW9uKGhyZWYsIGJ1aWxkKSB7XG4gICAgdmFyIGtleTtcblxuICAgIGlmIChocmVmID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLnRvU3RyaW5nKCk7XG4gICAgfVxuXG4gICAgdGhpcy5fc3RyaW5nID0gJyc7XG4gICAgdGhpcy5fcGFydHMgPSBVUkkuX3BhcnRzKCk7XG5cbiAgICB2YXIgX1VSSSA9IGhyZWYgaW5zdGFuY2VvZiBVUkk7XG4gICAgdmFyIF9vYmplY3QgPSB0eXBlb2YgaHJlZiA9PT0gJ29iamVjdCcgJiYgKGhyZWYuaG9zdG5hbWUgfHwgaHJlZi5wYXRoIHx8IGhyZWYucGF0aG5hbWUpO1xuICAgIGlmIChocmVmLm5vZGVOYW1lKSB7XG4gICAgICB2YXIgYXR0cmlidXRlID0gVVJJLmdldERvbUF0dHJpYnV0ZShocmVmKTtcbiAgICAgIGhyZWYgPSBocmVmW2F0dHJpYnV0ZV0gfHwgJyc7XG4gICAgICBfb2JqZWN0ID0gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gd2luZG93LmxvY2F0aW9uIGlzIHJlcG9ydGVkIHRvIGJlIGFuIG9iamVjdCwgYnV0IGl0J3Mgbm90IHRoZSBzb3J0XG4gICAgLy8gb2Ygb2JqZWN0IHdlJ3JlIGxvb2tpbmcgZm9yOlxuICAgIC8vICogbG9jYXRpb24ucHJvdG9jb2wgZW5kcyB3aXRoIGEgY29sb25cbiAgICAvLyAqIGxvY2F0aW9uLnF1ZXJ5ICE9IG9iamVjdC5zZWFyY2hcbiAgICAvLyAqIGxvY2F0aW9uLmhhc2ggIT0gb2JqZWN0LmZyYWdtZW50XG4gICAgLy8gc2ltcGx5IHNlcmlhbGl6aW5nIHRoZSB1bmtub3duIG9iamVjdCBzaG91bGQgZG8gdGhlIHRyaWNrXG4gICAgLy8gKGZvciBsb2NhdGlvbiwgbm90IGZvciBldmVyeXRoaW5nLi4uKVxuICAgIGlmICghX1VSSSAmJiBfb2JqZWN0ICYmIGhyZWYucGF0aG5hbWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgaHJlZiA9IGhyZWYudG9TdHJpbmcoKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGhyZWYgPT09ICdzdHJpbmcnIHx8IGhyZWYgaW5zdGFuY2VvZiBTdHJpbmcpIHtcbiAgICAgIHRoaXMuX3BhcnRzID0gVVJJLnBhcnNlKFN0cmluZyhocmVmKSwgdGhpcy5fcGFydHMpO1xuICAgIH0gZWxzZSBpZiAoX1VSSSB8fCBfb2JqZWN0KSB7XG4gICAgICB2YXIgc3JjID0gX1VSSSA/IGhyZWYuX3BhcnRzIDogaHJlZjtcbiAgICAgIGZvciAoa2V5IGluIHNyYykge1xuICAgICAgICBpZiAoaGFzT3duLmNhbGwodGhpcy5fcGFydHMsIGtleSkpIHtcbiAgICAgICAgICB0aGlzLl9wYXJ0c1trZXldID0gc3JjW2tleV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignaW52YWxpZCBpbnB1dCcpO1xuICAgIH1cblxuICAgIHRoaXMuYnVpbGQoIWJ1aWxkKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvLyBpZGVudGlmaWNhdGlvbiBhY2Nlc3NvcnNcbiAgcC5pcyA9IGZ1bmN0aW9uKHdoYXQpIHtcbiAgICB2YXIgaXAgPSBmYWxzZTtcbiAgICB2YXIgaXA0ID0gZmFsc2U7XG4gICAgdmFyIGlwNiA9IGZhbHNlO1xuICAgIHZhciBuYW1lID0gZmFsc2U7XG4gICAgdmFyIHNsZCA9IGZhbHNlO1xuICAgIHZhciBpZG4gPSBmYWxzZTtcbiAgICB2YXIgcHVueWNvZGUgPSBmYWxzZTtcbiAgICB2YXIgcmVsYXRpdmUgPSAhdGhpcy5fcGFydHMudXJuO1xuXG4gICAgaWYgKHRoaXMuX3BhcnRzLmhvc3RuYW1lKSB7XG4gICAgICByZWxhdGl2ZSA9IGZhbHNlO1xuICAgICAgaXA0ID0gVVJJLmlwNF9leHByZXNzaW9uLnRlc3QodGhpcy5fcGFydHMuaG9zdG5hbWUpO1xuICAgICAgaXA2ID0gVVJJLmlwNl9leHByZXNzaW9uLnRlc3QodGhpcy5fcGFydHMuaG9zdG5hbWUpO1xuICAgICAgaXAgPSBpcDQgfHwgaXA2O1xuICAgICAgbmFtZSA9ICFpcDtcbiAgICAgIHNsZCA9IG5hbWUgJiYgU0xEICYmIFNMRC5oYXModGhpcy5fcGFydHMuaG9zdG5hbWUpO1xuICAgICAgaWRuID0gbmFtZSAmJiBVUkkuaWRuX2V4cHJlc3Npb24udGVzdCh0aGlzLl9wYXJ0cy5ob3N0bmFtZSk7XG4gICAgICBwdW55Y29kZSA9IG5hbWUgJiYgVVJJLnB1bnljb2RlX2V4cHJlc3Npb24udGVzdCh0aGlzLl9wYXJ0cy5ob3N0bmFtZSk7XG4gICAgfVxuXG4gICAgc3dpdGNoICh3aGF0LnRvTG93ZXJDYXNlKCkpIHtcbiAgICAgIGNhc2UgJ3JlbGF0aXZlJzpcbiAgICAgICAgcmV0dXJuIHJlbGF0aXZlO1xuXG4gICAgICBjYXNlICdhYnNvbHV0ZSc6XG4gICAgICAgIHJldHVybiAhcmVsYXRpdmU7XG5cbiAgICAgIC8vIGhvc3RuYW1lIGlkZW50aWZpY2F0aW9uXG4gICAgICBjYXNlICdkb21haW4nOlxuICAgICAgY2FzZSAnbmFtZSc6XG4gICAgICAgIHJldHVybiBuYW1lO1xuXG4gICAgICBjYXNlICdzbGQnOlxuICAgICAgICByZXR1cm4gc2xkO1xuXG4gICAgICBjYXNlICdpcCc6XG4gICAgICAgIHJldHVybiBpcDtcblxuICAgICAgY2FzZSAnaXA0JzpcbiAgICAgIGNhc2UgJ2lwdjQnOlxuICAgICAgY2FzZSAnaW5ldDQnOlxuICAgICAgICByZXR1cm4gaXA0O1xuXG4gICAgICBjYXNlICdpcDYnOlxuICAgICAgY2FzZSAnaXB2Nic6XG4gICAgICBjYXNlICdpbmV0Nic6XG4gICAgICAgIHJldHVybiBpcDY7XG5cbiAgICAgIGNhc2UgJ2lkbic6XG4gICAgICAgIHJldHVybiBpZG47XG5cbiAgICAgIGNhc2UgJ3VybCc6XG4gICAgICAgIHJldHVybiAhdGhpcy5fcGFydHMudXJuO1xuXG4gICAgICBjYXNlICd1cm4nOlxuICAgICAgICByZXR1cm4gISF0aGlzLl9wYXJ0cy51cm47XG5cbiAgICAgIGNhc2UgJ3B1bnljb2RlJzpcbiAgICAgICAgcmV0dXJuIHB1bnljb2RlO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9O1xuXG4gIC8vIGNvbXBvbmVudCBzcGVjaWZpYyBpbnB1dCB2YWxpZGF0aW9uXG4gIHZhciBfcHJvdG9jb2wgPSBwLnByb3RvY29sO1xuICB2YXIgX3BvcnQgPSBwLnBvcnQ7XG4gIHZhciBfaG9zdG5hbWUgPSBwLmhvc3RuYW1lO1xuXG4gIHAucHJvdG9jb2wgPSBmdW5jdGlvbih2LCBidWlsZCkge1xuICAgIGlmICh2ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmICh2KSB7XG4gICAgICAgIC8vIGFjY2VwdCB0cmFpbGluZyA6Ly9cbiAgICAgICAgdiA9IHYucmVwbGFjZSgvOihcXC9cXC8pPyQvLCAnJyk7XG5cbiAgICAgICAgaWYgKCF2Lm1hdGNoKFVSSS5wcm90b2NvbF9leHByZXNzaW9uKSkge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Byb3RvY29sIFwiJyArIHYgKyAnXCIgY29udGFpbnMgY2hhcmFjdGVycyBvdGhlciB0aGFuIFtBLVowLTkuKy1dIG9yIGRvZXNuXFwndCBzdGFydCB3aXRoIFtBLVpdJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIF9wcm90b2NvbC5jYWxsKHRoaXMsIHYsIGJ1aWxkKTtcbiAgfTtcbiAgcC5zY2hlbWUgPSBwLnByb3RvY29sO1xuICBwLnBvcnQgPSBmdW5jdGlvbih2LCBidWlsZCkge1xuICAgIGlmICh0aGlzLl9wYXJ0cy51cm4pIHtcbiAgICAgIHJldHVybiB2ID09PSB1bmRlZmluZWQgPyAnJyA6IHRoaXM7XG4gICAgfVxuXG4gICAgaWYgKHYgIT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKHYgPT09IDApIHtcbiAgICAgICAgdiA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIGlmICh2KSB7XG4gICAgICAgIHYgKz0gJyc7XG4gICAgICAgIGlmICh2LmNoYXJBdCgwKSA9PT0gJzonKSB7XG4gICAgICAgICAgdiA9IHYuc3Vic3RyaW5nKDEpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHYubWF0Y2goL1teMC05XS8pKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignUG9ydCBcIicgKyB2ICsgJ1wiIGNvbnRhaW5zIGNoYXJhY3RlcnMgb3RoZXIgdGhhbiBbMC05XScpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBfcG9ydC5jYWxsKHRoaXMsIHYsIGJ1aWxkKTtcbiAgfTtcbiAgcC5ob3N0bmFtZSA9IGZ1bmN0aW9uKHYsIGJ1aWxkKSB7XG4gICAgaWYgKHRoaXMuX3BhcnRzLnVybikge1xuICAgICAgcmV0dXJuIHYgPT09IHVuZGVmaW5lZCA/ICcnIDogdGhpcztcbiAgICB9XG5cbiAgICBpZiAodiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB2YXIgeCA9IHt9O1xuICAgICAgdmFyIHJlcyA9IFVSSS5wYXJzZUhvc3QodiwgeCk7XG4gICAgICBpZiAocmVzICE9PSAnLycpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSG9zdG5hbWUgXCInICsgdiArICdcIiBjb250YWlucyBjaGFyYWN0ZXJzIG90aGVyIHRoYW4gW0EtWjAtOS4tXScpO1xuICAgICAgfVxuXG4gICAgICB2ID0geC5ob3N0bmFtZTtcbiAgICB9XG4gICAgcmV0dXJuIF9ob3N0bmFtZS5jYWxsKHRoaXMsIHYsIGJ1aWxkKTtcbiAgfTtcblxuICAvLyBjb21wb3VuZCBhY2Nlc3NvcnNcbiAgcC5vcmlnaW4gPSBmdW5jdGlvbih2LCBidWlsZCkge1xuICAgIGlmICh0aGlzLl9wYXJ0cy51cm4pIHtcbiAgICAgIHJldHVybiB2ID09PSB1bmRlZmluZWQgPyAnJyA6IHRoaXM7XG4gICAgfVxuXG4gICAgaWYgKHYgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdmFyIHByb3RvY29sID0gdGhpcy5wcm90b2NvbCgpO1xuICAgICAgdmFyIGF1dGhvcml0eSA9IHRoaXMuYXV0aG9yaXR5KCk7XG4gICAgICBpZiAoIWF1dGhvcml0eSkge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiAocHJvdG9jb2wgPyBwcm90b2NvbCArICc6Ly8nIDogJycpICsgdGhpcy5hdXRob3JpdHkoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIG9yaWdpbiA9IFVSSSh2KTtcbiAgICAgIHRoaXNcbiAgICAgICAgLnByb3RvY29sKG9yaWdpbi5wcm90b2NvbCgpKVxuICAgICAgICAuYXV0aG9yaXR5KG9yaWdpbi5hdXRob3JpdHkoKSlcbiAgICAgICAgLmJ1aWxkKCFidWlsZCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH07XG4gIHAuaG9zdCA9IGZ1bmN0aW9uKHYsIGJ1aWxkKSB7XG4gICAgaWYgKHRoaXMuX3BhcnRzLnVybikge1xuICAgICAgcmV0dXJuIHYgPT09IHVuZGVmaW5lZCA/ICcnIDogdGhpcztcbiAgICB9XG5cbiAgICBpZiAodiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdGhpcy5fcGFydHMuaG9zdG5hbWUgPyBVUkkuYnVpbGRIb3N0KHRoaXMuX3BhcnRzKSA6ICcnO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgcmVzID0gVVJJLnBhcnNlSG9zdCh2LCB0aGlzLl9wYXJ0cyk7XG4gICAgICBpZiAocmVzICE9PSAnLycpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSG9zdG5hbWUgXCInICsgdiArICdcIiBjb250YWlucyBjaGFyYWN0ZXJzIG90aGVyIHRoYW4gW0EtWjAtOS4tXScpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmJ1aWxkKCFidWlsZCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH07XG4gIHAuYXV0aG9yaXR5ID0gZnVuY3Rpb24odiwgYnVpbGQpIHtcbiAgICBpZiAodGhpcy5fcGFydHMudXJuKSB7XG4gICAgICByZXR1cm4gdiA9PT0gdW5kZWZpbmVkID8gJycgOiB0aGlzO1xuICAgIH1cblxuICAgIGlmICh2ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLl9wYXJ0cy5ob3N0bmFtZSA/IFVSSS5idWlsZEF1dGhvcml0eSh0aGlzLl9wYXJ0cykgOiAnJztcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHJlcyA9IFVSSS5wYXJzZUF1dGhvcml0eSh2LCB0aGlzLl9wYXJ0cyk7XG4gICAgICBpZiAocmVzICE9PSAnLycpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSG9zdG5hbWUgXCInICsgdiArICdcIiBjb250YWlucyBjaGFyYWN0ZXJzIG90aGVyIHRoYW4gW0EtWjAtOS4tXScpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmJ1aWxkKCFidWlsZCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH07XG4gIHAudXNlcmluZm8gPSBmdW5jdGlvbih2LCBidWlsZCkge1xuICAgIGlmICh0aGlzLl9wYXJ0cy51cm4pIHtcbiAgICAgIHJldHVybiB2ID09PSB1bmRlZmluZWQgPyAnJyA6IHRoaXM7XG4gICAgfVxuXG4gICAgaWYgKHYgPT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKCF0aGlzLl9wYXJ0cy51c2VybmFtZSkge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgICB9XG5cbiAgICAgIHZhciB0ID0gVVJJLmJ1aWxkVXNlcmluZm8odGhpcy5fcGFydHMpO1xuICAgICAgcmV0dXJuIHQuc3Vic3RyaW5nKDAsIHQubGVuZ3RoIC0xKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHZbdi5sZW5ndGgtMV0gIT09ICdAJykge1xuICAgICAgICB2ICs9ICdAJztcbiAgICAgIH1cblxuICAgICAgVVJJLnBhcnNlVXNlcmluZm8odiwgdGhpcy5fcGFydHMpO1xuICAgICAgdGhpcy5idWlsZCghYnVpbGQpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICB9O1xuICBwLnJlc291cmNlID0gZnVuY3Rpb24odiwgYnVpbGQpIHtcbiAgICB2YXIgcGFydHM7XG5cbiAgICBpZiAodiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdGhpcy5wYXRoKCkgKyB0aGlzLnNlYXJjaCgpICsgdGhpcy5oYXNoKCk7XG4gICAgfVxuXG4gICAgcGFydHMgPSBVUkkucGFyc2Uodik7XG4gICAgdGhpcy5fcGFydHMucGF0aCA9IHBhcnRzLnBhdGg7XG4gICAgdGhpcy5fcGFydHMucXVlcnkgPSBwYXJ0cy5xdWVyeTtcbiAgICB0aGlzLl9wYXJ0cy5mcmFnbWVudCA9IHBhcnRzLmZyYWdtZW50O1xuICAgIHRoaXMuYnVpbGQoIWJ1aWxkKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvLyBmcmFjdGlvbiBhY2Nlc3NvcnNcbiAgcC5zdWJkb21haW4gPSBmdW5jdGlvbih2LCBidWlsZCkge1xuICAgIGlmICh0aGlzLl9wYXJ0cy51cm4pIHtcbiAgICAgIHJldHVybiB2ID09PSB1bmRlZmluZWQgPyAnJyA6IHRoaXM7XG4gICAgfVxuXG4gICAgLy8gY29udmVuaWVuY2UsIHJldHVybiBcInd3d1wiIGZyb20gXCJ3d3cuZXhhbXBsZS5vcmdcIlxuICAgIGlmICh2ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmICghdGhpcy5fcGFydHMuaG9zdG5hbWUgfHwgdGhpcy5pcygnSVAnKSkge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgICB9XG5cbiAgICAgIC8vIGdyYWIgZG9tYWluIGFuZCBhZGQgYW5vdGhlciBzZWdtZW50XG4gICAgICB2YXIgZW5kID0gdGhpcy5fcGFydHMuaG9zdG5hbWUubGVuZ3RoIC0gdGhpcy5kb21haW4oKS5sZW5ndGggLSAxO1xuICAgICAgcmV0dXJuIHRoaXMuX3BhcnRzLmhvc3RuYW1lLnN1YnN0cmluZygwLCBlbmQpIHx8ICcnO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgZSA9IHRoaXMuX3BhcnRzLmhvc3RuYW1lLmxlbmd0aCAtIHRoaXMuZG9tYWluKCkubGVuZ3RoO1xuICAgICAgdmFyIHN1YiA9IHRoaXMuX3BhcnRzLmhvc3RuYW1lLnN1YnN0cmluZygwLCBlKTtcbiAgICAgIHZhciByZXBsYWNlID0gbmV3IFJlZ0V4cCgnXicgKyBlc2NhcGVSZWdFeChzdWIpKTtcblxuICAgICAgaWYgKHYgJiYgdi5jaGFyQXQodi5sZW5ndGggLSAxKSAhPT0gJy4nKSB7XG4gICAgICAgIHYgKz0gJy4nO1xuICAgICAgfVxuXG4gICAgICBpZiAodikge1xuICAgICAgICBVUkkuZW5zdXJlVmFsaWRIb3N0bmFtZSh2KTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fcGFydHMuaG9zdG5hbWUgPSB0aGlzLl9wYXJ0cy5ob3N0bmFtZS5yZXBsYWNlKHJlcGxhY2UsIHYpO1xuICAgICAgdGhpcy5idWlsZCghYnVpbGQpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICB9O1xuICBwLmRvbWFpbiA9IGZ1bmN0aW9uKHYsIGJ1aWxkKSB7XG4gICAgaWYgKHRoaXMuX3BhcnRzLnVybikge1xuICAgICAgcmV0dXJuIHYgPT09IHVuZGVmaW5lZCA/ICcnIDogdGhpcztcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHYgPT09ICdib29sZWFuJykge1xuICAgICAgYnVpbGQgPSB2O1xuICAgICAgdiA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICAvLyBjb252ZW5pZW5jZSwgcmV0dXJuIFwiZXhhbXBsZS5vcmdcIiBmcm9tIFwid3d3LmV4YW1wbGUub3JnXCJcbiAgICBpZiAodiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAoIXRoaXMuX3BhcnRzLmhvc3RuYW1lIHx8IHRoaXMuaXMoJ0lQJykpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgICAgfVxuXG4gICAgICAvLyBpZiBob3N0bmFtZSBjb25zaXN0cyBvZiAxIG9yIDIgc2VnbWVudHMsIGl0IG11c3QgYmUgdGhlIGRvbWFpblxuICAgICAgdmFyIHQgPSB0aGlzLl9wYXJ0cy5ob3N0bmFtZS5tYXRjaCgvXFwuL2cpO1xuICAgICAgaWYgKHQgJiYgdC5sZW5ndGggPCAyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wYXJ0cy5ob3N0bmFtZTtcbiAgICAgIH1cblxuICAgICAgLy8gZ3JhYiB0bGQgYW5kIGFkZCBhbm90aGVyIHNlZ21lbnRcbiAgICAgIHZhciBlbmQgPSB0aGlzLl9wYXJ0cy5ob3N0bmFtZS5sZW5ndGggLSB0aGlzLnRsZChidWlsZCkubGVuZ3RoIC0gMTtcbiAgICAgIGVuZCA9IHRoaXMuX3BhcnRzLmhvc3RuYW1lLmxhc3RJbmRleE9mKCcuJywgZW5kIC0xKSArIDE7XG4gICAgICByZXR1cm4gdGhpcy5fcGFydHMuaG9zdG5hbWUuc3Vic3RyaW5nKGVuZCkgfHwgJyc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghdikge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdjYW5ub3Qgc2V0IGRvbWFpbiBlbXB0eScpO1xuICAgICAgfVxuXG4gICAgICBVUkkuZW5zdXJlVmFsaWRIb3N0bmFtZSh2KTtcblxuICAgICAgaWYgKCF0aGlzLl9wYXJ0cy5ob3N0bmFtZSB8fCB0aGlzLmlzKCdJUCcpKSB7XG4gICAgICAgIHRoaXMuX3BhcnRzLmhvc3RuYW1lID0gdjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciByZXBsYWNlID0gbmV3IFJlZ0V4cChlc2NhcGVSZWdFeCh0aGlzLmRvbWFpbigpKSArICckJyk7XG4gICAgICAgIHRoaXMuX3BhcnRzLmhvc3RuYW1lID0gdGhpcy5fcGFydHMuaG9zdG5hbWUucmVwbGFjZShyZXBsYWNlLCB2KTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5idWlsZCghYnVpbGQpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICB9O1xuICBwLnRsZCA9IGZ1bmN0aW9uKHYsIGJ1aWxkKSB7XG4gICAgaWYgKHRoaXMuX3BhcnRzLnVybikge1xuICAgICAgcmV0dXJuIHYgPT09IHVuZGVmaW5lZCA/ICcnIDogdGhpcztcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHYgPT09ICdib29sZWFuJykge1xuICAgICAgYnVpbGQgPSB2O1xuICAgICAgdiA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICAvLyByZXR1cm4gXCJvcmdcIiBmcm9tIFwid3d3LmV4YW1wbGUub3JnXCJcbiAgICBpZiAodiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAoIXRoaXMuX3BhcnRzLmhvc3RuYW1lIHx8IHRoaXMuaXMoJ0lQJykpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgICAgfVxuXG4gICAgICB2YXIgcG9zID0gdGhpcy5fcGFydHMuaG9zdG5hbWUubGFzdEluZGV4T2YoJy4nKTtcbiAgICAgIHZhciB0bGQgPSB0aGlzLl9wYXJ0cy5ob3N0bmFtZS5zdWJzdHJpbmcocG9zICsgMSk7XG5cbiAgICAgIGlmIChidWlsZCAhPT0gdHJ1ZSAmJiBTTEQgJiYgU0xELmxpc3RbdGxkLnRvTG93ZXJDYXNlKCldKSB7XG4gICAgICAgIHJldHVybiBTTEQuZ2V0KHRoaXMuX3BhcnRzLmhvc3RuYW1lKSB8fCB0bGQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0bGQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciByZXBsYWNlO1xuXG4gICAgICBpZiAoIXYpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignY2Fubm90IHNldCBUTEQgZW1wdHknKTtcbiAgICAgIH0gZWxzZSBpZiAodi5tYXRjaCgvW15hLXpBLVowLTktXS8pKSB7XG4gICAgICAgIGlmIChTTEQgJiYgU0xELmlzKHYpKSB7XG4gICAgICAgICAgcmVwbGFjZSA9IG5ldyBSZWdFeHAoZXNjYXBlUmVnRXgodGhpcy50bGQoKSkgKyAnJCcpO1xuICAgICAgICAgIHRoaXMuX3BhcnRzLmhvc3RuYW1lID0gdGhpcy5fcGFydHMuaG9zdG5hbWUucmVwbGFjZShyZXBsYWNlLCB2KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdUTEQgXCInICsgdiArICdcIiBjb250YWlucyBjaGFyYWN0ZXJzIG90aGVyIHRoYW4gW0EtWjAtOV0nKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICghdGhpcy5fcGFydHMuaG9zdG5hbWUgfHwgdGhpcy5pcygnSVAnKSkge1xuICAgICAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoJ2Nhbm5vdCBzZXQgVExEIG9uIG5vbi1kb21haW4gaG9zdCcpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVwbGFjZSA9IG5ldyBSZWdFeHAoZXNjYXBlUmVnRXgodGhpcy50bGQoKSkgKyAnJCcpO1xuICAgICAgICB0aGlzLl9wYXJ0cy5ob3N0bmFtZSA9IHRoaXMuX3BhcnRzLmhvc3RuYW1lLnJlcGxhY2UocmVwbGFjZSwgdik7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYnVpbGQoIWJ1aWxkKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfTtcbiAgcC5kaXJlY3RvcnkgPSBmdW5jdGlvbih2LCBidWlsZCkge1xuICAgIGlmICh0aGlzLl9wYXJ0cy51cm4pIHtcbiAgICAgIHJldHVybiB2ID09PSB1bmRlZmluZWQgPyAnJyA6IHRoaXM7XG4gICAgfVxuXG4gICAgaWYgKHYgPT09IHVuZGVmaW5lZCB8fCB2ID09PSB0cnVlKSB7XG4gICAgICBpZiAoIXRoaXMuX3BhcnRzLnBhdGggJiYgIXRoaXMuX3BhcnRzLmhvc3RuYW1lKSB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuX3BhcnRzLnBhdGggPT09ICcvJykge1xuICAgICAgICByZXR1cm4gJy8nO1xuICAgICAgfVxuXG4gICAgICB2YXIgZW5kID0gdGhpcy5fcGFydHMucGF0aC5sZW5ndGggLSB0aGlzLmZpbGVuYW1lKCkubGVuZ3RoIC0gMTtcbiAgICAgIHZhciByZXMgPSB0aGlzLl9wYXJ0cy5wYXRoLnN1YnN0cmluZygwLCBlbmQpIHx8ICh0aGlzLl9wYXJ0cy5ob3N0bmFtZSA/ICcvJyA6ICcnKTtcblxuICAgICAgcmV0dXJuIHYgPyBVUkkuZGVjb2RlUGF0aChyZXMpIDogcmVzO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBlID0gdGhpcy5fcGFydHMucGF0aC5sZW5ndGggLSB0aGlzLmZpbGVuYW1lKCkubGVuZ3RoO1xuICAgICAgdmFyIGRpcmVjdG9yeSA9IHRoaXMuX3BhcnRzLnBhdGguc3Vic3RyaW5nKDAsIGUpO1xuICAgICAgdmFyIHJlcGxhY2UgPSBuZXcgUmVnRXhwKCdeJyArIGVzY2FwZVJlZ0V4KGRpcmVjdG9yeSkpO1xuXG4gICAgICAvLyBmdWxseSBxdWFsaWZpZXIgZGlyZWN0b3JpZXMgYmVnaW4gd2l0aCBhIHNsYXNoXG4gICAgICBpZiAoIXRoaXMuaXMoJ3JlbGF0aXZlJykpIHtcbiAgICAgICAgaWYgKCF2KSB7XG4gICAgICAgICAgdiA9ICcvJztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh2LmNoYXJBdCgwKSAhPT0gJy8nKSB7XG4gICAgICAgICAgdiA9ICcvJyArIHY7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gZGlyZWN0b3JpZXMgYWx3YXlzIGVuZCB3aXRoIGEgc2xhc2hcbiAgICAgIGlmICh2ICYmIHYuY2hhckF0KHYubGVuZ3RoIC0gMSkgIT09ICcvJykge1xuICAgICAgICB2ICs9ICcvJztcbiAgICAgIH1cblxuICAgICAgdiA9IFVSSS5yZWNvZGVQYXRoKHYpO1xuICAgICAgdGhpcy5fcGFydHMucGF0aCA9IHRoaXMuX3BhcnRzLnBhdGgucmVwbGFjZShyZXBsYWNlLCB2KTtcbiAgICAgIHRoaXMuYnVpbGQoIWJ1aWxkKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfTtcbiAgcC5maWxlbmFtZSA9IGZ1bmN0aW9uKHYsIGJ1aWxkKSB7XG4gICAgaWYgKHRoaXMuX3BhcnRzLnVybikge1xuICAgICAgcmV0dXJuIHYgPT09IHVuZGVmaW5lZCA/ICcnIDogdGhpcztcbiAgICB9XG5cbiAgICBpZiAodiA9PT0gdW5kZWZpbmVkIHx8IHYgPT09IHRydWUpIHtcbiAgICAgIGlmICghdGhpcy5fcGFydHMucGF0aCB8fCB0aGlzLl9wYXJ0cy5wYXRoID09PSAnLycpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgICAgfVxuXG4gICAgICB2YXIgcG9zID0gdGhpcy5fcGFydHMucGF0aC5sYXN0SW5kZXhPZignLycpO1xuICAgICAgdmFyIHJlcyA9IHRoaXMuX3BhcnRzLnBhdGguc3Vic3RyaW5nKHBvcysxKTtcblxuICAgICAgcmV0dXJuIHYgPyBVUkkuZGVjb2RlUGF0aFNlZ21lbnQocmVzKSA6IHJlcztcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIG11dGF0ZWREaXJlY3RvcnkgPSBmYWxzZTtcblxuICAgICAgaWYgKHYuY2hhckF0KDApID09PSAnLycpIHtcbiAgICAgICAgdiA9IHYuc3Vic3RyaW5nKDEpO1xuICAgICAgfVxuXG4gICAgICBpZiAodi5tYXRjaCgvXFwuP1xcLy8pKSB7XG4gICAgICAgIG11dGF0ZWREaXJlY3RvcnkgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICB2YXIgcmVwbGFjZSA9IG5ldyBSZWdFeHAoZXNjYXBlUmVnRXgodGhpcy5maWxlbmFtZSgpKSArICckJyk7XG4gICAgICB2ID0gVVJJLnJlY29kZVBhdGgodik7XG4gICAgICB0aGlzLl9wYXJ0cy5wYXRoID0gdGhpcy5fcGFydHMucGF0aC5yZXBsYWNlKHJlcGxhY2UsIHYpO1xuXG4gICAgICBpZiAobXV0YXRlZERpcmVjdG9yeSkge1xuICAgICAgICB0aGlzLm5vcm1hbGl6ZVBhdGgoYnVpbGQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5idWlsZCghYnVpbGQpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH07XG4gIHAuc3VmZml4ID0gZnVuY3Rpb24odiwgYnVpbGQpIHtcbiAgICBpZiAodGhpcy5fcGFydHMudXJuKSB7XG4gICAgICByZXR1cm4gdiA9PT0gdW5kZWZpbmVkID8gJycgOiB0aGlzO1xuICAgIH1cblxuICAgIGlmICh2ID09PSB1bmRlZmluZWQgfHwgdiA9PT0gdHJ1ZSkge1xuICAgICAgaWYgKCF0aGlzLl9wYXJ0cy5wYXRoIHx8IHRoaXMuX3BhcnRzLnBhdGggPT09ICcvJykge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgICB9XG5cbiAgICAgIHZhciBmaWxlbmFtZSA9IHRoaXMuZmlsZW5hbWUoKTtcbiAgICAgIHZhciBwb3MgPSBmaWxlbmFtZS5sYXN0SW5kZXhPZignLicpO1xuICAgICAgdmFyIHMsIHJlcztcblxuICAgICAgaWYgKHBvcyA9PT0gLTEpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgICAgfVxuXG4gICAgICAvLyBzdWZmaXggbWF5IG9ubHkgY29udGFpbiBhbG51bSBjaGFyYWN0ZXJzICh5dXAsIEkgbWFkZSB0aGlzIHVwLilcbiAgICAgIHMgPSBmaWxlbmFtZS5zdWJzdHJpbmcocG9zKzEpO1xuICAgICAgcmVzID0gKC9eW2EtejAtOSVdKyQvaSkudGVzdChzKSA/IHMgOiAnJztcbiAgICAgIHJldHVybiB2ID8gVVJJLmRlY29kZVBhdGhTZWdtZW50KHJlcykgOiByZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh2LmNoYXJBdCgwKSA9PT0gJy4nKSB7XG4gICAgICAgIHYgPSB2LnN1YnN0cmluZygxKTtcbiAgICAgIH1cblxuICAgICAgdmFyIHN1ZmZpeCA9IHRoaXMuc3VmZml4KCk7XG4gICAgICB2YXIgcmVwbGFjZTtcblxuICAgICAgaWYgKCFzdWZmaXgpIHtcbiAgICAgICAgaWYgKCF2KSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9wYXJ0cy5wYXRoICs9ICcuJyArIFVSSS5yZWNvZGVQYXRoKHYpO1xuICAgICAgfSBlbHNlIGlmICghdikge1xuICAgICAgICByZXBsYWNlID0gbmV3IFJlZ0V4cChlc2NhcGVSZWdFeCgnLicgKyBzdWZmaXgpICsgJyQnKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlcGxhY2UgPSBuZXcgUmVnRXhwKGVzY2FwZVJlZ0V4KHN1ZmZpeCkgKyAnJCcpO1xuICAgICAgfVxuXG4gICAgICBpZiAocmVwbGFjZSkge1xuICAgICAgICB2ID0gVVJJLnJlY29kZVBhdGgodik7XG4gICAgICAgIHRoaXMuX3BhcnRzLnBhdGggPSB0aGlzLl9wYXJ0cy5wYXRoLnJlcGxhY2UocmVwbGFjZSwgdik7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYnVpbGQoIWJ1aWxkKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfTtcbiAgcC5zZWdtZW50ID0gZnVuY3Rpb24oc2VnbWVudCwgdiwgYnVpbGQpIHtcbiAgICB2YXIgc2VwYXJhdG9yID0gdGhpcy5fcGFydHMudXJuID8gJzonIDogJy8nO1xuICAgIHZhciBwYXRoID0gdGhpcy5wYXRoKCk7XG4gICAgdmFyIGFic29sdXRlID0gcGF0aC5zdWJzdHJpbmcoMCwgMSkgPT09ICcvJztcbiAgICB2YXIgc2VnbWVudHMgPSBwYXRoLnNwbGl0KHNlcGFyYXRvcik7XG5cbiAgICBpZiAoc2VnbWVudCAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiBzZWdtZW50ICE9PSAnbnVtYmVyJykge1xuICAgICAgYnVpbGQgPSB2O1xuICAgICAgdiA9IHNlZ21lbnQ7XG4gICAgICBzZWdtZW50ID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGlmIChzZWdtZW50ICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIHNlZ21lbnQgIT09ICdudW1iZXInKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0JhZCBzZWdtZW50IFwiJyArIHNlZ21lbnQgKyAnXCIsIG11c3QgYmUgMC1iYXNlZCBpbnRlZ2VyJyk7XG4gICAgfVxuXG4gICAgaWYgKGFic29sdXRlKSB7XG4gICAgICBzZWdtZW50cy5zaGlmdCgpO1xuICAgIH1cblxuICAgIGlmIChzZWdtZW50IDwgMCkge1xuICAgICAgLy8gYWxsb3cgbmVnYXRpdmUgaW5kZXhlcyB0byBhZGRyZXNzIGZyb20gdGhlIGVuZFxuICAgICAgc2VnbWVudCA9IE1hdGgubWF4KHNlZ21lbnRzLmxlbmd0aCArIHNlZ21lbnQsIDApO1xuICAgIH1cblxuICAgIGlmICh2ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIC8qanNoaW50IGxheGJyZWFrOiB0cnVlICovXG4gICAgICByZXR1cm4gc2VnbWVudCA9PT0gdW5kZWZpbmVkXG4gICAgICAgID8gc2VnbWVudHNcbiAgICAgICAgOiBzZWdtZW50c1tzZWdtZW50XTtcbiAgICAgIC8qanNoaW50IGxheGJyZWFrOiBmYWxzZSAqL1xuICAgIH0gZWxzZSBpZiAoc2VnbWVudCA9PT0gbnVsbCB8fCBzZWdtZW50c1tzZWdtZW50XSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAoaXNBcnJheSh2KSkge1xuICAgICAgICBzZWdtZW50cyA9IFtdO1xuICAgICAgICAvLyBjb2xsYXBzZSBlbXB0eSBlbGVtZW50cyB3aXRoaW4gYXJyYXlcbiAgICAgICAgZm9yICh2YXIgaT0wLCBsPXYubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgaWYgKCF2W2ldLmxlbmd0aCAmJiAoIXNlZ21lbnRzLmxlbmd0aCB8fCAhc2VnbWVudHNbc2VnbWVudHMubGVuZ3RoIC0xXS5sZW5ndGgpKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoc2VnbWVudHMubGVuZ3RoICYmICFzZWdtZW50c1tzZWdtZW50cy5sZW5ndGggLTFdLmxlbmd0aCkge1xuICAgICAgICAgICAgc2VnbWVudHMucG9wKCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc2VnbWVudHMucHVzaCh0cmltU2xhc2hlcyh2W2ldKSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodiB8fCB0eXBlb2YgdiA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgdiA9IHRyaW1TbGFzaGVzKHYpO1xuICAgICAgICBpZiAoc2VnbWVudHNbc2VnbWVudHMubGVuZ3RoIC0xXSA9PT0gJycpIHtcbiAgICAgICAgICAvLyBlbXB0eSB0cmFpbGluZyBlbGVtZW50cyBoYXZlIHRvIGJlIG92ZXJ3cml0dGVuXG4gICAgICAgICAgLy8gdG8gcHJldmVudCByZXN1bHRzIHN1Y2ggYXMgL2Zvby8vYmFyXG4gICAgICAgICAgc2VnbWVudHNbc2VnbWVudHMubGVuZ3RoIC0xXSA9IHY7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2VnbWVudHMucHVzaCh2KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodikge1xuICAgICAgICBzZWdtZW50c1tzZWdtZW50XSA9IHRyaW1TbGFzaGVzKHYpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2VnbWVudHMuc3BsaWNlKHNlZ21lbnQsIDEpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChhYnNvbHV0ZSkge1xuICAgICAgc2VnbWVudHMudW5zaGlmdCgnJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMucGF0aChzZWdtZW50cy5qb2luKHNlcGFyYXRvciksIGJ1aWxkKTtcbiAgfTtcbiAgcC5zZWdtZW50Q29kZWQgPSBmdW5jdGlvbihzZWdtZW50LCB2LCBidWlsZCkge1xuICAgIHZhciBzZWdtZW50cywgaSwgbDtcblxuICAgIGlmICh0eXBlb2Ygc2VnbWVudCAhPT0gJ251bWJlcicpIHtcbiAgICAgIGJ1aWxkID0gdjtcbiAgICAgIHYgPSBzZWdtZW50O1xuICAgICAgc2VnbWVudCA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBpZiAodiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBzZWdtZW50cyA9IHRoaXMuc2VnbWVudChzZWdtZW50LCB2LCBidWlsZCk7XG4gICAgICBpZiAoIWlzQXJyYXkoc2VnbWVudHMpKSB7XG4gICAgICAgIHNlZ21lbnRzID0gc2VnbWVudHMgIT09IHVuZGVmaW5lZCA/IFVSSS5kZWNvZGUoc2VnbWVudHMpIDogdW5kZWZpbmVkO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm9yIChpID0gMCwgbCA9IHNlZ21lbnRzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgIHNlZ21lbnRzW2ldID0gVVJJLmRlY29kZShzZWdtZW50c1tpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNlZ21lbnRzO1xuICAgIH1cblxuICAgIGlmICghaXNBcnJheSh2KSkge1xuICAgICAgdiA9ICh0eXBlb2YgdiA9PT0gJ3N0cmluZycgfHwgdiBpbnN0YW5jZW9mIFN0cmluZykgPyBVUkkuZW5jb2RlKHYpIDogdjtcbiAgICB9IGVsc2Uge1xuICAgICAgZm9yIChpID0gMCwgbCA9IHYubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHZbaV0gPSBVUkkuZW5jb2RlKHZbaV0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnNlZ21lbnQoc2VnbWVudCwgdiwgYnVpbGQpO1xuICB9O1xuXG4gIC8vIG11dGF0aW5nIHF1ZXJ5IHN0cmluZ1xuICB2YXIgcSA9IHAucXVlcnk7XG4gIHAucXVlcnkgPSBmdW5jdGlvbih2LCBidWlsZCkge1xuICAgIGlmICh2ID09PSB0cnVlKSB7XG4gICAgICByZXR1cm4gVVJJLnBhcnNlUXVlcnkodGhpcy5fcGFydHMucXVlcnksIHRoaXMuX3BhcnRzLmVzY2FwZVF1ZXJ5U3BhY2UpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHYgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHZhciBkYXRhID0gVVJJLnBhcnNlUXVlcnkodGhpcy5fcGFydHMucXVlcnksIHRoaXMuX3BhcnRzLmVzY2FwZVF1ZXJ5U3BhY2UpO1xuICAgICAgdmFyIHJlc3VsdCA9IHYuY2FsbCh0aGlzLCBkYXRhKTtcbiAgICAgIHRoaXMuX3BhcnRzLnF1ZXJ5ID0gVVJJLmJ1aWxkUXVlcnkocmVzdWx0IHx8IGRhdGEsIHRoaXMuX3BhcnRzLmR1cGxpY2F0ZVF1ZXJ5UGFyYW1ldGVycywgdGhpcy5fcGFydHMuZXNjYXBlUXVlcnlTcGFjZSk7XG4gICAgICB0aGlzLmJ1aWxkKCFidWlsZCk7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9IGVsc2UgaWYgKHYgIT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgdiAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRoaXMuX3BhcnRzLnF1ZXJ5ID0gVVJJLmJ1aWxkUXVlcnkodiwgdGhpcy5fcGFydHMuZHVwbGljYXRlUXVlcnlQYXJhbWV0ZXJzLCB0aGlzLl9wYXJ0cy5lc2NhcGVRdWVyeVNwYWNlKTtcbiAgICAgIHRoaXMuYnVpbGQoIWJ1aWxkKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gcS5jYWxsKHRoaXMsIHYsIGJ1aWxkKTtcbiAgICB9XG4gIH07XG4gIHAuc2V0UXVlcnkgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSwgYnVpbGQpIHtcbiAgICB2YXIgZGF0YSA9IFVSSS5wYXJzZVF1ZXJ5KHRoaXMuX3BhcnRzLnF1ZXJ5LCB0aGlzLl9wYXJ0cy5lc2NhcGVRdWVyeVNwYWNlKTtcblxuICAgIGlmICh0eXBlb2YgbmFtZSA9PT0gJ3N0cmluZycgfHwgbmFtZSBpbnN0YW5jZW9mIFN0cmluZykge1xuICAgICAgZGF0YVtuYW1lXSA9IHZhbHVlICE9PSB1bmRlZmluZWQgPyB2YWx1ZSA6IG51bGw7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbmFtZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGZvciAodmFyIGtleSBpbiBuYW1lKSB7XG4gICAgICAgIGlmIChoYXNPd24uY2FsbChuYW1lLCBrZXkpKSB7XG4gICAgICAgICAgZGF0YVtrZXldID0gbmFtZVtrZXldO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1VSSS5hZGRRdWVyeSgpIGFjY2VwdHMgYW4gb2JqZWN0LCBzdHJpbmcgYXMgdGhlIG5hbWUgcGFyYW1ldGVyJyk7XG4gICAgfVxuXG4gICAgdGhpcy5fcGFydHMucXVlcnkgPSBVUkkuYnVpbGRRdWVyeShkYXRhLCB0aGlzLl9wYXJ0cy5kdXBsaWNhdGVRdWVyeVBhcmFtZXRlcnMsIHRoaXMuX3BhcnRzLmVzY2FwZVF1ZXJ5U3BhY2UpO1xuICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIGJ1aWxkID0gdmFsdWU7XG4gICAgfVxuXG4gICAgdGhpcy5idWlsZCghYnVpbGQpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICBwLmFkZFF1ZXJ5ID0gZnVuY3Rpb24obmFtZSwgdmFsdWUsIGJ1aWxkKSB7XG4gICAgdmFyIGRhdGEgPSBVUkkucGFyc2VRdWVyeSh0aGlzLl9wYXJ0cy5xdWVyeSwgdGhpcy5fcGFydHMuZXNjYXBlUXVlcnlTcGFjZSk7XG4gICAgVVJJLmFkZFF1ZXJ5KGRhdGEsIG5hbWUsIHZhbHVlID09PSB1bmRlZmluZWQgPyBudWxsIDogdmFsdWUpO1xuICAgIHRoaXMuX3BhcnRzLnF1ZXJ5ID0gVVJJLmJ1aWxkUXVlcnkoZGF0YSwgdGhpcy5fcGFydHMuZHVwbGljYXRlUXVlcnlQYXJhbWV0ZXJzLCB0aGlzLl9wYXJ0cy5lc2NhcGVRdWVyeVNwYWNlKTtcbiAgICBpZiAodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICBidWlsZCA9IHZhbHVlO1xuICAgIH1cblxuICAgIHRoaXMuYnVpbGQoIWJ1aWxkKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgcC5yZW1vdmVRdWVyeSA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlLCBidWlsZCkge1xuICAgIHZhciBkYXRhID0gVVJJLnBhcnNlUXVlcnkodGhpcy5fcGFydHMucXVlcnksIHRoaXMuX3BhcnRzLmVzY2FwZVF1ZXJ5U3BhY2UpO1xuICAgIFVSSS5yZW1vdmVRdWVyeShkYXRhLCBuYW1lLCB2YWx1ZSk7XG4gICAgdGhpcy5fcGFydHMucXVlcnkgPSBVUkkuYnVpbGRRdWVyeShkYXRhLCB0aGlzLl9wYXJ0cy5kdXBsaWNhdGVRdWVyeVBhcmFtZXRlcnMsIHRoaXMuX3BhcnRzLmVzY2FwZVF1ZXJ5U3BhY2UpO1xuICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIGJ1aWxkID0gdmFsdWU7XG4gICAgfVxuXG4gICAgdGhpcy5idWlsZCghYnVpbGQpO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICBwLmhhc1F1ZXJ5ID0gZnVuY3Rpb24obmFtZSwgdmFsdWUsIHdpdGhpbkFycmF5KSB7XG4gICAgdmFyIGRhdGEgPSBVUkkucGFyc2VRdWVyeSh0aGlzLl9wYXJ0cy5xdWVyeSwgdGhpcy5fcGFydHMuZXNjYXBlUXVlcnlTcGFjZSk7XG4gICAgcmV0dXJuIFVSSS5oYXNRdWVyeShkYXRhLCBuYW1lLCB2YWx1ZSwgd2l0aGluQXJyYXkpO1xuICB9O1xuICBwLnNldFNlYXJjaCA9IHAuc2V0UXVlcnk7XG4gIHAuYWRkU2VhcmNoID0gcC5hZGRRdWVyeTtcbiAgcC5yZW1vdmVTZWFyY2ggPSBwLnJlbW92ZVF1ZXJ5O1xuICBwLmhhc1NlYXJjaCA9IHAuaGFzUXVlcnk7XG5cbiAgLy8gc2FuaXRpemluZyBVUkxzXG4gIHAubm9ybWFsaXplID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuX3BhcnRzLnVybikge1xuICAgICAgcmV0dXJuIHRoaXNcbiAgICAgICAgLm5vcm1hbGl6ZVByb3RvY29sKGZhbHNlKVxuICAgICAgICAubm9ybWFsaXplUGF0aChmYWxzZSlcbiAgICAgICAgLm5vcm1hbGl6ZVF1ZXJ5KGZhbHNlKVxuICAgICAgICAubm9ybWFsaXplRnJhZ21lbnQoZmFsc2UpXG4gICAgICAgIC5idWlsZCgpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzXG4gICAgICAubm9ybWFsaXplUHJvdG9jb2woZmFsc2UpXG4gICAgICAubm9ybWFsaXplSG9zdG5hbWUoZmFsc2UpXG4gICAgICAubm9ybWFsaXplUG9ydChmYWxzZSlcbiAgICAgIC5ub3JtYWxpemVQYXRoKGZhbHNlKVxuICAgICAgLm5vcm1hbGl6ZVF1ZXJ5KGZhbHNlKVxuICAgICAgLm5vcm1hbGl6ZUZyYWdtZW50KGZhbHNlKVxuICAgICAgLmJ1aWxkKCk7XG4gIH07XG4gIHAubm9ybWFsaXplUHJvdG9jb2wgPSBmdW5jdGlvbihidWlsZCkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5fcGFydHMucHJvdG9jb2wgPT09ICdzdHJpbmcnKSB7XG4gICAgICB0aGlzLl9wYXJ0cy5wcm90b2NvbCA9IHRoaXMuX3BhcnRzLnByb3RvY29sLnRvTG93ZXJDYXNlKCk7XG4gICAgICB0aGlzLmJ1aWxkKCFidWlsZCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIHAubm9ybWFsaXplSG9zdG5hbWUgPSBmdW5jdGlvbihidWlsZCkge1xuICAgIGlmICh0aGlzLl9wYXJ0cy5ob3N0bmFtZSkge1xuICAgICAgaWYgKHRoaXMuaXMoJ0lETicpICYmIHB1bnljb2RlKSB7XG4gICAgICAgIHRoaXMuX3BhcnRzLmhvc3RuYW1lID0gcHVueWNvZGUudG9BU0NJSSh0aGlzLl9wYXJ0cy5ob3N0bmFtZSk7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuaXMoJ0lQdjYnKSAmJiBJUHY2KSB7XG4gICAgICAgIHRoaXMuX3BhcnRzLmhvc3RuYW1lID0gSVB2Ni5iZXN0KHRoaXMuX3BhcnRzLmhvc3RuYW1lKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fcGFydHMuaG9zdG5hbWUgPSB0aGlzLl9wYXJ0cy5ob3N0bmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgICAgdGhpcy5idWlsZCghYnVpbGQpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICBwLm5vcm1hbGl6ZVBvcnQgPSBmdW5jdGlvbihidWlsZCkge1xuICAgIC8vIHJlbW92ZSBwb3J0IG9mIGl0J3MgdGhlIHByb3RvY29sJ3MgZGVmYXVsdFxuICAgIGlmICh0eXBlb2YgdGhpcy5fcGFydHMucHJvdG9jb2wgPT09ICdzdHJpbmcnICYmIHRoaXMuX3BhcnRzLnBvcnQgPT09IFVSSS5kZWZhdWx0UG9ydHNbdGhpcy5fcGFydHMucHJvdG9jb2xdKSB7XG4gICAgICB0aGlzLl9wYXJ0cy5wb3J0ID0gbnVsbDtcbiAgICAgIHRoaXMuYnVpbGQoIWJ1aWxkKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgcC5ub3JtYWxpemVQYXRoID0gZnVuY3Rpb24oYnVpbGQpIHtcbiAgICB2YXIgX3BhdGggPSB0aGlzLl9wYXJ0cy5wYXRoO1xuICAgIGlmICghX3BhdGgpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9wYXJ0cy51cm4pIHtcbiAgICAgIHRoaXMuX3BhcnRzLnBhdGggPSBVUkkucmVjb2RlVXJuUGF0aCh0aGlzLl9wYXJ0cy5wYXRoKTtcbiAgICAgIHRoaXMuYnVpbGQoIWJ1aWxkKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9wYXJ0cy5wYXRoID09PSAnLycpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIF9wYXRoID0gVVJJLnJlY29kZVBhdGgoX3BhdGgpO1xuXG4gICAgdmFyIF93YXNfcmVsYXRpdmU7XG4gICAgdmFyIF9sZWFkaW5nUGFyZW50cyA9ICcnO1xuICAgIHZhciBfcGFyZW50LCBfcG9zO1xuXG4gICAgLy8gaGFuZGxlIHJlbGF0aXZlIHBhdGhzXG4gICAgaWYgKF9wYXRoLmNoYXJBdCgwKSAhPT0gJy8nKSB7XG4gICAgICBfd2FzX3JlbGF0aXZlID0gdHJ1ZTtcbiAgICAgIF9wYXRoID0gJy8nICsgX3BhdGg7XG4gICAgfVxuXG4gICAgLy8gaGFuZGxlIHJlbGF0aXZlIGZpbGVzIChhcyBvcHBvc2VkIHRvIGRpcmVjdG9yaWVzKVxuICAgIGlmIChfcGF0aC5zbGljZSgtMykgPT09ICcvLi4nIHx8IF9wYXRoLnNsaWNlKC0yKSA9PT0gJy8uJykge1xuICAgICAgX3BhdGggKz0gJy8nO1xuICAgIH1cblxuICAgIC8vIHJlc29sdmUgc2ltcGxlc1xuICAgIF9wYXRoID0gX3BhdGhcbiAgICAgIC5yZXBsYWNlKC8oXFwvKFxcLlxcLykrKXwoXFwvXFwuJCkvZywgJy8nKVxuICAgICAgLnJlcGxhY2UoL1xcL3syLH0vZywgJy8nKTtcblxuICAgIC8vIHJlbWVtYmVyIGxlYWRpbmcgcGFyZW50c1xuICAgIGlmIChfd2FzX3JlbGF0aXZlKSB7XG4gICAgICBfbGVhZGluZ1BhcmVudHMgPSBfcGF0aC5zdWJzdHJpbmcoMSkubWF0Y2goL14oXFwuXFwuXFwvKSsvKSB8fCAnJztcbiAgICAgIGlmIChfbGVhZGluZ1BhcmVudHMpIHtcbiAgICAgICAgX2xlYWRpbmdQYXJlbnRzID0gX2xlYWRpbmdQYXJlbnRzWzBdO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHJlc29sdmUgcGFyZW50c1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBfcGFyZW50ID0gX3BhdGguc2VhcmNoKC9cXC9cXC5cXC4oXFwvfCQpLyk7XG4gICAgICBpZiAoX3BhcmVudCA9PT0gLTEpIHtcbiAgICAgICAgLy8gbm8gbW9yZSAuLi8gdG8gcmVzb2x2ZVxuICAgICAgICBicmVhaztcbiAgICAgIH0gZWxzZSBpZiAoX3BhcmVudCA9PT0gMCkge1xuICAgICAgICAvLyB0b3AgbGV2ZWwgY2Fubm90IGJlIHJlbGF0aXZlLCBza2lwIGl0XG4gICAgICAgIF9wYXRoID0gX3BhdGguc3Vic3RyaW5nKDMpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgX3BvcyA9IF9wYXRoLnN1YnN0cmluZygwLCBfcGFyZW50KS5sYXN0SW5kZXhPZignLycpO1xuICAgICAgaWYgKF9wb3MgPT09IC0xKSB7XG4gICAgICAgIF9wb3MgPSBfcGFyZW50O1xuICAgICAgfVxuICAgICAgX3BhdGggPSBfcGF0aC5zdWJzdHJpbmcoMCwgX3BvcykgKyBfcGF0aC5zdWJzdHJpbmcoX3BhcmVudCArIDMpO1xuICAgIH1cblxuICAgIC8vIHJldmVydCB0byByZWxhdGl2ZVxuICAgIGlmIChfd2FzX3JlbGF0aXZlICYmIHRoaXMuaXMoJ3JlbGF0aXZlJykpIHtcbiAgICAgIF9wYXRoID0gX2xlYWRpbmdQYXJlbnRzICsgX3BhdGguc3Vic3RyaW5nKDEpO1xuICAgIH1cblxuICAgIHRoaXMuX3BhcnRzLnBhdGggPSBfcGF0aDtcbiAgICB0aGlzLmJ1aWxkKCFidWlsZCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIHAubm9ybWFsaXplUGF0aG5hbWUgPSBwLm5vcm1hbGl6ZVBhdGg7XG4gIHAubm9ybWFsaXplUXVlcnkgPSBmdW5jdGlvbihidWlsZCkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5fcGFydHMucXVlcnkgPT09ICdzdHJpbmcnKSB7XG4gICAgICBpZiAoIXRoaXMuX3BhcnRzLnF1ZXJ5Lmxlbmd0aCkge1xuICAgICAgICB0aGlzLl9wYXJ0cy5xdWVyeSA9IG51bGw7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnF1ZXJ5KFVSSS5wYXJzZVF1ZXJ5KHRoaXMuX3BhcnRzLnF1ZXJ5LCB0aGlzLl9wYXJ0cy5lc2NhcGVRdWVyeVNwYWNlKSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYnVpbGQoIWJ1aWxkKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgcC5ub3JtYWxpemVGcmFnbWVudCA9IGZ1bmN0aW9uKGJ1aWxkKSB7XG4gICAgaWYgKCF0aGlzLl9wYXJ0cy5mcmFnbWVudCkge1xuICAgICAgdGhpcy5fcGFydHMuZnJhZ21lbnQgPSBudWxsO1xuICAgICAgdGhpcy5idWlsZCghYnVpbGQpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICBwLm5vcm1hbGl6ZVNlYXJjaCA9IHAubm9ybWFsaXplUXVlcnk7XG4gIHAubm9ybWFsaXplSGFzaCA9IHAubm9ybWFsaXplRnJhZ21lbnQ7XG5cbiAgcC5pc284ODU5ID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gZXhwZWN0IHVuaWNvZGUgaW5wdXQsIGlzbzg4NTkgb3V0cHV0XG4gICAgdmFyIGUgPSBVUkkuZW5jb2RlO1xuICAgIHZhciBkID0gVVJJLmRlY29kZTtcblxuICAgIFVSSS5lbmNvZGUgPSBlc2NhcGU7XG4gICAgVVJJLmRlY29kZSA9IGRlY29kZVVSSUNvbXBvbmVudDtcbiAgICB0cnkge1xuICAgICAgdGhpcy5ub3JtYWxpemUoKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgVVJJLmVuY29kZSA9IGU7XG4gICAgICBVUkkuZGVjb2RlID0gZDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgcC51bmljb2RlID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gZXhwZWN0IGlzbzg4NTkgaW5wdXQsIHVuaWNvZGUgb3V0cHV0XG4gICAgdmFyIGUgPSBVUkkuZW5jb2RlO1xuICAgIHZhciBkID0gVVJJLmRlY29kZTtcblxuICAgIFVSSS5lbmNvZGUgPSBzdHJpY3RFbmNvZGVVUklDb21wb25lbnQ7XG4gICAgVVJJLmRlY29kZSA9IHVuZXNjYXBlO1xuICAgIHRyeSB7XG4gICAgICB0aGlzLm5vcm1hbGl6ZSgpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBVUkkuZW5jb2RlID0gZTtcbiAgICAgIFVSSS5kZWNvZGUgPSBkO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBwLnJlYWRhYmxlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHVyaSA9IHRoaXMuY2xvbmUoKTtcbiAgICAvLyByZW1vdmluZyB1c2VybmFtZSwgcGFzc3dvcmQsIGJlY2F1c2UgdGhleSBzaG91bGRuJ3QgYmUgZGlzcGxheWVkIGFjY29yZGluZyB0byBSRkMgMzk4NlxuICAgIHVyaS51c2VybmFtZSgnJykucGFzc3dvcmQoJycpLm5vcm1hbGl6ZSgpO1xuICAgIHZhciB0ID0gJyc7XG4gICAgaWYgKHVyaS5fcGFydHMucHJvdG9jb2wpIHtcbiAgICAgIHQgKz0gdXJpLl9wYXJ0cy5wcm90b2NvbCArICc6Ly8nO1xuICAgIH1cblxuICAgIGlmICh1cmkuX3BhcnRzLmhvc3RuYW1lKSB7XG4gICAgICBpZiAodXJpLmlzKCdwdW55Y29kZScpICYmIHB1bnljb2RlKSB7XG4gICAgICAgIHQgKz0gcHVueWNvZGUudG9Vbmljb2RlKHVyaS5fcGFydHMuaG9zdG5hbWUpO1xuICAgICAgICBpZiAodXJpLl9wYXJ0cy5wb3J0KSB7XG4gICAgICAgICAgdCArPSAnOicgKyB1cmkuX3BhcnRzLnBvcnQ7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHQgKz0gdXJpLmhvc3QoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodXJpLl9wYXJ0cy5ob3N0bmFtZSAmJiB1cmkuX3BhcnRzLnBhdGggJiYgdXJpLl9wYXJ0cy5wYXRoLmNoYXJBdCgwKSAhPT0gJy8nKSB7XG4gICAgICB0ICs9ICcvJztcbiAgICB9XG5cbiAgICB0ICs9IHVyaS5wYXRoKHRydWUpO1xuICAgIGlmICh1cmkuX3BhcnRzLnF1ZXJ5KSB7XG4gICAgICB2YXIgcSA9ICcnO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIHFwID0gdXJpLl9wYXJ0cy5xdWVyeS5zcGxpdCgnJicpLCBsID0gcXAubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHZhciBrdiA9IChxcFtpXSB8fCAnJykuc3BsaXQoJz0nKTtcbiAgICAgICAgcSArPSAnJicgKyBVUkkuZGVjb2RlUXVlcnkoa3ZbMF0sIHRoaXMuX3BhcnRzLmVzY2FwZVF1ZXJ5U3BhY2UpXG4gICAgICAgICAgLnJlcGxhY2UoLyYvZywgJyUyNicpO1xuXG4gICAgICAgIGlmIChrdlsxXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgcSArPSAnPScgKyBVUkkuZGVjb2RlUXVlcnkoa3ZbMV0sIHRoaXMuX3BhcnRzLmVzY2FwZVF1ZXJ5U3BhY2UpXG4gICAgICAgICAgICAucmVwbGFjZSgvJi9nLCAnJTI2Jyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHQgKz0gJz8nICsgcS5zdWJzdHJpbmcoMSk7XG4gICAgfVxuXG4gICAgdCArPSBVUkkuZGVjb2RlUXVlcnkodXJpLmhhc2goKSwgdHJ1ZSk7XG4gICAgcmV0dXJuIHQ7XG4gIH07XG5cbiAgLy8gcmVzb2x2aW5nIHJlbGF0aXZlIGFuZCBhYnNvbHV0ZSBVUkxzXG4gIHAuYWJzb2x1dGVUbyA9IGZ1bmN0aW9uKGJhc2UpIHtcbiAgICB2YXIgcmVzb2x2ZWQgPSB0aGlzLmNsb25lKCk7XG4gICAgdmFyIHByb3BlcnRpZXMgPSBbJ3Byb3RvY29sJywgJ3VzZXJuYW1lJywgJ3Bhc3N3b3JkJywgJ2hvc3RuYW1lJywgJ3BvcnQnXTtcbiAgICB2YXIgYmFzZWRpciwgaSwgcDtcblxuICAgIGlmICh0aGlzLl9wYXJ0cy51cm4pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVVJOcyBkbyBub3QgaGF2ZSBhbnkgZ2VuZXJhbGx5IGRlZmluZWQgaGllcmFyY2hpY2FsIGNvbXBvbmVudHMnKTtcbiAgICB9XG5cbiAgICBpZiAoIShiYXNlIGluc3RhbmNlb2YgVVJJKSkge1xuICAgICAgYmFzZSA9IG5ldyBVUkkoYmFzZSk7XG4gICAgfVxuXG4gICAgaWYgKCFyZXNvbHZlZC5fcGFydHMucHJvdG9jb2wpIHtcbiAgICAgIHJlc29sdmVkLl9wYXJ0cy5wcm90b2NvbCA9IGJhc2UuX3BhcnRzLnByb3RvY29sO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9wYXJ0cy5ob3N0bmFtZSkge1xuICAgICAgcmV0dXJuIHJlc29sdmVkO1xuICAgIH1cblxuICAgIGZvciAoaSA9IDA7IChwID0gcHJvcGVydGllc1tpXSk7IGkrKykge1xuICAgICAgcmVzb2x2ZWQuX3BhcnRzW3BdID0gYmFzZS5fcGFydHNbcF07XG4gICAgfVxuXG4gICAgaWYgKCFyZXNvbHZlZC5fcGFydHMucGF0aCkge1xuICAgICAgcmVzb2x2ZWQuX3BhcnRzLnBhdGggPSBiYXNlLl9wYXJ0cy5wYXRoO1xuICAgICAgaWYgKCFyZXNvbHZlZC5fcGFydHMucXVlcnkpIHtcbiAgICAgICAgcmVzb2x2ZWQuX3BhcnRzLnF1ZXJ5ID0gYmFzZS5fcGFydHMucXVlcnk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChyZXNvbHZlZC5fcGFydHMucGF0aC5zdWJzdHJpbmcoLTIpID09PSAnLi4nKSB7XG4gICAgICByZXNvbHZlZC5fcGFydHMucGF0aCArPSAnLyc7XG4gICAgfVxuXG4gICAgaWYgKHJlc29sdmVkLnBhdGgoKS5jaGFyQXQoMCkgIT09ICcvJykge1xuICAgICAgYmFzZWRpciA9IGJhc2UuZGlyZWN0b3J5KCk7XG4gICAgICBiYXNlZGlyID0gYmFzZWRpciA/IGJhc2VkaXIgOiBiYXNlLnBhdGgoKS5pbmRleE9mKCcvJykgPT09IDAgPyAnLycgOiAnJztcbiAgICAgIHJlc29sdmVkLl9wYXJ0cy5wYXRoID0gKGJhc2VkaXIgPyAoYmFzZWRpciArICcvJykgOiAnJykgKyByZXNvbHZlZC5fcGFydHMucGF0aDtcbiAgICAgIHJlc29sdmVkLm5vcm1hbGl6ZVBhdGgoKTtcbiAgICB9XG5cbiAgICByZXNvbHZlZC5idWlsZCgpO1xuICAgIHJldHVybiByZXNvbHZlZDtcbiAgfTtcbiAgcC5yZWxhdGl2ZVRvID0gZnVuY3Rpb24oYmFzZSkge1xuICAgIHZhciByZWxhdGl2ZSA9IHRoaXMuY2xvbmUoKS5ub3JtYWxpemUoKTtcbiAgICB2YXIgcmVsYXRpdmVQYXJ0cywgYmFzZVBhcnRzLCBjb21tb24sIHJlbGF0aXZlUGF0aCwgYmFzZVBhdGg7XG5cbiAgICBpZiAocmVsYXRpdmUuX3BhcnRzLnVybikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVUk5zIGRvIG5vdCBoYXZlIGFueSBnZW5lcmFsbHkgZGVmaW5lZCBoaWVyYXJjaGljYWwgY29tcG9uZW50cycpO1xuICAgIH1cblxuICAgIGJhc2UgPSBuZXcgVVJJKGJhc2UpLm5vcm1hbGl6ZSgpO1xuICAgIHJlbGF0aXZlUGFydHMgPSByZWxhdGl2ZS5fcGFydHM7XG4gICAgYmFzZVBhcnRzID0gYmFzZS5fcGFydHM7XG4gICAgcmVsYXRpdmVQYXRoID0gcmVsYXRpdmUucGF0aCgpO1xuICAgIGJhc2VQYXRoID0gYmFzZS5wYXRoKCk7XG5cbiAgICBpZiAocmVsYXRpdmVQYXRoLmNoYXJBdCgwKSAhPT0gJy8nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VSSSBpcyBhbHJlYWR5IHJlbGF0aXZlJyk7XG4gICAgfVxuXG4gICAgaWYgKGJhc2VQYXRoLmNoYXJBdCgwKSAhPT0gJy8nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBjYWxjdWxhdGUgYSBVUkkgcmVsYXRpdmUgdG8gYW5vdGhlciByZWxhdGl2ZSBVUkknKTtcbiAgICB9XG5cbiAgICBpZiAocmVsYXRpdmVQYXJ0cy5wcm90b2NvbCA9PT0gYmFzZVBhcnRzLnByb3RvY29sKSB7XG4gICAgICByZWxhdGl2ZVBhcnRzLnByb3RvY29sID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAocmVsYXRpdmVQYXJ0cy51c2VybmFtZSAhPT0gYmFzZVBhcnRzLnVzZXJuYW1lIHx8IHJlbGF0aXZlUGFydHMucGFzc3dvcmQgIT09IGJhc2VQYXJ0cy5wYXNzd29yZCkge1xuICAgICAgcmV0dXJuIHJlbGF0aXZlLmJ1aWxkKCk7XG4gICAgfVxuXG4gICAgaWYgKHJlbGF0aXZlUGFydHMucHJvdG9jb2wgIT09IG51bGwgfHwgcmVsYXRpdmVQYXJ0cy51c2VybmFtZSAhPT0gbnVsbCB8fCByZWxhdGl2ZVBhcnRzLnBhc3N3b3JkICE9PSBudWxsKSB7XG4gICAgICByZXR1cm4gcmVsYXRpdmUuYnVpbGQoKTtcbiAgICB9XG5cbiAgICBpZiAocmVsYXRpdmVQYXJ0cy5ob3N0bmFtZSA9PT0gYmFzZVBhcnRzLmhvc3RuYW1lICYmIHJlbGF0aXZlUGFydHMucG9ydCA9PT0gYmFzZVBhcnRzLnBvcnQpIHtcbiAgICAgIHJlbGF0aXZlUGFydHMuaG9zdG5hbWUgPSBudWxsO1xuICAgICAgcmVsYXRpdmVQYXJ0cy5wb3J0ID0gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHJlbGF0aXZlLmJ1aWxkKCk7XG4gICAgfVxuXG4gICAgaWYgKHJlbGF0aXZlUGF0aCA9PT0gYmFzZVBhdGgpIHtcbiAgICAgIHJlbGF0aXZlUGFydHMucGF0aCA9ICcnO1xuICAgICAgcmV0dXJuIHJlbGF0aXZlLmJ1aWxkKCk7XG4gICAgfVxuXG4gICAgLy8gZGV0ZXJtaW5lIGNvbW1vbiBzdWIgcGF0aFxuICAgIGNvbW1vbiA9IFVSSS5jb21tb25QYXRoKHJlbGF0aXZlUGF0aCwgYmFzZVBhdGgpO1xuXG4gICAgLy8gSWYgdGhlIHBhdGhzIGhhdmUgbm90aGluZyBpbiBjb21tb24sIHJldHVybiBhIHJlbGF0aXZlIFVSTCB3aXRoIHRoZSBhYnNvbHV0ZSBwYXRoLlxuICAgIGlmICghY29tbW9uKSB7XG4gICAgICByZXR1cm4gcmVsYXRpdmUuYnVpbGQoKTtcbiAgICB9XG5cbiAgICB2YXIgcGFyZW50cyA9IGJhc2VQYXJ0cy5wYXRoXG4gICAgICAuc3Vic3RyaW5nKGNvbW1vbi5sZW5ndGgpXG4gICAgICAucmVwbGFjZSgvW15cXC9dKiQvLCAnJylcbiAgICAgIC5yZXBsYWNlKC8uKj9cXC8vZywgJy4uLycpO1xuXG4gICAgcmVsYXRpdmVQYXJ0cy5wYXRoID0gKHBhcmVudHMgKyByZWxhdGl2ZVBhcnRzLnBhdGguc3Vic3RyaW5nKGNvbW1vbi5sZW5ndGgpKSB8fCAnLi8nO1xuXG4gICAgcmV0dXJuIHJlbGF0aXZlLmJ1aWxkKCk7XG4gIH07XG5cbiAgLy8gY29tcGFyaW5nIFVSSXNcbiAgcC5lcXVhbHMgPSBmdW5jdGlvbih1cmkpIHtcbiAgICB2YXIgb25lID0gdGhpcy5jbG9uZSgpO1xuICAgIHZhciB0d28gPSBuZXcgVVJJKHVyaSk7XG4gICAgdmFyIG9uZV9tYXAgPSB7fTtcbiAgICB2YXIgdHdvX21hcCA9IHt9O1xuICAgIHZhciBjaGVja2VkID0ge307XG4gICAgdmFyIG9uZV9xdWVyeSwgdHdvX3F1ZXJ5LCBrZXk7XG5cbiAgICBvbmUubm9ybWFsaXplKCk7XG4gICAgdHdvLm5vcm1hbGl6ZSgpO1xuXG4gICAgLy8gZXhhY3QgbWF0Y2hcbiAgICBpZiAob25lLnRvU3RyaW5nKCkgPT09IHR3by50b1N0cmluZygpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBleHRyYWN0IHF1ZXJ5IHN0cmluZ1xuICAgIG9uZV9xdWVyeSA9IG9uZS5xdWVyeSgpO1xuICAgIHR3b19xdWVyeSA9IHR3by5xdWVyeSgpO1xuICAgIG9uZS5xdWVyeSgnJyk7XG4gICAgdHdvLnF1ZXJ5KCcnKTtcblxuICAgIC8vIGRlZmluaXRlbHkgbm90IGVxdWFsIGlmIG5vdCBldmVuIG5vbi1xdWVyeSBwYXJ0cyBtYXRjaFxuICAgIGlmIChvbmUudG9TdHJpbmcoKSAhPT0gdHdvLnRvU3RyaW5nKCkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBxdWVyeSBwYXJhbWV0ZXJzIGhhdmUgdGhlIHNhbWUgbGVuZ3RoLCBldmVuIGlmIHRoZXkncmUgcGVybXV0ZWRcbiAgICBpZiAob25lX3F1ZXJ5Lmxlbmd0aCAhPT0gdHdvX3F1ZXJ5Lmxlbmd0aCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIG9uZV9tYXAgPSBVUkkucGFyc2VRdWVyeShvbmVfcXVlcnksIHRoaXMuX3BhcnRzLmVzY2FwZVF1ZXJ5U3BhY2UpO1xuICAgIHR3b19tYXAgPSBVUkkucGFyc2VRdWVyeSh0d29fcXVlcnksIHRoaXMuX3BhcnRzLmVzY2FwZVF1ZXJ5U3BhY2UpO1xuXG4gICAgZm9yIChrZXkgaW4gb25lX21hcCkge1xuICAgICAgaWYgKGhhc093bi5jYWxsKG9uZV9tYXAsIGtleSkpIHtcbiAgICAgICAgaWYgKCFpc0FycmF5KG9uZV9tYXBba2V5XSkpIHtcbiAgICAgICAgICBpZiAob25lX21hcFtrZXldICE9PSB0d29fbWFwW2tleV0pIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoIWFycmF5c0VxdWFsKG9uZV9tYXBba2V5XSwgdHdvX21hcFtrZXldKSkge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNoZWNrZWRba2V5XSA9IHRydWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChrZXkgaW4gdHdvX21hcCkge1xuICAgICAgaWYgKGhhc093bi5jYWxsKHR3b19tYXAsIGtleSkpIHtcbiAgICAgICAgaWYgKCFjaGVja2VkW2tleV0pIHtcbiAgICAgICAgICAvLyB0d28gY29udGFpbnMgYSBwYXJhbWV0ZXIgbm90IHByZXNlbnQgaW4gb25lXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgLy8gc3RhdGVcbiAgcC5kdXBsaWNhdGVRdWVyeVBhcmFtZXRlcnMgPSBmdW5jdGlvbih2KSB7XG4gICAgdGhpcy5fcGFydHMuZHVwbGljYXRlUXVlcnlQYXJhbWV0ZXJzID0gISF2O1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIHAuZXNjYXBlUXVlcnlTcGFjZSA9IGZ1bmN0aW9uKHYpIHtcbiAgICB0aGlzLl9wYXJ0cy5lc2NhcGVRdWVyeVNwYWNlID0gISF2O1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIHJldHVybiBVUkk7XG59KSk7XG4iLCIvKiEgaHR0cHM6Ly9tdGhzLmJlL3B1bnljb2RlIHYxLjQuMCBieSBAbWF0aGlhcyAqL1xuOyhmdW5jdGlvbihyb290KSB7XG5cblx0LyoqIERldGVjdCBmcmVlIHZhcmlhYmxlcyAqL1xuXHR2YXIgZnJlZUV4cG9ydHMgPSB0eXBlb2YgZXhwb3J0cyA9PSAnb2JqZWN0JyAmJiBleHBvcnRzICYmXG5cdFx0IWV4cG9ydHMubm9kZVR5cGUgJiYgZXhwb3J0cztcblx0dmFyIGZyZWVNb2R1bGUgPSB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZSAmJlxuXHRcdCFtb2R1bGUubm9kZVR5cGUgJiYgbW9kdWxlO1xuXHR2YXIgZnJlZUdsb2JhbCA9IHR5cGVvZiBnbG9iYWwgPT0gJ29iamVjdCcgJiYgZ2xvYmFsO1xuXHRpZiAoXG5cdFx0ZnJlZUdsb2JhbC5nbG9iYWwgPT09IGZyZWVHbG9iYWwgfHxcblx0XHRmcmVlR2xvYmFsLndpbmRvdyA9PT0gZnJlZUdsb2JhbCB8fFxuXHRcdGZyZWVHbG9iYWwuc2VsZiA9PT0gZnJlZUdsb2JhbFxuXHQpIHtcblx0XHRyb290ID0gZnJlZUdsb2JhbDtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgYHB1bnljb2RlYCBvYmplY3QuXG5cdCAqIEBuYW1lIHB1bnljb2RlXG5cdCAqIEB0eXBlIE9iamVjdFxuXHQgKi9cblx0dmFyIHB1bnljb2RlLFxuXG5cdC8qKiBIaWdoZXN0IHBvc2l0aXZlIHNpZ25lZCAzMi1iaXQgZmxvYXQgdmFsdWUgKi9cblx0bWF4SW50ID0gMjE0NzQ4MzY0NywgLy8gYWthLiAweDdGRkZGRkZGIG9yIDJeMzEtMVxuXG5cdC8qKiBCb290c3RyaW5nIHBhcmFtZXRlcnMgKi9cblx0YmFzZSA9IDM2LFxuXHR0TWluID0gMSxcblx0dE1heCA9IDI2LFxuXHRza2V3ID0gMzgsXG5cdGRhbXAgPSA3MDAsXG5cdGluaXRpYWxCaWFzID0gNzIsXG5cdGluaXRpYWxOID0gMTI4LCAvLyAweDgwXG5cdGRlbGltaXRlciA9ICctJywgLy8gJ1xceDJEJ1xuXG5cdC8qKiBSZWd1bGFyIGV4cHJlc3Npb25zICovXG5cdHJlZ2V4UHVueWNvZGUgPSAvXnhuLS0vLFxuXHRyZWdleE5vbkFTQ0lJID0gL1teXFx4MjAtXFx4N0VdLywgLy8gdW5wcmludGFibGUgQVNDSUkgY2hhcnMgKyBub24tQVNDSUkgY2hhcnNcblx0cmVnZXhTZXBhcmF0b3JzID0gL1tcXHgyRVxcdTMwMDJcXHVGRjBFXFx1RkY2MV0vZywgLy8gUkZDIDM0OTAgc2VwYXJhdG9yc1xuXG5cdC8qKiBFcnJvciBtZXNzYWdlcyAqL1xuXHRlcnJvcnMgPSB7XG5cdFx0J292ZXJmbG93JzogJ092ZXJmbG93OiBpbnB1dCBuZWVkcyB3aWRlciBpbnRlZ2VycyB0byBwcm9jZXNzJyxcblx0XHQnbm90LWJhc2ljJzogJ0lsbGVnYWwgaW5wdXQgPj0gMHg4MCAobm90IGEgYmFzaWMgY29kZSBwb2ludCknLFxuXHRcdCdpbnZhbGlkLWlucHV0JzogJ0ludmFsaWQgaW5wdXQnXG5cdH0sXG5cblx0LyoqIENvbnZlbmllbmNlIHNob3J0Y3V0cyAqL1xuXHRiYXNlTWludXNUTWluID0gYmFzZSAtIHRNaW4sXG5cdGZsb29yID0gTWF0aC5mbG9vcixcblx0c3RyaW5nRnJvbUNoYXJDb2RlID0gU3RyaW5nLmZyb21DaGFyQ29kZSxcblxuXHQvKiogVGVtcG9yYXJ5IHZhcmlhYmxlICovXG5cdGtleTtcblxuXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuXHQvKipcblx0ICogQSBnZW5lcmljIGVycm9yIHV0aWxpdHkgZnVuY3Rpb24uXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlIFRoZSBlcnJvciB0eXBlLlxuXHQgKiBAcmV0dXJucyB7RXJyb3J9IFRocm93cyBhIGBSYW5nZUVycm9yYCB3aXRoIHRoZSBhcHBsaWNhYmxlIGVycm9yIG1lc3NhZ2UuXG5cdCAqL1xuXHRmdW5jdGlvbiBlcnJvcih0eXBlKSB7XG5cdFx0dGhyb3cgbmV3IFJhbmdlRXJyb3IoZXJyb3JzW3R5cGVdKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBIGdlbmVyaWMgYEFycmF5I21hcGAgdXRpbGl0eSBmdW5jdGlvbi5cblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtBcnJheX0gYXJyYXkgVGhlIGFycmF5IHRvIGl0ZXJhdGUgb3Zlci5cblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRoYXQgZ2V0cyBjYWxsZWQgZm9yIGV2ZXJ5IGFycmF5XG5cdCAqIGl0ZW0uXG5cdCAqIEByZXR1cm5zIHtBcnJheX0gQSBuZXcgYXJyYXkgb2YgdmFsdWVzIHJldHVybmVkIGJ5IHRoZSBjYWxsYmFjayBmdW5jdGlvbi5cblx0ICovXG5cdGZ1bmN0aW9uIG1hcChhcnJheSwgZm4pIHtcblx0XHR2YXIgbGVuZ3RoID0gYXJyYXkubGVuZ3RoO1xuXHRcdHZhciByZXN1bHQgPSBbXTtcblx0XHR3aGlsZSAobGVuZ3RoLS0pIHtcblx0XHRcdHJlc3VsdFtsZW5ndGhdID0gZm4oYXJyYXlbbGVuZ3RoXSk7XG5cdFx0fVxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cblxuXHQvKipcblx0ICogQSBzaW1wbGUgYEFycmF5I21hcGAtbGlrZSB3cmFwcGVyIHRvIHdvcmsgd2l0aCBkb21haW4gbmFtZSBzdHJpbmdzIG9yIGVtYWlsXG5cdCAqIGFkZHJlc3Nlcy5cblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IGRvbWFpbiBUaGUgZG9tYWluIG5hbWUgb3IgZW1haWwgYWRkcmVzcy5cblx0ICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRoYXQgZ2V0cyBjYWxsZWQgZm9yIGV2ZXJ5XG5cdCAqIGNoYXJhY3Rlci5cblx0ICogQHJldHVybnMge0FycmF5fSBBIG5ldyBzdHJpbmcgb2YgY2hhcmFjdGVycyByZXR1cm5lZCBieSB0aGUgY2FsbGJhY2tcblx0ICogZnVuY3Rpb24uXG5cdCAqL1xuXHRmdW5jdGlvbiBtYXBEb21haW4oc3RyaW5nLCBmbikge1xuXHRcdHZhciBwYXJ0cyA9IHN0cmluZy5zcGxpdCgnQCcpO1xuXHRcdHZhciByZXN1bHQgPSAnJztcblx0XHRpZiAocGFydHMubGVuZ3RoID4gMSkge1xuXHRcdFx0Ly8gSW4gZW1haWwgYWRkcmVzc2VzLCBvbmx5IHRoZSBkb21haW4gbmFtZSBzaG91bGQgYmUgcHVueWNvZGVkLiBMZWF2ZVxuXHRcdFx0Ly8gdGhlIGxvY2FsIHBhcnQgKGkuZS4gZXZlcnl0aGluZyB1cCB0byBgQGApIGludGFjdC5cblx0XHRcdHJlc3VsdCA9IHBhcnRzWzBdICsgJ0AnO1xuXHRcdFx0c3RyaW5nID0gcGFydHNbMV07XG5cdFx0fVxuXHRcdC8vIEF2b2lkIGBzcGxpdChyZWdleClgIGZvciBJRTggY29tcGF0aWJpbGl0eS4gU2VlICMxNy5cblx0XHRzdHJpbmcgPSBzdHJpbmcucmVwbGFjZShyZWdleFNlcGFyYXRvcnMsICdcXHgyRScpO1xuXHRcdHZhciBsYWJlbHMgPSBzdHJpbmcuc3BsaXQoJy4nKTtcblx0XHR2YXIgZW5jb2RlZCA9IG1hcChsYWJlbHMsIGZuKS5qb2luKCcuJyk7XG5cdFx0cmV0dXJuIHJlc3VsdCArIGVuY29kZWQ7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhbiBhcnJheSBjb250YWluaW5nIHRoZSBudW1lcmljIGNvZGUgcG9pbnRzIG9mIGVhY2ggVW5pY29kZVxuXHQgKiBjaGFyYWN0ZXIgaW4gdGhlIHN0cmluZy4gV2hpbGUgSmF2YVNjcmlwdCB1c2VzIFVDUy0yIGludGVybmFsbHksXG5cdCAqIHRoaXMgZnVuY3Rpb24gd2lsbCBjb252ZXJ0IGEgcGFpciBvZiBzdXJyb2dhdGUgaGFsdmVzIChlYWNoIG9mIHdoaWNoXG5cdCAqIFVDUy0yIGV4cG9zZXMgYXMgc2VwYXJhdGUgY2hhcmFjdGVycykgaW50byBhIHNpbmdsZSBjb2RlIHBvaW50LFxuXHQgKiBtYXRjaGluZyBVVEYtMTYuXG5cdCAqIEBzZWUgYHB1bnljb2RlLnVjczIuZW5jb2RlYFxuXHQgKiBAc2VlIDxodHRwczovL21hdGhpYXNieW5lbnMuYmUvbm90ZXMvamF2YXNjcmlwdC1lbmNvZGluZz5cblx0ICogQG1lbWJlck9mIHB1bnljb2RlLnVjczJcblx0ICogQG5hbWUgZGVjb2RlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBzdHJpbmcgVGhlIFVuaWNvZGUgaW5wdXQgc3RyaW5nIChVQ1MtMikuXG5cdCAqIEByZXR1cm5zIHtBcnJheX0gVGhlIG5ldyBhcnJheSBvZiBjb2RlIHBvaW50cy5cblx0ICovXG5cdGZ1bmN0aW9uIHVjczJkZWNvZGUoc3RyaW5nKSB7XG5cdFx0dmFyIG91dHB1dCA9IFtdLFxuXHRcdCAgICBjb3VudGVyID0gMCxcblx0XHQgICAgbGVuZ3RoID0gc3RyaW5nLmxlbmd0aCxcblx0XHQgICAgdmFsdWUsXG5cdFx0ICAgIGV4dHJhO1xuXHRcdHdoaWxlIChjb3VudGVyIDwgbGVuZ3RoKSB7XG5cdFx0XHR2YWx1ZSA9IHN0cmluZy5jaGFyQ29kZUF0KGNvdW50ZXIrKyk7XG5cdFx0XHRpZiAodmFsdWUgPj0gMHhEODAwICYmIHZhbHVlIDw9IDB4REJGRiAmJiBjb3VudGVyIDwgbGVuZ3RoKSB7XG5cdFx0XHRcdC8vIGhpZ2ggc3Vycm9nYXRlLCBhbmQgdGhlcmUgaXMgYSBuZXh0IGNoYXJhY3RlclxuXHRcdFx0XHRleHRyYSA9IHN0cmluZy5jaGFyQ29kZUF0KGNvdW50ZXIrKyk7XG5cdFx0XHRcdGlmICgoZXh0cmEgJiAweEZDMDApID09IDB4REMwMCkgeyAvLyBsb3cgc3Vycm9nYXRlXG5cdFx0XHRcdFx0b3V0cHV0LnB1c2goKCh2YWx1ZSAmIDB4M0ZGKSA8PCAxMCkgKyAoZXh0cmEgJiAweDNGRikgKyAweDEwMDAwKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyB1bm1hdGNoZWQgc3Vycm9nYXRlOyBvbmx5IGFwcGVuZCB0aGlzIGNvZGUgdW5pdCwgaW4gY2FzZSB0aGUgbmV4dFxuXHRcdFx0XHRcdC8vIGNvZGUgdW5pdCBpcyB0aGUgaGlnaCBzdXJyb2dhdGUgb2YgYSBzdXJyb2dhdGUgcGFpclxuXHRcdFx0XHRcdG91dHB1dC5wdXNoKHZhbHVlKTtcblx0XHRcdFx0XHRjb3VudGVyLS07XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG91dHB1dC5wdXNoKHZhbHVlKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG91dHB1dDtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgc3RyaW5nIGJhc2VkIG9uIGFuIGFycmF5IG9mIG51bWVyaWMgY29kZSBwb2ludHMuXG5cdCAqIEBzZWUgYHB1bnljb2RlLnVjczIuZGVjb2RlYFxuXHQgKiBAbWVtYmVyT2YgcHVueWNvZGUudWNzMlxuXHQgKiBAbmFtZSBlbmNvZGVcblx0ICogQHBhcmFtIHtBcnJheX0gY29kZVBvaW50cyBUaGUgYXJyYXkgb2YgbnVtZXJpYyBjb2RlIHBvaW50cy5cblx0ICogQHJldHVybnMge1N0cmluZ30gVGhlIG5ldyBVbmljb2RlIHN0cmluZyAoVUNTLTIpLlxuXHQgKi9cblx0ZnVuY3Rpb24gdWNzMmVuY29kZShhcnJheSkge1xuXHRcdHJldHVybiBtYXAoYXJyYXksIGZ1bmN0aW9uKHZhbHVlKSB7XG5cdFx0XHR2YXIgb3V0cHV0ID0gJyc7XG5cdFx0XHRpZiAodmFsdWUgPiAweEZGRkYpIHtcblx0XHRcdFx0dmFsdWUgLT0gMHgxMDAwMDtcblx0XHRcdFx0b3V0cHV0ICs9IHN0cmluZ0Zyb21DaGFyQ29kZSh2YWx1ZSA+Pj4gMTAgJiAweDNGRiB8IDB4RDgwMCk7XG5cdFx0XHRcdHZhbHVlID0gMHhEQzAwIHwgdmFsdWUgJiAweDNGRjtcblx0XHRcdH1cblx0XHRcdG91dHB1dCArPSBzdHJpbmdGcm9tQ2hhckNvZGUodmFsdWUpO1xuXHRcdFx0cmV0dXJuIG91dHB1dDtcblx0XHR9KS5qb2luKCcnKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhIGJhc2ljIGNvZGUgcG9pbnQgaW50byBhIGRpZ2l0L2ludGVnZXIuXG5cdCAqIEBzZWUgYGRpZ2l0VG9CYXNpYygpYFxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0ge051bWJlcn0gY29kZVBvaW50IFRoZSBiYXNpYyBudW1lcmljIGNvZGUgcG9pbnQgdmFsdWUuXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IFRoZSBudW1lcmljIHZhbHVlIG9mIGEgYmFzaWMgY29kZSBwb2ludCAoZm9yIHVzZSBpblxuXHQgKiByZXByZXNlbnRpbmcgaW50ZWdlcnMpIGluIHRoZSByYW5nZSBgMGAgdG8gYGJhc2UgLSAxYCwgb3IgYGJhc2VgIGlmXG5cdCAqIHRoZSBjb2RlIHBvaW50IGRvZXMgbm90IHJlcHJlc2VudCBhIHZhbHVlLlxuXHQgKi9cblx0ZnVuY3Rpb24gYmFzaWNUb0RpZ2l0KGNvZGVQb2ludCkge1xuXHRcdGlmIChjb2RlUG9pbnQgLSA0OCA8IDEwKSB7XG5cdFx0XHRyZXR1cm4gY29kZVBvaW50IC0gMjI7XG5cdFx0fVxuXHRcdGlmIChjb2RlUG9pbnQgLSA2NSA8IDI2KSB7XG5cdFx0XHRyZXR1cm4gY29kZVBvaW50IC0gNjU7XG5cdFx0fVxuXHRcdGlmIChjb2RlUG9pbnQgLSA5NyA8IDI2KSB7XG5cdFx0XHRyZXR1cm4gY29kZVBvaW50IC0gOTc7XG5cdFx0fVxuXHRcdHJldHVybiBiYXNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIGEgZGlnaXQvaW50ZWdlciBpbnRvIGEgYmFzaWMgY29kZSBwb2ludC5cblx0ICogQHNlZSBgYmFzaWNUb0RpZ2l0KClgXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSB7TnVtYmVyfSBkaWdpdCBUaGUgbnVtZXJpYyB2YWx1ZSBvZiBhIGJhc2ljIGNvZGUgcG9pbnQuXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IFRoZSBiYXNpYyBjb2RlIHBvaW50IHdob3NlIHZhbHVlICh3aGVuIHVzZWQgZm9yXG5cdCAqIHJlcHJlc2VudGluZyBpbnRlZ2VycykgaXMgYGRpZ2l0YCwgd2hpY2ggbmVlZHMgdG8gYmUgaW4gdGhlIHJhbmdlXG5cdCAqIGAwYCB0byBgYmFzZSAtIDFgLiBJZiBgZmxhZ2AgaXMgbm9uLXplcm8sIHRoZSB1cHBlcmNhc2UgZm9ybSBpc1xuXHQgKiB1c2VkOyBlbHNlLCB0aGUgbG93ZXJjYXNlIGZvcm0gaXMgdXNlZC4gVGhlIGJlaGF2aW9yIGlzIHVuZGVmaW5lZFxuXHQgKiBpZiBgZmxhZ2AgaXMgbm9uLXplcm8gYW5kIGBkaWdpdGAgaGFzIG5vIHVwcGVyY2FzZSBmb3JtLlxuXHQgKi9cblx0ZnVuY3Rpb24gZGlnaXRUb0Jhc2ljKGRpZ2l0LCBmbGFnKSB7XG5cdFx0Ly8gIDAuLjI1IG1hcCB0byBBU0NJSSBhLi56IG9yIEEuLlpcblx0XHQvLyAyNi4uMzUgbWFwIHRvIEFTQ0lJIDAuLjlcblx0XHRyZXR1cm4gZGlnaXQgKyAyMiArIDc1ICogKGRpZ2l0IDwgMjYpIC0gKChmbGFnICE9IDApIDw8IDUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEJpYXMgYWRhcHRhdGlvbiBmdW5jdGlvbiBhcyBwZXIgc2VjdGlvbiAzLjQgb2YgUkZDIDM0OTIuXG5cdCAqIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzNDkyI3NlY3Rpb24tMy40XG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRmdW5jdGlvbiBhZGFwdChkZWx0YSwgbnVtUG9pbnRzLCBmaXJzdFRpbWUpIHtcblx0XHR2YXIgayA9IDA7XG5cdFx0ZGVsdGEgPSBmaXJzdFRpbWUgPyBmbG9vcihkZWx0YSAvIGRhbXApIDogZGVsdGEgPj4gMTtcblx0XHRkZWx0YSArPSBmbG9vcihkZWx0YSAvIG51bVBvaW50cyk7XG5cdFx0Zm9yICgvKiBubyBpbml0aWFsaXphdGlvbiAqLzsgZGVsdGEgPiBiYXNlTWludXNUTWluICogdE1heCA+PiAxOyBrICs9IGJhc2UpIHtcblx0XHRcdGRlbHRhID0gZmxvb3IoZGVsdGEgLyBiYXNlTWludXNUTWluKTtcblx0XHR9XG5cdFx0cmV0dXJuIGZsb29yKGsgKyAoYmFzZU1pbnVzVE1pbiArIDEpICogZGVsdGEgLyAoZGVsdGEgKyBza2V3KSk7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgYSBQdW55Y29kZSBzdHJpbmcgb2YgQVNDSUktb25seSBzeW1ib2xzIHRvIGEgc3RyaW5nIG9mIFVuaWNvZGVcblx0ICogc3ltYm9scy5cblx0ICogQG1lbWJlck9mIHB1bnljb2RlXG5cdCAqIEBwYXJhbSB7U3RyaW5nfSBpbnB1dCBUaGUgUHVueWNvZGUgc3RyaW5nIG9mIEFTQ0lJLW9ubHkgc3ltYm9scy5cblx0ICogQHJldHVybnMge1N0cmluZ30gVGhlIHJlc3VsdGluZyBzdHJpbmcgb2YgVW5pY29kZSBzeW1ib2xzLlxuXHQgKi9cblx0ZnVuY3Rpb24gZGVjb2RlKGlucHV0KSB7XG5cdFx0Ly8gRG9uJ3QgdXNlIFVDUy0yXG5cdFx0dmFyIG91dHB1dCA9IFtdLFxuXHRcdCAgICBpbnB1dExlbmd0aCA9IGlucHV0Lmxlbmd0aCxcblx0XHQgICAgb3V0LFxuXHRcdCAgICBpID0gMCxcblx0XHQgICAgbiA9IGluaXRpYWxOLFxuXHRcdCAgICBiaWFzID0gaW5pdGlhbEJpYXMsXG5cdFx0ICAgIGJhc2ljLFxuXHRcdCAgICBqLFxuXHRcdCAgICBpbmRleCxcblx0XHQgICAgb2xkaSxcblx0XHQgICAgdyxcblx0XHQgICAgayxcblx0XHQgICAgZGlnaXQsXG5cdFx0ICAgIHQsXG5cdFx0ICAgIC8qKiBDYWNoZWQgY2FsY3VsYXRpb24gcmVzdWx0cyAqL1xuXHRcdCAgICBiYXNlTWludXNUO1xuXG5cdFx0Ly8gSGFuZGxlIHRoZSBiYXNpYyBjb2RlIHBvaW50czogbGV0IGBiYXNpY2AgYmUgdGhlIG51bWJlciBvZiBpbnB1dCBjb2RlXG5cdFx0Ly8gcG9pbnRzIGJlZm9yZSB0aGUgbGFzdCBkZWxpbWl0ZXIsIG9yIGAwYCBpZiB0aGVyZSBpcyBub25lLCB0aGVuIGNvcHlcblx0XHQvLyB0aGUgZmlyc3QgYmFzaWMgY29kZSBwb2ludHMgdG8gdGhlIG91dHB1dC5cblxuXHRcdGJhc2ljID0gaW5wdXQubGFzdEluZGV4T2YoZGVsaW1pdGVyKTtcblx0XHRpZiAoYmFzaWMgPCAwKSB7XG5cdFx0XHRiYXNpYyA9IDA7XG5cdFx0fVxuXG5cdFx0Zm9yIChqID0gMDsgaiA8IGJhc2ljOyArK2opIHtcblx0XHRcdC8vIGlmIGl0J3Mgbm90IGEgYmFzaWMgY29kZSBwb2ludFxuXHRcdFx0aWYgKGlucHV0LmNoYXJDb2RlQXQoaikgPj0gMHg4MCkge1xuXHRcdFx0XHRlcnJvcignbm90LWJhc2ljJyk7XG5cdFx0XHR9XG5cdFx0XHRvdXRwdXQucHVzaChpbnB1dC5jaGFyQ29kZUF0KGopKTtcblx0XHR9XG5cblx0XHQvLyBNYWluIGRlY29kaW5nIGxvb3A6IHN0YXJ0IGp1c3QgYWZ0ZXIgdGhlIGxhc3QgZGVsaW1pdGVyIGlmIGFueSBiYXNpYyBjb2RlXG5cdFx0Ly8gcG9pbnRzIHdlcmUgY29waWVkOyBzdGFydCBhdCB0aGUgYmVnaW5uaW5nIG90aGVyd2lzZS5cblxuXHRcdGZvciAoaW5kZXggPSBiYXNpYyA+IDAgPyBiYXNpYyArIDEgOiAwOyBpbmRleCA8IGlucHV0TGVuZ3RoOyAvKiBubyBmaW5hbCBleHByZXNzaW9uICovKSB7XG5cblx0XHRcdC8vIGBpbmRleGAgaXMgdGhlIGluZGV4IG9mIHRoZSBuZXh0IGNoYXJhY3RlciB0byBiZSBjb25zdW1lZC5cblx0XHRcdC8vIERlY29kZSBhIGdlbmVyYWxpemVkIHZhcmlhYmxlLWxlbmd0aCBpbnRlZ2VyIGludG8gYGRlbHRhYCxcblx0XHRcdC8vIHdoaWNoIGdldHMgYWRkZWQgdG8gYGlgLiBUaGUgb3ZlcmZsb3cgY2hlY2tpbmcgaXMgZWFzaWVyXG5cdFx0XHQvLyBpZiB3ZSBpbmNyZWFzZSBgaWAgYXMgd2UgZ28sIHRoZW4gc3VidHJhY3Qgb2ZmIGl0cyBzdGFydGluZ1xuXHRcdFx0Ly8gdmFsdWUgYXQgdGhlIGVuZCB0byBvYnRhaW4gYGRlbHRhYC5cblx0XHRcdGZvciAob2xkaSA9IGksIHcgPSAxLCBrID0gYmFzZTsgLyogbm8gY29uZGl0aW9uICovOyBrICs9IGJhc2UpIHtcblxuXHRcdFx0XHRpZiAoaW5kZXggPj0gaW5wdXRMZW5ndGgpIHtcblx0XHRcdFx0XHRlcnJvcignaW52YWxpZC1pbnB1dCcpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0ZGlnaXQgPSBiYXNpY1RvRGlnaXQoaW5wdXQuY2hhckNvZGVBdChpbmRleCsrKSk7XG5cblx0XHRcdFx0aWYgKGRpZ2l0ID49IGJhc2UgfHwgZGlnaXQgPiBmbG9vcigobWF4SW50IC0gaSkgLyB3KSkge1xuXHRcdFx0XHRcdGVycm9yKCdvdmVyZmxvdycpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aSArPSBkaWdpdCAqIHc7XG5cdFx0XHRcdHQgPSBrIDw9IGJpYXMgPyB0TWluIDogKGsgPj0gYmlhcyArIHRNYXggPyB0TWF4IDogayAtIGJpYXMpO1xuXG5cdFx0XHRcdGlmIChkaWdpdCA8IHQpIHtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGJhc2VNaW51c1QgPSBiYXNlIC0gdDtcblx0XHRcdFx0aWYgKHcgPiBmbG9vcihtYXhJbnQgLyBiYXNlTWludXNUKSkge1xuXHRcdFx0XHRcdGVycm9yKCdvdmVyZmxvdycpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dyAqPSBiYXNlTWludXNUO1xuXG5cdFx0XHR9XG5cblx0XHRcdG91dCA9IG91dHB1dC5sZW5ndGggKyAxO1xuXHRcdFx0YmlhcyA9IGFkYXB0KGkgLSBvbGRpLCBvdXQsIG9sZGkgPT0gMCk7XG5cblx0XHRcdC8vIGBpYCB3YXMgc3VwcG9zZWQgdG8gd3JhcCBhcm91bmQgZnJvbSBgb3V0YCB0byBgMGAsXG5cdFx0XHQvLyBpbmNyZW1lbnRpbmcgYG5gIGVhY2ggdGltZSwgc28gd2UnbGwgZml4IHRoYXQgbm93OlxuXHRcdFx0aWYgKGZsb29yKGkgLyBvdXQpID4gbWF4SW50IC0gbikge1xuXHRcdFx0XHRlcnJvcignb3ZlcmZsb3cnKTtcblx0XHRcdH1cblxuXHRcdFx0biArPSBmbG9vcihpIC8gb3V0KTtcblx0XHRcdGkgJT0gb3V0O1xuXG5cdFx0XHQvLyBJbnNlcnQgYG5gIGF0IHBvc2l0aW9uIGBpYCBvZiB0aGUgb3V0cHV0XG5cdFx0XHRvdXRwdXQuc3BsaWNlKGkrKywgMCwgbik7XG5cblx0XHR9XG5cblx0XHRyZXR1cm4gdWNzMmVuY29kZShvdXRwdXQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIGEgc3RyaW5nIG9mIFVuaWNvZGUgc3ltYm9scyAoZS5nLiBhIGRvbWFpbiBuYW1lIGxhYmVsKSB0byBhXG5cdCAqIFB1bnljb2RlIHN0cmluZyBvZiBBU0NJSS1vbmx5IHN5bWJvbHMuXG5cdCAqIEBtZW1iZXJPZiBwdW55Y29kZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gaW5wdXQgVGhlIHN0cmluZyBvZiBVbmljb2RlIHN5bWJvbHMuXG5cdCAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSByZXN1bHRpbmcgUHVueWNvZGUgc3RyaW5nIG9mIEFTQ0lJLW9ubHkgc3ltYm9scy5cblx0ICovXG5cdGZ1bmN0aW9uIGVuY29kZShpbnB1dCkge1xuXHRcdHZhciBuLFxuXHRcdCAgICBkZWx0YSxcblx0XHQgICAgaGFuZGxlZENQQ291bnQsXG5cdFx0ICAgIGJhc2ljTGVuZ3RoLFxuXHRcdCAgICBiaWFzLFxuXHRcdCAgICBqLFxuXHRcdCAgICBtLFxuXHRcdCAgICBxLFxuXHRcdCAgICBrLFxuXHRcdCAgICB0LFxuXHRcdCAgICBjdXJyZW50VmFsdWUsXG5cdFx0ICAgIG91dHB1dCA9IFtdLFxuXHRcdCAgICAvKiogYGlucHV0TGVuZ3RoYCB3aWxsIGhvbGQgdGhlIG51bWJlciBvZiBjb2RlIHBvaW50cyBpbiBgaW5wdXRgLiAqL1xuXHRcdCAgICBpbnB1dExlbmd0aCxcblx0XHQgICAgLyoqIENhY2hlZCBjYWxjdWxhdGlvbiByZXN1bHRzICovXG5cdFx0ICAgIGhhbmRsZWRDUENvdW50UGx1c09uZSxcblx0XHQgICAgYmFzZU1pbnVzVCxcblx0XHQgICAgcU1pbnVzVDtcblxuXHRcdC8vIENvbnZlcnQgdGhlIGlucHV0IGluIFVDUy0yIHRvIFVuaWNvZGVcblx0XHRpbnB1dCA9IHVjczJkZWNvZGUoaW5wdXQpO1xuXG5cdFx0Ly8gQ2FjaGUgdGhlIGxlbmd0aFxuXHRcdGlucHV0TGVuZ3RoID0gaW5wdXQubGVuZ3RoO1xuXG5cdFx0Ly8gSW5pdGlhbGl6ZSB0aGUgc3RhdGVcblx0XHRuID0gaW5pdGlhbE47XG5cdFx0ZGVsdGEgPSAwO1xuXHRcdGJpYXMgPSBpbml0aWFsQmlhcztcblxuXHRcdC8vIEhhbmRsZSB0aGUgYmFzaWMgY29kZSBwb2ludHNcblx0XHRmb3IgKGogPSAwOyBqIDwgaW5wdXRMZW5ndGg7ICsraikge1xuXHRcdFx0Y3VycmVudFZhbHVlID0gaW5wdXRbal07XG5cdFx0XHRpZiAoY3VycmVudFZhbHVlIDwgMHg4MCkge1xuXHRcdFx0XHRvdXRwdXQucHVzaChzdHJpbmdGcm9tQ2hhckNvZGUoY3VycmVudFZhbHVlKSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aGFuZGxlZENQQ291bnQgPSBiYXNpY0xlbmd0aCA9IG91dHB1dC5sZW5ndGg7XG5cblx0XHQvLyBgaGFuZGxlZENQQ291bnRgIGlzIHRoZSBudW1iZXIgb2YgY29kZSBwb2ludHMgdGhhdCBoYXZlIGJlZW4gaGFuZGxlZDtcblx0XHQvLyBgYmFzaWNMZW5ndGhgIGlzIHRoZSBudW1iZXIgb2YgYmFzaWMgY29kZSBwb2ludHMuXG5cblx0XHQvLyBGaW5pc2ggdGhlIGJhc2ljIHN0cmluZyAtIGlmIGl0IGlzIG5vdCBlbXB0eSAtIHdpdGggYSBkZWxpbWl0ZXJcblx0XHRpZiAoYmFzaWNMZW5ndGgpIHtcblx0XHRcdG91dHB1dC5wdXNoKGRlbGltaXRlcik7XG5cdFx0fVxuXG5cdFx0Ly8gTWFpbiBlbmNvZGluZyBsb29wOlxuXHRcdHdoaWxlIChoYW5kbGVkQ1BDb3VudCA8IGlucHV0TGVuZ3RoKSB7XG5cblx0XHRcdC8vIEFsbCBub24tYmFzaWMgY29kZSBwb2ludHMgPCBuIGhhdmUgYmVlbiBoYW5kbGVkIGFscmVhZHkuIEZpbmQgdGhlIG5leHRcblx0XHRcdC8vIGxhcmdlciBvbmU6XG5cdFx0XHRmb3IgKG0gPSBtYXhJbnQsIGogPSAwOyBqIDwgaW5wdXRMZW5ndGg7ICsraikge1xuXHRcdFx0XHRjdXJyZW50VmFsdWUgPSBpbnB1dFtqXTtcblx0XHRcdFx0aWYgKGN1cnJlbnRWYWx1ZSA+PSBuICYmIGN1cnJlbnRWYWx1ZSA8IG0pIHtcblx0XHRcdFx0XHRtID0gY3VycmVudFZhbHVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vIEluY3JlYXNlIGBkZWx0YWAgZW5vdWdoIHRvIGFkdmFuY2UgdGhlIGRlY29kZXIncyA8bixpPiBzdGF0ZSB0byA8bSwwPixcblx0XHRcdC8vIGJ1dCBndWFyZCBhZ2FpbnN0IG92ZXJmbG93XG5cdFx0XHRoYW5kbGVkQ1BDb3VudFBsdXNPbmUgPSBoYW5kbGVkQ1BDb3VudCArIDE7XG5cdFx0XHRpZiAobSAtIG4gPiBmbG9vcigobWF4SW50IC0gZGVsdGEpIC8gaGFuZGxlZENQQ291bnRQbHVzT25lKSkge1xuXHRcdFx0XHRlcnJvcignb3ZlcmZsb3cnKTtcblx0XHRcdH1cblxuXHRcdFx0ZGVsdGEgKz0gKG0gLSBuKSAqIGhhbmRsZWRDUENvdW50UGx1c09uZTtcblx0XHRcdG4gPSBtO1xuXG5cdFx0XHRmb3IgKGogPSAwOyBqIDwgaW5wdXRMZW5ndGg7ICsraikge1xuXHRcdFx0XHRjdXJyZW50VmFsdWUgPSBpbnB1dFtqXTtcblxuXHRcdFx0XHRpZiAoY3VycmVudFZhbHVlIDwgbiAmJiArK2RlbHRhID4gbWF4SW50KSB7XG5cdFx0XHRcdFx0ZXJyb3IoJ292ZXJmbG93Jyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoY3VycmVudFZhbHVlID09IG4pIHtcblx0XHRcdFx0XHQvLyBSZXByZXNlbnQgZGVsdGEgYXMgYSBnZW5lcmFsaXplZCB2YXJpYWJsZS1sZW5ndGggaW50ZWdlclxuXHRcdFx0XHRcdGZvciAocSA9IGRlbHRhLCBrID0gYmFzZTsgLyogbm8gY29uZGl0aW9uICovOyBrICs9IGJhc2UpIHtcblx0XHRcdFx0XHRcdHQgPSBrIDw9IGJpYXMgPyB0TWluIDogKGsgPj0gYmlhcyArIHRNYXggPyB0TWF4IDogayAtIGJpYXMpO1xuXHRcdFx0XHRcdFx0aWYgKHEgPCB0KSB7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0cU1pbnVzVCA9IHEgLSB0O1xuXHRcdFx0XHRcdFx0YmFzZU1pbnVzVCA9IGJhc2UgLSB0O1xuXHRcdFx0XHRcdFx0b3V0cHV0LnB1c2goXG5cdFx0XHRcdFx0XHRcdHN0cmluZ0Zyb21DaGFyQ29kZShkaWdpdFRvQmFzaWModCArIHFNaW51c1QgJSBiYXNlTWludXNULCAwKSlcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRxID0gZmxvb3IocU1pbnVzVCAvIGJhc2VNaW51c1QpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdG91dHB1dC5wdXNoKHN0cmluZ0Zyb21DaGFyQ29kZShkaWdpdFRvQmFzaWMocSwgMCkpKTtcblx0XHRcdFx0XHRiaWFzID0gYWRhcHQoZGVsdGEsIGhhbmRsZWRDUENvdW50UGx1c09uZSwgaGFuZGxlZENQQ291bnQgPT0gYmFzaWNMZW5ndGgpO1xuXHRcdFx0XHRcdGRlbHRhID0gMDtcblx0XHRcdFx0XHQrK2hhbmRsZWRDUENvdW50O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdCsrZGVsdGE7XG5cdFx0XHQrK247XG5cblx0XHR9XG5cdFx0cmV0dXJuIG91dHB1dC5qb2luKCcnKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0cyBhIFB1bnljb2RlIHN0cmluZyByZXByZXNlbnRpbmcgYSBkb21haW4gbmFtZSBvciBhbiBlbWFpbCBhZGRyZXNzXG5cdCAqIHRvIFVuaWNvZGUuIE9ubHkgdGhlIFB1bnljb2RlZCBwYXJ0cyBvZiB0aGUgaW5wdXQgd2lsbCBiZSBjb252ZXJ0ZWQsIGkuZS5cblx0ICogaXQgZG9lc24ndCBtYXR0ZXIgaWYgeW91IGNhbGwgaXQgb24gYSBzdHJpbmcgdGhhdCBoYXMgYWxyZWFkeSBiZWVuXG5cdCAqIGNvbnZlcnRlZCB0byBVbmljb2RlLlxuXHQgKiBAbWVtYmVyT2YgcHVueWNvZGVcblx0ICogQHBhcmFtIHtTdHJpbmd9IGlucHV0IFRoZSBQdW55Y29kZWQgZG9tYWluIG5hbWUgb3IgZW1haWwgYWRkcmVzcyB0b1xuXHQgKiBjb252ZXJ0IHRvIFVuaWNvZGUuXG5cdCAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBVbmljb2RlIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBnaXZlbiBQdW55Y29kZVxuXHQgKiBzdHJpbmcuXG5cdCAqL1xuXHRmdW5jdGlvbiB0b1VuaWNvZGUoaW5wdXQpIHtcblx0XHRyZXR1cm4gbWFwRG9tYWluKGlucHV0LCBmdW5jdGlvbihzdHJpbmcpIHtcblx0XHRcdHJldHVybiByZWdleFB1bnljb2RlLnRlc3Qoc3RyaW5nKVxuXHRcdFx0XHQ/IGRlY29kZShzdHJpbmcuc2xpY2UoNCkudG9Mb3dlckNhc2UoKSlcblx0XHRcdFx0OiBzdHJpbmc7XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogQ29udmVydHMgYSBVbmljb2RlIHN0cmluZyByZXByZXNlbnRpbmcgYSBkb21haW4gbmFtZSBvciBhbiBlbWFpbCBhZGRyZXNzIHRvXG5cdCAqIFB1bnljb2RlLiBPbmx5IHRoZSBub24tQVNDSUkgcGFydHMgb2YgdGhlIGRvbWFpbiBuYW1lIHdpbGwgYmUgY29udmVydGVkLFxuXHQgKiBpLmUuIGl0IGRvZXNuJ3QgbWF0dGVyIGlmIHlvdSBjYWxsIGl0IHdpdGggYSBkb21haW4gdGhhdCdzIGFscmVhZHkgaW5cblx0ICogQVNDSUkuXG5cdCAqIEBtZW1iZXJPZiBwdW55Y29kZVxuXHQgKiBAcGFyYW0ge1N0cmluZ30gaW5wdXQgVGhlIGRvbWFpbiBuYW1lIG9yIGVtYWlsIGFkZHJlc3MgdG8gY29udmVydCwgYXMgYVxuXHQgKiBVbmljb2RlIHN0cmluZy5cblx0ICogQHJldHVybnMge1N0cmluZ30gVGhlIFB1bnljb2RlIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBnaXZlbiBkb21haW4gbmFtZSBvclxuXHQgKiBlbWFpbCBhZGRyZXNzLlxuXHQgKi9cblx0ZnVuY3Rpb24gdG9BU0NJSShpbnB1dCkge1xuXHRcdHJldHVybiBtYXBEb21haW4oaW5wdXQsIGZ1bmN0aW9uKHN0cmluZykge1xuXHRcdFx0cmV0dXJuIHJlZ2V4Tm9uQVNDSUkudGVzdChzdHJpbmcpXG5cdFx0XHRcdD8gJ3huLS0nICsgZW5jb2RlKHN0cmluZylcblx0XHRcdFx0OiBzdHJpbmc7XG5cdFx0fSk7XG5cdH1cblxuXHQvKi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKi9cblxuXHQvKiogRGVmaW5lIHRoZSBwdWJsaWMgQVBJICovXG5cdHB1bnljb2RlID0ge1xuXHRcdC8qKlxuXHRcdCAqIEEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgY3VycmVudCBQdW55Y29kZS5qcyB2ZXJzaW9uIG51bWJlci5cblx0XHQgKiBAbWVtYmVyT2YgcHVueWNvZGVcblx0XHQgKiBAdHlwZSBTdHJpbmdcblx0XHQgKi9cblx0XHQndmVyc2lvbic6ICcxLjMuMicsXG5cdFx0LyoqXG5cdFx0ICogQW4gb2JqZWN0IG9mIG1ldGhvZHMgdG8gY29udmVydCBmcm9tIEphdmFTY3JpcHQncyBpbnRlcm5hbCBjaGFyYWN0ZXJcblx0XHQgKiByZXByZXNlbnRhdGlvbiAoVUNTLTIpIHRvIFVuaWNvZGUgY29kZSBwb2ludHMsIGFuZCBiYWNrLlxuXHRcdCAqIEBzZWUgPGh0dHBzOi8vbWF0aGlhc2J5bmVucy5iZS9ub3Rlcy9qYXZhc2NyaXB0LWVuY29kaW5nPlxuXHRcdCAqIEBtZW1iZXJPZiBwdW55Y29kZVxuXHRcdCAqIEB0eXBlIE9iamVjdFxuXHRcdCAqL1xuXHRcdCd1Y3MyJzoge1xuXHRcdFx0J2RlY29kZSc6IHVjczJkZWNvZGUsXG5cdFx0XHQnZW5jb2RlJzogdWNzMmVuY29kZVxuXHRcdH0sXG5cdFx0J2RlY29kZSc6IGRlY29kZSxcblx0XHQnZW5jb2RlJzogZW5jb2RlLFxuXHRcdCd0b0FTQ0lJJzogdG9BU0NJSSxcblx0XHQndG9Vbmljb2RlJzogdG9Vbmljb2RlXG5cdH07XG5cblx0LyoqIEV4cG9zZSBgcHVueWNvZGVgICovXG5cdC8vIFNvbWUgQU1EIGJ1aWxkIG9wdGltaXplcnMsIGxpa2Ugci5qcywgY2hlY2sgZm9yIHNwZWNpZmljIGNvbmRpdGlvbiBwYXR0ZXJuc1xuXHQvLyBsaWtlIHRoZSBmb2xsb3dpbmc6XG5cdGlmIChcblx0XHR0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiZcblx0XHR0eXBlb2YgZGVmaW5lLmFtZCA9PSAnb2JqZWN0JyAmJlxuXHRcdGRlZmluZS5hbWRcblx0KSB7XG5cdFx0ZGVmaW5lKCdwdW55Y29kZScsIGZ1bmN0aW9uKCkge1xuXHRcdFx0cmV0dXJuIHB1bnljb2RlO1xuXHRcdH0pO1xuXHR9IGVsc2UgaWYgKGZyZWVFeHBvcnRzICYmIGZyZWVNb2R1bGUpIHtcblx0XHRpZiAobW9kdWxlLmV4cG9ydHMgPT0gZnJlZUV4cG9ydHMpIHtcblx0XHRcdC8vIGluIE5vZGUuanMsIGlvLmpzLCBvciBSaW5nb0pTIHYwLjguMCtcblx0XHRcdGZyZWVNb2R1bGUuZXhwb3J0cyA9IHB1bnljb2RlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBpbiBOYXJ3aGFsIG9yIFJpbmdvSlMgdjAuNy4wLVxuXHRcdFx0Zm9yIChrZXkgaW4gcHVueWNvZGUpIHtcblx0XHRcdFx0cHVueWNvZGUuaGFzT3duUHJvcGVydHkoa2V5KSAmJiAoZnJlZUV4cG9ydHNba2V5XSA9IHB1bnljb2RlW2tleV0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fSBlbHNlIHtcblx0XHQvLyBpbiBSaGlubyBvciBhIHdlYiBicm93c2VyXG5cdFx0cm9vdC5wdW55Y29kZSA9IHB1bnljb2RlO1xuXHR9XG5cbn0odGhpcykpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG52YXIgX2hlbHBlcnNFdmVudCA9IHJlcXVpcmUoJy4vaGVscGVycy9ldmVudCcpO1xuXG52YXIgX2hlbHBlcnNFdmVudDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9oZWxwZXJzRXZlbnQpO1xuXG52YXIgX2hlbHBlcnNNZXNzYWdlRXZlbnQgPSByZXF1aXJlKCcuL2hlbHBlcnMvbWVzc2FnZS1ldmVudCcpO1xuXG52YXIgX2hlbHBlcnNNZXNzYWdlRXZlbnQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaGVscGVyc01lc3NhZ2VFdmVudCk7XG5cbnZhciBfaGVscGVyc0Nsb3NlRXZlbnQgPSByZXF1aXJlKCcuL2hlbHBlcnMvY2xvc2UtZXZlbnQnKTtcblxudmFyIF9oZWxwZXJzQ2xvc2VFdmVudDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9oZWxwZXJzQ2xvc2VFdmVudCk7XG5cbi8qXG4qIENyZWF0ZXMgYW4gRXZlbnQgb2JqZWN0IGFuZCBleHRlbmRzIGl0IHRvIGFsbG93IGZ1bGwgbW9kaWZpY2F0aW9uIG9mXG4qIGl0cyBwcm9wZXJ0aWVzLlxuKlxuKiBAcGFyYW0ge29iamVjdH0gY29uZmlnIC0gd2l0aGluIGNvbmZpZyB5b3Ugd2lsbCBuZWVkIHRvIHBhc3MgdHlwZSBhbmQgb3B0aW9uYWxseSB0YXJnZXRcbiovXG5mdW5jdGlvbiBjcmVhdGVFdmVudChjb25maWcpIHtcbiAgdmFyIHR5cGUgPSBjb25maWcudHlwZTtcbiAgdmFyIHRhcmdldCA9IGNvbmZpZy50YXJnZXQ7XG5cbiAgdmFyIGV2ZW50T2JqZWN0ID0gbmV3IF9oZWxwZXJzRXZlbnQyWydkZWZhdWx0J10odHlwZSk7XG5cbiAgaWYgKHRhcmdldCkge1xuICAgIGV2ZW50T2JqZWN0LnRhcmdldCA9IHRhcmdldDtcbiAgICBldmVudE9iamVjdC5zcmNFbGVtZW50ID0gdGFyZ2V0O1xuICAgIGV2ZW50T2JqZWN0LmN1cnJlbnRUYXJnZXQgPSB0YXJnZXQ7XG4gIH1cblxuICByZXR1cm4gZXZlbnRPYmplY3Q7XG59XG5cbi8qXG4qIENyZWF0ZXMgYSBNZXNzYWdlRXZlbnQgb2JqZWN0IGFuZCBleHRlbmRzIGl0IHRvIGFsbG93IGZ1bGwgbW9kaWZpY2F0aW9uIG9mXG4qIGl0cyBwcm9wZXJ0aWVzLlxuKlxuKiBAcGFyYW0ge29iamVjdH0gY29uZmlnIC0gd2l0aGluIGNvbmZpZyB5b3Ugd2lsbCBuZWVkIHRvIHBhc3MgdHlwZSwgb3JpZ2luLCBkYXRhIGFuZCBvcHRpb25hbGx5IHRhcmdldFxuKi9cbmZ1bmN0aW9uIGNyZWF0ZU1lc3NhZ2VFdmVudChjb25maWcpIHtcbiAgdmFyIHR5cGUgPSBjb25maWcudHlwZTtcbiAgdmFyIG9yaWdpbiA9IGNvbmZpZy5vcmlnaW47XG4gIHZhciBkYXRhID0gY29uZmlnLmRhdGE7XG4gIHZhciB0YXJnZXQgPSBjb25maWcudGFyZ2V0O1xuXG4gIHZhciBtZXNzYWdlRXZlbnQgPSBuZXcgX2hlbHBlcnNNZXNzYWdlRXZlbnQyWydkZWZhdWx0J10odHlwZSwge1xuICAgIGRhdGE6IGRhdGEsXG4gICAgb3JpZ2luOiBvcmlnaW5cbiAgfSk7XG5cbiAgaWYgKHRhcmdldCkge1xuICAgIG1lc3NhZ2VFdmVudC50YXJnZXQgPSB0YXJnZXQ7XG4gICAgbWVzc2FnZUV2ZW50LnNyY0VsZW1lbnQgPSB0YXJnZXQ7XG4gICAgbWVzc2FnZUV2ZW50LmN1cnJlbnRUYXJnZXQgPSB0YXJnZXQ7XG4gIH1cblxuICByZXR1cm4gbWVzc2FnZUV2ZW50O1xufVxuXG4vKlxuKiBDcmVhdGVzIGEgQ2xvc2VFdmVudCBvYmplY3QgYW5kIGV4dGVuZHMgaXQgdG8gYWxsb3cgZnVsbCBtb2RpZmljYXRpb24gb2ZcbiogaXRzIHByb3BlcnRpZXMuXG4qXG4qIEBwYXJhbSB7b2JqZWN0fSBjb25maWcgLSB3aXRoaW4gY29uZmlnIHlvdSB3aWxsIG5lZWQgdG8gcGFzcyB0eXBlIGFuZCBvcHRpb25hbGx5IHRhcmdldCwgY29kZSwgYW5kIHJlYXNvblxuKi9cbmZ1bmN0aW9uIGNyZWF0ZUNsb3NlRXZlbnQoY29uZmlnKSB7XG4gIHZhciBjb2RlID0gY29uZmlnLmNvZGU7XG4gIHZhciByZWFzb24gPSBjb25maWcucmVhc29uO1xuICB2YXIgdHlwZSA9IGNvbmZpZy50eXBlO1xuICB2YXIgdGFyZ2V0ID0gY29uZmlnLnRhcmdldDtcbiAgdmFyIHdhc0NsZWFuID0gY29uZmlnLndhc0NsZWFuO1xuXG4gIGlmICghd2FzQ2xlYW4pIHtcbiAgICB3YXNDbGVhbiA9IGNvZGUgPT09IDEwMDA7XG4gIH1cblxuICB2YXIgY2xvc2VFdmVudCA9IG5ldyBfaGVscGVyc0Nsb3NlRXZlbnQyWydkZWZhdWx0J10odHlwZSwge1xuICAgIGNvZGU6IGNvZGUsXG4gICAgcmVhc29uOiByZWFzb24sXG4gICAgd2FzQ2xlYW46IHdhc0NsZWFuXG4gIH0pO1xuXG4gIGlmICh0YXJnZXQpIHtcbiAgICBjbG9zZUV2ZW50LnRhcmdldCA9IHRhcmdldDtcbiAgICBjbG9zZUV2ZW50LnNyY0VsZW1lbnQgPSB0YXJnZXQ7XG4gICAgY2xvc2VFdmVudC5jdXJyZW50VGFyZ2V0ID0gdGFyZ2V0O1xuICB9XG5cbiAgcmV0dXJuIGNsb3NlRXZlbnQ7XG59XG5cbmV4cG9ydHMuY3JlYXRlRXZlbnQgPSBjcmVhdGVFdmVudDtcbmV4cG9ydHMuY3JlYXRlTWVzc2FnZUV2ZW50ID0gY3JlYXRlTWVzc2FnZUV2ZW50O1xuZXhwb3J0cy5jcmVhdGVDbG9zZUV2ZW50ID0gY3JlYXRlQ2xvc2VFdmVudDsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxudmFyIF9oZWxwZXJzQXJyYXlIZWxwZXJzID0gcmVxdWlyZSgnLi9oZWxwZXJzL2FycmF5LWhlbHBlcnMnKTtcblxuLypcbiogRXZlbnRUYXJnZXQgaXMgYW4gaW50ZXJmYWNlIGltcGxlbWVudGVkIGJ5IG9iamVjdHMgdGhhdCBjYW5cbiogcmVjZWl2ZSBldmVudHMgYW5kIG1heSBoYXZlIGxpc3RlbmVycyBmb3IgdGhlbS5cbipcbiogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0V2ZW50VGFyZ2V0XG4qL1xuXG52YXIgRXZlbnRUYXJnZXQgPSAoZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBFdmVudFRhcmdldCgpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgRXZlbnRUYXJnZXQpO1xuXG4gICAgdGhpcy5saXN0ZW5lcnMgPSB7fTtcbiAgfVxuXG4gIC8qXG4gICogVGllcyBhIGxpc3RlbmVyIGZ1bmN0aW9uIHRvIGEgZXZlbnQgdHlwZSB3aGljaCBjYW4gbGF0ZXIgYmUgaW52b2tlZCB2aWEgdGhlXG4gICogZGlzcGF0Y2hFdmVudCBtZXRob2QuXG4gICpcbiAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSAtIHRoZSB0eXBlIG9mIGV2ZW50IChpZTogJ29wZW4nLCAnbWVzc2FnZScsIGV0Yy4pXG4gICogQHBhcmFtIHtmdW5jdGlvbn0gbGlzdGVuZXIgLSB0aGUgY2FsbGJhY2sgZnVuY3Rpb24gdG8gaW52b2tlIHdoZW5ldmVyIGEgZXZlbnQgaXMgZGlzcGF0Y2hlZCBtYXRjaGluZyB0aGUgZ2l2ZW4gdHlwZVxuICAqIEBwYXJhbSB7Ym9vbGVhbn0gdXNlQ2FwdHVyZSAtIE4vQSBUT0RPOiBpbXBsZW1lbnQgdXNlQ2FwdHVyZSBmdW5jdGlvbmFsaXR5XG4gICovXG5cbiAgX2NyZWF0ZUNsYXNzKEV2ZW50VGFyZ2V0LCBbe1xuICAgIGtleTogJ2FkZEV2ZW50TGlzdGVuZXInLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBhZGRFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyIC8qICwgdXNlQ2FwdHVyZSAqLykge1xuICAgICAgaWYgKHR5cGVvZiBsaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkodGhpcy5saXN0ZW5lcnNbdHlwZV0pKSB7XG4gICAgICAgICAgdGhpcy5saXN0ZW5lcnNbdHlwZV0gPSBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIE9ubHkgYWRkIHRoZSBzYW1lIGZ1bmN0aW9uIG9uY2VcbiAgICAgICAgaWYgKCgwLCBfaGVscGVyc0FycmF5SGVscGVycy5maWx0ZXIpKHRoaXMubGlzdGVuZXJzW3R5cGVdLCBmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgIHJldHVybiBpdGVtID09PSBsaXN0ZW5lcjtcbiAgICAgICAgfSkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgdGhpcy5saXN0ZW5lcnNbdHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKlxuICAgICogUmVtb3ZlcyB0aGUgbGlzdGVuZXIgc28gaXQgd2lsbCBubyBsb25nZXIgYmUgaW52b2tlZCB2aWEgdGhlIGRpc3BhdGNoRXZlbnQgbWV0aG9kLlxuICAgICpcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSB0eXBlIC0gdGhlIHR5cGUgb2YgZXZlbnQgKGllOiAnb3BlbicsICdtZXNzYWdlJywgZXRjLilcbiAgICAqIEBwYXJhbSB7ZnVuY3Rpb259IGxpc3RlbmVyIC0gdGhlIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGludm9rZSB3aGVuZXZlciBhIGV2ZW50IGlzIGRpc3BhdGNoZWQgbWF0Y2hpbmcgdGhlIGdpdmVuIHR5cGVcbiAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gdXNlQ2FwdHVyZSAtIE4vQSBUT0RPOiBpbXBsZW1lbnQgdXNlQ2FwdHVyZSBmdW5jdGlvbmFsaXR5XG4gICAgKi9cbiAgfSwge1xuICAgIGtleTogJ3JlbW92ZUV2ZW50TGlzdGVuZXInLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIHJlbW92aW5nTGlzdGVuZXIgLyogLCB1c2VDYXB0dXJlICovKSB7XG4gICAgICB2YXIgYXJyYXlPZkxpc3RlbmVycyA9IHRoaXMubGlzdGVuZXJzW3R5cGVdO1xuICAgICAgdGhpcy5saXN0ZW5lcnNbdHlwZV0gPSAoMCwgX2hlbHBlcnNBcnJheUhlbHBlcnMucmVqZWN0KShhcnJheU9mTGlzdGVuZXJzLCBmdW5jdGlvbiAobGlzdGVuZXIpIHtcbiAgICAgICAgcmV0dXJuIGxpc3RlbmVyID09PSByZW1vdmluZ0xpc3RlbmVyO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLypcbiAgICAqIEludm9rZXMgYWxsIGxpc3RlbmVyIGZ1bmN0aW9ucyB0aGF0IGFyZSBsaXN0ZW5pbmcgdG8gdGhlIGdpdmVuIGV2ZW50LnR5cGUgcHJvcGVydHkuIEVhY2hcbiAgICAqIGxpc3RlbmVyIHdpbGwgYmUgcGFzc2VkIHRoZSBldmVudCBhcyB0aGUgZmlyc3QgYXJndW1lbnQuXG4gICAgKlxuICAgICogQHBhcmFtIHtvYmplY3R9IGV2ZW50IC0gZXZlbnQgb2JqZWN0IHdoaWNoIHdpbGwgYmUgcGFzc2VkIHRvIGFsbCBsaXN0ZW5lcnMgb2YgdGhlIGV2ZW50LnR5cGUgcHJvcGVydHlcbiAgICAqL1xuICB9LCB7XG4gICAga2V5OiAnZGlzcGF0Y2hFdmVudCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGRpc3BhdGNoRXZlbnQoZXZlbnQpIHtcbiAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAgIGZvciAodmFyIF9sZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBjdXN0b21Bcmd1bWVudHMgPSBBcnJheShfbGVuID4gMSA/IF9sZW4gLSAxIDogMCksIF9rZXkgPSAxOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgICAgIGN1c3RvbUFyZ3VtZW50c1tfa2V5IC0gMV0gPSBhcmd1bWVudHNbX2tleV07XG4gICAgICB9XG5cbiAgICAgIHZhciBldmVudE5hbWUgPSBldmVudC50eXBlO1xuICAgICAgdmFyIGxpc3RlbmVycyA9IHRoaXMubGlzdGVuZXJzW2V2ZW50TmFtZV07XG5cbiAgICAgIGlmICghQXJyYXkuaXNBcnJheShsaXN0ZW5lcnMpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgbGlzdGVuZXJzLmZvckVhY2goZnVuY3Rpb24gKGxpc3RlbmVyKSB7XG4gICAgICAgIGlmIChjdXN0b21Bcmd1bWVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGxpc3RlbmVyLmFwcGx5KF90aGlzLCBjdXN0b21Bcmd1bWVudHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxpc3RlbmVyLmNhbGwoX3RoaXMsIGV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIEV2ZW50VGFyZ2V0O1xufSkoKTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gRXZlbnRUYXJnZXQ7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCJcInVzZSBzdHJpY3RcIjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMucmVqZWN0ID0gcmVqZWN0O1xuZXhwb3J0cy5maWx0ZXIgPSBmaWx0ZXI7XG5cbmZ1bmN0aW9uIHJlamVjdChhcnJheSwgY2FsbGJhY2spIHtcbiAgdmFyIHJlc3VsdHMgPSBbXTtcbiAgYXJyYXkuZm9yRWFjaChmdW5jdGlvbiAoaXRlbUluQXJyYXkpIHtcbiAgICBpZiAoIWNhbGxiYWNrKGl0ZW1JbkFycmF5KSkge1xuICAgICAgcmVzdWx0cy5wdXNoKGl0ZW1JbkFycmF5KTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiByZXN1bHRzO1xufVxuXG5mdW5jdGlvbiBmaWx0ZXIoYXJyYXksIGNhbGxiYWNrKSB7XG4gIHZhciByZXN1bHRzID0gW107XG4gIGFycmF5LmZvckVhY2goZnVuY3Rpb24gKGl0ZW1JbkFycmF5KSB7XG4gICAgaWYgKGNhbGxiYWNrKGl0ZW1JbkFycmF5KSkge1xuICAgICAgcmVzdWx0cy5wdXNoKGl0ZW1JbkFycmF5KTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiByZXN1bHRzO1xufSIsIi8qXG4qIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9DbG9zZUV2ZW50XG4qL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG52YXIgY29kZXMgPSB7XG4gIENMT1NFX05PUk1BTDogMTAwMCxcbiAgQ0xPU0VfR09JTkdfQVdBWTogMTAwMSxcbiAgQ0xPU0VfUFJPVE9DT0xfRVJST1I6IDEwMDIsXG4gIENMT1NFX1VOU1VQUE9SVEVEOiAxMDAzLFxuICBDTE9TRV9OT19TVEFUVVM6IDEwMDUsXG4gIENMT1NFX0FCTk9STUFMOiAxMDA2LFxuICBDTE9TRV9UT09fTEFSR0U6IDEwMDlcbn07XG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gY29kZXM7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbXCJkZWZhdWx0XCJdOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94MiwgX3gzLCBfeDQpIHsgdmFyIF9hZ2FpbiA9IHRydWU7IF9mdW5jdGlvbjogd2hpbGUgKF9hZ2FpbikgeyB2YXIgb2JqZWN0ID0gX3gyLCBwcm9wZXJ0eSA9IF94MywgcmVjZWl2ZXIgPSBfeDQ7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3gyID0gcGFyZW50OyBfeDMgPSBwcm9wZXJ0eTsgX3g0ID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9ldmVudFByb3RvdHlwZSA9IHJlcXVpcmUoJy4vZXZlbnQtcHJvdG90eXBlJyk7XG5cbnZhciBfZXZlbnRQcm90b3R5cGUyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZXZlbnRQcm90b3R5cGUpO1xuXG52YXIgQ2xvc2VFdmVudCA9IChmdW5jdGlvbiAoX0V2ZW50UHJvdG90eXBlKSB7XG4gIF9pbmhlcml0cyhDbG9zZUV2ZW50LCBfRXZlbnRQcm90b3R5cGUpO1xuXG4gIGZ1bmN0aW9uIENsb3NlRXZlbnQodHlwZSkge1xuICAgIHZhciBldmVudEluaXRDb25maWcgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyB7fSA6IGFyZ3VtZW50c1sxXTtcblxuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBDbG9zZUV2ZW50KTtcblxuICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKENsb3NlRXZlbnQucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuY2FsbCh0aGlzKTtcblxuICAgIGlmICghdHlwZSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignRmFpbGVkIHRvIGNvbnN0cnVjdCBcXCdDbG9zZUV2ZW50XFwnOiAxIGFyZ3VtZW50IHJlcXVpcmVkLCBidXQgb25seSAwIHByZXNlbnQuJyk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBldmVudEluaXRDb25maWcgIT09ICdvYmplY3QnKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdGYWlsZWQgdG8gY29uc3RydWN0IFxcJ0Nsb3NlRXZlbnRcXCc6IHBhcmFtZXRlciAyIChcXCdldmVudEluaXREaWN0XFwnKSBpcyBub3QgYW4gb2JqZWN0Jyk7XG4gICAgfVxuXG4gICAgdmFyIGJ1YmJsZXMgPSBldmVudEluaXRDb25maWcuYnViYmxlcztcbiAgICB2YXIgY2FuY2VsYWJsZSA9IGV2ZW50SW5pdENvbmZpZy5jYW5jZWxhYmxlO1xuICAgIHZhciBjb2RlID0gZXZlbnRJbml0Q29uZmlnLmNvZGU7XG4gICAgdmFyIHJlYXNvbiA9IGV2ZW50SW5pdENvbmZpZy5yZWFzb247XG4gICAgdmFyIHdhc0NsZWFuID0gZXZlbnRJbml0Q29uZmlnLndhc0NsZWFuO1xuXG4gICAgdGhpcy50eXBlID0gU3RyaW5nKHR5cGUpO1xuICAgIHRoaXMudGltZVN0YW1wID0gRGF0ZS5ub3coKTtcbiAgICB0aGlzLnRhcmdldCA9IG51bGw7XG4gICAgdGhpcy5zcmNFbGVtZW50ID0gbnVsbDtcbiAgICB0aGlzLnJldHVyblZhbHVlID0gdHJ1ZTtcbiAgICB0aGlzLmlzVHJ1c3RlZCA9IGZhbHNlO1xuICAgIHRoaXMuZXZlbnRQaGFzZSA9IDA7XG4gICAgdGhpcy5kZWZhdWx0UHJldmVudGVkID0gZmFsc2U7XG4gICAgdGhpcy5jdXJyZW50VGFyZ2V0ID0gbnVsbDtcbiAgICB0aGlzLmNhbmNlbGFibGUgPSBjYW5jZWxhYmxlID8gQm9vbGVhbihjYW5jZWxhYmxlKSA6IGZhbHNlO1xuICAgIHRoaXMuY2FubmNlbEJ1YmJsZSA9IGZhbHNlO1xuICAgIHRoaXMuYnViYmxlcyA9IGJ1YmJsZXMgPyBCb29sZWFuKGJ1YmJsZXMpIDogZmFsc2U7XG4gICAgdGhpcy5jb2RlID0gdHlwZW9mIGNvZGUgPT09ICdudW1iZXInID8gTnVtYmVyKGNvZGUpIDogMDtcbiAgICB0aGlzLnJlYXNvbiA9IHJlYXNvbiA/IFN0cmluZyhyZWFzb24pIDogJyc7XG4gICAgdGhpcy53YXNDbGVhbiA9IHdhc0NsZWFuID8gQm9vbGVhbih3YXNDbGVhbikgOiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiBDbG9zZUV2ZW50O1xufSkoX2V2ZW50UHJvdG90eXBlMlsnZGVmYXVsdCddKTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gQ2xvc2VFdmVudDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyIsIi8qXG4qIFRoaXMgZGVsYXkgYWxsb3dzIHRoZSB0aHJlYWQgdG8gZmluaXNoIGFzc2lnbmluZyBpdHMgb24qIG1ldGhvZHNcbiogYmVmb3JlIGludm9raW5nIHRoZSBkZWxheSBjYWxsYmFjay4gVGhpcyBpcyBwdXJlbHkgYSB0aW1pbmcgaGFjay5cbiogaHR0cDovL2dlZWthYnl0ZS5ibG9nc3BvdC5jb20vMjAxNC8wMS9qYXZhc2NyaXB0LWVmZmVjdC1vZi1zZXR0aW5nLXNldHRpbWVvdXQuaHRtbFxuKlxuKiBAcGFyYW0ge2NhbGxiYWNrOiBmdW5jdGlvbn0gdGhlIGNhbGxiYWNrIHdoaWNoIHdpbGwgYmUgaW52b2tlZCBhZnRlciB0aGUgdGltZW91dFxuKiBAcGFybWEge2NvbnRleHQ6IG9iamVjdH0gdGhlIGNvbnRleHQgaW4gd2hpY2ggdG8gaW52b2tlIHRoZSBmdW5jdGlvblxuKi9cblwidXNlIHN0cmljdFwiO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZnVuY3Rpb24gZGVsYXkoY2FsbGJhY2ssIGNvbnRleHQpIHtcbiAgc2V0VGltZW91dChmdW5jdGlvbiB0aW1lb3V0KHRpbWVvdXRDb250ZXh0KSB7XG4gICAgY2FsbGJhY2suY2FsbCh0aW1lb3V0Q29udGV4dCk7XG4gIH0sIDQsIGNvbnRleHQpO1xufVxuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IGRlbGF5O1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzW1wiZGVmYXVsdFwiXTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxudmFyIEV2ZW50UHJvdG90eXBlID0gKGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gRXZlbnRQcm90b3R5cGUoKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEV2ZW50UHJvdG90eXBlKTtcbiAgfVxuXG4gIF9jcmVhdGVDbGFzcyhFdmVudFByb3RvdHlwZSwgW3tcbiAgICBrZXk6ICdzdG9wUHJvcGFnYXRpb24nLFxuXG4gICAgLy8gTm9vcHNcbiAgICB2YWx1ZTogZnVuY3Rpb24gc3RvcFByb3BhZ2F0aW9uKCkge31cbiAgfSwge1xuICAgIGtleTogJ3N0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpIHt9XG5cbiAgICAvLyBpZiBubyBhcmd1bWVudHMgYXJlIHBhc3NlZCB0aGVuIHRoZSB0eXBlIGlzIHNldCB0byBcInVuZGVmaW5lZFwiIG9uXG4gICAgLy8gY2hyb21lIGFuZCBzYWZhcmkuXG4gIH0sIHtcbiAgICBrZXk6ICdpbml0RXZlbnQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBpbml0RXZlbnQoKSB7XG4gICAgICB2YXIgdHlwZSA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/ICd1bmRlZmluZWQnIDogYXJndW1lbnRzWzBdO1xuICAgICAgdmFyIGJ1YmJsZXMgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IGFyZ3VtZW50c1sxXTtcbiAgICAgIHZhciBjYW5jZWxhYmxlID0gYXJndW1lbnRzLmxlbmd0aCA8PSAyIHx8IGFyZ3VtZW50c1syXSA9PT0gdW5kZWZpbmVkID8gZmFsc2UgOiBhcmd1bWVudHNbMl07XG5cbiAgICAgIHRoaXMudHlwZSA9IFN0cmluZyh0eXBlKTtcbiAgICAgIHRoaXMuYnViYmxlcyA9IEJvb2xlYW4oYnViYmxlcyk7XG4gICAgICB0aGlzLmNhbmNlbGFibGUgPSBCb29sZWFuKGNhbmNlbGFibGUpO1xuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBFdmVudFByb3RvdHlwZTtcbn0pKCk7XG5cbmV4cG9ydHNbJ2RlZmF1bHQnXSA9IEV2ZW50UHJvdG90eXBlO1xubW9kdWxlLmV4cG9ydHMgPSBleHBvcnRzWydkZWZhdWx0J107IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9nZXQgPSBmdW5jdGlvbiBnZXQoX3gyLCBfeDMsIF94NCkgeyB2YXIgX2FnYWluID0gdHJ1ZTsgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7IHZhciBvYmplY3QgPSBfeDIsIHByb3BlcnR5ID0gX3gzLCByZWNlaXZlciA9IF94NDsgX2FnYWluID0gZmFsc2U7IGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTsgdmFyIGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG9iamVjdCwgcHJvcGVydHkpOyBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7IHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTsgaWYgKHBhcmVudCA9PT0gbnVsbCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IGVsc2UgeyBfeDIgPSBwYXJlbnQ7IF94MyA9IHByb3BlcnR5OyBfeDQgPSByZWNlaXZlcjsgX2FnYWluID0gdHJ1ZTsgZGVzYyA9IHBhcmVudCA9IHVuZGVmaW5lZDsgY29udGludWUgX2Z1bmN0aW9uOyB9IH0gZWxzZSBpZiAoJ3ZhbHVlJyBpbiBkZXNjKSB7IHJldHVybiBkZXNjLnZhbHVlOyB9IGVsc2UgeyB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7IGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9IHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7IH0gfSB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHsgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uJyk7IH0gfVxuXG5mdW5jdGlvbiBfaW5oZXJpdHMoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHsgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSAnZnVuY3Rpb24nICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHsgdGhyb3cgbmV3IFR5cGVFcnJvcignU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCAnICsgdHlwZW9mIHN1cGVyQ2xhc3MpOyB9IHN1YkNsYXNzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwgeyBjb25zdHJ1Y3RvcjogeyB2YWx1ZTogc3ViQ2xhc3MsIGVudW1lcmFibGU6IGZhbHNlLCB3cml0YWJsZTogdHJ1ZSwgY29uZmlndXJhYmxlOiB0cnVlIH0gfSk7IGlmIChzdXBlckNsYXNzKSBPYmplY3Quc2V0UHJvdG90eXBlT2YgPyBPYmplY3Quc2V0UHJvdG90eXBlT2Yoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzczsgfVxuXG52YXIgX2V2ZW50UHJvdG90eXBlID0gcmVxdWlyZSgnLi9ldmVudC1wcm90b3R5cGUnKTtcblxudmFyIF9ldmVudFByb3RvdHlwZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9ldmVudFByb3RvdHlwZSk7XG5cbnZhciBFdmVudCA9IChmdW5jdGlvbiAoX0V2ZW50UHJvdG90eXBlKSB7XG4gIF9pbmhlcml0cyhFdmVudCwgX0V2ZW50UHJvdG90eXBlKTtcblxuICBmdW5jdGlvbiBFdmVudCh0eXBlKSB7XG4gICAgdmFyIGV2ZW50SW5pdENvbmZpZyA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/IHt9IDogYXJndW1lbnRzWzFdO1xuXG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEV2ZW50KTtcblxuICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKEV2ZW50LnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmNhbGwodGhpcyk7XG5cbiAgICBpZiAoIXR5cGUpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ZhaWxlZCB0byBjb25zdHJ1Y3QgXFwnRXZlbnRcXCc6IDEgYXJndW1lbnQgcmVxdWlyZWQsIGJ1dCBvbmx5IDAgcHJlc2VudC4nKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGV2ZW50SW5pdENvbmZpZyAhPT0gJ29iamVjdCcpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ZhaWxlZCB0byBjb25zdHJ1Y3QgXFwnRXZlbnRcXCc6IHBhcmFtZXRlciAyIChcXCdldmVudEluaXREaWN0XFwnKSBpcyBub3QgYW4gb2JqZWN0Jyk7XG4gICAgfVxuXG4gICAgdmFyIGJ1YmJsZXMgPSBldmVudEluaXRDb25maWcuYnViYmxlcztcbiAgICB2YXIgY2FuY2VsYWJsZSA9IGV2ZW50SW5pdENvbmZpZy5jYW5jZWxhYmxlO1xuXG4gICAgdGhpcy50eXBlID0gU3RyaW5nKHR5cGUpO1xuICAgIHRoaXMudGltZVN0YW1wID0gRGF0ZS5ub3coKTtcbiAgICB0aGlzLnRhcmdldCA9IG51bGw7XG4gICAgdGhpcy5zcmNFbGVtZW50ID0gbnVsbDtcbiAgICB0aGlzLnJldHVyblZhbHVlID0gdHJ1ZTtcbiAgICB0aGlzLmlzVHJ1c3RlZCA9IGZhbHNlO1xuICAgIHRoaXMuZXZlbnRQaGFzZSA9IDA7XG4gICAgdGhpcy5kZWZhdWx0UHJldmVudGVkID0gZmFsc2U7XG4gICAgdGhpcy5jdXJyZW50VGFyZ2V0ID0gbnVsbDtcbiAgICB0aGlzLmNhbmNlbGFibGUgPSBjYW5jZWxhYmxlID8gQm9vbGVhbihjYW5jZWxhYmxlKSA6IGZhbHNlO1xuICAgIHRoaXMuY2FubmNlbEJ1YmJsZSA9IGZhbHNlO1xuICAgIHRoaXMuYnViYmxlcyA9IGJ1YmJsZXMgPyBCb29sZWFuKGJ1YmJsZXMpIDogZmFsc2U7XG4gIH1cblxuICByZXR1cm4gRXZlbnQ7XG59KShfZXZlbnRQcm90b3R5cGUyWydkZWZhdWx0J10pO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBFdmVudDtcbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94MiwgX3gzLCBfeDQpIHsgdmFyIF9hZ2FpbiA9IHRydWU7IF9mdW5jdGlvbjogd2hpbGUgKF9hZ2FpbikgeyB2YXIgb2JqZWN0ID0gX3gyLCBwcm9wZXJ0eSA9IF94MywgcmVjZWl2ZXIgPSBfeDQ7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3gyID0gcGFyZW50OyBfeDMgPSBwcm9wZXJ0eTsgX3g0ID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF9ldmVudFByb3RvdHlwZSA9IHJlcXVpcmUoJy4vZXZlbnQtcHJvdG90eXBlJyk7XG5cbnZhciBfZXZlbnRQcm90b3R5cGUyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZXZlbnRQcm90b3R5cGUpO1xuXG52YXIgTWVzc2FnZUV2ZW50ID0gKGZ1bmN0aW9uIChfRXZlbnRQcm90b3R5cGUpIHtcbiAgX2luaGVyaXRzKE1lc3NhZ2VFdmVudCwgX0V2ZW50UHJvdG90eXBlKTtcblxuICBmdW5jdGlvbiBNZXNzYWdlRXZlbnQodHlwZSkge1xuICAgIHZhciBldmVudEluaXRDb25maWcgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyB7fSA6IGFyZ3VtZW50c1sxXTtcblxuICAgIF9jbGFzc0NhbGxDaGVjayh0aGlzLCBNZXNzYWdlRXZlbnQpO1xuXG4gICAgX2dldChPYmplY3QuZ2V0UHJvdG90eXBlT2YoTWVzc2FnZUV2ZW50LnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmNhbGwodGhpcyk7XG5cbiAgICBpZiAoIXR5cGUpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ZhaWxlZCB0byBjb25zdHJ1Y3QgXFwnTWVzc2FnZUV2ZW50XFwnOiAxIGFyZ3VtZW50IHJlcXVpcmVkLCBidXQgb25seSAwIHByZXNlbnQuJyk7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBldmVudEluaXRDb25maWcgIT09ICdvYmplY3QnKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdGYWlsZWQgdG8gY29uc3RydWN0IFxcJ01lc3NhZ2VFdmVudFxcJzogcGFyYW1ldGVyIDIgKFxcJ2V2ZW50SW5pdERpY3RcXCcpIGlzIG5vdCBhbiBvYmplY3QnKTtcbiAgICB9XG5cbiAgICB2YXIgYnViYmxlcyA9IGV2ZW50SW5pdENvbmZpZy5idWJibGVzO1xuICAgIHZhciBjYW5jZWxhYmxlID0gZXZlbnRJbml0Q29uZmlnLmNhbmNlbGFibGU7XG4gICAgdmFyIGRhdGEgPSBldmVudEluaXRDb25maWcuZGF0YTtcbiAgICB2YXIgb3JpZ2luID0gZXZlbnRJbml0Q29uZmlnLm9yaWdpbjtcbiAgICB2YXIgbGFzdEV2ZW50SWQgPSBldmVudEluaXRDb25maWcubGFzdEV2ZW50SWQ7XG4gICAgdmFyIHBvcnRzID0gZXZlbnRJbml0Q29uZmlnLnBvcnRzO1xuXG4gICAgdGhpcy50eXBlID0gU3RyaW5nKHR5cGUpO1xuICAgIHRoaXMudGltZVN0YW1wID0gRGF0ZS5ub3coKTtcbiAgICB0aGlzLnRhcmdldCA9IG51bGw7XG4gICAgdGhpcy5zcmNFbGVtZW50ID0gbnVsbDtcbiAgICB0aGlzLnJldHVyblZhbHVlID0gdHJ1ZTtcbiAgICB0aGlzLmlzVHJ1c3RlZCA9IGZhbHNlO1xuICAgIHRoaXMuZXZlbnRQaGFzZSA9IDA7XG4gICAgdGhpcy5kZWZhdWx0UHJldmVudGVkID0gZmFsc2U7XG4gICAgdGhpcy5jdXJyZW50VGFyZ2V0ID0gbnVsbDtcbiAgICB0aGlzLmNhbmNlbGFibGUgPSBjYW5jZWxhYmxlID8gQm9vbGVhbihjYW5jZWxhYmxlKSA6IGZhbHNlO1xuICAgIHRoaXMuY2FubmNlbEJ1YmJsZSA9IGZhbHNlO1xuICAgIHRoaXMuYnViYmxlcyA9IGJ1YmJsZXMgPyBCb29sZWFuKGJ1YmJsZXMpIDogZmFsc2U7XG4gICAgdGhpcy5vcmlnaW4gPSBvcmlnaW4gPyBTdHJpbmcob3JpZ2luKSA6ICcnO1xuICAgIHRoaXMucG9ydHMgPSB0eXBlb2YgcG9ydHMgPT09ICd1bmRlZmluZWQnID8gbnVsbCA6IHBvcnRzO1xuICAgIHRoaXMuZGF0YSA9IHR5cGVvZiBkYXRhID09PSAndW5kZWZpbmVkJyA/IG51bGwgOiBkYXRhO1xuICAgIHRoaXMubGFzdEV2ZW50SWQgPSBsYXN0RXZlbnRJZCA/IFN0cmluZyhsYXN0RXZlbnRJZCkgOiAnJztcbiAgfVxuXG4gIHJldHVybiBNZXNzYWdlRXZlbnQ7XG59KShfZXZlbnRQcm90b3R5cGUyWydkZWZhdWx0J10pO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBNZXNzYWdlRXZlbnQ7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyAnZGVmYXVsdCc6IG9iaiB9OyB9XG5cbnZhciBfc2VydmVyID0gcmVxdWlyZSgnLi9zZXJ2ZXInKTtcblxudmFyIF9zZXJ2ZXIyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfc2VydmVyKTtcblxudmFyIF9zb2NrZXRJbyA9IHJlcXVpcmUoJy4vc29ja2V0LWlvJyk7XG5cbnZhciBfc29ja2V0SW8yID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfc29ja2V0SW8pO1xuXG52YXIgX3dlYnNvY2tldCA9IHJlcXVpcmUoJy4vd2Vic29ja2V0Jyk7XG5cbnZhciBfd2Vic29ja2V0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3dlYnNvY2tldCk7XG5cbmlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICB3aW5kb3cuTW9ja1NlcnZlciA9IF9zZXJ2ZXIyWydkZWZhdWx0J107XG4gIHdpbmRvdy5Nb2NrV2ViU29ja2V0ID0gX3dlYnNvY2tldDJbJ2RlZmF1bHQnXTtcbiAgd2luZG93Lk1vY2tTb2NrZXRJTyA9IF9zb2NrZXRJbzJbJ2RlZmF1bHQnXTtcbn1cblxudmFyIFNlcnZlciA9IF9zZXJ2ZXIyWydkZWZhdWx0J107XG5leHBvcnRzLlNlcnZlciA9IFNlcnZlcjtcbnZhciBXZWJTb2NrZXQgPSBfd2Vic29ja2V0MlsnZGVmYXVsdCddO1xuZXhwb3J0cy5XZWJTb2NrZXQgPSBXZWJTb2NrZXQ7XG52YXIgU29ja2V0SU8gPSBfc29ja2V0SW8yWydkZWZhdWx0J107XG5leHBvcnRzLlNvY2tldElPID0gU29ja2V0SU87IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcblxudmFyIF9jcmVhdGVDbGFzcyA9IChmdW5jdGlvbiAoKSB7IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykgeyBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7IHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07IGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTsgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlOyBpZiAoJ3ZhbHVlJyBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTsgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpOyB9IH0gcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHsgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTsgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7IHJldHVybiBDb25zdHJ1Y3RvcjsgfTsgfSkoKTtcblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbnZhciBfaGVscGVyc0FycmF5SGVscGVycyA9IHJlcXVpcmUoJy4vaGVscGVycy9hcnJheS1oZWxwZXJzJyk7XG5cbi8qXG4qIFRoZSBuZXR3b3JrIGJyaWRnZSBpcyBhIHdheSBmb3IgdGhlIG1vY2sgd2Vic29ja2V0IG9iamVjdCB0byAnY29tbXVuaWNhdGUnIHdpdGhcbiogYWxsIGF2YWxpYmxlIHNlcnZlcnMuIFRoaXMgaXMgYSBzaW5nbGV0b24gb2JqZWN0IHNvIGl0IGlzIGltcG9ydGFudCB0aGF0IHlvdVxuKiBjbGVhbiB1cCB1cmxNYXAgd2hlbmV2ZXIgeW91IGFyZSBmaW5pc2hlZC5cbiovXG5cbnZhciBOZXR3b3JrQnJpZGdlID0gKGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gTmV0d29ya0JyaWRnZSgpIHtcbiAgICBfY2xhc3NDYWxsQ2hlY2sodGhpcywgTmV0d29ya0JyaWRnZSk7XG5cbiAgICB0aGlzLnVybE1hcCA9IHt9O1xuICB9XG5cbiAgLypcbiAgKiBBdHRhY2hlcyBhIHdlYnNvY2tldCBvYmplY3QgdG8gdGhlIHVybE1hcCBoYXNoIHNvIHRoYXQgaXQgY2FuIGZpbmQgdGhlIHNlcnZlclxuICAqIGl0IGlzIGNvbm5lY3RlZCB0byBhbmQgdGhlIHNlcnZlciBpbiB0dXJuIGNhbiBmaW5kIGl0LlxuICAqXG4gICogQHBhcmFtIHtvYmplY3R9IHdlYnNvY2tldCAtIHdlYnNvY2tldCBvYmplY3QgdG8gYWRkIHRvIHRoZSB1cmxNYXAgaGFzaFxuICAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAgKi9cblxuICBfY3JlYXRlQ2xhc3MoTmV0d29ya0JyaWRnZSwgW3tcbiAgICBrZXk6ICdhdHRhY2hXZWJTb2NrZXQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBhdHRhY2hXZWJTb2NrZXQod2Vic29ja2V0LCB1cmwpIHtcbiAgICAgIHZhciBjb25uZWN0aW9uTG9va3VwID0gdGhpcy51cmxNYXBbdXJsXTtcblxuICAgICAgaWYgKGNvbm5lY3Rpb25Mb29rdXAgJiYgY29ubmVjdGlvbkxvb2t1cC5zZXJ2ZXIgJiYgY29ubmVjdGlvbkxvb2t1cC53ZWJzb2NrZXRzLmluZGV4T2Yod2Vic29ja2V0KSA9PT0gLTEpIHtcbiAgICAgICAgY29ubmVjdGlvbkxvb2t1cC53ZWJzb2NrZXRzLnB1c2god2Vic29ja2V0KTtcbiAgICAgICAgcmV0dXJuIGNvbm5lY3Rpb25Mb29rdXAuc2VydmVyO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qXG4gICAgKiBBdHRhY2hlcyBhIHdlYnNvY2tldCB0byBhIHJvb21cbiAgICAqL1xuICB9LCB7XG4gICAga2V5OiAnYWRkTWVtYmVyc2hpcFRvUm9vbScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGFkZE1lbWJlcnNoaXBUb1Jvb20od2Vic29ja2V0LCByb29tKSB7XG4gICAgICB2YXIgY29ubmVjdGlvbkxvb2t1cCA9IHRoaXMudXJsTWFwW3dlYnNvY2tldC51cmxdO1xuXG4gICAgICBpZiAoY29ubmVjdGlvbkxvb2t1cCAmJiBjb25uZWN0aW9uTG9va3VwLnNlcnZlciAmJiBjb25uZWN0aW9uTG9va3VwLndlYnNvY2tldHMuaW5kZXhPZih3ZWJzb2NrZXQpICE9PSAtMSkge1xuICAgICAgICBpZiAoIWNvbm5lY3Rpb25Mb29rdXAucm9vbU1lbWJlcnNoaXBzW3Jvb21dKSB7XG4gICAgICAgICAgY29ubmVjdGlvbkxvb2t1cC5yb29tTWVtYmVyc2hpcHNbcm9vbV0gPSBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbm5lY3Rpb25Mb29rdXAucm9vbU1lbWJlcnNoaXBzW3Jvb21dLnB1c2god2Vic29ja2V0KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKlxuICAgICogQXR0YWNoZXMgYSBzZXJ2ZXIgb2JqZWN0IHRvIHRoZSB1cmxNYXAgaGFzaCBzbyB0aGF0IGl0IGNhbiBmaW5kIGEgd2Vic29ja2V0c1xuICAgICogd2hpY2ggYXJlIGNvbm5lY3RlZCB0byBpdCBhbmQgc28gdGhhdCB3ZWJzb2NrZXRzIGNhbiBpbiB0dXJuIGNhbiBmaW5kIGl0LlxuICAgICpcbiAgICAqIEBwYXJhbSB7b2JqZWN0fSBzZXJ2ZXIgLSBzZXJ2ZXIgb2JqZWN0IHRvIGFkZCB0byB0aGUgdXJsTWFwIGhhc2hcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAgICAqL1xuICB9LCB7XG4gICAga2V5OiAnYXR0YWNoU2VydmVyJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gYXR0YWNoU2VydmVyKHNlcnZlciwgdXJsKSB7XG4gICAgICB2YXIgY29ubmVjdGlvbkxvb2t1cCA9IHRoaXMudXJsTWFwW3VybF07XG5cbiAgICAgIGlmICghY29ubmVjdGlvbkxvb2t1cCkge1xuICAgICAgICB0aGlzLnVybE1hcFt1cmxdID0ge1xuICAgICAgICAgIHNlcnZlcjogc2VydmVyLFxuICAgICAgICAgIHdlYnNvY2tldHM6IFtdLFxuICAgICAgICAgIHJvb21NZW1iZXJzaGlwczoge31cbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gc2VydmVyO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qXG4gICAgKiBGaW5kcyB0aGUgc2VydmVyIHdoaWNoIGlzICdydW5uaW5nJyBvbiB0aGUgZ2l2ZW4gdXJsLlxuICAgICpcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgLSB0aGUgdXJsIHRvIHVzZSB0byBmaW5kIHdoaWNoIHNlcnZlciBpcyBydW5uaW5nIG9uIGl0XG4gICAgKi9cbiAgfSwge1xuICAgIGtleTogJ3NlcnZlckxvb2t1cCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNlcnZlckxvb2t1cCh1cmwpIHtcbiAgICAgIHZhciBjb25uZWN0aW9uTG9va3VwID0gdGhpcy51cmxNYXBbdXJsXTtcblxuICAgICAgaWYgKGNvbm5lY3Rpb25Mb29rdXApIHtcbiAgICAgICAgcmV0dXJuIGNvbm5lY3Rpb25Mb29rdXAuc2VydmVyO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qXG4gICAgKiBGaW5kcyBhbGwgd2Vic29ja2V0cyB3aGljaCBpcyAnbGlzdGVuaW5nJyBvbiB0aGUgZ2l2ZW4gdXJsLlxuICAgICpcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSB1cmwgLSB0aGUgdXJsIHRvIHVzZSB0byBmaW5kIGFsbCB3ZWJzb2NrZXRzIHdoaWNoIGFyZSBhc3NvY2lhdGVkIHdpdGggaXRcbiAgICAqIEBwYXJhbSB7c3RyaW5nfSByb29tIC0gaWYgYSByb29tIGlzIHByb3ZpZGVkLCB3aWxsIG9ubHkgcmV0dXJuIHNvY2tldHMgaW4gdGhpcyByb29tXG4gICAgKi9cbiAgfSwge1xuICAgIGtleTogJ3dlYnNvY2tldHNMb29rdXAnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiB3ZWJzb2NrZXRzTG9va3VwKHVybCwgcm9vbSkge1xuICAgICAgdmFyIGNvbm5lY3Rpb25Mb29rdXAgPSB0aGlzLnVybE1hcFt1cmxdO1xuXG4gICAgICBpZiAoIWNvbm5lY3Rpb25Mb29rdXApIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgfVxuXG4gICAgICBpZiAocm9vbSkge1xuICAgICAgICB2YXIgbWVtYmVycyA9IGNvbm5lY3Rpb25Mb29rdXAucm9vbU1lbWJlcnNoaXBzW3Jvb21dO1xuICAgICAgICByZXR1cm4gbWVtYmVycyA/IG1lbWJlcnMgOiBbXTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNvbm5lY3Rpb25Mb29rdXAud2Vic29ja2V0cztcbiAgICB9XG5cbiAgICAvKlxuICAgICogUmVtb3ZlcyB0aGUgZW50cnkgYXNzb2NpYXRlZCB3aXRoIHRoZSB1cmwuXG4gICAgKlxuICAgICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICAgICovXG4gIH0sIHtcbiAgICBrZXk6ICdyZW1vdmVTZXJ2ZXInLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByZW1vdmVTZXJ2ZXIodXJsKSB7XG4gICAgICBkZWxldGUgdGhpcy51cmxNYXBbdXJsXTtcbiAgICB9XG5cbiAgICAvKlxuICAgICogUmVtb3ZlcyB0aGUgaW5kaXZpZHVhbCB3ZWJzb2NrZXQgZnJvbSB0aGUgbWFwIG9mIGFzc29jaWF0ZWQgd2Vic29ja2V0cy5cbiAgICAqXG4gICAgKiBAcGFyYW0ge29iamVjdH0gd2Vic29ja2V0IC0gd2Vic29ja2V0IG9iamVjdCB0byByZW1vdmUgZnJvbSB0aGUgdXJsIG1hcFxuICAgICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICAgICovXG4gIH0sIHtcbiAgICBrZXk6ICdyZW1vdmVXZWJTb2NrZXQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByZW1vdmVXZWJTb2NrZXQod2Vic29ja2V0LCB1cmwpIHtcbiAgICAgIHZhciBjb25uZWN0aW9uTG9va3VwID0gdGhpcy51cmxNYXBbdXJsXTtcblxuICAgICAgaWYgKGNvbm5lY3Rpb25Mb29rdXApIHtcbiAgICAgICAgY29ubmVjdGlvbkxvb2t1cC53ZWJzb2NrZXRzID0gKDAsIF9oZWxwZXJzQXJyYXlIZWxwZXJzLnJlamVjdCkoY29ubmVjdGlvbkxvb2t1cC53ZWJzb2NrZXRzLCBmdW5jdGlvbiAoc29ja2V0KSB7XG4gICAgICAgICAgcmV0dXJuIHNvY2tldCA9PT0gd2Vic29ja2V0O1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKlxuICAgICogUmVtb3ZlcyBhIHdlYnNvY2tldCBmcm9tIGEgcm9vbVxuICAgICovXG4gIH0sIHtcbiAgICBrZXk6ICdyZW1vdmVNZW1iZXJzaGlwRnJvbVJvb20nLFxuICAgIHZhbHVlOiBmdW5jdGlvbiByZW1vdmVNZW1iZXJzaGlwRnJvbVJvb20od2Vic29ja2V0LCByb29tKSB7XG4gICAgICB2YXIgY29ubmVjdGlvbkxvb2t1cCA9IHRoaXMudXJsTWFwW3dlYnNvY2tldC51cmxdO1xuICAgICAgdmFyIG1lbWJlcnNoaXBzID0gY29ubmVjdGlvbkxvb2t1cC5yb29tTWVtYmVyc2hpcHNbcm9vbV07XG5cbiAgICAgIGlmIChjb25uZWN0aW9uTG9va3VwICYmIG1lbWJlcnNoaXBzICE9PSBudWxsKSB7XG4gICAgICAgIGNvbm5lY3Rpb25Mb29rdXAucm9vbU1lbWJlcnNoaXBzW3Jvb21dID0gKDAsIF9oZWxwZXJzQXJyYXlIZWxwZXJzLnJlamVjdCkobWVtYmVyc2hpcHMsIGZ1bmN0aW9uIChzb2NrZXQpIHtcbiAgICAgICAgICByZXR1cm4gc29ja2V0ID09PSB3ZWJzb2NrZXQ7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfV0pO1xuXG4gIHJldHVybiBOZXR3b3JrQnJpZGdlO1xufSkoKTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gbmV3IE5ldHdvcmtCcmlkZ2UoKTtcbi8vIE5vdGU6IHRoaXMgaXMgYSBzaW5nbGV0b25cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0c1snZGVmYXVsdCddOyIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5cbnZhciBfY3JlYXRlQ2xhc3MgPSAoZnVuY3Rpb24gKCkgeyBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHsgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykgeyB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldOyBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7IGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTsgaWYgKCd2YWx1ZScgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTsgfSB9IHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7IGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7IGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpOyByZXR1cm4gQ29uc3RydWN0b3I7IH07IH0pKCk7XG5cbnZhciBfZ2V0ID0gZnVuY3Rpb24gZ2V0KF94NCwgX3g1LCBfeDYpIHsgdmFyIF9hZ2FpbiA9IHRydWU7IF9mdW5jdGlvbjogd2hpbGUgKF9hZ2FpbikgeyB2YXIgb2JqZWN0ID0gX3g0LCBwcm9wZXJ0eSA9IF94NSwgcmVjZWl2ZXIgPSBfeDY7IF9hZ2FpbiA9IGZhbHNlOyBpZiAob2JqZWN0ID09PSBudWxsKSBvYmplY3QgPSBGdW5jdGlvbi5wcm90b3R5cGU7IHZhciBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTsgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkgeyB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7IGlmIChwYXJlbnQgPT09IG51bGwpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSBlbHNlIHsgX3g0ID0gcGFyZW50OyBfeDUgPSBwcm9wZXJ0eTsgX3g2ID0gcmVjZWl2ZXI7IF9hZ2FpbiA9IHRydWU7IGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7IGNvbnRpbnVlIF9mdW5jdGlvbjsgfSB9IGVsc2UgaWYgKCd2YWx1ZScgaW4gZGVzYykgeyByZXR1cm4gZGVzYy52YWx1ZTsgfSBlbHNlIHsgdmFyIGdldHRlciA9IGRlc2MuZ2V0OyBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHsgcmV0dXJuIHVuZGVmaW5lZDsgfSByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpOyB9IH0gfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgJ2RlZmF1bHQnOiBvYmogfTsgfVxuXG5mdW5jdGlvbiBfY2xhc3NDYWxsQ2hlY2soaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7IGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvbicpOyB9IH1cblxuZnVuY3Rpb24gX2luaGVyaXRzKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7IGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gJ2Z1bmN0aW9uJyAmJiBzdXBlckNsYXNzICE9PSBudWxsKSB7IHRocm93IG5ldyBUeXBlRXJyb3IoJ1N1cGVyIGV4cHJlc3Npb24gbXVzdCBlaXRoZXIgYmUgbnVsbCBvciBhIGZ1bmN0aW9uLCBub3QgJyArIHR5cGVvZiBzdXBlckNsYXNzKTsgfSBzdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHsgY29uc3RydWN0b3I6IHsgdmFsdWU6IHN1YkNsYXNzLCBlbnVtZXJhYmxlOiBmYWxzZSwgd3JpdGFibGU6IHRydWUsIGNvbmZpZ3VyYWJsZTogdHJ1ZSB9IH0pOyBpZiAoc3VwZXJDbGFzcykgT2JqZWN0LnNldFByb3RvdHlwZU9mID8gT2JqZWN0LnNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7IH1cblxudmFyIF91cmlqcyA9IHJlcXVpcmUoJ3VyaWpzJyk7XG5cbnZhciBfdXJpanMyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfdXJpanMpO1xuXG52YXIgX3dlYnNvY2tldCA9IHJlcXVpcmUoJy4vd2Vic29ja2V0Jyk7XG5cbnZhciBfd2Vic29ja2V0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3dlYnNvY2tldCk7XG5cbnZhciBfZXZlbnRUYXJnZXQgPSByZXF1aXJlKCcuL2V2ZW50LXRhcmdldCcpO1xuXG52YXIgX2V2ZW50VGFyZ2V0MiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2V2ZW50VGFyZ2V0KTtcblxudmFyIF9uZXR3b3JrQnJpZGdlID0gcmVxdWlyZSgnLi9uZXR3b3JrLWJyaWRnZScpO1xuXG52YXIgX25ldHdvcmtCcmlkZ2UyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfbmV0d29ya0JyaWRnZSk7XG5cbnZhciBfaGVscGVyc0Nsb3NlQ29kZXMgPSByZXF1aXJlKCcuL2hlbHBlcnMvY2xvc2UtY29kZXMnKTtcblxudmFyIF9oZWxwZXJzQ2xvc2VDb2RlczIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9oZWxwZXJzQ2xvc2VDb2Rlcyk7XG5cbnZhciBfZXZlbnRGYWN0b3J5ID0gcmVxdWlyZSgnLi9ldmVudC1mYWN0b3J5Jyk7XG5cbi8qXG4qIGh0dHBzOi8vZ2l0aHViLmNvbS93ZWJzb2NrZXRzL3dzI3NlcnZlci1leGFtcGxlXG4qL1xuXG52YXIgU2VydmVyID0gKGZ1bmN0aW9uIChfRXZlbnRUYXJnZXQpIHtcbiAgX2luaGVyaXRzKFNlcnZlciwgX0V2ZW50VGFyZ2V0KTtcblxuICAvKlxuICAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAgKi9cblxuICBmdW5jdGlvbiBTZXJ2ZXIodXJsKSB7XG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFNlcnZlcik7XG5cbiAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihTZXJ2ZXIucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuY2FsbCh0aGlzKTtcbiAgICB0aGlzLnVybCA9ICgwLCBfdXJpanMyWydkZWZhdWx0J10pKHVybCkudG9TdHJpbmcoKTtcbiAgICB2YXIgc2VydmVyID0gX25ldHdvcmtCcmlkZ2UyWydkZWZhdWx0J10uYXR0YWNoU2VydmVyKHRoaXMsIHRoaXMudXJsKTtcblxuICAgIGlmICghc2VydmVyKSB7XG4gICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoKDAsIF9ldmVudEZhY3RvcnkuY3JlYXRlRXZlbnQpKHsgdHlwZTogJ2Vycm9yJyB9KSk7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0EgbW9jayBzZXJ2ZXIgaXMgYWxyZWFkeSBsaXN0ZW5pbmcgb24gdGhpcyB1cmwnKTtcbiAgICB9XG4gIH1cblxuICAvKlxuICAgKiBBbHRlcm5hdGl2ZSBjb25zdHJ1Y3RvciB0byBzdXBwb3J0IG5hbWVzcGFjZXMgaW4gc29ja2V0LmlvXG4gICAqXG4gICAqIGh0dHA6Ly9zb2NrZXQuaW8vZG9jcy9yb29tcy1hbmQtbmFtZXNwYWNlcy8jY3VzdG9tLW5hbWVzcGFjZXNcbiAgICovXG5cbiAgLypcbiAgKiBUaGlzIGlzIHRoZSBtYWluIGZ1bmN0aW9uIGZvciB0aGUgbW9jayBzZXJ2ZXIgdG8gc3Vic2NyaWJlIHRvIHRoZSBvbiBldmVudHMuXG4gICpcbiAgKiBpZTogbW9ja1NlcnZlci5vbignY29ubmVjdGlvbicsIGZ1bmN0aW9uKCkgeyBjb25zb2xlLmxvZygnYSBtb2NrIGNsaWVudCBjb25uZWN0ZWQnKTsgfSk7XG4gICpcbiAgKiBAcGFyYW0ge3N0cmluZ30gdHlwZSAtIFRoZSBldmVudCBrZXkgdG8gc3Vic2NyaWJlIHRvLiBWYWxpZCBrZXlzIGFyZTogY29ubmVjdGlvbiwgbWVzc2FnZSwgYW5kIGNsb3NlLlxuICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrIC0gVGhlIGNhbGxiYWNrIHdoaWNoIHNob3VsZCBiZSBjYWxsZWQgd2hlbiBhIGNlcnRhaW4gZXZlbnQgaXMgZmlyZWQuXG4gICovXG5cbiAgX2NyZWF0ZUNsYXNzKFNlcnZlciwgW3tcbiAgICBrZXk6ICdvbicsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIG9uKHR5cGUsIGNhbGxiYWNrKSB7XG4gICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgY2FsbGJhY2spO1xuICAgIH1cblxuICAgIC8qXG4gICAgKiBUaGlzIHNlbmQgZnVuY3Rpb24gd2lsbCBub3RpZnkgYWxsIG1vY2sgY2xpZW50cyB2aWEgdGhlaXIgb25tZXNzYWdlIGNhbGxiYWNrcyB0aGF0IHRoZSBzZXJ2ZXJcbiAgICAqIGhhcyBhIG1lc3NhZ2UgZm9yIHRoZW0uXG4gICAgKlxuICAgICogQHBhcmFtIHsqfSBkYXRhIC0gQW55IGphdmFzY3JpcHQgb2JqZWN0IHdoaWNoIHdpbGwgYmUgY3JhZnRlZCBpbnRvIGEgTWVzc2FnZU9iamVjdC5cbiAgICAqL1xuICB9LCB7XG4gICAga2V5OiAnc2VuZCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHNlbmQoZGF0YSkge1xuICAgICAgdmFyIG9wdGlvbnMgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDEgfHwgYXJndW1lbnRzWzFdID09PSB1bmRlZmluZWQgPyB7fSA6IGFyZ3VtZW50c1sxXTtcblxuICAgICAgdGhpcy5lbWl0KCdtZXNzYWdlJywgZGF0YSwgb3B0aW9ucyk7XG4gICAgfVxuXG4gICAgLypcbiAgICAqIFNlbmRzIGEgZ2VuZXJpYyBtZXNzYWdlIGV2ZW50IHRvIGFsbCBtb2NrIGNsaWVudHMuXG4gICAgKi9cbiAgfSwge1xuICAgIGtleTogJ2VtaXQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBlbWl0KGV2ZW50LCBkYXRhKSB7XG4gICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgdmFyIG9wdGlvbnMgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDIgfHwgYXJndW1lbnRzWzJdID09PSB1bmRlZmluZWQgPyB7fSA6IGFyZ3VtZW50c1syXTtcbiAgICAgIHZhciB3ZWJzb2NrZXRzID0gb3B0aW9ucy53ZWJzb2NrZXRzO1xuXG4gICAgICBpZiAoIXdlYnNvY2tldHMpIHtcbiAgICAgICAgd2Vic29ja2V0cyA9IF9uZXR3b3JrQnJpZGdlMlsnZGVmYXVsdCddLndlYnNvY2tldHNMb29rdXAodGhpcy51cmwpO1xuICAgICAgfVxuXG4gICAgICB3ZWJzb2NrZXRzLmZvckVhY2goZnVuY3Rpb24gKHNvY2tldCkge1xuICAgICAgICBzb2NrZXQuZGlzcGF0Y2hFdmVudCgoMCwgX2V2ZW50RmFjdG9yeS5jcmVhdGVNZXNzYWdlRXZlbnQpKHtcbiAgICAgICAgICB0eXBlOiBldmVudCxcbiAgICAgICAgICBkYXRhOiBkYXRhLFxuICAgICAgICAgIG9yaWdpbjogX3RoaXMyLnVybCxcbiAgICAgICAgICB0YXJnZXQ6IHNvY2tldFxuICAgICAgICB9KSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvKlxuICAgICogQ2xvc2VzIHRoZSBjb25uZWN0aW9uIGFuZCB0cmlnZ2VycyB0aGUgb25jbG9zZSBtZXRob2Qgb2YgYWxsIGxpc3RlbmluZ1xuICAgICogd2Vic29ja2V0cy4gQWZ0ZXIgdGhhdCBpdCByZW1vdmVzIGl0c2VsZiBmcm9tIHRoZSB1cmxNYXAgc28gYW5vdGhlciBzZXJ2ZXJcbiAgICAqIGNvdWxkIGFkZCBpdHNlbGYgdG8gdGhlIHVybC5cbiAgICAqXG4gICAgKiBAcGFyYW0ge29iamVjdH0gb3B0aW9uc1xuICAgICovXG4gIH0sIHtcbiAgICBrZXk6ICdjbG9zZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNsb3NlKCkge1xuICAgICAgdmFyIG9wdGlvbnMgPSBhcmd1bWVudHMubGVuZ3RoIDw9IDAgfHwgYXJndW1lbnRzWzBdID09PSB1bmRlZmluZWQgPyB7fSA6IGFyZ3VtZW50c1swXTtcbiAgICAgIHZhciBjb2RlID0gb3B0aW9ucy5jb2RlO1xuICAgICAgdmFyIHJlYXNvbiA9IG9wdGlvbnMucmVhc29uO1xuICAgICAgdmFyIHdhc0NsZWFuID0gb3B0aW9ucy53YXNDbGVhbjtcblxuICAgICAgdmFyIGxpc3RlbmVycyA9IF9uZXR3b3JrQnJpZGdlMlsnZGVmYXVsdCddLndlYnNvY2tldHNMb29rdXAodGhpcy51cmwpO1xuXG4gICAgICBsaXN0ZW5lcnMuZm9yRWFjaChmdW5jdGlvbiAoc29ja2V0KSB7XG4gICAgICAgIHNvY2tldC5yZWFkeVN0YXRlID0gX3dlYnNvY2tldDJbJ2RlZmF1bHQnXS5DTE9TRTtcbiAgICAgICAgc29ja2V0LmRpc3BhdGNoRXZlbnQoKDAsIF9ldmVudEZhY3RvcnkuY3JlYXRlQ2xvc2VFdmVudCkoe1xuICAgICAgICAgIHR5cGU6ICdjbG9zZScsXG4gICAgICAgICAgdGFyZ2V0OiBzb2NrZXQsXG4gICAgICAgICAgY29kZTogY29kZSB8fCBfaGVscGVyc0Nsb3NlQ29kZXMyWydkZWZhdWx0J10uQ0xPU0VfTk9STUFMLFxuICAgICAgICAgIHJlYXNvbjogcmVhc29uIHx8ICcnLFxuICAgICAgICAgIHdhc0NsZWFuOiB3YXNDbGVhblxuICAgICAgICB9KSk7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KCgwLCBfZXZlbnRGYWN0b3J5LmNyZWF0ZUNsb3NlRXZlbnQpKHsgdHlwZTogJ2Nsb3NlJyB9KSwgdGhpcyk7XG4gICAgICBfbmV0d29ya0JyaWRnZTJbJ2RlZmF1bHQnXS5yZW1vdmVTZXJ2ZXIodGhpcy51cmwpO1xuICAgIH1cblxuICAgIC8qXG4gICAgKiBSZXR1cm5zIGFuIGFycmF5IG9mIHdlYnNvY2tldHMgd2hpY2ggYXJlIGxpc3RlbmluZyB0byB0aGlzIHNlcnZlclxuICAgICovXG4gIH0sIHtcbiAgICBrZXk6ICdjbGllbnRzJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gY2xpZW50cygpIHtcbiAgICAgIHJldHVybiBfbmV0d29ya0JyaWRnZTJbJ2RlZmF1bHQnXS53ZWJzb2NrZXRzTG9va3VwKHRoaXMudXJsKTtcbiAgICB9XG5cbiAgICAvKlxuICAgICogUHJlcGFyZXMgYSBtZXRob2QgdG8gc3VibWl0IGFuIGV2ZW50IHRvIG1lbWJlcnMgb2YgdGhlIHJvb21cbiAgICAqXG4gICAgKiBlLmcuIHNlcnZlci50bygnbXktcm9vbScpLmVtaXQoJ2hpIScpO1xuICAgICovXG4gIH0sIHtcbiAgICBrZXk6ICd0bycsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIHRvKHJvb20pIHtcbiAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICB2YXIgd2Vic29ja2V0cyA9IF9uZXR3b3JrQnJpZGdlMlsnZGVmYXVsdCddLndlYnNvY2tldHNMb29rdXAodGhpcy51cmwsIHJvb20pO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgZW1pdDogZnVuY3Rpb24gZW1pdChldmVudCwgZGF0YSkge1xuICAgICAgICAgIF90aGlzLmVtaXQoZXZlbnQsIGRhdGEsIHsgd2Vic29ja2V0czogd2Vic29ja2V0cyB9KTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gU2VydmVyO1xufSkoX2V2ZW50VGFyZ2V0MlsnZGVmYXVsdCddKTtcblxuU2VydmVyLm9mID0gZnVuY3Rpb24gb2YodXJsKSB7XG4gIHJldHVybiBuZXcgU2VydmVyKHVybCk7XG59O1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBTZXJ2ZXI7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG52YXIgX2dldCA9IGZ1bmN0aW9uIGdldChfeDMsIF94NCwgX3g1KSB7IHZhciBfYWdhaW4gPSB0cnVlOyBfZnVuY3Rpb246IHdoaWxlIChfYWdhaW4pIHsgdmFyIG9iamVjdCA9IF94MywgcHJvcGVydHkgPSBfeDQsIHJlY2VpdmVyID0gX3g1OyBfYWdhaW4gPSBmYWxzZTsgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlOyB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7IGlmIChkZXNjID09PSB1bmRlZmluZWQpIHsgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpOyBpZiAocGFyZW50ID09PSBudWxsKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gZWxzZSB7IF94MyA9IHBhcmVudDsgX3g0ID0gcHJvcGVydHk7IF94NSA9IHJlY2VpdmVyOyBfYWdhaW4gPSB0cnVlOyBkZXNjID0gcGFyZW50ID0gdW5kZWZpbmVkOyBjb250aW51ZSBfZnVuY3Rpb247IH0gfSBlbHNlIGlmICgndmFsdWUnIGluIGRlc2MpIHsgcmV0dXJuIGRlc2MudmFsdWU7IH0gZWxzZSB7IHZhciBnZXR0ZXIgPSBkZXNjLmdldDsgaWYgKGdldHRlciA9PT0gdW5kZWZpbmVkKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTsgfSB9IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09ICdmdW5jdGlvbicgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90ICcgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBfdXJpanMgPSByZXF1aXJlKCd1cmlqcycpO1xuXG52YXIgX3VyaWpzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3VyaWpzKTtcblxudmFyIF9oZWxwZXJzRGVsYXkgPSByZXF1aXJlKCcuL2hlbHBlcnMvZGVsYXknKTtcblxudmFyIF9oZWxwZXJzRGVsYXkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaGVscGVyc0RlbGF5KTtcblxudmFyIF9ldmVudFRhcmdldCA9IHJlcXVpcmUoJy4vZXZlbnQtdGFyZ2V0Jyk7XG5cbnZhciBfZXZlbnRUYXJnZXQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZXZlbnRUYXJnZXQpO1xuXG52YXIgX25ldHdvcmtCcmlkZ2UgPSByZXF1aXJlKCcuL25ldHdvcmstYnJpZGdlJyk7XG5cbnZhciBfbmV0d29ya0JyaWRnZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9uZXR3b3JrQnJpZGdlKTtcblxudmFyIF9oZWxwZXJzQ2xvc2VDb2RlcyA9IHJlcXVpcmUoJy4vaGVscGVycy9jbG9zZS1jb2RlcycpO1xuXG52YXIgX2hlbHBlcnNDbG9zZUNvZGVzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2hlbHBlcnNDbG9zZUNvZGVzKTtcblxudmFyIF9ldmVudEZhY3RvcnkgPSByZXF1aXJlKCcuL2V2ZW50LWZhY3RvcnknKTtcblxuLypcbiogVGhlIHNvY2tldC1pbyBjbGFzcyBpcyBkZXNpZ25lZCB0byBtaW1pY2sgdGhlIHJlYWwgQVBJIGFzIGNsb3NlbHkgYXMgcG9zc2libGUuXG4qXG4qIGh0dHA6Ly9zb2NrZXQuaW8vZG9jcy9cbiovXG5cbnZhciBTb2NrZXRJTyA9IChmdW5jdGlvbiAoX0V2ZW50VGFyZ2V0KSB7XG4gIF9pbmhlcml0cyhTb2NrZXRJTywgX0V2ZW50VGFyZ2V0KTtcblxuICAvKlxuICAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAgKi9cblxuICBmdW5jdGlvbiBTb2NrZXRJTygpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdmFyIHVybCA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMCB8fCBhcmd1bWVudHNbMF0gPT09IHVuZGVmaW5lZCA/ICdzb2NrZXQuaW8nIDogYXJndW1lbnRzWzBdO1xuICAgIHZhciBwcm90b2NvbCA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/ICcnIDogYXJndW1lbnRzWzFdO1xuXG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFNvY2tldElPKTtcblxuICAgIF9nZXQoT2JqZWN0LmdldFByb3RvdHlwZU9mKFNvY2tldElPLnByb3RvdHlwZSksICdjb25zdHJ1Y3RvcicsIHRoaXMpLmNhbGwodGhpcyk7XG5cbiAgICB0aGlzLmJpbmFyeVR5cGUgPSAnYmxvYic7XG4gICAgdGhpcy51cmwgPSAoMCwgX3VyaWpzMlsnZGVmYXVsdCddKSh1cmwpLnRvU3RyaW5nKCk7XG4gICAgdGhpcy5yZWFkeVN0YXRlID0gU29ja2V0SU8uQ09OTkVDVElORztcbiAgICB0aGlzLnByb3RvY29sID0gJyc7XG5cbiAgICBpZiAodHlwZW9mIHByb3RvY29sID09PSAnc3RyaW5nJykge1xuICAgICAgdGhpcy5wcm90b2NvbCA9IHByb3RvY29sO1xuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShwcm90b2NvbCkgJiYgcHJvdG9jb2wubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5wcm90b2NvbCA9IHByb3RvY29sWzBdO1xuICAgIH1cblxuICAgIHZhciBzZXJ2ZXIgPSBfbmV0d29ya0JyaWRnZTJbJ2RlZmF1bHQnXS5hdHRhY2hXZWJTb2NrZXQodGhpcywgdGhpcy51cmwpO1xuXG4gICAgLypcbiAgICAqIERlbGF5IHRyaWdnZXJpbmcgdGhlIGNvbm5lY3Rpb24gZXZlbnRzIHNvIHRoZXkgY2FuIGJlIGRlZmluZWQgaW4gdGltZS5cbiAgICAqL1xuICAgICgwLCBfaGVscGVyc0RlbGF5MlsnZGVmYXVsdCddKShmdW5jdGlvbiBkZWxheUNhbGxiYWNrKCkge1xuICAgICAgaWYgKHNlcnZlcikge1xuICAgICAgICB0aGlzLnJlYWR5U3RhdGUgPSBTb2NrZXRJTy5PUEVOO1xuICAgICAgICBzZXJ2ZXIuZGlzcGF0Y2hFdmVudCgoMCwgX2V2ZW50RmFjdG9yeS5jcmVhdGVFdmVudCkoeyB0eXBlOiAnY29ubmVjdGlvbicgfSksIHNlcnZlciwgdGhpcyk7XG4gICAgICAgIHNlcnZlci5kaXNwYXRjaEV2ZW50KCgwLCBfZXZlbnRGYWN0b3J5LmNyZWF0ZUV2ZW50KSh7IHR5cGU6ICdjb25uZWN0JyB9KSwgc2VydmVyLCB0aGlzKTsgLy8gYWxpYXNcbiAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KCgwLCBfZXZlbnRGYWN0b3J5LmNyZWF0ZUV2ZW50KSh7IHR5cGU6ICdjb25uZWN0JywgdGFyZ2V0OiB0aGlzIH0pKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucmVhZHlTdGF0ZSA9IFNvY2tldElPLkNMT1NFRDtcbiAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KCgwLCBfZXZlbnRGYWN0b3J5LmNyZWF0ZUV2ZW50KSh7IHR5cGU6ICdlcnJvcicsIHRhcmdldDogdGhpcyB9KSk7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCgoMCwgX2V2ZW50RmFjdG9yeS5jcmVhdGVDbG9zZUV2ZW50KSh7XG4gICAgICAgICAgdHlwZTogJ2Nsb3NlJyxcbiAgICAgICAgICB0YXJnZXQ6IHRoaXMsXG4gICAgICAgICAgY29kZTogX2hlbHBlcnNDbG9zZUNvZGVzMlsnZGVmYXVsdCddLkNMT1NFX05PUk1BTFxuICAgICAgICB9KSk7XG5cbiAgICAgICAgY29uc29sZS5lcnJvcignU29ja2V0LmlvIGNvbm5lY3Rpb24gdG8gXFwnJyArIHRoaXMudXJsICsgJ1xcJyBmYWlsZWQnKTtcbiAgICAgIH1cbiAgICB9LCB0aGlzKTtcblxuICAgIC8qKlxuICAgICAgQWRkIGFuIGFsaWFzZWQgZXZlbnQgbGlzdGVuZXIgZm9yIGNsb3NlIC8gZGlzY29ubmVjdFxuICAgICAqL1xuICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcignY2xvc2UnLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIF90aGlzLmRpc3BhdGNoRXZlbnQoKDAsIF9ldmVudEZhY3RvcnkuY3JlYXRlQ2xvc2VFdmVudCkoe1xuICAgICAgICB0eXBlOiAnZGlzY29ubmVjdCcsXG4gICAgICAgIHRhcmdldDogZXZlbnQudGFyZ2V0LFxuICAgICAgICBjb2RlOiBldmVudC5jb2RlXG4gICAgICB9KSk7XG4gICAgfSk7XG4gIH1cblxuICAvKlxuICAqIENsb3NlcyB0aGUgU29ja2V0SU8gY29ubmVjdGlvbiBvciBjb25uZWN0aW9uIGF0dGVtcHQsIGlmIGFueS5cbiAgKiBJZiB0aGUgY29ubmVjdGlvbiBpcyBhbHJlYWR5IENMT1NFRCwgdGhpcyBtZXRob2QgZG9lcyBub3RoaW5nLlxuICAqL1xuXG4gIF9jcmVhdGVDbGFzcyhTb2NrZXRJTywgW3tcbiAgICBrZXk6ICdjbG9zZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGNsb3NlKCkge1xuICAgICAgaWYgKHRoaXMucmVhZHlTdGF0ZSAhPT0gU29ja2V0SU8uT1BFTikge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgfVxuXG4gICAgICB2YXIgc2VydmVyID0gX25ldHdvcmtCcmlkZ2UyWydkZWZhdWx0J10uc2VydmVyTG9va3VwKHRoaXMudXJsKTtcbiAgICAgIF9uZXR3b3JrQnJpZGdlMlsnZGVmYXVsdCddLnJlbW92ZVdlYlNvY2tldCh0aGlzLCB0aGlzLnVybCk7XG5cbiAgICAgIHRoaXMucmVhZHlTdGF0ZSA9IFNvY2tldElPLkNMT1NFRDtcbiAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCgoMCwgX2V2ZW50RmFjdG9yeS5jcmVhdGVDbG9zZUV2ZW50KSh7XG4gICAgICAgIHR5cGU6ICdjbG9zZScsXG4gICAgICAgIHRhcmdldDogdGhpcyxcbiAgICAgICAgY29kZTogX2hlbHBlcnNDbG9zZUNvZGVzMlsnZGVmYXVsdCddLkNMT1NFX05PUk1BTFxuICAgICAgfSkpO1xuXG4gICAgICBpZiAoc2VydmVyKSB7XG4gICAgICAgIHNlcnZlci5kaXNwYXRjaEV2ZW50KCgwLCBfZXZlbnRGYWN0b3J5LmNyZWF0ZUNsb3NlRXZlbnQpKHtcbiAgICAgICAgICB0eXBlOiAnZGlzY29ubmVjdCcsXG4gICAgICAgICAgdGFyZ2V0OiB0aGlzLFxuICAgICAgICAgIGNvZGU6IF9oZWxwZXJzQ2xvc2VDb2RlczJbJ2RlZmF1bHQnXS5DTE9TRV9OT1JNQUxcbiAgICAgICAgfSksIHNlcnZlcik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLypcbiAgICAqIEFsaWFzIGZvciBTb2NrZXQjY2xvc2VcbiAgICAqXG4gICAgKiBodHRwczovL2dpdGh1Yi5jb20vc29ja2V0aW8vc29ja2V0LmlvLWNsaWVudC9ibG9iL21hc3Rlci9saWIvc29ja2V0LmpzI0wzODNcbiAgICAqL1xuICB9LCB7XG4gICAga2V5OiAnZGlzY29ubmVjdCcsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGRpc2Nvbm5lY3QoKSB7XG4gICAgICB0aGlzLmNsb3NlKCk7XG4gICAgfVxuXG4gICAgLypcbiAgICAqIFN1Ym1pdHMgYW4gZXZlbnQgdG8gdGhlIHNlcnZlciB3aXRoIGEgcGF5bG9hZFxuICAgICovXG4gIH0sIHtcbiAgICBrZXk6ICdlbWl0JyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gZW1pdChldmVudCwgZGF0YSkge1xuICAgICAgaWYgKHRoaXMucmVhZHlTdGF0ZSAhPT0gU29ja2V0SU8uT1BFTikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NvY2tldElPIGlzIGFscmVhZHkgaW4gQ0xPU0lORyBvciBDTE9TRUQgc3RhdGUnKTtcbiAgICAgIH1cblxuICAgICAgdmFyIG1lc3NhZ2VFdmVudCA9ICgwLCBfZXZlbnRGYWN0b3J5LmNyZWF0ZU1lc3NhZ2VFdmVudCkoe1xuICAgICAgICB0eXBlOiBldmVudCxcbiAgICAgICAgb3JpZ2luOiB0aGlzLnVybCxcbiAgICAgICAgZGF0YTogZGF0YVxuICAgICAgfSk7XG5cbiAgICAgIHZhciBzZXJ2ZXIgPSBfbmV0d29ya0JyaWRnZTJbJ2RlZmF1bHQnXS5zZXJ2ZXJMb29rdXAodGhpcy51cmwpO1xuXG4gICAgICBpZiAoc2VydmVyKSB7XG4gICAgICAgIHNlcnZlci5kaXNwYXRjaEV2ZW50KG1lc3NhZ2VFdmVudCwgZGF0YSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLypcbiAgICAqIFN1Ym1pdHMgYSAnbWVzc2FnZScgZXZlbnQgdG8gdGhlIHNlcnZlci5cbiAgICAqXG4gICAgKiBTaG91bGQgYmVoYXZlIGV4YWN0bHkgbGlrZSBXZWJTb2NrZXQjc2VuZFxuICAgICpcbiAgICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9zb2NrZXRpby9zb2NrZXQuaW8tY2xpZW50L2Jsb2IvbWFzdGVyL2xpYi9zb2NrZXQuanMjTDExM1xuICAgICovXG4gIH0sIHtcbiAgICBrZXk6ICdzZW5kJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gc2VuZChkYXRhKSB7XG4gICAgICB0aGlzLmVtaXQoJ21lc3NhZ2UnLCBkYXRhKTtcbiAgICB9XG5cbiAgICAvKlxuICAgICogRm9yIHJlZ2lzdGVyaW5nIGV2ZW50cyB0byBiZSByZWNlaXZlZCBmcm9tIHRoZSBzZXJ2ZXJcbiAgICAqL1xuICB9LCB7XG4gICAga2V5OiAnb24nLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBvbih0eXBlLCBjYWxsYmFjaykge1xuICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGNhbGxiYWNrKTtcbiAgICB9XG5cbiAgICAvKlxuICAgICogRm9yIGNvbm5lY3Rpb24gbWFuYWdlbWVudFxuICAgICovXG4gIH0sIHtcbiAgICBrZXk6ICdvbmNlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gb25jZSh0eXBlLCBjYWxsYmFjaykge1xuICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKHR5cGUsIGNhbGxiYWNrKTtcbiAgICB9XG5cbiAgICAvKlxuICAgICAqIEpvaW4gYSByb29tIG9uIGEgc2VydmVyXG4gICAgICpcbiAgICAgKiBodHRwOi8vc29ja2V0LmlvL2RvY3Mvcm9vbXMtYW5kLW5hbWVzcGFjZXMvI2pvaW5pbmctYW5kLWxlYXZpbmdcbiAgICAgKi9cbiAgfSwge1xuICAgIGtleTogJ2pvaW4nLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBqb2luKHJvb20pIHtcbiAgICAgIF9uZXR3b3JrQnJpZGdlMlsnZGVmYXVsdCddLmFkZE1lbWJlcnNoaXBUb1Jvb20odGhpcywgcm9vbSk7XG4gICAgfVxuXG4gICAgLypcbiAgICAgKiBHZXQgdGhlIHdlYnNvY2tldCB0byBsZWF2ZSB0aGUgcm9vbVxuICAgICAqXG4gICAgICogaHR0cDovL3NvY2tldC5pby9kb2NzL3Jvb21zLWFuZC1uYW1lc3BhY2VzLyNqb2luaW5nLWFuZC1sZWF2aW5nXG4gICAgICovXG4gIH0sIHtcbiAgICBrZXk6ICdsZWF2ZScsXG4gICAgdmFsdWU6IGZ1bmN0aW9uIGxlYXZlKHJvb20pIHtcbiAgICAgIF9uZXR3b3JrQnJpZGdlMlsnZGVmYXVsdCddLnJlbW92ZU1lbWJlcnNoaXBGcm9tUm9vbSh0aGlzLCByb29tKTtcbiAgICB9XG5cbiAgICAvKlxuICAgICAqIEludm9rZXMgYWxsIGxpc3RlbmVyIGZ1bmN0aW9ucyB0aGF0IGFyZSBsaXN0ZW5pbmcgdG8gdGhlIGdpdmVuIGV2ZW50LnR5cGUgcHJvcGVydHkuIEVhY2hcbiAgICAgKiBsaXN0ZW5lciB3aWxsIGJlIHBhc3NlZCB0aGUgZXZlbnQgYXMgdGhlIGZpcnN0IGFyZ3VtZW50LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtvYmplY3R9IGV2ZW50IC0gZXZlbnQgb2JqZWN0IHdoaWNoIHdpbGwgYmUgcGFzc2VkIHRvIGFsbCBsaXN0ZW5lcnMgb2YgdGhlIGV2ZW50LnR5cGUgcHJvcGVydHlcbiAgICAgKi9cbiAgfSwge1xuICAgIGtleTogJ2Rpc3BhdGNoRXZlbnQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBkaXNwYXRjaEV2ZW50KGV2ZW50KSB7XG4gICAgICB2YXIgX3RoaXMyID0gdGhpcztcblxuICAgICAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGN1c3RvbUFyZ3VtZW50cyA9IEFycmF5KF9sZW4gPiAxID8gX2xlbiAtIDEgOiAwKSwgX2tleSA9IDE7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICAgICAgY3VzdG9tQXJndW1lbnRzW19rZXkgLSAxXSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgICAgIH1cblxuICAgICAgdmFyIGV2ZW50TmFtZSA9IGV2ZW50LnR5cGU7XG4gICAgICB2YXIgbGlzdGVuZXJzID0gdGhpcy5saXN0ZW5lcnNbZXZlbnROYW1lXTtcblxuICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGxpc3RlbmVycykpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBsaXN0ZW5lcnMuZm9yRWFjaChmdW5jdGlvbiAobGlzdGVuZXIpIHtcbiAgICAgICAgaWYgKGN1c3RvbUFyZ3VtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgbGlzdGVuZXIuYXBwbHkoX3RoaXMyLCBjdXN0b21Bcmd1bWVudHMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFJlZ3VsYXIgV2ViU29ja2V0cyBleHBlY3QgYSBNZXNzYWdlRXZlbnQgYnV0IFNvY2tldGlvLmlvIGp1c3Qgd2FudHMgcmF3IGRhdGFcbiAgICAgICAgICAvLyAgcGF5bG9hZCBpbnN0YW5jZW9mIE1lc3NhZ2VFdmVudCB3b3JrcywgYnV0IHlvdSBjYW4ndCBpc250YW5jZSBvZiBOb2RlRXZlbnRcbiAgICAgICAgICAvLyAgZm9yIG5vdyB3ZSBkZXRlY3QgaWYgdGhlIG91dHB1dCBoYXMgZGF0YSBkZWZpbmVkIG9uIGl0XG4gICAgICAgICAgbGlzdGVuZXIuY2FsbChfdGhpczIsIGV2ZW50LmRhdGEgPyBldmVudC5kYXRhIDogZXZlbnQpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1dKTtcblxuICByZXR1cm4gU29ja2V0SU87XG59KShfZXZlbnRUYXJnZXQyWydkZWZhdWx0J10pO1xuXG5Tb2NrZXRJTy5DT05ORUNUSU5HID0gMDtcblNvY2tldElPLk9QRU4gPSAxO1xuU29ja2V0SU8uQ0xPU0lORyA9IDI7XG5Tb2NrZXRJTy5DTE9TRUQgPSAzO1xuXG4vKlxuKiBTdGF0aWMgY29uc3RydWN0b3IgbWV0aG9kcyBmb3IgdGhlIElPIFNvY2tldFxuKi9cbnZhciBJTyA9IGZ1bmN0aW9uIGlvQ29uc3RydWN0b3IodXJsKSB7XG4gIHJldHVybiBuZXcgU29ja2V0SU8odXJsKTtcbn07XG5cbi8qXG4qIEFsaWFzIHRoZSByYXcgSU8oKSBjb25zdHJ1Y3RvclxuKi9cbklPLmNvbm5lY3QgPSBmdW5jdGlvbiBpb0Nvbm5lY3QodXJsKSB7XG4gIC8qIGVzbGludC1kaXNhYmxlIG5ldy1jYXAgKi9cbiAgcmV0dXJuIElPKHVybCk7XG4gIC8qIGVzbGludC1lbmFibGUgbmV3LWNhcCAqL1xufTtcblxuZXhwb3J0c1snZGVmYXVsdCddID0gSU87XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuXG52YXIgX2NyZWF0ZUNsYXNzID0gKGZ1bmN0aW9uICgpIHsgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7IGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHsgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTsgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlOyBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7IGlmICgndmFsdWUnIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlOyBPYmplY3QuZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7IH0gfSByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykgeyBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpOyBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTsgcmV0dXJuIENvbnN0cnVjdG9yOyB9OyB9KSgpO1xuXG52YXIgX2dldCA9IGZ1bmN0aW9uIGdldChfeDIsIF94MywgX3g0KSB7IHZhciBfYWdhaW4gPSB0cnVlOyBfZnVuY3Rpb246IHdoaWxlIChfYWdhaW4pIHsgdmFyIG9iamVjdCA9IF94MiwgcHJvcGVydHkgPSBfeDMsIHJlY2VpdmVyID0gX3g0OyBfYWdhaW4gPSBmYWxzZTsgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlOyB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7IGlmIChkZXNjID09PSB1bmRlZmluZWQpIHsgdmFyIHBhcmVudCA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpOyBpZiAocGFyZW50ID09PSBudWxsKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gZWxzZSB7IF94MiA9IHBhcmVudDsgX3gzID0gcHJvcGVydHk7IF94NCA9IHJlY2VpdmVyOyBfYWdhaW4gPSB0cnVlOyBkZXNjID0gcGFyZW50ID0gdW5kZWZpbmVkOyBjb250aW51ZSBfZnVuY3Rpb247IH0gfSBlbHNlIGlmICgndmFsdWUnIGluIGRlc2MpIHsgcmV0dXJuIGRlc2MudmFsdWU7IH0gZWxzZSB7IHZhciBnZXR0ZXIgPSBkZXNjLmdldDsgaWYgKGdldHRlciA9PT0gdW5kZWZpbmVkKSB7IHJldHVybiB1bmRlZmluZWQ7IH0gcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTsgfSB9IH07XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ICdkZWZhdWx0Jzogb2JqIH07IH1cblxuZnVuY3Rpb24gX2NsYXNzQ2FsbENoZWNrKGluc3RhbmNlLCBDb25zdHJ1Y3RvcikgeyBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb24nKTsgfSB9XG5cbmZ1bmN0aW9uIF9pbmhlcml0cyhzdWJDbGFzcywgc3VwZXJDbGFzcykgeyBpZiAodHlwZW9mIHN1cGVyQ2xhc3MgIT09ICdmdW5jdGlvbicgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkgeyB0aHJvdyBuZXcgVHlwZUVycm9yKCdTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90ICcgKyB0eXBlb2Ygc3VwZXJDbGFzcyk7IH0gc3ViQ2xhc3MucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7IGNvbnN0cnVjdG9yOiB7IHZhbHVlOiBzdWJDbGFzcywgZW51bWVyYWJsZTogZmFsc2UsIHdyaXRhYmxlOiB0cnVlLCBjb25maWd1cmFibGU6IHRydWUgfSB9KTsgaWYgKHN1cGVyQ2xhc3MpIE9iamVjdC5zZXRQcm90b3R5cGVPZiA/IE9iamVjdC5zZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzOyB9XG5cbnZhciBfdXJpanMgPSByZXF1aXJlKCd1cmlqcycpO1xuXG52YXIgX3VyaWpzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3VyaWpzKTtcblxudmFyIF9oZWxwZXJzRGVsYXkgPSByZXF1aXJlKCcuL2hlbHBlcnMvZGVsYXknKTtcblxudmFyIF9oZWxwZXJzRGVsYXkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaGVscGVyc0RlbGF5KTtcblxudmFyIF9ldmVudFRhcmdldCA9IHJlcXVpcmUoJy4vZXZlbnQtdGFyZ2V0Jyk7XG5cbnZhciBfZXZlbnRUYXJnZXQyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZXZlbnRUYXJnZXQpO1xuXG52YXIgX25ldHdvcmtCcmlkZ2UgPSByZXF1aXJlKCcuL25ldHdvcmstYnJpZGdlJyk7XG5cbnZhciBfbmV0d29ya0JyaWRnZTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9uZXR3b3JrQnJpZGdlKTtcblxudmFyIF9oZWxwZXJzQ2xvc2VDb2RlcyA9IHJlcXVpcmUoJy4vaGVscGVycy9jbG9zZS1jb2RlcycpO1xuXG52YXIgX2hlbHBlcnNDbG9zZUNvZGVzMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2hlbHBlcnNDbG9zZUNvZGVzKTtcblxudmFyIF9ldmVudEZhY3RvcnkgPSByZXF1aXJlKCcuL2V2ZW50LWZhY3RvcnknKTtcblxuLypcbiogVGhlIG1haW4gd2Vic29ja2V0IGNsYXNzIHdoaWNoIGlzIGRlc2lnbmVkIHRvIG1pbWljayB0aGUgbmF0aXZlIFdlYlNvY2tldCBjbGFzcyBhcyBjbG9zZVxuKiBhcyBwb3NzaWJsZS5cbipcbiogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1dlYlNvY2tldFxuKi9cblxudmFyIFdlYlNvY2tldCA9IChmdW5jdGlvbiAoX0V2ZW50VGFyZ2V0KSB7XG4gIF9pbmhlcml0cyhXZWJTb2NrZXQsIF9FdmVudFRhcmdldCk7XG5cbiAgLypcbiAgKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gICovXG5cbiAgZnVuY3Rpb24gV2ViU29ja2V0KHVybCkge1xuICAgIHZhciBwcm90b2NvbCA9IGFyZ3VtZW50cy5sZW5ndGggPD0gMSB8fCBhcmd1bWVudHNbMV0gPT09IHVuZGVmaW5lZCA/ICcnIDogYXJndW1lbnRzWzFdO1xuXG4gICAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIFdlYlNvY2tldCk7XG5cbiAgICBfZ2V0KE9iamVjdC5nZXRQcm90b3R5cGVPZihXZWJTb2NrZXQucHJvdG90eXBlKSwgJ2NvbnN0cnVjdG9yJywgdGhpcykuY2FsbCh0aGlzKTtcblxuICAgIGlmICghdXJsKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdGYWlsZWQgdG8gY29uc3RydWN0IFxcJ1dlYlNvY2tldFxcJzogMSBhcmd1bWVudCByZXF1aXJlZCwgYnV0IG9ubHkgMCBwcmVzZW50LicpO1xuICAgIH1cblxuICAgIHRoaXMuYmluYXJ5VHlwZSA9ICdibG9iJztcbiAgICB0aGlzLnVybCA9ICgwLCBfdXJpanMyWydkZWZhdWx0J10pKHVybCkudG9TdHJpbmcoKTtcbiAgICB0aGlzLnJlYWR5U3RhdGUgPSBXZWJTb2NrZXQuQ09OTkVDVElORztcbiAgICB0aGlzLnByb3RvY29sID0gJyc7XG5cbiAgICBpZiAodHlwZW9mIHByb3RvY29sID09PSAnc3RyaW5nJykge1xuICAgICAgdGhpcy5wcm90b2NvbCA9IHByb3RvY29sO1xuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShwcm90b2NvbCkgJiYgcHJvdG9jb2wubGVuZ3RoID4gMCkge1xuICAgICAgdGhpcy5wcm90b2NvbCA9IHByb3RvY29sWzBdO1xuICAgIH1cblxuICAgIC8qXG4gICAgKiBJbiBvcmRlciB0byBjYXB0dXJlIHRoZSBjYWxsYmFjayBmdW5jdGlvbiB3ZSBuZWVkIHRvIGRlZmluZSBjdXN0b20gc2V0dGVycy5cbiAgICAqIFRvIGlsbHVzdHJhdGU6XG4gICAgKiAgIG15U29ja2V0Lm9ub3BlbiA9IGZ1bmN0aW9uKCkgeyBhbGVydCh0cnVlKSB9O1xuICAgICpcbiAgICAqIFRoZSBvbmx5IHdheSB0byBjYXB0dXJlIHRoYXQgZnVuY3Rpb24gYW5kIGhvbGQgb250byBpdCBmb3IgbGF0ZXIgaXMgd2l0aCB0aGVcbiAgICAqIGJlbG93IGNvZGU6XG4gICAgKi9cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0aGlzLCB7XG4gICAgICBvbm9wZW46IHtcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5saXN0ZW5lcnMub3BlbjtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbiBzZXQobGlzdGVuZXIpIHtcbiAgICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ29wZW4nLCBsaXN0ZW5lcik7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBvbm1lc3NhZ2U6IHtcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBnZXQ6IGZ1bmN0aW9uIGdldCgpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5saXN0ZW5lcnMubWVzc2FnZTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbiBzZXQobGlzdGVuZXIpIHtcbiAgICAgICAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBsaXN0ZW5lcik7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBvbmNsb3NlOiB7XG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMubGlzdGVuZXJzLmNsb3NlO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uIHNldChsaXN0ZW5lcikge1xuICAgICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcignY2xvc2UnLCBsaXN0ZW5lcik7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBvbmVycm9yOiB7XG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQoKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMubGlzdGVuZXJzLmVycm9yO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uIHNldChsaXN0ZW5lcikge1xuICAgICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBsaXN0ZW5lcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHZhciBzZXJ2ZXIgPSBfbmV0d29ya0JyaWRnZTJbJ2RlZmF1bHQnXS5hdHRhY2hXZWJTb2NrZXQodGhpcywgdGhpcy51cmwpO1xuXG4gICAgLypcbiAgICAqIFRoaXMgZGVsYXkgaXMgbmVlZGVkIHNvIHRoYXQgd2UgZG9udCB0cmlnZ2VyIGFuIGV2ZW50IGJlZm9yZSB0aGUgY2FsbGJhY2tzIGhhdmUgYmVlblxuICAgICogc2V0dXAuIEZvciBleGFtcGxlOlxuICAgICpcbiAgICAqIHZhciBzb2NrZXQgPSBuZXcgV2ViU29ja2V0KCd3czovL2xvY2FsaG9zdCcpO1xuICAgICpcbiAgICAqIC8vIElmIHdlIGRvbnQgaGF2ZSB0aGUgZGVsYXkgdGhlbiB0aGUgZXZlbnQgd291bGQgYmUgdHJpZ2dlcmVkIHJpZ2h0IGhlcmUgYW5kIHRoaXMgaXNcbiAgICAqIC8vIGJlZm9yZSB0aGUgb25vcGVuIGhhZCBhIGNoYW5jZSB0byByZWdpc3RlciBpdHNlbGYuXG4gICAgKlxuICAgICogc29ja2V0Lm9ub3BlbiA9ICgpID0+IHsgLy8gdGhpcyB3b3VsZCBuZXZlciBiZSBjYWxsZWQgfTtcbiAgICAqXG4gICAgKiAvLyBhbmQgd2l0aCB0aGUgZGVsYXkgdGhlIGV2ZW50IGdldHMgdHJpZ2dlcmVkIGhlcmUgYWZ0ZXIgYWxsIG9mIHRoZSBjYWxsYmFja3MgaGF2ZSBiZWVuXG4gICAgKiAvLyByZWdpc3RlcmVkIDotKVxuICAgICovXG4gICAgKDAsIF9oZWxwZXJzRGVsYXkyWydkZWZhdWx0J10pKGZ1bmN0aW9uIGRlbGF5Q2FsbGJhY2soKSB7XG4gICAgICBpZiAoc2VydmVyKSB7XG4gICAgICAgIHRoaXMucmVhZHlTdGF0ZSA9IFdlYlNvY2tldC5PUEVOO1xuICAgICAgICBzZXJ2ZXIuZGlzcGF0Y2hFdmVudCgoMCwgX2V2ZW50RmFjdG9yeS5jcmVhdGVFdmVudCkoeyB0eXBlOiAnY29ubmVjdGlvbicgfSksIHNlcnZlciwgdGhpcyk7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCgoMCwgX2V2ZW50RmFjdG9yeS5jcmVhdGVFdmVudCkoeyB0eXBlOiAnb3BlbicsIHRhcmdldDogdGhpcyB9KSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnJlYWR5U3RhdGUgPSBXZWJTb2NrZXQuQ0xPU0VEO1xuICAgICAgICB0aGlzLmRpc3BhdGNoRXZlbnQoKDAsIF9ldmVudEZhY3RvcnkuY3JlYXRlRXZlbnQpKHsgdHlwZTogJ2Vycm9yJywgdGFyZ2V0OiB0aGlzIH0pKTtcbiAgICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KCgwLCBfZXZlbnRGYWN0b3J5LmNyZWF0ZUNsb3NlRXZlbnQpKHsgdHlwZTogJ2Nsb3NlJywgdGFyZ2V0OiB0aGlzLCBjb2RlOiBfaGVscGVyc0Nsb3NlQ29kZXMyWydkZWZhdWx0J10uQ0xPU0VfTk9STUFMIH0pKTtcblxuICAgICAgICBjb25zb2xlLmVycm9yKCdXZWJTb2NrZXQgY29ubmVjdGlvbiB0byBcXCcnICsgdGhpcy51cmwgKyAnXFwnIGZhaWxlZCcpO1xuICAgICAgfVxuICAgIH0sIHRoaXMpO1xuICB9XG5cbiAgLypcbiAgKiBUcmFuc21pdHMgZGF0YSB0byB0aGUgc2VydmVyIG92ZXIgdGhlIFdlYlNvY2tldCBjb25uZWN0aW9uLlxuICAqXG4gICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1dlYlNvY2tldCNzZW5kKClcbiAgKi9cblxuICBfY3JlYXRlQ2xhc3MoV2ViU29ja2V0LCBbe1xuICAgIGtleTogJ3NlbmQnLFxuICAgIHZhbHVlOiBmdW5jdGlvbiBzZW5kKGRhdGEpIHtcbiAgICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgPT09IFdlYlNvY2tldC5DTE9TSU5HIHx8IHRoaXMucmVhZHlTdGF0ZSA9PT0gV2ViU29ja2V0LkNMT1NFRCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1dlYlNvY2tldCBpcyBhbHJlYWR5IGluIENMT1NJTkcgb3IgQ0xPU0VEIHN0YXRlJyk7XG4gICAgICB9XG5cbiAgICAgIHZhciBtZXNzYWdlRXZlbnQgPSAoMCwgX2V2ZW50RmFjdG9yeS5jcmVhdGVNZXNzYWdlRXZlbnQpKHtcbiAgICAgICAgdHlwZTogJ21lc3NhZ2UnLFxuICAgICAgICBvcmlnaW46IHRoaXMudXJsLFxuICAgICAgICBkYXRhOiBkYXRhXG4gICAgICB9KTtcblxuICAgICAgdmFyIHNlcnZlciA9IF9uZXR3b3JrQnJpZGdlMlsnZGVmYXVsdCddLnNlcnZlckxvb2t1cCh0aGlzLnVybCk7XG5cbiAgICAgIGlmIChzZXJ2ZXIpIHtcbiAgICAgICAgc2VydmVyLmRpc3BhdGNoRXZlbnQobWVzc2FnZUV2ZW50LCBkYXRhKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKlxuICAgICogQ2xvc2VzIHRoZSBXZWJTb2NrZXQgY29ubmVjdGlvbiBvciBjb25uZWN0aW9uIGF0dGVtcHQsIGlmIGFueS5cbiAgICAqIElmIHRoZSBjb25uZWN0aW9uIGlzIGFscmVhZHkgQ0xPU0VELCB0aGlzIG1ldGhvZCBkb2VzIG5vdGhpbmcuXG4gICAgKlxuICAgICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1dlYlNvY2tldCNjbG9zZSgpXG4gICAgKi9cbiAgfSwge1xuICAgIGtleTogJ2Nsb3NlJyxcbiAgICB2YWx1ZTogZnVuY3Rpb24gY2xvc2UoKSB7XG4gICAgICBpZiAodGhpcy5yZWFkeVN0YXRlICE9PSBXZWJTb2NrZXQuT1BFTikge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgfVxuXG4gICAgICB2YXIgc2VydmVyID0gX25ldHdvcmtCcmlkZ2UyWydkZWZhdWx0J10uc2VydmVyTG9va3VwKHRoaXMudXJsKTtcbiAgICAgIHZhciBjbG9zZUV2ZW50ID0gKDAsIF9ldmVudEZhY3RvcnkuY3JlYXRlQ2xvc2VFdmVudCkoe1xuICAgICAgICB0eXBlOiAnY2xvc2UnLFxuICAgICAgICB0YXJnZXQ6IHRoaXMsXG4gICAgICAgIGNvZGU6IF9oZWxwZXJzQ2xvc2VDb2RlczJbJ2RlZmF1bHQnXS5DTE9TRV9OT1JNQUxcbiAgICAgIH0pO1xuXG4gICAgICBfbmV0d29ya0JyaWRnZTJbJ2RlZmF1bHQnXS5yZW1vdmVXZWJTb2NrZXQodGhpcywgdGhpcy51cmwpO1xuXG4gICAgICB0aGlzLnJlYWR5U3RhdGUgPSBXZWJTb2NrZXQuQ0xPU0VEO1xuICAgICAgdGhpcy5kaXNwYXRjaEV2ZW50KGNsb3NlRXZlbnQpO1xuXG4gICAgICBpZiAoc2VydmVyKSB7XG4gICAgICAgIHNlcnZlci5kaXNwYXRjaEV2ZW50KGNsb3NlRXZlbnQsIHNlcnZlcik7XG4gICAgICB9XG4gICAgfVxuICB9XSk7XG5cbiAgcmV0dXJuIFdlYlNvY2tldDtcbn0pKF9ldmVudFRhcmdldDJbJ2RlZmF1bHQnXSk7XG5cbldlYlNvY2tldC5DT05ORUNUSU5HID0gMDtcbldlYlNvY2tldC5PUEVOID0gMTtcbldlYlNvY2tldC5DTE9TSU5HID0gMjtcbldlYlNvY2tldC5DTE9TRUQgPSAzO1xuXG5leHBvcnRzWydkZWZhdWx0J10gPSBXZWJTb2NrZXQ7XG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHNbJ2RlZmF1bHQnXTsiXX0=
