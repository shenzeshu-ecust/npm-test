// ! 1 大图预加载
const preloadImages = (sources, callback) => {
  let counter = 0;
  function onLoad() {
    counter++;
    if (counter === sources.length) callback();
  }

  for (const source of sources) {
    const img = document.createElement("img");
    // 一定要先绑定 再加载图片
    // 如果图片从缓存中加载，速度非常快以至于没来得及绑定事件就加载完毕，自然不会触发绑定事件
    img.onload = img.onerror = onLoad;
    img.src = source;
  }
};
/*
        算法：
            1 为每个资源创建 img。
            2 为每个图片添加 onload/onerror。
            3 在 onload 或 onerror 被触发时，增加计数器。
            4 当计数器值等于资源值时 —— 我们完成了：callback()。

*/

// ! 2 自定义指令实现无线滚动加载
// select选择器待选项很多，一次性全部渲染会造成组件很卡

// ~ 注册一个局部的自定义指令，需要以小写v开头
const vLoadMore = {
  mounted: (el: HTMLElement, binding: any) => {
    // 一定要有:teleported="false"  否则获取不到dom
    // 一定是获取的滚动元素的wrapper，而不是滚动元素本身
    const SELECTWRAP_DOM = el.querySelector(
      ".el-select-dropdown .el-select-dropdown__wrap"
    );

    if (SELECTWRAP_DOM) {
      SELECTWRAP_DOM.addEventListener("scroll", (e: any) => {
        const condition =
          e.target.clientHeight + e.target.scrollTop >= e.target.scrollHeight;
        if (condition) {
          binding.value(); // ~ value 自定义指令绑定的值。
        }
      });
    }
  },
};

const loadMore = (n: number) => {
  return () => (state.rangeNumber += n);
};

// ! 3 封装组件
// ! 4 前端监控代码版本，一旦有变更提醒用户刷新

/* 
  进一步更改：前端做这件事原因一般就是用户经常不刷新页面。
  可以根据用户交互事件来做，触发点击时判断上次检测版本的时间间隔是否大于预期，大于则请求版本信息，然后执行更新。
  思路就是1 理由切换时 2点击事件的冒泡。在顶层DOM绑定事件。
  这样做的好处就是静默时计算机也能休息，不至于定时器轮询浪费资源

*/
/*
  <el-select
    v-model="state.selectList"
    v-load-more="loadMore(5)"
    :teleported="false"
    :filter-method="filterMethod"
    @visible-change="visibleChange"
  >
    <el-option v-for="item in showList.slice(0, rangeNumber)" :key="item.name" :value="item.name">
      {{ item.name }}
    </el-option>
  </el-select>

*/

// tips:
/*
 * 从 vue2 升级到 vue3 ，自定义指令的生命周期钩子函数发生了改变，具体变化如下：

    bind 函数被替换成了beforeMounted。
    update 被移除。
    componentUpdated 被替换成了updated。
    unbind 被替换成了 unmounted。
    inserted 被移除

  ~ binding 包含的属性具体的分别为：
    arg 自定义指令的参数名。
    value 自定义指令绑定的值。
    oldValue 指令绑定的前一个值。
    dir 被执行的钩子函数
    modifiers：一个包含修饰符的对象。
  ~ 生命周期钩子
      created ：绑定元素属性或事件监听器被应用之前调用。该指令需要附加需要在普通的 v-on 事件监听器前调用的事件监听器时，这很有用。
      beforeMounted ：当指令第一次绑定到元素并且在挂载父组件之前执行。
      mounted ：绑定元素的父组件被挂载之后调用。
      beforeUpdate ：在更新包含组件的 VNode 之前调用。
      updated ：在包含组件的 VNode 及其子组件的 VNode 更新后调用。
      beforeUnmounted ：在卸载绑定元素的父组件之前调用
      unmounted ：当指令与元素解除绑定且父组件已卸载时，只调用一次。

 */
// ~ 1 全局自定义指令：
// ~ vue3中，vue实例通过createApp创建，所以全局directive挂载方式变成挂载在app上
app.directive("focus", {
  mounted(el) {
    el.focus();
  },
});
// <input type="text v-focus />

// ~ 2 局部自定义指令
//局部自定义指令
const autoFocus = {
  focus: {
    created() {
      console.log("created");
    },
  },
};
export default {
  directives: autoFocus,
  setup() {
    const show = ref(true);
    return {
      show,
      changStatus() {
        show.value = !show.value;
      },
    };
  },
};

// ! 3 级联选择器编辑回显功能 赋值时没有显示(传入的是数组，没及时更新)
// ~ 需要强制刷新

/*
4种方案：
1 router.go(0) 刷新整个页面 ——开销太大，体验差
2 v-if
3 使用内置的forceUpdate方法。this.forceUpdate()
  vue3中 getCurrentInstance()!.proxy!.$forceUpdate()
  或者 
  import {getCurrentInstance } from 'vue'
  const { ctx} = getCurrentInstance()
  ctx.$forceUpdate()

  注意它仅仅影响实例本身和插入插槽内容的子组件，而不是所有子组件。
  结合vue生命周期，调用$forceUpdate后会触发beforeUpdate和updated这两个钩子函数，不会触发其他钩子函数。
  缺点： 频度没控制好会一直刷新导致应用性能变得很低

  ~ 原理：实例需要重新渲染是在依赖发生变化的时候会通知watcher，然后通知watcher来调用update方法
  Vue.prototype.$forceUpdate = function () {
    const vm: Component = this
    if (vm._watcher) {
        vm._watcher.update()
    }
  }

? 4 key-changing 原理很简单，vue使用key标记组件身份，当key改变时就是释放原始组件，重新加载新的组件。

# el-cascader 回选的问题：  不及时更新被选中项
原因是 dom没及时更新，需要给级联选择器增加一个:key值。
在获取回选值的时候，改变key值（keyValue++），组件重新渲染，实现回填功能
*/

// ! 4 代码优化
/*
平台功能：用户根据自身特性拥有标签比如学生、新客、近一个月内没有下过单之类，而平台可以选择不同的标签确认短信、站内信、朋友圈消息等发送人群
已达到精准推送个性化内容。
运营人员圈完人之后会计算每种推送方式（短信、apppush、企微消息等）的人数。然后就可以选择推送方式创建推动任务。

背景：根据后端传过来的对象解析标签并语义化展示给用户。每个对象拥有5层数据。
第一层：标签大类
第二层：某类标签列表labelRelationList以及这些标签之间的关系relation交集、并集（且、或）
第三层：labelRelationList每个元素是一个对象，也有labelList和relation
第四层：各个label的详细信息。
{
    "rangeLabelId": 0,
    "behaviorLabels": {
        "relation": 0,
        "labelRelationList": [
            {
                "relation": 0,
                "labelList": [
                    {
                        "startDate": "10",
                        "endDate": "1",
                        "actionType": 1,
                        "labelType": 0,
                        "labels": [
                            {
                                "labelName": "铁友-酒店首页",
                                "labelType": 0,
                                "labelId": "10320661167"
                            },
                            {
                                "labelName": "铁友-酒店列表",
                                "labelType": 0,
                                "labelId": "10320661170"
                            },
                            {
                                "labelName": "铁友-酒店x页",
                                "labelType": 0,
                                "labelId": "10320661172"
                            },
                            {
                                "labelName": "铁友-酒店填写页",
                                "labelType": 0,
                                "labelId": "10650002930"
                            }
                        ],
                        "browseCount": []
                    }
                ]
            }
        ]
    },
    "touchRangeLabel": {
        "name": "touch_range",
        "value": "[{\"optionKey\":\"WechatMiniProgram\",\"optionValue\":7},{\"optionKey\":\"Sms\",\"optionValue\":7}]",
        "displayName": "触达范围",
        "productLine": "0"
    }
}
*/

// ~ 1）标签选择页逻辑设计与增强标签语义化的扩展性
/* 
  1 标签选择页左边是很多个tags，比如有触达方式，年龄，页面浏览行为，搜索行为。
  2 点击tags出现dialog供用户填写表单，比如年龄限制在几岁之间，用户浏览的什么页面，浏览了几次之类
  3 点击确认，会在右半页面显示已经选择的标签语义化内容，点击这些内容会弹出点击左边tags同一个dialog供编辑修改，还可以拖拽切换他们的或和且的关系
  4 选择完毕，点击确认，会在另一个页面里产生记录，并显示计算中。计算出结果后，展示每种触达方式的可触达用户人数（页面会定时刷新）
 */

/*
? 1 如何设计dialog弹出表单的回选
? 2 如何高效设计标签内容的语义化，增强扩展性。
? 3 标签类别众多（有多种模式，离线、国际离线、国际实时任务，每种的标签有差异也有不同），为每个标签设计一个表单组件耗时耗力且扩展性低，如何设计
? 4 拖拽实现
? 5 定时器的封装，用setInterval不好
*/

// ? 1 tag点击弹窗（表单 ）
/*
  使用pinia维护状态:
  1) 弹窗类型：add / edit
  2) 所有选中的label - selectedLabelList 
  3) 当前label - selectedLabel
  4) 当前标签的位置index（v-for中）
  1 当前用户点击的标签对应的弹窗：维护一个selectedLabel, 点击后根据表单内容生成当前用户点击的标签对应的弹窗：维护一个selectedLabel的初始值
  2 点击取消，清除当前选中的selectedLabel。恢复弹窗类型为add。
  3 选择完成后，点击确认，向selectedLabelList添加。再调一次取消的功能
  4 点击右侧的已选择标签，弹出之前选择的对应表单弹窗，进入编辑模式。将其设置为selectedLabel，标记出现在点击的标签位置，以便修改。
  5 还可以删除标签，根据index删除
  6 点击且或切换关系，改变数据结构中的relation字段。父对象中的relation决定子元素的且或关系（点击的时候传入当前层级、位置）
*/
// ? 2 语义化解决方案

/* 
  有时对标签的解释会随着需求变化而变化，如果采用前端写死的const每次修改会很麻烦
    解决办法：每次解析标签时，从后端获取“字典”数组，从字典里解析对应字段的语义
    （比如[{label: "是", value: "1"}, {label: "否", value: "0"}]）
   ~ 同时这个字典数组也是前端渲染标签的数据来源。字典中有自己的filterType, displayName,options等。
   前端根据filterType设计组件渲染视图。比如in类型前端会调checkboxGroup渲染，single会调radioGroup,range_date调日期组件
 */

// ~ if多分支优化
// 将if条件拆分成map映射（判断条件作为key，处理的函数作为value）。
// 维护性扩展性提高，只要在map对象中加入对应的键值对就可以。且map的检索效率更高。
