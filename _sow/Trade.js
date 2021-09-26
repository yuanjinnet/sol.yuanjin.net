//"use strict"; // 严格模式应当仅限用于开发环境。在运维环境下请删除该模式。

module.exports=function(options){
  var self = this;
  this.constructor = arguments.callee;
  this.__proto__ = sow.modelPrototype;

  this.provice=ko.observable({});
  this.quantity=ko.observable(1);
  this.payCurrency=ko.observable('');
  this.payTotal=ko.observable(0);
  this.userTotal=ko.observable();
  this.payChannelSet=ko.observableArray([]);
  this.payChannel=ko.observable({});
  this.busyPaying=ko.observable(false);
  this.postpayUrl=starModel.starUrl+'/postpay.html'; //如果$postpayUrl含有特殊字符如? & 导致后台签名错误，所以不得不用个html中转
  this.dialogTitle=ko.observable('');
  this.refundPolicy=ko.observable(false);

  this.setModel(options);

  this.getChannelSet=ko.computed(function(){
    if (starModel.deviceReady() && window.plus && window.plus.payment){ // 手机app。既然plus支持的通道是在manifest.json里定义的，似乎没必要特地查询获取，只要根据我编码里实现了什么通道，直接赋值就好了。
      plus.payment.getChannels( // 返回终端/plus能够支持的支付通道，但不一定用户已经安装在系统上。支付宝通道肯定支持（可以用WAP），微信要看是否安装了微信客户端。
        function(channels){
          self.payChannelSet([]);
          for(var i in channels){
            if (channels[i].id==='alipay') { // || channels[i].id==='wxpay'){ // 看新版h5+的示范代码，还要过滤掉系统支持、但h5+不支持的通道。
              self.payChannelSet.push(channels[i]);
            }
          }
        },
        function(evt){
//          self.payChannelSet([]);
        }
      );
    }else if (sow.Tool.deviceInfo().hardware==='mobile') { // 手机web，也可能是app(万一deviceReady没有成功加载，就留用它)
      self.payChannelSet(
        [{id:'alipay',hardware:'mobile',description:'支付宝',serviceReady:true}] );
    }else if (sow.Tool.deviceInfo().hardware==='desktop'){ // 桌面web
      self.payChannelSet([{id:'alipay',hardware:'desktop',description:'支付宝',serviceReady:true}]);
    }else{
      self.payChannelSet([]);
    }
  });
  
  this.pay=function(channel){ // payChannel.id==alipay, wxpay, appleiap. 
    if (channel && channel.id) self.payChannel(channel); // 如果参数 payChannel 有效。
    var payChannel=self.payChannel();  // 如果无效，也许应用直接对chosenPayChannel 进行了设置，则使用之。

    var payTotal= parseFloat(self.payTotal()) || parseFloat(self.userTotal());

    if (!(payTotal>=0.01)) {
      space.remind({text:'最小金额不能低于0.01！请重新输入。'});
    }else if (!(parseInt(self.quantity())>0)) {
      space.remind({text:'数量不能少于一份！'});
    }else if (!payChannel.id) {
      space.remind({text:'缺少支付渠道信息，无法启动支付！'});
    }else if (!self.busyPaying()) {
/* serviceReady: 如果用户没装微信，就别劝他装了
      if (payChannel.id==='wxpay' && payChannel.serviceReady===false){ // serviceReady===false 只有微信一种可能。
        payChannel.installService();
      }
*/
      self.busyPaying(true);
      $.post(SOLET+'Provice_buy',
        starModel.normalize({ Buy: { provice: starModel.simplize(self.provice()),
                 quantity: self.quantity(),
                 payTotal: payTotal,
                 payChannel: JSON.parse(JSON.stringify(payChannel)) } // 后台支持单纯生成订单，或者同时也根据前端可选提供的payChannel来生成支付请求。// 20170124: 天啊！iOS应用无法发起$.post，研究了一整天，发现plus的payChannel包含了函数属性，导致$.post出错！
          , config: { postpayUrl: self.postpayUrl }
        }), 
        function(buy){
//sow.test('Server returns: '+JSON.stringify(buy));
          if (buy && buy.payRequest){
            if (window.plus && window.plus.payment){
              plus.payment.request(payChannel,
                buy.payRequest,
                function(result){ // 支付宝返回给手机客户端的同步通知结果。支付成功的 resultStatus = "9000"。 https://doc.open.alipay.com/doc2/detail.htm?spm=a219a.7629140.0.0.wZgp9S&treeId=59&articleId=103665&docType=1
                  plus.nativeUI.alert("支付成功",function(){ back(); });
                },
                function(error){ // 支付宝 resultStatus=4000  订单支付失败, 6001  用户中途取消, 6002  网络连接出错
                  plus.nativeUI.alert("支付失败");
                });
            }else if (payChannel.hardware==='mobile'){
//              sow.test("调用手机网站支付");
//              sow.test(buy.payRequest);
              if (payChannel.id==='alipay'){
                location.href=buy.payRequest; // safari/iOS 不允许打开新页面。
              }else if (payChannel.id==='wxpay'){
                sow.test('还没想好怎么办');
              }
            }else if (payChannel.hardware==='desktop'){
//              sow.test("调用支付宝桌面网站支付。");
              if (payChannel.id==='alipay'){
                location.href=buy.payRequest; // window.open(buy.payRequest); // 在新窗口中打开，以免破坏本应用页面。
              }
            }else{
              space.remind({text: '很抱歉，无法识别您的系统环境，不能进行支付。'});
            }
          }else{
            space.remind({text:'很抱歉，无法识别您的系统环境，请稍后再试一次。'}); // plus.nativeUI.alert("获取订单信息失败！");
          }
        },
        'json'
      ).always(function(){
        self.busyPaying(false);
      });
    }
  } // End of function pay

};
