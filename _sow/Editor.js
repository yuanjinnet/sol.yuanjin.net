//"use strict"; // 严格模式应当仅限用于开发环境。在运维环境下请删除该模式。

var Editor = module.exports = function(options){
  var self = this;
  this.constructor = arguments.callee;
  this.__proto__ = sow.modelPrototype;

  this.feedback=ko.observable('');
  this.fileInput=document.createElement('input');
  this.fileInput.type='file';
  this.fileInput.accept='image/*';

  this.setModel(options);

  this.addText=function(observable, path){
    var content=sow.Tool.readPath(path, observable());
    if (Array.isArray(content)){
      content.push({text:''});
    }else{
      sow.Tool.setPath(path, observable(), [{text:''}]); // 不能直接 content=..., 因为全新赋值的对象不属于observable()。
    }
    observable(observable());
  }

  this.uploadImage=function(index, observable, path, update){
    var model=this; // 防止和 editor.self 冲突
    self.fileInput.onchange=function(){
      var sectionIndex;
      var content=sow.Tool.readPath(path, observable());
      if (!Array.isArray(content)) {
        sectionIndex=0;
        sow.Tool.setPath(path, observable(), [{image:''}]);
        content=sow.Tool.readPath(path, observable());
      }else if (0<=index && index<content.length){
        sectionIndex=index;
      }else{
        sectionIndex=content.length;
      }
/*      var param;
      if (observable()._class==='Project') {
        param={ usage:observable().aiid?'PROJECT_DREAM':'PROJECT_DREAM_NEW', project:sow.Tool.normalize(observable()), dreamIndex:sectionIndex };
      }else if (observable()._class==='Message'){
        param={ usage:observable().aiid?'MESSAGE_IMAGE_INARRAY':'MESSAGE_IMAGE', message:sow.Tool.normalize(observable()), contentIndex:sectionIndex };
      }else{
        param={ usage:'IMAGE' };
      } */
      sow.Tool.uploadFile(
        self.fileInput,
        { usage:'IMAGE' },
        {
          busyUploading:self.busyUploading,
          onUploadProgress:self.uploadProgress,
          onUploadFail:self.uploadFail,
          onUploadDone:function(response, textStatus, jqXHR){
            if (response.filepath){
              content[sectionIndex]={image:response.filepath};
              observable(observable());
              if (typeof update==='function') (update.bind(model))(); // updateLog 是公用的方法，必须绑定到正确的主人上，才能成功访问 model.logNow()。
            }else if (reponse.result){
              space.remind({text:Resource['zh_CN'].dialogFeedback['UPLOAD_FAIL'],scenario:'WARN'});
            }
          }
        }
      );
    }

    self.fileInput.click();
  }

  this.deleteSection=function(index,observable, path,update){
    var model=this;
    var content=sow.Tool.readPath(path, observable());
    dialog.showDialog({text:'真的要删除这一节吗？<br><span style="color:#999;font-size:13px;">( <span style="font-family:Sans-Serif;color:#5F9EDF">☰</span>：点击删除，或者拖拽排序 )</span>',scenario:'DELETE',
      onConfirm: function(){
        content.splice(index,1);
        observable(observable());
        if (typeof update==='function') (update.bind(model))();
        dialog.cancelDialog();
      }
    });
  }

  this.switchSection=function (evt, content, update) {
    var model=this;
    if (Array.isArray(content)){
      if (evt.oldIndex<evt.newIndex){
        content.splice(evt.newIndex+1, 0, content[evt.oldIndex]);
        content.splice(evt.oldIndex, 1);
        if (typeof update==='function') (update.bind(model))();
      }else if(evt.oldIndex>evt.newIndex){
        content.splice(evt.newIndex, 0, content[evt.oldIndex]);
        content.splice(evt.oldIndex+1, 1);
        if (typeof update==='function') (update.bind(model))();
      }
    }
  }

/*  this.showHelp=function(){
    space.remind({text:'拖拽调整顺序，或者长按2秒删除'});
  } */
  
};
