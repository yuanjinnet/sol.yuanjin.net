/* 瀑布流 */
(function setWaterfall($) {
  $.fn.setWaterfall = function(options) {
    function findLowestIndex(Arr) {
      var index = 0;
      var i;
      for (i in Arr){
        if (Arr[i] < Arr[index]){
          index = i;
        }
      }
      return index;
    };

    function findBigestIndex(Arr) {
      var index = 0;
      var i;
      for (i in Arr){
        if (Arr[i] > Arr[index]){
          index = i;
        }
      }
      return index;
    };

    var boxwidth = $(this).width() + parseInt($(this).css('paddingLeft')) * 2 + parseInt($(this).css('marginLeft')) * 2;
    var wrapWidth = $(this).parent().width(); // 在 iPhone 上，刚启动时有时wrapWidth极小，例如28，导致几个swiper-slide页面挤在一页里，不知为何。

    var col = Math.floor(wrapWidth / boxwidth);
    // wrappadding为整个容器除去所有box后，最左和最右的剩余空间。
    // 当外部容器被缩小到比内部零件还要窄，那么(wrapWidth%boxwidth)/2会导致一个错误的过大的padding，即boxwidth/2，因此作一判断，在此时设为0。
    var wrappadding = (wrapWidth > boxwidth) ? (wrapWidth % boxwidth) / 2 : 0;
    var row = Math.floor($(this).length/col) == $(this).length/col ? $(this).length/col : (Math.floor($(this).length/col) + 1);
    var colhigharry = [];
    var colpos;
    var leftpos;
    var toppos;

    for (var len = 0; len < col; len++){
      colhigharry.push(0);
    };
    $(this).each(
      function(index) {
        var pos = index;
        var col1height = 0;
        var col2height = 0;
        var col3height = 0;
        var col4height = 0;
        if (pos < col) {
          leftpos = boxwidth * pos + wrappadding + 'px';
          $(this).css( {'top':'0', 'left':leftpos} );
          colhigharry[index] = $(this).height()
            + parseInt($(this).css('marginTop')) * 2
            + parseInt($(this).css('paddingTop'))
            + parseInt($(this).css('paddingBottom'));
        } else {
          colpos = findLowestIndex(colhigharry);
          leftpos = boxwidth * colpos + wrappadding + 'px';
          toppos = colhigharry[colpos] + 'px';
          $(this).css( {'top' : toppos, 'left' : leftpos} );
          colhigharry[colpos] = colhigharry[colpos] + $(this).height()
            + parseInt($(this).css('marginTop')) * 2
            + parseInt($(this).css('paddingTop'))
            + parseInt($(this).css('paddingBottom'));
        }
      });

/*  计算本Waterfall容器的高度。如果想让Waterfall容器本身能够overflow:auto来滚动，就不要计算。如果让Waterfall容器的上级来overflow:auto，不计算高度似乎也没有问题。 */
    var wraphighindex = findBigestIndex(colhigharry);
    var wraphigh = colhigharry[wraphighindex] + 'px';
    $(this).parent().height(wraphigh); 

/* 窗口大小变化时重新定位 */
/*    var selector = $(this).selector;
    $(window).resize(function(){
      // sow.test('window is resizing : '+selector);
      $(selector).setWaterfall();
    });
*/
  }

})(jQuery);
