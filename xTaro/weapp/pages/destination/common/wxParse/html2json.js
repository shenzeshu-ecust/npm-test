/**
 * author: Di (微信小程序开发工程师)
 * organization: WeAppDev(微信小程序开发论坛)(http://weappdev.com)
 *               垂直微信小程序开发交流社区
 *
 * github地址: https://github.com/icindy/wxParse
 *
 * for: 微信小程序富文本解析
 * detail : http://weappdev.com/t/wxparse-alpha0-1-html-markdown/184
 */

var __placeImgeUrlHttps = "https";
var __emojisReg = '';
var __emojisBaseSrc = '';
var __emojis = {};
var wxDiscode = require('wxDiscode.js');
var HTMLParser = require('htmlparser.js');
// Empty Elements - HTML 5
var empty = makeMap("area,base,basefont,br,col,frame,hr,img,input,link,meta,param,embed,command,keygen,source,track,wbr");
// Block Elements - HTML 5
var block = makeMap("br,a,code,address,article,applet,aside,audio,blockquote,button,canvas,center,dd,del,dir,div,dl,dt,fieldset,figcaption,figure,footer,form,frameset,h1,h2,h3,h4,h5,h6,header,hgroup,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,output,p,pre,section,script,table,tbody,td,tfoot,th,thead,tr,ul,video");

// Inline Elements - HTML 5
var inline = makeMap("abbr,acronym,applet,b,basefont,bdo,big,button,cite,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strike,strong,sub,sup,textarea,tt,u,var");

// Elements that you can, intentionally, leave open
// (and which close themselves)
var closeSelf = makeMap("colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr");

// Attributes that have their values filled in disabled="disabled"
var fillAttrs = makeMap("checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected");

// Special Elements (can contain anything)
var special = makeMap("wxxxcode-style,script,style,view,scroll-view,block");
function makeMap(str) {
    var obj = {}, items = str.split(",");
    for (var i = 0; i < items.length; i++)
        obj[items[i]] = true;
    return obj;
}

function q(v) {
    return '"' + v + '"';
}

function html2json(html, bindName, withoutLinkInspect, firstRenderCount) {
    //处理字符串
    html = wxDiscode.strDiscode(html);
    //生成node节点
    var bufArray = [];
    var results = {
        node: bindName,
        nodes: [],
        imageUrls:[]
    };
    HTMLParser(html, {
        start: function (tag, attrs, unary) {
            //debug(tag, attrs, unary);
            // node for this element
            var node = {
                node: 'element',
                tag: tag,
            };

            if (block[tag]) {
                node.tagType = "block";
            } else if (inline[tag]) {
                node.tagType = "inline";
            } else if (closeSelf[tag]) {
                node.tagType = "closeSelf";
            }

            if (attrs.length !== 0) {
                node.attr = attrs.reduce(function (pre, attr) {
                    var name = attr.name;
                    var value = attr.value;
                    if (name == 'class') {
                        //console.dir(value);
                        //  value = value.join("")
                        node.classStr = value;
                    }
                    // has multi attibutes
                    // make it array of attribute
                    if (name == 'style') {
                        //console.dir(value);
                        //  value = value.join("")
                        node.styleStr = value;
                    }
                    if (value.match(/ /)) {
                        value = value.split(' ');
                    }


                    // if attr already exists
                    // merge it
                    if (pre[name]) {
                        if (Array.isArray(pre[name])) {
                            // already array, push to last
                            pre[name].push(value);
                        } else {
                            // single value, make it array
                            pre[name] = [pre[name], value];
                        }
                    } else {
                        // not exist, put it
                        pre[name] = value;
                    }

                    return pre;
                }, {});
            }

            //对img添加额外数据
            if (node.tag === 'img') {
                node.imgIndex = results.imageUrls.length;
                var imgUrl = node.attr.src;
                imgUrl = wxDiscode.urlToHttpUrl(imgUrl, __placeImgeUrlHttps);
                node.attr.src = imgUrl;
                node.from = bindName;
                results.imageUrls.push(imgUrl);
            }

            if (node.tag === 'a' && !withoutLinkInspect) {
              var src = node.attr && node.attr.href;
              if(src && (/\/sight\/\w+\/(\d+)\.html/i.test(src) || /\/place\/\w*(\d+)\.html/i.test(src))) {
                node.classStr = node.classStr || '';
                node.classStr += ' inset-link-supported';
              }
            }

            if (unary) {
                if(!checkNodeUseful(node)) return;

                // if this tag dosen't have end tag
                // like <img src="hoge.png"/>
                // add to parents
                var parent = bufArray[0] || results;
                if (parent.nodes === undefined) {
                    parent.nodes = [];
                }
                parent.nodes.push(node);
            } else {
                bufArray.unshift(node);
            }
        },
        end: function (tag) {
            //debug(tag);
            // merge into parent tag
            var node = bufArray.shift();
            if (node.tag !== tag) console.error('invalid state: mismatch end tag');

            if(!checkNodeUseful(node)) return;

            if (bufArray.length === 0) {
                results.nodes.push(node);
                if(firstRenderCount && results.nodes.length > firstRenderCount) {
                  firstRenderCount = 0; // 只回调一次
                  return true;
                }
            } else {
                var parent = bufArray[0];
                if (parent.nodes === undefined) {
                    parent.nodes = [];
                }
                parent.nodes.push(node);
            }
        },
        chars: function (text) {
            //debug(text);
          if(text) {
            text = text.replace('&lt;', '<').replace('&gt;', '>');
          }
            var node = {
                node: 'text',
                text: text,
            };

            if (bufArray.length === 0) {
                results.nodes.push(node);
            } else {
                var parent = bufArray[0];
                if (parent.nodes === undefined) {
                    parent.nodes = [];
                }
                parent.nodes.push(node);
            }
        },
        comment: function (text) {
            //debug(text);
            var node = {
                node: 'comment',
                text: text,
            };
            var parent = bufArray[0];
            if (parent.nodes === undefined) {
                parent.nodes = [];
            }
            parent.nodes.push(node);
        },
    });
    return results;
};

/**
 * 检查节点的有效性, 筛掉无效的节点
 * 用于富文本渲染优化(by xusc)
 */
function checkNodeUseful(node) {
  // 筛掉隐藏的标签
  if(node.attr && node.attr.style && /display:\s*none/i.test(node.attr.style)) {
    return false;
  }

  /*if(node.tag === 'br') { // 目前看来br标签的数量并不多, 且br有其一定的作用, 故暂不筛除
    return false;
  }*/

  // 筛掉不包括任何内容和图片的空标签, 筛选范围: p, strong, a
  if(node.tag === 'p' || node.tag === 'strong' || node.tag === 'a') {
    if(!node.nodes || !node.nodes.length) {
      return false;
    }
  }
  return true;
}

module.exports = {
    html2json: html2json,
};

