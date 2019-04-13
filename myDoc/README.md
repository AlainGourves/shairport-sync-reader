## Events
Returned object is an event emitter with following events:

event | description | data
----- | ----------- | ----
pfls | play stream flush | -
prgr | progress, in second | ```{ start: 0, current: 17, end: 42 }```
pvol | play volume | -
meta | metadata | all metadata send between `mdst` and `mden`, parsed
PICT | artwork | either a JPEG or a PNG
error | when `snal` occurs | -

### `pfls`

The `FLUSH` request stops the streaming. [_Unofficial AirPlay Protocol Specification_](http://nto.github.io/AirPlay.html#audio-rtsprequests)

Déclenché dès que la lecture normale est interrompue : après Pause/Stop mais aussi après un déplacement dans le morceau.

### `prgr`

Objet retourné de la forme :

```json
{
	start: t1,
	current: t2,
	end: t3
}
```
Avec `t1`, `t2`, et `t3` qui sont des timestamp RTP. L'unité est le frame, 1/44100 seconde (1/fréquence d'échantillonage). Apparemment (pas sûr),l'origine est le début du stream (event `pbeg `).

La durée d'un morceau en secondes est $$(prgr.end - prgr.start)/44100$$