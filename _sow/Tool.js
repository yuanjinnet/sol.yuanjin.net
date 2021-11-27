/*
 * Tool: 通用工具箱。
 */
module.exports=
{
  formatString:function(string, format){ // http://www.cnblogs.com/simayixin/archive/2011/03/29/1998545.html
    if (Array.isArray(format)){ // call("{0}, {1}, oder?", ["hello","world"])
      var reg = /{(\d+)}/gm;
      return string.replace(reg,
        function(match,name){
          return format[~~name];
        });
    }else if (typeof format==='object'){ // call("数学={数学},语文={语文}, great!", {"数学":100,"语文":95})
      var reg = /{([^{}]+)}/gm;
        return string.replace(reg,function(match,name){
            return format[name];
        });
    }
  },
/* 不再使用
  encryptMailto:function(alias,salt,domain){
    var mailarray=[];
    for (var i=0; i<alias.length; i++){
      mailarray[i]=alias.charCodeAt(i);
    }
    mailarray[alias.length]=64;
    for (var i=0; i<domain.length; i++){
      mailarray[alias.length+1+i]=domain.charCodeAt(i);
    }
    var mailstring=''; 
    for (var i in mailarray){
      mailstring+=String.fromCharCode(mailarray[i]); 
    } 
    return mailstring;
  },
*/
  loadModule:function(moduleName,container){
    function load(){
      var module=localStorage[moduleName];
      container.innerHTML=module.html;
      var script = document.createElement('script');
      script.innerText=module.script;
      document.getElementsByTagName('body')[0].appendChild(script); 
      ko.applyBindings(self, container);
    }
    if (localStorage[moduleName] && localStorage[moduleName].html && localStorage[moduleName].script){ // load from local.
      if (container) load();
      return localStorage[moduleName];
    }else{ // import from remote.
      $.post(SOLET+'App_getModule',
        starModel.normalize({tag:starModel.starId,moduleName:moduleName}),
        function(module){
          if (module && sow.MD5.hex_md5(module.html+module.script)===module.hash){
            localStorage[moduleName]=module;
            if (container) load();
            return localStorage[moduleName];
          }else{
            return null;
          }
        }
      ).fail(function(){
        return null;
      });
    }
  }
  ,
  setCookie : function(c_name, value, expiredays){
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + expiredays);
    document.cookie = c_name + '=' + escape(value)
        + ((expiredays == null) ? '' : ';expires=' + exdate.toGMTString()); // 如不设expires，默认为当前浏览器生命期内有效。
  }
  ,
  getCookie : function(c_name){
    var re = new RegExp("\\b" + c_name + "=([^;]*)\\b");
    var arr = re.exec(document.cookie);
    return arr ? arr[1] : '';
  }
  ,
  removeCookie : function(c_name){
    this.setCookie(c_name, '', -1);
  }
  ,
  setLocalData : function(key, value){
    var v = (typeof value==='object'?JSON.stringify(value):value);
    if (window.localStorage){
      window.localStorage[key]=v;
    }else{
      this.setCookie(key, v, 366); // 默认为一年后失效。
    }
  }
  ,
  getLocalData : function(key){
    if (window.localStorage){
      return window.localStorage[key];
    }else{
      return this.getCookie(key);
    }
  }
  ,
  setSessionData : function(key, value){
    var v = (typeof value==='object'?JSON.stringify(value):value);
    if (window.sessionStorage){
      window.sessionStorage[key]=v;
    }else{
      this.setCookie(key, v); // 不设expires，默认为当前浏览器生命期内有效。
    }
  }
  ,
  getSessionData : function(key){
    if (window.sessionStorage){
      return window.sessionStorage[key];
    }else{
      return this.getCookie(key);
    }
  }
  ,
  removeData : function(key){
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
    this.removeCookie(key);
  }
  ,
  getPrototypeChain : function(obj){
    var protoChain = [];
    while (obj = obj.__proto__) {
      protoChain.push(obj);
    }
    protoChain.push(null);
    return protoChain;
  }
  ,
  getProperties : function(obj){
    var propArr = {}; //new Array();
    for (var p in obj) {
      if (typeof (obj[p]) != 'function' && typeof (obj[p]) != 'object') {
//        var prop = {};
//        prop.name = p;
//        prop.type = typeof (obj[p]);
//        prop.value = obj[p];
//        propArr.push(prop);
        propArr[p]=obj[p];
      }
    }
    return this.sortAscending(propArr);
  }
  ,
  sortAscending : function(arr) {
    for (var i = 0; i < arr.length; i++) {
      for (var j = i; j < arr.length; j++) {
        if (arr[i].name > arr[j].name) {
          var temp = arr[i];
          arr[i] = arr[j];
          arr[j] = temp;
        }
      }
    }
    return arr;
  }
  ,
  substr : function(string, start, length) {
    // 注意防止string为null的情况，例如当message的content为null时，会造成null.substr(...)失败，无法读出后续messages。
    if (typeof string == 'string') {
      return string.substr(start, length);
    }
    return '';
  }
  ,
  isEmptyObject : function(Obj) { // 建议用jQuery的$.isEmptyObject.
    for ( var p in Obj) {
      return false; // 当obj包含属性时，即非空对象，例如 {a:1}, [3], 'hello'。
    }
    return true; // 当obj不包含属性时，即空对象或不是对象，例如 {},[],'',1,0, null,
                  // undefined。特别注意,'hello' 不是空对象, 但 ''是。
  }
  ,
  isSet : function(value) {
    if (typeof value == 'undefined' || value == null)
      return false;
    else
      return true;
  }
  ,
  StringToAscii : function(str) {
    return str.charCodeAt(0).toString(16);
  }
  ,
  AsciiToString : function(asccode) {
    return String.fromCharCode(asccode);
  }
  ,
  // <data-bind text: sow.Tool.readPath('content.buyer.name', $data)
  // 支持 b,  b()  , 不支持 b[]
  readPath : function(path, root) {
    var parent = root || window;
    var names = path.split('.');
    for (var i in names) {
      if (typeof parent === 'object' && names[i].match(/^\w+\(\)$/) && typeof parent[names[i].substring(0,names[i].length-2)] === 'function') { // 支持 xxx.myfunc().yyy 的函数形式作为一个路径节点。
        parent = parent[names[i].substring(0,names[i].length-2)]();
      }else if (typeof parent === 'object'  && names[i].match(/^\w+$/) && typeof parent[names[i]] != 'undefined' && parent[names[i]] != null) {
        parent = parent[names[i]];
      }else {
        return '';
      }
    }
    return (parent===null || parent===undefined) ? '' : parent;
  }
  ,
  setPath : function(path, root, value) {
    var parent=root||window;
    var names=path.split('.');
    for (var i=0; i<names.length-1; i++) {
      if (typeof parent === 'object' && names[i].match(/^\w+$/)) {
        if (typeof parent[names[i]] !== 'object') parent[names[i]]={};
        parent = parent[names[i]];
      }else {
        return null;
      }
    }
    return parent[names[names.length-1]]=value;
  },
  validatePwd: function(pwd) {
    return /^[^ ]{6,}$/.test(pwd);
  },
  validateConfirmCode: function(code) {
    return /^\d{6}$/.test(code);
  },
  typeofUid : function(uid) // 越底层，越通用、基础、广泛。例如，逻辑层允许各种电话格式，但本应用中，只允许中国11位手机号。
  {
    if (uid)
    {
      if (uid.match(/^[_\w\-\.]+@[\w\-]+(\.[\w\-]+)*\.[a-zA-Z]{2,4}$/))
        return 'email';
      else if (uid.match(/^\+\d{1,3}-\d{11}$/))
        return 'phone';
      else if (uid.match(/^\*\d{1,12}$/)) // 注意，在前端的sid包含开头的 * 符号，以和省略了国家码的手机号区分。送到后台前，要删除该 * 符号。
        return 'aiid';
      else if (uid.match(/^\d{11}$/))
      	return 'callNumber';
    }
    return false;
  },
  setWaterfall : function() {
    $('.Waterfall:visible').each(function(i,val) { // 用 each 来确保不同的Waterfall容器里的卡片重置序数。
      $(val).children().setWaterfall();
    });
  },
  isSupportFixed : function() // 浏览器是否支持position:fixed
  {
    var userAgent = window.navigator.userAgent, ios = userAgent
        .match(/(iPad|iPhone|iPod)\s+OS\s([\d_\.]+)/), ios5below = ios
        && ios[2] && (parseInt(ios[2].replace(/_/g, '.'), 10) < 5), operaMini = /Opera Mini/i
        .test(userAgent), body = document.body, div, isFixed;
    div = document.createElement('div');
    div.style.cssText = 'display:none;position:fixed;z-index:100;';
    body.appendChild(div);
    isFixed = window.getComputedStyle(div).position != 'fixed';
    body.removeChild(div);
    div = null;

    return !!(isFixed || ios5below || operaMini);
  },
  getRandomNum : function(min, max)
  {
    return (min + Math.floor( Math.random() * (max-min+1)));
  },
  getRandomString : function(len)
  {
    var ranChar = 'abcdefghijklmnopqrstuvwxyz';
    var maxlen = ranChar.length;
    var str = '';
    for (i = 0; i < len; i++)
    {
      str += ranChar.charAt(Math.floor(Math.random() * maxlen));
    }
    return str;
  },
  getRandomArray : function(arr)
  {
    for (var i in arr)
    {
      var r = Math.floor(Math.random() * arr.length);
      var v = arr[i]; arr[i]=arr[r]; arr[r]=v;
    }
    return arr;
  },
  touchUrl : function( url, onSuccess, onFail ) {
    $.get(url)
    .done(onSuccess)
    .fail(onFail);
  },
  parseUrl : function(url) // todo: 本方法还不能解析url中三维及以上数组的参数。
  {
    var a = document.createElement('a');
    a.href = this.decodeUrl(url); // 注意，这里把 xx%40xxx.xxx 等编码后的url解码回 xx@xxx.xxx。
    return { // 这个括号另起一行会导致JS解释错误。
      source : url,
      protocol : a.protocol.replace(':', ''),
      hostname : a.hostname,
      port : a.port,
      query : a.search, // 或者，在这里decodeUrl?
      file : (a.pathname.match(/\/([^\/?#]+)$/i) || [ , '' ])[1],
      hash : a.hash.replace('#', ''),
      path : a.pathname.replace(/^([^\/])/, '/$1'),
      relative : (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [ , '' ])[1],
      segments : a.pathname.replace(/^\//, '').split('/'),
      params : (function() {
        var params = {}, keyValueArray = a.search.replace(/^\?/, '').split('&'), keyValue;
        for (var i in keyValueArray) {
          if (!keyValueArray[i]) {
            continue;
          }
          keyValue = keyValueArray[i].split('=');
          if (keyValue[0].match(/^\w+\[\w+\]$/)) // 处理url中的一维数组。
          {
            eval(keyValue[0]
                .replace(/^(\w+)\[(\w+)\]$/,
                    "if ($.isEmptyObject(params.$1)) { params.$1 = {}; }; params.$1.$2 = keyValue[1]; "));
          } else if (keyValue[0].match(/^\w+\[\w+\]\[\w+\]$/)) // 处理url中的二维数组。
          {
            eval(keyValue[0]
                .replace(
                    /^(\w+)\[(\w+)\]\[(\w+)\]$/,
                    "if ($.isEmptyObject(params.$1)) { params.$1 = {}; }; if ($.isEmptyObject(params.$1.$2)) { params.$1.$2 = {}; }; params.$1.$2.$3 = keyValue[1]; "));
          } else
          // 普通标量或高维数组情况下（例如三维数组），做简单的变量赋值。
          {
            params[keyValue[0]] = keyValue[1];
          }
        }
        return params;
      })()
    };
  },
  parse_url : function parse_url(str, component)
  { // 本方法类似于PHP的parse_url方法。本方法比较简陋，不能解析query字符串内部结构。
    // discuss at: http://phpjs.org/functions/parse_url/
    // original by: Steven Levithan (http://blog.stevenlevithan.com)
    // reimplemented by: Brett Zamir (http://brett-zamir.me)
    // input by: Lorenzo Pisani
    // input by: Tony
    // improved by: Brett Zamir (http://brett-zamir.me)
    // note: original by
    // http://stevenlevithan.com/demo/parseuri/js/assets/parseuri.js
    // note: blog post at http://blog.stevenlevithan.com/archives/parseuri
    // note: demo at
    // http://stevenlevithan.com/demo/parseuri/js/assets/parseuri.js
    // note: Does not replace invalid characters with '_' as in PHP, nor does
    // it return false with
    // note: a seriously malformed URL.
    // note: Besides function name, is essentially the same as parseUri as
    // well as our allowing
    // note: an extra slash after the scheme/protocol (to allow file:/// as in
    // PHP)
    // example 1:
    // parse_url('http://username:password@hostname/path?arg=value#anchor');
    // returns 1: {scheme: 'http', host: 'hostname', user: 'username', pass:
    // 'password', path: '/path', query: 'arg=value', fragment: 'anchor'}
    var query, key = [ 'source', 'scheme', 'authority', 'userInfo', 'user',
        'pass', 'host', 'port', 'relative', 'path', 'directory', 'file',
        'query', 'fragment' ], ini = (this.php_js && this.php_js.ini) || {}, mode = (ini['phpjs.parse_url.mode'] && ini['phpjs.parse_url.mode'].local_value)
        || 'php', parser =
    {
      php : /^(?:([^:\/?#]+):)?(?:\/\/()(?:(?:()(?:([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?()(?:(()(?:(?:[^?#\/]*\/)*)()(?:[^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
      strict : /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
      loose : /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/\/?)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
    // Added one optional slash to post-scheme to catch file:/// (should
    // restrict this)
    };

    var m = parser[mode].exec(str), uri = {}, i = 14;
    while (i--)
    {
      if (m[i])
      {
        uri[key[i]] = m[i];
      }
    }

    if (component)
    {
      return uri[component.replace('PHP_URL_', '').toLowerCase()];
    }
    if (mode !== 'php')
    {
      var name = (ini['phpjs.parse_url.queryKey'] && ini['phpjs.parse_url.queryKey'].local_value)
          || 'queryKey';
      parser = /(?:^|&)([^&=]*)=?([^&]*)/g;
      uri[name] = {};
      query = uri[key[12]] || '';
      query.replace(parser, function($0, $1, $2)
      {
        if ($1)
        {
          uri[name][$1] = $2;
        }
      });
    }
    delete uri.source;
    return uri;
  },
  /*
   * js的encodeURI不会改 @, +, & 这种字符，但是会改 %, 中文 字符。但php的urlencode会改@, +, & 这种。
   * 所以js的decodeURI不能用来decode url，需要自定义的能完整解码的。
   */
  decodeUrl : function(zipStr)
  {
    if (!$.isEmptyObject(zipStr))
    {
      var uzipStr = '';
      for (var i = 0; i < zipStr.length; i++)
      {
        var chr = zipStr.charAt(i);
        if (chr == '+')
        {
          uzipStr += ' ';
        } else if (chr == '%')
        {
          var asc = zipStr.substring(i + 1, i + 3);
          if (parseInt('0x' + asc) > 0x7f)
          {
            uzipStr += decodeURI('%' + asc.toString()
                + zipStr.substring(i + 3, i + 9).toString());
            i += 8;
          } else
          {
            uzipStr += this.AsciiToString(parseInt('0x' + asc));
            i += 2;
          }
        } else
        {
          uzipStr += chr;
        }
      }
      return uzipStr;
    }
    return false;
  }
  ,
  urlExists : function fileExists(url) 
  {
    // [todo] 缺陷：当url含有异域的目录或文件，例如从http://www.yuanjin.net去检测http://www.yuanjin.net/solet/，
    // 或者从file:///android_assets/www/... 去检测http:///android_assets/www/...，
    // 则除非该url确实存在，否则本方法将导致异常：Cross-Origin Request Blocked，不能返回true或false，从而导致外层调用静悄悄失败。
//    if (url.match(window.location.origin)) // 目前暂且只检测同域的文件
//    {
      var http = new XMLHttpRequest();
      http.open('HEAD', url, false);
      http.send();
      return http.status!=404;
//    }
//    return false;
  }
  ,
  filterUrl : function(text){
    if (text && typeof text==='string'){
      return text.replace(/\b(((http|https|ftp|thunder):\/\/|magnet:\?)[^\s]+)\b/g, '<a onclick="sow.Tool.openUrl(\'$1\')">$1</a>');
    }
    return text;
  }
  ,
  openUrl : function(url){ // 本地应用里，点<a href>链接会在本应用自身里打开，因此需要专门跳转。
    if (window.plus){
      plus.runtime.openURL(url);
    }else{
      window.open(url);
    }
  }
  ,
  getPrevSibling: function (domel)
  {
    var x=domel.previousSibling;
    while (x.nodeType!=1) // IE 会忽略节点间生成的空白文本节点（例如，空格，换行符号），而 Mozilla 会把空白认作Node，因此要过滤。
    {
      x=x.previousSibling;
    }
    return x;
  },
  getNextSibling: function (domel)
  {
    var x=domel.nextSibling;
    while (x.nodeType!=1) // IE 会忽略节点间生成的空白文本节点（例如，空格，换行符号），而 Mozilla 会把空白认作Node，因此要过滤。
    {
      x=x.nextSibling;
    }
    return x;
  },
  getFirstChild: function(domel)
  {
    var x=domel.firstChild;
    while (x.nodeType!=1)
    {
      x=x.nextSibling;
    }
    return x;
  },
  getLastChild: function(domel)
  {
    var x=domel.lastChild;
    while (x.nodeType!=1)
    {
      x=x.previousSibling;
    }
    return x;
  },
  addEvent: function (domel, type, fn){
    if (domel.addEventListener) { // DOM2.0
      domel.addEventListener(type, fn, false); // 默认 useCapture = false.
    }else if (domel.attachEvent) { // IE
      domel.attachEvent('on' + type, fn); // 或者 domel.attachEvent('on'+type, function(){fn.call(domel,window.event);});
    }else {
      domel['on' + evType] = fn;//DOM 0
    }
  },
  getFileExt: function(filename){
    return (/[.]/.exec(filename)) ? /[^.]+$/.exec(filename.toLowerCase()) : '';
  },
    // [todo] 添加 drag and drop: http://blog.csdn.net/zhu1988renhui/article/details/7936498
  uploadFile: function(fileInput, params, options){ // fileInput: 前端<input file元素；params: JSON对象，传给后台；options 包括 busyUploading/状态设置函数，onDone/执行完毕回调；onProgress/执行过程回调。
    var selectedFile = undefined;
    if (fileInput && (selectedFile=fileInput.files[0])) // 初始化时，selectedFile还不存在，但是本方法会被调用，导致失败。所以在此作个检查。
    {
      fileInput.value = ''; // 清空fileInput，否则，已经选择的文件会一直保留，下次重新打开网页也仍然在，并且初始化时自动激发change事件调用uploadFile从而被重复上传。

      // 执行前端能做的检查
      if (!/^(jpg|png|jpeg|gif|amr|wav|mp3|mp4|mov)$/.test(sow.Tool.getFileExt(selectedFile.name))) {
        if(typeof options.onUploadFail==='function') options.onUploadFail('UPLOAD_BADEXT');
        return false; // return false to cancel upload.
      } else if (selectedFile.size>sow.Const.UPLOAD_LIMIT*10 && !/^(jpg|png|jpeg)$/.test(sow.Tool.getFileExt(selectedFile.name))) {
        if(typeof options.onUploadFail==='function') options.onUploadFail('UPLOAD_OVERSIZED');
        return false; // return false to cancel upload.
      }

      // 对大图片文件进行压缩。
      if (/^(jpg|png|jpeg)$/.test(sow.Tool.getFileExt(selectedFile.name)) && selectedFile.size>sow.Const.UPLOAD_LIMIT && !options.origImg) {
        if (window.plus && window.plus.zip) {
          var zippedImgPath = selectedFile.name.replace(/([^\/]+)$/, "zip_$1");  // 如果 'zip_'+selectFile，会被放在io.dcloud.HBuilder/.HBuilder/apps/HBuilder/www/zip__doc/xxxxx.jpg； 如果 selectFile+'.zipped'，会被放在 .../HBilder/doc/xxxxx.jpg.zipped 
          window.plus.zip.compressImage(
            { src:selectedFile.name, dst:zippedImgPath, width:'20%', rotate:(sow.Tool.deviceInfo().brand==='iphone'?'90':'0'), quality:20 }, // iPhone上，照片方向总是被旋转，因此要转回去。
            function(evt) {
              sow.Tool.uploadFileOnPhone(zippedImgPath, params, options); 
              // [todo] 上传后再次更新界面
              return true;
            },
            function(error) {
//              sow.test('Compress error!'+JSON.stringify(error)); // 忽略压缩错误，继续上传原文件。
            }
          );
        }else{
//        在电脑上怎么办，不压缩？
//        sow.test('selectedFile.size='+selectedFile.size);
//        window.lrz(selectedFile)  // 在桌面浏览器(Firefox)没问题，但在Coolpad S6的手机应用(HBuilder)或手机浏览器里却静悄悄的不起作用。
//          .then(function(rst){
//            sow.test('lrz done');
            // [todo] 上传
            //var img = document.getElementById('？？？'); // new Image();
            //img.src = rst.base64;
//          })
//          .catch(function(err){sow.test('lrz error: ');})
//          .always(function(){sow.test('lrz always');});
        }
      }

      // 准备上传
      var fd = new FormData(); // 或者取得form元素对象，将它作为参数传入FormData对象中。示例 var fd = new FormData(document.getElementById('myform'));
      starModel.normalize(params); // 注意一定要添加 passtoken 。
      for (var k in params){ // 收集需要传递给后台的其他数据，JSON形式。
// 如果 params[k] 是一个非null对象，例如是一整个 project/person 对象, 需要先转化成JSON字符串，否则传到后台是 "[object Object]"
        fd.append(k, encodeURIComponent(params[k])); // nodejs 的 Multer 竟然不能处理 ""， usage="abc" 被stringify后的 ""abc"" 竟然导致Multer解析body失败。而普通的object被stringify后可以被Multer解析。
      };
      fd.append('fileData', selectedFile);

    // 开始上传
      if(typeof options.busyUploading==='function') options.busyUploading(true);  // 开始上传后，禁止再点击按钮。
////    直接使用xhr:
//  var xhr = new XMLHttpRequest();
//  xhr.upload.addEventListener('progress', options.onUploadProgress, false);
//  xhr.addEventListener('load', options.onUploadDone, false);
//  xhr.addEventListener('error', function(evt){sow.test('There was an error attempting to upload the file.');}, false);
//  xhr.addEventListener('abort', function(evt) {sow.test('The upload has been canceled by the user or the browser dropped the connection.');}, false);
//  xhr.open('POST', SOLET+'File_upload', true);
//  xhr.send(fd);
//  sow.test(xhr.responseText); // 如果直接用xhr，还需要解析 evt.target.responseText 来处理后台返回的信息。
////    或者使用$.ajax. [todo] 但不知为何，这个$.ajax会导致Knockout在Console里报错 TypeError: l.apply is not a function，即使没有参数也报错。而其他地方的$.ajax没问题。
      $.ajax({  // API参考: http://api.jquery.com/jQuery.ajax/
        url: SOLET+'File_upload'
        ,type: 'POST'
        ,data: fd
        ,processData: false  // 告诉jQuery不要去处理发送的数据，以正确处理FormData类型
        ,contentType: false   // 告诉jQuery不要去设置Content-Type请求头，以正确处理FormData类型
        ,dataType: 'json'
        ,xhr: function(){var xhr=$.ajaxSettings.xhr(); if (xhr.upload && typeof options.onUploadProgress==='function') xhr.upload.addEventListener('progress',options.onUploadProgress,false); return xhr;}  // jQuery的jqXHR不提供upload属性，因此需要使用自己的xhr来监听progress。但是在这里引用预先加载好onProgress的xhr却不能达到效果，只能在这里当场建立$.ajaxSettings.xhr()或new XMLHttpRequest() 然后upload.addEventListener。
//      ,success:function(){ Anything data, String textStatus, jqXHR jqXHR}   // 换用 jqXHR.done()。当前端发送成功时调用。
//      ,error:function(){ jqXHR jqXHR, String textStatus, String errorThrown}  // 换用 jqXHR.fail()。当前端发送出错时调用。
//      ,complete:function(){ jqXHR jqXHR, String textStatus}  // 换用 jqXHR.always()。当前端发送完毕（不论成功或出错）时调用。
      }).done(options.onUploadDone) // 注意，不论后台是成功接收还是发生错误，只要前端成功发送了，总是执行done方法。
      .fail(function(){ if(typeof options.onUploadFail==='function') options.onUploadFail('UPLOAD_FAIL'); } )  // 文件上传过程中失败
      .always(function(){ if(typeof options.busyUploading==='function') options.busyUploading(false);} );
      return true;
    }
    return false;
  },
  uploadFileOnPhone:function(filePath, params, options){
    if (window.plus && window.plus.uploader && filePath) {
      if (typeof options.busyUploading==='function') options.busyUploading(true);
      var task = window.plus.uploader.createUpload(
        SOLET + 'File_upload',
        { method:'POST',blocksize:204800,priority:100 },
        function ( uploadResult, status ) {
          if ( status == 200 ) {
//            sow.test('upload done '+uploadResult.responseText);
            if (typeof options.onUploadDone==='function') options.onUploadDone($.parseJSON(uploadResult.responseText));
          } else { 
            if (typeof options.onUploadFail==='function') options.onUploadFail(status);
          };
          if (typeof options.busyUploading==='function') options.busyUploading(false);
        }
      );
      task.addFile( filePath, {key:'file2upload'} );
      starModel.normalize(params);
      for (var prop in params){ // 收集需要传递给后台的其他数据，JSON形式。
        task.addData(prop, params[prop]);
      };
      task.start();
      return true;
    }else{
//      sow.test('您的手机系统不支持上传'); 
      if (typeof options.onUploadFail==='function') options.onUploadFail('UPLOAD_NOSUPPORT');
      return false;
    };
  },
  takePhoto:function(params, options){ // params要给后台的参数；options是前端的callbacks等等。
    if (window.plus && window.plus.camera) {
      var camera=window.plus.camera.getCamera();
      camera.captureImage(function(imgPath){ // 得到的参数只是相对路径名: _doc/xxxxx.jpg，下划线 _ 代表应用的根目录，实际上是在 .../doc/xxxxxx.jpg
        if (typeof options.onTakePhotoDone==='function') options.onTakePhotoDone(imgPath);
        if (options.origImg){ // 默认是压缩后上传，但用户可以明确要求用原图。
          sow.Tool.uploadFileOnPhone(imgPath, params, options); 
          // [todo] 上传后再次更新界面
        }else{
          window.plus.io.resolveLocalFileSystemURL(
            imgPath,     // resolve to:  /storage/emulated/0/Android/data/io.dcloud.HBuilder/.HBuilder/apps/HBuilder/doc/xxxx.jpg
            function(entry){
              if (entry.isFile){
                entry.file(
                  function(imgfile){
                    if (imgfile.size>sow.Const.UPLOAD_LIMIT){ // 如果照片大于500KB，在手机应用里，默认都要压缩，然后上传
                      if (window.plus && window.plus.zip) {
                        var zippedImgPath = imgPath.replace(/([^\/]+)$/, "zip_$1");  // 如果 'zip_'+imgPath，会被放在io.dcloud.HBuilder/.HBuilder/apps/HBuilder/www/zip__doc/xxxxx.jpg； 如果 imgPath+'.zipped'，会被放在 .../HBilder/doc/xxxxx.jpg.zipped 
                        window.plus.zip.compressImage(
                          { src:imgPath, dst:zippedImgPath, width:'20%', rotate:(sow.Tool.deviceInfo().brand==='iphone'?'90':'0'), quality:20 }, // iPhone上，照片方向总是被旋转，因此要转回去。
                          function(evt) {
                            sow.Tool.uploadFileOnPhone(zippedImgPath, params, options); 
                            // [todo] 上传后再次更新界面
                          },
                          function(error) {
//                            sow.test('Compress error!'+JSON.stringify(error));  // 忽略压缩错误，继续上传原文件
                            sow.Tool.uploadFileOnPhone(imgPath, params, options);
                          }
                        );
                      }else{
//                        sow.test('您的手机系统不支持压缩'); // 忽略压缩不支持，继续上传原文件
                            sow.Tool.uploadFileOnPhone(imgPath, params, options);
                      };
                    }else{ // 对小文件不压缩，直接上传
                      sow.Tool.uploadFileOnPhone(imgPath, params, options); 
                    };
                  },
                  function(error) {
                    // sow.test ('file is not successfully constructed.'); 
                    sow.Tool.uploadFileOnPhone(imgPath, params, options);
                  }
                );
              }else{ 
//                sow.test('photo path is not a file'); 
                if (typeof options.onTakePhotoFail==='function') options.onTakePhotoFail('TAKE_PHOTO_FAIL');
              };
            }, 
            function(error){
//              sow.test(imgPath+'is not resolved, error='+JSON.stringify(error));
              if (typeof options.onTakePhotoFail==='function') options.onTakePhotoFail('TAKE_PHOTO_FAIL');
            }
          );
        };
      },
      function(error){
//        sow.test('拍照失败');
        if (typeof options.onTakePhotoFail==='function') options.onTakePhotoFail('TAKE_PHOTO_FAIL');
      },
      { 
        filename:'_doc/photo/',
        resolution:camera.supportedImageResolutions[0], 
        format:camera.supportedImageFormats[0] 
      });
    }else{
//      sow.test('您的系统不支持拍照');
      if (typeof options.onTakePhotoFail==='function') options.onTakePhotoFail('TAKE_PHOTO_NOSUPPORT');
    };
  },
  loadCSS: function(path){
    if(!path||path.length===0){
      throw new Error('argument "path" is required!');
    }
    var head=document.getElementsByTagName('head')[0];
    var link=document.createElement('link');
    link.href=path;
    link.rel='stylesheet';
    link.type='text/css';
    head.appendChild(link);
  },
  loadJS: function(path){
    if(!path||path.length===0){
      throw new Error('argument "path" is required!');
    }
    var head=document.getElementsByTagName('head')[0];
    var script=document.createElement('script');
    script.href=path;
    script.type='text/javascript';
    head.appendChild(script);
  },
  deviceInfo: function(){
    var info={};
    if (window.device && device.hasOwnProperty('landscape')){ // 加载了 device.js
      info.hardware = device.mobile()?'mobile': // if ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) )  // 注意在手机浏览器上访问，也会返回'mobile'。
        device.tablet()?'tablet':
        device.desktop()?'desktop':'unknown';
      info.software = device.ios()?'ios':
        device.android()?'android':
        device.windows()?'windows':
        device.blackberry()?'blackberry':
        device.fxos()?'fxos':
        device.meego()?'meego':
        device.television()?'television':'unknown';
      info.brand = device.iphone()?'iphone':
        device.ipad()?'ipad':
        device.ipod()?'ipod':'unknown';
      info.edition = (screen.width==320 && screen.height==480 && window.devicePixelRatio==2)?'4':
        (screen.width==320 && screen.height==568 && window.devicePixelRatio==2)?'5':
        (screen.width==375 && screen.height==667 && window.devicePixelRatio==2)?'6':
        (screen.width==375 && screen.height==667 && window.devicePixelRatio==1.7)?'6Zoom':
        (screen.width==414 && screen.height==736 && window.devicePixelRatio==3)?'6Plus':
        (screen.width==414 && screen.height==736 && window.devicePixelRatio==2.72)?'6PlusZoom':'unknown';
    }else{
      if (screen.width==320 && screen.height==480 && window.devicePixelRatio==2) { info.hardware='mobile'; info.software='ios'; info.brand='iphone'; info.edition='4'; }
      else if (screen.width==320 && screen.height==568 && window.devicePixelRatio==2) { info.hardware='mobile'; info.software='ios'; info.brand='iphone'; info.edition='5'; }
      else if (screen.width==375 && screen.height==667 && window.devicePixelRatio==2) { info.hardware='mobile'; info.software='ios'; info.brand='iphone'; info.edition='6'; }
      else if (screen.width==375 && screen.height==667 && window.devicePixelRatio==1.7) { info.hardware='mobile'; info.software='ios'; info.brand='iphone'; info.edition='6Zoom'; }
      else if (screen.width==414 && screen.height==736 && window.devicePixelRatio==3) { info.hardware='mobile'; info.software='ios'; info.brand='iphone'; info.edition='6Plus'; }
      else if (screen.width==414 && screen.height==736 && window.devicePixelRatio==2.72) { info.hardware='mobile'; info.software='ios'; info.brand='iphone'; info.edition='6PlusZoom'; }
      else { info.hardware='unknown';info.software='unknown';info.brand='unknown';info.edition='unknown'; }
    }
    info.appmode = 
//      /^localhost|127.0.0.1|192\.168\.\d+\.\d+$/.test(window.location.hostname) ? 'localweb' :
      /^https?:\/\/.+$/.test(window.location.href) ? 'web' :  // 是浏览器访问的webapp。
      /^file:\/\/\/.+$/.test(window.location.href) ? 'native' :  // 是手机本地应用(webapp打包应用)，href=file:///android_assets/www/... 或 file:///var/mobile/Containers/Data/Application/... (host==空)。
      'unknown';
    return info;
  }
};