/* YDS Kelime Kartları — uygulama mantığı + IndexedDB katmanı */
let W=[],EX={},TONE={},DECK=[];
let S={p:{},missed:[],seen:[],count:0};
let db=null;

/* ---------- Veritabanı (IndexedDB) ----------
   words : her kelime bir kayıt {id,en,pron,tr,x:{syn,ant,ex},tone}
   kv    : "state" -> ilerleme (kaldığın yer), "seedVer" -> yüklenen veri sürümü */
const req=r=>new Promise((res,rej)=>{r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
const store=(n,m)=>db.transaction(n,m||"readonly").objectStore(n);
const done=t=>new Promise((res,rej)=>{t.oncomplete=()=>res();t.onerror=t.onabort=()=>rej(t.error)});
function openDB(){return new Promise((res,rej)=>{
  const r=indexedDB.open("yds-kartlar",1);
  r.onupgradeneeded=()=>{r.result.createObjectStore("words",{keyPath:"id"});r.result.createObjectStore("kv")};
  r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
async function seedWords(){
  const ver=await req(store("kv").get("seedVer"));
  const n=await req(store("words").count());
  if(ver===SEED.ver&&n===SEED.W.length)return;
  const t=db.transaction(["words","kv"],"readwrite"),ws=t.objectStore("words");
  for(const w of SEED.W){const k=w[1].toLowerCase();
    ws.put({id:w[0],en:w[1],pron:w[2],tr:w[3],x:SEED.EX[k]||null,tone:SEED.TONE[k]||null})}
  t.objectStore("kv").put(SEED.ver,"seedVer");
  await done(t);
}
async function loadWords(){
  const rows=await req(store("words").getAll());rows.sort((a,b)=>a.id-b.id);
  W=rows.map(r=>[r.id,r.en,r.pron,r.tr]);
  for(const r of rows){const k=r.en.toLowerCase();if(r.x)EX[k]=r.x;if(r.tone)TONE[k]=r.tone}
  DECK=W;
}
async function loadState(){
  let s=await req(store("kv").get("state"));
  if(!s){try{const r=localStorage.getItem("yds-kartlar-v1");if(r)s=JSON.parse(r)}catch(e){}}  // eski sürümden taşı
  if(s)S=Object.assign(S,s);
}
const save=()=>{if(!db)return;try{store("kv","readwrite").put(S,"state")}catch(e){console.error(e)}};

const DAY=864e5,STEPS=[1,3,7,14],KEY="yds-kartlar-v1";
const $=s=>document.querySelector(s),main=$("#main");
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const byId=id=>W[id-1];
const meanings=t=>t.split(/\s*\d\)\s*/).map(x=>x.trim()).filter(Boolean);
const short=t=>meanings(t)[0].split(",").slice(0,2).join(",").trim();
const ex=w=>EX[w[1].toLowerCase()];
let tab=1,cur=null,undoStack=[],quiz=null;

function pick(){
  const now=Date.now();let due=null,fresh=null,soon=null;
  for(const w of DECK){const p=S.p[w[0]];
    if(!p){if(!fresh)fresh=w;continue}
    if(p.box>=STEPS.length+1)continue;
    if(p.due<=now){if(!due||p.due<S.p[due[0]].due)due=w}
    else if(p.box===0&&p.due-now<DAY){if(!soon||p.due<S.p[soon[0]].due)soon=w}}
  return due||fresh||soon;
}
function stats(){
  const m=Object.values(S.p).filter(p=>p.box>STEPS.length).length;
  $("#stats").textContent=Object.keys(S.p).length+" / "+DECK.length+" görüldü · "+m+" öğrenildi";
}
function mark(w,id){const e=ex(w);if(!e||!e.ex)return"";
  const re=new RegExp("\\b("+w[1].toLowerCase().replace(/[^a-z]/g,"")+"\\w*)","i");
  return '<div class="exs">'+esc(e.ex).replace(re,"<mark>$1</mark>")+"</div>"}
function render(){
  stats();
  $("#t1").setAttribute("aria-selected",tab==1);$("#t2").setAttribute("aria-selected",tab==2);$("#t3").setAttribute("aria-selected",tab==3);
  $("#undo").disabled=!undoStack.length;
  if(quiz)return renderQuiz();
  tab==1?renderCards():tab==2?renderMissed():renderBackup();
}
function renderCards(){
  cur=cur&&!S.p[cur[0]]?cur:pick();
  if(!cur){main.innerHTML='<div class="empty">Şu an gösterilecek kelime yok.<br>Bildiklerin 1, 3, 7 ve 14 gün sonra yeniden gelecek.</div>';return}
  const w=cur,e=ex(w),m=meanings(w[3]);
  const t0=TONE[w[1].toLowerCase()],tag=t0=="p"?"🟢":t0=="n"?"🔴":"";
  const tr=m.length>1?'<ol class="tr">'+m.map(x=>"<li>"+esc(x)+"</li>").join("")+"</ol>":'<p class="tr">'+esc(w[3])+"</p>";
  main.innerHTML='<div class="stage"><div class="card" id="card"><span class="stamp k">BİLİYORUM</span><span class="stamp d">BİLMİYORUM</span><div class="inner"><div class="face front"><span class="tag" title="Anlam tonu">'+tag+'</span><h2 class="en">'+esc(w[1])+'</h2><div class="ok">'+esc(w[2])+'</div><span class="hint">Çevirmek için dokun · sağa bil, sola bilme</span></div><div class="face back"><span class="tag">'+tag+'</span><h3 style="margin:0 0 8px;font-size:15px;color:var(--mute);font-weight:500">'+esc(w[1])+"</h3>"+tr+
   (e&&e.syn.length?'<div class="row"><b>Eş anlamlı</b>'+esc(e.syn.join(", "))+"</div>":"")+(e&&e.ant.length?'<div class="row"><b>Zıt anlamlı</b>'+esc(e.ant.join(", "))+"</div>":"")+mark(w)+'</div></div></div></div><div class="actions"><button class="btn no" id="bn">✕ Bilmiyorum</button><button class="btn yes" id="by">✓ Biliyorum</button></div>';
  bind($("#card"));$("#bn").onclick=()=>answer(false);$("#by").onclick=()=>answer(true);
}
function bind(c){
  let x0=0,dx=0,down=false,moved=false;
  const k=c.querySelector(".k"),d=c.querySelector(".d");
  c.onpointerdown=e=>{down=true;moved=false;x0=e.clientX;c.setPointerCapture(e.pointerId);c.style.transition="none"};
  c.onpointermove=e=>{if(!down)return;dx=e.clientX-x0;if(Math.abs(dx)>8)moved=true;
    c.style.transform="translateX("+dx+"px) rotate("+dx/20+"deg)";
    k.style.opacity=Math.max(0,dx/100);d.style.opacity=Math.max(0,-dx/100)};
  c.onpointerup=()=>{if(!down)return;down=false;c.style.transition="transform .25s";
    if(dx>90)fly(c,1);else if(dx<-90)fly(c,-1);
    else{c.style.transform="";k.style.opacity=d.style.opacity=0;if(!moved)c.classList.toggle("flip")}
    dx=0};
}
function fly(c,dir){c.style.transform="translateX("+dir*700+"px) rotate("+dir*30+"deg)";setTimeout(()=>answer(dir>0),180)}
function answer(know){
  const w=cur,id=w[0],prev=S.p[id]?Object.assign({},S.p[id]):null;
  undoStack.push({id,prev,missed:S.missed.slice(),seen:S.seen.slice(),count:S.count});
  if(undoStack.length>50)undoStack.shift();
  if(know){const box=(prev?prev.box:0)+1;
    S.p[id]={box,due:box>STEPS.length?Infinity:Date.now()+STEPS[box-1]*DAY}}
  else{S.p[id]={box:0,due:Date.now()+2*60*1000};if(!S.missed.includes(id))S.missed.push(id)}
  S.seen.push(id);S.seen=S.seen.slice(-20);S.count++;save();cur=null;
  if(S.count%20===0)startQuiz();render();
}
$("#undo").onclick=()=>{const u=undoStack.pop();if(!u)return;
  if(u.prev)S.p[u.id]=u.prev;else delete S.p[u.id];
  S.missed=u.missed;S.seen=u.seen;S.count=u.count;save();quiz=null;tab=1;cur=byId(u.id);render()};
$("#t1").onclick=()=>{tab=1;render()};$("#t2").onclick=()=>{tab=2;render()};$("#t3").onclick=()=>{tab=3;render()};
function renderMissed(){
  const list=S.missed.map(byId);
  if(!list.length){main.innerHTML='<div class="empty">Henüz bilemediğin kelime yok.<br>Sola kaydırdığın veya testte yanlış yaptığın kelimeler burada toplanır.</div>';return}
  main.innerHTML=list.map(w=>{const e=ex(w);return '<div class="item"><h3>'+esc(w[1])+' <span style="font-weight:400;color:var(--mute);font-size:14px">'+esc(w[2])+'</span></h3><p>'+esc(w[3])+"</p>"+(e?mark(w):"")+'<button class="btn" data-id="'+w[0]+'" style="margin-top:8px;min-height:36px;padding:6px 12px">Öğrendim, listeden çıkar</button></div>'}).join("");
  main.querySelectorAll("button[data-id]").forEach(b=>b.onclick=()=>{S.missed=S.missed.filter(i=>i!=b.dataset.id);save();render()});
}
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a}
function startQuiz(){
  const ids=[...new Set(S.seen)];const qs=shuffle(ids).slice(0,5).map(id=>{
    const w=byId(id),ans=short(w[3]);
    const wrong=shuffle(DECK.filter(x=>x[0]!==id&&short(x[3])!==ans)).slice(0,4).map(x=>short(x[3]));
    return{id,ans,opts:shuffle([ans,...wrong])}});
  quiz={qs,i:0,score:0,done:false,picked:null};
}
function renderQuiz(){
  const q=quiz;
  if(q.i>=q.qs.length){main.innerHTML='<div class="empty quiz"><h2>'+q.score+" / "+q.qs.length+'</h2>Mini test bitti. Yanlışların “Bilemediklerim” listesine eklendi.<br><br><button class="btn" id="go">Kartlara dön</button></div>';$("#go").onclick=()=>{quiz=null;render()};return}
  const cq=q.qs[q.i],w=byId(cq.id);
  main.innerHTML='<div class="quiz"><div class="stats">Mini test · '+(q.i+1)+" / "+q.qs.length+"</div><h2>"+esc(w[1])+'</h2><div class="ok">'+esc(w[2])+"</div>"+cq.opts.map((o,i)=>'<button class="btn opt" data-o="'+i+'">'+esc(o)+"</button>").join("")+"</div>";
  main.querySelectorAll(".opt").forEach(b=>b.onclick=()=>{
    if(q.picked!==null)return;const o=cq.opts[b.dataset.o];q.picked=1;
    main.querySelectorAll(".opt").forEach(x=>{if(cq.opts[x.dataset.o]===cq.ans)x.classList.add("good")});
    if(o===cq.ans)q.score++;else{b.classList.add("bad");if(!S.missed.includes(cq.id))S.missed.push(cq.id);save()}
    setTimeout(()=>{q.i++;q.picked=null;renderQuiz()},o===cq.ans?600:1400)});
}


/* ---------- Yedekle / geri yükle ---------- */
function renderBackup(msg){
  const last=S.lastBackup?new Date(S.lastBackup).toLocaleString("tr-TR",{dateStyle:"medium",timeStyle:"short"}):"hiç alınmadı";
  main.innerHTML='<div class="item bk"><h3>Yedekle</h3><p>İlerlemen (bildiklerin, bilemediklerin, tekrar zamanları, kaldığın yer) tek bir dosyaya kaydedilir. Uygulamayı silersen ya da telefon değiştirirsen bu dosyayla devam edersin.</p><p style="color:var(--mute);font-size:13px">Son yedek: '+esc(last)+'</p><button class="btn" id="bkExp">⬇ Yedeği kaydet / paylaş</button><h3 style="margin-top:18px">Geri yükle</h3><p>Daha önce aldığın yedek dosyasını seç. Şu anki ilerlemenin üzerine yazılır.</p><button class="btn" id="bkImp">⬆ Yedek dosyası seç</button><input type="file" id="bkFile" accept=".json,application/json" hidden><div class="msg" id="bkMsg">'+(msg?esc(msg):"")+'</div></div>';
  $("#bkExp").onclick=exportBackup;
  $("#bkImp").onclick=()=>$("#bkFile").click();
  $("#bkFile").onchange=e=>{const f=e.target.files[0];if(f)importBackup(f);e.target.value=""};
}
async function exportBackup(){
  const now=new Date();
  const data={app:"yds-kartlar",version:1,exported:now.toISOString(),state:S};
  const name="yds-yedek-"+now.toISOString().slice(0,10)+".json";
  const file=new File([JSON.stringify(data)],name,{type:"application/json"});
  try{
    if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title:"YDS Kartlar yedeği"})}
    else{const u=URL.createObjectURL(file),a=document.createElement("a");a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2000)}
  }catch(e){if(e&&e.name==="AbortError")return;console.error(e);renderBackup("Yedek alınamadı.");return}
  S.lastBackup=Date.now();save();renderBackup("Yedek hazır: "+name);
}
async function importBackup(f){
  try{
    const o=JSON.parse(await f.text());
    if(!o||o.app!=="yds-kartlar"||!o.state||typeof o.state.p!=="object")throw new Error("bad");
    const n=Object.keys(o.state.p).length;
    if(!confirm("Yedekteki ilerleme ("+n+" kelime görülmüş) yüklensin mi? Şu anki ilerlemenin üzerine yazılır."))return;
    const s=Object.assign({p:{},missed:[],seen:[],count:0},o.state);
    for(const id in s.p){if(s.p[id].due===null)s.p[id].due=Infinity}   // JSON'da Infinity null olur
    S=s;save();undoStack=[];quiz=null;cur=null;
    renderBackup("Yüklendi: "+n+" kelimelik ilerleme geri geldi. Kartlar sekmesine dön.");stats();
  }catch(e){console.error(e);renderBackup("Bu dosya geçerli bir YDS yedeği değil.")}
}

async function boot(){
  main.innerHTML='<div class="empty">Yükleniyor…</div>';
  try{
    db=await openDB();
    await seedWords();await loadWords();await loadState();
    save();  // taşınan ilerlemeyi kalıcı yap
    if(navigator.storage&&navigator.storage.persist)navigator.storage.persist();
    render();
  }catch(e){
    console.error(e);
    main.innerHTML='<div class="empty">Veritabanı açılamadı.<br>Gizli sekmede olmayabilirsin; normal sekmede aç.</div>';
  }
}
boot();
