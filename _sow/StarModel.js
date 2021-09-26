/* 应用模型。
 * 整个应用的共享数据集合，与界面无关。
 */
module.exports= function(options) {
  var self = this;
  this.constructor = arguments.callee; 
  this.__proto__ = sow.modelPrototype;

  this.starVersion='2016010100'; // 默认值: yyyy mm dd nn (最后两位数字是为了在一天内，也能提交多个不同版本)
  this.starName='Faronear Star';
  this.starCode=options.starCode || 'star';
  this.starId='com.faronear.'+this.starCode; // 默认应用ID。
  this.starUrl='http://faronear.com/'+this.starCode+'/';
  this.starEmail='team-'+this.starCode+'@faronear.org';

// 暂不使用
//  this.soletVersion='2016010100';
//  this.soletHost='solet.faronear.com';

  this.setModel(options);

  /*
   * 设置系统后台的地址，SOLET为后台代码根地址，SOPIC为后台图片文件根地址。
   * 搜索顺序：1. 当前应用目录下的solet目录，2. faronear.com下的solet目录（如果前者不存在，或当前是手机混合应用）。
   * 注意 1.为了解决session跨域问题，不能使用固定的后台地址faronear.com，而要使用linkd.exe建立的硬链接solet
   *   2.如果浏览地址是 .../index.php 等文件结尾，window.location.pathname也包含这些，因此要替换掉这些。
  */
  if (sow.Tool.deviceInfo().appmode==='web'){ // 是浏览器访问。测试protocol + host + pathname是否有效. 对cordova或html5+的打包应用，href=file:///android_assets/www/... 或 file:///var/mobile/Containers/Data/Application/... (host=空), 不要交给urlExists。
//    && sow.Tool.urlExists(window.location.href.replace(/[^\/]*$/,'')+'solet/Webface.php')){ // 存在 ./solet/ 子目录。确保同源，不要跨域，否则确实不存在时，urlExists会静悄悄失败。
//    SOLET = /* window.location.href.replace(/[^\/]*$/,'')+ */ 'solet/?starId='+this.starId+'&action=';
//    SOFILE = /* window.location.href.replace(/[^\/]*$/,'')+ */ 'solet/'+sow.Const.FILEROOT;
    if (/^localhost|127.0.0.1|192\.168\.\d+\.\d+$/.test(window.location.hostname)) { // if localhost
      this.starUrl=window.location.href.replace(/[^\/]*$/,''); // 用于制作分享链接、密码的reset链接、email的点击链接等
//      SOLET= window.location.protocol + '//' + window.location.hostname + (/^https:$/.test(window.location.protocol)?':6327/':':6327/');
      SOLET = 'http://'+window.location.hostname+':6327/';
    }else { // if internet
//      SOLET= window.location.protocol + '//' + 'solet.faronear.com' + (/^https:$/.test(window.location.protocol)?':6327/':':6327/');
      SOLET = 'https://solet.faronear.com:6327/';
    }
    SOFILE='/_sow/file/';
  }else{
    /*** 作为手机应用时的后台地址 ***/
    SOLET = 'https://solet.faronear.com:6327/'; // 或者 https://solet.faronear.com:6327/
    SOFILE = this.starUrl+'/_sow/file/';
  }

  self.sioUrl=SOLET+self.starId; // starId 作为 sockets 的 namespace。

  this.simplize=function(obj){ // 去掉 _data 和 函数等不需要传给后台的东西，节省流量。
    if (obj && typeof obj==='object' && obj.hasOwnProperty('_data')){
      var newObj={};
      for (var p in obj){
        if (obj.hasOwnProperty(p) && typeof obj[p]!=='function' && p!=='_data') // maybe also delete '_class'?
          // 这里不需要把各种日期字符串变成Date对象，因为这一步是面向后台的，马上将送给后台。
          newObj[p]=obj[p];
      }
      return newObj;
    }// todo: 进入递归？
    return obj;
  }

  this.normalize=function(postdata){ // 定义在 starModel 里，就能使用 starId, webInfo 等信息了。
    postdata=postdata||{};
    postdata._passtoken=sow.Tool.getSessionData('passtoken');
    postdata.starId=this.starId;
    for (var key in postdata) {
      postdata[key]=JSON.stringify(Date.parseUserDate(this.simplize(postdata[key])));
    }
    return postdata;
  }

  /* 解析浏览器信息 */
  this.webInfo={
    href : window.location.href,
    appCodeName : navigator.appCodeName,
    appName : navigator.appName,
    appVersion : navigator.appVersion,
    language : navigator.language,
    platform : navigator.platform,
    userAgent : navigator.userAgent,
    documentClientWidth: document.documentElement.clientWidth, documentClientHeight: document.documentElement.clientHeight,
    windowInnerWidth: window.innerWidth, windowInnerHeight: window.innerHeight,
    sceenWidth: screen.width, screenHeight: screen.height,
    devicePixelRatio: window.devicePixelRatio,
    device: sow.Tool.deviceInfo()
  };
  //如果刷新网页，这些信息已经提交过，是一样的，不该重新提交。但作为单页应用，应当不会再次刷新，所以不改进了。
  $.post(SOLET+'Session_addOne', self.normalize({session: {webInfo:self.webInfo,star:{id:self.starId, url:self.starUrl, version:self.starVersion, name:self.starName}}}), function(){}, 'json'); // 不知为何，navigator不能直接作为参数；而JSON.stringify(navigator)得到的是无关紧要的数据，不包含appName的信息。因此要手工制作 navigator 对象。

  /* 混合应用？加载手机设备： */
  this.deviceReady=ko.observable(false);
  this.appInfo={};
//  $(document).on('deviceready', webappReady);  // 监听Cordova。如果页面加载了cordova.js, 并且打包成混合应用在手机上运行，则会激发 deviceready 事件。 */
  if (window.plus){ webappReady(); } else { document.addEventListener( 'plusready', webappReady, false ); }   // 监听 HTML5plus(H5+)。
  function webappReady() {
    if (window.plus && window.plus.device){ // H5+应用。有时忘了在HBuilder里定制manifest.json，没有添加device权限，则device=undefined, 存取plus.device.xxx 导致静悄悄出错，因此要确认plus.device存在。
      self.deviceReady('H5Plus');
      self.appInfo = {
        appContainer:'H5Plus',
        imei:plus.device.imei, imsi:plus.device.imsi, model:plus.device.model, vendor:plus.device.vendor, uuid:plus.device.uuid, // 如果直接赋值为plus.device，会在应用启动后试图打开电话拨号，因为plus.device还包含几个方法。
        screen:plus.screen,
        display:plus.display,
        networkinfo:plus.networkinfo,
        os:plus.os
      };
    }else if (window.device && window.device.cordova){ // Cordova应用。
      self.deviceReady('Cordova');
      self.appInfo = device;
      self.appInfo.appContainer='Cordova';
    }else{
      self.deviceReady('Unknown');
      self.appInfo = {
        appContainer:'Unknown'
      };
    };
    $.post(SOLET+'Session_setOne', self.normalize({session:{appInfo:self.appInfo}}), function(){}, 'json');
    
//    window.plus.navigator.setFullscreen(true); // isfullscreen()  目前不使用全屏模式。

    window.plus.key.addEventListener('backbutton',function(){ // 在安卓上，防止一按物理返回键就退出应用。
      plus.nativeUI.confirm( '真的要退出应用吗？', // 按 Home 键可切换到其他应用，不需要退出哦。
        function(evt) { if (evt.index===1) window.plus.runtime.quit(); }, // confirmCallback
        starModel.starName, // title
        ['取 消','退 出'] //  buttons. 注意，安卓上，按钮是从右向左排列的，和写在这里的顺序相反。
      );
    }, false);
  };
 
  /* 当前用户 */
  this.onlinePerson = ko.observable(sow.Const.PERSON_UNKNOWN); // 访问者。初始化为匿名用户。
  this.targetPerson = ko.observable(sow.Const.PERSON_ALL); // 被访问者。初始化为广场。

  this.isOnline = ko.computed(function() {
    if (self.onlinePerson() !== sow.Const.PERSON_UNKNOWN) return true;
    else return false;
  });
  /* 当前地点 */
  this.where = ko.computed(function() {
    if (self.targetPerson() == sow.Const.PERSON_ALL) // 在广场
      return 'SPACE_ALL';
    else if (self.targetPerson() != self.onlinePerson() && self.targetPerson() != sow.Const.PERSON_UNKNOWN) // 在别家
      return 'SPACE_HOST';
    else if (self.targetPerson() == self.onlinePerson() && self.onlinePerson() != sow.Const.PERSON_UNKNOWN) // 在自家
      return 'SPACE_HOME';
    else 
      return 'SPACE_SHARE'; // target == anonym
  });

  this.userLang=ko.observable('zh_CN'); // todo: 根据cookie、IP来选择一个初始语言
  if (sow.Tool.getLocalData('userLang')) self.userLang(sow.Tool.getLocalData('userLang')); // 用已知的用户语言来替换初始语言
  ko.computed(function(){ // 每当用户登录成功，就使用用户预存的语言。
    if (self.isOnline() && self.onlinePerson().info.userLang) {
      self.userLang(self.onlinePerson().info.userLang);
    }
  });
  ko.computed(function(){ 
    if (self.userLang()){ // 每当用户登录，或匿名用户选择了某种语言，
      sow.Tool.setLocalData('userLang', self.userLang()); // 就把这个语言保存到系统中，以备后用。
    }
  });

}