// Килтсит: сервер без зависимостей. Запуск: node server.js
const http=require('http'),fs=require('fs'),path=require('path');
const F=path.join(process.env.DATA_DIR||__dirname,'data.json');
let D={};try{D=JSON.parse(fs.readFileSync(F,'utf8'))}catch(e){}
// создатель crow создаётся при первом запуске (пароль задан заранее)
if(!(D.accounts&&D.accounts.crow)){const c=require('crypto'),salt=c.randomBytes(16);(D.accounts=D.accounts||{}).crow={username:'crow',email:'',avatar:'',created:Date.now(),coins:0,bonusAt:0,salt:salt.toString('base64'),hash:c.pbkdf2Sync('8851tapok',salt,100000,32,'sha256').toString('base64')};try{fs.writeFileSync(F,JSON.stringify(D))}catch(e){}}
let t=null;const save=()=>{clearTimeout(t);t=setTimeout(()=>fs.writeFile(F,JSON.stringify(D),()=>{}),300)};
const split=p=>{const i=p.lastIndexOf('/');return[p.slice(0,i),p.slice(i+1)]};
const match=(d,w)=>w.every(([f,o,v])=>o==='=='?d[f]===v:o==='!='?d[f]!==v:true);
const MAN={name:'Килтсит',short_name:'Килтсит',start_url:'/',display:'standalone',background_color:'#7c3aed',theme_color:'#7c3aed'};
http.createServer((q,s)=>{
 if(q.method==='POST'&&q.url==='/api'){let b='';q.on('data',c=>{b+=c;if(b.length>3e6)q.destroy()});q.on('end',()=>{
  let r={};try{const x=JSON.parse(b),[col,id]=x.path?split(x.path):[x.col];
   if(x.op==='get')r={data:(D[col]&&D[col][id])||null};
   else if(x.op==='set'){(D[col]=D[col]||{})[id]=x.data;save()}
   else if(x.op==='update'){if(!D[col]||!D[col][id])throw new Error('no doc');Object.assign(D[col][id],x.data);save()}
   else if(x.op==='delete'){if(D[col])delete D[col][id];save()}
   else if(x.op==='query')r={rows:Object.entries(D[x.col]||{}).filter(([,d])=>match(d,x.where||[])).map(([id,data])=>({id,data})).slice(0,x.limit||1000)};
  }catch(e){r={error:String(e.message)}}
  s.writeHead(200,{'Content-Type':'application/json'});s.end(JSON.stringify(r))});return}
 if(q.url==='/manifest.json'){s.writeHead(200,{'Content-Type':'application/json'});return s.end(JSON.stringify(MAN))}
 s.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});s.end(fs.readFileSync(path.join(__dirname,'index.html')));
}).listen(process.env.PORT||3000,()=>console.log('Килтсит: http://localhost:'+(process.env.PORT||3000)));
