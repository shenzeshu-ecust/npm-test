const checkIsFromTask = (context) => {
  const eventChannel = context.getOpenerEventChannel()
  eventChannel.on && eventChannel.on('taskpage', function(data) {
      if(data.from === 'tasklist') {
          wx.removeStorage({
            key: 'wxpopupTimeCount'
          })
      }
  })
}

export {
  checkIsFromTask
}