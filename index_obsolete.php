<?php

    $cIP = getenv('REMOTE_ADDR');
    $cIP1 = getenv('HTTP_X_FORWARDED_FOR');
    //$cIP2 = getenv('HTTP_CLIENT_IP');  // luk.lu: 这个环境变量极少出现，我觉得没意义。
    $cIP1 ? $cIP = $cIP1 : null;
    //$cIP2 ? $cIP = $cIP2 : null;

	$address=$cIP;

	if(false!==strpos($address,'61.132')){
      header('HTTP/1.1 404 Not Found');
      header("status: 404 Not Found");
      echo "<h2>Site under construction!  网站备案中！</h2>";
	}else if (false!==strpos($address,'118.114.245')){
      header('HTTP/1.1 404 Not Found');
      header("status: 404 Not Found");
      echo "<h2>Site under construction!  网站备案中！</h2>";    
  }else{
	  header('Location:http://zcreator.yuanjin.net/index.html');
	}

?>