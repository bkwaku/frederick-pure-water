import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('./render-dist/', import.meta.url));
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp','.ico':'image/x-icon'};
const attempts = new Map();
setInterval(()=>{for(const [key,v] of attempts) if(v.until<Date.now()) attempts.delete(key)},60000).unref();
const json=(res,code,body)=>{res.writeHead(code,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(body));};
export async function handleConsultation(data, env=process.env, fetcher=fetch) {
 if(!data || typeof data!=='object' || Array.isArray(data)) return [400,{error:'Invalid request'}];
 if(data.website) return [400,{error:'Invalid request'}];
 const fields=['name','email','phone','address','source','message'];
 if(fields.some(k=>data[k]!==undefined && typeof data[k]!=='string')) return [400,{error:'Invalid fields'}];
 if(!data.name?.trim() || data.name.length>120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email??'') || data.email.length>254 || !/^[+\d\s().-]{7,30}$/.test(data.phone??'') || (data.phone.match(/\d/g)||[]).length<7 || !data.address?.trim() || data.address.length>250 || !['City water','Private well','Not sure'].includes(data.source) || (data.message?.length??0)>2000) return [400,{error:'Please check your details'}];
 if(!env.RESEND_API_KEY || !env.LEAD_FROM_EMAIL) return [503,{error:'Email delivery is not configured. Please email contact@frederickpurewater.com.'}];
 try {
 const response = await fetcher('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json'},signal:AbortSignal.timeout(15000),body:JSON.stringify({from:env.LEAD_FROM_EMAIL,to:['contact@frederickpurewater.com'],reply_to:data.email,subject:'New Frederick Pure Water consultation request',text:fields.map(k=>`${k}: ${data[k]??''}`).join('\n\n')})});
 if(!response.ok) return [502,{error:'Email delivery failed'}];
 const result=await response.json();
 if(!result.id) return [502,{error:'Email delivery was not confirmed'}];
 return [200,{ok:true}];
 } catch { return [502,{error:'Email delivery failed'}]; }
}
export const server = http.createServer(async(req,res)=>{
 res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');res.setHeader('X-Frame-Options','DENY');
 let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{return json(res,400,{error:'Invalid URL'})}
 if(pathname==='/health') return json(res,200,{ok:true});
 if(pathname==='/api/consultation'){
 if(req.method!=='POST') return json(res,405,{error:'Method not allowed'});
 if(!req.headers['content-type']?.startsWith('application/json')) return json(res,415,{error:'Expected JSON'});
 if(req.headers.origin){try{const origin=new URL(req.headers.origin);if(origin.host!==req.headers.host && origin.origin!==process.env.DEV_ORIGIN) return json(res,403,{error:'Invalid origin'})}catch{return json(res,403,{error:'Invalid origin'})}}
 // Render sets the connecting client in x-forwarded-for. Use the rightmost entry at this single trusted proxy boundary.
 const ip = process.env.RENDER ? String(req.headers['x-forwarded-for']??req.socket.remoteAddress).split(',').at(-1).trim() : req.socket.remoteAddress;
 const rate=attempts.get(ip)??{count:0,until:Date.now()+600000};if(rate.until<Date.now()){rate.count=0;rate.until=Date.now()+600000}rate.count++;attempts.set(ip,rate);if(rate.count>5)return json(res,429,{error:'Please wait before trying again'});
 let raw='';try{for await(const chunk of req){raw+=chunk;if(Buffer.byteLength(raw)>16384)return json(res,413,{error:'Request too large'})}const [code,body]=await handleConsultation(JSON.parse(raw));return json(res,code,body)}catch{return json(res,400,{error:'Invalid request'})}
 }
 if(!['GET','HEAD'].includes(req.method))return json(res,405,{error:'Method not allowed'});
 const path=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
 if(!path.startsWith(root.endsWith(sep)?root:root+sep))return json(res,403,{error:'Forbidden'});
 try{const body=await readFile(path);res.writeHead(200,{'Content-Type':types[extname(path)]??'application/octet-stream','Cache-Control':pathname.startsWith('/assets/')?'public, max-age=31536000, immutable':'no-cache'});res.end(req.method==='HEAD'?undefined:body)}catch{return json(res,404,{error:'Not found'})}
});
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url))server.listen(Number(process.env.PORT??3001),'0.0.0.0',()=>console.log(`Frederick Pure Water running on port ${process.env.PORT??3001}`));
