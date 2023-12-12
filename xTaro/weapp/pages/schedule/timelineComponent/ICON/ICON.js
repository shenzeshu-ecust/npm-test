// pages/schedule/ICON.js
Component({
  /**
   * Component properties
   */
  properties: {
    className: String,
    color: String,
    size: Number
  },

  /**
   * Component initial data
   */
  data: {
    iconOptions: {}
  },

  /**
   * Component methods
   */
  methods: {
    initOption:function(){
      const { className, color, size } = this.properties || {};
      const inputClass = className ? `min_font_schedule-${className}` : '';
      const classes = `icon_font ${inputClass}`;
      this.setData({
        iconOptions:{
          classes,
          color,
          size
        }
      });
    }
  },

  ready(){
    this.initOption();
  }
})
