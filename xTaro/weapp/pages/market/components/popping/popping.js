import { cwx, _ } from "../../../../cwx/cwx.js";


//跳跳糖组件
/**
 * [
  {src:'https://images3.c-ctrip.com/marketing/2021/06/xcx_assist/eat1.png', animate:''}, 
  {src:'https://images3.c-ctrip.com/marketing/2021/06/xcx_assist/eat2.png', animate:''},
  {src:'https://images3.c-ctrip.com/marketing/2021/06/xcx_assist/eat3.png', animate:''},
  {src:'https://images3.c-ctrip.com/marketing/2021/06/xcx_assist/eat4.png', animate:''},
  {src:'https://images3.c-ctrip.com/marketing/2021/06/xcx_assist/eat5.png', animate:''},
  {src:'https://images3.c-ctrip.com/marketing/2021/06/xcx_assist/eat6.png', animate:''},
  {src:'https://images3.c-ctrip.com/marketing/2021/06/xcx_assist/eat7.png', animate:''}
]
 */

Component({
  properties: {
    list: {
      type: Array,
      value: []
    }
  },
  ready: function () {
    this.runList()
  },
  methods: {
    runList(){
      let list = this.data.list;
      if(list.length>0){
        setInterval(()=>{
          let lastItem=list.pop()
          lastItem['animate']='popping'
          list.splice(1,0,lastItem)
          this.setData({
            list
          },()=>{
            setTimeout(()=>{
              let newList = this.data.list;
              newList[1]['animate']=''
              this.setData({
                list:newList
              })
            },800)
          })
        }, 3000);
      }
    }
  }
})