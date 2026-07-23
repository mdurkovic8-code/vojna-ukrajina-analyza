# Vojna na Ukrajine – analytická databáza

Samostatná slovenská analytická stránka prepájajúca vojenský, politický a ekonomický vývoj. Najnovšie vydanie je v koreňových súboroch; schválené historické vydania sú nemenné v `editions/` a pri publikovaní sa zobrazia pod `/archive/`.

## Aktualizácia na požiadanie

V Codexe stačí napísať:

> Aktualizuj analýzu vojny na Ukrajine a priprav nové vydanie.

Codex načíta poslednú uzávierku, vykoná tri oddelené výskumné vetvy, pripraví nové vydanie, spustí kontroly a vytvorí zmenu na vaše schválenie. Podrobný postup je v `AGENTS.md` a `prompts/update-report.md`.

## Lokálna kontrola

Vyžaduje sa Node.js 20 alebo novší. Na Windows, kde PowerShell blokuje `npm.ps1`, používajte `npm.cmd`.

```powershell
npm.cmd install
npm.cmd run build
npm.cmd run archive
npm.cmd run verify
npm.cmd run stage
npm.cmd run test:browser
```

Výsledok pripravený pre GitHub Pages vznikne v priečinku `dist/`. Tento priečinok je generovaný a neukladá sa do repozitára.

## Verejné adresy

- `/` – najnovšie vydanie,
- `/archive/` – zoznam vydaní,
- `/archive/YYYY-MM-DD/` – nemenné historické vydanie.

Po pripojení verejného repozitára `vojna-ukrajina-analyza` bude predvolená adresa `https://<github-používateľ>.github.io/vojna-ukrajina-analyza/`.

## Publikovanie

Aktualizácia sa pripravuje vo vetve `update/YYYY-MM-DD`. Workflow `Kontrola vydania` blokuje neplatné dáta, poškodenú diakritiku, nezhodu vloženého JSON, chyby článku, nefunkčný JavaScript a responzívne pretekanie. Po vašom potvrdení a zlúčení do `main` workflow `GitHub Pages` nasadí iba overený priečinok `dist/`.

Manuálne spustenie workflowu Pages znovu nasadí existujúce súbory; nevykonáva nový AI výskum.
