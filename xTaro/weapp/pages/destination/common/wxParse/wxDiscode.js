function strcharacterDiscode(str){
    // 加入常用解析
    str = str.replace(/&nbsp;/g, ' ');
    str = str.replace(/&quot;/g, '"');
    str = str.replace(/&amp;/g, '&');

    return str;
}

function strMoreDiscode(str){
    str = str.replace(/\r?\n/g,"");
    return str;
}

function strDiscode(str){
    str = strcharacterDiscode(str);
    str = strMoreDiscode(str);
    return str;
}
function urlToHttpUrl(url,rep){

    var patt1 = new RegExp("^//");
    var result = patt1.test(url);
    if(result){
        url = rep+":"+url;
    }
    return  url;
}

module.exports = {
    strDiscode:strDiscode,
    urlToHttpUrl:urlToHttpUrl
}
