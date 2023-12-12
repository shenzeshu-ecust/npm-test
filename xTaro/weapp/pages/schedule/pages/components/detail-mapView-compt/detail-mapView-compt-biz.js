export const isValidLocation = function(location) {
  return location && (location.title || location.description);
}

export const isValidCoordinate = function (latitude, longitude) {
  return isNumber(latitude) &&
    isNumber(longitude) &&
    latitude != 0 &&
    longitude != 0 &&
    latitude != -1 &&
    longitude != -1;
}

export const getBtnList = function (btnList){
  console.log(btnList)
  if (!checkBtnList(btnList)){
    return null;
  }

  let btns = []
  btnList.map(item => {
    btns.push({
      ...item,
      tab: item.type === 'phone' ? 'callPhone' : 'navToUrl'
    })
  })
  return btns;
}

function checkBtnList(btnList){

  if(!btnList){
    return false;
  }
  
  for (let i = 0; i < btnList.length; i++){
    let item = btnList[i]
    if (!item ||
      !item.icon ||
      !item.title ||
      !item.type ||
      !item.content ||
      (item.type !== 'phone' && item.type !== 'url')) {
      return false;
    }
  }

  return true;
}

function isNumber(value) {
  return typeof value === "number";
}