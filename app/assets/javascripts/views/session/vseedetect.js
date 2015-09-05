/*
 *
 * We use SwfStore (Javascript-Flash-Cookies : https://github.com/nfriedly/Javascript-Flash-Cookies) for flash stuff and
 * ua-parser-js (https://github.com/faisalman/ua-parser-js) for user agent parsing, browser and os detection.
 *
 * The copyrights & minified versions are included below to reduce dependencies.
 *
 */

/**
 * SwfStore - a JavaScript library for cross-domain flash cookies
 *
 * http://github.com/nfriedly/Javascript-Flash-Cookies
 *
 * Copyright (c) 2010 by Nathan Friedly - http://nfriedly.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

(function(){"use strict";function d(a){if("function"===typeof a)throw"SwfStore Error: Functions cannot be used as keys or values.";}var g=0,j=/[^a-z0-9_]/ig;window.SwfStore=function(a){function e(b){var c=document.createElement("div");document.body.appendChild(c);c.id="SwfStore_"+a.namespace+"_"+g++;b||(c.style.position="absolute",c.style.top="-2000px",c.style.left="-2000px");return c}a=a||{};var f={swf_url:"storage.swf",namespace:"swfstore",path:null,debug:!1,timeout:10,onready:null,onerror:null},b;for(b in f)f.hasOwnProperty(b)&&(a.hasOwnProperty(b)||(a[b]=f[b]));a.namespace=a.namespace.replace(j,"_");if(window.SwfStore[a.namespace])throw"There is already an instance of SwfStore using the '"+a.namespace+"' namespace. Use that instance or specify an alternate namespace in the config.";this.config=a;if(a.debug){if("undefined"===typeof console){var d=e(!0);window.console={log:function(a){var c=e(!0);c.innerHTML=a;d.appendChild(c)}}}this.log=function(b,c,d){c="swfStore"===c?"swf":c;if("undefined"!==typeof console[b])console[b]("SwfStore - "+a.namespace+" ("+c+"): "+d);else console.log("SwfStore - "+a.namespace+": "+b+" ("+c+"): "+d)}}else this.log=function(){};this.log("info","js","Initializing...");SwfStore[a.namespace]=this;f=e(a.debug);b="SwfStore_"+a.namespace+"_"+g++;var h="logfn=SwfStore."+a.namespace+".log&amp;onload=SwfStore."+a.namespace+".onload&amp;onerror=SwfStore."+a.namespace+".onerror&amp;"+(a.path?"LSOPath="+a.path+"&amp;":"")+"LSOName="+a.namespace;f.innerHTML='<object height="100" width="500" codebase="https://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab" id="'+b + '" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000">\t<param value="'+a.swf_url+'" name="movie">\t<param value="'+h+'" name="FlashVars">\t<param value="always" name="allowScriptAccess">\t<embed height="375" align="middle" width="500" pluginspage="https://www.macromedia.com/go/getflashplayer" flashvars="'+h+'" type="application/x-shockwave-flash" allowscriptaccess="always" quality="high" loop="false" play="true" name="'+b+'" bgcolor="#ffffff" src="'+a.swf_url+'"></object>';this.swf=document[b]||window[b];this._timeout=setTimeout(function(){SwfStore[a.namespace].log("error","js","Timeout reached, assuming "+a.swf_url+" failed to load and firing the onerror callback.");if(a.onerror)a.onerror()},1E3*a.timeout)};SwfStore.prototype={version:"1.7",ready:!1,refresh:function(){this._checkReady();this.log("debug","js","Refreshing");this.swf.refresh()},set:function(a,e){this._checkReady();d(a);d(e);this.swf.set(a,e)},get:function(a){this._checkReady();d(a);return this.swf.get(a)},getAll:function(){this._checkReady();var a=this.swf.getAll();a.__flashBugFix&&delete a.__flashBugFix;return a},clear:function(a){this._checkReady();d(a);this.swf.clear(a)},_checkReady:function(){if(!this.ready)throw"SwfStore is not yet finished initializing. Pass a config.onready callback or wait until this.ready is true before trying to use a SwfStore instance.";},onload:function(){var a=this;setTimeout(function(){clearTimeout(a._timeout);a.ready=!0;a.set("__flashBugFix","1");if(a.config.onready)a.config.onready()},0)},onerror:function(){clearTimeout(this._timeout);if (this.config.onerror)this.config.onerror()}}})();

// UAParser.js v0.6.2
// Lightweight JavaScript-based User-Agent string parser
// https://github.com/faisalman/ua-parser-js
//
// Copyright © 2012-2013 Faisalman <fyzlman@gmail.com>
// Dual licensed under GPLv2 & MIT

!function(window,undefined){"use strict";var EMPTY="",UNKNOWN="?",FUNC_TYPE="function",UNDEF_TYPE="undefined",OBJ_TYPE="object",MAJOR="major",MODEL="model",NAME="name",TYPE="type",VENDOR="vendor",VERSION="version",ARCHITECTURE="architecture",CONSOLE="console",MOBILE="mobile",TABLET="tablet";var util={has:function(str1,str2){return str2.toLowerCase().indexOf(str1.toLowerCase())!==-1},lowerize:function(str){return str.toLowerCase()}};var mapper={rgx:function(){for(var result,i=0,j,k,p,q,matches,match,args=arguments;i<args.length;i+=2){var regex=args[i],props=args[i+1];if(typeof result===UNDEF_TYPE){result={};for(p in props){q=props[p];if(typeof q===OBJ_TYPE){result[q[0]]=undefined}else{result[q]=undefined}}}for(j=k=0;j<regex.length;j++){matches=regex[j].exec(this.getUA());if(!!matches){for(p in props){match=matches[++k];q=props[p];if(typeof q===OBJ_TYPE&&q.length>0){if(q.length==2){if(typeof q[1]==FUNC_TYPE){result[q[0]]=q[1].call(this,match)}else{result[q[0]]=q[1]}}else if(q.length==3){if(typeof q[1]===FUNC_TYPE&&!(q[1].exec&&q[1].test)){result[q[0]]=match?q[1].call(this,match,q[2]):undefined}else{result[q[0]]=match?match.replace(q[1],q[2]):undefined}}else if(q.length==4){result[q[0]]=match?q[3].call(this,match.replace(q[1],q[2])):undefined}}else{result[q]=match?match:undefined}}break}}if(!!matches)break}return result},str:function(str,map){for(var i in map){if(typeof map[i]===OBJ_TYPE&&map[i].length>0){for(var j=0;j<map[i].length;j++){if(util.has(map[i][j],str)){return i===UNKNOWN?undefined:i}}}else if(util.has(map[i],str)){return i===UNKNOWN?undefined:i}}return str}};var maps={browser:{oldsafari:{major:{1:["/8","/1","/3"],2:"/4","?":"/"},version:{"1.0":"/8",1.2:"/1",1.3:"/3","2.0":"/412","2.0.2":"/416","2.0.3":"/417","2.0.4":"/419","?":"/"}}},device:{sprint:{model:{"Evo Shift 4G":"7373KT"},vendor:{HTC:"APA",Sprint:"Sprint"}}},os:{windows:{version:{ME:"4.90","NT 3.11":"NT3.51","NT 4.0":"NT4.0",2000:"NT 5.0",XP:["NT 5.1","NT 5.2"],Vista:"NT 6.0",7:"NT 6.1",8:"NT 6.2",RT:"ARM"}}}};var regexes={browser:[[/(opera\smini)\/((\d+)?[\w\.-]+)/i,/(opera\s[mobiletab]+).+version\/((\d+)?[\w\.-]+)/i,/(opera).+version\/((\d+)?[\w\.]+)/i,/(opera)[\/\s]+((\d+)?[\w\.]+)/i],[NAME,VERSION,MAJOR],[/\s(opr)\/((\d+)?[\w\.]+)/i],[[NAME,"Opera"],VERSION,MAJOR],[/(kindle)\/((\d+)?[\w\.]+)/i,/(lunascape|maxthon|netfront|jasmine|blazer)[\/\s]?((\d+)?[\w\.]+)*/i,/(avant\s|iemobile|slim|baidu)(?:browser)?[\/\s]?((\d+)?[\w\.]*)/i,/(?:ms|\()(ie)\s((\d+)?[\w\.]+)/i,/(rekonq)((?:\/)[\w\.]+)*/i,/(chromium|flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron)\/((\d+)?[\w\.-]+)/i],[NAME,VERSION,MAJOR],[/(trident).+rv[:\s]((\d+)?[\w\.]+).+like\sgecko/i],[[NAME,"IE"],VERSION,MAJOR],[/(yabrowser)\/((\d+)?[\w\.]+)/i],[[NAME,"Yandex"],VERSION,MAJOR],[/(comodo_dragon)\/((\d+)?[\w\.]+)/i],[[NAME,/_/g," "],VERSION,MAJOR],[/(chrome|omniweb|arora|[tizenoka]{5}\s?browser)\/v?((\d+)?[\w\.]+)/i],[NAME,VERSION,MAJOR],[/(dolfin)\/((\d+)?[\w\.]+)/i],[[NAME,"Dolphin"],VERSION,MAJOR],[/((?:android.+)crmo|crios)\/((\d+)?[\w\.]+)/i],[[NAME,"Chrome"],VERSION,MAJOR],[/version\/((\d+)?[\w\.]+).+?mobile\/\w+\s(safari)/i],[VERSION,MAJOR,[NAME,"Mobile Safari"]],[/version\/((\d+)?[\w\.]+).+?(mobile\s?safari|safari)/i],[VERSION,MAJOR,NAME],[/webkit.+?(mobile\s?safari|safari)((\/[\w\.]+))/i],[NAME,[MAJOR,mapper.str,maps.browser.oldsafari.major],[VERSION,mapper.str,maps.browser.oldsafari.version]],[/(konqueror)\/((\d+)?[\w\.]+)/i,/(webkit|khtml)\/((\d+)?[\w\.]+)/i],[NAME,VERSION,MAJOR],[/(navigator|netscape)\/((\d+)?[\w\.-]+)/i],[[NAME,"Netscape"],VERSION,MAJOR],[/(swiftfox)/i,/(icedragon|iceweasel|camino|chimera|fennec|maemo\sbrowser|minimo|conkeror)[\/\s]?((\d+)?[\w\.\+]+)/i,/(firefox|seamonkey|k-meleon|icecat|iceape|firebird|phoenix)\/((\d+)?[\w\.-]+)/i,/(mozilla)\/((\d+)?[\w\.]+).+rv\:.+gecko\/\d+/i,/(uc\s?browser|polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|qqbrowser)[\/\s]?((\d+)?[\w\.]+)/i,/(links)\s\(((\d+)?[\w\.]+)/i,/(gobrowser)\/?((\d+)?[\w\.]+)*/i,/(ice\s?browser)\/v?((\d+)?[\w\._]+)/i,/(mosaic)[\/\s]((\d+)?[\w\.]+)/i],[NAME,VERSION,MAJOR]],cpu:[[/(?:(amd|x(?:(?:86|64)[_-])?|wow|win)64)[;\)]/i],[[ARCHITECTURE,"amd64"]],[/((?:i[346]|x)86)[;\)]/i],[[ARCHITECTURE,"ia32"]],[/windows\s(ce|mobile);\sppc;/i],[[ARCHITECTURE,"arm"]],[/((?:ppc|powerpc)(?:64)?)(?:\smac|;|\))/i],[[ARCHITECTURE,/ower/,"",util.lowerize]],[/(sun4\w)[;\)]/i],[[ARCHITECTURE,"sparc"]],[/(ia64(?=;)|68k(?=\))|arm(?=v\d+;)|(?:irix|mips|sparc)(?:64)?(?=;)|pa-risc)/i],[ARCHITECTURE,util.lowerize]],device:[[/\((ipad|playbook);[\w\s\);-]+(rim|apple)/i],[MODEL,VENDOR,[TYPE,TABLET]],[/(hp).+(touchpad)/i,/(kindle)\/([\w\.]+)/i,/\s(nook)[\w\s]+build\/(\w+)/i,/(dell)\s(strea[kpr\s\d]*[\dko])/i],[VENDOR,MODEL,[TYPE,TABLET]],[/\((ip[honed]+);.+(apple)/i],[MODEL,VENDOR,[TYPE,MOBILE]],[/(blackberry)[\s-]?(\w+)/i,/(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|huawei|meizu|motorola)[\s_-]?([\w-]+)*/i,/(hp)\s([\w\s]+\w)/i,/(asus)-?(\w+)/i],[VENDOR,MODEL,[TYPE,MOBILE]],[/\((bb10);\s(\w+)/i],[[VENDOR,"BlackBerry"],MODEL,[TYPE,MOBILE]],[/android.+((transfo[prime\s]{4,10}\s\w+|eeepc|slider\s\w+))/i],[[VENDOR,"Asus"],MODEL,[TYPE,TABLET]],[/(sony)\s(tablet\s[ps])/i],[VENDOR,MODEL,[TYPE,TABLET]],[/(nintendo)\s([wids3u]+)/i],[VENDOR,MODEL,[TYPE,CONSOLE]],[/((playstation)\s[3portablevi]+)/i],[[VENDOR,"Sony"],MODEL,[TYPE,CONSOLE]],[/(sprint\s(\w+))/i],[[VENDOR,mapper.str,maps.device.sprint.vendor],[MODEL,mapper.str,maps.device.sprint.model],[TYPE,MOBILE]],[/(htc)[;_\s-]+([\w\s]+(?=\))|\w+)*/i,/(zte)-(\w+)*/i,/(alcatel|geeksphone|huawei|lenovo|nexian|panasonic|(?=;\s)sony)[_\s-]?([\w-]+)*/i],[VENDOR,[MODEL,/_/g," "],[TYPE,MOBILE]],[/\s((milestone|droid(?:[2-4x]|\s(?:bionic|x2|pro|razr))?(:?\s4g)?))[\w\s]+build\//i,/(mot)[\s-]?(\w+)*/i],[[VENDOR,"Motorola"],MODEL,[TYPE,MOBILE]],[/android.+\s((mz60\d|xoom[\s2]{0,2}))\sbuild\//i],[[VENDOR,"Motorola"],MODEL,[TYPE,TABLET]],[/android.+((sch-i[89]0\d|shw-m380s|gt-p\d{4}|gt-n8000|sgh-t8[56]9))/i],[[VENDOR,"Samsung"],MODEL,[TYPE,TABLET]],[/((s[cgp]h-\w+|gt-\w+|galaxy\snexus))/i,/(sam[sung]*)[\s-]*(\w+-?[\w-]*)*/i,/sec-((sgh\w+))/i],[[VENDOR,"Samsung"],MODEL,[TYPE,MOBILE]],[/(sie)-(\w+)*/i],[[VENDOR,"Siemens"],MODEL,[TYPE,MOBILE]],[/(maemo|nokia).*(n900|lumia\s\d+)/i,/(nokia)[\s_-]?([\w-]+)*/i],[[VENDOR,"Nokia"],MODEL,[TYPE,MOBILE]],[/android\s3\.[\s\w-;]{10}((a\d{3}))/i],[[VENDOR,"Acer"],MODEL,[TYPE,TABLET]],[/android\s3\.[\s\w-;]{10}(lg?)-([06cv9]{3,4})/i],[[VENDOR,"LG"],MODEL,[TYPE,TABLET]],[/((nexus\s4))/i,/(lg)[e;\s-\/]+(\w+)*/i],[[VENDOR,"LG"],MODEL,[TYPE,MOBILE]],[/(mobile|tablet);.+rv\:.+gecko\//i],[TYPE,VENDOR,MODEL]],engine:[[/(presto)\/([\w\.]+)/i,/(webkit|trident|netfront|netsurf|amaya|lynx|w3m)\/([\w\.]+)/i,/(khtml|tasman|links)[\/\s]\(?([\w\.]+)/i,/(icab)[\/\s]([23]\.[\d\.]+)/i],[NAME,VERSION],[/rv\:([\w\.]+).*(gecko)/i],[VERSION,NAME]],os:[[/(windows)\snt\s6\.2;\s(arm)/i,/(windows\sphone(?:\sos)*|windows\smobile|windows)[\s\/]?([ntce\d\.\s]+\w)/i],[NAME,[VERSION,mapper.str,maps.os.windows.version]],[/(win(?=3|9|n)|win\s9x\s)([nt\d\.]+)/i],[[NAME,"Windows"],[VERSION,mapper.str,maps.os.windows.version]],[/\((bb)(10);/i],[[NAME,"BlackBerry"],VERSION],[/(blackberry)\w*\/?([\w\.]+)*/i,/(tizen)\/([\w\.]+)/i,/(android|webos|palm\os|qnx|bada|rim\stablet\sos|meego)[\/\s-]?([\w\.]+)*/i],[NAME,VERSION],[/(symbian\s?os|symbos|s60(?=;))[\/\s-]?([\w\.]+)*/i],[[NAME,"Symbian"],VERSION],[/mozilla.+\(mobile;.+gecko.+firefox/i],[[NAME,"Firefox OS"],VERSION],[/(nintendo|playstation)\s([wids3portablevu]+)/i,/(mint)[\/\s\(]?(\w+)*/i,/(joli|[kxln]?ubuntu|debian|[open]*suse|gentoo|arch|slackware|fedora|mandriva|centos|pclinuxos|redhat|zenwalk)[\/\s-]?([\w\.-]+)*/i,/(hurd|linux)\s?([\w\.]+)*/i,/(gnu)\s?([\w\.]+)*/i],[NAME,VERSION],[/(cros)\s[\w]+\s([\w\.]+\w)/i],[[NAME,"Chromium OS"],VERSION],[/(sunos)\s?([\w\.]+\d)*/i],[[NAME,"Solaris"],VERSION],[/\s([frentopc-]{0,4}bsd|dragonfly)\s?([\w\.]+)*/i],[NAME,VERSION],[/(ip[honead]+)(?:.*os\s*([\w]+)*\slike\smac|;\sopera)/i],[[NAME,"iOS"],[VERSION,/_/g,"."]],[/(mac\sos\sx)\s?([\w\s\.]+\w)*/i],[NAME,[VERSION,/_/g,"."]],[/(haiku)\s(\w+)/i,/(aix)\s((\d)(?=\.|\)|\s)[\w\.]*)*/i,/(macintosh|mac(?=_powerpc)|plan\s9|minix|beos|os\/2|amigaos|morphos|risc\sos)/i,/(unix)\s?([\w\.]+)*/i],[NAME,VERSION]]};var UAParser=function(uastring){var ua=uastring||(window&&window.navigator&&window.navigator.userAgent?window.navigator.userAgent:EMPTY);if(!(this instanceof UAParser)){return new UAParser(uastring).getResult()}this.getBrowser=function(){return mapper.rgx.apply(this,regexes.browser)};this.getCPU=function(){return mapper.rgx.apply(this,regexes.cpu)};this.getDevice=function(){return mapper.rgx.apply(this,regexes.device)};this.getEngine=function(){return mapper.rgx.apply(this,regexes.engine)};this.getOS=function(){return mapper.rgx.apply(this,regexes.os)};this.getResult=function(){return{ua:this.getUA(),browser:this.getBrowser(),engine:this.getEngine(),os:this.getOS(),device:this.getDevice(),cpu:this.getCPU()}};this.getUA=function(){return ua};this.setUA=function(uastring){ua=uastring;return this};this.setUA(ua)};if(typeof exports!==UNDEF_TYPE){if(typeof module!==UNDEF_TYPE&&module.exports){exports=module.exports=UAParser}exports.UAParser=UAParser}else{window.UAParser=UAParser;if(typeof define===FUNC_TYPE&&define.amd){define(function(){return UAParser})}if(typeof window.jQuery!==UNDEF_TYPE){var $=window.jQuery;var parser=new UAParser;$.ua=parser.getResult();$.ua.get=function(){return parser.getUA()};$.ua.set=function(uastring){parser.setUA(uastring);var result=parser.getResult();for(var prop in result){$.ua[prop]=result[prop]}}}}}(this);

/*
 *
 * define VSeeDetect class.
 *
 */

(function(global, undefined) {
    global.VSeeDetect = function(config) {
        var me = this;

            /* Set these first so config object can override */

        this.pluginObjectDestination = document.createElement('div');
        this.pluginObjectDestination.id = this.PLUGIN_OBJECT_ID + "_DIV";
        this.pluginObjectDestination.style.position = "absolute";
        this.pluginObjectDestination.style.top = "-2000px";
        this.pluginObjectDestination.style.left = "-2000px";
        document.body.appendChild(this.pluginObjectDestination);

        this.scriptBaseURL = (function(scriptName) {
            var scripts = document.getElementsByTagName('script');
            for (index=0; index < scripts.length; ++index) {
                var aScript = scripts[index];
                if (aScript.src && aScript.src.indexOf(scriptName) >= 0) {
                    return aScript.src.replace(scriptName, "");
                }
            }
            return "./";
        })('vseedetect.js');

        this.apiBaseUrl = this.scriptBaseURL.substring(0, this.scriptBaseURL.lastIndexOf("/js"));

        /* Allow config object to override any aspect of this object */
        for (var attrname in config) {
            this[attrname] = config[attrname];
        }

        this.swfStorage = new SwfStore({
            namespace: "vsee",
            swf_url: "https://api.vsee.com/js//storage.swf",
            debug: this.debugSwf,

            onready: function() {
                me.log('swfStore loaded!');
                me.ready = true;
                me.noFlash = false;
                me._processCallbacks.call(me);
            },

            onerror: function() {
                me.log('swfStore failed to load!');
                me.noFlash = true;
                me.ready = true;
                me._processCallbacks.call(me);
            }
        });

        this.uaParser = new UAParser();
    };

    VSeeDetect.prototype = {
        /* Flash cookie name for storing version */
        FLASH_KEY: "vseeInstallVersion",

        /* Installation constants */
        INSTALLED: "installed",
        NOT_INSTALLED: "notInstalled",
        UNKNOWN: "unknown",

        /* Plugin constants */
        NAPI_NAME: ["VSeeDetection","VSeeHelper"],
        AX_NAME: "VSeeLab.VSeeDetection",
        MIME_TYPE: "application/x-vseedetection",
        PLUGIN_OBJECT_ID: "__VSEE_pluginID",

        callbacks: [],
        ready: false,
        noFlash: false,
        debug: false,
        debugSwf: false,
        console: global.console,
        pluginObjectDestination: null,

        vseeData: { version: null },

        SKIP_STEP: '__SKIP__',
        downloadInstructions: {
            'Windows': {
                'step-1': 'Click on "Run" to run the installer.',
                'step-2': 'VSee will launch automatically when installation is complete. Click "Run" if prompted.',
                'step-3': 'Click "OK" to finish the installation.',

                'Firefox': {
                    'step-1': 'Click on "Save file" when prompted.',
                    'step-2': 'Double-click the "vsee.exe" that just downloaded to run the installer.',
                    'step-3': 'Click "OK" to finish the installation.'
                },

                'Chrome': {
                    'step-1': 'Click on "Save" when prompted.',
                    'step-2': 'Click on the "vsee.exe" that just downloaded to run the installer.',
                    'step-3': 'Click "OK" to finish the installation.'
                },

                'IE': {
                    'version-9': {
                        'step-2': 'When this dialog appears, click "OK" to finish the installation.',
                        'step-3': this.SKIP_STEP
                    }
                }
            },

            'Mac OS X': {
                'step-1': 'Click on the vsee.dmg file that was downloaded.',
                'step-2': 'Drag the VSee icon into the Applications folder.'
            },

            'iOS': {
                'step-1': 'Go to the App Store to install VSee',
                'step-2': 'After VSee is installed, return to this page to make a call.'
            }
        },

        /*
         * Main interface
         */

        isVSeeInstalled: function(callback) {
            /*
                First try synchronous methods...
             */
            var result = this.checkForBrowserPlugin();
            if (result != this.UNKNOWN) {
                this.log("determined vsee installation status using browser plugin: " + result);
                callback(result, this.vseeData);
                return;
            }

            /*
                Now try asynchronous methods...  Chain them via callbacks.
             */

            this.checkFlashCookie(function(isInstalled) {
                if (isInstalled != this.UNKNOWN) {
                    this.log("determined vsee installation status using flash cookie: " + isInstalled);
                    callback(isInstalled, this.vseeData);
                    return;
                }

                /* additional async strategies could be chained here */

                /* couldn't figure it out */
                this.log("could not determine vsee installation status");
                callback(this.UNKNOWN, {});
            });
        },

        /*
         * Flash strategy specific methods (asynchronous)
         */

        checkFlashCookie: function(internalCallback) {
            var me = this;
            this.onFlashReady(function(flashWorking) {
                var version = null;
                var installed = "unknown";

                if (flashWorking) {
                    me.vseeData.version = me.getVersion();
                    installed = me.vseeData.version != null ? me.INSTALLED : me.NOT_INSTALLED;
                }

                internalCallback.call(me, installed);
            });
        },

        onFlashReady: function(callback) {
            if (this.ready) {
                callback(!this.noFlash);
            } else {
                this.callbacks.push(callback);
            }
        },

        _processCallbacks: function() {
            this.log("Processing " + this.callbacks.length + " stored callbacks (flash working: " + (!this.noFlash) + ")");

            for (var i = 0; i < this.callbacks.length; ++i) {
                this.callbacks[i](!this.noFlash);
            }
        },

        _checkReady: function() {
            if (!this.ready) {
                throw "getVersion (for flash cookie) only available after flash is done loading.  Use a callback to onFlashReady";
            }

            if (this.noFlash) {
                throw "getVersion (for flash cookie) called when flash not available.  Use a callback to onFlashReady and check parameter";
            }
        },

        getVersion: function() {
            this._checkReady();
            this.swfStorage.refresh();
            return this.swfStorage.get(this.FLASH_KEY);
        },

        setVersion: function(version) {
            this._checkReady();

            // Even if version is "falsey" and gets set to "unknown", vsee is still considered installed but
            // with an unknown version.
            version = version || "unknown";

            this.swfStorage.set(this.FLASH_KEY, version);
        },

        clearVersion: function() {
            this._checkReady();

            this.swfStorage.clear(this.FLASH_KEY);
        },

        /*
         * Browser plugin strategy specific methods (all synchronous)
         */

        checkForBrowserPlugin: function() {
            return this._isVSeePluginPresent() ? this.INSTALLED : this.UNKNOWN;
        },

        reloadPlugins: function() {
            if (typeof(navigator.plugins) == "object" &&
                (typeof(navigator.plugins.refresh) == "function" || typeof(navigator.plugins.refresh) == "object")) {
                this.log("Refreshing plugin list");
                navigator.plugins.refresh(false);
            } else {
                this.log("Browser does not support plugin list refreshing (" +
                         typeof(navigator) + "/" + typeof(navigator.plugins) + "/" +
                         typeof(navigator.plugins.refresh) + ")");
            }
        },

        _isVSeePluginPresent: function() {
            this.reloadPlugins();

            return global.ActiveXObject ? this._isVSeeActiveXPluginPresent() : this._isVSeeNAPIPluginPresent();
        },

        _isVSeeActiveXPluginPresent: function() {
            var plugin = false;
            try {
                plugin = new ActiveXObject(this.AX_NAME);

                if (plugin) {
                    try {
                        this.vseeData.version = plugin.version;
                    } catch (e) {
                        this.log("Failed to call plugin 'get_version' method: " + e.message);
                    }
                }

                return true;
            } catch (e) {
                this.log("Couldn't create activex object: " + e.message);
            }

            return false;
        },

        _isVSeeNAPIPluginPresent: function() {
			var i = this.NAPI_NAME.length;
			while(i--) {
				if (typeof(navigator.plugins[this.NAPI_NAME[i]]) != "undefined") {
					var plugin = this._getOrCreatePlugin();
					if (plugin) {
						try {
							this.vseeData.version = plugin.version;
						} catch (e) {
							this.log("Unable to call plugin get_version: " + e.message);
						}
					}

					return true;
				}
			}
			return false;
        },

        _getOrCreatePlugin: function(params) {
            var plugin = document.getElementById(this.PLUGIN_OBJECT_ID);
            if (!plugin) {
                this.log("Creating plugin DOM object");

                if (typeof(params) == "undefined") {
                    params = {};
                }

                plugin = document.createElement('object');
                plugin.setAttribute('id', this.PLUGIN_OBJECT_ID);
                plugin.setAttribute('type', this.MIME_TYPE);
                plugin.setAttribute('width', '100');
                plugin.setAttribute('height', '500');

                for (paramName in params) {
                    var param = document.createElement('param');
                    param.setAttribute('name', paramName);
                    param.setAttribute('value', params[paramName]);
                    plugin.appendChild(param);
                }

                this.pluginObjectDestination.appendChild(plugin);
            }

            return plugin;
        },

        /*
         * Browser/OS specific VSee download methods
         */

        getOperatingSystemName: function() {
            return this.uaParser.getOS().name;
        },

        getBrowserName: function() {
            return this.uaParser.getBrowser().name;
        },

        getBrowserVersion: function() {
            return this.uaParser.getBrowser().version.replace(/\.[0-9.]+$/, "");
        },

        getVSeeDownloadURL: function() {
            switch (this.getOperatingSystemName()) {
                case "Windows":
                    return "http://vsee.com/vsee_em_nd.exe";
                case "Mac OS X":
                    return "http://vsee.com/vsee.dmg";
                case "iOS":
                    return "https://itunes.apple.com/app/vsee-group-video-calls-free/id603020912?mt=8";
                default:
                    return "http://vsee.com/start/download";
            }
        },

        getVSeeDownloadInstructions: function() {
            var os = this.getOperatingSystemName();
            var browser = this.getBrowserName();
            var browserVersion = "version-" + this.getBrowserVersion();

            var instructions = { numberOfSteps: 0 };

            var stepNumber = 1;
            var stepInstruction;
            do {
                var stepName = 'step-' + stepNumber;

                stepInstruction = null;
                stepInstruction = this._checkForInstructions([stepName], stepInstruction);
                stepInstruction = this._checkForInstructions([browser, stepName], stepInstruction);
                stepInstruction = this._checkForInstructions([browser, browserVersion, stepName], stepInstruction);
                stepInstruction = this._checkForInstructions([os, stepName], stepInstruction);
                stepInstruction = this._checkForInstructions([os, browser, stepName], stepInstruction);
                stepInstruction = this._checkForInstructions([os, browser, browserVersion, stepName], stepInstruction);

                if (stepInstruction != null && stepInstruction != this.SKIP_STEP) {
                    instructions[stepName] = {
                        "imageUrl": this.apiBaseUrl + "/platform/image/detection/" + stepName + ".png",
                        "direction": stepInstruction
                    }
                    instructions.numberOfSteps = stepNumber;
                }

                ++stepNumber;
            } while (stepInstruction != null);

            return instructions;
        },

        _checkForInstructions: function(pathArray, defaultValue) {
            var dict = this.downloadInstructions;

            while (pathArray.length > 0) {
                var pathElement = pathArray.shift();
                if (!(pathElement in dict)) {
                    return defaultValue;
                }

                dict = dict[pathElement];
            }

            return dict;  // dict should now actuall be the node we searched for, not a complex object
        },

        /*
         * Utility methods
         */
        log: function(message) {
            if (this.debug) {
                this._setupFakeConsole();
                this.console.log("VSEE_DETECT: " + message);
            }
        },

        _setupFakeConsole: function() {
            if (typeof this.console === "undefined" || typeof this.console.log === "undefined") {

                var fakeConsoleOutput = document.createElement('div');
                document.body.appendChild(fakeConsoleOutput);

                this.console = {
                    log: function(msg){
                        var m = document.createElement('div');
                        m.innerHTML = msg;
                        fakeConsoleOutput.appendChild(m);
                    }
                };
            }
        }
    };

})(window);



