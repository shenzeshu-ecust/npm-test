




wxf9c46e3cd18a02d7



http://sqltools.ops.ctripcorp.com/tasks/tasksform/dbuser



### 测试工具中查询短信验证码

http://10.3.2.132:8080/BaseBizCIPlatform/VerifyCode.jsp


select s.message,* from smsdb.dbo.vSMSWaitingScreenHistory v,smsdb.dbo.smsrpt s where v.MobilePhone = '13712300123' and v.SMSID = s.SMSID and v.MobilePhone = s.MobilePhone




select * from smsdb.dbo.smsrpt s where s.MobilePhone = '13712300123' order by s.SendTime desc



select top(10) * from CMsgPosterDB..V_MC_ShortMessageSentHistory where messageBody like '%13333344445%' order by DataChange_CreateTime desc



### 新列表

- pages/hotel/listnew/index

* 支持参数：

  | Prop      | Type   | Required | Description                                                                          | Default | Example |
  | --------- | ------ | -------- | ------------------------------------------------------------------------------------ | ------- | ------- |
  | cityid    | string | yes       | 城市ID                                |        |
  | ishourroommodule  | string | no       | 是否进入钟点房列表页     |    |1,0    |
  | 其它  | string |        |  |        |
  

- 举例

  - pages/hotel/listnew/index?cityid=13&ishourroommodule=1
