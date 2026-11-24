import { strict as assert } from 'node:assert';
import { after, before, test } from 'node:test';
import { createServer } from 'node:http';
import handler from '../api/gemini.mjs';

const clientFetch = globalThis.fetch;
const server = createServer(handler);
let endpoint, reserve, generate, quotaCalls, providerCalls, capturedCommand, providerPayload;
const scores = Object.fromEntries(['Reporting process and capability','Strategy and value','People and culture','Technology and data','ESG Data Governance'].map(s=>[s,50]));
const readings = {businessName:'Private company',timeFrameStart:'2026-01-01',timeFrameEnd:'2026-01-31',
  carbonFootprint:100,energyConsumption:130,waterUsage:1000,supplyChainEmissions:210,renewableEnergyMix:18,
  wasteDiversionRate:87,employeeEngagement:70,sustainableProcurement:20};
const original = Object.fromEntries(['GEMINI_API_KEY','VERCEL','VERCEL_OIDC_TOKEN','POSTGRES_URL_POSTGRES_URL'].map(key=>[key,process.env[key]]));
const post = (body, options={}) => clientFetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body),...options});
const upstream = content => Response.json({choices:[{finish_reason:'stop',message:{content}}]});
const pgReply = value => Response.json({fields:[{name:'retry_after',dataTypeID:23}],rows:[[String(value)]],rowCount:1,command:'SELECT'});
function reset() {
  reserve=()=>pgReply(0);
  generate=()=>upstream('A specific measured finding.');
  quotaCalls=0;
  providerCalls=0;
}
before(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  endpoint='http://127.0.0.1:'+server.address().port+'/api/gemini';
  process.env.POSTGRES_URL_POSTGRES_URL='postgresql://tester:test@ep-quota.us-east-2.aws.neon.tech/test';
  process.env.VERCEL='1';
  delete process.env.GEMINI_API_KEY;
  process.env.VERCEL_OIDC_TOKEN='test-oidc';
  globalThis.fetch=async(url,options)=>{
    if(new URL(url).hostname.endsWith('.neon.tech')){quotaCalls++;capturedCommand=JSON.parse(options.body);return reserve();}
    providerCalls++;
    providerPayload={url,body:JSON.parse(options.body),auth:options.headers.Authorization};
    return generate();
  };
});
after(async()=>{
  globalThis.fetch=clientFetch;
  for(const [key,val] of Object.entries(original)) {if(val===undefined)delete process.env[key];else process.env[key]=val;}
  await new Promise(resolve=>server.close(resolve));
});
test('registered report uses only the server credential, strips the company name and returns isolated text',async()=>{
  reset();const r=await post({operation:'report',data:readings},{headers:{'content-type':'application/json','x-vercel-oidc-token':'fresh-request-identity'}});
  assert.equal(r.status,200);assert.deepEqual(await r.json(),{result:'A specific measured finding.'});
  assert.equal(r.headers.get('cache-control'),'no-store');
  assert.equal(providerPayload.auth,'Bearer fresh-request-identity');
  assert.equal(providerPayload.body.model,'google/gemini-2.5-flash-lite');
  assert.ok(!JSON.stringify(providerPayload.body).includes('Private company'));
  assert.match(providerPayload.body.messages[1].content,/supplyChainEmissions/);
  assert.equal(quotaCalls,1);assert.equal(providerCalls,1);assert.match(capturedCommand.query,/impactsphere_ai\.reserve/);assert.ok(Number(capturedCommand.params[0])>=1);
});
test('bad inputs end before a reservation or a model request',async()=>{
  reset();
  const bad=[{operation:'unknown'},{operation:'report',data:{...readings,renewableEnergyMix:100.1}},
    {operation:'report',data:{...readings,timeFrameEnd:'2026-02-30'}},{operation:'assessment',scores:{other:30}},
    {operation:'playbook',category:'unsupported'},{operation:'initiatives',prompt:'arbitrary instructions'}];
  for(const input of bad)assert.equal((await post(input)).status,400);
  assert.equal((await post({operation:'report',data:'x'.repeat(4100)})).status,413);
  assert.equal((await post({}, {headers:{'content-type':'text/plain'}})).status,415);
  assert.equal((await post({operation:'initiatives'},{headers:{'content-type':'application/json',origin:'https://other.invalid'}})).status,403);
  assert.equal((await clientFetch(endpoint)).status,405);assert.equal(quotaCalls,0);assert.equal(providerCalls,0);
});
test('concurrent generic prompts share a single upstream call, retries recover after outage',async()=>{
  reset();generate=()=>upstream('not json');
  assert.equal((await post({operation:'initiatives'})).status,503);assert.equal(providerCalls,1);
  const items=Array.from({length:3},(_,i)=>({title:'Idea '+i,description:'Check the measured activity.',difficulty:'Low'}));
  generate=async()=>{await new Promise(r=>setTimeout(r,15));return upstream(JSON.stringify({items}));};
  const replies=await Promise.all(Array.from({length:12},()=>post({operation:'initiatives'})));
  for(const r of replies){assert.equal(r.status,200);assert.deepEqual((await r.json()).result,items);}
  assert.equal(providerCalls,2);assert.equal(quotaCalls,2);
});
test('quota failures are closed and distinctly retryable without revealing provider details',async()=>{
  reset();
  for(const n of [1,60,86400]){
    reserve=()=>pgReply(n);
    const r=await post({operation:'assessment',scores});
    assert.equal(r.status,429);assert.ok(Number(r.headers.get('retry-after'))>=1);
  }
  reserve=()=>Response.json({error:'private quota details'});
  assert.equal((await post({operation:'assessment',scores})).status,503);
  assert.equal(providerCalls,0);
  reserve=()=>pgReply(0);
  generate=()=>new Response('private model failure',{status:500});
  const r=await post({operation:'assessment',scores});assert.equal(r.status,503);assert.doesNotMatch(await r.text(),/private model failure|test-oidc/);
  generate=()=>upstream('Recovered recommendations.');
  assert.equal((await post({operation:'assessment',scores})).status,200);
});
test('dedicated Google credential calls only the Google endpoint and supports structured playbook results',async()=>{
  reset();process.env.GEMINI_API_KEY='test-dedicated-google-key';
  try{
    const items=Array.from({length:4},(_,i)=>({title:'Entry '+i,description:'One practical example.',tags:['ESG','Energy']}));
    generate=()=>upstream(JSON.stringify({items}));
    const r=await post({operation:'playbook',category:'ESG Value Drivers'});assert.equal(r.status,200);
    assert.deepEqual((await r.json()).result,items);
    assert.equal(providerPayload.url,'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions');
    assert.equal(providerPayload.body.model,'gemini-2.5-flash-lite');assert.equal(providerPayload.auth,'Bearer test-dedicated-google-key');
  }finally{delete process.env.GEMINI_API_KEY;}
});
test('no credential fails before quota and leaves unrelated requests available',async()=>{
  reset();delete process.env.VERCEL_OIDC_TOKEN;
  try{assert.equal((await post({operation:'assessment',scores})).status,503);assert.equal(quotaCalls,0);}
  finally{process.env.VERCEL_OIDC_TOKEN='test-oidc';}
});
