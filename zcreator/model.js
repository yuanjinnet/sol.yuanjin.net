//'use strict'; // 严格模式应当仅限用于开发环境。在运维环境下请删除该模式。

/**
 ** Copyright: Faronear Co. Ltd. (http://www.faronear.com)
 ** Web: http://zcreator.faronear.com
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

window.sow = window.sow || {} // sow=sow||{} 会出错。
sow.Const = require('../static/_sow/Const.js')
sow.Tool = require('../static/_sow/Tool.js')
sow.modelPrototype = require('../static/_sow/modelPrototype.js')
sow.StarModel = require('../static/_sow/StarModel.js')
sow.Locale = require('../static/_sow/Locale.js')
sow.Account = require('../static/_sow/Account.js')
sow.Chat = require('../static/_sow/Chat.js')
sow.Dialog = require('../static/_sow/Dialog.js')
sow.Editor = require('../static/_sow/Editor.js')
sow.Locale = require('../static/_sow/Locale')
sow.MD5 = require('../static/_sow/MD5')
require('../static/_sow/setWaterfall')
sow.Trade = require('../static/_sow/Trade')
sow.UI = require('../static/_sow/UI')
sow.Uploader = require('../static/_sow/Uploader')

window.starModel = new sow.StarModel({ starVersion: '2017081800', starCode: 'zcreator', starName: '云才创作' })
window.accountModel = new sow.Account()
window.tradeModel = new sow.Trade()
window.dialog = new sow.Dialog()

window.space = new (function (options) {
  var self = this
  this.constructor = arguments.callee
  this.__proto__ = sow.modelPrototype

  this.inProject = ko.observable('NONE_PROJECT')
  this.dialogNow = ko.observable()
  this.busyAppending = ko.observable(false)
  this.busyRefreshing = ko.observable(false)
  this.busyReloading = ko.observable(false)

  this.busyUploading = ko.observable(false)

  this.reminding = ko.observable(false)
  this.remindContent = ko.observable('')
  this.limitSelect = 12
  this.timeUnit = { F: '分钟', H: '小时', D: '天', W: '周', M: '月', Y: '年' }
  this.monthLocale = ['月份', '一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
  this.currencyList = [
    { name: '人民币', code: 'CNY', symbol: '￥' },
    { name: '欧元', code: 'EUR', symbol: '€' },
    { name: '美元', code: 'USD', symbol: '$' },
    { name: '英镑', code: 'GRP', symbol: '£' },
    { name: '日元', code: 'JPY', symbol: '¥' },
    { name: '比特币', code: 'BTC', symbol: '฿' },
  ]
  this.symbolOfCurCode = function (code) {
    for (var i in this.currencyList) {
      if (this.currencyList[i].code === code) return this.currencyList[i].symbol
    }
    return ''
  }
  this.textOfCurCode = function (code) {
    for (var i in this.currencyList) {
      if (this.currencyList[i].code === code) return this.currencyList[i].code + ' ' + this.currencyList[i].name
    }
    return ''
  }
  this.textOfCurrency = function (item) {
    return item.code + ' ' + item.name
  }

  //  $.event.special.tap.emitTapOnTaphold=false;
  $.event.special.tap.tapholdThreshold = 1500 // default: 750. 不能太短，因为选取文本进行拷贝也相当于长按。

  this.setModel(options)

  this.remind = function (options) {
    if (options && options.text) {
      self.reminding(true)
      self.remindContent(options.text)
      setTimeout(function () {
        self.reminding(false)
        setTimeout(self.remindContent.bind(self, ''), 1000) // 清空内容。不清空也不影响界面效果。
        //        self.remindContent(''); // 取消 reminding 变量，程序更简单，但是失去了渐变隐去的效果。
      }, options.timeout || 3000)
    }
  }

  /* 剪贴板 */
  this.clipButton = document.createElement('button')
  this.clipBoard = new Clipboard(this.clipButton)
  this.clipBoard.on('success', function (evt) {
    // evt.action/text/trigger
    if (/action=REFER/.test(self.clipBoard.clipText)) {
      dialog.showDialog({
        text:
          '转发您的专属链接或二维码，<br>每推荐成功一个新用户，<br>获得其交易额的5%现金奖励！<br><a href="' +
          self.clipBoard.clipText +
          '">' +
          self.clipBoard.clipText +
          '</a><br>',
        qrcodeText: self.clipBoard.clipText,
        scenario: 'ALERT',
      })
    } else {
      dialog.showDialog({
        text: '地址拷贝成功：<br><a href="' + self.clipBoard.clipText + '">' + self.clipBoard.clipText + '</a><br>或者扫描二维码：',
        qrcodeText: self.clipBoard.clipText,
        scenario: 'ALERT',
      })
    }
  })
  this.clipBoard.on('error', function (evt) {
    // evt.action/trigger
    // 拷贝失败时（例如在 Safari 上），evt.text 为undefined，因此不使用 evt.text 而是使用 self.clipBoard.clipText。
    if (/action=REFER/.test(self.clipBoard.clipText)) {
      dialog.showDialog({
        text:
          '转发您的专属链接或二维码，<br>每推荐成功一个新用户，<br>获得其交易额的5%现金奖励！<br><a href="' +
          self.clipBoard.clipText +
          '">' +
          self.clipBoard.clipText +
          '</a><br>',
        qrcodeText: self.clipBoard.clipText,
        scenario: 'ALERT',
      })
    } else {
      dialog.showDialog({
        text: '访问以下地址：<br><a href="' + self.clipBoard.clipText + '">' + self.clipBoard.clipText + '</a><br>或者扫描二维码：',
        qrcodeText: self.clipBoard.clipText,
        scenario: 'ALERT',
      })
    }
  })
  // 最简单的用法，不需要绑定点击操作到方法上，而是让clipboard自动响应点击，自动把目标元素的data-clipboard-text拷贝出来。
  // 但是，但如果目标元素是div而不是button，在Safari上，不会自动激发click，从而也不激发clipboard，必须手动调用click。
  // 为了安全，也因为需要动态设置data-clipboard-text，我还是统一用自己的点击方法来响应点击操作。
  this.shareTarget = function (target, channel) {
    if (sow.Tool.deviceInfo().software === 'android') {
      // 安卓不支持 href 和 pictures 的分享。
      delete target.pictures
      target.content += ' ' + target.href
    }
    if (window.plus && channel !== 'DIALOG') {
      // content里有了 emoji 发到朋友圈就不稳定，必须快速发送，否则就失败。有了 pictures 也不稳定。只有不含emoji的content + href 才稳定。
      window.plus.share.sendWithSystem(
        target,
        function () {
          /* space.remind({text:'成功啦 👍'}); console.info('成功啦 👍'); */
        },
        function (e) {
          /* space.remind({text:'取消了 😭'}); console.info('取消了 😭'+JSON.stringify(e)); */
        }
      )
    } else {
      self.clipBoard.clipText = target.href
      this.clipButton.setAttribute('data-clipboard-text', self.clipBoard.clipText)
      this.clipButton.click()
    }
    //    this.toggleRingMenu();
  }

  this.forward = function (channel) {
    // channel==='DIALOG' 强制使用自己的，不用系统的转发。
    var target = this.getForwardTarget()
    this.shareTarget(target, channel)
  }
  this.getForwardTarget = function () {
    var self = this
    var target = { href: starModel.starUrl, content: '[' + starModel.starName + '] ', pictures: ['_www/image/favicon_76.png'] } // iOS 上，应用的根目录要写成 _ 。包含了pictures后，虽然在微信、微博上能够显示图片和链接，但QQ上只有图片了，所以取消图片。
    if (starModel.where() === 'SPACE_ALL') {
      // 广场
      switch (self.stageNow()) {
        case 'STAGE_PROSET':
          target.href += '?action=VISIT_ALL&stage=' + self.stageNow()
          target.content += '项目'
          break
        case 'STAGE_TASK':
          target.href += '?action=VISIT_ALL&stage=' + self.stageNow()
          target.content += '任务'
          break
        case 'STAGE_TICE':
          target.href += '?action=VISIT_ALL&stage=' + self.stageNow()
          target.content += '服务'
          break
        case 'STAGE_CHAT':
          target.href += '?action=VISIT_ALL&stage=' + self.stageNow()
          target.content += '🙈 匿名聊天，越屏即焚 😎'
          break
        case 'STAGE_LOG':
          target.href += '?action=VISIT_ALL&stage=' + self.stageNow()
          target.content += '专栏'
          break
        case 'STAGE_ABOUT':
          target.href += '?action=VISIT_ALL&stage=' + self.stageNow()
          target.content += '专业人才短租，释放超凡潜力！'
          break
      }
    } else if (space.inProject() === 'NONE_PROJECT') {
      // 个人
      target.content += starModel.targetPerson().nick + '的'
      switch (self.stageNow()) {
        case 'STAGE_PROSET':
          target.href += '?action=VISIT_PERSON&id=' + starModel.targetPerson().aiid + '&stage=' + self.stageNow()
          target.content += '项目'
          break
        case 'STAGE_TICE':
          if (self.sceneTice() === 'TICE_ONE') {
            target.href += '?action=VISIT_TICE&id=' + self.ticeNow().aiid
            target.content +=
              '服务: ' +
              self.ticeNow().content.ticeCount +
              space.timeUnit[self.ticeNow().content.ticeUnit] +
              '/' +
              space.symbolOfCurCode(self.ticeNow().priceCurrency) +
              self.ticeNow().price +
              ' ' +
              self.ticeNow().title
          } else {
            target.href += '?action=VISIT_PERSON&id=' + starModel.targetPerson().aiid + '&stage=' + self.stageNow()
            target.content += '服务'
          }
          break
        case 'STAGE_TASK':
          if (self.sceneTask() === 'TASK_ONE') {
            target.href += '?action=VISIT_TASK&id=' + self.taskNow().aiid
            target.content += '任务: ' + space.symbolOfCurCode(self.taskNow().info.currency) + self.taskNow().info.price + ' ' + self.taskNow().name
          } else {
            target.href += '?action=VISIT_PERSON&id=' + starModel.targetPerson().aiid + '&stage=' + self.stageNow()
            target.content += '任务'
          }
          break
        case 'STAGE_CHAT':
          target.href += '?action=VISIT_PERSON&id=' + starModel.targetPerson().aiid + '&stage=' + self.stageNow()
          target.content += '私聊'
          break
        case 'STAGE_LOG':
          if (self.sceneLog() === 'LOG_ONE') {
            target.href += '?action=VISIT_LOG&id=' + self.logNow().aiid
            target.content += '专栏: ' + (self.logNow().title || '无标题')
          } else {
            target.href += '?action=VISIT_PERSON&id=' + starModel.targetPerson().aiid + '&stage=' + self.stageNow()
            target.content += '专栏'
          }
          break
        case 'STAGE_ABOUT':
          target.href += '?action=VISIT_PERSON&id=' + starModel.targetPerson().aiid + '&stage=' + self.stageNow()
          target.content += '名片'
          break
      }
    } else if (self.hasOwnProperty('project') && typeof self.project === 'function') {
      // 项目
      target.content += self.project().subject + ': '
      switch (self.stageNow()) {
        case 'STAGE_DREAM':
          target.href += '?action=VISIT_PROJECT&id=' + self.project().aiid + '&stage=' + self.stageNow()
          target.content += '梦想'
          break
        case 'STAGE_TEAM':
          if (self.sceneTeam() === 'ROLE_ONE') {
            target.href += '?action=VISIT_ROLE&id=' + self.roleNow().aiid
            target.content += '招人: ' + (self.roleNow().name || '')
          } else {
            target.href += '?action=VISIT_PROJECT&id=' + self.project().aiid + '&stage=' + self.stageNow()
            target.content += '招人'
          }
          break
        case 'STAGE_CHIP':
          if (self.sceneChip() === 'CHIP_ONE') {
            target.href += '?action=VISIT_CHIP&id=' + self.chipNow().aiid
            target.content +=
              '筹钱: ' + space.symbolOfCurCode(self.project().fundCurrency || 'CNY') + (self.chipNow().price || '') + '/' + (self.chipNow().title || '')
          } else {
            target.href += '?action=VISIT_PROJECT&id=' + self.project().aiid + '&stage=' + self.stageNow()
            target.content += '筹钱 ' + space.symbolOfCurCode(self.project().fundCurrency || 'CNY') + (self.project().fundGoal || '')
          }
          break
        case 'STAGE_LOG':
          if (self.sceneLog() === 'LOG_ONE') {
            target.href += '?action=VISIT_LOG&id=' + self.logNow().aiid
            target.content += '社区: ' + (self.logNow().title || '无标题')
          } else {
            target.href += '?action=VISIT_PROJECT&id=' + self.project().aiid + '&stage=' + self.stageNow()
            target.content += '社区'
          }
          break
        case 'STAGE_CHAT':
          target.href += '?action=VISIT_PROJECT&id=' + self.project().aiid + '&stage=' + self.stageNow()
          target.content += '开会'
          break
      }
    }
    return target
  }

  //  $.datepicker.setDefaults( $.datepicker.regional[ "zh-CN" ] );
  //  $.datetimepicker.setLocale('zh');

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

  accountModel.addListener('LOGIN_SUCCESS', function () {
    myHome.initPerson()
    if (starModel.where() === 'SPACE_ALL') {
      starModel.targetPerson(starModel.onlinePerson()) // 如果是从广场发起的登录，应当进入我的空间。
    } else if (starModel.targetPerson().aiid === starModel.onlinePerson().aiid) {
      // where=SPACE_HOST，并且登陆用户就是当前被访问用户
      if (space.inProject() === 'NONE_PROJECT') {
        // 原来在 urHost
        myHome.stageNow(urHost.stageNow())
        myHome.logNow(urHost.logNow())
        myHome.sceneLog(urHost.sceneLog())
        myHome.ticeNow(urHost.ticeNow())
        myHome.sceneTice(urHost.sceneTice())
        myHome.taskNow(urHost.taskNow())
        myHome.sceneTask(urHost.sceneTask())
        starModel.targetPerson(starModel.onlinePerson())
      } else {
        // 原来在 urProject
        space.showProject(urProject.project())
        // 试图保留当前位置：
        myProject.stageNow(urProject.stageNow())
        myProject.roleNow(urProject.roleNow())
        myProject.sceneTeam(urProject.sceneTeam())
        myProject.chipNow(urProject.chipNow())
        myProject.sceneChip(urProject.sceneChip())
        myProject.logNow(urProject.logNow())
        myProject.sceneLog(urProject.sceneLog())
        myProject.project._data.care = undefined
      }
    } else {
      // 原先在 SPACE_HOST，是第三方的
      if (space.inProject() === 'NONE_PROJECT') {
        urHost.updateCare(starModel.targetPerson())
      } else {
        urProject.updateCare(urProject.project())
      }
    }
    sow.UI.resetHeightTextarea(document.getElementById('myHomeAboutIntroduction'))
    self.dialogNow('')
    accountModel.dialogTitle('')
  })

  /* 根据 url 进行路由 */
  this.routeUrl = function (url) {
    url = sow.Tool.parseUrl(url || window.location.href)

    if (url.params && url.params.action) {
      switch (url.params.action.toUpperCase()) {
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
          starModel.targetPerson(sow.Const.PERSON_ALL) // 作为匿名用户进入广场空间
          self.dialogNow('DIALOG_LOGIN') // 进入登录舞台
          break
        case 'REFER':
          if (url.params.id) {
            accountModel.loginPerson().agentId = url.params.id
            sessionStorage['agentId'] = url.params.id
          }
          break
        case 'VISIT_ALL':
          space.showPerson(sow.Const.PERSON_ALL, null, url.params.stage)
          break
        case 'VISIT_PROJECT':
          if (url.params.id) {
            $.post(
              SOLET + 'Project_getOne',
              starModel.normalize({ Project: { aiid: url.params.id } }),
              function (project) {
                if (project && project._class === 'Project') {
                  project = Date.iso2Date(project)
                  space.showProject(project, null, url.params.stage)
                } else {
                  space.remind({ text: '没有找到目标，可能已被删除。' })
                }
              },
              'json'
            )
          }
          break
        case 'VISIT_PERSON':
          if (url.params.id !== sow.Const.PERSON_ALL.aiid && url.params.id !== sow.Const.PERSON_UNKNOWN.aiid) {
            if (url.params.id === starModel.onlinePerson().aiid) {
              space.showPerson(starModel.onlinePerson(), null, url.params.stage)
            } else {
              $.post(
                SOLET + 'Person_getOne',
                starModel.normalize({ Person: { aiid: url.params.id } }),
                function (person) {
                  if (person && person._class === 'Person') {
                    space.showPerson(person, null, url.params.stage)
                  } else {
                    space.remind({ text: '没有找到目标，可能已被删除。' })
                  }
                },
                'json'
              )
            }
          }
          break
        case 'VISIT_LOG':
          if (url.params.id) {
            $.post(
              SOLET + 'Message_getOne',
              starModel.normalize({ Message: { aiid: url.params.id } }),
              function (message) {
                if (message && message._class === 'Message') {
                  space.visitLog(message)
                } else {
                  space.remind({ text: '没有找到目标，可能已被删除。' })
                }
              },
              'json'
            )
          }
          break
        case 'VISIT_ROLE':
          if (url.params.id) {
            $.post(
              SOLET + 'Circle_getOne',
              starModel.normalize({ Circle: { aiid: url.params.id, tag: 'ROLE' } }),
              function (result) {
                if (result && result._class === 'Circle') {
                  result = Date.iso2Date(result)
                  space.showProject(result._data.agent, null, 'STAGE_TEAM', 'ROLE_ONE')
                  if (result._data.owner.aiid === starModel.onlinePerson().aiid) {
                    //                    myProject.roleNow(result);
                    myProject.showRole(result, undefined) // 还需要获取 Circle_getSubset，因此调用showRole.
                  } else {
                    //                    urProject.roleNow(result);
                    urProject.showRole(result, undefined)
                  }
                } else {
                  space.remind({ text: '没有找到目标，可能已被删除。' })
                }
              },
              'json'
            )
          }
          break
        case 'VISIT_TASK':
          if (url.params.id) {
            $.post(
              SOLET + 'Circle_getOne',
              starModel.normalize({ Circle: { aiid: url.params.id, tag: 'TASK' } }),
              function (result) {
                if (result && result._class === 'Circle') {
                  result = Date.iso2Date(result)
                  space.showPerson(result._data.owner, null, 'STAGE_TASK', 'TASK_ONE')
                  if (result._data.owner.aiid === starModel.onlinePerson().aiid) {
                    //                    myProject.roleNow(result);
                    myHome.showTask(result, undefined) // 还需要获取 Circle_getSubset，因此调用showRole.
                  } else {
                    //                    urProject.roleNow(result);
                    urHost.showTask(result, undefined)
                  }
                } else {
                  space.remind({ text: '没有找到目标，可能已被删除。' })
                }
              },
              'json'
            )
          }
          break
        case 'VISIT_CHIP':
          if (url.params.id) {
            $.post(
              SOLET + 'Provice_getOne',
              starModel.normalize({ Provice: { aiid: url.params.id, tag: 'CHIP' } }),
              function (result) {
                if (result && result._class === 'Provice') {
                  space.showProject(result._data.agent, null, 'STAGE_CHIP', 'CHIP_ONE')
                  if (result._data.owner.aiid === starModel.onlinePerson().aiid) {
                    myProject.chipNow(result)
                  } else {
                    urProject.chipNow(result)
                  }
                } else {
                  space.remind({ text: '没有找到目标，可能已被删除。' })
                }
              },
              'json'
            )
          }
          break
        case 'VISIT_TICE':
          if (url.params.id) {
            $.post(
              SOLET + 'Provice_getOne',
              starModel.normalize({ Provice: { aiid: url.params.id, tag: 'TICE' } }),
              function (result) {
                if (result && result._class === 'Provice') {
                  space.showPerson(result._data.owner, null, 'STAGE_TICE')
                  if (result._data.owner.aiid === starModel.onlinePerson().aiid) {
                    myHome.ticeNow(result)
                    myHome.sceneTice('TICE_ONE')
                  } else {
                    urHost.ticeNow(result)
                    urHost.sceneTice('TICE_ONE')
                  }
                } else {
                  space.remind({ text: '没有找到目标，可能已被删除。' })
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

  // 似乎没必要等ready。但以防万一html是把js放在head里加载。
  $(document).ready(function () {
    // ready 时，图片也已加载，因此为了加快速度，可以不等ready，不等图片加载结束。
    setTimeout(function () {
      document.getElementById('splash').style.opacity = 0
      document.getElementById('splash').style.zIndex = 0 //document.getElementById('afterSplash').style.opacity=1;
      //      sow.UI.resetHeightTextareaArray(document.getElementsByClassName('FixedInLog')); // 要不然，在iphone上经常会初始化为很高的高度。
    }, 200)

    accountModel.autologin(
      function (onlinePerson) {
        myHome.initPerson()
        starModel.targetPerson(onlinePerson)
        //        sow.UI.resetHeightTextarea(document.getElementById('myHomeAboutIntroduction')); // 要不然，在iphone上经常会初始化为很高的高度。已经实现在 LOGIN_SUCCESS 里，应当不需要在这里了，但尚未测试。
      },
      sow.voidfunc,
      self.routeUrl // always 方法发生在 success/fail 之后。
    )

    /*
    $.post(SOLET+'Message_getAppMessageSet', // 加载各种应用信息。
      starModel.normalize({starId:starModel.starId}), // // 初始化时，因为时序，有可能后台尚未记录 starId 到 session 里。
      function(appMessageSet){
        if (appMessageSet && appMessageSet.news) {
          if (sow.Tool.readPath('news.title',appMessageSet)) 
            dialog.showDialog({text:appMessageSet.news.title, scenario:'ALERT'});
        }
      },
      'json'
    );
*/
  })

  ///////////////// Project ///////////////////////////
  this.startProject = function () {
    // 点击“我有一个梦想”后
    if (starModel.isOnline()) {
      myProject.project.reset()
      myProject.logList([])
      myProject.roleList([])
      myProject.chipList([])
      starModel.targetPerson(starModel.onlinePerson())
      myProject.stageNow('STAGE_DREAM')
      space.inProject('MY_PROJECT')
    } else {
      accountModel.dialogTitle('梦想需要主持人。请先登录！')
      self.dialogNow('DIALOG_LOGIN')
    }
  }
  this.showProject = function (project, evt, stage, scene, callback) {
    //    var self=this; // 没用到
    if (!starModel.isOnline()) {
      // 不在线。去访问第三方项目。
      if (project._data.owner) {
        starModel.targetPerson(project._data.owner)
        urProject.initProject(project, stage, scene)
        space.inProject('UR_PROJECT')
        //        urProject.updateCare(project); // 不在线时不存在关注关系。
        if (typeof callback === 'function') callback()
      } else {
        $.post(
          SOLET + 'Person_getOne',
          starModel.normalize({ Person: { aiid: project.ownerSid } }),
          function (result) {
            if (result && result._class === 'Person') {
              project._data.owner = result
              starModel.targetPerson(project._data.owner)
              urProject.initProject(project, stage, scene)
              space.inProject('UR_PROJECT')
              //              urProject.updateCare(project); // 不在线时不存在关注关系。
              if (typeof callback === 'function') callback()
            }
          },
          'json'
        )
      }
    } else if (project.ownerSid === starModel.onlinePerson().aiid) {
      // 在线 && 我自己项目
      starModel.targetPerson(starModel.onlinePerson())
      myProject.initProject(project, stage, scene)
      space.inProject('MY_PROJECT')
      if (typeof callback === 'function') callback()
    } else {
      // 在线 && 不是我的项目
      /*      $.post(SOLET+'Project_inTeam',  // todo: 判断是成员还是观众。
        starModel.normalize({ Project : project}),
        function(inTeam){
          if (inTeam==='TEAM_MEMBER'){
            starModel.targetPerson(project._data.owner);
            ourProject.initProject(project, stage);
            space.inProject('TEAM_PROJECT');
          }else{
*/
      if (project._data.owner) {
        starModel.targetPerson(project._data.owner)
        urProject.initProject(project, stage, scene)
        space.inProject('UR_PROJECT')
        urProject.updateCare(project)
        if (typeof callback === 'function') callback()
      } else {
        $.post(
          SOLET + 'Person_getOne',
          starModel.normalize({ Person: { aiid: project.ownerSid } }),
          function (result) {
            if (result && result._class === 'Person') {
              project._data.owner = result
              starModel.targetPerson(project._data.owner)
              urProject.initProject(project, stage, scene)
              space.inProject('UR_PROJECT')
              urProject.updateCare(project)
              if (typeof callback === 'function') callback()
            }
          },
          'json'
        )
      }
      /*          }
        },
        'json'
      ).fail(function(){
        starModel.targetPerson(project._data.owner);
        urProject.initProject(project, stage); 
        space.inProject('UR_PROJECT');
      });
*/
    }
  }
  this.initProject = function (project, stage, scene) {
    // 准备进入该项目空间
    var self = this
    self.project(project)
    self.refreshRoleList(null, null, true)
    self.sceneTeam(scene === 'ROLE_ONE' ? scene : 'ROLE_LIST')
    if (scene !== 'ROLE_ONE') self.roleNow.reset()
    self.refreshChipList(null, null, true)
    self.sceneChip(scene === 'CHIP_ONE' ? scene : 'CHIP_LIST')
    if (scene !== 'CHIP_ONE') self.chipNow.reset()
    /* self.logNow().agentId=project.aiid; */
    self.refreshLogList(null, null, true)
    self.sceneLog(scene === 'LOG_ONE' ? scene : 'LOG_LIST')
    if (scene !== 'LOG_ONE') self.logNow.reset() // refreshLogList 需要用到 lowNow().agentId，因此先执行 logNow.reset() 或先赋值。
    self.stageNow(typeof stage === 'string' && stage ? stage : 'STAGE_DREAM')
  }
  this.updateProset = function (project) {
    var self = this
    for (var i in self.proset()) {
      if (self.proset()[i].aiid === project.aiid) {
        self.proset()[i] = project
        //        self.proset(self.proset()); // 如果从 updateProject() 里来，这一句够用。但如果是修改了背景图，project其实还是同一个指针，和列表里的是同一份拷贝，就需要彻底更新proset。
        var t = self.proset()
        self.proset([])
        self.proset(t)
        sow.Tool.setWaterfall()
        break
      }
    }
  }

  /*  this.reloadProset=function(){
    var self=this;
    self.busyReloading(true);
    var projectTemplate=(starModel.targetPerson().aiid!==sow.Const.SID_ALL)?{ownerSid:starModel.targetPerson().aiid}:{};
    $.post(SOLET+'Project_getAll',
      starModel.normalize({ Project : projectTemplate, config:{limit:space.limitSelect, order:'rand()'}}),
      function(newProset){
        if (newProset && newProset.length>0){
          self.proset(Date.iso2Date(newProset));
          sow.Tool.setWaterfall();
          setTimeout(sow.Tool.setWaterfall,1000);
        }else{
          space.remind({text:'没有新的项目。'});
        }
      },
      'json'
    ).always(function(){self.busyReloading(false);});
  }; */
  this.refreshProset = function (obj, evt, initial) {
    var self = this
    if (initial) self.proset([]) // 第一次加载，需要重置前一个person的。
    self.busyRefreshing(true)
    var projectTemplate = { ownerSid: self === myHome ? starModel.onlinePerson().aiid : self === urHost ? starModel.targetPerson().aiid : undefined }
    $.post(
      SOLET + 'Project_getAll',
      starModel.normalize({ Project: projectTemplate, config: { limit: space.limitSelect, order: 'whenInserted DESC' } }),
      function (newProset) {
        if (newProset && newProset.length > 0 && (!self.proset().length || new Date(newProset[0].whenInserted) > new Date(self.proset()[0].whenInserted))) {
          self.proset(Date.iso2Date(newProset))
          sow.Tool.setWaterfall()
          setTimeout(sow.Tool.setWaterfall, 1000)
        } else {
          if (!initial) space.remind({ text: '没有新的项目。' })
        }
      },
      'json'
    ).always(function () {
      self.busyRefreshing(false)
    })
  }
  this.appendProset = function () {
    var self = this
    self.busyAppending(true)
    var projectTemplate = starModel.targetPerson().aiid !== sow.Const.SID_ALL ? { ownerSid: starModel.targetPerson().aiid } : {}
    projectTemplate.whenInserted = '<' + (self.proset().length > 0 ? self.proset()[self.proset().length - 1].whenInserted : '0000-00-00 00:00:00')
    $.post(
      SOLET + 'Project_getAll',
      starModel.normalize({ Project: projectTemplate, config: { limit: space.limitSelect, order: 'whenInserted DESC' } }),
      function (result) {
        if (result && result.length > 0) {
          self.proset(Date.iso2Date(result))
          sow.Tool.setWaterfall()
          setTimeout(sow.Tool.setWaterfall, 1000)
        } else {
          space.remind({ text: '没有更多项目了。' })
        }
      },
      'json'
    ).always(function () {
      self.busyAppending(false)
    })
  }

  ///////////////// Project Team ///////////////////////////
  this.joinCircle = function (observableCircle) {
    var self = this
    if (starModel.isOnline()) {
      if (sow.Tool.readPath('_data.join.statusMember', observableCircle()) !== sow.Const.STAT_ON) {
        $.post(
          SOLET + 'Person_joinCircle',
          starModel.normalize({ Circle: observableCircle() }),
          function (result) {
            if (result && result._class === 'Join') {
              space.remind({ text: '报名成功啦！请等待主持人的批准。', scenario: 'SUCCESS' })
              observableCircle()._data.join = result
              observableCircle(observableCircle())
            } else {
              space.remind({ text: '很抱歉，报名出错了。请稍后再试。' })
            }
          },
          'json'
        ).fail(function () {
          space.remind({ text: '很抱歉，报名出错了。请稍后再试。' })
        })
      } else {
        space.remind({ text: '报名已经成功！' })
      }
    } else {
      accountModel.dialogTitle('请先登录，即可报名')
      space.dialogNow('DIALOG_LOGIN')
    }
  }
  this.joinPerson = function (person, personIndex) {
    var self = this
    var observableCircle = self.roleNow || self.taskNow
    var observableList = self.roleList || self.taskList
    var listIndex = self.roleIndex || self.taskIndex

    $.post(
      SOLET + 'Circle_joinPerson',
      starModel.normalize({ Circle: { aiid: observableCircle().aiid }, person: { aiid: person.aiid } }),
      function (result) {
        if (result && result._class === 'Join') {
          //          space.remind({text:'批准已生效。', scenario:'SUCCESS'});
          if (observableCircle()._data.memberSet && observableCircle()._data.memberSet.length > 0) {
            observableCircle()._data.memberSet.unshift(person)
            observableCircle().memberCount += 1
          } else {
            observableCircle()._data.memberSet = [person]
            observableCircle().memberCount = 1
          }
          observableCircle()._data.appliedSet.splice(personIndex, 1)
          observableCircle().appliedCount--
          observableCircle(observableCircle())
          if (observableList()[listIndex] && observableList()[listIndex].aiid === observableCircle().aiid) {
            observableList()[listIndex] = observableCircle()
          } else {
            for (var i in observableList()) {
              if (observableList()[i].aiid === observableCircle().aiid) {
                observableList()[i] = observableCircle()
                break
              }
            }
          }
          var temp = observableList()
          observableList([])
          observableList(temp) // 不借助中间变量，就无法即时更新 Badge
        } else {
          space.remind({ text: '很抱歉，添加成员出错了。请稍后再试。' })
        }
      },
      'json'
    ).fail(function () {
      space.remind({ text: '很抱歉，添加成员出错了。请稍后再试。' })
    })
  }
  this.showRole = function (role, index) {
    var self = this
    self.roleNow(role)
    self.roleIndex = index
    self.sceneTeam('ROLE_ONE')
    $.post(
      SOLET + 'Circle_getSubset',
      starModel.normalize({ Circle: { aiid: role.aiid } }),
      function (result) {
        if (result) {
          console.info(Date.iso2Date(result))
          if (result._class === 'Circle') {
            self.roleNow(result)
          } else if (result.memberSet) {
            self.roleNow()._data.memberSet = result.memberSet
            self.roleNow()._data.invitedSet = result.invitedSet
            self.roleNow()._data.appliedSet = result.appliedSet
            self.roleNow(self.roleNow())
          }
        }
      },
      'json'
    )
  }
  this.refreshRoleList = function (obj, evt, initial) {
    var self = this
    if (initial) self.roleList([])
    self.busyRefreshing(true)
    $.post(
      SOLET + 'Circle_getAll',
      starModel.normalize({
        Circle: { tag: 'ROLE', agentClass: 'PROJECT', agentId: self.project().aiid },
        config: { limit: space.limitSelect, order: 'whenInserted DESC' },
      }),
      function (result) {
        if (result && result.length > 0 && (!self.roleList().length || new Date(result[0].whenInserted) > new Date(self.roleList()[0].whenInserted))) {
          self.roleList(Date.iso2Date(result))
        } else {
          if (!initial) space.remind({ text: '没有新的角色。' })
        }
      },
      'json'
    ).always(function () {
      self.busyRefreshing(false)
    })
  }
  this.appendRoleList = function () {
    var self = this
    self.busyAppending(true)
    $.post(
      SOLET + 'Circle_getAll',
      starModel.normalize({
        Circle: {
          tag: 'ROLE',
          agentClass: 'PROJECT',
          agentId: self.project().aiid,
          whenInserted: '<' + (self.roleList().length > 0 ? self.roleList()[self.roleList().length - 1].whenInserted : '0000-00-00 00:00:00'),
        },
        config: { limit: space.limitSelect, order: 'whenInserted DESC' },
      }),
      function (result) {
        if (result && result.length > 0) {
          result = Date.iso2Date(result)
          self.roleList(result)
        } else {
          space.remind({ text: '没有更多任务了。' })
        }
      },
      'json'
    ).always(function () {
      self.busyAppending(false)
    })
  }
  ///////////////// Task ///////////////////////////////////
  this.showTask = function (task, index) {
    if (this === allSpace) {
      if (starModel.isOnline() && task.ownerSid === starModel.onlinePerson().aiid) {
        starModel.targetPerson(starModel.onlinePerson())
        myHome.showTask(task, undefined)
      } else {
        starModel.targetPerson(task._data.owner)
        urHost.initPerson(starModel.targetPerson())
        urHost.showTask(task, undefined)
      }
    } else {
      var self = this
      self.taskNow(task)
      self.taskIndex = index
      self.stageNow('STAGE_TASK')
      self.sceneTask('TASK_ONE')
      $.post(
        SOLET + 'Circle_getSubset',
        starModel.normalize({ Circle: { aiid: task.aiid } }),
        function (result) {
          if (result) {
            result = Date.iso2Date(result)
            if (result._class === 'Circle') {
              self.taskNow(result)
            } else if (result.memberSet) {
              self.taskNow()._data.memberSet = result.memberSet
              self.taskNow()._data.invitedSet = result.invitedSet
              self.taskNow()._data.appliedSet = result.appliedSet
              self.taskNow(self.taskNow())
            }
          }
        },
        'json'
      )
    }
  }
  this.refreshTaskList = function (obj, evt, initial) {
    var self = this
    if (initial) self.taskList([])
    self.busyRefreshing(true)
    $.post(
      SOLET + 'Circle_getAll',
      starModel.normalize({
        Circle: { tag: 'TASK', ownerSid: self === myHome ? starModel.onlinePerson().aiid : self === urHost ? starModel.targetPerson().aiid : undefined },
        config: { limit: space.limitSelect, order: 'whenInserted DESC' },
      }),
      function (result) {
        if (result && result.length > 0 && (!self.taskList().length || new Date(result[0].whenInserted) > new Date(self.taskList()[0].whenInserted))) {
          self.taskList(Date.iso2Date(result))
        } else {
          if (!initial) space.remind({ text: '没有新的任务。' })
        }
      },
      'json'
    ).always(function () {
      self.busyRefreshing(false)
    })
  }
  this.appendTaskList = function () {
    var self = this
    self.busyAppending(true)
    $.post(
      SOLET + 'Circle_getAll',
      starModel.normalize({
        Circle: {
          tag: 'TASK',
          ownerSid: self === myHome ? starModel.onlinePerson().aiid : self === urHost ? starModel.targetPerson().aiid : undefined,
          whenInserted: '<' + (self.taskList().length > 0 ? self.taskList()[self.taskList().length - 1].whenInserted : '0000-00-00 00:00:00'),
        },
        config: { limit: space.limitSelect, order: 'whenInserted DESC' },
      }),
      function (result) {
        if (result && result.length > 0) {
          self.taskList(Date.iso2Date(result))
        } else {
          space.remind({ text: '没有更多任务了。' })
        }
      },
      'json'
    ).always(function () {
      self.busyAppending(false)
    })
  }

  ///////////////// Project Chip ///////////////////////////
  this.showChip = function (chip, index) {
    var self = this
    self.chipNow(chip)
    self.chipIndex = index
    self.sceneChip('CHIP_ONE')
    /*    if (starModel.where()==='SPACE_HOME'){
      sow.UI.resetHeightTextarea(document.getElementById('myProjectFundContent')); // 正确初始化我的众筹的chip页面里 textarea 的高度。
    } */
  }
  this.refreshChipList = function (obj, evt, initial) {
    var self = this
    if (initial) self.chipList([])
    self.busyRefreshing(true)
    $.post(
      SOLET + 'Provice_getAll',
      starModel.normalize({
        Provice: { tag: 'CHIP', agentClass: 'PROJECT', agentId: self.project().aiid },
        config: { limit: space.limitSelect, order: 'whenInserted DESC' },
      }),
      function (result) {
        if (result && result.length > 0 && (!self.chipList().length || new Date(result[0].whenInserted) > new Date(self.chipList()[0].whenInserted))) {
          //          result=Date.iso2Date(result);
          self.chipList(result)
        } else {
          if (!initial) space.remind({ text: '没有新的筹码。' })
        }
      },
      'json'
    ).always(function () {
      self.busyRefreshing(false)
    })
  }
  this.appendChipList = function () {
    var self = this
    self.busyAppending(true)
    $.post(
      SOLET + 'Provice_getAll',
      starModel.normalize({
        Provice: {
          tag: 'CHIP',
          agentClass: 'PROJECT',
          agentId: self.project().aiid,
          whenInserted: '<' + (self.chipList().length > 0 ? self.chipList()[self.chipList().length - 1].whenInserted : '0000-00-00 00:00:00'),
        },
        config: { limit: space.limitSelect, order: 'whenInserted DESC' },
      }),
      function (result) {
        if (result && result.length > 0) {
          //          result=Date.iso2Date(result);
          self.chipList(result)
        } else {
          space.remind({ text: '没有更多筹码了。' })
        }
      },
      'json'
    ).always(function () {
      self.busyAppending(false)
    })
  }
  this.preparePayChip = function () {
    var self = this
    if (!starModel.isOnline()) {
      accountModel.dialogTitle('请先登录，即可认筹')
      space.dialogNow('DIALOG_LOGIN')
    } else if (isNaN(parseFloat(self.chipNow().price))) {
      space.remind({ text: '支付金额不能为空。' })
    } else {
      tradeModel.provice(self.chipNow())
      tradeModel.payTotal(self.chipNow().price)
      tradeModel.payCurrency(self.project().fundCurrency)
      tradeModel.refundPolicy(false)
      tradeModel.dialogTitle(self.chipNow().title)
      localStorage['postpayUrl'] = self.getForwardTarget().href
      space.dialogNow('DIALOG_PAY')
    }
  }
  ///////////////// Person Tice //////////////////////////////////
  this.refreshTiceList = function (obj, evt, initial) {
    var self = this
    if (initial) self.ticeList([])
    self.busyRefreshing(true)
    $.post(
      SOLET + 'Provice_getAll',
      starModel.normalize({
        Provice: { tag: 'TICE', ownerSid: self === myHome ? starModel.onlinePerson().aiid : self === urHost ? starModel.targetPerson().aiid : undefined },
        config: { limit: space.limitSelect, order: 'whenInserted DESC' },
      }),
      function (result) {
        if (result && result.length > 0 && (!self.ticeList().length || new Date(result[0].whenInserted) > new Date(self.ticeList()[0].whenInserted))) {
          self.ticeList(Date.iso2Date(result))
        } else {
          if (!initial) space.remind({ text: '没有新的服务。' })
        }
      },
      'json'
    ).always(function () {
      self.busyRefreshing(false)
    })
  }
  this.appendTiceList = function () {
    var self = this
    self.busyAppending(true)
    $.post(
      SOLET + 'Provice_getAll',
      starModel.normalize({
        Provice: {
          tag: 'TICE',
          ownerSid: self === myHome ? starModel.onlinePerson().aiid : self === urHost ? starModel.targetPerson().aiid : undefined,
          whenInserted: '<' + (self.ticeList().length > 0 ? self.ticeList()[self.ticeList().length - 1].whenInserted : '0000-00-00 00:00:00'),
        },
        config: { limit: space.limitSelect, order: 'whenInserted DESC' },
      }),
      function (result) {
        if (result && result.length > 0) {
          self.ticeList(Date.iso2Date(result))
        } else {
          space.remind({ text: '没有更多服务了。' })
        }
      },
      'json'
    ).always(function () {
      self.busyAppending(false)
    })
  }
  this.showTice = function (tice, index) {
    if (this === allSpace) {
      if (starModel.isOnline() && tice.ownerSid === starModel.onlinePerson().aiid) {
        starModel.targetPerson(starModel.onlinePerson())
        myHome.showTice(tice, undefined)
      } else {
        starModel.targetPerson(tice._data.owner)
        urHost.initPerson(starModel.targetPerson())
        urHost.showTice(tice, undefined)
      }
    } else {
      var self = this
      self.ticeNow(tice)
      self.ticeIndex = index
      //      if (self.hasOwnProperty('pickingAppointment')) self.pickingAppointment(false);
      self.sceneTice('TICE_ONE')
      self.stageNow('STAGE_TICE')
    }
  }
  ///////////////// Project/Person Log ///////////////////////////
  this.showLog = function (log, index) {
    if (this === allSpace) {
      if (starModel.isOnline() && log.ownerSid === starModel.onlinePerson().aiid) {
        starModel.targetPerson(starModel.onlinePerson())
        myHome.showLog(log, undefined)
      } else {
        starModel.targetPerson(log._data.owner)
        urHost.initPerson(starModel.targetPerson())
        urHost.showLog(log, undefined)
      }
    } else {
      var self = this
      self.logNow(log)
      self.logIndex = index
      self.stageNow('STAGE_LOG')
      self.sceneLog('LOG_ONE')
      self.getReplySet()
    }
  }
  this.visitLog = function (message) {
    // 从我的新闻动态、routeUrl 里进入消息。
    if (message.tag === 'PLOG' && sow.Tool.readPath('_data.agent._class', message) === 'Project') {
      space.showProject(message._data.agent, null, 'STAGE_LOG', 'LOG_ONE', function () {
        if (message._data.agent.ownerSid !== starModel.onlinePerson().aiid) {
          urProject.logNow(message)
          urProject.getReplySet()
          urProject.sceneLog('LOG_ONE')
        } else {
          myProject.logNow(message)
          myProject.getReplySet()
          myProject.sceneLog('LOG_ONE')
        }
      })
    } else if (message.tag === 'BLOG' && sow.Tool.readPath('_data.owner._class', message) === 'Person') {
      self.showPerson(message._data.owner, null, 'STAGE_LOG')
      if (message._data.owner.aiid !== starModel.onlinePerson().aiid) {
        urHost.logNow(message)
        urHost.getReplySet()
        urHost.sceneLog('LOG_ONE')
      } else {
        myHome.logNow(message)
        myHome.getReplySet()
        myHome.sceneLog('LOG_ONE')
      }
    } else if (message.tag === 'ZLOG') {
      starModel.targetPerson(sow.Const.PERSON_ALL)
      allSpace.logNow(message)
      allSpace.getReplySet()
      allSpace.stageNow('STAGE_LOG')
      allSpace.sceneLog('LOG_ONE')
    }
  }
  this.refreshLogList = function (obj, evt, initial) {
    var self = this
    self.logNow.reset() // 主要为了刷新 agentId。
    if (initial) self.logList([]) // 第一次加载，需要重置前一个person/project的logList。
    self.busyRefreshing(true)
    $.post(
      SOLET + 'Message_getAll',
      starModel.normalize({
        Message: {
          tag: self.logNow().tag,
          //          ownerId: self===myHome ? starModel.onlinePerson().aiid : self===urHost ? starModel.targetPerson().aiid : undefined,
          agentId: self.logNow().agentId, // self===allSpace ? sow.Const.PERSON_ALL.aiid : self.project ? self.project().aiid : undefined,
          agentClass: self.logNow().agentClass,
        },
        config: { limit: space.limitSelect, order: 'whenInserted DESC' },
      }),
      function (result) {
        if (result && result.length > 0 && (!self.logList().length || new Date(result[0].whenInserted) > new Date(self.logList()[0].whenInserted))) {
          self.logList(result)
        } else {
          if (!initial) space.remind({ text: '没有新的主题。' })
        }
      },
      'json'
    ).always(function () {
      self.busyRefreshing(false)
    })
  }
  this.appendLogList = function () {
    var self = this
    self.logNow.reset() // 主要为了刷新 agentId。
    self.busyAppending(true)
    $.post(
      SOLET + 'Message_getAll',
      starModel.normalize({
        Message: {
          tag: self.logNow().tag,
          agentId: self.logNow().agentId,
          agentClass: self.logNow().agentClass,
          whenInserted: '<' + (self.logList().length > 0 ? self.logList()[self.logList().length - 1].whenInserted : '0000-00-00 00:00:00'),
        },
        config: { limit: space.limitSelect, order: 'whenInserted DESC' },
      }),
      function (result) {
        if (result && result.length > 0) {
          self.logList(result)
        } else {
          space.remind({ text: '没有更多主题了。' })
        }
      },
      'json'
    ).always(function () {
      self.busyAppending(false)
    })
  }
  this.prepareLog = function () {
    var self = this
    if (starModel.isOnline()) {
      self.logNow.reset()
      self.sceneLog('LOG_ONE')
    } else {
      accountModel.dialogTitle('请先登录，即可发布内容')
      space.dialogNow('DIALOG_LOGIN')
    }
  }
  this.createLog = function () {
    var self = this
    if (starModel.isOnline() && !self.logNow().aiid) {
      if (space.validateStory(self.logNow())) {
        $.post(
          SOLET + 'Message_addOne',
          starModel.normalize({ Message: self.logNow() }),
          function (result) {
            if (result && result._class === 'Message') {
              self.logList.unshift(result)
              self.sceneLog('LOG_LIST')
              //          self.logNow(result);
              //          self.sceneLog('LOG_ONE');
            } else {
              space.remind({ text: '很抱歉，发布出错了，请稍后再试。', scenario: 'WARN' })
            }
          },
          'json'
        ).fail(function () {
          space.remind({ text: '很抱歉，发布出错了，请稍后再试。', scenario: 'WARN' })
        })
      } else {
        space.remind({ text: '请输入更多。标题至少' + sow.Const.MIN_TITLE + '字' })
      }
    } else {
      accountModel.dialogTitle('请先登录，即可发言')
      space.dialogNow('DIALOG_LOGIN')
    }
  }

  this.updateLog = function () {
    var self = this
    if (starModel.isOnline() && self.logNow().aiid) {
      // 首先遍历、删除为空的文字小节。
      /*    var i=0;
      while (i<self.logNow().content.length){
        var section=self.logNow().content[i];
        if (section.hasOwnProperty('text') && !section.text){
          self.logNow().content.splice(i,1);
        }else{
          i++;
        }
      }
  */
      if (space.validateStory(self.logNow())) {
        // 提交。
        // editor.feedback('正在保存中...');
        //        if (self.logNow().content.length<1) self.logNow().content='{}'; // 如果被删空为[]或者{}，就不会被作为参数送到后台。因此需要设为'[]'或NULL，强制通知后台清空。为了和后台默认的{}兼容，设为'{}'。
        $.post(
          SOLET + 'Message_setOne',
          starModel.normalize({ Message: self.logNow() }),
          function (result) {
            if (result && result._class === 'Message') {
              //              self.logNow(result); // 也许，不需要？因为文字已经被更新，而图片不在这里update。
              // 更新在汇总页上显示的标题。
              // 如果是从列表页点击进来的，其实logNow()和列表中的logList()[index]指向同一份拷贝，不需要再更新。但如果是从其他页面（比如新闻动态页面、分享的log页面链接）转来的，就需要手动更新。
              if (self.logList()[self.logIndex] && self.logList()[self.logIndex].aiid === result.aiid) {
                self.logList()[self.logIndex] = result
                self.logList(self.logList())
              } else {
                for (var i in self.logList()) {
                  if (self.logList()[i].aiid === result.aiid) {
                    self.logList()[i] = result
                    self.logList(self.logList())
                    break
                  }
                }
              }
              // 更新广场汇总页。
              for (var i in allSpace.logList()) {
                if (allSpace.logList()[i].aiid === result.aiid) {
                  allSpace.logList()[i] = result
                  allSpace.logList(allSpace.logList())
                  break
                }
              }
              //space.remind({text:'保存成功。'}); // editor.feedback('保存成功。');
            } else {
              //              space.remind({text:'保存失败，请勿担心，将在下个修改时一并保存。'}); // editor.feedback('保存失败，请稍后再试。');
            }
          },
          'json'
        ).fail(function () {
          //          space.remind({text:'保存失败，请勿担心，将在下个修改时一并保存。'}); // editor.feedback('保存失败，请稍后再试。');
        }) /*.always(function(){
          setTimeout(function(){editor.feedback('');},3000);
        });*/
      } else {
        space.remind({ text: '请输入更多。标题至少' + sow.Const.MIN_TITLE + '字' }) // editor.feedback('请输入更多。标题至少'+sow.Const.MIN_TITLE+'字');
        // setTimeout(function(){editor.feedback('');},3000);
      }
    }
  }

  /**
  this.deleteLog=function(index,element){ // 用于直接从列表中删除
    var self=this;
    dialog.showDialog({text:'真的删除这篇文章吗？',scenario:'DELETE',
      onConfirm:function(){
        $.post(SOLET+'Message_hideOne',
          { Message : starModel.normalize(self.logList()[index]) },
          function(result){
            if (result){
              self.logList.splice(index,1);
              space.remind({text:'删除成功', scenario:'SUCCESS'});
            }else{
              space.remind({text:'删除没有成功，请稍后再试一次', scenario:'WARN'});
            }
          },
          'json'
        ).fail(function(){
          space.remind({text:'删除没有成功，请稍后再试一次', scenario:'WARN'});
        }).always(function(){
          self.sceneLog('LOG_LIST');
          self.logNow({});
        });
      },
    onCancel:function(){
      self.sceneLog('LOG_LIST');
      self.logNow({});
    }
    });
  }
**/
  this.deleteLogNow = function () {
    var self = this
    dialog.showDialog({
      text: '真的删除本文吗？',
      scenario: 'DELETE',
      onConfirm: function () {
        $.post(
          SOLET + 'Message_hideOne',
          starModel.normalize({ Message: self.logNow() }),
          function (result) {
            if (result) {
              // 更新本人汇总页
              if (self.logList()[self.logIndex] && self.logList()[self.logIndex].aiid === self.logNow().aiid) {
                self.logList.splice(self.logIndex, 1)
              } else {
                for (var i in self.logList()) {
                  if (self.logList()[i].aiid === self.logNow().aiid) {
                    self.logList.splice(i, 1)
                    break
                  }
                }
              }
              // 更新广场汇总页
              if (self === myHome) {
                for (var i in allSpace.logList()) {
                  if (allSpace.logList()[i].aiid === result.aiid) {
                    allSpace.logList.splice(i, 1)
                    break
                  }
                }
              }
              self.sceneLog('LOG_LIST')
              self.logNow({})
              space.remind({ text: '删除成功', scenario: 'SUCCESS' })
            } else {
              space.remind({ text: '删除失败，请稍后再试一次', scenario: 'WARN' })
            }
          },
          'json'
        ).fail(function () {
          space.remind({ text: '删除失败，请稍后再试一次', scenario: 'WARN' })
        })
      },
    })
  }
  this.back2ListLog = function () {
    var self = this
    if (!self.logNow().aiid && ((self.logNow().title && self.logNow().title.replace(/ /g, '').length > 0) || self.contentLength(self.logNow().content) > 0)) {
      dialog.showDialog({ text: '真的要返回上页吗？<br>您正在编辑的内容还没有发布！', scenario: 'BACK2LIST', onConfirm: self.sceneLog.bind(self, 'LOG_LIST') })
    } else {
      self.sceneLog('LOG_LIST')
    }
  }

  this.addVote = function (vtid) {
    var self = this
    if (starModel.isOnline()) {
      // 在线 并且 和已经投过的票不同
      if (sow.Tool.readPath('_data.vote.vtid', self.logNow()) !== vtid) {
        $.post(
          SOLET + 'Message_setVote',
          starModel.normalize({ Message: { aiid: self.logNow().aiid }, vote: { vtid: vtid } }),
          function (vote) {
            if (vote) {
              if (vote.vtid === sow.Const.VT_GOOD) {
                self.logNow().voteGood++
                if (sow.Tool.readPath('_data.vote.vtid', self.logNow()) === sow.Const.VT_BAD) {
                  self.logNow().voteBad--
                }
              } else if (vote.vtid === sow.Const.VT_BAD) {
                self.logNow().voteBad++
                if (sow.Tool.readPath('_data.vote.vtid', self.logNow()) === sow.Const.VT_GOOD) {
                  self.logNow().voteGood--
                }
              }
              self.logNow()._data.vote = vote
              self.logNow(self.logNow()) // 刷新Mocube界面上读数。
              //              var mset=self.momentSet4Impression(); mset.sort(self.sort4Impression); self.momentSet4Impression([]); self.momentSet4Impression(mset);  // 重新排序并刷新卡片上读数。
              //              var mset=spaceAll.momentSet4Impression(); mset.sort(spaceAll.sort4Impression); spaceAll.momentSet4Impression([]); spaceAll.momentSet4Impression(mset);  // 重新排序并刷新卡片上读数。
              //              self.momentSet4Impression(self.momentSet4Impression().sort(self.sort4Impression)); // 这样只能重新排序，不会刷新卡片上读数。
              //              self.vtid(vote.vtid);
            }
          },
          'json'
        )
      } else {
        $.post(
          SOLET + 'Message_clearVote',
          starModel.normalize({ Message: { aiid: self.logNow().aiid }, vote: { vtid: vtid } }),
          function (vote) {
            if (vote && !vote.vtid) {
              if (vtid === sow.Const.VT_GOOD) {
                self.logNow().voteGood--
              } else if (vtid === sow.Const.VT_BAD) {
                self.logNow().voteBad--
              }
              self.logNow()._data.vote = vote
              self.logNow(self.logNow()) // 刷新Mocube界面上读数。
              //              var mset=self.momentSet4Impression(); mset.sort(self.sort4Impression); self.momentSet4Impression([]); self.momentSet4Impression(mset);  // 重新排序并刷新卡片上读数。
              //              var mset=spaceAll.momentSet4Impression(); mset.sort(spaceAll.sort4Impression); spaceAll.momentSet4Impression([]); spaceAll.momentSet4Impression(mset);  // 重新排序并刷新卡片上读数。
              //              self.momentSet4Impression(self.momentSet4Impression().sort(self.sort4Impression)); // 这样只能重新排序，不会刷新卡片上读数。
              //              self.vtid(null);
            }
          },
          'json'
        )
      }
    } else {
      accountModel.dialogTitle('请先登录，即可点赞')
      space.dialogNow('DIALOG_LOGIN')
    }
  }

  this.supportOnline = function () {
    if (sow.Const.PERSON_HELP) {
      space.showPerson(sow.Const.PERSON_HELP, null, 'STAGE_CHAT')
    } else {
      $.post(
        SOLET + 'Person_getOne',
        starModel.normalize({ Person: { aiid: sow.Const.SID_HELP } }),
        function (person) {
          if (person && person._class === 'Person') {
            sow.Const.PERSON_HELP = person
            space.showPerson(person, null, 'STAGE_CHAT')
          } else {
            sow.Const.PERSON_HELP = {
              _class: 'Person',
              aiid: sow.Const.SID_HELP,
              name: '客服',
              nick: '客服',
              phone: '+86-40010063270',
              icon: sow.Const.SID_HELP_ICON,
              info: {},
            }
            space.showPerson(sow.Const.PERSON_HELP, null, 'STAGE_CHAT')
          }
        },
        'json'
      )
    }
  }

  ////////////////// Replies //////////////////////////

  this.replyMessage = function (messageObservable, textarea) {
    var self = this
    if (starModel.isOnline()) {
      if (space.validateTitle(self.newReply().content.text)) {
        // todo: 仅限当前项目主持人或成员能够参与行动讨论
        //      self.newReply().ownerSid=starModel.onlinePerson().aiid;
        $.post(
          SOLET + 'Message_reply',
          starModel.normalize({ Message: self.newReply(), sourceMessage: messageObservable() }),
          function (newReply) {
            if (newReply && newReply._class === 'Message') {
              self.newReply.reset()
              sow.UI.resetMinHeightTextarea(textarea)
              self.replySet.unshift(newReply)
              messageObservable().replyCount++
              messageObservable(messageObservable())
              // 更新列表页面上的消息回复数量。必须用一个新对象才行，所以 JSON.parse(JSON.stringify(。。。))
              if (self.logList()[self.logIndex] && self.logList()[self.logIndex].aiid === self.logNow().aiid) {
                self.logList()[self.logIndex] = JSON.parse(JSON.stringify(self.logNow()))
                self.logList(self.logList())
              } else {
                for (var i in self.logList()) {
                  if (self.logList()[i].aiid === self.logNow().aiid) {
                    self.logList()[i] = JSON.parse(JSON.stringify(self.logNow()))
                    self.logList(self.logList())
                    break
                  }
                }
              }
              //              space.remind({text:'您的回复发表成功啦！'});
            } else {
              space.remind({ text: Locale[starModel.userLang()].dialogFeedback['SUBMIT_REPLY_FAIL'], scenario: 'WARN' })
            }
          },
          'json'
        ).fail(function () {
          space.remind({ text: '发生错误，可能是网络连接有问题。请稍后再试' })
        })
      } else {
        space.remind({ text: '请输入更多。至少' + sow.Const.MIN_TITLE + '个字' })
      }
    } else {
      accountModel.dialogTitle('请先登录，即可回复')
      space.dialogNow('DIALOG_LOGIN')
    }
  }

  this.getReplySet = function () {
    var self = this
    self.replySet([])
    if (self.logNow().aiid) {
      $.post(
        SOLET + 'Message_getReplyMessageSet',
        starModel.normalize({ Message: self.logNow(), config: { limit: space.limitSelect, order: 'whenInserted DESC' } }),
        function (messageSet) {
          if (messageSet && messageSet.length > 0) {
            self.replySet(messageSet) // 注意，也许返回为空，则不该把空赋给 replySet，否则 replySet()初始化的[]不成立，造成reply时 replySet.unshift失败。
          }
        },
        'json'
      )
    }
  }

  this.refreshReplySet = function () {
    var self = this
    if (self.logNow().aiid) {
      self.busyRefreshing(true)
      $.post(
        SOLET + 'Message_getReplyMessageSet',
        starModel.normalize({ Message: self.logNow(), config: { limit: space.limitSelect, order: 'whenInserted DESC' } }),
        function (messageSet) {
          if (
            messageSet &&
            messageSet.length > 0 &&
            (!self.replySet().length || new Date(messageSet[0].whenInserted) > new Date(self.replySet()[0].whenInserted))
          ) {
            self.replySet(messageSet) // 注意，也许返回为空，则不该把空赋给 replySet，否则 replySet()初始化的[]不成立，造成reply时 replySet.unshift失败。
          } else {
            space.remind({ text: '没有新的回复。' })
          }
        },
        'json'
      ).always(self.busyRefreshing.bind(self, false))
    }
  }
  this.appendReplySet = function () {
    var self = this
    if (self.logNow().aiid && self.replySet().length) {
      self.busyAppending(true)
      $.post(
        SOLET + 'Message_getReplyMessageSet',
        starModel.normalize({
          Message: self.logNow(),
          messageSet: { whenInserted: '<' + (self.replySet().length > 0 ? self.replySet()[self.replySet().length - 1].whenInserted : '0000-00-00 00:00:00') },
          config: { limit: space.limitSelect, order: 'whenInserted DESC' },
        }),
        function (messageSet) {
          if (messageSet && messageSet.length > 0) {
            self.replySet(messageSet) // 注意，也许返回为空，则不该把空赋给 replySet，否则 replySet()初始化的[]不成立，造成reply时 replySet.unshift失败。
          } else {
            space.remind({ text: '没有更多回复了。' })
          }
        },
        'json'
      ).always(self.busyAppending.bind(self, false))
    }
  }
  ////////////////////////////////////////////

  this.progress = ko.observable(-1) // 从 -1% 起步，以免在上传过程之外，白条也被显示。
  this.uploadProgress = function (evt) {
    if (evt.lengthComputable) {
      space.progress(Math.round((evt.loaded * 101 * 100) / (evt.total * 100) - 1)) // 把 0%~100% 映射到 -1%~100%，即100份映射到101份，为了让前端能够从-1%开始移动。
    }
    if (space.progress() >= 100) space.progress(-1)
  }
  this.uploadFail = function (errorType) {
    // 前端上传失败。
    switch (errorType) {
      case 'UPLOAD_OVERSIZED':
        space.remind({ text: '太大了，不能上传', scenario: 'WARN' })
        break
      case 'UPLOAD_BADEXT':
        space.remind({ text: '格式不对', scenario: 'WARN' })
        break
      case 'UPLOAD_NOSUPPORT':
        space.remind({ text: '您的设备系统不支持上传', scenario: 'WARN' })
        break
      case 'UPLOAD_FAIL':
      default:
        space.remind({ text: '上传发生意外，请再试一次', scenario: 'WARN' })
        break
    }
  }

  this.parseWhen = function (when) {
    // "2016-10-20 19:52:52" 或者 ISOString "2016-11-25T08:07:31.918Z"
    if (typeof when === 'string') {
      when = new Date(when)
      /*      return when.replace(/^(\d+)-(\d+)-(\d+).*$/, function(dateString, yyyy,mm,dd){
        return '<div>'+parseInt(dd)+'</div>' + '<div>'+self.monthLocale[parseInt(mm)]+'</div>' + '<div>'+yyyy+'</div>';
      }); */
    }
    if (when instanceof Date && when.toJSON()) {
      return '<div>' + when.getDate() + '</div>' + '<div>' + self.monthLocale[when.getMonth() + 1] + '</div>' + '<div>' + when.getFullYear() + '</div>'
    } else {
      return '<div></div><div></div><div></div>'
    }
  }
  /*
  this.getLeftTime=function(){
    var self=this;
    var now=new Date();
    var then=Date.parseDT(self.project().dateEndFund);
    then.setHours(23); then.setMinutes(59); then.setSeconds(59); // 确保要和截至日期的最后一秒比！
    var secs=parseInt((then-now)/1000);
    var days, hours, mins;
    if (then.toJSON() && secs>=0){
      if (days=parseInt(secs/(60*60*24))){
        return days+' 天';
      }else if (hours=parseInt(secs/(60*60))){
        return hours+' 小时';
      }else if (mins=parseInt(secs/60)){
        return mins+' 分钟';
      }else{
        return secs+' 秒';
      }
    }else{
      return '0';
    }
  }
  this.updateFundIndicator=function(){
    var self=this;
    if (parseInt(self.project().fundGoal)>0) {
      self.fundAmountIndicator.option('maxValue',self.project().fundGoal);
      self.fundAmountIndicator.animate(parseFloat(self.project().fundAmount)||0);
      if (parseFloat(self.project().fundAmount)>parseFloat(self.project().fundGoal)) { // 要是不这样强行设置，就只会显示maxValue。
        self.fundAmountIndicator.option('format', function(){ return parseFloat(self.project().fundAmount)||0; });
      }
    }else if (parseInt(self.project().fundGoal)===0) {
      if (parseFloat(self.project().fundAmount)>=0.01) {
        self.fundAmountIndicator.option('maxValue',2*parseFloat(self.project().fundAmount));
        self.fundAmountIndicator.animate(parseFloat(self.project().fundAmount));
      }else{
        self.fundAmountIndicator.option('maxValue',100);
        self.fundAmountIndicator.animate(0);
      }
    }else if (self.fundAmountIndicator) {
//        self.fundAmountIndicator.option('displayNumber',false);
        self.fundAmountIndicator.option('maxValue',0);
        self.fundAmountIndicator.animate(0);
    }      
  }
*/

  this.buyer2seller = function (price) {
    var price = parseFloat(price)
    if (!isNaN(price)) {
      price = price * 0.8
      if (price >= 1) price = parseInt(price)
      else price = parseInt(price * 100) / 100 // 取小数点后2位
      return price >= 0.01 ? price : price === 0 ? '协商' : '待定'
    }
    return '待定'
  }
  this.seller2buyer = function (price) {
    var price = parseFloat(price)
    if (!isNaN(price)) {
      price = parseInt(price / 0.8)
      return price >= 0.01 ? price : price === 0 ? '协商' : '待定'
    }
    return '待定'
  }

  this.path2url = function (path, asBgimg) {
    var url = undefined
    if (path && typeof path === 'string') {
      if (path.match(new RegExp(sow.Const.ST_PERSON_ICON))) url = 'image/ST_PERSON.png'
      else if (path.match(new RegExp(sow.Const.SID_ALL_ICON))) url = undefined
      else url = SOFILE + path
    }
    if (asBgimg && url) {
      url = 'url(' + url + ')'
    }
    return url
  }

  this.goHome = function (stage) {
    // 点击右上角哭脸或头像时
    if (starModel.isOnline()) {
      starModel.targetPerson(starModel.onlinePerson())
      space.inProject('NONE_PROJECT')
      if (typeof stage === 'string' && stage) myHome.stageNow(stage)
    } else {
      accountModel.dialogTitle('')
      space.dialogNow('DIALOG_LOGIN')
    }
  }
  this.goAll = function (stage) {
    starModel.targetPerson(sow.Const.PERSON_ALL)
    space.inProject('NONE_PROJECT')
    if (typeof stage === 'string' && stage) allSpace.stageNow(stage)
  }

  this.updateCare = function (target) {
    var self = this
    if (starModel.isOnline()) {
      if (space.inProject() === 'NONE_PROJECT') {
        var targetObservable = starModel.targetPerson
      } else {
        var targetObservable = self.project
      }
      $.post(
        SOLET + 'Person_getCare',
        starModel.normalize({ target: target }),
        function (result) {
          if (result && result._class === 'Care') {
            targetObservable()._data = targetObservable()._data || {}
            targetObservable()._data.care = result
            targetObservable(targetObservable())
          } else {
            // 这时，可能是（或总是）尚未建立过关注关系，因此在数据库里不存在。
          }
        },
        'json'
      ).fail(function () {
        //        space.remind({text:'关注状态获取失败，请注意。'});
      })
    } else {
      //     space.remind({text:'匿名用户不存在关注状态哦！'});
    }
  }

  this.toggleCare = function () {
    var self = this
    if (starModel.isOnline()) {
      if (starModel.where() === 'SPACE_HOST') {
        if (space.inProject() === 'NONE_PROJECT') {
          var targetObservable = starModel.targetPerson
        } else {
          var targetObservable = self.project
        }
        $.post(
          SOLET + 'Person_setCare',
          starModel.normalize({
            target: targetObservable(),
            status: sow.Tool.readPath('_data.care.status', targetObservable()) === sow.Const.STAT_ON ? sow.Const.STAT_OFF : sow.Const.STAT_ON,
          }),
          function (result) {
            if (result && result._class === 'Care') {
              targetObservable()._data = targetObservable()._data || {}
              targetObservable()._data.care = result
              targetObservable(targetObservable())
              space.remind({ text: result.status === sow.Const.STAT_ON ? '您成功关注了对方！' : '你成功取消了关注。' })
            } else {
              space.remind({ text: '很抱歉，操作出错了，请稍后再试。' })
            }
          },
          'json'
        ).fail(function () {
          space.remind({ text: '很抱歉，操作出错了，请稍后再试。' })
        })
      }
    } else {
      accountModel.dialogTitle('请先登录，即可关注')
      space.dialogNow('DIALOG_LOGIN')
    }
    //    this.toggleRingMenu();
  }

  this.showComplain = function () {
    var self = this
    if (starModel.isOnline()) {
      dialog.showDialog({
        text: '您发现了非法的、不良的内容？<br>您可发起投诉！',
        scenario: 'COMPLAIN',
        autoCancel: false,
        onConfirm: function () {
          dialog.busy(true)
          $.post(
            SOLET + 'Person_complain',
            starModel.normalize({ Person: starModel.onlinePerson(), target: space.inProject() === 'NONE_PROJECT' ? starModel.targetPerson() : self.project() }),
            function (success) {
              if (success) {
                dialog.cancelDialog()
                space.remind({ text: '投诉已经提交，感谢您的监督支持！' })
              } else {
                dialog.showDialog({ text: '投诉提交失败，请再试一次，或者呼叫客服 400-100-6327', scenario: 'ALERT' })
              }
            },
            'json'
          ).always(function () {
            dialog.busy(false)
          })
        },
      })
    } else {
      accountModel.dialogTitle('请先登录，即可发起投诉')
      space.dialogNow('DIALOG_LOGIN')
    }
    //    this.toggleRingMenu();
  }

  this.showPerson = function (person, evt, stage) {
    // 点击回复列表等等中的头像时。也可以是点击左上角的广场时。
    var self = this
    if (person && person._class === 'Person') {
      if (person.aiid === starModel.onlinePerson().aiid && person.aiid !== sow.Const.SID_UNKNOWN) {
        // 就是在线用户自己
        starModel.targetPerson(starModel.onlinePerson())
        space.inProject('NONE_PROJECT')
        myHome.stageNow(typeof stage === 'string' && stage ? stage : 'STAGE_ABOUT') // 默认去名片/关于
      } else if (person.aiid === sow.Const.PERSON_ALL.aiid) {
        // person === sow.Const.PERSON_ALL
        starModel.targetPerson(person)
        space.inProject('NONE_PROJECT')
        allSpace.stageNow(typeof stage === 'string' && stage ? stage : 'STAGE_ABOUT') // 默认去广场的关于
      } else if (person.aiid !== sow.Const.PERSON_UNKNOWN.aiid) {
        // 第三方
        starModel.targetPerson(person) // initPerson里需要用到 targetPerson，因此放在前面。但实践中似乎放在后面也不影响正确显示。
        urHost.initPerson()
        space.inProject('NONE_PROJECT')
        urHost.stageNow(typeof stage === 'string' && stage ? stage : 'STAGE_ABOUT') // 默认去第三方的名片/关于
        urHost.updateCare(person)
      } else {
        // 匿名用户
        //        accountModel.dialogTitle('');
        //        space.dialogNow('DIALOG_LOGIN');
      }
    }
  }

  this.contentLength = function (content) {
    // 如果只有一段文字的dream或content，100个字符（不论中英文）相当于JSON.stringify(...)=113，因为 [{"text":""}] 本身有13个字符。
    var lenText = 0
    for (var i in content) {
      if (content[i].hasOwnProperty('text') && typeof content[i].text === 'string') lenText += content[i].text.replace(/\s/g, '').length
    }
    return lenText // content?JSON.stringify(content).length:0;
  }
  this.imageCount = function (content) {
    // 如果只有一段文字的dream或content，100个字符（不论中英文）相当于JSON.stringify(...)=113，因为 [{"text":""}] 本身有13个字符。
    var lenMedia = 0
    for (var i in content) {
      if (content[i].hasOwnProperty('image')) lenMedia += 1
    }
    return lenMedia // content?JSON.stringify(content).length:0;
  }
  this.textLength = function (text) {
    if (typeof text === 'string') return text.replace(/\s/g, '').length
    return null
  }

  this.validateStory = function (story) {
    var titleLength = story.title ? story.title.replace(/ /g, '').length : 0
    //    var contentLength=self.contentLength(story.content);
    //    var storyLength=titleLength+contentLength;
    if (
      sow.Const.MIN_TITLE <= titleLength &&
      titleLength <= sow.Const.MAX_TITLE
      //      && self.minContent<=contentLength && contentLength<=self.maxContent
      //      && self.minStory<=storyLength && storyLength<=self.maxStory
    ) {
      return true
    }
    return false
  }
  this.validateTitle = function (title) {
    var titleLength = title ? title.replace(/ /g, '').length : 0
    if (sow.Const.MIN_TITLE <= titleLength && titleLength <= sow.Const.MAX_TITLE) {
      return true
    }
    return false
  }

  this.refineList = function (oldList) {
    var newList = []
    if (oldList !== null && typeof oldList === 'object' && oldList.constructor.name === 'Array') {
      for (var i in oldList) {
        if (
          (typeof oldList[i].ukey === 'string' && oldList[i].ukey.replace(/ /g, '')) ||
          (typeof oldList[i].uvalue === 'string' && oldList[i].uvalue.replace(/ /g, ''))
        ) {
          newList.push(oldList[i])
        }
      }
    }
    return newList
  }

  //  this.onRingMenu=ko.observable(false);
  //  this.toggleRingMenu=function(){
  //    this.onRingMenu(!this.onRingMenu());
  //  }
})()

// editor的定义 需要引用 space，所以只能放在 space 后。
window.editor = new sow.Editor({ busyUploading: space.busyUploading, onUploadProgress: space.uploadProgress, onUploadFail: space.uploadFail })

window.allSpace = new (function (options) {
  var self = this
  this.constructor = arguments.callee
  this.__proto__ = space

  this.stageNow = ko.observable('STAGE_PROSET')

  this.proset = ko.observableArray([])

  this.logList = ko.observableArray([])
  this.logNow = ko.observable()
  this.logNow.reset = function () {
    this({ tag: 'BLOG', agentClass: 'Person', agentId: undefined })
    return this()
  }
  this.logNow.reset()

  this.taskList = ko.observableArray([])

  this.ticeList = ko.observableArray([])

  this.setModel(options)

  this.initData = function () {
    self.refreshProset(null, null, true)
    self.refreshTiceList(null, null, true)
    self.refreshTaskList(null, null, true)
    self.refreshLogList(null, null, true)
  }

  this.chatroom = new sow.Chat()

  this.onChat = ko.computed(function () {
    // 对广场聊天，网开一面，始终保持连接。这样切换回去时，不需要重新加载、避免页面停顿。
    if (self.stageNow() === 'STAGE_CHAT' && starModel.where() === 'SPACE_ALL') {
      // 当用户进入广场聊天页面
      self.chatroom.joinChatRoom(':')
    }
  })
  this.reChat = function () {
    self.chatroom.leaveChatRoom()
    self.chatroom.joinChatRoom(':')
  }
  accountModel.addListener('LOGIN_SUCCESS', this.reChat)
  accountModel.addListener('LOGOUT_SUCCESS', this.reChat)

  // 似乎没必要等 ready 再执行。
  $(document).ready(function () {
    self.initData()
  })
})()

window.myHome = new (function (options) {
  var self = this
  this.constructor = arguments.callee
  this.__proto__ = space // 实例.__proto__ 等价于 构建函数.prototype。也可在函数定义后，写 函数名.prototype=原型对象。

  this.stageNow = ko.observable('STAGE_CHAT')

  this.proset = ko.observableArray([])
  this.prosetLeader = ko.observableArray([])
  this.prosetMember = ko.observableArray([])
  this.prosetVisitor = ko.observableArray([])

  this.sceneLog = ko.observable('LOG_LIST')
  this.logList = ko.observableArray([])
  this.logNow = ko.observable({})
  this.logNow.reset = function () {
    this({ tag: 'BLOG', agentClass: 'Person', agentId: starModel.onlinePerson().aiid, title: '', content: [{ text: '' }] })
    return this()
  }
  this.logNow.reset()
  this.logIndex

  this.replySet = ko.observableArray([])
  this.newReply = ko.observable()
  this.newReply.reset = function () {
    this({ content: {}, tag: 'MT_REPLY' })
    return this()
  }
  this.newReply.reset()

  this.sceneTice = ko.observable('TICE_LIST')
  this.ticeList = ko.observableArray([])
  this.ticeNow = ko.observable({})
  this.ticeNow.reset = function () {
    this({ tag: 'TICE', content: { ticeUnit: 'H', detail: [{ text: '' }] } })
    return this
  }
  this.ticeNow.reset()
  this.ticeIndex
  this.appointment = ko.observable('')

  this.noticeList = ko.observableArray([])

  this.sceneTask = ko.observable('TASK_LIST')
  this.taskList = ko.observableArray([])
  this.taskNow = ko.observable()
  this.taskNow.reset = function () {
    this({ tag: 'TASK', info: { dutyAndGain: [{ text: '' }] } })
    return this()
  }
  this.taskNow.reset()
  this.taskIndex
  this.prepareTask = function () {
    if (starModel.isOnline()) {
      self.taskNow.reset()
      self.sceneTask('TASK_ONE')
      self.stageNow('STAGE_TASK')
      space.inProject('NONE_PROJECT')
      starModel.targetPerson(starModel.onlinePerson())
    } else {
      accountModel.dialogTitle('请先登录，即可发布内容')
      self.dialogNow('DIALOG_LOGIN')
    }
  }
  this.updateTask = function () {
    if (starModel.isOnline() && self.taskNow().aiid && self.validateTask()) {
      //        if (sow.Tool.isArray(self.taskNow().content.detail) && self.taskNow().content.detail.length<1) self.taskNow().content.detail='[]'; // 如果被删空为[]或者{}，就不会被作为参数送到后台。因此需要设为'[]'或NULL，强制通知后台清空。为了和后台默认的{}兼容，设为'{}'。
      $.post(
        SOLET + 'Circle_setOne',
        starModel.normalize({ Circle: self.taskNow() }),
        function (result) {
          if (result && result._class === 'Circle') {
            result._data = self.taskNow()._data // 保留 memberSet, invitedSet, appliedSet 名单。
            self.taskNow(Date.iso2Date(result)) // 为了更新需要动态计算的一些数值，例如剩余份额。
            // 更新本人汇总页。
            if (self.taskList()[self.taskIndex] && self.taskList()[self.taskIndex].aiid === result.aiid) {
              self.taskList()[self.taskIndex] = result
              self.taskList(self.taskList())
            } else {
              for (var i in self.taskList()) {
                if (self.taskList()[i].aiid === result.aiid) {
                  self.taskList()[i] = result
                  self.taskList(self.taskList())
                  break
                }
              }
            }
            // 更新广场汇总页。
            for (var i in allSpace.taskList()) {
              if (allSpace.taskList()[i].aiid === result.aiid) {
                allSpace.taskList()[i] = result
                allSpace.taskList(allSpace.taskList())
                break
              }
            }
            //space.remind({text:'保存成功。'});
          } else {
            //              space.remind({text:'保存失败。请勿担心，将在下个修改时一并保存。'});
          }
        },
        'json'
      ).fail(function () {
        //          space.remind({text:'保存失败。请勿担心，将在下个修改时一并保存。'});
      })
    }
  }
  this.back2ListTask = function () {
    var self = this
    if (!self.taskNow().aiid && (self.taskNow().name || self.taskNow().memberQuota)) {
      dialog.showDialog({
        text: '真的要返回上页吗？<br>您正在编辑的内容还没有发布！',
        scenario: 'BACK2LIST',
        onConfirm: self.sceneTask.bind(self, 'TASK_LIST'),
      })
    } else {
      self.sceneTask('TASK_LIST')
    }
  }
  this.validateTask = function () {
    return true
  }
  this.createTask = function () {
    if (starModel.isOnline() && !self.taskNow().aiid && self.validateTask()) {
      self.taskNow().agentId = starModel.onlinePerson().aiid
      $.post(
        SOLET + 'Circle_addOne',
        starModel.normalize({ Circle: self.taskNow() }),
        function (result) {
          if (result && result._class === 'Circle') {
            self.taskList.unshift(Date.iso2Date(result))
            self.sceneTask('TASK_LIST')
            //            self.taskNow(result);
            allSpace.taskList.unshift(result)
          } else {
            space.remind({ text: '很抱歉，发布出错了，请稍后再试。' })
          }
        },
        'json'
      ).fail(function () {
        space.remind({ text: '很抱歉，发布出错了，请稍后再试。' })
      })
    }
  }
  this.preparePayTask = function (seller) {
    var self = this
    if (!starModel.isOnline()) {
      accountModel.dialogTitle('请先登录，即可支付')
      space.dialogNow('DIALOG_LOGIN')
    } else if (isNaN(parseFloat(self.taskNow().info.price))) {
      space.remind({ text: '支付金额不能为空。' })
    } else {
      tradeModel.provice(self.taskNow())
      tradeModel.payTotal(self.taskNow().info.price)
      tradeModel.payCurrency(self.taskNow().info.currency)
      tradeModel.refundPolicy(false)
      tradeModel.dialogTitle(self.taskNow().name + '<br>接单人：' + seller.nick)
      localStorage['postpayUrl'] = self.getForwardTarget().href
      space.dialogNow('DIALOG_PAY')
    }
  }

  // 不知为何，如果定义 var fileInput 在上传函数本身里，在 safari/iOS 上就无法上传文件。必须单独写在外面。
  this.fileInput = document.createElement('input')
  this.fileInput.type = 'file'

  this.setModel(options)

  this.referUser = function (channel) {
    var target = {
      href: starModel.starUrl + '?id=' + starModel.onlinePerson().aiid + '&action=REFER', // 不知为何，aiid放在链接末尾就无法转发到QQ。
      content: '想要更自由的生活？ ' + starModel.onlinePerson().nick + '向您推荐 [' + starModel.starName + ']',
      pictures: ['_www/image/favicon_76.png'],
    }
    this.shareTarget(target, channel)
  }

  ko.computed(function () {
    if (self.sceneTice() === 'TICE_LIST' && self.stageNow() === 'STAGE_TICE' && starModel.where() === 'SPACE_HOME' && space.inProject() === 'NONE_PROJECT') {
      // 由于datepicker的实现不完美，具有container的picker在其他picker启动时，会被覆盖掉，所以需要重新生成。
      $('#myTiceDateInput').focus()
    }
  })
  this.back2ListTice = function () {
    if (!self.ticeNow().aiid && (self.ticeNow().title || self.ticeNow().price || self.ticeNow().orderQuota)) {
      dialog.showDialog({
        text: '真的要返回上页吗？<br>您正在编辑的内容还没有发布！',
        scenario: 'BACK2LIST',
        onConfirm: self.sceneTice.bind(self, 'TICE_LIST'),
      })
    } else {
      self.sceneTice('TICE_LIST')
    }
  }
  this.prepareTice = function () {
    if (starModel.isOnline()) {
      self.ticeNow.reset()
      self.sceneTice('TICE_ONE')
      self.stageNow('STAGE_TICE')
      space.inProject('NONE_PROJECT')
      starModel.targetPerson(starModel.onlinePerson())
    } else {
      accountModel.dialogTitle('请先登录，即可发布内容')
      self.dialogNow('DIALOG_LOGIN')
    }
  }
  this.validateTice = function () {
    if (!(parseInt(self.ticeNow().content.ticeCount) >= 0)) {
      space.remind({ text: '请填写时间长度。（0~999 之间的数字）' })
    } else if (!(parseFloat(self.ticeNow().price) >= 0.01 || parseFloat(self.ticeNow().price) === 0)) {
      space.remind({ text: '请填写价格金额。（0~999999 之间的金额）' })
    } else if (!(typeof self.ticeNow().title === 'string' && sow.Const.MIN_NAME <= self.ticeNow().title.replace(/ /g, '').length)) {
      space.remind({ text: '请填写服务或产品的名称。最少为 ' + sow.Const.MIN_NAME + ' 个字。' })
    } else {
      return true
    }
    return false
  }
  this.createTice = function () {
    if (starModel.isOnline() && !self.ticeNow().aiid && self.validateTice()) {
      //      self.ticeNow().agentId=self.project().aiid;
      $.post(
        SOLET + 'Provice_addOne',
        starModel.normalize({ Provice: self.ticeNow() }),
        function (result) {
          if (result && result._class === 'Provice') {
            self.ticeList.unshift(Date.iso2Date(result))
            self.sceneTice('TICE_LIST')
          } else {
            space.remind({ text: '很抱歉，发布出错了，请稍后再试。' })
          }
        },
        'json'
      ).fail(function () {
        space.remind({ text: '很抱歉，发布出错了，请稍后再试。' })
      })
    }
  }
  this.updateTice = function () {
    if (starModel.isOnline() && self.ticeNow().aiid && self.validateTice()) {
      //        if (sow.Tool.isArray(self.ticeNow().content.detail) && self.ticeNow().content.detail.length<1) self.ticeNow().content.detail='[]'; // 如果被删空为[]或者{}，就不会被作为参数送到后台。因此需要设为'[]'或NULL，强制通知后台清空。为了和后台默认的{}兼容，设为'{}'。
      $.post(
        SOLET + 'Provice_setOne',
        starModel.normalize({ Provice: self.ticeNow() }),
        function (result) {
          if (result && result._class === 'Provice') {
            self.ticeNow(Date.iso2Date(result)) // 为了更新需要动态计算的一些数值，例如剩余份额。
            // 更新在汇总页上显示的标题。
            if (self.ticeList()[self.ticeIndex] && self.ticeList()[self.ticeIndex].aiid === result.aiid) {
              self.ticeList()[self.ticeIndex] = result
              self.ticeList(self.ticeList())
            } else {
              for (var i in self.ticeList()) {
                if (self.ticeList()[i].aiid === result.aiid) {
                  self.ticeList()[i] = result
                  self.ticeList(self.ticeList())
                  break
                }
              }
            }
            // 更新广场汇总页。
            for (var i in allSpace.ticeList()) {
              if (allSpace.ticeList()[i].aiid === result.aiid) {
                allSpace.ticeList()[i] = result
                allSpace.ticeList(allSpace.ticeList())
                break
              }
            }
            //space.remind({text:'保存成功。'});
          } else {
            //              space.remind({text:'保存失败。请勿担心，将在下个修改时一并保存。'});
          }
        },
        'json'
      ).fail(function () {
        //          space.remind({text:'保存失败。请勿担心，将在下个修改时一并保存。'});
      })
    }
  }

  this.confirmLogout = function () {
    dialog.showDialog({ text: '真的要退出账户吗？<br>退出后，许多功能不能使用！', scenario: 'LOGOUT', onConfirm: accountModel.logout })
  }
  accountModel.addListener('LOGOUT_SUCCESS', function () {
    // 或者重新定义logout函数, 直接调用 accountModel.logout, 再执行清空。但会不会有这种情况：这时其实isOnline()仍然成立，从而proset的变化导致自动调用本方法? 因此还是用addListener安全。
    //    space.showPerson(starModel.targetPerson()); // 这样可以简单的重新加载新用户。
    // 下面的方法，原封不动的回到当前所在的一切位置。
    urHost.proset(self.proset())
    sow.Tool.setWaterfall()
    self.proset([])
    urHost.taskList(self.taskList())
    urHost.taskNow(self.taskNow())
    urHost.sceneTask(self.sceneTask())
    self.taskList([])
    urHost.ticeList(self.ticeList())
    urHost.ticeNow(self.ticeNow())
    urHost.sceneTice(self.sceneTice())
    self.ticeList([])
    self.noticeList([])
    urHost.logList(self.logList())
    urHost.logNow(self.logNow())
    urHost.sceneLog(self.sceneLog())
    self.logList([])
    urHost.stageNow(self.stageNow())
  })

  this.initPerson = function () {
    self.stageNow('STAGE_CHAT')
    self.sceneLog('LOG_LIST')
    self.sceneTice('TICE_LIST')
    self.sceneTask('TASK_LIST')

    self.refreshProset(null, null, true)
    //    self.logNow.reset(); // 如果本方法定义成 computed, 千万注意这里也依赖于logNow，一旦其他地方调用了 logNow(log) 就导致刷新！
    self.refreshLogList(null, null, true) // 如果 refreshLogList(null, null, true) 里调用 logNow.reset()，如果更换了logNow()，就会导致重新 initPerson.reset，或者logNow.reset不要去更换logNow()而是单独修改所有元素 logNow().xxx
    self.refreshTaskList(null, null, true)
    self.refreshTiceList(null, null, true)
    self.getAllNotice(null, null, true)
  }

  this.getAllNotice = function (obj, evt, initial) {
    if (initial) self.noticeList([]) // 如果是初始化，那就先清空上一个用户的新闻。
    $.post(
      SOLET + 'Person_getAllNotice',
      starModel.normalize({ since: new Date() }), // 调用stringify，来添加 _passtoken 和 starId
      function (noticeList) {
        if (Array.isArray(noticeList) && noticeList.length > 0) {
          self.noticeList(noticeList)
          if (!initial) space.remind({ text: '最新消息已加载' })
        } else {
          if (!initial) space.remind({ text: '没有新的消息。' })
        }
      },
      'json'
    )
  }

  this.appendItem = function () {
    if (typeof starModel.onlinePerson().info.userlist === 'object') {
      starModel.onlinePerson().info.userlist.push({})
    } else {
      starModel.onlinePerson().info.userlist = [{}]
    }
    starModel.onlinePerson(starModel.onlinePerson())
  }

  this.updateAbout = function () {
    if (starModel.where() === 'SPACE_HOME' && this.stageNow() === 'STAGE_ABOUT') {
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
      } else {
        // 符合格式
        starModel.onlinePerson().phone = starModel.onlinePerson().countryCode + starModel.onlinePerson().callNumber
      }
      starModel.onlinePerson().info.userLang = starModel.userLang()
      starModel.onlinePerson().info.userlist = space.refineList(starModel.onlinePerson().info.userlist) // 清理用户输入的列表中的空白项。
      // 不在这里执行，避免执行两次onlinePerson(onlinePerson)      starModel.onlinePerson(starModel.onlinePerson()); // 更新清理空白项后的界面
      $.post(
        SOLET + 'Person_setOne',
        starModel.normalize({ Person: starModel.onlinePerson() }),
        function (result) {
          if (result && result._class === 'Person') {
            //            space.remind({text:'您的资料更新成功啦。'});
          } else {
            //            space.remind({text:'保存失败。请勿担心，将在下个修改时一并保存。'});
          }
        },
        'json'
      )
        .fail(function () {
          //        space.remind({text:'保存失败。请勿担心，将在下个修改时一并保存。'});
        })
        .always(function () {
          starModel.onlinePerson(starModel.onlinePerson()) // 确保更新界面上绑定到onlinePerson的数据。
        })
      // todo: 注意，如果新输入的email/phone在后台已经存在，那么update也返回false。需要改进，给用户提示。
    }
  }
  this.uploadPortrait = function () {
    // 对头像，要特殊对待，默认是直接上传文件，而不是当场拍摄照片。
    //    if (starModel.webInfo.device.brand!=='iphone' && window.plus && window.plus.camera) {
    //      sow.Tool.takePhoto({usage:'PERSON_ICON'}, {onTakePhotoDone:self.takePhotoDone, onTakePhotoFail:self.takePhotoFail, origImg:self.origImg(), busyUploading:self.busyUploading, onUploadDone:self.uploadImageDone, onUploadFail:self.uploadFail} );
    //    }else{
    self.fileInput.accept = 'image/*'
    self.fileInput.onchange = function () {
      sow.Tool.uploadFile(
        self.fileInput,
        { usage: 'PERSON_ICON' },
        {
          busyUploading: self.busyUploading,
          onUploadProgress: self.uploadProgress,
          onUploadFail: self.uploadFail,
          onUploadDone: function (response, textStatus, jqXHR) {
            if (response && response.filepath) {
              starModel.onlinePerson().icon = response.filepath
              starModel.onlinePerson(starModel.onlinePerson()) // onlinePerson内部的数据变化，不能自动连锁反应，需要手工重设onlinePerson。
            } else if (response && response.result) {
              space.remind({ text: Locale[starModel.userLang()].dialogFeedback['UPLOAD_FAIL'], scenario: 'WARN' })
            }
          },
        }
      )
    }
    self.fileInput.click()
  }
  this.uploadPersonBgimage = function () {
    self.fileInput.accept = 'image/*'
    self.fileInput.onchange = function () {
      sow.Tool.uploadFile(
        self.fileInput,
        { usage: 'PERSON_BGIMAGE' },
        {
          busyUploading: self.busyUploading,
          onUploadProgress: self.uploadProgress,
          onUploadFail: self.uploadFail,
          onUploadDone: function (response, textStatus, jqXHR) {
            if (response && response.filepath) {
              starModel.onlinePerson().bgimage = response.filepath
              starModel.onlinePerson(starModel.onlinePerson()) // onlinePerson内部的数据变化，不能自动连锁反应，需要手工重设onlinePerson。
            } else if (response && response.result) {
              space.remind({ text: Locale[starModel.userLang()].dialogFeedback['UPLOAD_FAIL'], scenario: 'WARN' })
            }
          },
        }
      )
    }
    self.fileInput.click()
  }

  /*
  this.onChat=ko.computed(function(){ // 每次进入动态页面就重新抓取最新消息。
    if (self.stageNow()==='STAGE_CHAT' && starModel.where()==='SPACE_HOME' && self.inProject()==='NONE_PROJECT') {
      self.getAllNotice(null, null, true);
    }
  })
*/
  this.keepChat = ko.computed(function () {
    if (starModel.where() === 'SPACE_HOME' && self.stageNow()) {
      // 每次回家或在家里切换标签，都检查一下是否连接还在。
      if (accountModel.ownSocket && !accountModel.ownSocket.connected) {
        accountModel.ownSocket.connect(starModel.sioUrl)
        accountModel.initOwnSocket().emit('User_login', sow.Tool.getSessionData('passtoken'), starModel.starId) // 建立本用户的专属私有连接。
      } else if (!accountModel.ownSocket) {
        accountModel.ownSocket = io.connect(starModel.sioUrl)
        accountModel.initOwnSocket().emit('User_login', sow.Tool.getSessionData('passtoken'), starModel.starId) // 建立本用户的专属私有连接。
      }
    }
  })
})()

window.urHost = new (function (options) {
  var self = this
  this.constructor = arguments.callee
  this.__proto__ = space

  this.stageNow = ko.observable('STAGE_ABOUT')

  this.proset = ko.observableArray([])

  this.sceneLog = ko.observable('LOG_LIST')
  this.logList = ko.observableArray([])
  this.logNow = ko.observable({})
  this.logNow.reset = function () {
    this({ tag: 'BLOG', agentClass: 'Person', agentId: starModel.targetPerson().aiid, title: '', content: [{ text: '' }] })
    return this()
  }
  this.logNow.reset()
  //  this.logNow=ko.observable({}); // 虽然在 urHost 外人不能发表主题，但是仍然需要 logNow().agentClass/Id 来 refresh/appendLogList。
  this.logIndex // 为了回复博客时的更新列表。

  this.replySet = ko.observableArray([])
  this.newReply = ko.observable()
  this.newReply.reset = function () {
    this({ content: {}, tag: 'MT_REPLY' })
    return this()
  }
  this.newReply.reset()

  this.sceneTice = ko.observable('TICE_LIST')
  this.ticeList = ko.observableArray([])
  this.ticeNow = ko.observable({})
  this.ticeNow.reset = function () {
    this({ tag: 'TICE', content: { detail: [] } })
    return this
  }
  this.ticeNow.reset()
  this.ticeIndex
  //  this.pickingAppointment=ko.observable(false);
  this.appointment = ko.observable('')
  ko.computed(function () {
    if (self.sceneTice() === 'TICE_LIST' && self.stageNow() === 'STAGE_TICE' && starModel.where() === 'SPACE_HOST' && space.inProject() === 'NONE_PROJECT') {
      // 由于datepicker的实现不完美，具有container的picker在其他picker启动时，会被覆盖掉，所以需要重新生成。
      $('#urTiceDateInput').focus()
    }
  })

  this.sceneTask = ko.observable('TASK_LIST')
  this.taskList = ko.observableArray([])
  this.taskNow = ko.observable()
  this.taskNow.reset = function () {
    this({ tag: 'TASK', info: { dutyAndGain: [{ text: '' }] } })
    return this()
  }
  this.taskNow.reset()
  this.taskIndex

  this.setModel(options)

  this.initPerson = function () {
    // 放在 showPerson 里调用。因为 starModel.where()==='SPACE_HOST' 在从第三方到第三方的切换时不变的！而且切换到第三方项目时也不需要initPerson。
    self.stageNow('STAGE_ABOUT')
    self.sceneLog('LOG_LIST')
    self.sceneTice('TICE_LIST')
    self.sceneTask('TASK_LIST')

    self.refreshProset(null, null, true)
    self.refreshTaskList(null, null, true)
    //    self.logNow.reset();
    self.refreshLogList(null, null, true)
    self.refreshTiceList(null, null, true)
  }

  this.preparePayTice = function () {
    if (!starModel.isOnline()) {
      accountModel.dialogTitle('请先登录，即可预订')
      space.dialogNow('DIALOG_LOGIN')
    } else if (isNaN(parseFloat(self.ticeNow().price))) {
      space.remind({ text: '支付金额不能为空。' })
    } else if (!Date.parse(self.appointment())) {
      space.remind({ text: '请选择一个日期' })
      /*    }else if (!self.pickingAppointment()){
      self.pickingAppointment(true); */
    } else {
      tradeModel.provice(self.ticeNow())
      tradeModel.payTotal(space.seller2buyer(self.ticeNow().price))
      tradeModel.payCurrency(self.ticeNow().priceCurrency)
      tradeModel.refundPolicy(false)
      tradeModel.dialogTitle(self.ticeNow().title + '<br>预约日期：' + self.appointment())
      localStorage['postpayUrl'] = self.getForwardTarget().href
      space.dialogNow('DIALOG_PAY')
    }
  }

  this.chatroom = new sow.Chat()

  this.onChat = ko.computed(function () {
    if (self.stageNow() === 'STAGE_CHAT' && starModel.where() === 'SPACE_HOST' && self.inProject() === 'NONE_PROJECT' && starModel.isOnline()) {
      self.chatroom.joinChatRoom(
        'PAIR_' +
          Math.min(starModel.targetPerson().aiid, starModel.onlinePerson().aiid) +
          '_' +
          Math.max(starModel.targetPerson().aiid, starModel.onlinePerson().aiid)
      )
    } else {
      self.chatroom.leaveChatRoom()
    }
  })

  accountModel.initOwnSocket().on('Sys_remind', function (msg) {
    if (
      !(self.stageNow() === 'STAGE_CHAT' && starModel.where() === 'SPACE_HOST' && self.inProject() === 'NONE_PROJECT') && // 如果不在别人家的私聊页面
      msg.ownerSid !== starModel.targetPerson().aiid
    ) {
      // 并且不是当前正与我私聊的人
      space.remind({ text: msg._data.owner.nick + ' : ' + (msg.content.text || '<img src="' + msg.content.image + '"/>') }) // (msg.content.image ? '发送了一张图片':'发送了一条消息'))});
    }
  })
})()

window.myProject = new (function (options) {
  var self = this
  this.constructor = arguments.callee
  this.__proto__ = space

  this.stageNow = ko.observable('STAGE_DREAM')
  this.sceneTeam = ko.observable('ROLE_LIST')
  this.sceneChip = ko.observable('CHIP_LIST')
  this.sceneLog = ko.observable('LOG_LIST')

  this.project = ko.observable()
  this.project.reset = function () {
    this({ info: {}, dream: [{ text: '' }], fundUsage: [{ text: '' }], _class: 'Project' })
    return this()
  }
  this.project.reset()

  //  this.fundAmountIndicator;
  //  this.fundAmountWatcher=ko.computed(self.updateFundIndicator,self);
  /*  this.dateEndFundIndicator;
  $(document).ready(function(){
    self.dateEndFundIndicator.option('format', self.getLeftTime.bind(self));
    this.dateEndFundWatcher=setInterval(function () {
      self.dateEndFundIndicator.value(new Date().getSeconds() + 1);
    }, 1000);
  });
*/

  this.roleList = ko.observableArray([])
  this.roleNow = ko.observable()
  this.roleNow.reset = function () {
    this({ tag: 'ROLE', agentClass: 'Project', info: { dutyAndGain: [{ text: '' }] } })
    return this()
  }
  this.roleNow.reset()
  this.roleIndex

  this.chipList = ko.observableArray([])
  this.chipNow = ko.observable()
  this.chipNow.reset = function () {
    this({ tag: 'CHIP', agentClass: 'Project', content: [{ text: '' }] })
    return this()
  }
  this.chipNow.reset()
  this.chipIndex

  this.logList = ko.observableArray([])
  this.logNow = ko.observable()
  this.logNow.reset = function () {
    this({ tag: 'PLOG', agentClass: 'Project', agentId: self.project().aiid, title: '', content: [{ text: '' }] })
    return this()
  }
  this.logNow.reset()
  this.logIndex

  this.replySet = ko.observableArray([])
  this.newReply = ko.observable()
  this.newReply.reset = function () {
    this({ content: {}, tag: 'MT_REPLY' })
    return this()
  }
  this.newReply.reset()

  this.chatroom = new sow.Chat()

  this.onChat = ko.computed(function () {
    if (self.stageNow() === 'STAGE_LOG' && self.sceneLog() === 'SCENE_CHAT' && starModel.where() === 'SPACE_HOME' && self.inProject() === 'MY_PROJECT') {
      // 在 myProject，肯定是在线状态，不需要检查 isOnline
      //    if (self.stageNow()==='STAGE_CHAT' && starModel.where()==='SPACE_HOME' && self.inProject()==='MY_PROJECT'){
      self.chatroom.joinChatRoom('PROJECT_' + self.project().aiid)
    } else {
      self.chatroom.leaveChatRoom()
    }
  })

  this.createProject = function () {
    if (starModel.isOnline() && !self.project().aiid) {
      self.project().planList = space.refineList(self.project().planList) // 清理用户建立的列表中的空白项
      self.project(self.project())
      if (space.validateStory({ title: self.project().subject, content: self.project().dream })) {
        $.post(
          SOLET + 'Project_addOne',
          starModel.normalize({ Project: self.project() }),
          function (result) {
            if (result && result._class === 'Project') {
              self.project(Date.iso2Date(result))
              space.remind({ text: '恭喜您！梦想已经创建！现在开始召集小伙伴吧！', scenario: 'SUCCESS', timeout: 3000 })
              //            self.roleNow.reset();
              self.roleList([])
              self.sceneTeam('ROLE_LIST')
              self.chipList([])
              self.sceneChip('CHIP_LIST')
              self.logList([])
              self.sceneLog('LOG_LIST')
              self.stageNow('STAGE_TEAM')
              //            space.inProject('MY_PROJECT');
              if (starModel.isOnline()) {
                myHome.proset.unshift(result)
              }
              /* 不论是否在线，总是需要把新项目加入广场 */
              allSpace.proset.unshift(result)
              sow.Tool.setWaterfall()
            } else {
              space.remind({ text: '很抱歉，梦想的发布出错了，请稍后再试。' })
            }
          },
          'json'
        ).fail(function () {
          space.remind({ text: '很抱歉，梦想的发布出错了，请稍后再试。' })
        })
      } else {
        space.remind({ text: '梦想不够清晰，请输入更多！标题至少' + sow.Const.MIN_TITLE + '字', timeout: 3000 })
      }
    } else {
      space.remind('您必须登录，才能发起梦想。')
    }
  }

  this.back2ListTeam = function () {
    var self = this
    if (!self.roleNow().aiid && (self.roleNow().name || self.roleNow().memberQuota)) {
      dialog.showDialog({
        text: '真的要返回上页吗？<br>您正在编辑的内容还没有发布！',
        scenario: 'BACK2LIST',
        onConfirm: self.sceneTeam.bind(self, 'ROLE_LIST'),
      })
    } else {
      self.sceneTeam('ROLE_LIST')
    }
  }
  this.back2ListChip = function () {
    var self = this
    if (!self.chipNow().aiid && (self.chipNow().orderQuota || self.chipNow().title || self.chipNow().price)) {
      dialog.showDialog({
        text: '真的要返回上页吗？<br>您正在编辑的内容还没有发布！',
        scenario: 'BACK2LIST',
        onConfirm: self.sceneChip.bind(self, 'CHIP_LIST'),
      })
    } else {
      self.sceneChip('CHIP_LIST')
    }
  }

  // 不知为何，如果定义 var fileInput 在上传函数本身里，在 safari/iOS 上就无法上传文件。必须单独写在外面。
  this.fileInput = document.createElement('input')
  this.fileInput.type = 'file'
  this.uploadProjectBgimage = function () {
    self.fileInput.accept = 'image/*'
    self.fileInput.onchange = function () {
      sow.Tool.uploadFile(
        self.fileInput,
        { usage: self.project().aiid ? 'PROJECT_BGIMAGE' : 'PROJECT_BGIMAGE_NEW', project: { aiid: self.project().aiid } },
        {
          busyUploading: self.busyUploading,
          onUploadFail: self.uploadFail,
          onUploadProgress: self.uploadProgress,
          onUploadDone: function (response, textStatus, jqXHR) {
            if (response && response.filepath) {
              self.project().bgimage = response.filepath
              self.project(self.project())
              if (self.project().aiid) {
                // 到达 myProject，或者是从spaceAll，或者是从spaceHome，项目列表里如果也含有这个project，需要进行更新。
                myHome.updateProset(self.project())
                allSpace.updateProset(self.project())
              }
            } else if (response && response.result) {
              space.remind({ text: Locale[starModel.userLang()].dialogFeedback['UPLOAD_FAIL'], scenario: 'WARN' })
            }
          },
        }
      )
    }
    self.fileInput.click()
  }

  this.updateProject = function () {
    if (starModel.isOnline() && self.project().aiid) {
      // 首先遍历、删除为空的文字小节。
      /*  不要删除了，以免如果不强制刷新project()时，index和后台发生差错。  
      var i=0;
      while (i<self.project().dream.length){
        var section=self.project().dream[i];
        if (section.hasOwnProperty('text') && !section.text){
          self.project().dream.splice(i,1);
        }else{
          i++;
        }
      }
  */
      // 提交。
      self.project().planList = space.refineList(self.project().planList) // 清理用户建立的列表中的空白项
      self.project(self.project())
      if (space.validateStory({ title: self.project().subject, content: self.project().dream })) {
        // editor.feedback('正在保存中...');
        //        if (self.project().dream.length<1) self.project().dream='{}'; // 如果被删空为[]或者{}，就不会被作为参数送到后台。因此需要设为'[]'或NULL，强制通知后台清空。为了和后台默认的{}兼容，设为'{}'。
        $.post(
          SOLET + 'Project_setOne',
          starModel.normalize({ Project: self.project() }),
          function (result) {
            if (result && result._class === 'Project') {
              result = Date.iso2Date(result)
              self.project(result) // 也许，不需要？因为文字已经被改好。在这里强制刷新，反而导致页面滚动到最高。
              myHome.updateProset(result)
              allSpace.updateProset(result)
              //space.remind({text:'保存成功。'}); // editor.feedback('保存成功。');
            } else {
              //              space.remind({text:'保存失败！请勿担心，将在下个修改时一并提交。'}); // editor.feedback('保存失败，请稍后再试。');
            }
          },
          'json'
        ).fail(function () {
          //          space.remind({text:'保存失败！请勿担心，将在下个修改时一并提交。'}); // editor.feedback('保存失败，稍后再试');
        }) /* .always(function(){
          setTimeout(function(){editor.feedback('');},3000);
        });*/
      } else {
        space.remind({ text: '不要放弃梦想！标题至少' + sow.Const.MIN_TITLE + '字' }) // editor.feedback('不要清空梦想！标题至少'+sow.Const.MIN_TITLE+'字');
        // setTimeout(function(){editor.feedback('');},5000);
      }
    }
  }

  this.prepareRole = function () {
    self.roleNow.reset()
    self.sceneTeam('ROLE_ONE')
  }
  this.validateRole = function () {
    if (!(parseInt(self.roleNow().memberQuota) >= 0)) {
      space.remind({ text: '请填写名额。' })
    } /*else if (!(typeof self.roleNow().info.price==='string' && self.roleNow().info.price.replace(/ /g,'').length>0)) {
      space.remind({text:'请填写酬金。'});
    }*/ else if (
      !(typeof self.roleNow().name === 'string' && sow.Const.MIN_NAME <= self.roleNow().name.replace(/ /g, '').length)
    ) {
      space.remind({ text: '请填写人才名称。最少 ' + sow.Const.MIN_NAME + ' 个字。' })
    } else {
      return true
    }
    return false
  }
  this.createRole = function () {
    if (starModel.isOnline() && !self.roleNow().aiid && self.validateRole()) {
      self.roleNow().agentId = self.project().aiid
      $.post(
        SOLET + 'Circle_addOne',
        starModel.normalize({ Circle: self.roleNow() }),
        function (result) {
          if (result && result._class === 'Circle') {
            self.roleList.unshift(Date.iso2Date(result))
            self.sceneTeam('ROLE_LIST')
            //            self.roleNow(result);
          } else {
            space.remind({ text: '很抱歉，发布出错了，请稍后再试。' })
          }
        },
        'json'
      ).fail(function () {
        space.remind({ text: '很抱歉，发布出错了，请稍后再试。' })
      })
    }
  }
  this.updateRole = function () {
    if (starModel.isOnline() && self.roleNow().aiid && self.validateRole()) {
      $.post(
        SOLET + 'Circle_setOne',
        starModel.normalize({ Circle: self.roleNow() }),
        function (result) {
          if (result && result._class === 'Circle') {
            result = Date.iso2Date(result)
            result._data = self.roleNow()._data // 保留 memberSet, appliedSet, invitedSet 名单。
            self.roleNow(result) // 更新需要动态计算的东西。
            if (self.roleList()[self.roleIndex] && self.roleList()[self.roleIndex].aiid === result.aiid) {
              // 万一用户是通过路由，直接跳到角色页面，没有通过 showRole，那么还是需要做遍历。
              self.roleList()[self.roleIndex] = result
              self.roleList(self.roleList())
            } else {
              for (var i in self.roleList()) {
                if (self.roleList()[i].aiid === result.aiid) {
                  self.roleList()[i] = result
                  self.roleList(self.roleList())
                  break
                }
              }
            }
            //space.remind({text:'保存成功。'});
          } else {
            //            space.remind({text:'保存失败。请勿担心，将在下个修改时一并保存。'});
          }
        },
        'json'
      ).fail(function () {
        //        space.remind({text:'保存失败。请勿担心，将在下个修改时一并保存。'});
      })
    }
  }
  this.deleteRoleNow = function () {
    dialog.showDialog({
      text: '真的删除这个角色吗？',
      scenario: 'DELETE',
      onConfirm: function () {
        $.post(
          SOLET + 'Circle_hideOne',
          starModel.normalize({ Circle: self.roleNow() }),
          function (result) {
            if (result) {
              if (self.roleList()[self.roleIndex] && self.roleList()[self.roleIndex].aiid === self.roleNow().aiid) {
                self.roleList.splice(self.roleIndex, 1)
              } else {
                for (var i in self.roleList()) {
                  if (self.roleList()[i].aiid === self.roleNow().aiid) {
                    self.roleList.splice(i, 1)
                    break
                  }
                }
              }
              self.sceneTeam('ROLE_LIST')
              self.roleNow.reset()
              space.remind({ text: '删除成功', scenario: 'SUCCESS' })
            } else {
              space.remind({ text: '删除没有成功，请稍后再试一次', scenario: 'WARN' })
            }
          },
          'json'
        ).fail(function () {
          space.remind({ text: '删除没有成功，请稍后再试一次', scenario: 'WARN' })
        })
      },
    })
  }

  this.prepareChip = function () {
    if (parseInt(self.project().fundGoal) >= 0 && Date.user2Date(self.project().dateEndFund).toJSON()) {
      self.chipNow.reset()
      self.sceneChip('CHIP_ONE')
    } else {
      space.remind({ text: '必须先设定筹资总额和截止期限，才能新建筹码。' })
    }
  }
  /*  this.submitChip=function(){
    if (starModel.isOnline()){
      if (self.chipNow().aiid){
        self.updateChip();
      }else{
        self.createChip();
      }
    }
  } */
  this.validateChip = function () {
    if (!(parseFloat(self.chipNow().price) >= 0.01 || parseFloat(self.chipNow().price) === 0)) {
      space.remind({ text: '请填写每份筹码金额（0~999999 之间。0代表认筹人可以自设金额）' })
    } else if (!(parseInt(self.chipNow().orderQuota) >= 0)) {
      space.remind({ text: '请填写人数限额（0~9999 之间。0代表不限人数）' })
    } else if (!(typeof self.chipNow().title === 'string' && sow.Const.MIN_NAME <= self.chipNow().title.replace(/ /g, '').length)) {
      space.remind({ text: '请填写回报的名称，至少 ' + sow.Const.MIN_NAME + ' 个字。' })
    } else {
      return true
    }
    return false
  }
  this.createChip = function () {
    if (starModel.isOnline() && !self.chipNow().aiid && self.validateChip()) {
      self.chipNow().agentId = self.project().aiid
      $.post(
        SOLET + 'Provice_addOne',
        starModel.normalize({ Provice: self.chipNow() }),
        function (result) {
          if (result && result._class === 'Provice') {
            self.chipList.unshift(result)
            self.sceneChip('CHIP_LIST')
            //              space.remind({text:'保存成功。'});
          } else {
            space.remind({ text: '保存失败，请稍后再试。' })
          }
        },
        'json'
      ).fail(function () {
        space.remind({ text: '保存失败，请稍后再试。' })
      })
    }
  }
  this.updateChip = function () {
    if (starModel.isOnline() && self.chipNow().aiid && self.validateChip()) {
      //      if (sow.Tool.isArray(self.chipNow().content) && self.chipNow().content.length<1) self.chipNow().content='{}'; // 如果被删空为[]或者{}，就不会被作为参数送到后台。因此需要设为'[]'或NULL，强制通知后台清空。为了和后台默认的{}兼容，设为'{}'。
      $.post(
        SOLET + 'Provice_setOne',
        starModel.normalize({ Provice: self.chipNow() }),
        function (result) {
          if (result && result._class === 'Provice') {
            self.chipNow(result) // 为了更新需要动态计算的一些数值，例如剩余份额。
            // 更新在汇总页上显示的标题。
            if (self.chipList()[self.chipIndex] && self.chipList()[self.chipIndex].aiid === result.aiid) {
              self.chipList()[self.chipIndex] = result
              self.chipList(self.chipList())
            } else {
              for (var i in self.chipList()) {
                if (self.chipList()[i].aiid === result.aiid) {
                  self.chipList()[i] = result
                  self.chipList(self.chipList())
                  break
                }
              }
            }
            //space.remind({text:'保存成功。'});
          } else {
            //              space.remind({text:'保存失败。请勿担心，将在下个修改时一并保存。'});
          }
        },
        'json'
      ).fail(function () {
        //          space.remind({text:'保存失败。请勿担心，将在下个修改时一并保存。'});
      })
    }
  }

  this.appendPlanItem = function () {
    if (self.project().planList !== null && typeof self.project().planList === 'object') {
      self.project().planList.push({})
    } else {
      self.project().planList = [{}]
    }
    self.project(self.project())
  }
})()

window.ourProject = new (function (options) {
  var self = this
  this.constructor = arguments.callee
  this.__proto__ = space

  this.project = ko.observable({ info: {} })

  this.stageNow = ko.observable('STAGE_DREAM')
  this.sceneLog = ko.observable('LOG_LIST')

  this.roleList = ko.observableArray([])
  this.roleNow = ko.observable()
  this.roleNow.reset = function () {
    this({ tag: 'ROLE', agentClass: 'Project', info: {} })
    return this()
  }
  this.roleNow.reset()

  this.logList = ko.observableArray([])
  this.logNow = ko.observable()
  this.logNow.reset = function () {
    this({ tag: 'PLOG', agentClass: 'Project', agentId: self.project().aiid, title: '', content: [{ text: '' }] })
    return this()
  }
  this.logNow.reset()
  this.logIndex

  this.replySet = ko.observableArray([])
  this.newReply = ko.observable()
  this.newReply.reset = function () {
    this({ content: {}, tag: 'MT_REPLY' })
    return this()
  }
  this.newReply.reset()
})()

window.urProject = new (function (options) {
  var self = this
  this.constructor = arguments.callee
  this.__proto__ = space

  this.stageNow = ko.observable('STAGE_DREAM')
  this.sceneTeam = ko.observable('ROLE_LIST')
  this.sceneChip = ko.observable('CHIP_LIST')
  this.sceneLog = ko.observable('LOG_LIST')

  this.project = ko.observable({ info: {}, _class: 'Project' })

  //  this.fundAmountIndicator;
  //  this.fundAmountWatcher=ko.computed(self.updateFundIndicator,self);
  /*  this.dateEndFundIndicator;
  $(document).ready(function(){
    self.dateEndFundIndicator.option('format', self.getLeftTime.bind(self));
    this.dateEndFundWatcher=setInterval(function () {
      self.dateEndFundIndicator.value(new Date().getSeconds() + 1);
    }, 1000);
  });
*/

  this.roleList = ko.observableArray([])
  this.roleNow = ko.observable()
  this.roleNow.reset = function () {
    this({ tag: 'ROLE', agentClass: 'Project', info: {} })
    return this()
  }
  this.roleNow.reset()
  this.roleIndex // urProject 并不需要 roleNow.reset 和 roleIndex，但是 showRole 等方法需要调用它们。

  this.chipList = ko.observableArray([])
  this.chipNow = ko.observable()
  this.chipNow.reset = function () {
    this({ tag: 'CHIP', agentClass: 'Project' })
    return this()
  }
  this.chipNow.reset()
  this.chipIndex

  this.logList = ko.observableArray([])
  this.logNow = ko.observable()
  this.logNow.reset = function () {
    this({ tag: 'PLOG', agentClass: 'Project', agentId: self.project().aiid, title: '', content: [{ text: '' }] })
    return this()
  }
  this.logNow.reset()
  this.logIndex

  this.replySet = ko.observableArray([])
  this.newReply = ko.observable()
  this.newReply.reset = function () {
    this({ content: {}, tag: 'MT_REPLY' })
    return this()
  }
  this.newReply.reset()

  this.chatroom = new sow.Chat()

  this.onChat = ko.computed(function () {
    if (
      self.stageNow() === 'STAGE_LOG' &&
      self.sceneLog() === 'SCENE_CHAT' &&
      starModel.where() === 'SPACE_HOST' &&
      self.inProject() === 'UR_PROJECT' &&
      starModel.isOnline()
    ) {
      // 注意，按目前的实现，如果不在线，就无法加入聊天室，根本看不到聊天内容。
      self.chatroom.joinChatRoom('PROJECT_' + self.project().aiid)
    } else {
      self.chatroom.leaveChatRoom()
    }
  })

  this.typeOfJoin = function (role) {
    if (starModel.isOnline()) {
      var person
      for (var index in role._data.memberSet) {
        person = role._data.memberSet[index]
        if (person.aiid === starModel.onlinePerson().aiid) {
          return 'MEMBER'
        }
      }
      for (var index in role._data.appliedSet) {
        person = role._data.appliedSet[index]
        if (person.aiid === starModel.onlinePerson().aiid) {
          return 'APPLIED'
        }
      }
      for (var index in role._data.invitedSet) {
        person = role._data.invitedSet[index]
        if (person.aiid === starModel.onlinePerson().aiid) {
          return 'INVITED'
        }
      }
    }
    return 'UNKNOWN'
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
