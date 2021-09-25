var Const = module.exports={
// Person constants
  ST_PERSON:'ST_PERSON', ST_PERSON_ICON:'Person/ST_PERSON.png',
    ST_UNKNOWN:'ST_UNKNOWN', SID_UNKNOWN:0, SID_UNKNOWN_ICON:'Person/sid_0.png',
    ST_ALL:'ST_ALL', SID_ALL:2, SID_ALL_ICON:'Person/sid_2.png',
    ST_HELP:'ST_HELP', SID_HELP:100, SID_HELP_ICON:'Person/sid_100.png',
    ST_PERSON_MALE:'ST_PERSON_MALE', ST_PERSON_MALE_ICON:'Person/ST_PERSON_MALE.png', 
    ST_PERSON_FEMALE:'ST_PERSON_FEMALE', ST_PERSON_FEMALE_ICON:'Person/ST_PERSON_FEMALE.png',
  ST_ORG:'ST_ORG', ST_ORG_ICON:'Org/ST_ORG.png',
    ST_ORG_ENT:'ST_ORG_ENT', ST_ORG_GOV:'ST_ORG_GOV', ST_ORG_INS:'ST_ORG_INS', ST_ORG_NGO:'ST_ORG_NGO',
  ST_FAMILY:'ST_FAMILY', ST_FAMILY_ICON:'Family/ST_FAMILY.png',

  ST_OBJECT:'ST_OBJECT', ST_OBJECT_ICON:'Object/ST_OBJECT.png',
  ST_CONCEPT:'ST_CONCEPT', ST_CONCEPT_ICON:'Concept/ST_CONCEPT.png',

  PLACE_NATION:'PLACE_NATION',
  PLACE_PROVINCE:'PLACE_PROVINCE',
  PLACE_CITY:'PLACE_CITY',
  PLACE_DISTRICT:'PLACE_DISTRICT',
  PLACE_TOWN:'PLACE_TOWN',
  PLACE_VILLAGE:'PLACE_VILLAGE',
  PLACE_STREET:'PLACE_STREET',
  PLACE_BLOCK:'PLACE_BLOCK',
  PLACE_ROOM:'PLACE_ROOM',
  PLACE_EXTRA:'PLACE_EXTRA',

// Circle constants
  CT_NONE:'CT_NONE',CT_NONE_ICON:'Circle/CT_NONE.png', CID_NONE:'0',
  CT_SELF:'CT_SELF',CT_SELF_ICON:'Circle/CT_SELF.png', CID_SELF:'1',
  CT_FRIEND:'CT_FRIEND',CT_FRIEND_ICON:'Circle/CT_FRIEND.png', CID_FRIEND:'2',
  CT_CONCERN:'CT_CONCERN',CT_CONCERN_ICON:'Circle/CT_CONCERN.png', CID_CONCERN:'3',
  CT_IMPACT:'CT_IMPACT',CT_IMPACT_ICON:'Circle/CT_IMPACT.png', CID_IMPACT:'4',
  CT_CONTACT:'CT_CONTACT',CT_CONTACT_ICON:'Circle/CT_CONTACT.png', CID_CONTACT:'5',
  CT_PUBLIC:'CT_PUBLIC',CT_PUBLIC_ICON:'Circle/CT_PUBLIC.png', CID_PUBLIC:'6',
  CT_CUSTOM:'CT_CUSTOM',CT_CUSTOM_ICON:'Circle/CT_CUSTOM.png', CID_CUSTOM:'100',
// Window constants
  WT_EMAIL:'WT_EMAIL',WT_EMAIL_ICON:'Window/WT_EMAIL.png', WID_EMAIL:'1',
  WT_NEWS:'WT_NEWS',WT_NEWS_ICON:'Window/WT_NEWS.png', WID_NEWS:'2',
  WT_FORUM:'WT_FORUM',WT_FORUM_ICON:'Window/WT_FORUM.png', WID_FORUM:'3',
  WT_MOMENT:'WT_MOMENT',WT_MOMENT_ICON:'Window/WT_MOMENT.png', WID_MOMENT:'4',
  WT_FLYER:'WT_FLYER',WT_FLYER_ICON:'Window/WT_FLYER.png', WID_FLYER:'5',
  WT_OFFER:'WT_OFFER',WT_OFFER_ICON:'Window/WT_OFFER.png', WID_OFFER:'6',
  WT_CUSTOM:'WT_CUSTOM',WT_CUSTOM_ICON:'Window/WT_CUSTOM.png', WID_CUSTOM:'100',
// Message constants
  MT_PRIVATE:'MT_PRIVATE', MT_PRIVATE_ICON:'Message/MT_PRIVATE.png',
  MT_SOCIAL:'MT_SOCIAL', MT_SOCIAL_ICON:'Message/MT_SOCIAL.png',
  MT_PUBLIC:'MT_PUBLIC', MT_PUBLIC_ICON:'Message/MT_PUBLIC.png',
  MT_PUSH:'MT_PUSH', MT_PUSH_ICON:'Message/MT_PUSH.png',
  MT_CUSTOM:'MT_CUSTOM', MT_CUSTOM_ICON:'Message/MT_CUSTOM.png',
// Vote constants
  VT_GOOD:'GOOD',
  VT_BAD:'BAD',
/* 其他 */
  STAT_ON:1, // 'STAT_ON'
  STAT_OFF:0, // 'STAT_OFF'
  UPLOAD_LIMIT:1048576, // 单位: Byte。
  LIMIT_DEFAULT:12,
  MIN_TITLE:1, MAX_TITLE:100, // 文章标题
  MIN_NAME:1, MAX_NAME:50, // chip/tice/role的名称
  MIN_CONTENT:20, MAX_CONTENT:10000,
  MIN_PWD:6, MAX_PWD:20
};

Const.PERSON_ALL = {_class:'Person', aiid:Const.SID_ALL,tag:Const.ST_ALL,name:'公众',nick:'公众',icon:Const.SID_ALL_ICON,info:{}}; // 广场用户
  Const.PERSON_ALL.location = {latitude:'',longitude:'', nation:{},province:{},city:{},district:{},street:{},block:{},room:{},extra:{}};
Const.PERSON_UNKNOWN = {_class:'Person', aiid:Const.SID_UNKNOWN,tag:Const.ST_UNKNOWN,phone:undefined,email:undefined,name:'匿名',nick:'匿名',icon:Const.SID_UNKNOWN_ICON,info:{}}; // 匿名用户
  Const.PERSON_UNKNOWN.location = {latitude:'',longitude:'', nation:{},province:{},city:{},district:{},street:{},block:{},room:{},extra:{}};

module.exports=Const
