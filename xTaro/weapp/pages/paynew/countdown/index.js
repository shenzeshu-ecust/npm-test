import countDownBehaviors from './countdown';
Component({
  externalClasses: [
    'l-class',
    'l-class-time',
  ],
  behaviors:[countDownBehaviors],
  properties: {
    typeTag: {
      type:Boolean,
      value: true
    },
    prefix: {
      type: String,
      value: '剩余时间：'
    },
    doneText:{
      type:String,
      value:'授权超时，请重新下单'
    }
  },
  methods: {

  }
});
