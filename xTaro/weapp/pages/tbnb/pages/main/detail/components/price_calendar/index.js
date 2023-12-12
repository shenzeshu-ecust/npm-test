import { TComponent } from '../../../../../business/tjbase/index';
TComponent({
  properties: {
    selectBegin: {
      type: String,
      value: ''
    },
    selectEnd: {
      type: String,
      value: ''
    },
    sWeekText: {
      type: String,
      value: ''
    },
    eWeekText: {
      type: String,
      value: ''
    },
    interval: {
      type: Number,
      value: 0
    }
  },
  data: {},
  lifetimes: {},
  pageLifetimes: {},
  methods: {
    handleOpenCalendarPage: function () {
      this.triggerEvent('changecalendar');
    }
  }
});