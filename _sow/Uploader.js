//"use strict"; // 严格模式应当仅限用于开发环境。在运维环境下请删除该模式。

module.exports=function(options){
  var self=this;
  this.constructor=arguments.callee;
  this.__proto__=sow.modelPrototype;

  this.busy=ko.observable(false);
  this.progress=ko.observable(0);
  this.fileInput;
  this.onUploadFail;
  this.onUploadDone;
  this.origImg;

  this.setModel(options);
  this.uploadProgress=function(evt) {
    if (evt.lengthComputable) {
      self.progress(Math.round(evt.loaded * 100 / evt.total));
    }
  };

  // [todo] 添加 drag and drop: http://blog.csdn.net/zhu1988renhui/article/details/7936498
  this.uploadFile=function(fileInput, params){ // fileInput: 前端<input file元素；params: JSON对象，传给后台；options 包括 busyUploading/状态设置函数，onDone/执行完毕回调；onProgress/执行过程回调。
    var selectedFile = undefined;
    if (fileInput && (selectedFile=fileInput.files[0])) // 初始化时，selectedFile还不存在，但是本方法会被调用，导致失败。所以在此作个检查。
    {
      fileInput.value = ''; // 清空fileInput，否则，已经选择的文件会一直保留，下次重新打开网页也仍然在，并且初始化时自动激发change事件调用uploadFile从而被重复上传。

      // 执行前端能做的检查
      if (!/^(jpg|png|jpeg|gif|amr|wav|mp3|mp4|mov)$/.test(sow.Tool.getFileExt(selectedFile.name))) {
        if(typeof self.onUploadFail==='function') self.onUploadFail('UPLOAD_BADEXT');
        return false; // return false to cancel upload.
      } else if (selectedFile.size>sow.Const.UPLOAD_LIMIT*10 && !/^(jpg|png|jpeg)$/.test(sow.Tool.getFileExt(selectedFile.name))) {
        if(typeof self.onUploadFail==='function') self.onUploadFail('UPLOAD_OVERSIZED');
        return false; // return false to cancel upload.
      }

      // 对大图片文件进行压缩。
      if (/^(jpg|png|jpeg)$/.test(sow.Tool.getFileExt(selectedFile.name)) && selectedFile.size>sow.Const.UPLOAD_LIMIT && !self.origImg) {
        if (window.plus && window.plus.zip) {
          var zippedImgPath = selectedFile.name.replace(/([^\/]+)$/, "zip_$1");  // 如果 'zip_'+selectFile，会被放在io.dcloud.HBuilder/.HBuilder/apps/HBuilder/www/zip__doc/xxxxx.jpg； 如果 selectFile+'.zipped'，会被放在 .../HBilder/doc/xxxxx.jpg.zipped 
          window.plus.zip.compressImage(
            { src:selectedFile.name, dst:zippedImgPath, width:'20%', rotate:(sow.Tool.deviceInfo().brand==='iphone'?'90':'0'), quality:20 }, // iPhone上，照片方向总是被旋转，因此要转回去。
            function(evt) {
              sow.Tool.uploadFileOnPhone(zippedImgPath, params, options); 
              // [todo] 上传后再次更新界面
              return true;
            },
            function(error) {
//              sow.test('Compress error!'+JSON.stringify(error)); // 忽略压缩错误，继续上传原文件。
            }
          );
        }else{
//        在电脑上怎么办，不压缩？
//        sow.test('selectedFile.size='+selectedFile.size);
//        window.lrz(selectedFile)  // 在桌面浏览器(Firefox)没问题，但在Coolpad S6的手机应用(HBuilder)或手机浏览器里却静悄悄的不起作用。
//          .then(function(rst){
//            sow.test('lrz done');
            // [todo] 上传
            //var img = document.getElementById('？？？'); // new Image();
            //img.src = rst.base64;
//          })
//          .catch(function(err){sow.test('lrz error: ');})
//          .always(function(){sow.test('lrz always');});
        }
      }

      // 准备上传
      var fd = new FormData(); // 或者取得form元素对象，将它作为参数传入FormData对象中。示例 var fd = new FormData(document.getElementById('myform'));
      fd.append('fileData', selectedFile);
      for (var prop in params){ // 收集需要传递给后台的其他数据，JSON形式。
        if (params[prop] && typeof params[prop] === 'object'){  // 如果 params['prop'] 是一个非null对象，例如是一整个 project/person 对象, 需要先转化成URL查询字符串，否则传到后台是 "[object Object]"
//          params[prop]=$.param(params[prop]); // 或者单纯转化 params[prop] 为一个URL查询字符串，让后台去手动解析回数组: parse_str($_REQUEST['project'],$projectData)
          for (var key in params[prop]){  // 或者在前端就把 project/person 等对象的一个个标量属性 转化为一个个URL查询字符串，则会被后台自动解析成数组，不再需要手动解析。
            if (key.charAt(0)!=='_' && params[prop][key]) { // 即使被定义为 obj[key]=undefined, key 也会被 for 循环使用，所以显性过滤掉。[todo] 或者，仅仅过滤掉 _data?
              if (typeof params[prop][key] !== 'object'){ // 注意，这里仍然不能递归处理更下层的对象，例如 info/_data 会被赋值为 [object Object]，送到后台导致插入数据库或出错。
                fd.append(prop+'['+key+']',params[prop][key]);
              }else{
                fd.append(prop+'['+key+']',JSON.stringify(params[prop][key])); // 所以要专门把更下层的 info/content/_data 等对象转化为 JSON 字符串。
              }
            }
          }
        }else if (params[prop]){
          fd.append(prop, params[prop]);
        }
      };

    // 开始上传
      self.busy(true);  // 开始上传后，禁止再点击按钮。
////    直接使用xhr:
//  var xhr = new XMLHttpRequest();
//  xhr.upload.addEventListener('progress', self.onUploadProgress, false);
//  xhr.addEventListener('load', self.onUploadDone, false);
//  xhr.addEventListener('error', function(evt){sow.test('There was an error attempting to upload the file.');}, false);
//  xhr.addEventListener('abort', function(evt) {sow.test('The upload has been canceled by the user or the browser dropped the connection.');}, false);
//  xhr.open('POST', SOLET+'Tool_upload', true);
//  xhr.send(fd);
//  sow.test(xhr.responseText); // 如果直接用xhr，还需要解析 evt.target.responseText 来处理后台返回的信息。
////    或者使用$.ajax. [todo] 但不知为何，这个$.ajax会导致Knockout在Console里报错 TypeError: l.apply is not a function，即使没有参数也报错。而其他地方的$.ajax没问题。
      $.ajax({  // API参考: http://api.jquery.com/jQuery.ajax/
        url: SOLET+'Tool_upload'
        ,type: 'POST'
        ,data: fd
        ,processData: false  // 告诉jQuery不要去处理发送的数据，以正确处理FormData类型
        ,contentType: false   // 告诉jQuery不要去设置Content-Type请求头，以正确处理FormData类型
        ,dataType: 'json'
        ,xhr: function(){var xhr=$.ajaxSettings.xhr(); if (xhr.upload && typeof self.onUploadProgress==='function') xhr.upload.addEventListener('progress',self.onUploadProgress,false); return xhr;}  // jQuery的jqXHR不提供upload属性，因此需要使用自己的xhr来监听progress。但是在这里引用预先加载好onProgress的xhr却不能达到效果，只能在这里当场建立$.ajaxSettings.xhr()或new XMLHttpRequest() 然后upload.addEventListener。
//      ,success:function(){ Anything data, String textStatus, jqXHR jqXHR}   // 换用 jqXHR.done()。当前端发送成功时调用。
//      ,error:function(){ jqXHR jqXHR, String textStatus, String errorThrown}  // 换用 jqXHR.fail()。当前端发送出错时调用。
//      ,complete:function(){ jqXHR jqXHR, String textStatus}  // 换用 jqXHR.always()。当前端发送完毕（不论成功或出错）时调用。
      }).done(self.onUploadDone) // 注意，不论后台是成功接收还是发生错误，只要前端成功发送了，总是执行done方法。
      .fail(function(){ if(typeof self.onUploadFail==='function') self.onUploadFail('UPLOAD_FAIL'); } )  // 文件上传过程中失败
      .always(function(){ self.busy(false);} );
      return true;
    }
    return false;
  }

  this.uploadFileOnPhone=function(filePath, params, options){
    if (window.plus && window.plus.uploader && filePath) {
      self.busy(true);
      var task = window.plus.uploader.createUpload(
        SOLET + 'Tool_upload',
        { method:'POST',blocksize:204800,priority:100 },
        function ( uploadResult, status ) {
          if ( status == 200 ) {
//            sow.test('upload done '+uploadResult.responseText);
            if (typeof self.onUploadDone==='function') self.onUploadDone($.parseJSON(uploadResult.responseText));
          } else { 
            if (typeof self.onUploadFail==='function') self.onUploadFail(status);
          };
          self.busy(false);
        }
      );
      task.addFile( filePath, {key:'file2upload'} );
      for (var prop in params){ // 收集需要传递给后台的其他数据，JSON形式。
        task.addData(prop, params[prop]);
      };
      task.start();
      return true;
    }else{
//      sow.test('您的手机系统不支持上传'); 
      if (typeof self.onUploadFail==='function') self.onUploadFail('UPLOAD_NOSUPPORT');
      return false;
    };
  }

}
