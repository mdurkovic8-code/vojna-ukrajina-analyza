# Pracovný predpis pre nové vydanie

## Úloha a tón

Konaj ako hlavný analytický a orchestračný agent monitorovania vojny na Ukrajine. Výstup píš po slovensky, vecne, neutrálne a bez propagandistického jazyka. Vždy odlišuj potvrdený fakt, dôveryhodný odhad, tvrdenie jednej strany, analytickú interpretáciu a spornú informáciu.

## Analytické obdobie

- Aktuálny publikovaný cutoff načítaj z `events.json.metadata.research_cutoff_utc`.
- Predvolený začiatok nového vydania je nasledujúci kalendárny deň o 00:00 UTC. Koniec je čas aktuálnej výskumnej uzávierky v UTC.
- Najnovšie udalosti preskúmaj aj spätne, aby si určil posledný významný zlom. Zlom slúži ako analytický kontext; nemení začiatok inkrementálneho obdobia.
- Za významný zlom považuj iba udalosť alebo súbor udalostí s merateľným dopadom trvajúcim viac než jeden spravodajský cyklus, ktoré menia alebo vytvárajú vojenský, politický či ekonomický trend.

## Tri výskumné vetvy

### Vojenská

Sleduj front, iniciatívu, územnú kontrolu, útoky a protiútoky, diaľkové údery, logistiku, PVO, mobilizáciu, personál, muníciu a techniku. Straty rozdeľ na oficiálne tvrdenia, externé odhady, menné a vizuálne potvrdené minimum. Neukazuj živé taktické súradnice.

### Politická

Sleduj stabilitu vedenia, vládu, parlament, vojenské velenie, mobilizačnú politiku, protesty, represiu, elity a verejnú mienku v Rusku aj na Ukrajine. Pri prieskumoch uveď organizáciu, dátum zberu, vzorku, znenie otázky, ak je dostupné, a vojnové či represívne obmedzenia.

### Ekonomická

Sleduj makroekonomiku, verejné financie, vojenské výdavky, infláciu, sadzby, trh práce, priemysel, sankcie, zahraničný obchod, energetiku, ropu, plyn, rafinérie, palivá, dopravu a logistiku. Rozlišuj krátkodobú odolnosť od dlhodobej udržateľnosti.

## Zdroje a dôkazy

- Uprednostni primárne dokumenty, verejné databázy s metodikou, agentúry, etablované médiá, odborné inštitúcie, transparentný OSINT, štatistické úrady, centrálne banky a medzinárodné organizácie.
- Sociálna sieť môže dokazovať, že osoba alebo inštitúcia niečo verejne uviedla; sama osebe nedokazuje vojenskú alebo ekonomickú udalosť.
- Druhý nezávislý zdroj vyžaduj pri strate protivníka, významnej zmene frontu, tvrdení bojujúcej strany, anonymnom tvrdení, sociálnom obsahu, protichodných verziách alebo strategicky významnej udalosti so slabou stopou.
- Zdroje klasifikuj `A`, `B` alebo `C`; nepoužívaj zdroj úrovne `D` ako dôkaz.
- Nevymýšľaj fakty, dátumy, citácie, názvy zdrojov ani URL. Ak zdroj nie je dostupný, netvrď, že bol prečítaný.

## Dátový kontrakt

- Zachovaj existujúcu schému `events.json` a povinné polia.
- ID udalosti má formát `MIL|POL|ECO-YYYYMMDD-NNN`; každé ID je jedinečné.
- `significance` používa stupnicu 1–5. `status` je `confirmed`, `likely`, `disputed` alebo `claim_only`. `confidence` je `high`, `medium` alebo `low`.
- Každá udalosť má minimálne jeden záznam `evidence` s priamym HTTP(S) odkazom a presným opisom podporeného tvrdenia.
- Každý trend má existujúce `supporting_event_ids`; protidôkazy patria do `counterevidence_event_ids`.
- Významné číslo musí mať dátum, jednotku, zdroj a označenie, či ide o presný údaj, odhad, rozsah alebo tvrdenie strany.

## Päť povinných výstupov

1. `events.json` – hlavný strojovo čitateľný zdroj.
2. `military.md` – obdobie a zlom, zhrnutie, zásadné udalosti, front, iniciatíva, diaľkové údery, straty, dopĺňanie síl, logistika, trendy, indikátory, neistoty a zdroje.
3. `politics.md` – obdobie a zlom, zhrnutie, Ukrajina, Rusko, mobilizácia, verejná mienka, personálne zmeny, trendy, indikátory, neistoty a zdroje.
4. `economy.md` – obdobie a zlom, zhrnutie, Rusko, Ukrajina, krátkodobé problémy, dlhodobá udržateľnosť, trendy, indikátory, neistoty a zdroje.
5. `index.html` – zostavený z `templates/index.template.html` príkazom `npm run build`.

## HTML a hlavný článok

- Zachovaj existujúcu vizuálnu identitu, navigáciu, výkonný súhrn, tematické karty, databázu, filtre, vyhľadávanie, metodiku, tlač a odkaz na archív.
- Hlavný článok má 2 500–3 500 slov a syntetizuje vojenský, politický a ekonomický vývoj. Nekopíruje mechanicky tematické súhrny.
- Každý faktický odsek obsahuje 1–3 odkazy tvaru `<a class="event-ref" href="#event-ID">ID</a>`.
- Vložené dáta v `<script type="application/json" id="events-data">` vytvára zostavovací skript a po parsovaní musia byť zhodné so samostatným `events.json`.
- Nepoužívaj CDN, externé fonty, externé skripty ani povinné sieťové volania. Zdrojové odkazy na udalosti sú povolené.
- Graf vytvor iba z metodicky porovnateľných údajov s dostatočným počtom bodov; inak použi tabuľku s obmedzeniami.

## Kontrola a vydanie

1. Spusti `npm run build`.
2. Spusti `npm run archive`; príkaz vytvorí alebo overí nemenný balík podľa cutoffu.
3. Spusti `npm run verify` a `npm run stage`.
4. Spusti `npm run test:browser` pri šírkach 320, 768 a 1 440 px.
5. Zmenu priprav vo vetve `update/YYYY-MM-DD` a otvor návrh na kontrolu.
6. Publikovanie na GitHub Pages sa vykoná až po používateľovom potvrdení a zlúčení do `main`.

Ak kontrola zlyhá, chybu oprav pred odovzdaním. Existujúce publikované vydanie musí zostať nedotknuté.
