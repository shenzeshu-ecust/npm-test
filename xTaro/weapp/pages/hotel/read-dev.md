
#### 钟点房问题:

1. 钟点房日历选择，只支持选择单晚（目前没控制）     done
2. 地图模块不需要                               done
3. 进入详情页，未带入钟点房筛选                    done
4. 卡片信息有重复 这个找产品或者UI过一下            
5. 房型名称不需要显示（钟点房）                服务下发问题
6. 立减确认标签缺失                         服务未下发相应字段
7. 订完显示两个按钮                         done
8. 比收藏时降价xxx                          服务下发问题, 前端如法判断除非整个

今天处理问题:
1. 去掉房型名称上面的“(钟点房)”
2. 城市选择去掉 海外城市
3. 翻页到最后，显示“到底了”
4. 浮层特别提示 用黑色字体
5. 价格样式 优化
6. 去掉优化券领取

未处理的问题：
1. 费用明细显示返现
2. 近地铁筛选无法反选




todo:: 跳填空页浮层显示问题


pages/hotel/inquire/index?cityid=13&ishourroommodule=1



### old
https://m.ctrip.com/restapi/soa2/14605/getHotelList

### new
https://m.ctrip.com/restapi/soa2/22370/gethotellist




## 更新整体小程序
`minitools --update`

注意：添加--ignoreBundle pages/xxx   可以在更新时过滤某个文件夹下的内容

## 小程序主目录更新hotel bundle
`minitools --updateBundle pages/hotel --branch dev/liwl`

## conf minitools
http://git.dev.sh.ctripcorp.com/tinyapp/wxtools-new




