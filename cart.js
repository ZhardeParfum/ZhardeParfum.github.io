(function(){
"use strict";
var CFG={"orders": "", "wa": "601137267911", "sizes": [{"v": "10ml", "p": 12}, {"v": "30ml", "p": 35}, {"v": "100ml", "p": 100}], "items": {"ember": {"name": "Ember", "color": "#e0662a"}, "solace": {"name": "Solace", "color": "#9a9488"}, "azure": {"name": "Azure", "color": "#4a8fd0"}, "sovereign": {"name": "Sovereign", "color": "#b8743a"}, "bombshell": {"name": "Bombshell", "color": "#c2457d"}, "dulcette": {"name": "Dulcette", "color": "#c96b88"}, "elysian": {"name": "Elysian", "color": "#b08a4a"}, "florea": {"name": "Florea", "color": "#d0405a"}, "baccarat": {"name": "Baccarat", "color": "#8e2b30"}, "discovery": {"name": "Discovery Set", "color": "#b8862b", "set": 1, "price": 89, "note": "9 scents × 10ml"}}};
var KEY="zharde_cart_v1",items=CFG.items,sizes=CFG.sizes;
var TRASH='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 10v6M14 10v6"/></svg>';
function price(v){for(var i=0;i<sizes.length;i++)if(sizes[i].v===v)return sizes[i].p;return 0}
function lineP(l){var t=items[l.slug];return t&&t.set?t.price:price(l.size)}
function calc(sel){var sub=0,bq=0,b100=0;sel.forEach(function(l){var t=lineP(l)*l.units;sub+=t;if(!items[l.slug].set&&l.size!=="10ml"){bq+=l.units;if(l.size==="100ml")b100+=l.units}});var d=bq>=2?5*(bq-1)+5*b100:0;return{sub:sub,d:d,tot:sub-d,bq:bq}}
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
 '<div class="zf"><p class="zd" hidden></p><div class="zc"><input class="zn" type="text" autocomplete="name" placeholder="Full name" aria-label="Full name"><input class="zp" type="tel" autocomplete="tel" placeholder="Phone number" aria-label="Phone number"><textarea class="zad" rows="2" autocomplete="street-address" placeholder="Address (street, unit)" aria-label="Delivery address"></textarea><input class="zct" type="text" autocomplete="address-level2" placeholder="City" aria-label="City"><div class="zr2"><input class="zst" type="text" autocomplete="address-level1" placeholder="State" aria-label="State"><input class="zpc" type="text" inputmode="numeric" maxlength="5" autocomplete="postal-code" placeholder="Postcode" aria-label="Postcode"></div><textarea class="znt" rows="2" placeholder="Order note (optional)" aria-label="Order note"></textarea><p class="zerr" role="alert" hidden></p></div><label class="za"><input type="checkbox" class="zall"> Select all</label><p class="zs">Total <strong>RM0</strong></p><button type="button" class="btn zgo">Check out</button></div>';
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
 try{var cu=JSON.parse(localStorage.getItem("zharde_cust"))||{};dr.querySelector(".zn").value=cu.n||"";dr.querySelector(".zp").value=cu.p||"";dr.querySelector(".zad").value=cu.a||"";dr.querySelector(".zct").value=cu.c||"";dr.querySelector(".zst").value=cu.s||"";dr.querySelector(".zpc").value=cu.z||""}catch(e){}
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
 if(cc.d){zd.textContent='Buy 2 saving: −RM'+cc.d+' (subtotal RM'+cc.sub+')';zd.hidden=false}else if(cc.bq===1){zd.textContent='Add 1 more 30ml or 100ml bottle for the Buy 2 special price.';zd.hidden=false}else zd.hidden=true;
 emptyEl.hidden=!empty;list.hidden=empty;foot.hidden=empty;
 allBox.checked=!empty&&sel.length===cart.length;allBox.indeterminate=sel.length>0&&sel.length<cart.length;
 sumEl.textContent="RM"+sum;go.disabled=!sel.length;go.textContent=sel.length?"Check out ("+sel.length+")":"Check out";
 if(keep){var el=list.querySelector('.ci[data-i="'+keep[0]+'"] .'+keep[1]);if(el&&!el.disabled)el.focus()}
}
function checkout(){var sel=cart.filter(function(l){return l.sel});if(!sel.length)return;var k=calc(sel);
 var q=function(s){return dr.querySelector(s)},er=q(".zerr");
 var v={n:q(".zn").value.trim(),p:q(".zp").value.trim(),a:q(".zad").value.trim(),c:q(".zct").value.trim(),s:q(".zst").value.trim(),z:q(".zpc").value.trim(),t:q(".znt").value.trim()};
 var bad=!v.n?".zn":v.p.replace(/\D/g,"").length<9?".zp":!v.a?".zad":!v.c?".zct":!v.s?".zst":!/^\d{5}$/.test(v.z)?".zpc":"";
 if(bad){er.textContent="Please complete your name, phone, address, city, state and a 5-digit postcode.";er.hidden=false;q(bad).focus();return}
 er.hidden=true;try{localStorage.setItem("zharde_cust",JSON.stringify({n:v.n,p:v.p,a:v.a,c:v.c,s:v.s,z:v.z}))}catch(e){}
 var d=new Date(),pad=function(x){return (x<10?"0":"")+x},no="ZH"+String(d.getFullYear()).slice(2)+pad(d.getMonth()+1)+pad(d.getDate())+"-"+Math.random().toString(36).slice(2,6).toUpperCase();
 var its=sel.map(function(l){var it=items[l.slug];return{name:"Zharde "+it.name,size:it.set?it.note:l.size,qty:l.units,amount:lineP(l)*l.units}});
 if(CFG.orders&&window.fetch){try{fetch(CFG.orders,{method:"POST",mode:"no-cors",keepalive:true,headers:{"Content-Type":"text/plain"},body:JSON.stringify({orderNo:no,name:v.n,phone:v.p,address:v.a,city:v.c,state:v.s,postcode:v.z,note:v.t,items:its,subtotal:k.sub,discount:k.d,total:k.tot})}).catch(function(){})}catch(e){}}
 var msg="Hai ZHARDÉ, saya ingin membuat pesanan.\nOrder No: "+no+"\nNama: "+v.n+"\nTelefon: "+v.p+"\nAlamat: "+v.a+", "+v.z+" "+v.c+", "+v.s+"\n\nItem:\n"+its.map(function(x){return x.name+" – "+x.size+" – Qty "+x.qty+" – RM"+x.amount}).join("\n")+
  "\n\nSubtotal: RM"+k.sub+(k.d?"\nBuy 2 saving: -RM"+k.d:"")+"\nShipping: akan disahkan semasa pengesahan pesanan\nTotal (belum termasuk penghantaran): RM"+k.tot+(v.t?"\nNota: "+v.t:"")+"\n\nMohon pengesahan pesanan dan kaedah pembayaran. Terima kasih.";
 var a=document.createElement("a");a.href="https://wa.me/"+CFG.wa+"?text="+encodeURIComponent(msg);a.target="_blank";a.rel="noopener";
 document.body.appendChild(a);a.click();a.remove();}
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
