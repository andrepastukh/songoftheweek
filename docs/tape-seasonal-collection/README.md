# Seasons & Patterns

Status: Die 15 Entwürfe wurden auf Wunsch aus src/tapeOptions.ts und public/assets/tape/design entfernt. Sie sind nur noch hier als separate Entwürfe vorhanden und stehen in der Anwendung nicht zur Auswahl.

01. Herbst · Goldene Blätter — AutumnMapleDesign.png
02. Herbst · Regentag — AutumnRainDesign.png
03. Herbst · Waldbeeren — AutumnBerriesDesign.png
04. Herbst · Wollschal — AutumnPlaidDesign.png
05. Winter · Leiser Schnee — WinterSnowDesign.png
06. Winter · Tannenwald — WinterPinesDesign.png
07. Winter · Polarlicht — WinterAuroraDesign.png
08. Winter · Strickpullover — WinterKnitDesign.png
09. Halloween · Kürbisnacht — HalloweenPumpkinsDesign.png
10. Halloween · Geisterstunde — HalloweenGhostsDesign.png
11. Muster · Vertikale Streifen — PatternVerticalDesign.png
12. Muster · Diagonale Streifen — PatternDiagonalDesign.png
13. Muster · Terrazzo — PatternTerrazzoDesign.png
14. Retrowave · Neon Sunset — RetrowaveNeonDesign.png
15. Papier · Notizzettel — PaperNoteDesign.png

Alle PNGs: 2000 × 1333 Pixel, RGBA8. Die Grafik-Pipeline nutzt die Alpha-Maske des bestehenden weißen Etikettenhintergrunds. Das gesamte obere Etikett bleibt bis y=535 transparent. Die unteren Textfelder sind in den Rechtecken x=535–748/y=725–795 und x=1243–1465/y=725–795 geschützt, inklusive Sicherheitsabstand für den CSS-Textversatz. Fenster und Außenkontur übernehmen die Originalmaske.

Automatisch geprüft: 15/15 Dateien korrekt, keine Maskenabweichungen, keine Pixel im Nachrichtenfeld oder außerhalb der Originalgeometrie, alle IDs eindeutig, alle Assetpfade vorhanden, Kopien bytegleich, 18 vorhandene Designs unverändert. Bestehende Auswahl, Defaults und Rendering bleiben erhalten.

preview.html enthält die Originalebenen und CSS-Geometrie sowie zweizeilige Beispielnachrichten mit Titel/Künstler. Gehäuse kann zwischen Schwarz und Weiß gewechselt werden. label-overview.png zeigt die Etiketten auf weißem Hintergrund ohne Gehäuse und Texte, in der Reihenfolge oben.

Die Kontaktübersicht wurde visuell geprüft. Browser- und Build-Test konnten wegen der nicht startenden Laufzeitumgebung nicht ausgeführt werden. Nichts veröffentlicht.

Reproduzierbare Grafikquelle: generate.mjs (schreibt neue Ausgabedateien nur, wenn sie noch nicht existieren). Pixelprüfungen: validation.json.
