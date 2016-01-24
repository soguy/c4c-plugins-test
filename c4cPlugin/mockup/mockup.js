(function() {
               
    var csrf, folder,
        autoload = true,
        urlPrefix = '/sap/fiori/mockservice/mockup/version/',
        version = '03032015';           
    
    function base64() {

        "use strict";

        var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

        /**
         * _utf8_encode
         * @param string
         * @returns {string}
         * @private
         */
        var _utf8_encode = function (string) {

            var utftext = "", c, n;

            string = string.replace(/\r\n/g, "\n");

            for (n = 0; n < string.length; n++) {

                c = string.charCodeAt(n);

                if (c < 128) {

                    utftext += String.fromCharCode(c);

                } else if ((c > 127) && (c < 2048)) {

                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);

                } else {

                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);

                }

            }

            return utftext;
        };

        /**
         * _utf8_decode
         * @param utftext
         * @returns {string}
         * @private
         */
        var _utf8_decode = function _utf8_decode(utftext) {
            var string = "", i = 0, c = 0, c1 = 0, c2 = 0;

            while (i < utftext.length) {

                c = utftext.charCodeAt(i);

                if (c < 128) {

                    string += String.fromCharCode(c);
                    i++;

                } else if ((c > 191) && (c < 224)) {

                    c1 = utftext.charCodeAt(i + 1);
                    string += String.fromCharCode(((c & 31) << 6) | (c1 & 63));
                    i += 2;

                } else {

                    c1 = utftext.charCodeAt(i + 1);
                    c2 = utftext.charCodeAt(i + 2);
                    string += String.fromCharCode(((c & 15) << 12) | ((c1 & 63) << 6) | (c2 & 63));
                    i += 3;

                }

            }

            return string;
        };

        /**
         * _hexEncode
         * @param input
         * @returns {string}
         * @private
         */
        var _hexEncode = function _hexEncode(input) {
            var output = '', i;

            for (i = 0; i < input.length; i++) {
                output += input.charCodeAt(i).toString(16);
            }

            return output;
        };

        /**
         * _hexDecode
         * @param input
         * @returns {string}
         * @private
         */
        var _hexDecode = function _hexDecode(input) {
            var output = '', i;

            if (input.length % 2 > 0) {
                input = '0' + input;
            }

            for (i = 0; i < input.length; i = i + 2) {
                output += String.fromCharCode(parseInt(input.charAt(i) + input.charAt(i + 1), 16));
            }

            return output;
        };

        /**
         * encode
         * @param input
         * @returns {string}
         */
        var encode = function encode(input) {
            var output = "", chr1, chr2, chr3, enc1, enc2, enc3, enc4, i = 0;

            input = _utf8_encode(input);

            while (i < input.length) {

                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);

                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }

                output += _keyStr.charAt(enc1);
                output += _keyStr.charAt(enc2);
                output += _keyStr.charAt(enc3);
                output += _keyStr.charAt(enc4);

            }

            return output;
        };

        /**
         * decode
         * @param input
         * @returns {string}
         */
        var decode = function decode(input) {
            var output = "", chr1, chr2, chr3, enc1, enc2, enc3, enc4, i = 0;

            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            while (i < input.length) {

                enc1 = _keyStr.indexOf(input.charAt(i++));
                enc2 = _keyStr.indexOf(input.charAt(i++));
                enc3 = _keyStr.indexOf(input.charAt(i++));
                enc4 = _keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output += String.fromCharCode(chr1);

                if (enc3 !== 64) {
                    output += String.fromCharCode(chr2);
                }
                if (enc4 !== 64) {
                    output += String.fromCharCode(chr3);
                }

            }

            return _utf8_decode(output);
        };

        /**
         * decodeToHex
         * @param input
         * @returns {string}
         */
        var decodeToHex = function decodeToHex(input) {
            return _hexEncode(decode(input));
        };

        /**
         * encodeFromHex
         * @param input
         * @returns {string}
         */
        var encodeFromHex = function encodeFromHex(input) {
            return encode(_hexDecode(input));
        };

        return {
            'encode': encode,
            'decode': decode,
            'decodeToHex': decodeToHex,
            'encodeFromHex': encodeFromHex
        };
    }
    
    function download(data) {

        function multipleClick(element) {
            var evt = element.ownerDocument.createEvent('MouseEvents');
            evt.initMouseEvent('click', true, true,
                element.ownerDocument.defaultView, 1, 0, 0, 0, 0, false,
                false, false, false, 1, null);
            element.dispatchEvent(evt);
        }
        
        if (data.autoload) {
        
            if (Blob) {
                
                var url = window.URL.createObjectURL(
                    new Blob([data.content], {type: data.type})
                );
                
            } else {
                
                /**
                 * Define url
                 * @type {string}
                 */
                var url = [
                    'data:',
                    data.type,
                    ';charset=utf-8;base64,',
                    (base64()).encode(data.content)
                ].join('');
            }

            var a = $('<a />').attr({
                href: url,
                download: data.fileName || 'file.txt',
                title: data.title || 'Download'
            }).text(data.title || 'Download');

            //a[0].click();
            try {
                if (url.length < 500000) {
                    multipleClick(a[0]);
                } else {
                    console.log('Unable to download file', url.length);
                }
            } catch(e) {
                console.log('Stringify error', e);
            }
            
        } 
    }
    
    function xmlToString(data) { 
        
        var type, serialized;
        
        try {
            
            var xmlData = $(data)[1];
            serialized = window.ActiveXObject ?
                xmlData.xml :
                (new XMLSerializer()).serializeToString(xmlData);
            type = 'text/xml';
            
        } catch(e) {
            
            try {
                
                type = 'text/json';
                serialized = JSON.stringify(JSON.parse(data));
                                                
            } catch(e) {
                
                return false;
            }
        }
        
        return {
            type: type,
            serialized: serialized
        }
        
    }   
    
    function encodeFileUrl(url) {
        
        if (url.pathname.match(/metadata/)) {
            return 'metadata.xml';
        }
        
        return (url.pathname.replace(/\$/g, '_').replace(/\//, '').replace(/\//g, '-').
            replace(/\('/, '').replace(/'\)/, '').replace(/\(/g, '_').replace(/\)/g, '_').
            replace(/\,/g, '_') + '-' + 
            url.search.replace(/\?/, '').replace(/%20/g, "_").replace(/%27/g, "_").
            replace(/%3D/g, '_').replace(/%26/g, '_').
            replace(/\$/g, '_').replace(/\=/g, '_').replace(/\&/g, '').replace(/__\d+/, '').
            replace(/\(/g, '_').replace(/\)/g, '_').replace(/\,/g, '_'));
    }

    var protos = window.XMLHttpRequest.prototype;
    var orig = window.XMLHttpRequest;
    
    // Check application mode (collect or mockup if empty mode)
    var mock = window.location.search;
    
    if (mock.match(/mode=collect/)) {
        
        window.XMLHttpRequest = function(url) {
            var xhr = new orig(url);
            Object.defineProperty(xhr, "onreadystatechange", {
                set: function (fn) {
                    var that = this;
                    this.addEventListener('readystatechange', function (evt) {
                        if(evt.target.readyState === 4 && evt.target.status === 200) {
                            
                            var response = xmlToString(evt.target.responseText),
                                url = new URL(evt.target.responseURL);
                            
                            if (response) {
                                download({
                                    //type: response.type, 
                                    fileName: encodeFileUrl(url),
                                    content: response.serialized,
                                    title: 'Download XML',
                                    autoload: autoload
                                });    
                            }
                        }
                        fn.apply(that, arguments);
                    });
                }
            });
            return xhr;
        };
    }
    
    if (mock.match(/mode=mock/)) {
        for (var index in protos) {
            
            if (protos[index] instanceof Function) {
                var proxied = window.XMLHttpRequest.prototype[index];
                (function(proxied, index){
                    window.XMLHttpRequest.prototype[index] = function() {
                        
                        // Copy arguments
                        var args = [].slice.call(arguments);
                        
                        if (index === 'open') {
                            
                            var js = args[1].match(/.js/),
                                props = args[1].match(/.properties/),
                                view = args[1].match(/\/view\//),
                                createCallback = args[1].match(/createSuccessed%3Dtrue/);
                            
                            if (!(js || props || view || createCallback) && args[0] === 'GET') {
                                
                                var url = encodeFileUrl(
                                    new URL(window.location.origin + args[1])
                                );
                                
                                args[1] = urlPrefix + version + '/' + url;
                            } 
                            
                            if (args[0] === 'POST') {
                                this.abort();
                                return false;
                            }
                        }
                        
                        return proxied.apply(this, args);
                    };
                }(proxied, index));
            }
        }
    }
})();