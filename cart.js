(function(){
"use strict";
var CFG={"wa": "601165526640", "sizes": [{"v": "10ml", "p": 12}, {"v": "30ml", "p": 35}, {"v": "100ml", "p": 100}], "items": {"ember": {"name": "Ember", "color": "#e0662a"}, "solace": {"name": "Solace", "color": "#9a9488"}, "azure": {"name": "Azure", "color": "#4a8fd0"}, "sovereign": {"name": "Sovereign", "color": "#b8743a"}, "bombshell": {"name": "Bombshell", "color": "#c2457d"}, "dulcette": {"name": "Dulcette", "color": "#c96b88"}, "elysian": {"name": "Elysian", "color": "#b08a4a"}}};
var KEY="zharde_cart_v1",items=CFG.items,sizes=CFG.sizes;
var TRASH='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 10v6M14 10v6"/></svg>';
function price(v){for(var i=0;i<sizes.length;i++)if(sizes[i].v===v)return sizes[i].p;return 0}
function valid(l){return l&&items[l.slug]&&price(l.size)>0&&l.units>=1&&l.units<=99}
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
 '<div class="zf"><label class="za"><input type="checkbox" class="zall"> Select all</label><p class="zs">Total <strong>RM0</strong></p><button type="button" class="btn zgo">Check out</button></div>';
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
  '<div class="inf"><p class="nm">Zharde '+esc(it.name)+'</p><select class="csz" aria-label="Size for '+esc(it.name)+'">'+opts+'</select>'+
  '<div class="qr"><div class="qty"><button type="button" class="cm" aria-label="Decrease units"'+(l.units<=1?" disabled":"")+'>&minus;</button>'+
  '<input class="cq" type="number" min="1" max="99" value="'+l.units+'" aria-label="Units"><button type="button" class="cp" aria-label="Increase units"'+(l.units>=99?" disabled":"")+'>+</button></div>'+
  '<span class="lp">RM'+(price(l.size)*l.units)+'</span></div></div>'+
  '<button type="button" class="del" aria-label="Remove '+esc(it.name)+' from cart">'+TRASH+'</button></li>'}).join("");
 var empty=!cart.length,sel=cart.filter(function(l){return l.sel}),sum=0;
 sel.forEach(function(l){sum+=price(l.size)*l.units});
 emptyEl.hidden=!empty;list.hidden=empty;foot.hidden=empty;
 allBox.checked=!empty&&sel.length===cart.length;allBox.indeterminate=sel.length>0&&sel.length<cart.length;
 sumEl.textContent="RM"+sum;go.disabled=!sel.length;go.textContent=sel.length?"Check out ("+sel.length+")":"Check out";
 if(keep){var el=list.querySelector('.ci[data-i="'+keep[0]+'"] .'+keep[1]);if(el&&!el.disabled)el.focus()}
}
function checkout(){var sel=cart.filter(function(l){return l.sel});if(!sel.length)return;
 var msg=sel.map(function(l){return"Perfume: Zharde "+items[l.slug].name+"\nSaiz: "+l.size+"\nUnits: "+l.units}).join("\n\n");
 var a=document.createElement("a");a.href="https://wa.me/"+CFG.wa+"?text="+encodeURIComponent(msg);a.target="_blank";a.rel="noopener";
 document.body.appendChild(a);a.click();a.remove();}
function open(){lastFocus=document.activeElement;toast.hidden=true;ov.hidden=false;dr.hidden=false;document.body.style.overflow="hidden";dr.querySelector(".zx").focus()}
function close(){ov.hidden=true;dr.hidden=true;document.body.style.overflow="";if(lastFocus&&lastFocus.focus)lastFocus.focus()}
function say(t){toast.textContent=t;toast.hidden=false;clearTimeout(tt);tt=setTimeout(function(){toast.hidden=true},1800)}
function add(slug,size,units){
 if(!items[slug]||price(size)<=0)return;units=clamp(units);
 var f=null;cart.forEach(function(l){if(l.slug===slug&&l.size===size)f=l});
 if(f){f.units=clamp(f.units+units);f.sel=true}else cart.push({slug:slug,size:size,units:units,sel:true});
 save();render();say("Added to cart: Zharde "+items[slug].name+" · "+size+" × "+units);}
window.ZCart={add:add,open:open};
build();render();
document.querySelectorAll(".cartbtn").forEach(function(b){b.addEventListener("click",open)});
window.addEventListener("storage",function(e){if(e.key===KEY){cart=load();render()}});
})();
