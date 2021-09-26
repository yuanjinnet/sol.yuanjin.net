module.exports=function(options)
{
  var self = this;
  this.constructor = arguments.callee; 
  this.__proto__ = sow.modelPrototype;

  this.mousePressed=false;
  this.touched=false;
  this.lastX;
  this.lastY;
  this.ctx;
  this.strokeStyle=ko.observable('black');
  this.lineWidth=ko.observable('8');
  this.canvas; // 必须初始化 self.canvas 为 canvas 元素，才能调用其它方法。
  this.imageSize; // 记录阶段性的手绘图像大小。

  this.setModel(options);
  
  /* 注意，toDataURL不允许跨域，否则抛出 SecurityError: The operation is insecure 错误。 */

  /**
  client / clientY：触摸点相对于浏览器窗口viewport的位置
  pageX / pageY：触摸点相对于页面的位置
  screenX /screenY：触摸点相对于屏幕的位置
  **/
  this.initCanvas=function(){
    if (self.canvas){
      self.ctx=self.canvas.getContext('2d');
      self.canvas.onmousedown=function(e){
        self.mousePressed=true;
        self.draw(e.clientX-$(this).offset().left, e.clientY-$(this).offset().top, false); // 不要使用 self.canvas.offsetLeft/offsetTop，因为在测试中发现，它们的值是0，是相对于上级元素的，而不是全局的。
      };
      self.canvas.ontouchstart=function(e){
        self.touched=true;
        var touch=e.touches[0];
        self.draw(touch.clientX-$(this).offset().left, touch.clientY-$(this).offset().top, false);
      }
      self.canvas.onmousemove=function(e){
        if(self.mousePressed){
          self.draw(e.clientX-$(this).offset().left, e.clientY-$(this).offset().top, true);
        }
      };
      self.canvas.ontouchmove=function(e){
        if(self.touched){
          var touch=e.touches[0];
          self.draw(touch.clientX-$(this).offset().left, touch.clientY-$(this).offset().top, true);
        }
      }
      self.canvas.onmouseup=function(e){
        self.mousePressed=false;
      };
      self.canvas.onmouseleave=function(e){
        self.mousePressed=false;
      };
      self.canvas.ontouchend=function(e){
        self.touched=false;
      }
      $(document).ready(function(){ // 要确保在页面完全载入后，再初始化imageSize，否则不准确。
        self.imageSize=self.canvas.toDataURL('image/png').length;
      })
    };
  };

  this.draw=function(x,y,isDown){
    if (isDown){
      self.ctx.beginPath();
      self.ctx.strokeStyle=self.strokeStyle();
      self.ctx.lineWidth=self.lineWidth();
      self.ctx.lineJoin='round';
      self.ctx.moveTo(self.lastX, self.lastY);
      self.ctx.lineTo(x,y);
      self.ctx.closePath();
      self.ctx.stroke();
    }
    self.lastX=x;
    self.lastY=y;
  };
  
  this.clearCanvas=function(){
    if (self.canvas){
      self.ctx.setTransform(1,0,0,1,0,0);
      self.ctx.clearRect(0,0, self.ctx.canvas.width, self.ctx.canvas.height);
      self.imageSize=self.canvas.toDataURL('image/png').length; // 注意，当窗口resize时，canvas.toDataURL().length 也会变化。
    }
  };

  this.image2canvas=function(imageUrl) {
    if (self.canvas){
      var image = new Image();
      image.src=imageUrl; 
      image.onload = function() {
        self.clearCanvas();
        var ratio = Math.min(self.canvas.width/image.width, self.canvas.height/image.height);
        self.ctx.drawImage(image,
          (self.canvas.width-image.width*ratio)/2, (self.canvas.height-image.height*ratio)/2, // 在画布上的起点坐标
          image.width*ratio, image.height*ratio );
        self.imageSize=self.canvas.toDataURL('image/png').length;
        return self.canvas;
      };
    };
  };
  this.resizeCanvas=function(){
    if (self.canvas){
      // 重设canvas的尺寸导致清空，所以一定要在重设之前获取imageData和ratio
      var imageData=self.ctx.getImageData(0, 0, self.canvas.width, self.canvas.height);
      var ratio = Math.min(self.canvas.offsetWidth/self.canvas.width, self.canvas.offsetHeight/self.canvas.height);
      // canvas.offsetXxx 是自动跟着resize而变的，但 canvas.xxx 不变。需要手工去更新。
      var orgWidth=self.canvas.width;
      var orgHeight=self.canvas.height;
      self.canvas.width=self.canvas.offsetWidth;
      self.canvas.height=self.canvas.offsetHeight;
//      self.clearCanvas();
      self.ctx.putImageData(imageData, 0, 0,
//        (self.canvas.width-orgWidth*ratio)/2, (self.canvas.height-orgHeight*ratio)/2,
//        orgWidth, orgHeight); // 不知为何，还是不能达到预期的效果，就是把原图迁移到resize后的canvas上，位置总是不对。
        0, 0,
        self.canvas.width, self.canvas.height); // 不知为何，还是不能达到预期的效果，就是把原图迁移到resize后的canvas上，位置总是不对。
    }
  };
  $(window).resize(self.resizeCanvas);

  /* 不依赖于其他HTML元素，仅仅依赖于imageUrl参数，来转换图片文件到DataURL编码。 */
  this.image2dataURL=function(imageUrl){
    var canvas=document.createElement('canvas');
    var image=new Image(); image.src=imageUrl;
    var imageName=imageUrl.replace(/^image\/(\w+)\.(\w+)$/,"$1");
    var imageType=imageUrl.replace(/^.+\.([^\.]+)$/,"$1");
    image.onload=function(){
      canvas.width=image.width;
      canvas.height=image.height;
      canvas.getContext('2d').drawImage(image,0,0);
      console.info("$%s_%s:'%s';",imageName,imageType,canvas.toDataURL('image/'+imageType));
    };
  }

  this.canvas2image=function(domel) {
    var image = domel || new Image();
    image.src = self.canvas.toDataURL('image/png'); // canvas.toDataURL 返回的是一串Base64编码的URL
    return image;
  };

  this.saveAsLocalFile=function() {
    var imageData = self.canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
    window.location.href=imageData; // 不懂为什么，但这一句会打开文件存放对话框，存成一个png内容的文件
  };

  this.uploadImage=function(params,options){
    var imageData=self.canvas.toDataURL('image/png');
    self.imageSize=imageData.length;
//    imageData=encodeURIComponent(imageData); // 安全起见，对DataURL再进行URI编码。注意，这样imageData的开头变成 data%3Aimage%2Fpng%3Bbase64%2C, 30个字符，那么其他地方也需要调整。
//    imageData=imageData.replace(/^data:image\/(png|jpg);base64,/,''); // 也可直接 imageData.substr(22)。或者干脆交给后台去处理。
    params = params || {}; params.imageData=imageData;  // 必须命名为imageData，以和后台的代码呼应。
    $.post(
      SOLET+'File_upload',
      starModel.normalize(params),
      function(){}, // $.post必须要有这个函数，否则'json'也不被正确识别和使用。
      'json'
    ).done(options.onUploadDone)
    .fail(options.onUploadFail)
    .always(function(){ if(typeof options.busyUploading==='function') options.busyUploading(false); });
  };

};