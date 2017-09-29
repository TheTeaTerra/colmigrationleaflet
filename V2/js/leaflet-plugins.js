/* #################################################### */
/* ########## Sidebar V2 Leaflet JS minified ########## */
/* #################################################### */
/**
 * @name Sidebar
 * @class L.Control.Sidebar
 * @extends L.Control
 * @param {string} id - The id of the sidebar element (without the # character)
 * @param {Object} [options] - Optional options object
 * @param {string} [options.position=left] - Position of the sidebar: 'left' or 'right'
 * @see L.control.sidebar
 */
L.Control.Sidebar = L.Control.extend(/** @lends L.Control.Sidebar.prototype */ {
    includes: L.Mixin.Events,

    options: {
        position: 'left'
    },

    initialize: function (id, options) {
        var i, child;

        L.setOptions(this, options);

        // Find sidebar HTMLElement
        this._sidebar = L.DomUtil.get(id);

        // Attach .sidebar-left/right class
        L.DomUtil.addClass(this._sidebar, 'sidebar-' + this.options.position);

        // Attach touch styling if necessary
        if (L.Browser.touch)
            L.DomUtil.addClass(this._sidebar, 'leaflet-touch');

        // Find sidebar > div.sidebar-content
        for (i = this._sidebar.children.length - 1; i >= 0; i--) {
            child = this._sidebar.children[i];
            if (child.tagName == 'DIV' &&
                    L.DomUtil.hasClass(child, 'sidebar-content'))
                this._container = child;
        }

        // Find sidebar ul.sidebar-tabs > li, sidebar .sidebar-tabs > ul > li
        this._tabitems = this._sidebar.querySelectorAll('ul.sidebar-tabs > li, .sidebar-tabs > ul > li');
        for (i = this._tabitems.length - 1; i >= 0; i--) {
            this._tabitems[i]._sidebar = this;
        }

        // Find sidebar > div.sidebar-content > div.sidebar-pane
        this._panes = [];
        this._closeButtons = [];
        for (i = this._container.children.length - 1; i >= 0; i--) {
            child = this._container.children[i];
            if (child.tagName == 'DIV' &&
                L.DomUtil.hasClass(child, 'sidebar-pane')) {
                this._panes.push(child);

                var closeButtons = child.querySelectorAll('.sidebar-close');
                for (var j = 0, len = closeButtons.length; j < len; j++)
                    this._closeButtons.push(closeButtons[j]);
            }
        }
    },

    /**
     * Add this sidebar to the specified map.
     *
     * @param {L.Map} map
     * @returns {Sidebar}
     */
    addTo: function (map) {
        var i, child;

        this._map = map;

        for (i = this._tabitems.length - 1; i >= 0; i--) {
            child = this._tabitems[i];
            var sub = child.querySelector('a');
            if (sub.hasAttribute('href') && sub.getAttribute('href').slice(0,1) == '#') {
                L.DomEvent
                    .on(sub, 'click', L.DomEvent.preventDefault )
                    .on(sub, 'click', this._onClick, child);
            }
        }

        for (i = this._closeButtons.length - 1; i >= 0; i--) {
            child = this._closeButtons[i];
            L.DomEvent.on(child, 'click', this._onCloseClick, this);
        }

        return this;
    },

    /**
     * @deprecated - Please use remove() instead of removeFrom(), as of Leaflet 0.8-dev, the removeFrom() has been replaced with remove()
     * Removes this sidebar from the map.
     * @param {L.Map} map
     * @returns {Sidebar}
     */
     removeFrom: function(map) {
         console.log('removeFrom() has been deprecated, please use remove() instead as support for this function will be ending soon.');
         this.remove(map);
     },

    /**
     * Remove this sidebar from the map.
     *
     * @param {L.Map} map
     * @returns {Sidebar}
     */
    remove: function (map) {
        var i, child;

        this._map = null;

        for (i = this._tabitems.length - 1; i >= 0; i--) {
            child = this._tabitems[i];
            L.DomEvent.off(child.querySelector('a'), 'click', this._onClick);
        }

        for (i = this._closeButtons.length - 1; i >= 0; i--) {
            child = this._closeButtons[i];
            L.DomEvent.off(child, 'click', this._onCloseClick, this);
        }

        return this;
    },

    /**
     * Open sidebar (if necessary) and show the specified tab.
     *
     * @param {string} id - The id of the tab to show (without the # character)
     */
    open: function(id) {
        var i, child;

        // hide old active contents and show new content
        for (i = this._panes.length - 1; i >= 0; i--) {
            child = this._panes[i];
            if (child.id == id)
                L.DomUtil.addClass(child, 'active');
            else if (L.DomUtil.hasClass(child, 'active'))
                L.DomUtil.removeClass(child, 'active');
        }

        // remove old active highlights and set new highlight
        for (i = this._tabitems.length - 1; i >= 0; i--) {
            child = this._tabitems[i];
            if (child.querySelector('a').hash == '#' + id)
                L.DomUtil.addClass(child, 'active');
            else if (L.DomUtil.hasClass(child, 'active'))
                L.DomUtil.removeClass(child, 'active');
        }

        this.fire('content', { id: id });

        // open sidebar (if necessary)
        if (L.DomUtil.hasClass(this._sidebar, 'collapsed')) {
            this.fire('opening');
            L.DomUtil.removeClass(this._sidebar, 'collapsed');
        }

        return this;
    },

    /**
     * Close the sidebar (if necessary).
     */
    close: function() {
        // remove old active highlights
        for (var i = this._tabitems.length - 1; i >= 0; i--) {
            var child = this._tabitems[i];
            if (L.DomUtil.hasClass(child, 'active'))
                L.DomUtil.removeClass(child, 'active');
        }

        // close sidebar
        if (!L.DomUtil.hasClass(this._sidebar, 'collapsed')) {
            this.fire('closing');
            L.DomUtil.addClass(this._sidebar, 'collapsed');
        }

        return this;
    },

    /**
     * @private
     */
    _onClick: function() {
        if (L.DomUtil.hasClass(this, 'active'))
            this._sidebar.close();
        else if (!L.DomUtil.hasClass(this, 'disabled'))
            this._sidebar.open(this.querySelector('a').hash.slice(1));
    },

    /**
     * @private
     */
    _onCloseClick: function () {
        this.close();
    }
});

/**
 * Creates a new sidebar.
 *
 * @example
 * var sidebar = L.control.sidebar('sidebar').addTo(map);
 *
 * @param {string} id - The id of the sidebar element (without the # character)
 * @param {Object} [options] - Optional options object
 * @param {string} [options.position=left] - Position of the sidebar: 'left' or 'right'
 * @returns {Sidebar} A new sidebar instance
 */
L.control.sidebar = function (id, options) {
    return new L.Control.Sidebar(id, options);
};


/* ###################################### */
/* ########## Leaflet Omnivore ########## */
/* ###################################### */
!function(n){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=n();else if("function"==typeof define&&define.amd)define([],n);else{var e;"undefined"!=typeof window?e=window:"undefined"!=typeof global?e=global:"undefined"!=typeof self&&(e=self),e.omnivore=n()}}(function(){var e;return function r(n,e,t){function o(u,a){if(!e[u]){if(!n[u]){var s="function"==typeof require&&require;if(!a&&s)return s(u,!0);if(i)return i(u,!0);throw new Error("Cannot find module '"+u+"'")}var f=e[u]={exports:{}};n[u][0].call(f.exports,function(e){var r=n[u][1][e];return o(r?r:e)},f,f.exports,r,n,e,t)}return e[u].exports}for(var i="function"==typeof require&&require,u=0;u<t.length;u++)o(t[u]);return o}({1:[function(n,e){function r(n,e){"addData"in n&&n.addData(e),"setGeoJSON"in n&&n.setGeoJSON(e)}function t(n,e,t){var o=t||L.geoJson();return v(n,function(n,e){return n?o.fire("error",{error:n}):(r(o,JSON.parse(e.responseText)),void o.fire("ready"))}),o}function o(n,e,t){function o(n,e){return n?i.fire("error",{error:n}):(r(i,f(e.responseText)),void i.fire("ready"))}var i=t||L.geoJson();return v(n,o),i}function i(n,e,r){function t(n,r){function t(){i=!0}var i;return n?o.fire("error",{error:n}):(o.on("error",t),c(r.responseText,e,o),o.off("error",t),void(i||o.fire("ready")))}var o=r||L.geoJson();return v(n,t),o}function u(n,e,r){function t(n,r){function t(){i=!0}var i;return n?o.fire("error",{error:n}):(o.on("error",t),l(r.responseXML||r.responseText,e,o),o.off("error",t),void(i||o.fire("ready")))}var o=r||L.geoJson();return v(n,t),o}function a(n,e,r){function t(n,r){function t(){i=!0}var i;return n?o.fire("error",{error:n}):(o.on("error",t),p(r.responseXML||r.responseText,e,o),o.off("error",t),void(i||o.fire("ready")))}var o=r||L.geoJson();return v(n,t),o}function s(n,e,r){function t(n,r){return n?o.fire("error",{error:n}):(d(r.responseText,e,o),void o.fire("ready"))}var o=r||L.geoJson();return v(n,t),o}function f(n){var e="string"==typeof n?JSON.parse(n):n,r=[];for(var t in e.objects){var o=y.feature(e,e.objects[t]);r=r.concat(o.features?o.features:[o])}return r}function c(n,e,t){function o(n,e){return n?t.fire("error",{error:n}):void r(t,e)}return t=t||L.geoJson(),e=e||{},h.csv2geojson(n,e,o),t}function l(n,e,t){var o=g(n);if(!o)return t.fire("error",{error:"Could not parse GPX"});t=t||L.geoJson();var i=w.gpx(o);return r(t,i),t}function p(n,e,t){var o=g(n);if(!o)return t.fire("error",{error:"Could not parse GPX"});t=t||L.geoJson();var i=w.kml(o);return r(t,i),t}function d(n,e,t){t=t||L.geoJson();var o=m(n);return r(t,o),t}function g(n){return"string"==typeof n?(new DOMParser).parseFromString(n,"text/xml"):n}var v=n("corslite"),h=n("csv2geojson"),m=n("wellknown"),y=n("topojson/topojson.js"),w=n("togeojson");e.exports.geojson=t,e.exports.topojson=o,e.exports.topojson.parse=f,e.exports.csv=i,e.exports.csv.parse=c,e.exports.gpx=u,e.exports.gpx.parse=l,e.exports.kml=a,e.exports.kml.parse=p,e.exports.wkt=s,e.exports.wkt.parse=d},{corslite:5,csv2geojson:6,togeojson:9,"topojson/topojson.js":10,wellknown:11}],2:[function(){},{}],3:[function(n,e){e.exports=n(2)},{}],4:[function(n,e){function r(){}var t=e.exports={};t.nextTick=function(){var n="undefined"!=typeof window&&window.setImmediate,e="undefined"!=typeof window&&window.postMessage&&window.addEventListener;if(n)return function(n){return window.setImmediate(n)};if(e){var r=[];return window.addEventListener("message",function(n){var e=n.source;if((e===window||null===e)&&"process-tick"===n.data&&(n.stopPropagation(),r.length>0)){var t=r.shift();t()}},!0),function(n){r.push(n),window.postMessage("process-tick","*")}}return function(n){setTimeout(n,0)}}(),t.title="browser",t.browser=!0,t.env={},t.argv=[],t.on=r,t.addListener=r,t.once=r,t.off=r,t.removeListener=r,t.removeAllListeners=r,t.emit=r,t.binding=function(){throw new Error("process.binding is not supported")},t.cwd=function(){return"/"},t.chdir=function(){throw new Error("process.chdir is not supported")}},{}],5:[function(n,e){function r(n,e,r){function t(n){return n>=200&&300>n||304===n}function o(){void 0===a.status||t(a.status)?e.call(a,null,a):e.call(a,a,null)}var i=!1;if("undefined"==typeof window.XMLHttpRequest)return e(Error("Browser not supported"));if("undefined"==typeof r){var u=n.match(/^\s*https?:\/\/[^\/]*/);r=u&&u[0]!==location.protocol+"//"+location.domain+(location.port?":"+location.port:"")}var a=new window.XMLHttpRequest;if(r&&!("withCredentials"in a)){a=new window.XDomainRequest;var s=e;e=function(){if(i)s.apply(this,arguments);else{var n=this,e=arguments;setTimeout(function(){s.apply(n,e)},0)}}}return"onload"in a?a.onload=o:a.onreadystatechange=function(){4===a.readyState&&o()},a.onerror=function(n){e.call(this,n||!0,null),e=function(){}},a.onprogress=function(){},a.ontimeout=function(n){e.call(this,n,null),e=function(){}},a.onabort=function(n){e.call(this,n,null),e=function(){}},a.open("GET",n,!0),a.send(null),i=!0,a}"undefined"!=typeof e&&(e.exports=r)},{}],6:[function(n,e){function r(n){return!!n.match(/(Lat)(itude)?/gi)}function t(n){return!!n.match(/(L)(on|ng)(gitude)?/i)}function o(n){return"object"==typeof n?Object.keys(n).length:0}function i(n){var e=[",",";","    ","|"],r=[];return e.forEach(function(e){var t=c(e).parse(n);if(t.length>=1){for(var i=o(t[0]),u=0;u<t.length;u++)if(o(t[u])!==i)return;r.push({delimiter:e,arity:Object.keys(t[0]).length})}}),r.length?r.sort(function(n,e){return e.arity-n.arity})[0].delimiter:null}function u(n){var e=i(n);return e?c(e).parse(n):null}function a(n,e,o){o||(o=e,e={}),e.delimiter=e.delimiter||",";var u=e.latfield||"",a=e.lonfield||"",s=[],f={type:"FeatureCollection",features:s};if("auto"===e.delimiter&&"string"==typeof n&&(e.delimiter=i(n),!e.delimiter))return o({type:"Error",message:"Could not autodetect delimiter"});var p="string"==typeof n?c(e.delimiter).parse(n):n;if(!p.length)return o(null,f);if(!u||!a){for(var d in p[0])!u&&r(d)&&(u=d),!a&&t(d)&&(a=d);if(!u||!a){var g=[];for(var v in p[0])g.push(v);return o({type:"Error",message:"Latitude and longitude fields not present",data:p,fields:g})}}for(var h=[],m=0;m<p.length;m++)if(void 0!==p[m][a]&&void 0!==p[m][a]){var y,w,x,E=p[m][a],L=p[m][u];x=l(E,"EW"),x&&(E=x),x=l(L,"NS"),x&&(L=x),y=parseFloat(E),w=parseFloat(L),isNaN(y)||isNaN(w)?h.push({message:"A row contained an invalid value for latitude or longitude",row:p[m]}):(e.includeLatLon||(delete p[m][a],delete p[m][u]),s.push({type:"Feature",properties:p[m],geometry:{type:"Point",coordinates:[parseFloat(y),parseFloat(w)]}}))}o(h.length?h:null,f)}function s(n){for(var e=n.features,r={type:"Feature",geometry:{type:"LineString",coordinates:[]}},t=0;t<e.length;t++)r.geometry.coordinates.push(e[t].geometry.coordinates);return r.properties=e[0].properties,{type:"FeatureCollection",features:[r]}}function f(n){for(var e=n.features,r={type:"Feature",geometry:{type:"Polygon",coordinates:[[]]}},t=0;t<e.length;t++)r.geometry.coordinates[0].push(e[t].geometry.coordinates);return r.properties=e[0].properties,{type:"FeatureCollection",features:[r]}}var c=n("dsv"),l=n("sexagesimal");e.exports={isLon:t,isLat:r,csv:c.csv.parse,tsv:c.tsv.parse,dsv:c,auto:u,csv2geojson:a,toLine:s,toPolygon:f}},{dsv:7,sexagesimal:8}],7:[function(n,e){n("fs");e.exports=new Function('dsv.version = "0.0.3";\n\ndsv.tsv = dsv("\\t");\ndsv.csv = dsv(",");\n\nfunction dsv(delimiter) {\n  var dsv = {},\n      reFormat = new RegExp("[\\"" + delimiter + "\\n]"),\n      delimiterCode = delimiter.charCodeAt(0);\n\n  dsv.parse = function(text, f) {\n    var o;\n    return dsv.parseRows(text, function(row, i) {\n      if (o) return o(row, i - 1);\n      var a = new Function("d", "return {" + row.map(function(name, i) {\n        return JSON.stringify(name) + ": d[" + i + "]";\n      }).join(",") + "}");\n      o = f ? function(row, i) { return f(a(row), i); } : a;\n    });\n  };\n\n  dsv.parseRows = function(text, f) {\n    var EOL = {}, // sentinel value for end-of-line\n        EOF = {}, // sentinel value for end-of-file\n        rows = [], // output rows\n        N = text.length,\n        I = 0, // current character index\n        n = 0, // the current line number\n        t, // the current token\n        eol; // is the current token followed by EOL?\n\n    function token() {\n      if (I >= N) return EOF; // special case: end of file\n      if (eol) return eol = false, EOL; // special case: end of line\n\n      // special case: quotes\n      var j = I;\n      if (text.charCodeAt(j) === 34) {\n        var i = j;\n        while (i++ < N) {\n          if (text.charCodeAt(i) === 34) {\n            if (text.charCodeAt(i + 1) !== 34) break;\n            ++i;\n          }\n        }\n        I = i + 2;\n        var c = text.charCodeAt(i + 1);\n        if (c === 13) {\n          eol = true;\n          if (text.charCodeAt(i + 2) === 10) ++I;\n        } else if (c === 10) {\n          eol = true;\n        }\n        return text.substring(j + 1, i).replace(/""/g, "\\"");\n      }\n\n      // common case: find next delimiter or newline\n      while (I < N) {\n        var c = text.charCodeAt(I++), k = 1;\n        if (c === 10) eol = true; // \\n\n        else if (c === 13) { eol = true; if (text.charCodeAt(I) === 10) ++I, ++k; } // \\r|\\r\\n\n        else if (c !== delimiterCode) continue;\n        return text.substring(j, I - k);\n      }\n\n      // special case: last token before EOF\n      return text.substring(j);\n    }\n\n    while ((t = token()) !== EOF) {\n      var a = [];\n      while (t !== EOL && t !== EOF) {\n        a.push(t);\n        t = token();\n      }\n      if (f && !(a = f(a, n++))) continue;\n      rows.push(a);\n    }\n\n    return rows;\n  };\n\n  dsv.format = function(rows) {\n    if (Array.isArray(rows[0])) return dsv.formatRows(rows); // deprecated; use formatRows\n    var fieldSet = {}, fields = [];\n\n    // Compute unique fields in order of discovery.\n    rows.forEach(function(row) {\n      for (var field in row) {\n        if (!(field in fieldSet)) {\n          fields.push(fieldSet[field] = field);\n        }\n      }\n    });\n\n    return [fields.map(formatValue).join(delimiter)].concat(rows.map(function(row) {\n      return fields.map(function(field) {\n        return formatValue(row[field]);\n      }).join(delimiter);\n    })).join("\\n");\n  };\n\n  dsv.formatRows = function(rows) {\n    return rows.map(formatRow).join("\\n");\n  };\n\n  function formatRow(row) {\n    return row.map(formatValue).join(delimiter);\n  }\n\n  function formatValue(text) {\n    return reFormat.test(text) ? "\\"" + text.replace(/\\"/g, "\\"\\"") + "\\"" : text;\n  }\n\n  return dsv;\n}\n;return dsv')()},{fs:2}],8:[function(n,e){e.exports=function(n,e){if(e||(e="NSEW"),"string"!=typeof n)return null;var r=/^([0-9.]+)Â°? *(?:([0-9.]+)['â€™â€²â€˜] *)?(?:([0-9.]+)(?:''|"|â€|â€³) *)?([NSEW])?/,t=n.match(r);return t?t[4]&&-1===e.indexOf(t[4])?null:((t[1]?parseFloat(t[1]):0)+(t[2]?parseFloat(t[2])/60:0)+(t[3]?parseFloat(t[3])/3600:0))*(t[4]&&"S"===t[4]||"W"===t[4]?-1:1):null}},{}],9:[function(n,e,r){(function(t){toGeoJSON=function(){"use strict";function e(n){if(!n||!n.length)return 0;for(var e=0,r=0;e<n.length;e++)r=(r<<5)-r+n.charCodeAt(e)|0;return r}function o(n,e){return n.getElementsByTagName(e)}function i(n,e){return n.getAttribute(e)}function u(n,e){return parseFloat(i(n,e))}function a(n,e){var r=o(n,e);return r.length?r[0]:null}function s(n){return n.normalize&&n.normalize(),n}function f(n){for(var e=0,r=[];e<n.length;e++)r[e]=parseFloat(n[e]);return r}function c(n){var e={};for(var r in n)n[r]&&(e[r]=n[r]);return e}function l(n){return n&&s(n),n&&n.firstChild&&n.firstChild.nodeValue}function p(n){return f(n.replace(y,"").split(","))}function d(n){for(var e=n.replace(w,"").split(x),r=[],t=0;t<e.length;t++)r.push(p(e[t]));return r}function g(n){var e=[u(n,"lon"),u(n,"lat")],r=a(n,"ele");return r&&e.push(parseFloat(l(r))),e}function v(){return{type:"FeatureCollection",features:[]}}function h(n){return m.serializeToString(n)}var m,y=/\s*/g,w=/^\s*|\s*$/g,x=/\s+/;"undefined"!=typeof XMLSerializer?m=new XMLSerializer:"object"!=typeof r||"object"!=typeof t||t.browser||(m=new(n("xmldom").XMLSerializer));var E={kml:function(n,r){function t(n){return f(n.split(" "))}function u(n){for(var e=o(n,"coord","gx"),r=[],i=0;i<e.length;i++)r.push(t(l(e[i])));return r}function s(n){var e,r,t,i,f,c=[];if(a(n,"MultiGeometry"))return s(a(n,"MultiGeometry"));if(a(n,"MultiTrack"))return s(a(n,"MultiTrack"));for(t=0;t<y.length;t++)if(r=o(n,y[t]))for(i=0;i<r.length;i++)if(e=r[i],"Point"==y[t])c.push({type:"Point",coordinates:p(l(a(e,"coordinates")))});else if("LineString"==y[t])c.push({type:"LineString",coordinates:d(l(a(e,"coordinates")))});else if("Polygon"==y[t]){var g=o(e,"LinearRing"),v=[];for(f=0;f<g.length;f++)v.push(d(l(a(g[f],"coordinates"))));c.push({type:"Polygon",coordinates:v})}else"Track"==y[t]&&c.push({type:"LineString",coordinates:u(e)});return c}function c(n){var e,r=s(n),t={},i=l(a(n,"name")),u=l(a(n,"styleUrl")),f=l(a(n,"description")),c=a(n,"TimeSpan"),p=a(n,"ExtendedData");if(!r.length)return[];if(i&&(t.name=i),u&&m[u]&&(t.styleUrl=u,t.styleHash=m[u]),f&&(t.description=f),c){var d=l(a(c,"begin")),g=l(a(c,"end"));t.timespan={begin:d,end:g}}if(p){var v=o(p,"Data"),h=o(p,"SimpleData");for(e=0;e<v.length;e++)t[v[e].getAttribute("name")]=l(a(v[e],"value"));for(e=0;e<h.length;e++)t[h[e].getAttribute("name")]=l(h[e])}return[{type:"Feature",geometry:1===r.length?r[0]:{type:"GeometryCollection",geometries:r},properties:t}]}r=r||{};for(var g=v(),m={},y=["Polygon","LineString","Point","Track"],w=o(n,"Placemark"),x=o(n,"Style"),E=0;E<x.length;E++)m["#"+i(x[E],"id")]=e(h(x[E])).toString(16);for(var L=0;L<w.length;L++)g.features=g.features.concat(c(w[L]));return g},gpx:function(n){function e(n,e){var r,i=o(n,e),u=[];for(r=0;r<i.length;r++)u.push(g(i[r]));return{type:"Feature",properties:t(n),geometry:{type:"LineString",coordinates:u}}}function r(n){var e=t(n);return e.sym=l(a(n,"sym")),{type:"Feature",properties:e,geometry:{type:"Point",coordinates:g(n)}}}function t(n){var e,r=["name","desc","author","copyright","link","time","keywords"],t={};for(e=0;e<r.length;e++)t[r[e]]=l(a(n,r[e]));return c(t)}var i,u=o(n,"trk"),s=o(n,"rte"),f=o(n,"wpt"),p=v();for(i=0;i<u.length;i++)p.features.push(e(u[i],"trkpt"));for(i=0;i<s.length;i++)p.features.push(e(s[i],"rtept"));for(i=0;i<f.length;i++)p.features.push(r(f[i]));return p}};return E}(),"undefined"!=typeof e&&(e.exports=toGeoJSON)}).call(this,n("FWaASH"))},{FWaASH:4,xmldom:3}],10:[function(r,t){!function(){function r(n,e){function r(e){var r,t=n.arcs[0>e?~e:e],o=t[0];return n.transform?(r=[0,0],t.forEach(function(n){r[0]+=n[0],r[1]+=n[1]})):r=t[t.length-1],0>e?[r,o]:[o,r]}function t(n,e){for(var r in n){var t=n[r];delete e[t.start],delete t.start,delete t.end,t.forEach(function(n){o[0>n?~n:n]=1}),a.push(t)}}var o={},i={},u={},a=[],s=-1;return e.forEach(function(r,t){var o,i=n.arcs[0>r?~r:r];i.length<3&&!i[1][0]&&!i[1][1]&&(o=e[++s],e[s]=r,e[t]=o)}),e.forEach(function(n){var e,t,o=r(n),a=o[0],s=o[1];if(e=u[a])if(delete u[e.end],e.push(n),e.end=s,t=i[s]){delete i[t.start];var f=t===e?e:e.concat(t);i[f.start=e.start]=u[f.end=t.end]=f}else i[e.start]=u[e.end]=e;else if(e=i[s])if(delete i[e.start],e.unshift(n),e.start=a,t=u[a]){delete u[t.end];var c=t===e?e:t.concat(e);i[c.start=t.start]=u[c.end=e.end]=c}else i[e.start]=u[e.end]=e;else e=[n],i[e.start=a]=u[e.end=s]=e}),t(u,i),t(i,u),e.forEach(function(n){o[0>n?~n:n]||a.push([n])}),a}function o(n,e,t){function o(n){var e=0>n?~n:n;(c[e]||(c[e]=[])).push({i:n,g:f})}function i(n){n.forEach(o)}function u(n){n.forEach(i)}function a(n){"GeometryCollection"===n.type?n.geometries.forEach(a):n.type in l&&(f=n,l[n.type](n.arcs))}var s=[];if(arguments.length>1){var f,c=[],l={LineString:i,MultiLineString:u,Polygon:u,MultiPolygon:function(n){n.forEach(u)}};a(e),c.forEach(arguments.length<3?function(n){s.push(n[0].i)}:function(n){t(n[0].g,n[n.length-1].g)&&s.push(n[0].i)})}else for(var p=0,d=n.arcs.length;d>p;++p)s.push(p);return{type:"MultiLineString",arcs:r(n,s)}}function i(e,t){function o(n){n.forEach(function(e){e.forEach(function(e){(u[e=0>e?~e:e]||(u[e]=[])).push(n)})}),a.push(n)}function i(n){return d(s(e,{type:"Polygon",arcs:[n]}).coordinates[0])>0}var u={},a=[],f=[];return t.forEach(function(n){"Polygon"===n.type?o(n.arcs):"MultiPolygon"===n.type&&n.arcs.forEach(o)}),a.forEach(function(n){if(!n._){var e=[],r=[n];for(n._=1,f.push(e);n=r.pop();)e.push(n),n.forEach(function(n){n.forEach(function(n){u[0>n?~n:n].forEach(function(n){n._||(n._=1,r.push(n))})})})}}),a.forEach(function(n){delete n._}),{type:"MultiPolygon",arcs:f.map(function(t){var o=[];if(t.forEach(function(n){n.forEach(function(n){n.forEach(function(n){u[0>n?~n:n].length<2&&o.push(n)})})}),o=r(e,o),(n=o.length)>1)for(var a,s=i(t[0][0]),f=0;n>f;++f)if(s===i(o[f])){a=o[0],o[0]=o[f],o[f]=a;break}return o})}}function u(n,e){return"GeometryCollection"===e.type?{type:"FeatureCollection",features:e.geometries.map(function(e){return a(n,e)})}:a(n,e)}function a(n,e){var r={type:"Feature",id:e.id,properties:e.properties||{},geometry:s(n,e)};return null==e.id&&delete r.id,r}function s(n,e){function r(n,e){e.length&&e.pop();for(var r,t=c[0>n?~n:n],o=0,i=t.length;i>o;++o)e.push(r=t[o].slice()),s(r,o);0>n&&f(e,i)}function t(n){return n=n.slice(),s(n,0),n}function o(n){for(var e=[],t=0,o=n.length;o>t;++t)r(n[t],e);return e.length<2&&e.push(e[0].slice()),e}function i(n){for(var e=o(n);e.length<4;)e.push(e[0].slice());return e}function u(n){return n.map(i)}function a(n){var e=n.type;return"GeometryCollection"===e?{type:e,geometries:n.geometries.map(a)}:e in l?{type:e,coordinates:l[e](n)}:null}var s=m(n.transform),c=n.arcs,l={Point:function(n){return t(n.coordinates)},MultiPoint:function(n){return n.coordinates.map(t)},LineString:function(n){return o(n.arcs)},MultiLineString:function(n){return n.arcs.map(o)},Polygon:function(n){return u(n.arcs)},MultiPolygon:function(n){return n.arcs.map(u)}};return a(e)}function f(n,e){for(var r,t=n.length,o=t-e;o<--t;)r=n[o],n[o++]=n[t],n[t]=r}function c(n,e){for(var r=0,t=n.length;t>r;){var o=r+t>>>1;n[o]<e?r=o+1:t=o}return r}function l(n){function e(n,e){n.forEach(function(n){0>n&&(n=~n);var r=o[n];r?r.push(e):o[n]=[e]})}function r(n,r){n.forEach(function(n){e(n,r)})}function t(n,e){"GeometryCollection"===n.type?n.geometries.forEach(function(n){t(n,e)}):n.type in u&&u[n.type](n.arcs,e)}var o={},i=n.map(function(){return[]}),u={LineString:e,MultiLineString:r,Polygon:r,MultiPolygon:function(n,e){n.forEach(function(n){r(n,e)})}};n.forEach(t);for(var a in o)for(var s=o[a],f=s.length,l=0;f>l;++l)for(var p=l+1;f>p;++p){var d,g=s[l],v=s[p];(d=i[g])[a=c(d,v)]!==v&&d.splice(a,0,v),(d=i[v])[a=c(d,g)]!==g&&d.splice(a,0,g)}return i}function p(n,e){function r(n){u.remove(n),n[1][2]=e(n),u.push(n)}var t,o=m(n.transform),i=y(n.transform),u=h(),a=0;for(e||(e=g),n.arcs.forEach(function(n){var r=[];n.forEach(o);for(var i=1,a=n.length-1;a>i;++i)t=n.slice(i-1,i+2),t[1][2]=e(t),r.push(t),u.push(t);n[0][2]=n[a][2]=1/0;for(var i=0,a=r.length;a>i;++i)t=r[i],t.previous=r[i-1],t.next=r[i+1]});t=u.pop();){var s=t.previous,f=t.next;t[1][2]<a?t[1][2]=a:a=t[1][2],s&&(s.next=f,s[2]=t[2],r(s)),f&&(f.previous=s,f[0]=t[0],r(f))}return n.arcs.forEach(function(n){n.forEach(i)}),n}function d(n){for(var e,r=-1,t=n.length,o=n[t-1],i=0;++r<t;)e=o,o=n[r],i+=e[0]*o[1]-e[1]*o[0];return.5*i}function g(n){var e=n[0],r=n[1],t=n[2];return Math.abs((e[0]-t[0])*(r[1]-e[1])-(e[0]-r[0])*(t[1]-e[1]))}function v(n,e){return n[1][2]-e[1][2]}function h(){function n(n,e){for(;e>0;){var r=(e+1>>1)-1,o=t[r];if(v(n,o)>=0)break;t[o._=e]=o,t[n._=e=r]=n}}function e(n,e){for(;;){var r=e+1<<1,i=r-1,u=e,a=t[u];if(o>i&&v(t[i],a)<0&&(a=t[u=i]),o>r&&v(t[r],a)<0&&(a=t[u=r]),u===e)break;t[a._=e]=a,t[n._=e=u]=n}}var r={},t=[],o=0;return r.push=function(e){return n(t[e._=o]=e,o++),o},r.pop=function(){if(!(0>=o)){var n,r=t[0];return--o>0&&(n=t[o],e(t[n._=0]=n,0)),r}},r.remove=function(r){var i,u=r._;if(t[u]===r)return u!==--o&&(i=t[o],(v(i,r)<0?n:e)(t[i._=u]=i,u)),u},r}function m(n){if(!n)return w;var e,r,t=n.scale[0],o=n.scale[1],i=n.translate[0],u=n.translate[1];return function(n,a){a||(e=r=0),n[0]=(e+=n[0])*t+i,n[1]=(r+=n[1])*o+u}}function y(n){if(!n)return w;var e,r,t=n.scale[0],o=n.scale[1],i=n.translate[0],u=n.translate[1];return function(n,a){a||(e=r=0);var s=(n[0]-i)/t|0,f=(n[1]-u)/o|0;n[0]=s-e,n[1]=f-r,e=s,r=f}}function w(){}var x={version:"1.6.8",mesh:function(n){return s(n,o.apply(this,arguments))},meshArcs:o,merge:function(n){return s(n,i.apply(this,arguments))},mergeArcs:i,feature:u,neighbors:l,presimplify:p};"function"==typeof e&&e.amd?e(x):"object"==typeof t&&t.exports?t.exports=x:this.topojson=x}()},{}],11:[function(n,e){function r(n){function e(e){var r=n.substring(h).match(e);return r?(h+=r[0].length,r[0]):null}function r(n){return n&&v.match(/\d+/)&&(n.crs={type:"name",properties:{name:"urn:ogc:def:crs:EPSG::"+v}}),n}function t(){e(/^\s*/)}function o(){t();for(var n,r=0,o=[],i=[o],u=o;n=e(/^(\()/)||e(/^(\))/)||e(/^(\,)/)||e(/^[-+]?([0-9]*\.[0-9]+|[0-9]+)/);){if("("==n)i.push(u),u=[],i[i.length-1].push(u),r++;else if(")"==n){if(u=i.pop(),!u)return;if(r--,0===r)break}else if(","===n)u=[],i[i.length-1].push(u);else{if(isNaN(parseFloat(n)))return null;u.push(parseFloat(n))}t()}return 0!==r?null:o}function i(){for(var n,r,o=[];r=e(/^[-+]?([0-9]*\.[0-9]+|[0-9]+)/)||e(/^(\,)/);)","==r?(o.push(n),n=[]):(n||(n=[]),n.push(parseFloat(r))),t();return n&&o.push(n),o.length?o:null}function u(){if(!e(/^(point)/i))return null;if(t(),!e(/^(\()/))return null;var n=i();return n?(t(),e(/^(\))/)?{type:"Point",coordinates:n[0]}:null):null}function a(){if(!e(/^(multipoint)/i))return null;t();var n=o();return n?(t(),{type:"MultiPoint",coordinates:n}):null}function s(){if(!e(/^(multilinestring)/i))return null;t();var n=o();return n?(t(),{type:"MultiLineString",coordinates:n}):null}function f(){if(!e(/^(linestring)/i))return null;if(t(),!e(/^(\()/))return null;var n=i();return n?e(/^(\))/)?{type:"LineString",coordinates:n}:null:null}function c(){return e(/^(polygon)/i)?(t(),{type:"Polygon",coordinates:o()}):null}function l(){return e(/^(multipolygon)/i)?(t(),{type:"MultiPolygon",coordinates:o()}):null}function p(){var n,r=[];if(!e(/^(geometrycollection)/i))return null;if(t(),!e(/^(\()/))return null;for(;n=d();)r.push(n),t(),e(/^(\,)/),t();return e(/^(\))/)?{type:"GeometryCollection",geometries:r}:null}function d(){return u()||f()||c()||a()||s()||l()||p()}var g=n.split(";"),n=g.pop(),v=(g.shift()||"").split("=").pop(),h=0;return r(d())}function t(n){function e(n){return 2===n.length?n[0]+" "+n[1]:3===n.length?n[0]+" "+n[1]+" "+n[2]:void 0}function r(n){return n.map(e).join(", ")}function o(n){return n.map(r).map(u).join(", ")}function i(n){return n.map(o).map(u).join(", ")}function u(n){return"("+n+")"}switch("Feature"===n.type&&(n=n.geometry),n.type){case"Point":return"POINT ("+e(n.coordinates)+")";case"LineString":return"LINESTRING ("+r(n.coordinates)+")";case"Polygon":return"POLYGON ("+o(n.coordinates)+")";case"MultiPoint":return"MULTIPOINT ("+r(n.coordinates)+")";case"MultiPolygon":return"MULTIPOLYGON ("+i(n.coordinates)+")";case"MultiLineString":return"MULTILINESTRING ("+o(n.coordinates)+")";case"GeometryCollection":return"GEOMETRYCOLLECTION ("+n.geometries.map(t).join(", ")+")";default:throw new Error("stringify requires a valid GeoJSON Feature or geometry object as input")}}e.exports=r,e.exports.parse=r,e.exports.stringify=t},{}]},{},[1])(1)});
