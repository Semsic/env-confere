# env-confere

Confere se o seu `.env` tem as mesmas chaves do `.env.example` e aponta o que falta ou sobrou. Os valores são segredo; a ferramenta compara nomes e deixa o conteúdo quietinho no canto dele.

## Requisitos

Node.js 18 ou mais recente. Sem dependências externas.

## Uso

```bash
node src/cli.js
node src/cli.js --example config/.env.example --env .env.local
```

O comando usa `.env.example` e `.env` na pasta atual por padrão. Comentários e linhas vazias são ignorados. O parser entende `CHAVE=valor`, espaços ao redor da chave e valores entre aspas; não executa interpolação nem comandos shell (e nem deve, né).

## Códigos de saída

- `0`: as chaves conferem.
- `1`: faltam chaves no arquivo de ambiente ou há chaves extras.
- `2`: erro de argumento ou arquivo inexistente.

## Limites

Não é um parser completo de todos os dialetos dotenv. Ele só compara nomes de variáveis e não valida se os valores são válidos para a aplicação.

## Licença

MIT. Consulte [LICENSE](LICENSE).
