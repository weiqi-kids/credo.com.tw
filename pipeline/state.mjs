// 去重狀態：seen-jids（第 1 層）＋ 爭點簽名（第 2 層）
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { PATHS, SIGNATURE_WINDOW_DAYS } from './config.mjs';

function load(p, fallback) {
  try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return fallback; }
}
function save(p, data) {
  mkdirSync(path.dirname(p), { recursive: true });
  writeFileSync(p, JSON.stringify(data, null, 1));
}

export function loadSeen() { return new Set(load(PATHS.seen, [])); }
export function saveSeen(set) { save(PATHS.seen, [...set]); }

export function loadSignatures() { return load(PATHS.signatures, []); }
export function saveSignatures(list) { save(PATHS.signatures, list); }

// 簽名＝topic＋案由＋當事人代號組（判決 JFULL 開頭的上訴人/被上訴人段落 hash 太脆弱，
// 用 topic+案由+法院層級前綴，同案不同審級的案由與當事人幾乎不變）
export function signatureOf(rule, doc) {
  const title = (doc.JTITLE || '').trim();
  return `${rule.topic}|${title}`;
}

export function isDuplicateSignature(signatures, sig, today) {
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() - SIGNATURE_WINDOW_DAYS);
  return signatures.some((s) => s.sig === sig && new Date(s.date) >= cutoff);
}
