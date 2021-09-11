//"use strict"; // 严格模式应当仅限用于开发环境。在运维环境下请删除该模式。
module.exports = function(options) {
  var self = this;
  this.constructor = arguments.callee;
  this.__proto__ = sow.modelPrototype;

  this.loginPerson = ko.observable(); this.loginPerson.reset=function(){ this({uid:undefined,aiid:undefined,email:undefined,phone:undefined,pwdUser:undefined,pwdUserNew:undefined,pcdUser:undefined,pwdClient:undefined,countryCode:'+86-',agentId:undefined}); }; this.loginPerson.reset(); // 登录需要的用户信息
  this.loginPerson.clearSecret=function(){ this().pwdUser=this().pcdUser=this().pwdUserNew=this().pwdClient=undefined; };
  this.uidType = ko.observable('uid'); // 给前端页面用来跟踪用户选择的账号类型。默认为通用型。
  this.pwdType = ko.observable('login'); // 给前端页面用来跟踪用户选择的密码选项
  // 给用户的反馈
  this.uidErrorType = ko.observable(null);
  this.pwdErrorType = ko.observable(null);
  this.pcdErrorType = ko.observable(null);
  this.changePwdResult = ko.observable(null);
  this.loginResultType = ko.observable(null);
  // 当前所处状态
  this.state = ko.observable('IDLE'); // 当前状态：IDLE, LOGIN, LOGOUT, RESETPWD, CHANGEPWD 
//  this.accountEvent = ko.observable(null);
  this.dialogTitle=ko.observable('');
  this.loginAgreement=ko.observable(false);

  this.setModel(options);

  this.validate = function() {
    // 清空上次validate或login失败可能留下的提示信息。
    self.uidErrorType(null);
    self.pwdErrorType(null);
    self.pcdErrorType(null);
    self.changePwdResult(null);
    self.loginResultType(null);

    /* 分别检查每一项输入条目的有效性 */
    // 检查password 
    if (sow.Tool.validatePwd(this.loginPerson().pwdUser)) {
      this.loginPerson().pwdClient = sow.MD5.hex_md5(this.loginPerson().pwdUser);
      this.loginPerson().pwdUser = undefined;
    }else{
      this.pwdErrorType('Soweb_Malformed_Pwd');
    }
    // 检查passcode
    if (this.pwdType()=='reset') {
      if (sow.Tool.validateConfirmCode(this.loginPerson().pcdUser)) {
        // nothing to do if correct pcdUser format. Maybe: 
        // this.pcdErrorType(false);
      }else{
        this.pcdErrorType('Soweb_Malformed_Pcd');
      }
    }
    // 检查账号
    switch (this.uidType()) {
      case 'email':
        this.loginPerson().uid=this.loginPerson().phone=this.loginPerson().aiid=undefined;
        if (sow.Tool.typeofUid(this.loginPerson().email)!='email')
          this.uidErrorType('email');
        break;
      case 'phone':
        this.loginPerson().uid=this.loginPerson().email=this.loginPerson().aiid=undefined;
        this.loginPerson().phone = this.loginPerson().countryCode + this.loginPerson().callNumber;
        if (sow.Tool.typeofUid(this.loginPerson().phone)!='phone')
          this.uidErrorType('phone');
        break;
      case 'aiid':
        this.loginPerson().uid=this.loginPerson().email=this.loginPerson().phone=undefined;
        if (sow.Tool.typeofUid(this.loginPerson().aiid)!='aiid')
          this.uidErrorType('aiid');
        break;
      case 'uid':
        this.loginPerson().email=this.loginPerson().phone=this.loginPerson().aiid=undefined; // 先清空原有的，防止用户中途切换成另一种类型的输入，导致loginPerson()里留有不该有的数据。
        if (sow.Tool.typeofUid(this.loginPerson().uid)=='callNumber') {
          this.loginPerson().callNumber = this.loginPerson().uid;
          this.loginPerson().countryCode = '+86-'; // 如果用户仅仅输入手机呼叫号，则默认区号为中国。
          this.loginPerson().uid = this.loginPerson().countryCode+this.loginPerson().callNumber; // 组装完整的phone格式
        }
        switch (sow.Tool.typeofUid(this.loginPerson().uid)) {
          case 'email': case 'phone':
//            this.uidType(sow.Tool.typeofUid(this.loginPerson().uid)); // 切换到用户输入的账号类型的专用输入框。todo: 清空通用输入框？ 
            this.loginPerson()[sow.Tool.typeofUid(this.loginPerson().uid)] = this.loginPerson().uid;
            this.loginPerson(this.loginPerson()); // 强行更新专用输入框。
            break;
          case 'aiid':
//            this.uidType('aiid'); // 切换到用户输入的账号类型的专用输入框。todo: 清空通用输入框？ 
            this.loginPerson()['aiid'] = this.loginPerson().uid.substr(1); // 去除开头的星号。
            break;
          default: // 用户选择自由输入UID，但不符合任一格式，则报错。
            this.uidErrorType('uid');
            break;
        }
        break;
      default: // 用户没有选择任何输入规范。这不应该发生！但如果HTML页面编写错误，就有可能。以防万一。 
        this.uidErrorType('noType');
        break; 
    }
    // 最后总结整体验证结果：
    if (self.uidErrorType()||self.pwdErrorType()||self.loginResultType()||self.pcdErrorType()||self.changePwdResult())
      return false; // 有任一条目报错，就不能通过。
    else
      return true; // 所有条目验证通过。
  };

  this.ownSocket;
  this.initOwnSocket=function(){
    if (self.ownSocket && !self.ownSocket.connected){
      self.ownSocket.connect(starModel.sioUrl);
    }else if (!self.ownSocket){
      self.ownSocket=io.connect(starModel.sioUrl);
    }
    return self.ownSocket;
  }

  this.login = function(onSuccess, onFail, onAlways) { // event 提供登录后必须执行的操作，onXxx 给调用者提供独有的操作。
    if (self.state() == 'IDLE' && self.validate()) { // 先对用户输入进行验证.
      self.state('LOGIN');  // 先进入登录状态，防止多次提交。
      self.loginResultType('LOGIN');
      $.post(
        SOLET + 'Person_login',
        starModel.normalize({ Person: self.loginPerson() }),
        function(person) {
//          sow.test('login returns '+JSON.stringify(person));
          if (person && person._class==='Person') {
            person=Date.iso2Date(person);
            if (sow.Tool.typeofUid(person.phone) === 'phone') {
              person.countryCode = (person.phone.split('-')[0]) + '-';
              person.callNumber = person.phone.split('-')[1];
            }
            sow.Tool.setLocalData('auto_sid', person.aiid);
            sow.Tool.setLocalData('auto_pwdClient', self.loginPerson().pwdClient);
            sow.Tool.setSessionData('passtoken', person._passtoken);
            self.initOwnSocket().emit('User_login', person._passtoken, starModel.starId); // 建立本用户的专属私有连接。
            delete person._passtoken;
            starModel.onlinePerson(person); // 修改在线用户为登入用户。
//            starModel.targetPerson(person); // 并且进入自己家。2016-10-25 不一定进入自己家！更多时候，用户正在执行某操作中，不应打断。
            if (typeof onSuccess==='function') onSuccess(person);
            //self.accountEvent('LOGIN_SUCCESS');
            self.triggerEvent('LOGIN_SUCCESS', person);
            self.loginResultType('LOGIN_SUCCESS');
          } else if (person && person._class === 'Event') {
            if (typeof onFail==='function') onFail(person);
            //self.accountEvent('LOGIN_FAIL'); 
            self.triggerEvent('LOGIN_FAIL', person);
            switch (person.result) {
              /* 来自 Person 的 login */
              case 'InsertFailed':
              case 'MismatchEmailPwd':
              case 'MismatchPhonePwd':
              case 'MismatchAiidPwd':
              case 'MismatchPwd':
              case 'MissingLoginInfo':
              case 'MissingSignupInfo':
                self.loginResultType(person.result); 
                break;
              default:
                self.loginResultType('LOGIN_FAIL'); // 实际上是返回了不认识的事件。
            }
          } else  {
            if (typeof onFail==='function') onFail(person);
            //self.accountEvent('LOGIN_FAIL'); 
            self.triggerEvent('LOGIN_FAIL', person);
            self.loginResultType('LOGIN_FAIL'); // 实际上是返回了空或不认识的数据格式，是系统错误。
          }
        }, 'json').always(function() {
          self.state('IDLE');
          self.loginPerson.clearSecret(); // 无论如何，清空密码等。
          self.loginPerson(self.loginPerson()); // 并且重新绑定界面（在‘关于’的密码页面里，已经被第一次绑定过了，必须重设）
          if (typeof onAlways==='function') onAlways();
        }
      );
    } else {
      return false;
    }
  };

  this.autologin = function(onSuccess, onFail, onAlways) {
    self.loginPerson().aiid = sow.Tool.getLocalData('auto_sid');
    self.loginPerson().pwdClient = sow.Tool.getLocalData('auto_pwdClient');
    if (self.state()=='IDLE' && sow.Tool.typeofUid('*'+self.loginPerson().aiid)=='aiid' && self.loginPerson().pwdClient)  {
      self.state('LOGIN');
      $.post(SOLET + 'Person_login',  // 注意，如果数据库里目前没有该用户，就相当于要求直接注册sid+pwd的组合，而没有手机号/邮箱。后台逻辑要禁止这种情况。
        starModel.normalize({ Person: self.loginPerson()}), 
        function(person) {
          if (person && person._class==='Person') {
            person=Date.iso2Date(person);
            if (sow.Tool.typeofUid(person.phone)==='phone') {
              person.countryCode = (person.phone.split('-')[0])+'-';
              person.callNumber = person.phone.split('-')[1];
            }
//            sow.Tool.setLocalData('auto_sid', person.aiid); // 有必要吗
//            sow.Tool.setLocalData('auto_pwdClient', self.loginPerson().pwdClient); // 有必要吗
            sow.Tool.setSessionData('passtoken', person._passtoken);
            self.initOwnSocket().emit('User_login', person._passtoken, starModel.starId); // 建立本用户的专属私有连接。
            delete person._passtoken;
            starModel.onlinePerson(person); // 修改在线用户为登入用户。
            if (typeof onSuccess === 'function') onSuccess(person);
            self.triggerEvent('AUTOLOGIN_SUCCESS', person); // 或者 LOGIN_SUCCESS?
          } else { // 发生密码错误等，就立刻退出。
            //self.accountEvent('AUTOLOGIN_FAIL'); 
            //self.triggerEvent('AUTOLOGIN_FAIL', person); // 自动登录时，就不要激发登录失败事件了吧？
            self.state('IDLE');
            self.logout();
            if (typeof onFail === 'function') onFail();
          }
        }, 'json').always(function() {
          self.state('IDLE');
          if (typeof onAlways==='function') onAlways();
        });
    }else{
      if (typeof onAlways==='function') onAlways();     
    }
    self.loginPerson().pwdClient=undefined;
    self.loginPerson().aiid=undefined;
  };

  this.logout = function() {
    if (self.state()=='IDLE') {
      self.state('LOGOUT');
      $.post(SOLET + 'Person_logout', 
        function(data) {
          if (true) { // logout in backend should always return true. 退出应当总是成功的。
          }
        }, 'json');
      /* 清空本地存储信息: */
      sow.Tool.removeData('auto_sid'); // sow.Tool.setCookie('auto_sid', sow.Const.SID_UNKNOWN, -1);  // 设为匿名用户。
      sow.Tool.removeData('auto_pwdClient'); // sow.Tool.setCookie('auto_pwdClient', '', -1);
      sow.Tool.removeData('passtoken');
      sow.Tool.setLocalData('anonymous_visits', parseInt(sow.Tool.getLocalData('anonymous_visits')) + 1, 30); // 匿名登陆次数。一个月内未登陆则重新开始计数。
// 不要切换到广场了，让应用自己决定。     starModel.targetPerson(sow.Const.PERSON_ALL); // 修改当前访问对象为广场. 注意这里的时间差：如果先切换onlinePerson，这时targetPerson仍然是原登录用户，在这一瞬间，starModel.where()==='SPACE_HOST'，是错误的。因此先切换targetPerson！
      starModel.onlinePerson(sow.Const.PERSON_UNKNOWN); // 修改在线用户为匿名用户.
      //self.accountEvent('LOGOUT_SUCCESS'); 
      self.triggerEvent('LOGOUT_SUCCESS');
      self.loginPerson.reset();  // 无论如何，清空密码等信息。
      self.loginPerson(self.loginPerson()); // 并且重新绑定界面。
      self.uidErrorType(null); self.pwdErrorType(null); self.loginResultType(null); self.changePwdResult(null); self.pcdErrorType(null); // 清空可能留下的提示信息。
      self.state('IDLE');
    }
  };

  this.sendConfirmTicket = function() {
    this.uidErrorType(null); // 清空先前可能残留的提示信息。
    this.loginPerson().pwdUser=undefined; this.loginPerson(this.loginPerson());
    this.validate(); // 注意，validate也检查了密码合法性，可能不合法，但不应该影响到请求重设密码。
    this.pwdErrorType(null); 
    this.pcdErrorType(null);
    if (!this.uidErrorType()) // 请求重设密码时，不需要检查密码合法性。
    {
      this.pcdErrorType('busySending');
      $.post(SOLET+'Person_sendConfirmTicket',
        starModel.normalize({ Person: this.loginPerson()}),
        function(data) {
          if (data && data.result) {
            switch (data.result){
              case 'EmailSendDone':
              case 'SmsSendDone':
              case 'EmailSendFail':
              case 'SmsSendFail':
              case 'EmailBadInput':
              case 'SmsBadInput':
              case 'TicketCreationFailed':
              case 'EnvBadInput':
                self.pcdErrorType(data.result); 
                break;
              default:
                self.pcdErrorType('Soweb_Unknown_Sending_Error');
            }
          }else { // 没有发送（参数错误等异常）
            self.pcdErrorType('Soweb_Unknown_Sending_Error');
          }
        },
        'json'
      );
    }
  };
  this.toggleReset = function(){
    if (self.pwdType()=='reset') {
      self.pwdType('login'); 
    } else { 
      self.pwdType('reset'); 
      self.sendConfirmTicket(); 
    }
  };
  this.resetPwd = function() {
    if (self.state() === 'IDLE' && self.validate())
    {
      self.state('RESETPWD');
//      self.loginPerson().pwdUser=undefined; // 已在 validate 中清除。
      $.post(SOLET + 'Person_resetPwd',
        starModel.normalize({ Person: self.loginPerson() }),
        function(data) {
          if (data && data._class==='Person') { // 重设成功
            self.loginResultType('RESET_SUCCESS');
            self.pwdType('login'); // todo: 直接登录，或切换到登录界面。
          } else {// 重设失败
            self.loginResultType('RESET_FAIL');
          }
        }, 
        'json'
        ).always(function() {
          self.state('IDLE');
          self.loginPerson.clearSecret();  // 无论如何，清空密码和口令。
          self.loginPerson(self.loginPerson());
        });
    } else {
      return false;
    }
  };
  this.changePwd = function() {
    if (self.state()=='IDLE') {
      if (starModel.isOnline() && sow.Tool.validatePwd(self.loginPerson().pwdUser) && sow.Tool.validatePwd(self.loginPerson().pwdUserNew)
        &&  self.loginPerson().pwdUser!==self.loginPerson().pwdUserNew) {
        self.state('CHANGEPWD');
        self.loginPerson().pwdClient = sow.MD5.hex_md5(self.loginPerson().pwdUser);
        self.loginPerson().pwdClientNew = sow.MD5.hex_md5(self.loginPerson().pwdUserNew);
        self.loginPerson().aiid = starModel.onlinePerson().aiid;
        self.loginPerson().pwdUser=self.loginPerson().pwdUserNew=undefined; // 清除原始密码，切勿发往后台。
        $.post(SOLET+'Person_changePwd',
          starModel.normalize({ Person: self.loginPerson()}),
          function(person) {
            if (person && person._class==='Person'){
              sow.Tool.setLocalData('auto_sid', person.aiid);
              sow.Tool.setLocalData('auto_pwdClient', self.loginPerson().pwdClient);
              self.changePwdResult('CHANGEPWD_SUCCESS');
            }else{
              self.changePwdResult('CHANGEPWD_FAIL');
            }
          }, 
          'json').always(function() {
            self.loginPerson.clearSecret();
            self.loginPerson(self.loginPerson()); // 重新绑定界面
            self.state('IDLE');
          });
      } else {
        self.changePwdResult('CHANGEPWD_INVALID');
      }
    };
  };
  this.loginOrReset = function(onSuccess) {
    switch (self.pwdType()) {
      case 'reset': self.resetPwd(); break;
      default: self.login(onSuccess); break;
    }
  };
};
