var Locale = {};
Locale.zh_CN = {
  uidErrorFeedback: { 
    email:'请输入真实有效邮箱地址。', 
    phone:'请输入真实有效手机号码。', 
    aiid:'请输入以*开头的远近号。', 
    uid:'请输入真实有效的邮箱或手机号。',
    noType:'请先选定账号类型！' },
/*  pwdPrompt: { 
    login:'老用户请输入密码，新用户请设置密码', 
    checkin:'老用户请验证您的密码',
    register:'新用户请设置长度6位以上的密码', 
    reset:'请设置您的新密码'
  }, */
  pwdErrorFeedback: { Soweb_Malformed_Pwd:'密码不能少于6位。' },
  pcdErrorFeedback: { 
    Soweb_Malformed_Pcd:'验证码是6位数字。',
    Soweb_Malformed_Uid:'请先输入正确的用户帐号。',
    busySending:'正在发送中，请稍候...',
    Soweb_Unknown_Sending_Error:'验证码发送失败，请再试一次。', 
    /* 来自 后台Person 的 sendConfirmTicket */
    TicketCreationFailed:'无法创建验证码，请再试一次。',
    EmailSendDone:'验证码发送成功，10分钟内有效。', 
    EmailSendFail:'验证码发送失败，请再试一次。',
    EmailBadInput:'无法发送验证码，请刷新后再试一次。', // 在 php 的 Tool 的 sendMail 内部，缺少 content, subject, email等参数。js 版后台没有它。
    SmsSendDone:'验证码发送成功，10分钟内有效。', 
    SmsSendFail:'验证码发送失败，请再试一次。',
    SmsBadInput:'无法发送验证码，请刷新后再试一次。', // 在 php 的 Tool 的 sendMail 内部，缺少 content, subject, email等参数。js 版后台没有它。
    EnvBadInput:'无法发送验证码，请刷新后再试一次。' // 在 php/js 的 API 的 sendConfirmTicket 内部，缺少 person/star 参数 
  },
  loginFeedback: { 
    LOGIN:'努力验证中，请稍候...',
    LOGIN_SUCCESS:'登录成功啦！马上进入账户...', 
    LOGIN_FAIL:'登录失败 :( 请再试一次。', 
    InsertFailed:'新建账号失败。请再试一次。', 
    MismatchPhonePwd:'手机号和密码不匹配。请再试一次。', 
    MismatchEmailPwd:'邮箱和密码不匹配。请再试一次。', 
    MismatchAiidPwd:'星号和密码不匹配。请再试一次。', 
    MismatchPwd:'密码错误。请再试一次。',
    MissingLoginInfo:'请输入完整的账号和密码信息。', 
    MissingSignupInfo:'请提供邮箱或手机号，即可新建账户',
    
    RESET_SUCCESS:'密码重设成功，请重新登录。', 
    RESET_FAIL:'密码重设失败，请检查账号和验证码。' // 可能是验证码错误或已失效，或者该账户尚不存在。
  },
  changePwdFeedback:{
    CHANGEPWD_SUCCESS:'密码修改成功！',
    CHANGEPWD_FAIL:'密码修改失败，请再试一次！',
    CHANGEPWD_INVALID:'密码不符合要求，请再试一次。'
  },
  dialogFeedback: {
    SUBMIT_MOMENT_DONE: '您的时光已经发表！',
    SUBMIT_MOMENT_FAIL: '您的速记没有成功提交，请再试一遍。',
    SUBMIT_MOMENT_EMPTY: '请先添加一些内容吧！',
    SUBMIT_REPLY_DONE: '您的回复已经发表',
    SUBMIT_REPLY_FAIL: '您的回复没有成功发表，请再试一遍',
    SUBMIT_REPLY_EMPTY: '请先添加一些内容吧！',
    SUBMIT_REPLY_OFFLINE: '登录后，即可回复。',
    UPLOAD_DONE:'保存好啦！',
    UPLOAD_FAIL:'真抱歉，文件上传失败，请再试一次。',
    ACTION_SOUND_FAIL:'真抱歉，录音失败，请再试一次。',
    ACTION_VIDEO_FAIL:'真抱歉，摄像失败，请再试一次。',
    ACTION_VOTE_OFFLINE: '登录后，即可投票。'
  }
}

for (var l of sow.Locale.LangSet){
    if (l.code!=='zh_CN')
      Locale[l.code]=Locale.zh_CN;
}
