<h1 align="center">Hakai 破壊</h1>

<p align="center">
  <img src="https://i.ytimg.com/vi/ER0JXV-nLoc/maxresdefault.jpg" alt="Bills dando Hakai em Zamasu" width="600">
</p>

<p align="center">
  <b>Apaga pastas e arquivos que o sistema não consegue remover — com estilo.</b>
</p>

<p align="center">
  <img src="docs/hakai.gif" alt="Animação Hakai no terminal" width="720">
</p>

---

## Por que existe

Em versões antigas do Node.js, as pastas do `node_modules` ficam com caminhos muito longos. No Windows, o sistema se recusa a apagar essas pastas. O Hakai resolve isso renomeando subpastas para caminhos curtos antes de removê-las.

## Recursos

- Remove arquivos e pastas com caminhos longos.
- Aceita um arquivo único ou uma pasta inteira.
- Animação de energia Hakai no terminal, com contador de itens destruídos.
- Sem animação quando a saída não é um terminal (pipes, logs e CI).

## Instalação

```bash
yarn global add hakai
```

## Uso

```bash
hakai "D:\Minha Pasta"
```

> Use aspas quando o caminho tiver espaços.

## Desenvolvimento

```bash
npm test
```

Os testes usam `node:test`, que já vem com o Node.js 18 ou superior.

---

<p align="center"><sub>Hakai é o poder de destruição de Beerus e Zamasu em Dragon Ball Super.</sub></p>
