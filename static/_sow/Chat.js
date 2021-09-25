//"use strict"; // 严格模式应当仅限用于开发环境。在运维环境下请删除该模式。

module.exports = function(options){
  var self = this;
  this.constructor = arguments.callee;
  this.__proto__ = sow.modelPrototype;

  this.socket;
  this.roomId;
  this.roomInfo=ko.observable({});
  this.newChatText=ko.observable('');
  this.chatMessageList=ko.observableArray([]);
  this.chatWindow; // 固定高度的聊天窗口
  this.chatContent; // 不定高度的聊天内容

  this.fileInput=document.createElement('input'); // 必须放在方法外面定义，不然在safari/iOS上就无法上传，很奇怪。
  this.fileInput.type='file';

  this.setModel(options);

  this.initSocket=function(){ // 确保socket已连接。
    if (self.socket && !self.socket.connected) {  //        sow.test('socket已经存在！');
      self.socket.connect(starModel.sioUrl);
    }else if (!self.socket) {  //        sow.test('socket尚不存在！');
      self.socket=io.connect(starModel.sioUrl); 
      self.socket.on('Sys_join_user', self.updateChatRoom);
      self.socket.on('Sys_join_self', self.updateChatRoom);
      self.socket.on('Sys_leave_user', self.updateChatRoom);
      self.socket.on('Sys_leave_anon', self.updateChatRoom);
//      self.socket.on('Sys_getChatMessage_self', self.getChatMessage_self); // 也许把消息颜色加深，代表服务器已经收到。目前没有实现。
      self.socket.on('Sys_getChatMessage', self.getChatMessage);
    }
    return self.socket;
  }

  this.joinChatRoom=function(roomId){
    self.roomId=roomId;
//    self.initSocket();
    if (self.socket && !self.socket.connected) {  //        sow.test('socket已经存在！');
      self.socket.connect(starModel.sioUrl);
      self.socket.emit('User_join', starModel.onlinePerson(), sow.Tool.getSessionData('passtoken'), roomId, starModel.starId); // 不要去掉_data，因为还要送回其他socket的前端，以备他们点击访问。
    }else if (!self.socket) {  //        sow.test('socket尚不存在！');
      self.socket=io.connect(starModel.sioUrl); 
      self.socket.on('Sys_join_user', self.updateChatRoom);
      self.socket.on('Sys_join_self', self.updateChatRoom);
      self.socket.on('Sys_leave_user', self.updateChatRoom);
      self.socket.on('Sys_leave_anon', self.updateChatRoom);
//      self.socket.on('Sys_getChatMessage_self', self.getChatMessage_self); // 也许把消息颜色加深，代表服务器已经收到。目前没有实现。
      self.socket.on('Sys_getChatMessage', self.getChatMessage);
      self.socket.emit('User_join', starModel.onlinePerson(), sow.Tool.getSessionData('passtoken'), roomId, starModel.starId); // 不要去掉_data，因为还要送回其他socket的前端，以备他们点击访问。
    }
//    self.socket.on('connect', function(){ // 连接完成后再执行。但是，由于connect()是异步的，导致每次离开房间后重新连接时，后台每次都多执行一次 socket.on('User_join',...)，越积越多。 // 注意，connect()是异步的，可能等会儿才成功返回connect事件。但已经可以调用 emit，会在连接成功后执行。
//    self.socket.emit('User_join', starModel.onlinePerson(), sow.Tool.getSessionData('passtoken'), roomId, starModel.starId); // 不要去掉_data，因为还要送回其他socket的前端，以备他们点击访问。
//    });
  };
  this.leaveChatRoom=function(){
//    console.info('客户端:断开连接！');
    if (self.socket && self.socket.connected){
      self.socket.disconnect();
      self.chatMessageList([]);
    }
  };
  this.updateChatRoom=function(roomInfo){
    if (roomInfo){
      self.roomInfo(roomInfo);
      if (Array.isArray(roomInfo.history) && roomInfo.history.length){
        if (self.omitHistoryOnce) {
          delete self.omitHistoryOnce;
        }else{
          self.chatMessageList(roomInfo.history); // 这一句导致Firefox报错 SyntaxError: missing ) after argument list，无法进入广场聊天室，百思不得其解。2017-10-11 改用 knockout 3.4.2 解决了这个问题。
          $(self.chatWindow).animate({scrollTop:self.chatContent.clientHeight}, 1000);
          setTimeout(function(){ $(self.chatWindow).animate({scrollTop:self.chatContent.clientHeight}, 1000);}, 1000); // 确保图片也加载到页面后，再次调整滚动条。
          delete self.roomInfo().history;
        }
      }
    }
  }
  this.sendChatMessage=function(textarea){
    var self=this;
    if (starModel.isOnline() || starModel.where()==='SPACE_ALL'){
      if (!self.socket || !self.socket.connected){
        self.joinChatRoom(self.roomId);
        self.omitHistoryOnce=true; // 如果是断线重连的，joinChatRoom 返回了但是通常还没有connect完毕，或者后台还没有返回Sys_join_self，就需要等一等。否则我的消息会被 updateChatroom 冲掉。
      }
      if (space.textLength(this.newChatText())>0) {  // todo: 仅限当前项目主持人或成员能够参与行动讨论
        var msg={content:{text:this.newChatText()}, whenClient:new Date()};
        self.socket.emit('User_sendChatMessage', msg);
        self.getMyChatMessage(msg); // 展示自己发的信息，不等待后台接收到消息。
        // 自动重连，并且本地成功显示自己消息，在电脑上手工disconnect后生效了；在手机浏览器上仍然不成功。
        self.newChatText(''); sow.UI.resetMinHeightTextarea(textarea);
      }else{
        self.sendChatImage();
      }
      textarea.focus(); // 让输入框自动重新获得焦点
    }else{
      accountModel.dialogTitle('请先登录，即可聊天。');
      space.dialogNow('DIALOG_LOGIN');
    }
  }
  this.sendChatImage=function() {
    self.fileInput.accept='image/*';
    self.fileInput.onchange=function(){
      if (self.fileInput.files.length != 0) {
        var file = self.fileInput.files[0],
            reader = new FileReader();
        if (!reader) {
          space.remind({text:'your browser doesn\'t support fileReader!'});
          return;
        };
        reader.onload = function(e) {
          var msg={content:{image:e.target.result}, whenClient:new Date()};
          self.socket.emit('User_sendChatMessage', msg);
          self.getMyChatMessage(msg); // 立刻显示自己发的图片，不等待后台返回。
        };
        reader.readAsDataURL(file); // 使用FileReader来将图片读取为base64格式的字符串形式进行发送。
      };
    }
    self.fileInput.click();
  };
  this.sendChatAudio=function(){
    self.fileInput.accept='audio/*';
    self.fileInput.onchange=function(){
      sow.Tool.uploadFile(
        self.fileInput,
        { usage:'AUDIO' },
        {
          busyUploading:space.busyUploading,
          onUploadProgress:space.uploadProgress,
          onUploadFail:space.uploadFail,
          onUploadDone:function(response, textStatus, jqXHR){
            if (response && response.filepath){
              var msg={content:{audio:response.filepath}, whenClient:new Date()};
              self.socket.emit('User_sendChatMessage', msg);
              self.getMyChatMessage(msg);
              self.omitHistoryOnce=true;
            }else if (response && reponse.result){
              space.remind({text:Resource['zh_CN'].dialogFeedback['UPLOAD_FAIL'],scenario:'WARN'});
            }
          }
        }
      );
    }
    self.fileInput.click();
  }
  this.getMyChatMessage=function(msg){
    msg._data={owner:starModel.onlinePerson()};
    self.chatMessageList.push(msg);
    if (self.chatMessageList().length>sow.Const.LIMIT_DEFAULT/2) self.chatMessageList.splice(0,1);
    $(self.chatWindow).animate({scrollTop:self.chatContent.clientHeight}, 1000);   // .scrollTop(self.chatContent.clientHeight) 有动画效果。// $(self.chatWindow).scrollTo(0, self.chatContent.clientHeight); 但 Chrome/Safari 不支持 scrollTo
  }
  this.getChatMessage=function(data){
    self.chatMessageList.push(data);
    if (self.chatMessageList().length>sow.Const.LIMIT_DEFAULT/2) self.chatMessageList.splice(0,1);
    $(self.chatWindow).animate({scrollTop:self.chatContent.clientHeight}, 1000);
  }

};
