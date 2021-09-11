module.exports=function(options){
  var self = this;
//  this.constructor = arguments.callee;
  this.__proto__ = sow.modelPrototype;

  this.text=ko.observable('');
  this.qrcode;
  this.qrcodeText=ko.observable('');
  this.scenario=ko.observable('INFO'); // 基本类型：ALERT, CONFIRM, PROMPT, INFO. 应用也可自定义更具体的使用场景。
  this.prompted=ko.observable('');
  this.feedback=ko.observable('');
  this.busy=ko.observable(false);
  this.visible=ko.observable(false);
  this.autoCancel=ko.observable(true);

  this.setModel(options);

  this.resetDialog=function(){
    self.text('');
    self.qrcodeText('');
    self.scenario('');
    self.prompted('');
    self.feedback('');
    self.busy(false);
    self.visible(false);
    self.autoCancel(true);
  }

  this.showDialog=function(options){
    if (options){
      self.resetDialog();
      self.text(options.text||'');
      self.qrcodeText(options.qrcodeText||'');
      if (self.qrcodeText()) self.qrcode.makeCode(self.qrcodeText());
      self.scenario(options.scenario||'');
      self.onPrompt=options.onPrompt||undefined;
      self.onConfirm=options.onConfirm||undefined;
      self.onCancel=options.onCancel||undefined;
      self.visible(true);
      if (options.autoCancel===false) self.autoCancel(false);
//      if (options.timeout>0) {
//        setTimeout(function(){self.visible(false);}, options.timeout);
//      };
    };
  }
  this.showReminder=function(options){
    if (options){
      self.resetDialog();
      self.text(options.text||'');
      self.scenario(options.scenario||'');
      self.visible(true);
      setTimeout(function(){self.visible(false);}, options.timeout||2000);
    }
  }

  this.confirmDialog=function(){
    if (typeof self.onConfirm==='function') self.onConfirm();
    if (self.autoCancel()) self.cancelDialog();
  };
  this.promptDialog=function(){
    if (self.prompted()){
      if (typeof self.onPrompt==='function') self.onPrompt(self.prompted());
      if (self.autoCancel()) self.cancelDialog();
    }else{
      self.feedback('请输入，然后提交！');
    }
  };
  this.cancelDialog=function(){
    if (typeof self.onCancel==='function') self.onCancel();
    self.resetDialog();
  };
}