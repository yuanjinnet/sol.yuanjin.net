/*
 * 通用的用户界面操作功能对象。
 */
var UI;
module.exports=UI={
  /*
   * 在各种浏览器下，返回事件对象。 在IE/Opera中，事件为全局变量 window.event， 而在Firefox中，事件为函数参数 event
   */
  getEvent : function(event) {
    return event || window.event;
  },
  /*
   * 在各种浏览器下，返回事件的发起元素。
   * 在IE中是window.event.srcElement，在Firefox中是event.target，而在Opera中则两者都支持。
   */
  getElement4Event : function(event) {
    var event = this.getEvent(event);
    return event.srcElement ? event.srcElement : event.target;
  },

  /* 拖拽一个界面元素 */
  enableDrag : function(viewObject) {
    var disX = 0;
    var disY = 0;
    viewObject.onmousedown = function(event) {
      var event = event || window.event;
      disX = event.clientX - viewObject.offsetLeft;
      disY = event.clientY - viewObject.offsetTop;
      document.onmousemove = function(event) {
        var event = event || window.event;
        var L = this.setRange(event.clientX - disX,
            document.documentElement.clientWidth - viewObject.offsetWidth, 0);
        var T = this.setRange(event.clientY - disY,
            document.documentElement.clientHeight - viewObject.offsetHeight,
            0);
        viewObject.style.left = L + 'px';
        viewObject.style.top = T + 'px';
      };
      document.onmouseup = function(event) {
        document.onmousemove = null;
        document.onmouseup = null;
      };
    };
  },
  /* 通过handlerObject元素，伸缩界面元素viewObject */
  enableResize : function(viewObject, handlerObject) {
    var disX = 0;
    var disY = 0;
    var disW = 0;
    var disH = 0;

    handerObject.onmousedown = function(event) {
      var event = event || window.event;
      disX = event.clientX;
      disY = event.clientY;
      disW = viewObject.offsetWidth;
      disY = viewObject.offsetHeight;
      document.onmousemove = function(event) {
        var event = event || window.event;
        viewObject.style.width = event.clientX - disX + disW + 'px';
        viewObject.style.top = event.clientY - disY + disH + 'px';
      };
      document.onmouseup = function() {
        document.onmousedown = null;
        document.onmouseup = null;
      };
    };
  },
  /* 限制数字范围 */
  setRange : function(iNum, iMax, iMin) {
    if (iNum > iMax) {
      return iMax;
    } else if (iNum < iMin) {
      return iMin;
    } else {
      return iNum;
    }
  },
  /* 把当前元素设在上级元素的正中央 */
  setCenter : function(viewObject){
    $(viewObject).css({
        position: 'absolute',
        left: ($(window).width() - $(viewObject).outerWidth())/2,
        top: ($(window).height() - $(viewObject).outerHeight())/2
    });
  },
  goTop : function() {
    $('body,html').animate({ scrollTop: 0 }, 800); //JQM实现返回顶部
  },
  resetHeightTextarea: function(domel){  
    var target=domel || this; // 有这句，就可用于 $('textarea').bind('input propertychange', resetHeightTextarea)。但在so.UI.xxx的调用方法下，还没测试！
    if (target.constructor.name==='HTMLTextAreaElement'){
      target.style.overflowY= 'hidden';
      target.style.height = ''; 
      target.style.height = target.scrollHeight + 'px'; // 当 CSS 中已经显性定义了 height/min-height，那么清空 height 后, scrollHeight 仍然是老的数值，因此根据scrollHeight重设高度不起作用。但是单纯调用这一句，设置 height='' 后textarea会变成CSS里设置的 height/min-height值。
    }
  },
  resetHeightTextareaArray: function(domelArray){
    for (var i in domelArray){
      this.resetHeightTextarea(domelArray[i]);
    }
  },
  resetMinHeightTextarea: function(domel){
    domel.style.height = ''; // 当 CSS 中已经显性定义了 height/min-height，那么清空 height 后, scrollHeight 仍然是老的数值，因此根据scrollHeight重设高度不起作用。但是单纯调用这一句，设置 height='' 后textarea会变成CSS里设置的 height/min-height值。
  },
  autoHeightTextarea: function(domel) {
    var target=domel || this;
    if (target.constructor.name==='HTMLTextAreaElement') {
      $(target).bind('input propertychange', function(){ // 团队/众筹的放在fieldset里的textarea不能正确的初始化高度，因为这个textarea是在载入内容前就预定义好的。解决方法 1. 绑定到 click 事件上，用户第一次点击时调整高度；2. 用 ko 的 if 语句来动态载入textarea。3. 在应用代码里，在载入数据后，显性修改高度。
        target.style.height = '';
        target.style.height = target.scrollHeight + 'px';
      });
      // 初始化激发该设置。
      setTimeout(sow.UI.resetHeightTextarea.bind(target,target),2000); // 如果直接调用，在action/blog的编辑页面，不能正确初始化高度。加上timeout 10就可以。但聊天窗口的需要1000才稳定。
    }
  }
};