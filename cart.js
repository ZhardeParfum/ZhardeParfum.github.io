(function(){
"use strict";
var CFG={"ship": null, "orders": "https://script.google.com/macros/s/AKfycbykuUSdX_7BTnXZTG7FChqt9n42rMIb3mA7xjdPf8LBJTltQVilfOYxzAUNYBm2KqJn/exec", "wa": "601137267911", "sizes": [{"v": "10ml", "p": 12}, {"v": "30ml", "p": 35}, {"v": "100ml", "p": 100}], "items": {"ember": {"name": "Ember", "color": "#e0662a"}, "solace": {"name": "Solace", "color": "#9a9488"}, "azure": {"name": "Azure", "color": "#4a8fd0"}, "sovereign": {"name": "Sovereign", "color": "#b8743a"}, "bombshell": {"name": "Bombshell", "color": "#c2457d"}, "dulcette": {"name": "Dulcette", "color": "#c96b88"}, "elysian": {"name": "Elysian", "color": "#b08a4a"}, "florea": {"name": "Florea", "color": "#d0405a"}, "baccarat": {"name": "Baccarat", "color": "#8e2b30"}, "discovery": {"name": "Discovery Set", "color": "#b8862b", "set": 1, "price": 89, "note": "9 scents × 10ml"}}};
var KEY="zharde_cart_v1",items=CFG.items,sizes=CFG.sizes;
var TRASH='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 10v6M14 10v6"/></svg>';
function price(v){for(var i=0;i<sizes.length;i++)if(sizes[i].v===v)return sizes[i].p;return 0}
function lineP(l){var t=items[l.slug];return t&&t.set?t.price:price(l.size)}
function calc(sel){var sub=0,bq=0,n30=0,n100=0;sel.forEach(function(l){var t=lineP(l)*l.units;sub+=t;if(!items[l.slug].set&&l.size!=="10ml"){bq+=l.units;if(l.size==="100ml")n100+=l.units;else n30+=l.units}});var T={"3,0":10,"0,2":10,"0,3":25,"1,1":10},d=T[n30+","+n100]||0;return{sub:sub,d:d,tot:sub-d,bq:bq,n30:n30,n100:n100}}
function valid(l){return l&&items[l.slug]&&lineP(l)>0&&l.units>=1&&l.units<=99}
function load(){try{var a=JSON.parse(localStorage.getItem(KEY));return Array.isArray(a)?a.filter(valid):[]}catch(e){return[]}}
var cart=load();
function save(){try{localStorage.setItem(KEY,JSON.stringify(cart))}catch(e){}}
function clamp(n){n=parseInt(n,10);if(isNaN(n)||n<1)n=1;return n>99?99:n}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
var ov,dr,list,emptyEl,foot,allBox,sumEl,go,toast,lastFocus,tt;
function build(){
 ov=document.createElement("div");ov.className="zov";ov.hidden=true;
 dr=document.createElement("aside");dr.className="zcart";dr.hidden=true;
 dr.setAttribute("role","dialog");dr.setAttribute("aria-modal","true");dr.setAttribute("aria-label","Shopping cart");
 dr.innerHTML='<div class="zh"><h2>Your cart</h2><button type="button" class="zx" aria-label="Close cart">&times;</button></div>'+
 '<p class="ze">Your cart is empty.<br><a href="shop.html">Browse the shop</a></p><ul class="zl"></ul>'+
 '<div class="zf"><p class="zd" hidden></p><p class="zhint">Next: choose COD or Door Delivery.</p><label class="za"><input type="checkbox" class="zall"> Select all</label><p class="zs">Total <strong>RM0</strong></p><button type="button" class="btn zgo">Check out</button></div>';
 toast=document.createElement("div");toast.className="ztoast";toast.hidden=true;toast.setAttribute("role","status");
 document.body.appendChild(ov);document.body.appendChild(dr);document.body.appendChild(toast);
 list=dr.querySelector(".zl");emptyEl=dr.querySelector(".ze");foot=dr.querySelector(".zf");
 allBox=dr.querySelector(".zall");sumEl=dr.querySelector(".zs strong");go=dr.querySelector(".zgo");
 ov.addEventListener("click",close);dr.querySelector(".zx").addEventListener("click",close);
 list.addEventListener("click",function(e){var li=e.target.closest(".ci");if(!li)return;var i=+li.dataset.i,l=cart[i];
  if(e.target.closest(".cm"))l.units=clamp(l.units-1);
  else if(e.target.closest(".cp"))l.units=clamp(l.units+1);
  else if(e.target.closest(".del"))cart.splice(i,1);
  else return;
  save();render();});
 list.addEventListener("change",function(e){var li=e.target.closest(".ci");if(!li)return;var i=+li.dataset.i,l=cart[i],t=e.target;
  if(t.classList.contains("cks"))l.sel=t.checked;
  else if(t.classList.contains("cq"))l.units=clamp(t.value);
  else if(t.classList.contains("csz"))changeSize(i,t.value);
  else return;
  save();render();});
 allBox.addEventListener("change",function(){var v=allBox.checked;cart.forEach(function(l){l.sel=v});save();render();});
 go.addEventListener("click",checkout);

 var wa=document.createElement("a");wa.className="zwa";wa.target="_blank";wa.rel="noopener";wa.setAttribute("aria-label","Chat with ZHARDÉ on WhatsApp");wa.href="https://wa.me/"+CFG.wa+"?text="+encodeURIComponent("Hello ZHARDÉ, saya ada pertanyaan.");wa.innerHTML='<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.2 14.1c-.2.6-1.2 1.2-1.7 1.2-.4.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.6-2.7-1.2-4.4-3.9-4.5-4.1-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.1.1.3 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.5.2.3.7 1.2 1.5 1.9 1 .9 1.9 1.2 2.2 1.3.3.1.4.1.5-.1l.7-.9c.2-.2.4-.2.6-.1l1.9.9c.3.1.4.2.5.3.1.2.1.6-.1 1.2z"/></svg>';
 document.body.appendChild(wa);
 document.addEventListener("keydown",function(e){if(dr.hidden)return;
  if(e.key==="Escape"){close();return}
  if(e.key==="Tab"){var f=[].filter.call(dr.querySelectorAll("button:not([disabled]),input:not([disabled]),select,a[href]"),function(x){return x.offsetParent!==null});
   if(!f.length)return;var a=f[0],z=f[f.length-1];
   if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus()}
   else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}}});
}
function changeSize(i,v){var l=cart[i],j=-1;
 cart.forEach(function(o,k){if(k!==i&&o.slug===l.slug&&o.size===v)j=k});
 if(j>=0){cart[j].units=clamp(cart[j].units+l.units);cart[j].sel=cart[j].sel||l.sel;cart.splice(i,1)}
 else l.size=v;}
function render(){
 var n=0;cart.forEach(function(l){n+=l.units});
 document.querySelectorAll(".cb").forEach(function(b){b.textContent=n;b.hidden=!n});
 if(!dr)return;
 var a=document.activeElement,keep=null;
 if(a&&a.closest&&a.closest(".ci")&&dr.contains(a))keep=[a.closest(".ci").dataset.i,a.className.split(" ")[0]];
 list.innerHTML=cart.map(function(l,i){var it=items[l.slug];
  var opts=sizes.map(function(s){return'<option value="'+s.v+'"'+(s.v===l.size?" selected":"")+'>'+s.v+" · RM"+s.p+"</option>"}).join("");
  return'<li class="ci" data-i="'+i+'"><input type="checkbox" class="cks" aria-label="Select '+esc(it.name)+' for checkout"'+(l.sel?" checked":"")+'>'+
  '<div class="th" style="background:'+it.color+'"><img src="images/'+l.slug+'.jpg" alt="" onerror="this.remove()"></div>'+
  '<div class="inf"><p class="nm">Zharde '+esc(it.name)+'</p>'+(it.set?'<p class="cset">'+it.note+'</p>':'<select class="csz" aria-label="Size for '+esc(it.name)+'">'+opts+'</select>')+
  '<div class="qr"><div class="qty"><button type="button" class="cm" aria-label="Decrease units"'+(l.units<=1?" disabled":"")+'>&minus;</button>'+
  '<input class="cq" type="number" min="1" max="99" value="'+l.units+'" aria-label="Units"><button type="button" class="cp" aria-label="Increase units"'+(l.units>=99?" disabled":"")+'>+</button></div>'+
  '<span class="lp">RM'+(lineP(l)*l.units)+'</span></div></div>'+
  '<button type="button" class="del" aria-label="Remove '+esc(it.name)+' from cart">'+TRASH+'</button></li>'}).join("");
 var empty=!cart.length,sel=cart.filter(function(l){return l.sel}),sum=0;
 var cc=calc(sel);sum=cc.tot;var zd=dr.querySelector('.zd');
 if(cc.d){zd.textContent='Buy '+cc.bq+' saving: −RM'+cc.d+' (subtotal RM'+cc.sub+')';zd.hidden=false}else if(cc.n30===1&&!cc.n100){zd.textContent='Add 2 more 30ml for 3 × 30ml at RM95, or 1 × 100ml for 30ml + 100ml at RM125.';zd.hidden=false}else if(cc.n30===2&&!cc.n100){zd.textContent='Add 1 more 30ml to get 3 × 30ml for RM95.';zd.hidden=false}else if(!cc.n30&&cc.n100===1){zd.textContent='Add 1 more 100ml for 2 × 100ml at RM190, or 1 × 30ml for 30ml + 100ml at RM125.';zd.hidden=false}else if(!cc.n30&&cc.n100===2){zd.textContent='Add 1 more 100ml to get 3 × 100ml for RM275.';zd.hidden=false}else zd.hidden=true;
 emptyEl.hidden=!empty;list.hidden=empty;foot.hidden=empty;
 allBox.checked=!empty&&sel.length===cart.length;allBox.indeterminate=sel.length>0&&sel.length<cart.length;
 sumEl.textContent="RM"+sum;go.disabled=!sel.length;go.textContent=sel.length?"Check out ("+sel.length+")":"Check out";
 if(keep){var el=list.querySelector('.ci[data-i="'+keep[0]+'"] .'+keep[1]);if(el&&!el.disabled)el.focus()}
}
var payEl=null;
function closePay(){if(payEl){payEl.remove();payEl=null;document.body.style.overflow=""}}
function esc2(s){return String(s).replace(/[&<>"]/g,function(x){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[x]})}
function payTotal(o){return o.k.tot+(o.method!=="cod"&&typeof CFG.ship==="number"?CFG.ship:0)}
function buildMsg(o,paid){var k=o.k,v=o.v,ship=typeof CFG.ship==="number",cod=o.method==="cod";
 var lines=o.its.map(function(x){return x.name+" – "+x.size+" – Qty "+x.qty+" – RM"+x.amount}).join("\n");
 if(cod)return "Hai ZHARDÉ, saya ingin membuat pesanan (COD).\nOrder No: "+o.no+"\nKaedah: COD (Shah Alam & kawasan berhampiran sahaja)\n\nItem:\n"+lines+"\n\nSubtotal: RM"+k.sub+(k.d?"\nBuy "+k.bq+" saving: -RM"+k.d:"")+(k.d?"\nJumlah selepas diskaun: RM"+k.tot:"");
 return (paid?"Hai ZHARDÉ, saya telah membuat pembayaran melalui DuitNow QR.":"Hai ZHARDÉ, saya ingin membuat pesanan.")+"\nOrder No: "+o.no+"\nKaedah: Door Delivery (Post)\nNama: "+v.n+"\nTelefon: "+v.p+"\nAlamat: "+v.a+", "+v.z+" "+v.c+", "+v.s+"\n\nItem:\n"+lines+
  "\n\nSubtotal: RM"+k.sub+(k.d?"\nBuy "+k.bq+" saving: -RM"+k.d:"")+"\nShipping: "+(ship?"RM"+CFG.ship:"akan disahkan semasa pengesahan pesanan")+
  "\n"+(ship?"Jumlah":"Total (belum termasuk penghantaran)")+": RM"+payTotal(o)+(v.t?"\nNota: "+v.t:"")+
  "\n\n"+(paid?"Bukti pembayaran saya lampirkan dalam chat ini.":"Mohon pengesahan pesanan dan kaedah pembayaran.")+" Terima kasih."}
function payload(o,paid,receipt){var v=o.v;return{orderNo:o.no,name:v.n,phone:v.p,address:v.a,city:v.c,state:v.s,postcode:v.z,note:v.t,items:o.its,subtotal:o.k.sub,discount:o.k.d,shipping:o.method==="cod"?"-":(typeof CFG.ship==="number"?CFG.ship:"TBC"),total:payTotal(o),payment:o.method==="cod"?"COD":(paid?"Customer says paid":"Pending"),method:o.method==="cod"?"COD":"Door Delivery (Post)",receipt:receipt||null}}
function stamp(o){return o.date||(o.date=new Date().toLocaleString("en-MY",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}))}
function statusText(o,paid){return o.method==="cod"?"Order ready · COD to be confirmed":(paid?"Payment claimed · awaiting verification":"Awaiting payment")}
function makeReceipt(o,paid){try{
 var S=1.5,W=520,P=28,k=o.k,v=o.v,cod=o.method==="cod",ship=typeof CFG.ship==="number",tot=payTotal(o),SERIF='"Cormorant Garamond",Georgia,serif',SANS='Jost,Arial,sans-serif',INK="#1a1209",MUTE="#6e5a5d",GOLD="#8f6a2e";
 function run(c,draw){var y=P;
  function T(t,x,yy,f,col,al){if(!draw)return;c.font=f;c.fillStyle=col;c.textAlign=al||"left";c.fillText(t,x,yy)}
  function wrap(t,f,mw){c.font=f;var w=String(t).split(" "),ln="",out=[];w.forEach(function(x){var q=ln?ln+" "+x:x;if(c.measureText(q).width>mw&&ln){out.push(ln);ln=x}else ln=q});if(ln)out.push(ln);return out}
  function rule(yy){if(!draw)return;c.strokeStyle="#cdbda5";c.lineWidth=1;c.beginPath();c.moveTo(P,yy);c.lineTo(W-P,yy);c.stroke()}
  y+=12;T("ZHARDÉ PARFUM",P,y,"500 13px "+SANS,GOLD);
  y+=38;T("Order Receipt",P,y,"500 36px "+SERIF,INK);
  y+=30;T("Order No  "+o.no,P,y,"500 16px "+SANS,INK);
  y+=22;T(stamp(o),P,y,"300 14px "+SANS,MUTE);
  y+=28;T("● "+statusText(o,paid),P,y,"500 14px "+SANS,cod||paid?"#1b6b3a":"#8a5a00");
  y+=18;rule(y);
  y+=24;T(cod?"DELIVERY":"DELIVER TO",P,y,"500 11px "+SANS,MUTE);
  var info=cod?["Cash on Delivery (COD)","Shah Alam & nearby areas only"]:[v.n+" · "+v.p].concat(wrap(v.a+", "+v.z+" "+v.c+", "+v.s,"400 15px "+SANS,W-2*P),v.t?wrap("Note: "+v.t,"italic 400 14px "+SANS,W-2*P):[]);
  info.forEach(function(t,n){y+=22;T(t,P,y,(n&&v.t&&t.indexOf("Note:")===0?"italic 400 14px ":"400 15px ")+SANS,INK)});
  y+=18;rule(y);
  o.its.forEach(function(x){y+=28;T(x.name,P,y,"500 16px "+SANS,INK);T("RM"+x.amount,W-P,y,"600 16px "+SANS,INK,"right");y+=19;T(x.size+" × "+x.qty,P,y,"300 13px "+SANS,MUTE);y+=10;rule(y)});
  y+=26;T("Subtotal",P,y,"400 15px "+SANS,INK);T("RM"+k.sub,W-P,y,"400 15px "+SANS,INK,"right");
  if(k.d){y+=24;T("Buy "+k.bq+" saving",P,y,"400 15px "+SANS,INK);T("−RM"+k.d,W-P,y,"400 15px "+SANS,INK,"right")}
  if(!cod){y+=24;T("Shipping",P,y,"400 15px "+SANS,INK);T(ship?"RM"+CFG.ship:"To be confirmed",W-P,y,"400 15px "+SANS,INK,"right")}
  y+=14;rule(y);
  y+=36;T(cod||ship?"Total":"Total (excl. shipping)",P,y,"500 24px "+SERIF,INK);T("RM"+tot,W-P,y,"500 28px "+SERIF,INK,"right");
  y+=30;T(cod?"Payment: to be arranged with ZHARDÉ on WhatsApp":"Payment: DuitNow QR · ZHARDE PARFUM SIGNATURE",P,y,"300 13px "+SANS,MUTE);
  return y+P}
 var m=document.createElement("canvas").getContext("2d"),H=run(m,false);
 var cv=document.createElement("canvas");cv.width=W*S;cv.height=H*S;var c=cv.getContext("2d");c.scale(S,S);c.fillStyle="#f8f3e8";c.fillRect(0,0,W,H);run(c,true);
 return{mime:"image/jpeg",data:cv.toDataURL("image/jpeg",.82).split(",")[1]}}catch(e){return null}}
function record(o,paid){if(!(CFG.orders&&window.fetch))return;stamp(o);
 try{fetch(CFG.orders,{method:"POST",mode:"no-cors",keepalive:true,headers:{"Content-Type":"text/plain"},body:JSON.stringify(payload(o,paid,null))}).catch(function(){})}catch(e){}
 var r=makeReceipt(o,paid);if(r)try{fetch(CFG.orders,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain"},body:JSON.stringify(payload(o,paid,r))}).catch(function(){})}catch(e){}}
function openWA(o,paid){var a=document.createElement("a");a.href="https://wa.me/"+CFG.wa+"?text="+encodeURIComponent(buildMsg(o,paid));a.target="_blank";a.rel="noopener";document.body.appendChild(a);a.click();a.remove()}
function sendWA(o,paid){record(o,paid);openWA(o,paid);showReceipt(o,paid)}
function who(o,label){var v=o.v;if(o.method==="cod")return '<div class="zpb1"><p class="zpl">Delivery</p><p>Cash on Delivery (COD)<br>Shah Alam &amp; nearby areas only</p></div>';return '<div class="zpb1"><p class="zpl">'+label+'</p><p>'+esc2(v.n)+" · "+esc2(v.p)+"<br>"+esc2(v.a)+", "+esc2(v.z)+" "+esc2(v.c)+", "+esc2(v.s)+(v.t?"<br><i>Note: "+esc2(v.t)+"</i>":"")+'</p></div>'}
function showReceipt(o,paid){if(!payEl)return;var k=o.k,ship=typeof CFG.ship==="number",tot=payTotal(o),cod=o.method==="cod";
 payEl.querySelector(".zpp").innerHTML='<div class="zph"><h2>Order Receipt</h2><button type="button" class="zpx" aria-label="Close">&times;</button></div>'+
 '<p class="zrb">ZHARDÉ PARFUM</p><p class="zpn">Order No <b>'+esc2(o.no)+'</b><br>'+esc2(stamp(o))+'</p>'+
 '<p class="zst2 '+(paid||cod?"zv":"zw")+'">'+statusText(o,paid)+'</p>'+who(o,"Customer")+
 '<ul class="zpi">'+o.its.map(function(x){return"<li><span>"+esc2(x.name)+"<small>"+esc2(x.size)+" × "+x.qty+"</small></span><b>RM"+x.amount+"</b></li>"}).join("")+'</ul>'+
 '<div class="zpt"><p><span>Subtotal</span><span>RM'+k.sub+'</span></p>'+(k.d?'<p><span>Buy '+k.bq+' saving</span><span>−RM'+k.d+'</span></p>':'')+(cod?'':'<p><span>Shipping</span><span>'+(ship?"RM"+CFG.ship:"To be confirmed")+'</span></p>')+'<p class="zpg"><span>'+(cod||ship?"Total":"Total (excl. shipping)")+'</span><span>RM'+tot+'</span></p></div>'+
 '<p class="zpf zpm">'+(cod?"Payment: to be arranged with ZHARDÉ on WhatsApp":"Payment method: DuitNow QR · Payee: ZHARDE PARFUM SIGNATURE")+'</p>'+
 '<p class="zpf">'+(cod?"Tap Send in WhatsApp to complete your order. ZHARDÉ will reply with the COD place and time.":"Tap Send in WhatsApp to complete your order, and attach your payment screenshot in the chat. Your order is confirmed after ZHARDÉ verifies your payment.")+'</p>'+
 '<div class="zno"><button type="button" class="zagain">Open WhatsApp</button><button type="button" class="zlater zdone">Close</button></div>';
 payEl.querySelector(".zpx").addEventListener("click",closePay);
 payEl.querySelector(".zdone").addEventListener("click",closePay);
 payEl.querySelector(".zagain").addEventListener("click",function(){openWA(o,paid)});
 payEl.scrollTop=0;payEl.querySelector(".zpx").focus()}
function showPay(o){var k=o.k,ship=typeof CFG.ship==="number",tot=payTotal(o);
 openModal('<div class="zph"><h2>Order Summary</h2><button type="button" class="zpx" aria-label="Close">&times;</button></div>'+
 '<p class="zpn">Order No <b>'+esc2(o.no)+'</b></p>'+who(o,"Deliver to")+
 '<ul class="zpi">'+o.its.map(function(x){return"<li><span>"+esc2(x.name)+"<small>"+esc2(x.size)+" × "+x.qty+"</small></span><b>RM"+x.amount+"</b></li>"}).join("")+'</ul>'+
 '<div class="zpt"><p><span>Subtotal</span><span>RM'+k.sub+'</span></p>'+(k.d?'<p><span>Buy '+k.bq+' saving</span><span>−RM'+k.d+'</span></p>':'')+'<p><span>Shipping</span><span>'+(ship?"RM"+CFG.ship:"Confirmed on WhatsApp")+'</span></p><p class="zpg"><span>'+(ship?"Total to pay":"Total (excl. shipping)")+'</span><span>RM'+tot+'</span></p></div>'+
 '<h3>Pay with DuitNow QR</h3><ol class="zps"><li>Scan the QR with your banking or e-wallet app.</li><li>Pay <b>RM'+tot+'</b> and use <b>'+esc2(o.no)+'</b> as the reference.</li><li>Tap the green button to send your order on WhatsApp.</li><li>Attach your payment screenshot in the WhatsApp chat.</li></ol>'+
 '<img class="zqr" src="images/duitnow-qr.png" alt="DuitNow QR for ZHARDE PARFUM SIGNATURE" width="320">'+
 '<a class="zdl" href="images/duitnow-qr.png" download="ZHARDE-DuitNow-QR.png">Save QR image</a>'+
 '<button type="button" class="zpaid">I have paid · send order on WhatsApp</button><button type="button" class="zlater">Pay later · send order on WhatsApp</button>'+
 (ship?'':'<p class="zpf">Shipping is confirmed by ZHARDÉ on WhatsApp.</p>'),"Order summary and payment");
 payEl.querySelector(".zpaid").addEventListener("click",function(){sendWA(o,true)});
 payEl.querySelector(".zlater").addEventListener("click",function(){sendWA(o,false)});
 payEl.querySelector(".zpx").focus()}
document.addEventListener("keydown",function(e){if(e.key==="Escape")closePay()});
function newNo(){var d=new Date(),pad=function(x){return (x<10?"0":"")+x};return "ZH"+String(d.getFullYear()).slice(2)+pad(d.getMonth()+1)+pad(d.getDate())+"-"+Math.random().toString(36).slice(2,6).toUpperCase()}
function mkOrder(lines){return{no:newNo(),k:calc(lines),method:"",v:{n:"",p:"",a:"",c:"",s:"",z:"",t:""},its:lines.map(function(l){var it=items[l.slug];return{name:"Zharde "+it.name,size:it.set?it.note:l.size,qty:l.units,amount:lineP(l)*l.units}})}}
function openModal(html,label){closePay();payEl=document.createElement("div");payEl.className="zpay";payEl.setAttribute("role","dialog");payEl.setAttribute("aria-modal","true");payEl.setAttribute("aria-label",label);payEl.innerHTML='<div class="zpp">'+html+'</div>';document.body.appendChild(payEl);document.body.style.overflow="hidden";payEl.addEventListener("click",function(e){if(e.target===payEl)closePay()});var x=payEl.querySelector(".zpx");if(x)x.addEventListener("click",closePay);return payEl}
function sumLine(o){return o.its.length+" item"+(o.its.length>1?"s":"")+" · RM"+o.k.tot}
function showChoose(o){openModal('<div class="zph"><h2>How would you like to receive it?</h2><button type="button" class="zpx" aria-label="Close">&times;</button></div><p class="zpn">Your order: '+sumLine(o)+'</p>'+
 '<button type="button" class="zopt zcod"><b>Cash on Delivery (COD)</b><span>Pay on delivery or in advance, as you prefer.</span><em>Shah Alam and nearby areas only</em><small>Goes straight to WhatsApp. We confirm the place and time with you.</small></button>'+
 '<button type="button" class="zopt zpostb"><b>Door Delivery</b><span>Delivered to your address by post.</span><small>Fill in your details first, then pay by DuitNow QR. Shipping is confirmed on WhatsApp.</small></button>'+
 '<p class="zpf">COD covers Shah Alam and nearby areas only. For other areas, please choose Door Delivery.</p>','Choose delivery method');
 payEl.querySelector(".zcod").addEventListener("click",function(){o.method="cod";record(o,false);openWA(o,false);showReceipt(o,false)});
 payEl.querySelector(".zpostb").addEventListener("click",function(){o.method="post";showDetails(o)});
 payEl.querySelector(".zcod").focus()}
function showDetails(o){var cu={};try{cu=JSON.parse(localStorage.getItem("zharde_cust"))||{}}catch(e){}
 var f=function(c,t,ph,val,ac,extra){return '<input class="'+c+'" type="'+t+'" placeholder="'+ph+'" aria-label="'+ph+'" value="'+esc2(val||"")+'" autocomplete="'+ac+'"'+(extra||"")+'>'};
 openModal('<div class="zph"><h2>Delivery Details</h2><button type="button" class="zpx" aria-label="Close">&times;</button></div><p class="zpn">Door Delivery · '+sumLine(o)+'</p><div class="zc zcm">'+f("zn","text","Full name",cu.n,"name")+f("zp","tel","Phone number",cu.p,"tel")+
  '<textarea class="zad" rows="2" placeholder="Address (street, unit)" aria-label="Address" autocomplete="street-address">'+esc2(cu.a||"")+'</textarea>'+f("zct","text","City",cu.c,"address-level2")+'<div class="zr2">'+f("zst","text","State",cu.s,"address-level1")+f("zpc","text","Postcode",cu.z,"postal-code",' inputmode="numeric" maxlength="5"')+'</div><textarea class="znt" rows="2" placeholder="Order note (optional)" aria-label="Order note"></textarea><p class="zerr" role="alert" hidden></p></div>'+
  '<button type="button" class="zpaid zcont">Continue to payment</button><button type="button" class="zlater zbk">Back</button>','Delivery details');
 var q=function(s){return payEl.querySelector(s)};
 q(".zbk").addEventListener("click",function(){showChoose(o)});
 q(".zcont").addEventListener("click",function(){var v={n:q(".zn").value.trim(),p:q(".zp").value.trim(),a:q(".zad").value.trim(),c:q(".zct").value.trim(),s:q(".zst").value.trim(),z:q(".zpc").value.trim(),t:q(".znt").value.trim()},er=q(".zerr");
  var bad=!v.n?".zn":v.p.replace(/\D/g,"").length<9?".zp":!v.a?".zad":!v.c?".zct":!v.s?".zst":!/^\d{5}$/.test(v.z)?".zpc":"";
  if(bad){er.textContent="Please complete your name, phone, address, city, state and a 5-digit postcode.";er.hidden=false;q(bad).focus();return}
  try{localStorage.setItem("zharde_cust",JSON.stringify({n:v.n,p:v.p,a:v.a,c:v.c,s:v.s,z:v.z}))}catch(e){}
  o.v=v;showPay(o)});
 q(".zn").focus()}
function checkout(){var sel=cart.filter(function(l){return l.sel});if(!sel.length)return;showChoose(mkOrder(sel))}
function buyNow(slug,size,units){var l={slug:slug,size:size,units:units,sel:true};if(!items[slug]||!(lineP(l)>0))return;showChoose(mkOrder([l]))}
document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest("a.buy");if(!b)return;var cd=b.closest(".card");if(!cd||!cd.id)return;var r=cd.querySelector("input[type=radio]:checked"),qn=cd.querySelector(".q");if(!r)return;e.preventDefault();buyNow(cd.id,r.value,Math.max(1,Math.min(99,parseInt(qn&&qn.value)||1)))});
function open(){lastFocus=document.activeElement;toast.hidden=true;ov.hidden=false;dr.hidden=false;document.body.style.overflow="hidden";dr.querySelector(".zx").focus()}
function close(){ov.hidden=true;dr.hidden=true;document.body.style.overflow="";if(lastFocus&&lastFocus.focus)lastFocus.focus()}
function say(t){toast.textContent=t;toast.hidden=false;clearTimeout(tt);tt=setTimeout(function(){toast.hidden=true},1800)}
function add(slug,size,units){
 if(!items[slug]||(items[slug].set?items[slug].price:price(size))<=0)return;units=clamp(units);
 var f=null;cart.forEach(function(l){if(l.slug===slug&&l.size===size)f=l});
 if(f){f.units=clamp(f.units+units);f.sel=true}else cart.push({slug:slug,size:size,units:units,sel:true});
 save();render();say("Added to cart: Zharde "+items[slug].name+" · "+size+" × "+units);}
window.ZCart={add:add,open:open};
build();render();
document.querySelectorAll(".cartbtn").forEach(function(b){b.addEventListener("click",open)});
window.addEventListener("storage",function(e){if(e.key===KEY){cart=load();render()}});
})();
