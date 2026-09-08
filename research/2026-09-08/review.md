# Redakčná kontrola vydania 8. septembra 2026

- Posledná publikovaná uzávierka: 2026-08-03T20:11:47Z, overený HEAD aj origin/main 975c3ba.
- Nové obdobie: 2026-08-04T00:00:00Z – 2026-09-08T14:19:28Z.
- Tri samostatné výskumné vetvy: military, politics, economy. Súbory `*-events.json` a `*-draft.md` sú pracovné návrhy vetiev, nie autoritatívne dáta vydania. Hlavný agent ich zjednotil v koreňovom events.json; typy zdrojov, číselné záznamy, aktéri a dôkazné formulácie boli pri integrácii spresnené. Čas prístupu v nových finálnych záznamoch označuje dokončenie výskumnej dávky.
- Materialita: 17 nových udalostí (6 vojenských, 5 politických, 6 ekonomických). Databáza má 60 udalostí a 117 zdrojových záznamov. Pôvodných 43 udalostí zostalo obsahovo nezmenených ako historický kontext, nie ako nové aktuálne overenie.
- Aktuálna syntéza má 7 trendov. Staršie trendové hodnotenia zostávajú v starších vydaniach. Augustové zotavenie Levada koriguje jednoduchý príbeh nepretržitého poklesu.
- Hlavný článok má približne 2 535 slov, 11 kapitol a odkazy na udalosti v každom odseku. Inkrementálne obdobie je oddelené od aprílového historického zlomu.
- Politická a ekonomická vetva dodatočne skontrolovali článok. Doplnený zdroj kabinetu k menovaniam; nejasná „dlhšia splatnosť“ nahradená konkrétnou hodnotou 13,06 roka.
- Územné kategórie, kumulatívne oznámenia, ministerské údaje, anonymný odhad výroby a návrh platby sú výslovne odlíšené. Priame odkazy sú v udalostiach a samostatných poznámkach. Žiadne živé taktické súradnice alebo návody na útok.

## Overenie

Vykonané: `npm run build`, `npm run archive`, `npm run verify`, `npm run stage`, `npm run test:browser`. Statická kontrola prešla. Po oprave resetu filtrov prešlo všetkých 8 prehliadačových testov vrátane 320, 768 a 1 440 px, tlače a archívnej navigácie. Navyše samostatné HTML cez file:// zobrazilo všetkých 60 udalostí; prioritné karty patrili novému obdobiu. Vizuálne skontrolovaný desktop a mobilný článok.

Pri prvom prehliadačovom behu sa odhalilo, že reset používal začiatok analytického obdobia namiesto východiskového rozsahu celej databázy. Aktuálna šablóna teraz obnovuje defaultValue vstupov. Analytický obsah archívnej snímky je totožný; jej pôvodný JavaScript nebol spätne menený a reset v nej zostáva obmedzený na nové obdobie. Ide o jediný rozdiel aktuálneho HTML oproti novej archívnej snímke.

Všetkých 15 súborov troch predchádzajúcich vydaní bolo porovnaných s HEAD bez obsahových zmien. Schéma polí udalostí a existujúce udalosti boli samostatne porovnané s publikovanou databázou. Všetky súvisiace ID existujú. `git diff --check` upozornil iba na koncový prázdny riadok economy.md; nemenná analytická snímka sa kvôli tomuto formátovaniu neprepisovala.

Nové vydanie je návrh vo vetve update/2026-09-08. Publikovanie vyžaduje výslovné potvrdenie používateľa.
