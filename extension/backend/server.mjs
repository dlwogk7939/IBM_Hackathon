/**
 * Install dependencies:
 *   npm install
 *
 * Provide credentials:
 *   Option 1) Put apikey.json in this folder with shape:
 *     { "apikey": "your_ibm_cloud_api_key" }
 *   Option 2) Set the environment variable:
 *     export IBM_API_KEY="your_ibm_cloud_api_key"
 *
 * Run the server:
 *   npm start
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import express from 'express';

const PORT = 3000;
const IAM_TOKEN_URL = 'https://iam.cloud.ibm.com/identity/token';
const WATSONX_URL =
  'https://us-south.ml.cloud.ibm.com/ml/v1/text/chat?version=2023-05-29';
const MODEL_ID = 'ibm/granite-8b-code-instruct';
const PROJECT_ID = 'ac1611f2-fe1c-47d3-a6e3-4b11ec44be53';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const API_KEY_FILE = path.join(__dirname, 'apikey.json');
let cachedIamToken = null;
let cachedIamTokenExpiresAt = 0;
const STUDY_LABEL = '0';
const OFF_TASK_LABEL = '1';
const OFF_TASK_HINTS = [
  'reddit',
  'amazon',
  'walmart',
  'target',
  'coupang',
  'ebay',
  'shopping',
  'shop',
  'store',
  'game',
  'games',
  'steam',
  'netflix',
  'twitch',
  'discord',
  'facebook',
  'twitter',
  'x.com',
  'instagram',
  'youtube',
  'tiktok'
];
const STUDY_HINTS = [
  '.edu',
  'canvas',
  'moodle',
  'blackboard',
  'coursera',
  'edx',
  'khanacademy',
  'scholar.google',
  'arxiv',
  'jstor',
  'overleaf',
  'docs.google',
  'drive.google',
  'notion'
];

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

function logBackend(message, details = {}) {
  const suffix =
    details && Object.keys(details).length > 0 ? ` ${JSON.stringify(details)}` : '';
  console.log(`[MaintAIn][backend] ${message}${suffix}`);
}

function buildMessages(domain) {
  return [
    {
      role: 'system',
      content:
        'You are an intelligent AI programming assistant, utilizing a Granite code language model developed by IBM. Your primary function is to assist users in programming tasks, including code generation, code explanation, code fixing, generating unit tests, generating documentation, application modernization, vulnerability detection, function calling, code translation, and all sorts of other software engineering tasks. You are a AI language model designed to function as a specialized Retrieval Augmented Generation (RAG) assistant. When generating responses, prioritize correctness, i.e., ensure that your response is correct given the context and user query, and that it is grounded in the context. Furthermore, make sure that the response is supported by the given document or context. Always make sure that your response is relevant to the question. If an explanation is needed, first provide the explanation or reasoning, and then give the final answer. Avoid repeating information unless asked.'
    },
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text:
            'You are a strict binary classifier for a study tracking system.\n\nLabel definition:\n0 = STUDY (education platforms, LMS, coding tools, documentation, academic sites)\n1 = OFF_TASK (shopping, social media, entertainment, gaming, news)\n\nRules:\n\nReturn EXACTLY one character: 0 or 1\n\nNo text\n\nNo explanation\n\nNo punctuation\n\nNo spaces\n\nDo not repeat the input\n\nClassify this domain: ' +
            domain
        }
      ]
    },
    {
      role: 'assistant',
      content: '0'
    }
  ];
}

function extractLabel(rawText) {
  const text = String(rawText ?? '').trim();
  const match = text.match(/[01]/);
  return match ? match[0] : null;
}

function extractChatText(data) {
  const choicesContent = data?.choices?.[0]?.message?.content;
  if (typeof choicesContent === 'string') {
    return choicesContent;
  }

  if (Array.isArray(choicesContent)) {
    const textPart = choicesContent.find((item) => item?.type === 'text' && typeof item.text === 'string');
    if (textPart) {
      return textPart.text;
    }
  }

  const resultsText = data?.results?.[0]?.generated_text;
  if (typeof resultsText === 'string') {
    return resultsText;
  }

  return '';
}

async function getApiKey() {
  try {
    const fileContents = await readFile(API_KEY_FILE, 'utf8');
    const parsed = JSON.parse(fileContents);
    const candidateKeys = [
      parsed?.apikey,
      parsed?.apiKey,
      parsed?.IBM_API_KEY,
      parsed?.credentials?.apikey,
      parsed?.credentials?.apiKey
    ];

    const fileApiKey =
      candidateKeys.find((value) => typeof value === 'string' && value.trim().length > 0)?.trim() ||
      '';

    if (fileApiKey) {
      return fileApiKey;
    }
  } catch {
    // Fall back to env var if file is missing or invalid.
  }

  const envApiKey = process.env.IBM_API_KEY?.trim();
  if (envApiKey) {
    return envApiKey;
  }

  throw new Error('missing_ibm_api_key');
}

function sanitizeDomain(domain) {
  const normalized = String(domain ?? '').trim().toLowerCase();
  if (!normalized) return '';
  if (/[/?#]/.test(normalized)) return '';
  if (!/^[a-z0-9.-]+$/.test(normalized)) return '';
  return normalized;
}

function heuristicClassifyDomain(domain) {
  if (!domain) return null;

  if (OFF_TASK_HINTS.some((hint) => domain.includes(hint))) {
    return OFF_TASK_LABEL;
  }

  if (domain.endsWith('.edu')) {
    return STUDY_LABEL;
  }

  if (STUDY_HINTS.some((hint) => domain.includes(hint))) {
    return STUDY_LABEL;
  }

  return null;
}

async function getIamAccessToken() {
  const now = Date.now();
  if (cachedIamToken && cachedIamTokenExpiresAt - now > 60_000) {
    logBackend('iam_token_cache_hit');
    return cachedIamToken;
  }

  const apiKey = await getApiKey();

  const body = new URLSearchParams({
    grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
    apikey: apiKey
  });

  const response = await fetch(IAM_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      Accept: 'application/json'
    },
    body: body.toString()
  });

  if (!response.ok) {
    const errorText = await response.text();
    logBackend('iam_token_error', { status: response.status, errorText });
    throw new Error(`iam_token_failed:${response.status}:${errorText}`);
  }

  const data = await response.json();
  if (!data?.access_token) {
    throw new Error('iam_token_missing');
  }

  const expiresInSec = Number(data.expires_in || 0);
  cachedIamToken = data.access_token;
  cachedIamTokenExpiresAt = now + Math.max(0, expiresInSec * 1000);
  logBackend('iam_token_success', { expiresInSec });

  return cachedIamToken;
}

async function classifyDomain(domain) {
  const heuristicLabel = heuristicClassifyDomain(domain);
  if (heuristicLabel) {
    logBackend('heuristic_classification', { domain, label: heuristicLabel });
    return heuristicLabel;
  }

  const accessToken = await getIamAccessToken();
  logBackend('watsonx_fetch_start', { domain, url: WATSONX_URL });

  const response = await fetch(WATSONX_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      messages: buildMessages(domain),
      project_id: PROJECT_ID,
      model_id: MODEL_ID,
      frequency_penalty: 0,
      max_tokens: 2000,
      presence_penalty: 0,
      temperature: 0,
      top_p: 1,
      seed: null,
      stop: []
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    logBackend('watsonx_fetch_error', { domain, status: response.status, errorText });
    throw new Error(`watsonx_generation_failed:${response.status}:${errorText}`);
  }

  const data = await response.json();
  const rawText = extractChatText(data);
  const label = extractLabel(rawText);
  logBackend('watsonx_fetch_success', { domain, rawText, label });

  if (!label) {
    throw new Error('invalid_model_output');
  }

  return label;
}

app.post('/classify', async (req, res) => {
  try {
    const domain = sanitizeDomain(req.body?.domain);
    logBackend('classify_request', { domain });
    if (!domain) {
      throw new Error('missing_domain');
    }

    const label = await classifyDomain(domain);
    logBackend('classify_response', { domain, label });
    res.json({ label });
  } catch (error) {
    console.error('classification_failed', error);
    res.status(500).json({ error: 'classification_failed' });
  }
});

app.listen(PORT, () => {
  console.log(`MaintAIn backend listening on port ${PORT}`);
});
