/*********************************************
http://qianduanblog.com:18080/post/jquery-fullscreen.html
http://frontenddev.org/

今天想说的是自己总结这些琳琅满目的插件重写的一个jQuery.fullscreen插件，不过呢，这个插件只支持谷歌、火狐、苹果浏览器哦，因为只有这些浏览器公开了全屏的API，期待更多的浏览器加入和统一方法，H5近在咫尺却望眼欲穿啊。

先说下主要用法。

    $.support.fullscreen;//true/false
    $(element).fullscreen(
    {
    	callback:function(isfullscreen){}
    });
    $(element).exitFullscreen(
    {
    	callback:function(){}
    });

一共三个方法。

    1是判断浏览器是否支持全屏API。

    2是在浏览器全屏和退出全屏状态的时候，会执行callback方法。

    3是浏览器在退出全屏状态会执行的方法。（可能2和3有重复，其实没有的。2是按esc退出全屏，这是浏览器的自带方法。3是用户主动其他操作退出全屏。）
*********************************************/
(function($)
{
	$.support.fullscreen = supportFullScreen();
 
	$.fn.fullscreen=function(setting)
	{
		//默认选项
		var defaults=
		{
			callback:function(){}
		};
 
		//覆盖选项
		var opt=$.extend({},defaults,setting);
 
		$this=$(this);
 
		if(supportFullScreen())
		{
			requestFullscreen($this[0]);
			$(document).on("fullscreenchange mozfullscreenchange webkitfullscreenchange", function()
			{
				opt.callback(fullscreen());
			});
		}
 
		return $(this);
	};
 
	$.fn.exitFullscreen=function(setting)
	{
		//默认选项
		var defaults=
		{
			callback:function(){}
		};
		//覆盖选项
		var opt=$.extend({},defaults,setting);
 
		if(supportFullScreen())
		{
			exitFullscreen();
			opt.callback();
			$(document).off( 'fullscreenchange mozfullscreenchange webkitfullscreenchange' );
		}
 
		return $(this);
	};
 
	function supportFullScreen()
	{
		var doc = document.documentElement;
 
		return	('requestFullscreen' in doc) ||
			('mozRequestFullScreen' in doc && document.mozFullScreenEnabled) ||
			('webkitRequestFullScreen' in doc);
	}
 
	function fullscreen()
	{
		return	document.fullscreen ||
			document.mozFullScreen ||
			document.webkitIsFullScreen;
	}
 
	function requestFullscreen(elem)
	{
		if (elem.requestFullscreen)
		    elem.requestFullscreen();
		else if (elem.mozRequestFullScreen)
		    elem.mozRequestFullScreen();
		else if (elem.webkitRequestFullScreen)
		    elem.webkitRequestFullScreen();
	}
 
	function exitFullscreen()
	{
		if (document.exitFullscreen)
		    document.exitFullscreen();
		else if (document.mozCancelFullScreen)
		    document.mozCancelFullScreen();
		else if (document.webkitCancelFullScreen)
		    document.webkitCancelFullScreen();
	}
 
})(jQuery);