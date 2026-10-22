# Vintage-Testserie

Sechs isolierte grafisch erzeugte Design-Overlays. Keine neuen Gehäusefotos, keine Integration und keine Änderung vorhandener Dateien.

## Asset-Struktur

- 12 vorhandene Design-PNGs, 14 Hintergrund-PNGs und 4 Text-PNGs: jeweils 2000 × 1333 Pixel, RGBA.
- Referenzmaske: public/assets/tape/design/LinienDesign3.png. Sichtbare Pixel: 85454; Bounding Box x=502–1495, y=519–723. Gesamter Alpha-Kanal einschließlich Antialiasing unverändert übernommen.
- Hintergrundmaske: sichtbare Bounding Box x=502–1495, y=357–815.
- Gehäuse, Schatten und Spulen sind separate Assets. Weißes Gehäuse: 1483 × 1061 Pixel. Stage-Seitenverhältnis 1963/1403.
- Reihenfolge: Schatten → Spulen → Gehäuse → Etikettenhintergrund → Design → Nachricht → Side-A-/unteres Textoverlay → CSS-Körnung.
- Design- und Text-Overlays sind unabhängig kombinierbar, keine namensbasierte Paarung. Textfarbe wählt schwarze oder weiße PNGs.
- Custom-Layer: top -31.5%, left -32.27%, width 152.52%, height 141.80%. Gesamtkomposition translateX(6.25%).
- Nachricht: top 8.2%, left 23%, width 44%, height 16.5%; dynamische Schriftgröße über src/utils/tapeText.ts. Es gibt keine separaten Titel-/Künstlerfelder auf der Kassette. Die Vorschau nutzt diese als zweizeilige Beispielnachricht.
- Text-PNGs zusätzlich padding-top:1%.
- Abhängigkeiten: src/components/tape/Tape.tsx, src/styles/globals.css, src/tapeOptions.ts, src/utils/tapeText.ts, src/utils/tapeData.ts und src/utils/shareState.ts.
- Neue Namen folgen dem PascalCase-Schema *Design.png. Optionen sind in tapeOptions.ts explizit registriert und in geteilten Links validiert. Eine spätere Aufnahme in die Auswahl benötigt Registrierung; die Rendering-Logik selbst benötigt keine Änderung.

## Designs

- 01 · Sunset 1977: VintageSunsetDesign.png; Hintergrund beige, Text schwarz.
- 02 · Studio Blue 1981: VintageStudioBlueDesign.png; Hintergrund white, Text schwarz.
- 03 · Crimson 1985: VintageCrimsonDesign.png; Hintergrund white, Text schwarz.
- 04 · Forest Hi-Fi 1979: VintageForestDesign.png; Hintergrund beige, Text schwarz.
- 05 · Wave 1991: VintageWaveDesign.png; Hintergrund white, Text schwarz.
- 06 · Graphite 1988: VintageGraphiteDesign.png; Hintergrund white, Text schwarz.

Die Oberflächen wurden prozedural aus Vintage-Farbpaletten, Streifen, Diagonalen und dezenter Drucktextur erzeugt. Das vorhandene Gehäuse liefert Kunststoff, Schrauben und Beleuchtung. Keine dekorativen Fantasieschriftzüge.

## Validierung

Alle sechs: PNG, 2000 × 1333 Pixel, RGBA8, null Alpha-Abweichungen gegenüber der Referenz. Damit sind auch sämtliche transparenten Fenster und das freie Nachrichtenfeld identisch. 62 bestehende Asset-/Quelldateien per SHA-256 geprüft, keine geändert. Details: validation.json.

Browser-/Anwendungstest noch offen: Browserruntime konnte nicht gestartet werden. preview.html ist eigenständig mit eingebetteten Originalassets und übernommenem CSS; Gehäusewechsel möglich. overview.svg zeigt die sechs Composites mit Originalassets, Text als SVG-Annäherung. Eine visuelle Endabnahme im Browser steht aus. Schwarz/Weiß-Kontrast anderer freier Hintergrundkombinationen ist nicht pauschal garantiert.
