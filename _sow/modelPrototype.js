/*
 * 远近JS模型对象的框架 （采用了Knockout） 架构：View(HTML/CSS) - Model(JS) -/- Logic(PHP) -
 * Data(SQL) 目的：维护应用模型。方法是： 存取后台数据， 维护应用模型（以数据为核心驱动，用方法为工具修改），
 * 提供界面绑定目标（数据作为元素内容，方法作为事件处理） 内容：1.数据属性，2.方法属性。注意使用远近代码命名规范。
 * 规范：1.每个模型，以数据属性为核心驱动，以方法属性为工具修改。
 * 2.提供一系列应用调用接口方法，供外部(HTML的事件绑定或应用模型调用)查询、设置模型的数据。
 * 3.提供一系列内部数据同步方法，利用ko.computed的自动连锁反应，时刻保持模型数据之间的完整、有效。 4.提供一系列后台数据存取方法,
 * 5.提供一系列界面控制方法, 6.每个包含异步执行的方法，应当预留一个callback参数。 方法的命名习惯： View -- data-bind --
 * Model -- get/setModel/Prop -- Model -- select/update/insert/deleteData --
 * Database
 */
/* 所有模型对象共享的方法和属性，定义为模型对象原型。 */
module.exports= modelPrototype = {
  domel : null, // 记录本模型对象所绑定在的HTML DOM元素，或DOM元素的ko.observable元素，
                // 应当在该DOM元素生成时，
                // 用 with: new ModelXxx({domel:$element})
                // 或 with: modelXxx.setProp('domel',$element) 
                // 或 with: modelXxx.extend({domel:$element)
                // 或 with: modelXxx.domel($element)
                // 传入给模型对象而覆盖此处的默认值。
  _eventListeners : null, // 每个实例模型都需要一份自己的事件及监听者列表。不要初始化为 {}, 而是在 addListener
                          // 时创建。因为实例对象 通过 读遍历操作 继承原型对象的
                          // _eventListeners的值，但这是个对象，不是标量，因此即使写入
                          // _eventListeners['...']时，也不会生成实例的_eventListners。
  /* 可供定制的初始化方法 */
  init : function() {
  },
  /* 模型操作方法：（在模型内部使用，读写各数据属性。） */
  resetModel : function() { // model -> model
    for (var p in this) {
      if (this.hasOwnProperty(p) && typeof p != 'function') {
        switch (typeof(p)) {
          case 'number': p = 0; break;
          case 'string': p = ''; break;
          case 'boolean': p = false; break;
          case 'object': break;
          default: break;
        }
      }
    }
  },
  setModel : function(modelData, strict) { // modelData -> model
    /* 复制参数的属性到本对象里 */
    for ( var key in modelData) {
      if (strict) { // 当参数strict为真，就进行严格的设置，只给已经存在的属性赋值。
        if (this.hasOwnProperty(key)) {
          this[key] = modelData[key];
        }
      } else { // 当参数strict为空或为假。
        this[key] = modelData[key];
      }
    }
    return this;
  },
  /* 本对象属性存取方法 */
  setProp : function(key, value, strict) { // 把本对象属性key，赋值以value。
    if (strict) { // 当参数strict为真，进行严格设置
      if (this.hasOwnProperty(key)){
        this[key] = value;
      }
    } else { // 当参数strict为空或假
      this[key] = value;
    };
    return this;
  },
  getProp : function(key) { // 读出本对象属性key的值。
    return this[key];
  },
  setWaterfall : function() {
    if (!this.domel) { // 尚未设定本元素，则设置页面上当前所有瀑布流元素。可独立做成一个全局方法。
      $('.Waterfall:visible').each(function(i,val) { // 用 each 来确保不同的Waterfall容器里的卡片重置序数。
        $(val).children().setWaterfall();
      });
    }else if (typeof this.domel == 'string')
      $('#' + this.domel).children().setWaterfall();
    else
      $(this.domel).children().setWaterfall();
  },
  /* 事件处理机制 */
  addListener : function(eventType, listener) {
    if (this._eventListeners == null) {
      this._eventListeners = {};
    }
    if (typeof this._eventListeners[eventType] == 'undefined') {
      this._eventListeners[eventType] = [];
    }
    this._eventListeners[eventType].push(listener);
  },
  removeListener : function(eventType, listener) {
    if (this._eventListeners != null
        && this._eventListeners[eventType] instanceof Array) {
      var listeners = this._eventListeners[eventType];
      for (var i in listeners) {
        if (listeners[i] === listener) {
          listeners.splice(i, 1);
          break;
        }
      }
    }
  },
  clearListenerAll : function(eventType){
    if (this._eventListeners != null){
      this._eventListeners[eventType]=undefined;
    }
  },
  triggerEvent : function(eventType, params, callback) {
    var event = {
      type : eventType,
      target : this
    };
    if (this._eventListeners != null
        && this._eventListeners[event.type] instanceof Array) {
      var listeners = this._eventListeners[event.type];
      for (var i in listeners) {
        listeners[i](event, params, callback);
      }
    }
  }
};

/* 模型对象的构建函数的模板：（主要用来定义应当是每个对象一份的数据属性，以及该模型专用的方法属性） */
//function ModelObject(modelData) // 不知为何，写 ModelObject = function(...)
                              // 就this.constructor=arguments.callee不起作用。
//{
//  var self = this; // 设置对所有内部嵌套函数有效的自身变量。
//  this.constructor = arguments.callee; // 让每个生成的实例对象都维护自己的constructor，而不依赖于该构建函数的原型对象的constructor。
                                        // 每个构建函数都要添加这一句，无法继承。
//  this.__proto__ = sow.modelPrototype; // 设置原型对象。因为 实例.__proto__ 等价于 构建函数.prototype。也可在函数定义后，写 函数名.prototype=原型对象。ModelObject.prototype=sow.modelPrototype;

  /* 数据属性： */
//  this.domel = null; // HTML元素命名。
//  this.url = null; // 后台数据存取入口。
  /* model-specific data/模型特有数据: */
//  this.xxx = ko.observable({});
//  this.yyy = ko.observableArray([]);
//  this.zzz = ko.computed(function() {}, this);
  /*
   * 用外部参数覆盖默认属性值，从而允许定制本模型。 注意，这应当在所有数据的默认定义之后，否则外部参数传入的定义可能被默认定义所覆盖；
   * 并且，在所有方法定义之前，特别是ko.computed方法，因为ko.computed方法跟踪的是其定义时看到的ko.observable数据，即使该数据后期被重设了值。
   * 例如，如果modelData重新设置了某些被跟踪的数据，那么该ko.computed定义在setModel之前的话，不会导致想要的自动跟踪：
   * this.person=null; ...; this.syncXxx=ko.computed(function() {跟踪person});
   * this.setModel({ Person:Space.onlinePerson});
   */
//  this.setModel(modelData);

  /* 模型数据自动同步方法：(利用ko.computed的自动连锁反应，来维护模型数据的完整、有效。 */
  // this.syncXxx = ko.computed(function() {});
  // this.syncYyy = ko.computed(function() {});
  /* 交互流程控制方法：（用于交互事件处理。这里可以但也应避免绑定界面元素） */
  // this.onXxxEvent = function() // view -> model
  // {};
  // this.doXxxAction = function() // model -> model
  // {};
  // this.onXxxResult = function() // view <- model
  // {};
  /*
   * 定义初始化方法，覆盖掉原型的init，如果有初始化工作要做。
   */
  // this.init = function() {};
  /*
   * 调用初始化方法。建议放在构建函数的最后。
   * 如果本构建函数重新定义了init而覆盖了原型的init，那么该调用必须放在新init定义之后，否则被调用的是ModelObjectPrototype的空init()方法。
   * 同理，也要放在其他ModelObjectPrototype方法之后。
   */
  // this.init();
//}
//  ModelObject.prototype = sow.modelPrototype; // 设置原型对象。或者在构建函数里直接赋值：this.__proto__=sow.modelPrototype;
//  var myObj = new ModelObject(); // 定义实例。 

/************************
** 如果实例是唯一的，那么可以定义匿名的构建函数：
** var myObj = new (function (){ ...... })();
************************/