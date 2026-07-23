# Projektové pravidlá: Vojna na Ukrajine

Tento projekt udržiava opakovateľnú analytickú správu v slovenčine. Pri požiadavke typu „Aktualizuj analýzu vojny na Ukrajine a priprav nové vydanie“ postupuj podľa `prompts/update-report.md`.

## Povinný tok aktualizácie

1. Načítaj poslednú úspešne publikovanú uzávierku z `events.json.metadata.research_cutoff_utc`.
2. Nové obdobie začína nasledujúci kalendárny deň o 00:00 UTC a končí výskumnou uzávierkou aktuálneho spustenia, ak používateľ neurčí inak.
3. Vykonaj nový webový výskum. Ak platforma podporuje subagentov, spusti tri oddelené vetvy: vojenskú, politickú a ekonomickú. Každá vetva musí mať vlastné poznámky a výstupy.
4. Hlavný agent zjednotí udalosti, odstráni duplicity, preverí rozpory a zachová rozdiel medzi faktom, odhadom, tvrdením strany a interpretáciou.
5. Aktualizuj päť povinných súborov: `events.json`, `military.md`, `politics.md`, `economy.md` a `index.html`.
6. Text stránky upravuj v `templates/index.template.html`. Potom spusti `npm run build`; výsledný `index.html` sa neupravuje ručne.
7. Spusti `npm run archive`, `npm run verify`, `npm run stage` a `npm run test:browser`.
8. Novú verziu priprav vo vetve `update/YYYY-MM-DD`. Nezlučuj ju do `main` a nezverejňuj bez výslovného potvrdenia používateľa.

## Nemenné pravidlá

- Schéma `events.json` sa nemení bez výslovnej požiadavky.
- Existujúce priečinky v `editions/` sú nemenné. Nikdy neopravuj staré vydanie na mieste; vytvor nové.
- Každá udalosť má aspoň jeden priamy zdroj. Sporné alebo stranové tvrdenie potrebuje druhý nezávislý zdroj alebo primerane zníženú istotu.
- Každý trend odkazuje iba na existujúce udalosti.
- Každý faktický odsek hlavného článku má 1–3 odkazy na udalosti. Článok má 2 500–3 500 slov.
- Nepoužívaj neporovnateľné údaje na vytváranie falošne presných súčtov alebo grafov.
- Výsledný HTML je UTF-8, responzívny, tlačiteľný a funguje bez externých knižníc alebo servera.
- Ak sa nenájde materiálna zmena, oznám „bez materiálnej zmeny“ a nevytváraj ani nepublikuj prázdne vydanie.
- Nikdy neuvádzaj živé taktické súradnice ani odporúčania použiteľné na plánovanie útoku.

Podrobná redakčná a dátová metodika je v `prompts/update-report.md`.
