//'use strict'; // 严格模式应当仅限用于开发环境。在运维环境下请删除该模式。

/**
 ** Copyright: Faronear Co. Ltd. (http://www.faronear.com)
 ** Web: http://moment.faronear.com
 ** Team: Luk.Lu@faronear.org, Jojo.Wu@faronear.org, Fan.Fan@faronear.org
 ** Thanks list: Wei Wu, Jiadan Li, Weiquan Liu, Cathy Huang, Lei Xu, Andy Wu
 **/

window.mylog = function (params) {
  if (true) {
    if (sow.Tool.deviceInfo().hardware === 'desktop') {
      // 在手机的浏览器上，device.js 也返回 'mobile'，正合适，因为只有在desktop浏览器上，才能使用console.info()
      //      console.info('Typeof 《'+params+'》 = '+typeof params);
      console.info(params)
    } else {
      //      alert('Typeof 《'+params+'》 = '+typeof params);
      alert(JSON.stringify(params))
    }
  }
}

require('../static/_sow/Date.js')

window.sow = window.sow || {}
sow.Const = require('../static/_sow/Const.js')
sow.Tool = require('../static/_sow/Tool.js')
sow.modelPrototype = require('../static/_sow/modelPrototype.js')
sow.StarModel = require('../static/_sow/StarModel.js')
sow.Locale = require('../static/_sow/Locale.js')
sow.Account = require('../static/_sow/Account.js')
sow.Chat = require('../static/_sow/Chat.js')
sow.Dialog = require('../static/_sow/Dialog.js')
sow.Editor = require('../static/_sow/Editor.js')
sow.DrawScene = require('../static/_sow/DrawScene.js')
sow.Locale = require('../static/_sow/Locale')
sow.MD5 = require('../static/_sow/MD5')
require('../static/_sow/setWaterfall')
sow.UI = require('../static/_sow/UI')
sow.Uploader = require('../static/_sow/Uploader')

window.starModel = new sow.StarModel({ starVersion: '2016121400', starName: '轻时光', starCode: 'moment' })
window.accountModel = new sow.Account()
window.dialog = new sow.Dialog()

window.space = new (function (options) {
  var self = this
  this.constructor = arguments.callee
  this.__proto__ = sow.modelPrototype

  //  this.sleep = 0; // 2015-10-02 突然发现，spaceXxx里引用的是 viewModel.sleep，which doesn't exist, 但却为何一直能用？今天删除 setTimeout 再测试，也不再有从前的问题。

  this.SCENE_MEDIA_INDEX = 1
  this.SCENE_TICE_INDEX = 2
  this.SCENE_TEXT_INDEX = 3
  this.SCENE_CONFIG_INDEX = 4

  this.loginAgreement = ko.observable(false)

  self.presentLocation = new sow.Locale.Location() // html 里用到它，因此要在 starModel调用applyBinding前定义它。

  this.setModel(options)

  /* 剪贴板 */
  this.clipBoard = new Clipboard('.ShareTab')
  this.clipBoard.on('success', function (evt) {
    // evt.action/text/trigger
    dialog.showReminder({
      text:
        '地址已经拷贝到剪贴板，<br>请粘贴分享到其他应用中。<br><br><a href="' +
        self.clipBoard.shareUrl +
        '" target="_blank">' +
        self.clipBoard.shareUrl +
        '</a>',
    })
  })
  this.clipBoard.on('error', function (evt) {
    // evt.action/trigger
    // 拷贝失败时（例如在 Safari 上），evt.text 为undefined，因此不使用 evt.text 而是使用 self.clipBoard.shareUrl。
    dialog.showReminder({
      text:
        '请拷贝以下地址，<br>然后粘贴分享到其他应用中。<br><br><a href="' + self.clipBoard.shareUrl + '" target="_blank">' + self.clipBoard.shareUrl + '</a>',
      scenario: 'ALERT',
    })
  })
  this.shareMoment = function () {
    // 被点击的ShareTab是div元素，在Safari上，似乎不会自动激发click，从而也不激发clipboard，因此必须手动click一下。
    self.clipBoard.shareUrl = starModel.starUrl + '?action=VISIT_MESSAGE&aiid=' + this.moment().aiid // self是静态对象，不包含moment；而this是运行时对象，包含moment。
    $('.ShareTab').attr('data-clipboard-text', self.clipBoard.shareUrl)
  }

  /* 跟踪content/stage/scene区域尺寸 */
  // 在iPhone + Safari/Chrome上，$('.Body').height() 在启动时是 undefined，而此时）一些元素的方位设置已经需要self.bodyHeight()，造成排版错误。因此放弃，直接使用window.innerHeight。
  //  当CSS中 neckInBody==false，需要分别扣除48和36，否则从拍照切换到手绘会变形，因为resetDraw用到了getBodyHeight。
  //    return (window.innerWidth >= 721) ? (window.innerHeight-96-48-96) : (window.innerHeight-48-36-48);
  this.bodyHeight = ko.observable(window.innerWidth >= 721 ? window.innerHeight - 96 - 0 - 96 : window.innerHeight - 48 - 0 - 48)
  this.bodyWidth = ko.observable(window.innerWidth)
  $(window).resize(function () {
    self.bodyHeight(window.innerWidth >= 721 ? window.innerHeight - 96 - 0 - 96 : window.innerHeight - 48 - 0 - 48) // $('.Body').height());
    self.bodyWidth(window.innerWidth) // $('.Body').width());
  })

  /* 页面滚动到顶部/底部时的事件 */
  /*  this.scrollToBottom = ko.observable(false);
  this.scrollToTop = ko.observable(false);
  $(window).scroll(function(){
    var threshold=64;
    // document的总高度 - document在滚动条之上部分（被隐藏掉了）的高度 - 当前窗口高度 < 某个固定值，
    // 就是说，即将滚动到该document底部时，开始加载。（如果等到完全到达底部时，会感觉有停顿，所以提前一点进行预先加载。）
    var hiddenHeightBottom = $(document).height() - $(document).scrollTop() - $(window).height();
    var hiddenHeightTop = $(document).scrollTop();
    if ( ! self.scrollToBottom() && (hiddenHeightBottom >= 0 && hiddenHeightBottom < threshold)) { // 当原先不处在底部，并且现在距离底部高度小于threshold时（即向下滚动进入底部）
      self.scrollToBottom(true);
    } else if ( self.scrollToBottom() && (hiddenHeightBottom >= threshold)) { // 当原先处在底部，并且现在距离底部高度超过threshold时（即向上滚动离开底部）
      self.scrollToBottom(false);
    } else if ( ! self.scrollToTop() && hiddenHeightTop >= 0 && hiddenHeightTop < threshold) { // 向上滚动进入顶部
      self.scrollToTop(true);
    } else if ( self.scrollToTop() && hiddenHeightTop > threshold) { // 向下滚动离开顶部 
      self.scrollToTop(false);
    } else {
      self.scrollToBottom(false);
      self.scrollToTop(false);
    }
  });
*/
  /*  ko.computed(function(){
    if (self.scrollToTop()){
      sow.test('scroll to top');
    }else if (self.scrollToBottom()){
      sow.test('scroll to bottom!');
    }
  }); */

  this.sort4Timeline = function (left, right) {
    return left.aiid == right.aiid ? 0 : left.aiid > right.aiid ? -1 : 1 // mid大的(新的)排在前面
  }
  this.sort4Impression = function (left, right) {
    var leftValue = left.replyCount + left.voteGood,
      rightValue = right.replyCount + right.voteGood // 综合考虑reply和vote热度。
    return leftValue == rightValue ? 0 : leftValue > rightValue ? -1 : 1 // 大的(热门的)排在前面
  }

  accountModel.addListener('LOGIN_SUCCESS', function () {
    if (starModel.where() === 'SPACE_SHARE') {
      starModel.targetPerson(starModel.onlinePerson()) // 如果是从广场发起的登录，应当进入我的空间。
      //    spaceHome.stageNow(''); spaceHome.stageNow('STAGE_MOSET'); // 如果刚打开时，自动登录进HOME，但是 StageNow() 并没有改变，需要手工激发 // 或者：spaceHome.homeStageMosetSwiper.init();
      spaceShare.stageNow('STAGE_MOCAST') // 从共享空间的登录页面跳转出来后，不该停留在STAGE_LOGIN登录页面
    }
    spaceHome.initAboutMap()
  })

  /*
  ko.computed(function(){
    if (accountModel.accountEvent()==='RESET_PWD'){
      starModel.targetPerson(sow.Const.PERSON_UNKNOWN); // 进入广场空间
      spaceShare.stageNow('STAGE_LOGIN'); // 进入登录舞台
    }else if(accountModel.accountEvent()==='LOGIN_SUCCESS'){
      spaceHome.stageNow(''); spaceHome.stageNow('STAGE_MOSET'); // 如果刚打开时，自动登录进HOME，但是 StageNow() 并没有改变，需要手工激发 // 或者：spaceHome.homeStageMosetSwiper.init(); 
      spaceShare.stageNow('STAGE_MOCAST'); // 从共享空间的登录页面跳转出来后，不该停留在STAGE_LOGIN登录页面
      spaceHome.initAboutMap(); // 这句会造成循环不断的调用本computed。
    }
  });
*/

  this.switch2Mocast = function () {
    if (starModel.isOnline()) {
      starModel.targetPerson(sow.Const.PERSON_UNKNOWN)
      spaceShare.stageNow('STAGE_MOCAST')
    } else {
      dialog.showReminder({ text: '请注意，登录后才能发表时光哦！' })
      starModel.targetPerson(sow.Const.PERSON_UNKNOWN)
      spaceShare.stageNow('STAGE_MOCAST')
    }
  }

  /* 根据 url 进行路由 */
  this.routeUrl = function () {
    var url = sow.Tool.parseUrl(window.location.href)
    if (url.params && url.params.action) {
      switch (url.params.action) {
        case 'RESET': // 在 RESET 状态下不要autologin，否则会切换到登录后的界面去，不在reset界面。
          /* 把URL过滤到模型里。这里不检查有效性。*/
          if (url.params.uid) {
            accountModel.loginPerson().uid = url.params.uid
          }
          if (url.params.pcdUser) {
            accountModel.loginPerson().pcdUser = url.params.pcdUser
          }
          accountModel.loginPerson(accountModel.loginPerson()) // 页面已经加载完毕不会主动更新，因此需要显性激发一次变化。
          accountModel.pwdType('reset')
          //      accountModel.accountEvent('RESET_PWD');
          //      accountModel.triggerEvent('RESET_PWD'); // 激发事件，通知监听者进入重设密码状态，从而进入公众广场空间的登录界面。注意，必须在页面和模型完全建立后进行，否则spaceAll等还是空的，无法正确切换到重设密码界面。
          starModel.targetPerson(sow.Const.PERSON_UNKNOWN) // 进入SPACE_SHARE空间
          spaceShare.stageNow('STAGE_LOGIN') // 进入登录舞台
          break
        case 'ABOUT_STAR':
          starModel.targetPerson(sow.Const.PERSON_ALL)
          spaceAll.stageNow('STAGE_ABOUT')
        case 'VISIT_MESSAGE':
          if (url.params.aiid) {
            // 获取该 person，进入其空间
          }
          if (url.params.stage) {
            // 进入该 stage，时光、服务、兴趣或关于
          }
          if (url.params.aiid) {
            // 获取该 message，进入其 Owner空间，进入 STAGE_MOCUBE
            $.post(
              SOLET + 'Message_getOne',
              { Message: { aiid: url.params.aiid } },
              function (message) {
                if (message && message._class === 'Message') {
                  spaceAll.showMocube(message)
                }
              },
              'json'
            )
          }
          break
      }
    }
  }

  window.onload = sow.Tool.setWaterfall // 确保在所有图片加载之后，再进行一次瀑布流定位。有了这一句，其实很多其他setWaterfall就没有必要了，因为图片加载后总是会来一次定位的。
  $(window).resize(function () {
    setTimeout(sow.Tool.setWaterfall, 1000)
  }) // 在电脑上，有时候，resize后，瀑布流仍然保持原有的宽窄，或者滚动条遮挡住并迫使两列卡片边缘重叠，似乎是时序问题，加延时就好了，但延时50，100，200，500都还不够。

  $(document).ready(function () {
    /* swiper 3.2.5 下，iphone上，启动后经常假死在最后一个滑页上。只能手动点击Header中比如Mocast后再返回。 尝试过 starModel.targetPerson(sow.Const.PERSON_ALL); 或者 spaceAll.allStageMosetSwiper.slideTo(0)，或者在新建时设置 initialSlide:0，或者用targetPerson控制，但都不起作用。无计可施。
     * swier 3.3.1 下，iphone上，启动后经常多个slide挤在一个页面上，或者标签在第一滑页，但是内容是最后的滑页。可切换一次stage来解决。
     ***/
    /* 切换splash首页。不要立刻在document ready里切换，否则在iPhone+Safari上仍然不会稳定出现splash，或者splash切换到afterSplash中间出现空白页面的延迟。 */
    setTimeout(function () {
      document.getElementById('splash').style.opacity = 0
      document.getElementById('splash').style.zIndex = 0 // document.getElementById('afterSplash').style.opacity=1;
      // 在IPhone6S Plus上，启动后经常几个页面挤在一页里。只好重新设置一下，并且要放在setTimeout里才行，否则在Safari里经常停留在第二个Scene里。
      // 2016-12-08 在 6sp 上检查，似乎没有这个问题了。不知道是因为 knockout 升级到了 3.4.1，还是我自己改进了 autologin。
      //      spaceAll.stageNow('STAGE_ABOUT'); spaceAll.stageNow('STAGE_MOSET');
      //      spaceHome.stageNow('STAGE_ABOUT');spaceHome.stageNow('STAGE_MOSET');
      //      spaceHost.stageNow('STAGE_ABOUT');spaceHost.stageNow('STAGE_MOSET');
    }, 1000)

    accountModel.autologin(
      function (onlinePerson) {
        starModel.targetPerson(onlinePerson)
      },
      sow.voidfunc,
      self.routeUrl // always 方法发生在 success/fail 之后。// 要确保route发生在前面的 STAGE_XXX 切换之后，否则 route 结果又被换回去了。
    )

    /*** 启动路线跟踪。希望使用navigator.geolocation.watchPosition()，但实际上用BMap.geolocation更方便。
     *** 要在 doccument ready 后执行，否则watchPosition并不被调用，不知为何。因为要等BMap加载？
     ***/
    if (sow.Tool.deviceInfo().hardware === 'mobile') {
      /* 只在手机上(web或native)跟踪。*/
      self.presentLocation.getPresentLocation()
      self.presentLocation.watchPosition(
        //// 在手机应用上定位成功，在桌面或手机浏览器里总是失败。
        function (location) {
          //          $.post(SOLET+'Session_logMoveEvent', {location: self.presentLocation.getData()}, function(){}, 'json' );
        },
        function (err) {}
      )
    }

    /*    $.post(SOLET+'Message_getAppMessageSet', // 加载各种应用信息。
      {starId:starModel.starId},
      function(appMessageSet){
        if (appMessageSet && appMessageSet.news) {
          if (sow.Tool.readPath('news.content.text',appMessageSet)) dialog.showReminder({text:appMessageSet.news.content.text,scenario:'ALERT'});
        }
      },
      'json'
    );
*/
  })
})()

window.spaceShare = new (function (options) {
  var self = this
  this.constructor = arguments.callee
  this.__proto__ = space

  this.stageNow = ko.observable('STAGE_MOCAST')
  this.sceneNow = ko.observable()
  this.actionNow = ko.observable()
  this.soundNow = ko.observable('ACTION_SOUND_IDLE')
  this.videoNow = ko.observable('ACTION_VIDEO_IDLE')

  this.moment = ko.observable()
  this.moment.reset = function () {
    this({ starId: starModel.starId, tag: 'MOMENT', content: {}, cidRead: sow.Const.CID_FRIEND })
  }
  this.moment.reset()

  this.shareMap = new sow.Locale.Somap()

  this.mocastSwiper

  this.busyUploading = ko.observable(false)
  this.origImg = ko.observable(false) // 是否上传原图。桌面和手机上都默认压缩图，保持一致性。

  this.setModel(options)

  this.resizeSwiper = ko.computed(function () {
    // 很奇怪，如果把 starModel.where()=='SPACE_SHARE' 写在self.mocastSwiper的后面，那么就不会执行以下命令。
    // 只有把它写在前面，或者在if语句之前执行一次starModel.where(); 才能按照期望进行刷新。
    if (starModel.where() == 'SPACE_SHARE' && self.stageNow() == 'STAGE_MOCAST' && self.mocastSwiper) {
      // 如果在其他页面，先调整窗口，然后切换回本页，那么swiper的宽度仍然是老的，导致卡片排列错误。因为resize已经发生过时，本swiper还不显示。而且发现，如果在这里立刻调用onResize，不起作用，因此要稍等片刻。
      // [2015-10-02] 惊奇发现，原来spaceXxx里调用的viewModel.sleep不存在，应该是space.sleep（可写成 this.sleep），而且，删掉setTimeout后也不再有从前的问题。
      self.mocastSwiper.onResize() // setTimeout(function(){self.mocastSwiper.onResize();},viewModel.sleep);
    }
  })

  this.uploadProgress = function (evt) {
    if (evt.lengthComputable) {
      var percentComplete = Math.round((evt.loaded * 100) / evt.total)
      //      sow.test(percentComplete.toString()+'%');
    } else {
      //      sow.test('unable to compute progress');
    }
  }

  /** 手绘 **/
  this.drawScene = new sow.DrawScene()
  this.addDraw = function () {
    if (self.actionNow() === 'ACTION_DRAW') {
      self.actionNow(undefined)
    } else {
      self.actionNow('ACTION_DRAW')
      //      也许从原canvas上读取并重绘，以适应可能发生过的resize？
      //      self.drawScene.resizeCanvas(); // 不知为何，还是不能达到预期的效果，就是把原图迁移到resize后的canvas上，位置总是不对。
    }
  }
  this.resetDraw = function () {
    //    self.drawScene.canvas.width=self.drawScene.canvas.offsetWidth; // $('.Body').width();
    //    self.drawScene.canvas.height=self.drawScene.canvas.offsetHeight; // $('.Body').height();
    if (self.moment().content.image) {
      self.drawScene.image2canvas(SOFILE + self.moment().content.image)
    } else {
      self.drawScene.clearCanvas()
    }
  }
  this.uploadDraw = function () {
    self.drawScene.uploadImage(
      { usage: 'MESSAGE_IMAGE_INOBJ' },
      {
        busyUploading: self.busyUploading,
        onUploadDone: function (response, textstate, jqXHR) {
          if (response.filepath) {
            // 后台接收成功
            self.moment().content.image = response.filepath
            self.moment(self.moment()) // 触发拍照界面更新。
            //      dialog.showReminder({text:Locale[starModel.userLang()].dialogFeedback['UPLOAD_DONE']});
          } else if (response.result) {
            // 后台接收失败
            dialog.showReminder({ text: Locale[starModel.userLang()].dialogFeedback['UPLOAD_FAIL'], scenario: 'WARN' })
          }
        },
      }
    )
  }
  /** 不使用，因为canvas尺寸变化就重绘，导致用户手绘但未上传的图也会丢失！因此重构成，用户点击“还原”按钮时，再更新canvas尺寸，并重绘原图。
  this.updatePhoto=ko.computed(function(){  
    if (self.bodyWidth()&&self.bodyHeight() && self.moment.peek().content.image){ // todo: 看起来一切ok，但可能会有时序问题？这时能确保界面上canvas的尺寸已经调整完毕么？
      self.drawScene.image2canvas(SOFILE+self.moment.peek().content.image); // 疑问：需要先更新 drawScene.ctx 吗？
    }
  });
  **/

  /** 录音 **/
  this.player = null
  this.recorder = null
  this.addSound = function (domel) {
    //    self.actionNow('ACTION_SOUND'); // 录音是唯一特殊的action button, 依靠 soundNow 而不是 actionNow 来跟踪状态。添加这一句，虽然有备无患，但从手绘状态点击录音按钮，导致跳转回原始照片，因此不推荐使用。
    if (window.plus && self.soundNow() !== 'ACTION_SOUND_BUSY' && (self.recorder = window.plus.audio.getRecorder())) {
      self.soundNow('ACTION_SOUND_BUSY')
      //      alert(JSON.stringify(self.recorder.supportedSamplerates)+JSON.stringify(self.recorder.supportedFormats)));
      self.recorder.record(
        { filename: '_doc/audio/' }, // 还可以设置 samplerate(self.recorder.supportedSamplesrates) 和 format(self.recorder.supportedFormats): Android - 2.2+ (支持): Android平台支持"amr"、"3gp"格式，默认为"amr"。iOS - 4.5+ (支持): iOS平台支持"wav"、"aac"、"amr"格式，默认为"wav"。
        function (soundPath) {
          // alert('audio recorded: '+window.plus.io.convertLocalFileSystemURL(soundPath));
          /*          为了简单，不允许在上传结束前就试听本地录音
          self.moment().content.sound=soundPath;
          self.soundNow('ACTION_SOUND_DONE');
*/
          sow.Tool.uploadFileOnPhone(
            soundPath,
            { usage: 'MESSAGE_IMAGE_INOBJ' },
            {
              busyUploading: self.busyUploading,
              onUploadDone: self.uploadSoundDone,
              onUploadFail: self.uploadFail,
            }
          )
        },
        function (evt) {
          //          alert ( "Audio record failed: " + evt.message );
          dialog.showReminder({ text: Locale[starModel.userLang()].dialogFeedback['ACTION_SOUND_FAIL'], scenario: 'WARN' })
          self.soundNow('ACTION_SOUND_FAIL')
        }
      )
      setTimeout('spaceShare.recorder.stop()', 10000) // 默认录音10秒后停止。
    } else if (self.soundNow() !== 'ACTION_SOUND_BUSY') {
      $(sow.Tool.getNextSibling(domel)).click()
    }
  }
  this.uploadSound = function (domel) {
    sow.Tool.uploadFile(
      domel,
      { usage: 'MESSAGE_IMAGE_INOBJ' },
      { busyUploading: self.busyUploading, onUploadDone: self.uploadSoundDone, onUploadFail: self.uploadFail }
    )
  }
  this.uploadSoundDone = function (response, textStatus, jqXHR) {
    if (response.filepath) {
      // 后台接收成功
      self.moment().content.sound = response.filepath // 注意，这是相对地址，不能直接播放。
      self.moment(self.moment()) // 触发界面更新。
      self.soundNow('ACTION_SOUND_DONE')
      //      dialog.showReminder({text:Locale[starModel.userLang()].dialogFeedback['UPLOAD_DONE']});
    } else if (response.result) {
      // 后台接收失败
      self.soundNow('ACTION_SOUND_FAIL')
      dialog.showReminder({ text: Locale[starModel.userLang()].dialogFeedback['UPLOAD_FAIL'], scenario: 'WARN' })
    }
  }
  this.playSound = function () {
    if (window.plus && self.soundNow() === 'ACTION_SOUND_DONE' && (self.player = window.plus.audio.createPlayer(SOFILE + self.moment().content.sound))) {
      self.soundNow('ACTION_SOUND_BUSY')
      self.player.play(
        function () {
          self.soundNow('ACTION_SOUND_DONE')
        },
        function (evt) {
          dialog.showReminder({ text: Locale[starModel.userLang()].dialogFeedback['ACTION_SOUND_FAIL'], scenario: 'WARN' })
          self.soundNow('ACTION_SOUND_FAIL')
        }
      )
    }
  }
  this.stopSound = function () {
    if (window.plus && self.soundNow() === 'ACTION_SOUND_BUSY') {
      if (self.player) self.player.stop()
      else if (self.recorder) self.recorder.stop()
      self.soundNow('ACTION_SOUND_DONE')
    }
  }
  this.deleteSound = function () {
    if (self.soundNow() === 'ACTION_SOUND_DONE' || self.moment().content.sound) {
      self.moment().content.sound = null
      self.soundNow('ACTION_SOUND_IDLE')
    }
  }

  /** 摄像 **/
  this.addVideo = function (domel) {
    self.actionNow('ACTION_VIDEO')
    if (window.plus && window.plus.camera && self.videoNow() !== 'ACTION_VIDEO_BUSY') {
      self.videoNow('ACTION_VIDEO_BUSY')
      var videoCamera = window.plus.camera.getCamera()
      videoCamera.startVideoCapture(
        function (videoPath) {
          sow.Tool.uploadFileOnPhone(
            videoPath,
            { usage: 'MESSAGE_IMAGE_INOBJ' },
            {
              busyUploading: self.busyUploading,
              onUploadDone: self.uploadVideoDone,
              onUploadFail: self.uploadFail,
            }
          )
        },
        function (error) {
          dialog.showReminder({ text: Locale[starModel.userLang()].dialogFeedback['ACTION_VIDEO_FAIL'], scenario: 'WARN' })
          self.videoNow('ACTION_VIDEO_FAIL')
        },
        { filename: '_doc/video/' }
      )
      //      setTimeout(function(){ videoCamera.stopVideoCapture(); }, 30000); // 最多30秒后停止。实际上允许拍摄10秒，但打开镜头时，并未开始拍摄而已经开始读秒了，因此设30秒。
    } else if (self.soundNow() !== 'ACTION_VIDEO_BUSY') {
      $(sow.Tool.getNextSibling(domel)).click()
    }
  }
  this.uploadVideo = function (domel) {
    sow.Tool.uploadFile(
      domel,
      { usage: 'MESSAGE_IMAGE_INOBJ' },
      { busyUploading: self.busyUploading, onUploadDone: self.uploadVideoDone, onUploadFail: self.uploadFail }
    )
  }
  this.uploadVideoDone = function (response, textStatus, jqXHR) {
    if (response.filepath) {
      // 后台接收成功
      self.moment().content.video = response.filepath // 注意，这是相对地址，不能直接播放。
      self.moment(self.moment()) // 触发界面更新。
      self.videoNow('ACTION_VIDEO_DONE')
      //      dialog.showReminder({text:Locale[starModel.userLang()].dialogFeedback['UPLOAD_DONE']});
    } else if (response.result) {
      // 后台接收失败
      self.soundNow('ACTION_VIDEO_FAIL')
      dialog.showReminder({ text: Locale[starModel.userLang()].dialogFeedback['UPLOAD_FAIL'], scenario: 'WARN' })
    }
  }

  /** 拍照 **/
  this.addImage = function (domel) {
    // take photo and upload, or select and upload.
    self.actionNow('ACTION_PHOTO')
    if (starModel.webInfo.device.brand !== 'iphone' && window.plus && window.plus.camera) {
      sow.Tool.takePhoto(
        { usage: 'MESSAGE_IMAGE_INOBJ' },
        {
          onTakePhotoDone: self.takePhotoDone,
          onTakePhotoFail: self.takePhotoFail,
          origImg: self.origImg(),
          busyUploading: self.busyUploading,
          onUploadDone: self.uploadImageDone,
          onUploadFail: self.uploadFail,
        }
      )
    } else {
      $(sow.Tool.getNextSibling(domel)).click() // 不知为何，用getFirstChild 或 firstChild 就会在console里报错：too much recursion.
      // 或者，直接定义HTML元素ID去查找？或者，从参数里直接传入input元素？
    }
  }
  this.takePhotoDone = function (imgPath) {
    /* 2015-10-22: 其实没用，因为HTML里要用SOPIC+moment().content.image，此时的image为本地文件，加了SOPIC也地址不对。
    self.moment().content.image = imgPath;  // 更新界面. 
    self.moment(self.moment()); // 触发界面更新。
*/
  }
  this.takePhotoFail = function (errorType) {
    switch (errorType) {
      case 'TAKE_PHOTO_NOSUPPORT':
        dialog.showReminder({ text: '您的设备系统不支持拍照', scenario: 'WARN' })
        break
      case 'TAKE_PHOTO_FAIL':
      default:
        dialog.showReminder({ text: '拍照发生意外，请再试一次', scenario: 'WARN' })
        break
    }
  }
  this.uploadImage = function (domel) {
    sow.Tool.uploadFile(
      domel,
      { usage: 'MESSAGE_IMAGE_INOBJ' },
      { busyUploading: self.busyUploading, onUploadDone: self.uploadImageDone, onUploadFail: self.uploadFail, onUploadProgress: self.uploadProgress }
    )
  }
  this.uploadImageDone = function (response, textStatus, jqXHR) {
    if (response.filepath) {
      // 后台接收成功
      self.moment().content.image = response.filepath
      self.moment(self.moment()) // 触发拍照界面更新。
      self.resetDraw() // self.drawScene.image2canvas(SOFILE+self.moment().content.image); // 绘制到canvas上。resetDraw()比单纯image2canvas能自适应之前可能发生过的resize。
      //      dialog.showReminder({text:Locale[starModel.userLang()].dialogFeedback['UPLOAD_DONE']});
    } else if (response.result) {
      // 后台接收失败
      /*      switch (response.result) {
        case 'OVERSIZED': sow.test('图片太大了。请重新上传！'); break;
        case 'BadExt': sow.test('平台不支持的文件格式。请重新上传！'); break;
        case 'MoveFailed': sow.test('文件拷贝失败。'); break;
        case 'PARTIAL': sow.test('只有部分文件内容被上传。'); break;
        case 'NO_FILE': sow.test('没有文件被上传'); break;
        case 'ZERO_SIZE': sow.test('上传文件无内容！'); break;
        case 'FAILED': 
        default: sow.test('真抱歉，这次上传没有成功，错误未知，请联系我们来解决问题！'); break;
      };  */
      dialog.showReminder({ text: Locale[starModel.userLang()].dialogFeedback['UPLOAD_FAIL'], scenario: 'WARN' })
    }
    //    self.busyUploading(false);
  }
  this.uploadFail = function (errorType) {
    // 前端上传失败。
    switch (errorType) {
      case 'UPLOAD_OVERSIZED':
        dialog.showReminder({ text: '太大了，不能上传', scenario: 'WARN' })
        break
      case 'UPLOAD_BADEXT':
        dialog.showReminder({ text: '格式不对', scenario: 'WARN' })
        break
      case 'UPLOAD_NOSUPPORT':
        dialog.showReminder({ text: '您的设备系统不支持上传', scenario: 'WARN' })
        break
      case 'UPLOAD_FAIL':
      default:
        dialog.showReminder({ text: '上传发生意外，请再试一次', scenario: 'WARN' })
        break
    }
  }

  /** 最终发表 **/
  this.submitMoment = function () {
    if (starModel.isOnline()) {
      self.moment().cidReply = self.moment().cidRead
      switch (self.moment().cidRead) {
        case sow.Const.CID_SELF:
          self.moment().cidRefer = sow.Const.CID_NONE
          break // 只有我自己能阅读时，转帖没有意思。
        case sow.Const.CID_FRIEND:
          self.moment().cidRefer = sow.Const.CID_SELF
          break // 朋友可以阅读时，允许我自己转帖，以引入新朋友。
        case sow.Const.CID_IMPACT:
          self.moment().cidRefer = sow.Const.CID_IMPACT
          break
        case sow.Const.CID_PUBLIC:
          self.moment().cidRefer = sow.Const.CID_PUBLIC
          break
        default:
          self.moment().cidRefer = self.moment().cidRead
      }
      //    sow.test('imageSize='+self.drawScene.imageSize);
      //    sow.test('canvasSize='+self.drawScene.canvas.toDataURL().length);
      /* 如果手绘canvas尺寸发生了变动，就默认为用户有新的手绘尚未保存，因此先保存再提交时光。 */
      if (self.drawScene.imageSize != self.drawScene.canvas.toDataURL().length) {
        self.drawScene.uploadImage(
          { usage: 'MESSAGE_IMAGE_INOBJ' },
          {
            busyUploading: self.busyUploading,
            onUploadDone: function (response, textstate, jqXHR) {
              if (response.filepath) {
                // 后台接收成功
                self.moment().content.image = response.filepath
                //              self.moment(self.moment()); // 触发拍照界面更新。
                //              dialog.showReminder({text:Locale[starModel.userLang()].dialogFeedback['UPLOAD_DONE']});
                self.insertMoment()
              } else if (response.result) {
                // 后台接收失败
                dialog.showReminder({ text: Locale[starModel.userLang()].dialogFeedback['UPLOAD_FAIL'], scenario: 'WARN' })
              }
            },
          }
        )
      } else if (!$.isEmptyObject(self.moment().content)) {
        // 确定用户提供了数据，否则不要提交。 -- [todo] 是否支持用户仅仅留下一个“脚印、心跳”？不留言，不拍照，只有时空记录。
        self.insertMoment()
      } else {
        dialog.showReminder({ text: Locale[starModel.userLang()].dialogFeedback['SUBMIT_MOMENT_EMPTY'], scenario: 'WARN' })
      }
    } else {
      dialog.showReminder({ text: '请先登录，即可发表时光！' })
      starModel.targetPerson(sow.Const.PERSON_UNKNOWN)
      spaceShare.stageNow('STAGE_LOGIN')
    }
  }
  this.insertMoment = function () {
    self.moment().location = space.presentLocation.getData() //// [todo] address尚无内容。
    //    if (self.moment().content.text) { self.moment().content.text=encodeURIComponent(self.moment().content.text); } // 发现，移动端无法提交笑脸字符到数据库，因为iOS/Android的笑脸字符是4个字节的UTF8，而mysql的utf8只支持3字节。解决方案：可以在JS里encodeURICompoment，或者在后台PHP urlencode，再插入数据库。或者最好的，直接调整 mysql 的默认字符集 utf8 为 utf8mb4
    $.post(
      SOLET + 'Message_addOne',
      { Message: self.moment() },
      function (message) {
        if (message && message._class === 'Message') {
          self.moment.reset() // self.moment({starId:starModel.starId, content:{}, cidRead:sow.Const.CID_FRIEND}); // 重置待新建的moment
          self.drawScene.clearCanvas() // 清空画板
          dialog.showReminder({ text: Locale[starModel.userLang()].dialogFeedback['SUBMIT_MOMENT_DONE'] })
          if (starModel.isOnline()) {
            if (spaceHome.momentSet4Timeline().length > 0) spaceHome.momentSet4Timeline.unshift(message)
            else spaceHome.momentSet4Timeline([message])
            if (spaceHome.momentSet4Impression().length > 0) spaceHome.momentSet4Impression.push(message)
            else spaceHome.momentSet4Impression([message])
            starModel.targetPerson(starModel.onlinePerson())
            spaceHome.stageNow('STAGE_MOSET')
          } else {
            starModel.targetPerson(sow.Const.PERSON_ALL)
            spaceAll.stageNow('STAGE_MOSET')
          }
          /* 不论是否在线，总是需要把新时光加入广场 */
          if (spaceAll.momentSet4Timeline().length > 0) spaceAll.momentSet4Timeline.unshift(message)
          else spaceAll.momentSet4Timeline([message])
          if (spaceAll.momentSet4Impression().length > 0) spaceAll.momentSet4Impression.push(message)
          else spaceAll.momentSet4Impression([message])
        } else {
          dialog.showReminder({ text: Locale[starModel.userLang()].dialogFeedback['SUBMIT_MOMENT_FAIL'], scenario: 'WARN' })
        }
      },
      'json'
    )
  }
})()

window.spaceAll = new (function (options) {
  var self = this
  this.constructor = arguments.callee
  this.__proto__ = space

  this.stageNow = ko.observable('STAGE_MOSET')
  this.sceneNow = ko.observable()

  //  this.momentSet = ko.observableArray([]);
  this.momentSet4Timeline = ko.observableArray([])
  this.momentSet4Impression = ko.observableArray([])

  this.allStageMosetSwiper = null
  this.allStageAboutSwiper = null

  this.busyAppending = ko.observable(false)
  this.busyRefreshing = ko.observable(false)

  this.setModel(options)

  this.resizeSwiper = ko.computed(function () {
    if (starModel.where() == 'SPACE_ALL' && self.stageNow() == 'STAGE_MOSET' && self.allStageMosetSwiper) {
      self.allStageMosetSwiper.onResize()
      setTimeout(sow.Tool.setWaterfall, 1000)
    } else if (starModel.where() == 'SPACE_ALL' && self.stageNow() == 'STAGE_ABOUT' && self.allStageAboutSwiper) self.allStageAboutSwiper.onResize()
  })

  this.commentSet = ko.observableArray([])
  this.comment = ko.observable()
  this.comment.reset = function () {
    this({ content: {}, starId: starModel.starId, tag: 'COMMENT', agentId: sow.Const.PERSON_ALL.aiid, agentClass: 'Org' })
  }
  this.comment.reset()
  this.addComment = function () {
    if (self.comment().content.text) {
      // 不需要已经登录。
      self.comment().ownerSid = starModel.onlinePerson().aiid
      //      self.comment().content.text=encodeURIComponent(self.comment().content.text);
      $.post(
        SOLET + 'Message_addOne',
        { Message: self.comment() },
        function (comment) {
          if (comment && comment._class === 'Message') {
            self.comment.reset() // self.comment({tag:'MT_REPLY', content:{}}); // 重置
            if (self.commentSet().length > 0) self.commentSet.unshift(comment)
            else if (self.commentSet().length === 0) self.commentSet([comment])
            //            dialog.showReminder({text:Locale[starModel.userLang()].dialogFeedback['SUBMIT_REPLY_DONE']});
          } else {
            dialog.showReminder({ text: Locale[starModel.userLang()].dialogFeedback['SUBMIT_REPLY_FAIL'], scenario: 'WARN' })
          }
        },
        'json'
      )
    } else {
      dialog.showReminder({ text: Locale[starModel.userLang()].dialogFeedback['SUBMIT_REPLY_EMPTY'], scenario: 'WARN' })
    }
  }
  this.getCommentSet = function () {
    $.post(
      SOLET + 'Message_getAll',
      {
        Message: { starId: starModel.starId, tag: 'COMMENT', agentId: sow.Const.PERSON_ALL.aiid, agentClass: 'Org' },
        config: { limit: 10, order: 'whenInserted DESC' },
      },
      function (result) {
        if (result && result.length > 0) {
          self.commentSet(result)
        }
      },
      'json'
    )
  }

  this.showMocube = function (moment, event) {
    if (starModel.isOnline() && moment._data.owner.aiid == starModel.onlinePerson().aiid) {
      starModel.targetPerson(starModel.onlinePerson())
      spaceHome.showMocube(moment)
    } else {
      starModel.targetPerson(moment._data.owner) // 切换到第三者空间，从而自动引发加载第三方的momentSet
      spaceHost.showMocube(moment) // 并且立刻显示mocube。
    }
  }
  this.fillMomentSet = function () {
    $.post(
      SOLET + 'Message_getAll',
      { Message: { starId: starModel.starId, tag: 'MOMENT' }, config: { limit: 10, order: 'whenInserted DESC' } }, // 不要用 starModel.targetPerson()，似乎因为 isOnline 执行比 starModel.where 快，所以很可能此时targetPerson()仍然是广场。
      function (momentSet) {
        if (momentSet && momentSet.length > 0) {
          //            sow.Tool.setSessionData('momentSet4Timeline', momentSet);
          self.momentSet4Timeline(momentSet)
        }
      },
      'json'
    )
    $.post(
      SOLET + 'Message_getAll',
      { Message: { starId: starModel.starId, tag: 'MOMENT' }, config: { limit: 10, order: '`voteGood`+`replyCount` DESC' } },
      function (momentSet) {
        if (momentSet && momentSet.length > 0) {
          //            sow.Tool.setSessionData('momentSet4Impression', momentSet);
          self.momentSet4Impression(momentSet)
          sow.Tool.setWaterfall()
        }
      },
      'json'
    )
  }
  this.refreshTimeline = function () {
    self.busyRefreshing(true)
    $.post(
      SOLET + 'Message_getAll',
      {
        Message: {
          starId: starModel.starId,
          tag: 'MOMENT',
          whenInserted: '>' + (self.momentSet4Timeline()[0] ? self.momentSet4Timeline()[0].whenInserted : '00-00-00 00:00:00'),
        },
        config: { limit: 10, order: 'whenInserted DESC' },
      },
      function (newMomentSet) {
        if (newMomentSet && newMomentSet.length > 0) {
          //          sow.Tool.setSessionData('momentSet4Timeline', newMomentSet.concat(self.momentSet4Timeline()));
          self.momentSet4Timeline(newMomentSet.concat(self.momentSet4Timeline()))
        }
      },
      'json'
    ).always(function () {
      self.busyRefreshing(false)
    })
  }
  //  this.autoRefresh=ko.computed(function(){
  //    if (starModel.where()==='SPACE_ALL'){  // 每当切换回PUB空间时，查询新时光。
  //      self.refreshTimeline();
  //    }
  //  });
  this.appendTimeline = function () {
    self.busyAppending(true)
    $.post(
      SOLET + 'Message_getAll',
      {
        Message: {
          starId: starModel.starId,
          tag: 'MOMENT',
          whenInserted:
            '<' + (self.momentSet4Timeline().length > 0 ? self.momentSet4Timeline()[self.momentSet4Timeline().length - 1].whenInserted : '00-00-00 00:00:00'),
        },
        config: { limit: 10, order: 'whenInserted DESC' },
      },
      function (oldMomentSet) {
        if (oldMomentSet && oldMomentSet.length > 0) {
          //          sow.Tool.setSessionData('momentSet4Timeline', self.momentSet4Timeline().concat(oldMomentSet));
          self.momentSet4Timeline(self.momentSet4Timeline().concat(oldMomentSet))
        }
      },
      'json'
    ).always(function () {
      self.busyAppending(false)
    })
  }
  this.refreshImpression = function () {}
  this.appendImpression = function () {
    self.busyAppending(true)
    $.post(
      SOLET + 'Message_getAll',
      {
        Message: { starId: starModel.starId, tag: 'MOMENT' },
        config: { limit: self.momentSet4Impression().length + ',10', order: '`voteGood`+`replyCount` DESC' },
      }, // todo: 还要防止，中间有新消息加入，以至于分页结果有重合。
      function (coldMomentSet) {
        if (coldMomentSet && coldMomentSet.length > 0) {
          //        sow.Tool.setSessionData('momentSet4Impression', self.momentSet4Impression().concat(coldMomentSet));
          self.momentSet4Impression(self.momentSet4Impression().concat(coldMomentSet))
          sow.Tool.setWaterfall()
          setTimeout(sow.Tool.setWaterfall, 2000)
        }
      },
      'json'
    ).always(function () {
      self.busyAppending(false)
    })
  }

  $(document).ready(function () {
    self.getCommentSet()
    self.fillMomentSet() // 初始化加载时光集。
  })
})()

window.spaceHome = new (function (options) {
  var self = this
  this.constructor = arguments.callee
  this.__proto__ = space

  this.stageNow = ko.observable('STAGE_MOSET')
  this.sceneNow = ko.observable()

  this.pickingAddress = ko.observable(false)

  //  this.momentSet = ko.observableArray([]);
  this.momentSet4Timeline = ko.observableArray([])
  this.momentSet4Impression = ko.observableArray([])
  this.moment = ko.observable()
  this.moment.reset = function () {
    this({ _data: { owner: {} }, content: {}, starId: starModel.starId, tag: 'MOMENT' })
  }
  this.moment.reset()

  this.homeLocation = new sow.Locale.Location()

  this.aboutMap = new sow.Locale.Somap()
  this.mocubeMap = new sow.Locale.Somap()

  this.homeStageMosetSwiper
  this.homeStageAboutSwiper
  this.homeStageMocubeSwiper

  this.busyUploading = ko.observable(false)
  this.origImg = ko.observable(false) // 是否上传原图。桌面和手机上都首选压缩图，保持一致性。

  this.replySet = ko.observableArray([])
  this.reply = ko.observable()
  this.reply.reset = function () {
    this({ starId: starModel.starId, tag: 'MT_REPLY', content: {} })
  }
  this.reply.reset()

  this.busyAppending = ko.observable(false)
  this.busyRefreshing = ko.observable(false)

  this.setModel(options)

  this.initAboutMap = function () {
    if (starModel.onlinePerson().location.computedAddress) {
      // 如果用户已经确认了地址，存放在了后台
      self.aboutMap.showLocation(starModel.onlinePerson().location)
      self.aboutMap.markLocation(starModel.onlinePerson().location, 'image/LocationTarget.png')
      self.homeLocation.loadData(starModel.onlinePerson().location)
      //      self.homeLocation.fillAddress(); // todo: 不需要从后台 fill 应当在前端 load
    } else {
      // 用户尚未亲自确认，那么自动定位。
      self.aboutMap.showPresentLocation() // 在这里不起作用，放到HTML中就可以。2016-05-09: 何出此言？
      self.homeLocation.getPresentLocation()
    }
  }

  this.resizeSwiper = ko.computed(function () {
    if (starModel.where() == 'SPACE_HOME' && self.stageNow() == 'STAGE_MOSET' && self.homeStageMosetSwiper) {
      self.homeStageMosetSwiper.onResize()
      setTimeout(sow.Tool.setWaterfall, 1000)
    } else if (starModel.where() == 'SPACE_HOME' && self.stageNow() == 'STAGE_MOCUBE' && self.homeStageMocubeSwiper) self.homeStageMocubeSwiper.onResize()
    else if (starModel.where() == 'SPACE_HOME' && self.stageNow() == 'STAGE_ABOUT' && self.homeStageAboutSwiper) self.homeStageAboutSwiper.onResize()
  })

  this.confirmLogout = function () {
    dialog.showDialog({ text: '真的要退出登录吗？<br>退出后，许多功能不能使用哦！', scenario: 'LOGOUT', onConfirm: accountModel.logout })
  }
  accountModel.addListener('LOGOUT_SUCCESS', function () {
    // 或者重新定义logout函数, 直接调用 accountModel.logout, 再执行清空。但会不会有这种情况：这时其实isOnline()仍然成立，从而momentSet4Xxx的变化导致自动调用fillMomentSet? 因此还是用addListener安全。
    dialog.cancelDialog()
    self.momentSet4Timeline([])
    self.momentSet4Impression([])
    self.moment.reset()
    self.replySet([])
    self.reply.reset()
  })

  this.fillMomentSet = ko.computed(function () {
    if (starModel.isOnline()) {
      // 每次成功登录后，加载我的时光。
      $.post(
        SOLET + 'Message_getAll',
        {
          Message: { starId: starModel.starId, tag: 'MOMENT', ownerSid: starModel.onlinePerson.peek().aiid },
          config: { limit: 10, order: 'whenInserted DESC' },
        }, // 不要用 starModel.targetPerson()，似乎因为 isOnline 执行比 starModel.where 快，所以很可能此时targetPerson()仍然是广场。
        // 用 peek，避免因为 updateAbout 而重置 onlinePerson 导致连锁调用 fillMomentSet()
        function (momentSet) {
          if (momentSet && momentSet.length > 0) {
            self.momentSet4Timeline(momentSet)
          }
        },
        'json'
      )
      $.post(
        SOLET + 'Message_getAll',
        {
          Message: { starId: starModel.starId, tag: 'MOMENT', ownerSid: starModel.onlinePerson.peek().aiid },
          config: { limit: 10, order: '`voteGood`+`replyCount` DESC' },
        },
        function (momentSet) {
          if (momentSet && momentSet.length > 0) {
            self.momentSet4Impression(momentSet)
            sow.Tool.setWaterfall()
          }
        },
        'json'
      )
    }
  })
  this.refreshTimeline = function () {
    self.busyRefreshing(true)
    $.post(
      SOLET + 'Message_getAll',
      {
        Message: {
          starId: starModel.starId,
          tag: 'MOMENT',
          ownerSid: starModel.onlinePerson().aiid,
          whenInserted: '>' + (self.momentSet4Timeline()[0] ? self.momentSet4Timeline()[0].whenInserted : '00-00-00 00:00:00'),
        },
        config: { limit: 10, order: 'whenInserted DESC' },
      },
      function (newMomentSet) {
        if (newMomentSet && newMomentSet.length > 0) {
          //          sow.Tool.setSessionData('momentSet4Timeline', newMomentSet.concat(self.momentSet4Timeline()));
          self.momentSet4Timeline(newMomentSet.concat(self.momentSet4Timeline()))
        }
      },
      'json'
    ).always(function () {
      self.busyRefreshing(false)
    })
  }
  this.appendTimeline = function () {
    self.busyAppending(true)
    $.post(
      SOLET + 'Message_getAll',
      {
        Message: {
          starId: starModel.starId,
          tag: 'MOMENT',
          ownerSid: starModel.onlinePerson().aiid,
          whenInserted:
            '<' + (self.momentSet4Timeline().length > 0 ? self.momentSet4Timeline()[self.momentSet4Timeline().length - 1].whenInserted : '00-00-00 00:00:00'),
        },
        config: { limit: 10, order: 'whenInserted DESC' },
      },
      function (oldMomentSet) {
        if (oldMomentSet && oldMomentSet.length > 0) {
          //          sow.Tool.setSessionData('momentSet4Timeline', self.momentSet4Timeline().concat(oldMomentSet));
          self.momentSet4Timeline(self.momentSet4Timeline().concat(oldMomentSet))
        }
      },
      'json'
    ).always(function () {
      self.busyAppending(false)
    })
  }
  this.refreshImpression = function () {}
  this.appendImpression = function () {
    self.busyAppending(true)
    $.post(
      SOLET + 'Message_getAll',
      {
        Message: { starId: starModel.starId, tag: 'MOMENT', ownerSid: starModel.onlinePerson().aiid },
        config: { limit: self.momentSet4Impression().length + ',10', order: '`voteGood`+`replyCount` DESC' },
      }, // todo: 还要防止，中间有新消息加入，以至于分页结果有重合。
      function (coldMomentSet) {
        if (coldMomentSet && coldMomentSet.length > 0) {
          //          sow.Tool.setSessionData('momentSet4Impression', self.momentSet4Impression().concat(coldMomentSet));
          self.momentSet4Impression(self.momentSet4Impression().concat(coldMomentSet))
          sow.Tool.setWaterfall()
          setTimeout(sow.Tool.setWaterfall, 2000)
        }
      },
      'json'
    ).always(function () {
      self.busyAppending(false)
    })
  }
  this.showMocube = function (moment, event) {
    self.moment(moment)
    self.replySet([])
    self.getReplySet()
    //spaceHome.stageNow('');
    self.stageNow('STAGE_MOCUBE')
    if (self.moment().content.image || self.moment().content.video || self.moment().content.sound) self.homeStageMocubeSwiper.slideTo(space.SCENE_MEDIA_INDEX)
    else if (self.moment().content.text) self.homeStageMocubeSwiper.slideTo(space.SCENE_TEXT_INDEX)
    else self.homeStageMocubeSwiper.slideTo(space.SCENE_TICE_INDEX)
    self.mocubeMap.showLocation(moment.location) // [todo] 应当记录原时光的详细程度，是定位还是定城市，来决定这里的显示级别。
    self.mocubeMap.markLocation(moment.location, 'image/LocationTarget.png')
  }

  this.addImage = function (domel) {
    // 对头像，要特殊对待，默认是直接上传文件，而不是当场拍摄照片。
    //    if (starModel.webInfo.device.brand!=='iphone' && window.plus && window.plus.camera) {
    //      sow.Tool.takePhoto({usage:'MESSAGE_IMAGE_INOBJ'}, {onTakePhotoDone:self.takePhotoDone, onTakePhotoFail:self.takePhotoFail, origImg:self.origImg(), busyUploading:self.busyUploading, onUploadDone:self.uploadImageDone, onUploadFail:self.uploadFail} );
    //    }else{
    $(sow.Tool.getNextSibling(domel)).click()
    //    }
  }
  /*  this.takePhotoDone=function(imgPath){
  };
  this.takePhotoFail=function(errorType){
    switch (errorType) {
      case 'TAKE_PHOTO_NOSUPPORT': dialog.showReminder({text:'您的设备系统不支持拍照',scenario:'WARN'}); break;
      case 'TAKE_PHOTO_FAIL': 
      default: dialog.showReminder({text:'拍照发生意外，请再试一次',scenario:'WARN'}); break;
    }
  };
*/
  this.uploadImage = function (domel) {
    sow.Tool.uploadFile(
      domel,
      { usage: 'PERSON_ICON' },
      { busyUploading: self.busyUploading, onUploadDone: self.uploadImageDone, onUploadFail: self.uploadFail, onUploadProgress: self.uploadProgress }
    )
  }
  this.uploadProgress = function (evt) {
    if (evt.lengthComputable) {
      var percentComplete = Math.round((evt.loaded * 100) / evt.total)
      //      sow.test(percentComplete.toString()+'%');
    } else {
      //      sow.test('unable to compute progress');
    }
  }
  this.uploadImageDone = function (response, textStatus, jqXHR) {
    if (response.filepath) {
      starModel.onlinePerson().icon = response.filepath
      starModel.onlinePerson(starModel.onlinePerson()) // onlinePerson内部的数据变化，不能自动连锁反应，需要手工重设onlinePerson。
    } else if (response.result) {
      /*      switch (response.result) {
        case 'OVERSIZED': sow.test('图片太大了，要小于1M。请重新上传！'); break;
        case 'BadExt': sow.test('平台不支持的文件格式。请重新上传！'); break;
        case 'MoveFailed': sow.test('文件拷贝失败。'); break;
        case 'PARTIAL': sow.test('只有部分文件内容被上传。'); break;
        case 'NO_FILE': sow.test('没有文件被上传'); break;
        case 'ZERO_SIZE': sow.test('上传文件无内容！'); break;
        case 'FAILED': 
        default: sow.test('真抱歉，这次上传没有成功，错误未知，请联系我们来解决问题！'); break;
      }; */
      dialog.showReminder({ text: Locale[starModel.userLang()].dialogFeedback['UPLOAD_FAIL'], scenario: 'WARN' })
    }
    //    self.busyUploading(false);
  }
  this.uploadFail = function (errorType) {
    // 前端上传失败。
    switch (errorType) {
      case 'UPLOAD_OVERSIZED':
        dialog.showReminder({ text: '太大了，不能上传', scenario: 'WARN' })
        break
      case 'UPLOAD_BADEXT':
        dialog.showReminder({ text: '格式不对', scenario: 'WARN' })
        break
      case 'UPLOAD_NOSUPPORT':
        dialog.showReminder({ text: '您的设备系统不支持上传', scenario: 'WARN' })
        break
      case 'UPLOAD_FAIL':
      default:
        dialog.showReminder({ text: '上传发生意外，请再试一次', scenario: 'WARN' })
        break
    }
  }

  this.updateAbout = function () {
    if (starModel.isOnline()) {
      // 用户资料的change事件绑定到本函数，所以onlinePerson模型建立时，每条用户资料的赋值，都导致调用一次，哪怕尚未登录，即试图去更新匿名用户。因此在这里过滤。
      // todo: 检查数据有效性。因为界面change事件直接绑定到本函数，哪怕某input被改得不符合要求格式，也会激发change，然后被送往后台。
      // 另外，如果界面上清空某input，导致其绑定的onlinePerson().xxx=''，送到后台不会被设置，从而原有数据仍然保留。要确保清空，需要在这里显性设为NULL或null。
      if (sow.Tool.typeofUid(starModel.onlinePerson().email) != 'email') {
        // 不符合格式
        starModel.onlinePerson().email = undefined // 不修改后台
      }
      if (sow.Tool.typeofUid(starModel.onlinePerson().callNumber) != 'callNumber') {
        // 不符合格式
        starModel.onlinePerson().callNumber = ''
        starModel.onlinePerson().phone = undefined // 不修改后台
      } // 符合格式
      else {
        starModel.onlinePerson().phone = starModel.onlinePerson().countryCode + starModel.onlinePerson().callNumber
      }
      $.post(
        SOLET + 'Person_setOne',
        { Person: starModel.onlinePerson() },
        function (result) {
          if (result) {
            starModel.onlinePerson(starModel.onlinePerson()) // 确保更新界面上绑定到onlinePerson的数据。
          }
        },
        'json'
      )
      // todo: 注意，如果新输入的email/phone在后台已经存在，那么update也返回false。需要改进，给用户提示。
    }
  }
  this.updateHomeLocation = function () {
    if (self.homeLocation.computedAddress() !== starModel.onlinePerson().location.computedAddress) {
      // todo: move map.
      self.homeLocation.addressSource = 'userPicked'
      self.homeLocation.address2position(function (location) {
        starModel.onlinePerson().location = self.homeLocation.getData()
        self.aboutMap.showLocation(starModel.onlinePerson().location)
        self.aboutMap.markLocation(starModel.onlinePerson().location, 'image/LocationTarget.png')
        $.post(
          SOLET + 'Person_setOne',
          { Person: starModel.onlinePerson() },
          function (result) {
            if (result) {
              starModel.onlinePerson(starModel.onlinePerson()) // 确保更新界面上绑定到onlinePerson的数据。
            }
          },
          'json'
        )
      })
    }
  }

  this.getReplySet = function () {
    if (self.moment()) {
      //      self.replySet([]);
      $.post(
        SOLET + 'Message_getReplyMessageSet',
        { Message: self.moment() },
        function (messageSet) {
          if (messageSet && messageSet.length > 0) {
            self.replySet(messageSet)
          }
        },
        'json'
      )
    }
  }
  this.addReply = function () {
    if (self.reply().content.text) {
      // 既然在home里，那么肯定已经登录了。
      self.reply().ownerSid = starModel.onlinePerson().aiid
      //      self.reply().content.text=encodeURIComponent(self.reply().content.text);
      $.post(
        SOLET + 'Message_reply',
        { Message: self.reply(), sourceMessage: self.moment() },
        function (reply) {
          if (reply && reply.aiid != null) {
            self.reply.reset() // 重置
            if (self.replySet().length > 0) self.replySet.unshift(reply)
            else if (self.replySet().length === 0) self.replySet([reply])
            //            dialog.showReminder({text:Locale[starModel.userLang()].dialogFeedback['SUBMIT_REPLY_DONE']});
            self.moment().replyCount++ // self.moment()._data.replyCount++;
            self.moment(self.moment())
            var mset = self.momentSet4Impression()
            mset.sort(self.sort4Impression)
            self.momentSet4Impression([])
            self.momentSet4Impression(mset) // 重新排序并刷新卡片上读数。
            var mset = spaceAll.momentSet4Impression()
            mset.sort(spaceAll.sort4Impression)
            spaceAll.momentSet4Impression([])
            spaceAll.momentSet4Impression(mset) // 重新排序并刷新卡片上读数。
            //            self.momentSet4Impression(self.momentSet4Impression().sort(self.sort4Impression)); // 这样只能重新排序，不会刷新卡片上读数。
          } else {
            dialog.showReminder({ text: Locale[starModel.userLang()].dialogFeedback['SUBMIT_REPLY_FAIL'], scenario: 'WARN' })
          }
        },
        'json'
      )
    } else if (!self.reply().content.text) {
      dialog.showReminder({ text: Locale[starModel.userLang()].dialogFeedback['SUBMIT_REPLY_EMPTY'], scenario: 'WARN' })
    }
  }
})()

window.spaceHost = new (function (options) {
  var self = this
  this.constructor = arguments.callee
  this.__proto__ = space

  this.stageNow = ko.observable('STAGE_MOSET')
  this.sceneNow = ko.observable()

  //  this.momentSet = ko.observableArray([]);
  this.momentSet4Timeline = ko.observableArray([])
  this.momentSet4Impression = ko.observableArray([])
  this.moment = ko.observable()
  this.moment.reset = function () {
    this({ _data: { owner: {}, vote: { vtid: '' } }, content: {}, starId: starModel.starId, tag: 'MOMENT' })
  }
  this.moment.reset()

  this.mocubeMap = new sow.Locale.Somap()
  this.aboutMap = new sow.Locale.Somap()

  this.hostStageMosetSwiper
  this.hostStageChatSwiper
  this.hostStageAboutSwiper
  this.hostStageMocubeSwiper

  this.replySet = ko.observableArray([])
  this.reply = ko.observable()
  this.reply.reset = function () {
    this({ starId: starModel.starId, tag: 'MT_REPLY', content: {} })
  }
  this.reply.reset()
  this.replySubmitted = ko.observable()

  this.busyAppending = ko.observable(false)
  this.busyRefreshing = ko.observable(false)

  this.setModel(options)

  this.initAboutMap = ko.computed(function () {
    if (starModel.targetPerson().location.computedAddress) {
      // 如果用户已经确认了地址，存放在了后台
      self.aboutMap.showLocation(starModel.targetPerson().location)
      self.aboutMap.markLocation(starModel.targetPerson().location, 'image/LocationTarget.png')
    } else {
      // 用户尚未亲自确认，那么定位到整个中国。
      self.aboutMap.showLocation({ computedAddress: '中国' }, self.aboutMap.ZoomLevel.COUNTRY)
    }
  })

  this.resizeSwiper = ko.computed(function () {
    if (starModel.where() == 'SPACE_HOST' && self.stageNow() == 'STAGE_MOSET' && self.hostStageMosetSwiper) {
      self.hostStageMosetSwiper.onResize()
      setTimeout(sow.Tool.setWaterfall, 1000)
    } else if (starModel.where() == 'SPACE_HOST' && self.stageNow() == 'STAGE_MOCUBE' && self.hostStageMocubeSwiper) self.hostStageMocubeSwiper.onResize()
    else if (starModel.where() == 'SPACE_HOST' && self.stageNow() == 'STAGE_ABOUT' && self.hostStageAboutSwiper) self.hostStageAboutSwiper.onResize()
  })

  this.fillMomentSet = ko.computed(function () {
    if (starModel.where() === 'SPACE_HOST') {
      // 每次切换到第三者空间，通常都意味着一个新的第三者空间，重新加载。
      $.post(
        SOLET + 'Message_getAll',
        {
          Message: { starId: starModel.starId, tag: 'MOMENT', ownerSid: starModel.targetPerson.peek().aiid },
          config: { limit: 10, order: 'whenInserted DESC' },
        },
        function (momentSet) {
          if (momentSet && momentSet.length > 0) {
            self.momentSet4Timeline(momentSet)
          }
        },
        'json'
      )
      $.post(
        SOLET + 'Message_getAll',
        {
          Message: { starId: starModel.starId, tag: 'MOMENT', ownerSid: starModel.targetPerson.peek().aiid },
          config: { limit: 10, order: '`voteGood`+`replyCount` DESC' },
        },
        function (momentSet) {
          if (momentSet && momentSet.length > 0) {
            self.momentSet4Impression(momentSet)
            sow.Tool.setWaterfall()
          }
        },
        'json'
      )
    }
  })
  this.refreshTimeline = function () {
    self.busyRefreshing(true)
    $.post(
      SOLET + 'Message_getAll',
      {
        Message: {
          starId: starModel.starId,
          tag: 'MOMENT',
          ownerSid: starModel.targetPerson().aiid,
          whenInserted: '>' + (self.momentSet4Timeline()[0] ? self.momentSet4Timeline()[0].whenInserted : '00-00-00 00:00:00'),
        },
        config: { limit: 10, order: 'whenInserted DESC' },
      },
      function (newMomentSet) {
        if (newMomentSet && newMomentSet.length > 0) {
          //          sow.Tool.setSessionData('momentSet4Timeline', newMomentSet.concat(self.momentSet4Timeline()));
          self.momentSet4Timeline(newMomentSet.concat(self.momentSet4Timeline()))
        }
      },
      'json'
    ).always(function () {
      self.busyRefreshing(false)
    })
  }
  this.appendTimeline = function () {
    self.busyAppending(true)
    $.post(
      SOLET + 'Message_getAll',
      {
        Message: {
          starId: starModel.starId,
          tag: 'MOMENT',
          ownerSid: starModel.targetPerson().aiid,
          whenInserted:
            '<' + (self.momentSet4Timeline().length > 0 ? self.momentSet4Timeline()[self.momentSet4Timeline().length - 1].whenInserted : '00-00-00 00:00:00'),
        },
        config: { limit: 10, order: 'whenInserted DESC' },
      },
      function (oldMomentSet) {
        if (oldMomentSet && oldMomentSet.length > 0) {
          //          sow.Tool.setSessionData('momentSet4Timeline', self.momentSet4Timeline().concat(oldMomentSet));
          self.momentSet4Timeline(self.momentSet4Timeline().concat(oldMomentSet))
        }
      },
      'json'
    ).always(function () {
      self.busyAppending(false)
    })
  }
  this.refreshImpression = function () {}
  this.appendImpression = function () {
    self.busyAppending(true)
    $.post(
      SOLET + 'Message_getAll',
      {
        Message: { starId: starModel.starId, tag: 'MOMENT', ownerSid: starModel.targetPerson().aiid.aiid },
        config: { limit: self.momentSet4Impression().length + ',10', order: '`voteGood`+`replyCount` DESC' },
      }, // todo: 还要防止，中间有新消息加入，以至于分页结果有重合。
      function (coldMomentSet) {
        if (coldMomentSet && coldMomentSet.length > 0) {
          //        sow.Tool.setSessionData('momentSet4Impression', self.momentSet4Impression().concat(coldMomentSet));
          self.momentSet4Impression(self.momentSet4Impression().concat(coldMomentSet))
          sow.Tool.setWaterfall()
          setTimeout(sow.Tool.setWaterfall, 2000)
        }
      },
      'json'
    ).always(function () {
      self.busyAppending(false)
    })
  }
  this.showMocube = function (moment, event) {
    self.moment(moment)
    self.replySet([])
    self.getReplySet()
    //  self.stageNow('');
    self.stageNow('STAGE_MOCUBE')
    if (self.moment().content.image || self.moment().content.video || self.moment().content.sound) self.hostStageMocubeSwiper.slideTo(space.SCENE_MEDIA_INDEX)
    else if (self.moment().content.text) self.hostStageMocubeSwiper.slideTo(space.SCENE_TEXT_INDEX)
    else self.hostStageMocubeSwiper.slideTo(space.SCENE_TICE_INDEX)
    self.mocubeMap.showLocation(moment.location)
    self.mocubeMap.markLocation(moment.location, 'image/LocationTarget.png')
  }

  this.getReplySet = function () {
    if (self.moment()) {
      //    self.replySet([]);
      $.post(
        SOLET + 'Message_getReplyMessageSet',
        { Message: self.moment() },
        function (messageSet) {
          if (messageSet && messageSet.length > 0) {
            self.replySet(messageSet) // 注意，也许返回为空，则不该把空赋给 replySet，否则 replySet()初始化的[]不成立，造成reply时 replySet.unshift失败。
          }
        },
        'json'
      )
    }
  }
  this.addReply = function () {
    if (starModel.isOnline()) {
      // 必须登录才能发言。
      if (self.reply().content.text) {
        self.reply().ownerSid = starModel.onlinePerson().aiid
        //        self.reply().content.text=encodeURIComponent(self.reply().content.text);
        $.post(
          SOLET + 'Message_reply',
          { Message: self.reply(), sourceMessage: self.moment() },
          function (reply) {
            if (reply && reply.aiid != null) {
              self.reply.reset() // 重置
              if (self.replySet().length > 0) self.replySet.unshift(reply)
              else if (self.replySet().length === 0)
                // 防止replySet为空，这时unshift会报错。
                self.replySet([reply])
              //            dialog.showReminder({text:Locale[starModel.userLang()].dialogFeedback['SUBMIT_REPLY_DONE']});
              self.moment().replyCount++ // self.moment()._data.replyCount++;
              self.moment(self.moment())
              var mset = self.momentSet4Impression()
              mset.sort(self.sort4Impression)
              self.momentSet4Impression([])
              self.momentSet4Impression(mset) // 重新排序并刷新卡片上读数。
              var mset = spaceAll.momentSet4Impression()
              mset.sort(spaceAll.sort4Impression)
              spaceAll.momentSet4Impression([])
              spaceAll.momentSet4Impression(mset) // 重新排序并刷新卡片上读数。
              //            self.momentSet4Impression(self.momentSet4Impression().sort(self.sort4Impression)); // 这样只能重新排序，不会刷新卡片上读数。
            } else {
              dialog.showReminder({ text: Locale[starModel.userLang()].dialogFeedback['SUBMIT_REPLY_FAIL'], scenario: 'WARN' })
            }
          },
          'json'
        )
      } else {
        dialog.showReminder({ text: Locale[starModel.userLang()].dialogFeedback['SUBMIT_REPLY_EMPTY'], scenario: 'WARN' })
      }
    } else {
      dialog.showReminder({ text: Locale[starModel.userLang()].dialogFeedback['SUBMIT_REPLY_OFFLINE'], scenario: 'WARN' })
      starModel.targetPerson(sow.Const.PERSON_UNKNOWN)
      spaceShare.stageNow('STAGE_LOGIN')
    }
  }

  this.vtid = ko.observable(null) // 为了刷新界面上的vote buttons，需要更新self.moment()._data.vote.vtid，而这耗费太大，因此单独设置跟踪变量。
  ko.computed(function () {
    // 每当换了moment()，就更新vtid。todo: 当onlinePerson()也换了，也要更新vtid。
    self.vtid(null) // 先清空，以免切换到其他moment时，还保留了之前的状态。
    if (self.moment() && self.moment()._data && self.moment()._data.vote && self.moment()._data.vote.vtid) {
      self.vtid(self.moment()._data.vote.vtid)
    }
  })
  this.addVote = function (vtid) {
    if (starModel.isOnline()) {
      // 在线 并且 和已经投过的票不同
      if (self.vtid() !== vtid) {
        $.post(
          SOLET + 'Message_setVote',
          { Message: { aiid: self.moment().aiid }, vote: { vtid: vtid } },
          function (vote) {
            if (vote) {
              if (vote.vtid === sow.Const.VT_GOOD) {
                self.moment().voteGood++
                if (self.vtid() === sow.Const.VT_BAD) {
                  self.moment().voteBad--
                }
              } else if (vote.vtid === sow.Const.VT_BAD) {
                self.moment().voteBad++
                if (self.vtid() === sow.Const.VT_GOOD) {
                  self.moment().voteGood--
                }
              }
              self.moment()._data.vote = vote
              self.moment(self.moment()) // 刷新Mocube界面上读数。
              var mset = self.momentSet4Impression()
              mset.sort(self.sort4Impression)
              self.momentSet4Impression([])
              self.momentSet4Impression(mset) // 重新排序并刷新卡片上读数。
              var mset = spaceAll.momentSet4Impression()
              mset.sort(spaceAll.sort4Impression)
              spaceAll.momentSet4Impression([])
              spaceAll.momentSet4Impression(mset) // 重新排序并刷新卡片上读数。
              //              self.momentSet4Impression(self.momentSet4Impression().sort(self.sort4Impression)); // 这样只能重新排序，不会刷新卡片上读数。
              self.vtid(vote.vtid)
            }
          },
          'json'
        )
      } else {
        $.post(
          SOLET + 'Message_clearVote',
          { Message: { aiid: self.moment().aiid }, vote: { vtid: vtid } },
          function (vote) {
            if (vote && !vote.vtid) {
              if (vtid === sow.Const.VT_GOOD) {
                self.moment().voteGood--
              } else if (vtid === sow.Const.VT_BAD) {
                self.moment().voteBad--
              }
              self.moment()._data.vote = vote
              self.moment(self.moment()) // 刷新Mocube界面上读数。
              var mset = self.momentSet4Impression()
              mset.sort(self.sort4Impression)
              self.momentSet4Impression([])
              self.momentSet4Impression(mset) // 重新排序并刷新卡片上读数。
              var mset = spaceAll.momentSet4Impression()
              mset.sort(spaceAll.sort4Impression)
              spaceAll.momentSet4Impression([])
              spaceAll.momentSet4Impression(mset) // 重新排序并刷新卡片上读数。
              //              self.momentSet4Impression(self.momentSet4Impression().sort(self.sort4Impression)); // 这样只能重新排序，不会刷新卡片上读数。
              self.vtid(null)
            }
          },
          'json'
        )
      }
    } else {
      dialog.showReminder({ text: Locale[starModel.userLang()].dialogFeedback['ACTION_VOTE_OFFLINE'], scenario: 'WARN' })
      starModel.targetPerson(sow.Const.PERSON_UNKNOWN)
      spaceShare.stageNow('STAGE_LOGIN')
    }
  }

  this.showComplain = function () {
    dialog.showDialog({
      text: '您发现了非法的、不良的内容？<br>请发起投诉，我们将在24小时内处理。<br>感谢您的监督和支持！',
      scenario: 'COMPLAIN',
      onConfirm: function () {
        if (starModel.isOnline()) {
          dialog.busy(true)
          $.post(
            SOLET + 'Person_complain',
            { target: self.moment() },
            function (success) {
              if (success) {
                dialog.showReminder({ text: '投诉已经提交，请等候处理', scenario: 'FYI' })
              } else {
                dialog.showDialog({
                  text: '投诉提交失败，请再试一次，或者联系我们<a href="mailto:team-moment@faronear.org">team-moment@faronear.org</a>',
                  scenario: 'ALERT',
                })
              }
            },
            'json'
          ).always(function () {
            dialog.busy(false)
          })
        } else {
          dialog.showReminder({ text: '请您首先登录，然后发起投诉。', scenario: 'FYI' })
        }
      },
    })
  }
})()

$(document).ready(function () {
  /* 设置KO：配置KO使得支持嵌套的绑定 */
  ko.bindingHandlers.stopBinding = {
    init: function () {
      return { controlsDescendantBindings: true }
    },
  }
  ko.virtualElements.allowedBindings.stopBinding = true
  ko.applyBindings(starModel, document.body) /* 绑定模型到界面上 */
})
