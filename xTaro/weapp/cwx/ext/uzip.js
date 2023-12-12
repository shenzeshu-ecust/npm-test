/**
 * @file 压缩算法文件
 */
;var UZip=function(){for(var r=16384,n=3,e=127+n,t=16383,o="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_",f=[],i=0;i<64;i++)f[o.charCodeAt(i)]=i;return{compress:function(f,i){function a(r,n){return Math.min(r,n)}function u(){for(var r=0,e=w;e<w+n;e++)r*=16777619,r^=s[e];return r&t
}function c(r){var n,t,o=a(r+e,w);for(n=r,t=w;n<o&&t<s.length&&s[n]==s[t];n++,t++);return n-r}function h(){for(var r=U;r<w;r+=127){var n=a(127,w-r);v(255&-n);for(var e=r;e<w&&e<r+n;e++)v(s[e])}}function v(r){var n=A<<6-y;p(63&(n|=(A=255&r)>>(y+=2))),y>=6&&p(63&(n=A>>(y-=6)))}function l(){
if(2==y)p(r=A<<4&63);else if(4==y){var r=A<<2&63;p(r)}return b.join("")}function p(r){b.push(o.charAt(r))}i=i||{};var s=[];f=unescape(encodeURIComponent(f));for(var d=0;d<f.length;d++)s.push(f.charCodeAt(d));var g=[],m=[],U=-1,C=0,w=0,A=0,y=0,b=[];"binary"==i.mode&&(v=function(r){b.push(r)},
l=function(){return new Uint8Array(b).buffer}),v(19);for(var I=0;I<s.length&&w<s.length;I+=r)I>0&&(m=m.slice(r)),function(){for(var t=a(I+2*r,s.length),o=a(t,s.length-n+1);w<t;w++){var f=0,i=0;if(w<o){var l=u();if(w>=C)for(var p=g[l]-1;f!=e&&p>=0&&p>=w-r;){var d=c(p);d>=n&&d>f&&(i=w-p-(f=d)),
p=m[p-I]}m[w-I]=g[l]-1,g[l]=w+1}if(f>=n){for(C=w+f,-1!=U&&(h(),U=-1),v(f-n);i>127;)v(255&(127&i|128)),i>>=7;v(i)}else w>=C&&-1==U&&(U=w)}}();return-1!=U&&h(),l()},decompress:function(r,n){function e(){if(i>=r.length)return-1;var n=a<<8-u;if((a=t(i++))<0)return i=r.length,-1
;if((u-=2)>=0)n|=a>>u;else{if(n|=a<<-u,i>=r.length||(a=t(i++))<0)throw"Invalid input.";n|=a>>(u+=6)}return 255&n}function t(n){return f[r.charCodeAt(n)]}var o,i=0,a=0,u=0,c=[];"binary"==(n=n||{}).mode&&(r=new Uint8Array(r),e=function(){return i>=r.length?-1:r[i++]});var h=e()
;if(h>>4>1)throw"Unsupported version.";for(var v=15&h;-1!=(o=e());)if(o<=127){for(var l=o+v,p=0,s=0;;s++){if(-1==(o=e()))throw"Unexpected end.";if(p|=(127&o)<<7*s,o<=127)break}c.push.apply(c,c.slice(c.length-p-l,c.length-p))}else for(var l=256-o,s=0;s<l;s++){if(-1==(o=e()))throw"Unexpected end."
;c.push(String.fromCharCode(255&o))}return decodeURIComponent(escape(c.join("")))}}}();

export default UZip;