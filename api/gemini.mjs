import { neon } from '@neondatabase/serverless';
import { createHmac } from 'node:crypto';

const MODEL = 'gemini-2.5-flash-lite';
const MAX_BODY = 4096;
const categories = ['ESG Value Drivers', 'Overcoming Challenges', 'Data Readiness Framework', 'Industry Use Cases'];
const scoreNames = ['Reporting process and capability', 'Strategy and value', 'People and culture', 'Technology and data', 'ESG Data Governance'];
const amounts = ['carbonFootprint', 'energyConsumption', 'waterUsage', 'supplyChainEmissions'];
const percentages = ['renewableEnergyMix', 'wasteDiversionRate', 'employeeEngagement', 'sustainableProcurement'];
const publicExamples = new Map(); // Only five fixed, non-personal educational prompts can enter this cache.
const unavailable = 'AI is temporarily unavailable. Please try again later.';

function fail(status, message) {
  throw Object.assign(new Error(message), { status });
}
function keysMatch(value, keys) {
  return value && typeof value === 'object' && !Array.isArray(value) &&
    Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));
}
function number(value, max) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= max;
}
function validDate(date) {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const ms = Date.parse(date);
  return Number.isFinite(ms) && new Date(ms).toISOString().startsWith(date);
}
function validMetrics(data) {
  return keysMatch(data, ['businessName', 'timeFrameStart', 'timeFrameEnd', ...amounts, ...percentages]) &&
    typeof data.businessName === 'string' && data.businessName.length <= 256 &&
    validDate(data.timeFrameStart) && validDate(data.timeFrameEnd) && data.timeFrameStart <= data.timeFrameEnd &&
    amounts.every(key => number(data[key], Number.MAX_SAFE_INTEGER)) && percentages.every(key => number(data[key], 100));
}
function task(input) {
  const op = input?.operation;
  if (op === 'initiatives' && keysMatch(input, ['operation'])) {
    return { cacheKey: op, instruction: 'Suggest three practical ESG initiatives. Give each a title, description and difficulty of Low, Medium or High. Return a JSON object containing an items array.' };
  }
  if (op === 'playbook' && keysMatch(input, ['operation','category']) && categories.includes(input.category)) {
    return { cacheKey: input.category, instruction: 'Write four distinct practical ESG playbook entries about ' + input.category + '. Give each a title, a short useful description and a tags array with 2 to 4 keywords. Return a JSON object containing an items array.' };
  }
  if (op === 'assessment' && keysMatch(input, ['operation','scores']) && keysMatch(input.scores, scoreNames) &&
      scoreNames.every(key => number(input.scores[key], 100))) {
    return { instruction: 'Use the five checklist scores out of 100 to describe relative strengths and give three practical next steps starting with the weakest category.', data: input.scores };
  }
  if ((op === 'report' || op === 'analysis') && validMetrics(input.data)) {
    // The company name stays in the local report. Gemini only needs the period and measurements.
    const { businessName, ...metrics } = input.data;
    if (op === 'report' && keysMatch(input, ['operation','data'])) {
      return { instruction: 'Describe the supplied reporting period in two short paragraphs. Interpret the numbers without claiming changes over time. Use tCO2e for emissions, MWh for energy, cubic metres for water, and percentages for the remaining measures.', data: metrics };
    }
    const refs = [...amounts, ...percentages.slice(0, 2)];
    if (op === 'analysis' && keysMatch(input, ['operation','data','averages']) && keysMatch(input.averages, refs) &&
        refs.every(key => number(input.averages[key], percentages.includes(key) ? 100 : Number.MAX_SAFE_INTEGER))) {
      return { instruction: 'Give three concise suggestions based on these entered metrics and illustrative reference values. Label the comparisons as illustrative. They do not represent verified industry averages or actual historical performance.', data: { metrics, illustrativeReference: input.averages } };
    }
  }
  fail(400, 'Check the request and its measurements.');
}
async function inputJson(req) {
  if (Number(req.headers['content-length']) > MAX_BODY) fail(413, 'Request is too large.');
  let body = req.body;
  if (body === undefined) {
    const chunks = [];
    let bytes = 0;
    for await (const chunk of req) {
      const buf = Buffer.from(chunk);
      if ((bytes += buf.length) > MAX_BODY) fail(413, 'Request is too large.');
      chunks.push(buf);
    }
    body = Buffer.concat(chunks);
  }
  if (Buffer.isBuffer(body)) body = body.toString('utf8');
  const raw = typeof body === 'string' ? body : JSON.stringify(body);
  if (Buffer.byteLength(raw || '') > MAX_BODY) fail(413, 'Request is too large.');
  try { return JSON.parse(raw); } catch { fail(400, 'Send a valid JSON request.'); }
}

// Check both limits before writing either. Failed or timed-out model attempts retain
// their slot, because the upstream might already have processed the request.
async function reserve(req) {
  const connection = process.env.POSTGRES_URL_POSTGRES_URL;
  if (!connection) fail(503, unavailable);
  const ip = process.env.VERCEL === '1' ? req.headers['x-vercel-forwarded-for'] || 'unknown' : req.socket?.remoteAddress || 'local';
  const slot = 1 + createHmac('sha256', connection).update(String(ip)).digest().readUInt16BE(0);
  const sql = neon(connection, {fetchOptions:{signal:AbortSignal.timeout(6000), redirect:'error'}});
  const [row] = await sql`SELECT impactsphere_ai.reserve(${slot}::integer) AS retry_after`;
  const retry = row?.retry_after;
  if (!Number.isInteger(retry) || retry < 0 || retry > 86400) fail(503, unavailable);
  if (retry > 0) {
    throw Object.assign(new Error('The AI request limit has been reached. Please try again later.'), {status:429, retry});
  }
}
function validatedResult(text, op) {
  const within = (s,limit) => typeof s === 'string' && s.trim().length > 0 && s.length <= limit;
  if (!within(text, 12000)) fail(503, unavailable);
  if (op !== 'playbook' && op !== 'initiatives') return text.trim();
  const {items} = JSON.parse(text);
  if (!Array.isArray(items) || items.length !== (op==='playbook' ? 4 : 3)) fail(503, unavailable);
  return items.map(item => {
    if (!within(item?.title, 180) || !within(item.description, 3500)) fail(503, unavailable);
    const {title,description} = item;
    if (op === 'initiatives' && ['Low','Medium','High'].includes(item.difficulty)) return {title,description,difficulty:item.difficulty};
    if (op === 'playbook' && Array.isArray(item.tags) && item.tags.length >= 2 && item.tags.length <= 4 && item.tags.every(t => within(t,80))) {
      return {title,description,tags:item.tags};
    }
    fail(503, unavailable);
  });
}
async function generate(req, op, {instruction, data, cacheKey}) {
  const directKey = process.env.GEMINI_API_KEY;
  const oidc = (process.env.VERCEL === '1' && req.headers['x-vercel-oidc-token']) || process.env.VERCEL_OIDC_TOKEN;
  const token = directKey || oidc;
  if (!token) fail(503, unavailable);
  await reserve(req);
  const messages = [{role:'system',content:'You are ImpactSphere’s sustainability assistant. Give practical answers from the provided measurements. Do not invent company facts, dates, historical changes, citations or industry benchmarks.'},
    {role:'user',content: data ? instruction+'\n'+JSON.stringify(data) : instruction}];
  const response = await fetch(directKey ? 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions' :
    'https://ai-gateway.vercel.sh/v1/chat/completions', {method:'POST',redirect:'error',signal:AbortSignal.timeout(16000),
    headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'}, body:JSON.stringify({
      model:(directKey ? '' : 'google/') + MODEL, messages, max_tokens:1400,
      ...(cacheKey ? {response_format:{type:'json_object'}} : {}),
    })});
  if (!response.ok) { await response.body?.cancel(); fail(503, unavailable); }
  const {choices} = await response.json();
  if (choices?.[0]?.finish_reason !== 'stop') fail(503, unavailable);
  return validatedResult(choices[0].message?.content, op);
}
export default async function handler(req, res) {
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','no-store');
  try {
    if (req.method !== 'POST') { res.setHeader('Allow','POST'); fail(405,'Use POST.'); }
    if (req.headers.origin && new URL(req.headers.origin).host !== req.headers.host) fail(403,'Request origin is not allowed.');
    if (req.headers['content-type']?.split(';')[0].toLowerCase() !== 'application/json') fail(415,'Send JSON.');
    const input = await inputJson(req);
    const job = task(input);
    let result;
    const cached = publicExamples.get(job.cacheKey);
    if (cached && cached.expires > Date.now()) {
      result = await cached.promise;
    } else {
      const promise = generate(req, input.operation, job);
      if (job.cacheKey) publicExamples.set(job.cacheKey, {promise,expires:Date.now()+3600000});
      try { result = await promise; } catch (error) { if (job.cacheKey) publicExamples.delete(job.cacheKey); throw error; }
    }
    res.statusCode = 200;
    res.end(JSON.stringify({result}));
  } catch (error) {
    res.statusCode = [400,403,405,413,415,429].includes(error.status) ? error.status : 503;
    if (error.retry) res.setHeader('Retry-After',String(error.retry));
    res.end(JSON.stringify({error:res.statusCode === 503 ? unavailable : error.message}));
  }
}
