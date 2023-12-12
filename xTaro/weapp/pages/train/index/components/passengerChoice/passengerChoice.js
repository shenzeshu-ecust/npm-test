Component({
  properties: {
    passengerInfo: {
      type: Object,
      value: {},
    },
  },
  data: {
    adultData: {},
    childData: {},
    oldData: {},
    // 从childData的list中获取选中项的年龄
    selectedAge: 10,
    // showselectedAge: 10,
    showChildren: false,
    tips: [],
    animationData: {},
    passengerChoiceVisible: false,
    numSelectorIsDisabled: false,
    chooseChildNum: null,
  },
  observers: {
    "passengerInfo": function(passengerInfo) {
      const {adultData, childData, oldData, tips} = passengerInfo
      this.setData({
        adultData, childData, oldData, tips,
      })
      this.numSelectorStatus()
    },
  },
  methods: {
    closePassengerChoice() {
      this.triggerEvent('onClosePassengerChoice')
    },
    onClickConfirm() {
      this.triggerEvent('onConfirmChoosePassenger',
        {
          passengerInfo: {
            ...this.properties.passengerInfo,
            adultData: this.data.adultData,
            childData: this.data.childData,
            oldData: this.data.oldData,
          },
        })
      this.closePassengerChoice()
    },
    subtractNumber: function(e) {
      const tag = e.target.dataset.tag
      if (tag === 'adult') {
        this.setData({
          adultData: {
            ...this.data.adultData,
            num: this.data.adultData.num - 1,
          },
        })
      } else if (tag === 'child') {
        const {list, num} = this.data.childData
        this.setData({
          childData: {
            ...this.data.childData,
            num: num - 1,
            list: list.slice(0, list.length - 1),
          },
        })
      } else {
        this.setData({
          oldData: {
            ...this.data.oldData,
            num: this.data.oldData.num - 1,
          },
        })
      }
      this.numSelectorStatus()
    },
    addNumber: function(e) {
      const tag = e.target.dataset.tag
      if (tag === 'adult') {
        this.setData({
          adultData: {
            ...this.data.adultData,
            num: this.data.adultData.num + 1,
          },
        })
      } else if (tag === 'child') {
        const {list, num} = this.data.childData
        list.push(16)
        this.setData({
          childData: {
            ...this.data.childData,
            num: num + 1,
            list,
          },
        })
      } else {
        this.setData({
          oldData: {
            ...this.data.oldData,
            num: this.data.oldData.num + 1,
          },
        })
      }
      this.numSelectorStatus()
    },
    openChildrenAgeSelector(e) {
      const index = e.currentTarget.dataset.index
      this.currentChildrenIndex = index
      this.setData({
          chooseChildNum: this.data.childData.list[index],
          showChildren: true
      });
    },
    closeChildrenAgeSelector() {
      this.setData({
        showChildren: false,
      })
    },
    onAgeChange(e) {
      // debugger
      const ageList = this.data.childData.list
      ageList[this.currentChildrenIndex] = e.detail.selectedAge
      this.setData({
        'childData.list': [...ageList],
      })
      this.closeChildrenAgeSelector()
    },
    numSelectorStatus() {
      let sum = this.data.adultData?.num + this.data.childData?.num + this.data.oldData?.num
      this.setData({
        numAddSelectorIsDisabled: sum >= this.properties.passengerInfo?.maxPassenagerNum,
        numSubSelectorIsDisabled: sum <= 1,
      })
    },
  },

})
