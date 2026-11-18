(function(){
"use strict";
var CFG={"variants": [{"slug": "ember", "name": "Ember"}, {"slug": "solace", "name": "Solace"}, {"slug": "azure", "name": "Azure"}, {"slug": "sovereign", "name": "Sovereign"}, {"slug": "bombshell", "name": "Bombshell"}, {"slug": "dulcette", "name": "Dulcette"}, {"slug": "elysian", "name": "Elysian"}], "sizes": ["10ml", "30ml", "100ml"]};
var URL=String(window.ZHARDE_REVIEWS_URL||"").trim();
var CK="zharde_reviews_v2",PAGE=8,MAXROWS=7,t0=Date.now();
var byName={};CFG.variants.forEach(function(v){byName[v.name]=v});
function $(id){return document.getElementById(id)}
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
function num(n,a,b){n=Math.round(Number(n));return n>=a&&n<=b?n:null}
var MON=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function fdate(s){var m=/^(\d{4})-(\d{2})-(\d{2})/.exec(s||"");return m?(+m[3])+" "+MON[+m[2]-1]+" "+m[1]:""}
function f1(x){return (Math.round(x*10)/10).toFixed(1)}
function stars(n){var r=Math.round(n);return "★★★★★".slice(0,r)+"☆☆☆☆☆".slice(0,5-r)}
function starsEl(n){var s=el("span","stars-d",stars(n));s.setAttribute("role","img");s.setAttribute("aria-label",f1(n)+" out of 5");return s}
function meter(v,label){var m=el("span","meter");var i=el("i");i.style.width=(v*10)+"%";m.appendChild(i);m.setAttribute("role","img");m.setAttribute("aria-label",label+" "+f1(v)+" out of 10");return m}

/* ---------- data ---------- */
function shape(list){var out=[];(Array.isArray(list)?list:[]).forEach(function(r){
 if(!r||typeof r.name!=="string"||typeof r.comment!=="string"||!Array.isArray(r.items))return;
 var items=[];r.items.forEach(function(i){var v=byName[i&&i.variant],l=num(i&&i.longevity,1,10),p=num(i&&i.projection,1,10),o=num(i&&i.overall,1,5),u=num(i&&i.units,1,99);
  if(v&&CFG.sizes.indexOf(i.size)>-1&&l&&p&&o&&u)items.push({variant:v.name,slug:v.slug,size:i.size,units:u,longevity:l,projection:p,overall:o})});
 if(items.length)out.push({id:String(r.id||""),date:String(r.date||""),name:r.name.slice(0,40),comment:r.comment.slice(0,600),items:items})});return out}
function load(force){
 if(!URL)return Promise.resolve({configured:false,reviews:[]});
 if(!force){try{var c=JSON.parse(sessionStorage.getItem(CK));if(c&&Date.now()-c.t<120000)return Promise.resolve({configured:true,reviews:c.r})}catch(e){}}
 return fetch(URL,{method:"GET",redirect:"follow"}).then(function(r){return r.json()}).then(function(j){
  if(!j||!j.ok)throw new Error("bad");var r=shape(j.reviews);try{sessionStorage.setItem(CK,JSON.stringify({t:Date.now(),r:r}))}catch(e){}return{configured:true,reviews:r}})}
function stats(reviews,slug){var n=0,l=0,p=0,o=0,rv=0;reviews.forEach(function(r){var hit=false;r.items.forEach(function(i){if(!slug||i.slug===slug){n++;l+=i.longevity;p+=i.projection;o+=i.overall;hit=true}});if(hit)rv++});
 return{n:n,reviews:rv,l:n?l/n:0,p:n?p/n:0,o:n?o/n:0}}

/* ---------- review card ---------- */
function itemRow(i){var d=el("div","rvitem");
 var top=el("div","rvtop");top.appendChild(el("span","pill",i.variant+" · "+i.size+" × "+i.units));top.appendChild(starsEl(i.overall));d.appendChild(top);
 var g=el("div","rvmeters");
 [["Longevity",i.longevity],["Projection",i.projection]].forEach(function(x){var r=el("div","rvm");r.appendChild(el("span","rvl",x[0]));r.appendChild(meter(x[1],x[0]));r.appendChild(el("b",null,x[1]+"/10"));g.appendChild(r)});
 d.appendChild(g);return d}
function card(r,onlySlug){var a=el("article","rvcard");var h=el("header","rvhead");h.appendChild(el("strong",null,r.name));if(r.date)h.appendChild(el("time",null,fdate(r.date)));a.appendChild(h);
 a.appendChild(el("p","rvtext",r.comment));
 r.items.forEach(function(i){if(!onlySlug||i.slug===onlySlug)a.appendChild(itemRow(i))});return a}

/* ---------- reviews page: list ---------- */
var ALL=[],FILTER="",SHOWN=0;
function renderList(){var list=$("rv-list");if(!list)return;list.textContent="";
 var rows=ALL.filter(function(r){return !FILTER||r.items.some(function(i){return i.slug===FILTER})});
 var more=$("rv-more");SHOWN=Math.min(SHOWN||PAGE,rows.length);
 rows.slice(0,SHOWN).forEach(function(r){list.appendChild(card(r,FILTER))});
 more.hidden=SHOWN>=rows.length;
 var st=$("rv-state");st.hidden=rows.length>0;if(!rows.length)st.textContent=ALL.length?"No reviews for this perfume yet.":"No reviews yet. Be the first to write one!";
 more.onclick=function(){SHOWN+=PAGE;renderList()}}
function renderSummary(){var box=$("rv-summary");if(!box)return;box.textContent="";var s=stats(ALL,FILTER);
 if(!s.n){box.hidden=true;return}box.hidden=false;
 var a=el("div","rvs");a.appendChild(el("p","rvbig",f1(s.o)));a.appendChild(starsEl(s.o));a.appendChild(el("p","rvsmall","Based on "+s.reviews+(s.reviews===1?" review":" reviews")));box.appendChild(a);
 var b=el("div","rvs rvs2");[["Longevity",s.l],["Projection",s.p]].forEach(function(x){var r=el("div","rvm");r.appendChild(el("span","rvl",x[0]));r.appendChild(meter(x[1],x[0]));r.appendChild(el("b",null,f1(x[1])+"/10"));b.appendChild(r)});box.appendChild(b)}
function renderFilter(){var f=$("rv-filter");if(!f)return;f.textContent="";if(!ALL.length){f.hidden=true;return}f.hidden=false;
 function btn(label,slug){var b=el("button","nf",label);b.type="button";b.setAttribute("aria-pressed",String(FILTER===slug));b.onclick=function(){FILTER=slug;SHOWN=0;history.replaceState(null,"",slug?"#"+slug:location.pathname);refresh()};return b}
 f.appendChild(btn("All",""));CFG.variants.forEach(function(v){if(ALL.some(function(r){return r.items.some(function(i){return i.slug===v.slug})}))f.appendChild(btn(v.name,v.slug))})}
function refresh(){renderFilter();renderSummary();renderList()}

/* ---------- perfumes page ---------- */
function renderPerfumes(){document.querySelectorAll(".prev[data-slug]").forEach(function(box){var slug=box.dataset.slug;box.textContent="";
 var s=stats(ALL,slug);box.appendChild(el("p","lab","Customer reviews"));
 if(!s.n){var p=el("p","rvempty","No reviews yet. ");var a=el("a",null,"Be the first to review");a.href="reviews.html#write";p.appendChild(a);box.appendChild(p);box.hidden=false;return}
 var sum=el("div","prsum");sum.appendChild(el("b","rvbig2",f1(s.o)));sum.appendChild(starsEl(s.o));sum.appendChild(el("span","rvsmall",s.reviews+(s.reviews===1?" review":" reviews")));box.appendChild(sum);
 var m=el("div","rvmeters");[["Longevity",s.l],["Projection",s.p]].forEach(function(x){var r=el("div","rvm");r.appendChild(el("span","rvl",x[0]));r.appendChild(meter(x[1],x[0]));r.appendChild(el("b",null,f1(x[1])+"/10"));m.appendChild(r)});box.appendChild(m);
 var rows=ALL.filter(function(r){return r.items.some(function(i){return i.slug===slug})});
 box.appendChild(carousel(rows.slice(0,CAR_MAX),slug,rows.length));box.hidden=false})}

/* ---------- perfumes page: one-review carousel ---------- */
var CAR_MAX=5;
function carousel(rows,slug,total){
 var n=rows.length,idx=0,name=(byName&&CFG.variants.filter(function(v){return v.slug===slug})[0]||{}).name||"Perfume";
 var wrap=el("div","rcar");wrap.setAttribute("role","region");wrap.setAttribute("aria-roledescription","carousel");wrap.setAttribute("aria-label",name+" customer reviews");
 var view=el("div","rcar-view");view.tabIndex=0;var track=el("div","rcar-track");view.appendChild(track);
 var slides=rows.map(function(r,k){var s=el("div","rcar-slide");s.setAttribute("role","group");s.setAttribute("aria-roledescription","slide");s.setAttribute("aria-label","Review "+(k+1)+" of "+n);
  var c=card(r,slug);c.classList.add("rvmini");s.appendChild(c);track.appendChild(s);return s});
 wrap.appendChild(view);
 var more=el("a","btn ghost rcar-more","More reviews");more.href="reviews.html#"+slug;more.hidden=true;
 var prev,next,count;
 if(n>1){var foot=el("div","rcar-foot");
  prev=el("button","rcar-btn","\u2039");prev.type="button";prev.setAttribute("aria-label","Previous review");
  next=el("button","rcar-btn","\u203A");next.type="button";next.setAttribute("aria-label","Next review");
  count=el("span","rcar-count","");count.setAttribute("aria-live","polite");
  foot.appendChild(prev);foot.appendChild(count);foot.appendChild(next);wrap.appendChild(foot)}
 wrap.appendChild(more);
 function fit(){var hh=slides[idx].offsetHeight;view.style.height=hh?hh+"px":"auto"}
 function go(i){idx=Math.max(0,Math.min(n-1,i));track.style.transform="translateX(-"+(idx*100)+"%)";
  slides.forEach(function(s,k){s.setAttribute("aria-hidden",String(k!==idx))});
  if(prev){prev.disabled=idx===0;next.disabled=idx===n-1;count.textContent=(idx+1)+" / "+n}
  more.hidden=!(idx===n-1&&total>n);fit()}
 if(prev){prev.onclick=function(){go(idx-1)};next.onclick=function(){go(idx+1)}}
 view.addEventListener("keydown",function(e){if(e.key==="ArrowLeft"){go(idx-1);e.preventDefault()}else if(e.key==="ArrowRight"){go(idx+1);e.preventDefault()}});
 var x0=null,y0=0;
 view.addEventListener("touchstart",function(e){x0=e.touches[0].clientX;y0=e.touches[0].clientY},{passive:true});
 view.addEventListener("touchend",function(e){if(x0===null)return;var t=e.changedTouches[0],dx=t.clientX-x0,dy=t.clientY-y0;x0=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.5)go(idx+(dx<0?1:-1))},{passive:true});
 if(window.ResizeObserver){var ro=new ResizeObserver(fit);slides.forEach(function(s){ro.observe(s)})}
 window.addEventListener("resize",fit);window.addEventListener("load",fit);
 go(0);return wrap}

/* ---------- form ---------- */
var rowN=0;
function pills(name,label,max){var g=el("div","pills");g.setAttribute("role","radiogroup");g.setAttribute("aria-label",label);
 for(var i=1;i<=max;i++){var lb=el("label");var inp=document.createElement("input");inp.type="radio";inp.name=name;inp.value=i;lb.appendChild(inp);lb.appendChild(el("span",null,String(i)));g.appendChild(lb)}return g}
function starInput(name,label){var g=el("div","starin");g.setAttribute("role","radiogroup");g.setAttribute("aria-label",label);
 for(var i=1;i<=5;i++){var lb=el("label");var inp=document.createElement("input");inp.type="radio";inp.name=name;inp.value=i;var s=el("span","st","★");s.setAttribute("aria-hidden","true");var sr=el("span","sr",i+(i>1?" stars":" star"));lb.appendChild(inp);lb.appendChild(s);lb.appendChild(sr);g.appendChild(lb)}
 g.addEventListener("change",function(){var v=+g.querySelector("input:checked").value;g.querySelectorAll(".st").forEach(function(s,k){s.classList.toggle("on",k<v)})});return g}
function sel(cls,ph,opts){var s=el("select",cls);var o=el("option",null,ph);o.value="";s.appendChild(o);opts.forEach(function(x){var p=el("option",null,x);p.value=x;s.appendChild(p)});return s}
function field(label,node){var l=el("label","fld sm");l.appendChild(el("span",null,label));l.appendChild(node);return l}
function addRow(){var rows=$("rv-rows");if(rows.children.length>=MAXROWS)return;var n=++rowN;
 var fs=el("fieldset","rrow");fs.dataset.n=n;var lg=el("legend",null,"");fs.appendChild(lg);
 var g=el("div","rgrid");
 g.appendChild(field("Perfume",sel("rv",   "Select perfume",CFG.variants.map(function(v){return v.name}))));
 g.appendChild(field("Size",sel("rs","Select size",CFG.sizes)));
 var u=el("input","ru");u.type="number";u.min=1;u.max=99;u.value=1;u.inputMode="numeric";g.appendChild(field("Units",u));fs.appendChild(g);
 var r1=el("div","rrate");r1.appendChild(el("p",null,"Longevity "));r1.firstChild.appendChild(el("small",null,"how long it lasts (1 to 10)"));r1.appendChild(pills("l"+n,"Longevity out of 10",10));fs.appendChild(r1);
 var r2=el("div","rrate");r2.appendChild(el("p",null,"Projection "));r2.firstChild.appendChild(el("small",null,"how far the scent travels (1 to 10)"));r2.appendChild(pills("p"+n,"Projection out of 10",10));fs.appendChild(r2);
 var r3=el("div","rrate");r3.appendChild(el("p",null,"Overall rating "));r3.firstChild.appendChild(el("small",null,"1 to 5 stars"));r3.appendChild(starInput("o"+n,"Overall rating out of 5 stars"));fs.appendChild(r3);
 var rm=el("button","rrm","Remove this perfume");rm.type="button";rm.onclick=function(){fs.remove();numberRows()};fs.appendChild(rm);
 rows.appendChild(fs);numberRows();return fs}
function numberRows(){var rs=$("rv-rows").children;for(var i=0;i<rs.length;i++){rs[i].querySelector("legend").textContent="Perfume "+(i+1);rs[i].querySelector(".rrm").hidden=rs.length<2}
 $("rv-add").disabled=rs.length>=MAXROWS}
function err(msg,node){var e=$("rv-err");e.textContent=msg;e.hidden=false;if(node){try{node.scrollIntoView({block:"center"});node.focus&&node.focus()}catch(x){}}return false}
function collect(){var name=$("rv-name").value.replace(/\s+/g," ").trim(),comment=$("rv-comment").value.replace(/\s+/g," ").trim();
 if(!name)return err("Please enter your name (a nickname is fine).",$("rv-name"));
 if(comment.length<10)return err("Please write a comment of at least 10 characters.",$("rv-comment"));
 if(/(https?:\/\/|www\.)/i.test(name+" "+comment))return err("Links are not allowed in reviews.",$("rv-comment"));
 var items=[],seen={},rs=$("rv-rows").children;
 for(var i=0;i<rs.length;i++){var r=rs[i],n=r.dataset.n,tag="Perfume "+(i+1)+": ";
  var v=r.querySelector(".rv"),s=r.querySelector(".rs"),u=r.querySelector(".ru");
  var l=r.querySelector('input[name="l'+n+'"]:checked'),p=r.querySelector('input[name="p'+n+'"]:checked'),o=r.querySelector('input[name="o'+n+'"]:checked');
  if(!v.value)return err(tag+"please choose the perfume you bought.",v);
  if(!s.value)return err(tag+"please choose the size.",s);
  var units=Math.round(Number(u.value));if(!(units>=1&&units<=99))return err(tag+"units must be between 1 and 99.",u);
  if(!l)return err(tag+"please rate the longevity.",r.querySelector('input[name="l'+n+'"]'));
  if(!p)return err(tag+"please rate the projection.",r.querySelector('input[name="p'+n+'"]'));
  if(!o)return err(tag+"please give an overall rating.",r.querySelector('input[name="o'+n+'"]'));
  var k=v.value+"|"+s.value;if(seen[k])return err(tag+"you already added "+v.value+" "+s.value+".",v);seen[k]=1;
  items.push({variant:v.value,size:s.value,units:units,longevity:+l.value,projection:+p.value,overall:+o.value})}
 return{name:name.slice(0,40),comment:comment.slice(0,600),items:items,website:$("rv-hp").value,t:Date.now()-t0}}
function resetForm(){$("rv-name").value="";$("rv-comment").value="";$("rv-count").textContent="0 / 600";$("rv-rows").textContent="";rowN=0;addRow()}
function initForm(){var f=$("rv-form");if(!f)return;
 var sec=$("write"),ob=$("rv-open");
 function openForm(show,go){sec.hidden=!show;if(ob)ob.setAttribute("aria-expanded",String(show));
  if(show&&go){sec.scrollIntoView({behavior:"smooth",block:"start"});setTimeout(function(){if(!f.hidden)$("rv-name").focus({preventScroll:true})},400)}}
 if(ob)ob.onclick=function(){openForm(sec.hidden,true)};
 if(location.hash==="#write")openForm(true,true);
 window.addEventListener("hashchange",function(){if(location.hash==="#write")openForm(true,true)});
 if(!URL){$("rv-config").hidden=false;$("rv-submit").disabled=true}
 addRow();$("rv-add").onclick=addRow;
 $("rv-comment").addEventListener("input",function(){$("rv-count").textContent=this.value.length+" / 600"});
 $("rv-again").onclick=function(){$("rv-thanks").hidden=true;f.hidden=false;$("rv-name").focus()};
 f.addEventListener("submit",function(e){e.preventDefault();$("rv-err").hidden=true;if(!URL)return;
  var last=+localStorage.getItem("zharde_rv_last")||0;if(Date.now()-last<45000)return err("Please wait a moment before sending another review.");
  var d=collect();if(!d)return;var b=$("rv-submit");b.disabled=true;b.textContent="Sending...";
  fetch(URL,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(d)}).then(function(){
   try{localStorage.setItem("zharde_rv_last",String(Date.now()));sessionStorage.removeItem(CK)}catch(x){}
   f.hidden=true;$("rv-thanks").hidden=false;resetForm();b.disabled=false;b.textContent="Submit review";
   $("rv-thanks").scrollIntoView({block:"center"});
   load(true).then(function(s){ALL=s.reviews;SHOWN=0;refresh()}).catch(function(){})
  }).catch(function(){err("Sorry, your review could not be sent. Please try again, or message us on WhatsApp.");b.disabled=false;b.textContent="Submit review"})})}

/* ---------- init ---------- */
function init(){
 var onRev=!!$("rv-list"),onPerf=!!document.querySelector(".prev[data-slug]");
 if(onRev){var h=location.hash.slice(1);if(byName&&CFG.variants.some(function(v){return v.slug===h}))FILTER=h;initForm()}
 if(!onRev&&!onPerf)return;
 load(false).then(function(s){ALL=s.reviews;
  if(onRev){var st=$("rv-state");if(!s.configured){st.textContent="Customer reviews will appear here soon."}else{refresh()}}
  if(onPerf&&s.configured)renderPerfumes()
 }).catch(function(){var st=$("rv-state");if(st){st.hidden=false;st.textContent="Reviews could not be loaded right now. Please try again later."}})}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
