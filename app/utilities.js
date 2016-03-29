module.exports = {

	// pulled from http://phpjs.org/
	htmlspecialchars_decode: function(string, quote_style) {
	  //       discuss at: http://phpjs.org/functions/htmlspecialchars_decode/
	  //      original by: Mirek Slugen
	  //      improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	  //      bugfixed by: Mateusz "loonquawl" Zalega
	  //      bugfixed by: Onno Marsman
	  //      bugfixed by: Brett Zamir (http://brett-zamir.me)
	  //      bugfixed by: Brett Zamir (http://brett-zamir.me)
	  //         input by: ReverseSyntax
	  //         input by: Slawomir Kaniecki
	  //         input by: Scott Cariss
	  //         input by: Francois
	  //         input by: Ratheous
	  //         input by: Mailfaker (http://www.weedem.fr/)
	  //       revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	  // reimplemented by: Brett Zamir (http://brett-zamir.me)
	  //        example 1: htmlspecialchars_decode("<p>this -&gt; &quot;</p>", 'ENT_NOQUOTES');
	  //        returns 1: '<p>this -> &quot;</p>'
	  //        example 2: htmlspecialchars_decode("&amp;quot;");
	  //        returns 2: '&quot;'

	  var optTemp = 0,
	    i = 0,
	    noquotes = false;
	  if (typeof quote_style === 'undefined') {
	    quote_style = 2;
	  }
	  string = string.toString()
	    .replace(/&lt;/g, '<')
	    .replace(/&gt;/g, '>');
	  var OPTS = {
	    'ENT_NOQUOTES': 0,
	    'ENT_HTML_QUOTE_SINGLE': 1,
	    'ENT_HTML_QUOTE_DOUBLE': 2,
	    'ENT_COMPAT': 2,
	    'ENT_QUOTES': 3,
	    'ENT_IGNORE': 4
	  };
	  if (quote_style === 0) {
	    noquotes = true;
	  }
	  if (typeof quote_style !== 'number') { // Allow for a single string or an array of string flags
	    quote_style = [].concat(quote_style);
	    for (i = 0; i < quote_style.length; i++) {
	      // Resolve string input to bitwise e.g. 'PATHINFO_EXTENSION' becomes 4
	      if (OPTS[quote_style[i]] === 0) {
	        noquotes = true;
	      } else if (OPTS[quote_style[i]]) {
	        optTemp = optTemp | OPTS[quote_style[i]];
	      }
	    }
	    quote_style = optTemp;
	  }
	  if (quote_style & OPTS.ENT_HTML_QUOTE_SINGLE) {
	    string = string.replace(/&#0*39;/g, "'"); // PHP doesn't currently escape if more than one 0, but it should
	    // string = string.replace(/&apos;|&#x0*27;/g, "'"); // This would also be useful here, but not a part of PHP
	  }
	  if (!noquotes) {
	    string = string.replace(/&quot;/g, '"');
	  }
	  // Put this in last place to avoid escape being double-decoded
	  string = string.replace(/&amp;/g, '&');

	  return string;
	},

	htmlspecialchars: function(string, quote_style, charset, double_encode) {
	  //       discuss at: http://phpjs.org/functions/htmlspecialchars/
	  //      original by: Mirek Slugen
	  //      improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	  //      bugfixed by: Nathan
	  //      bugfixed by: Arno
	  //      bugfixed by: Brett Zamir (http://brett-zamir.me)
	  //      bugfixed by: Brett Zamir (http://brett-zamir.me)
	  //       revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	  //         input by: Ratheous
	  //         input by: Mailfaker (http://www.weedem.fr/)
	  //         input by: felix
	  // reimplemented by: Brett Zamir (http://brett-zamir.me)
	  //             note: charset argument not supported
	  //        example 1: htmlspecialchars("<a href='test'>Test</a>", 'ENT_QUOTES');
	  //        returns 1: '&lt;a href=&#039;test&#039;&gt;Test&lt;/a&gt;'
	  //        example 2: htmlspecialchars("ab\"c'd", ['ENT_NOQUOTES', 'ENT_QUOTES']);
	  //        returns 2: 'ab"c&#039;d'
	  //        example 3: htmlspecialchars('my "&entity;" is still here', null, null, false);
	  //        returns 3: 'my &quot;&entity;&quot; is still here'

	  var optTemp = 0,
	    i = 0,
	    noquotes = false;
	  if (typeof quote_style === 'undefined' || quote_style === null) {
	    quote_style = 2;
	  }
	  string = string.toString();
	  if (double_encode !== false) { // Put this first to avoid double-encoding
	    string = string.replace(/&/g, '&amp;');
	  }
	  string = string.replace(/</g, '&lt;')
	    .replace(/>/g, '&gt;');

	  var OPTS = {
	    'ENT_NOQUOTES': 0,
	    'ENT_HTML_QUOTE_SINGLE': 1,
	    'ENT_HTML_QUOTE_DOUBLE': 2,
	    'ENT_COMPAT': 2,
	    'ENT_QUOTES': 3,
	    'ENT_IGNORE': 4
	  };
	  if (quote_style === 0) {
	    noquotes = true;
	  }
	  if (typeof quote_style !== 'number') { // Allow for a single string or an array of string flags
	    quote_style = [].concat(quote_style);
	    for (i = 0; i < quote_style.length; i++) {
	      // Resolve string input to bitwise e.g. 'ENT_IGNORE' becomes 4
	      if (OPTS[quote_style[i]] === 0) {
	        noquotes = true;
	      } else if (OPTS[quote_style[i]]) {
	        optTemp = optTemp | OPTS[quote_style[i]];
	      }
	    }
	    quote_style = optTemp;
	  }
	  if (quote_style & OPTS.ENT_HTML_QUOTE_SINGLE) {
	    string = string.replace(/'/g, '&#039;');
	  }
	  if (!noquotes) {
	    string = string.replace(/"/g, '&quot;');
	  }

	  return string;
	},

	// Takes a date String and returns the formatted Date
	formatDate: function(string) {
		var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
		var d = new Date(string);
		return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
	},

	// encode a Name for use as a URL
	url_encode: function(text) {
	  return text.toLowerCase().replace(/\s+/g, ' ').replace(/^\s|\s$/g, '').replace(/\ /g, '-').replace(/[\[\]\^\$\.\|\?\*\+\(\)\\~`\!@#%&_+={}\'\"<>:;,]{1,}/g, '');
	},

	// encode text for storage in SQL Database
	sql_text_encode: function(text) {
	  return this.htmlspecialchars(text.replace(/\'/, "''").replace(/\;/, ''));
	}
};
