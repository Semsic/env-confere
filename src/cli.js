#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

function parseArgs(argv) {
  const options = { example: '.env.example', env: '.env' };
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    if (flag === '--help' || flag === '-h') return { help: true };
    if (flag !== '--example' && flag !== '--env') {
      throw new Error(`não conheço ${flag}; se foi sem querer, o terminal também faz cara de confuso`);
    }
    const value = argv[index + 1];
    if (!value || value.startsWith('--')) throw new Error(`faltou o caminho depois de ${flag}`);
    options[flag.slice(2)] = value;
    index += 1;
  }
  return options;
}

function keysFrom(text) {
  const keys = new Set();
  for (const [index, rawLine] of text.split(/\r?\n/).entries()) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const withoutExport = line.startsWith('export ') ? line.slice(7).trimStart() : line;
    const match = withoutExport.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=/);
    if (!match) throw new Error(`linha ${index + 1}: formato estranho; esperado CHAVE=valor`);
    keys.add(match[1]);
  }
  return keys;
}

async function readKeys(file) {
  try {
    return keysFrom(await readFile(resolve(file), 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') throw new Error(`não achei ${file}; confira o caminho antes de culpar o Node`);
    throw error;
  }
}

function report(expected, actual) {
  const missing = [...expected].filter((key) => !actual.has(key)).sort();
  const extra = [...actual].filter((key) => !expected.has(key)).sort();
  if (!missing.length && !extra.length) {
    console.log('Tudo certo: as chaves conferem. Os valores continuam fora de vista, como devem.');
    return 0;
  }
  if (missing.length) console.log(`Faltando no ambiente (${missing.length}):\n  ${missing.join('\n  ')}`);
  if (extra.length) console.log(`\nSó no arquivo de ambiente (${extra.length}):\n  ${extra.join('\n  ')}`);
  console.log('\nNenhum valor foi exibido. Segredo bom é segredo sem plateia.');
  return 1;
}

async function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
    if (options.help) {
      console.log('Uso: env-confere [--example .env.example] [--env .env]\nCompara nomes de chaves; nunca imprime os valores.');
      return 0;
    }
    const [expected, actual] = await Promise.all([readKeys(options.example), readKeys(options.env)]);
    return report(expected, actual);
  } catch (error) {
    console.error(`env-confere: ${error.message}`);
    return 2;
  }
}

process.exitCode = await main();
