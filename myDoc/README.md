# Events

Returned object is an event emitter with following events:

event | description | data
----- | ----------- | ----
pfls | play stream flush | -
prgr | progress, in second | ```{ start: 0, current: 17, end: 42 }```
pvol | play volume | -
meta | metadata | all metadata send between `mdst` and `mden`, parsed
PICT | artwork | either a JPEG or a PNG
error | when `snal` occurs | -

## `pfls`

Déclenché dès que la lecture normale est interrompue : après Pause/Stop mais aussi après un déplacement dans le morceau.

The `FLUSH` request stops the streaming. [_Unofficial AirPlay Protocol Specification_](http://nto.github.io/AirPlay.html#audio-rtsprequests)

## `prgr`

Déclenché dès que la lecture commence et quand on se déplace dans le morceau.

Objet retourné de la forme :

```javascript
{
    start: t1,
    current: t2,
    end: t3
}
```

Avec `t1`, `t2`, et `t3` qui sont des timestamp RTP. L'unité est le frame, 1/44100 seconde (1/fréquence d'échantillonage). Apparemment (pas sûr),l'origine est le début du stream (event `pbeg`).

- La durée d'un morceau en secondes = `(prgr.end - prgr.start)/44100`
- Temps écoulé = `(prgr.current - prgr.start)/44100`

__NB__ `meta.astm` donne aussi la durée d'un morceau en secondes.

## `pvol`

Déclenché quand le volume change.

Objet retourné de la forme :

```javascript
{
    airplay: 0, // -144 = mute
    volume: 0,
    lowest: -96.3,
    highest: 0
}
```

Pour avoir le volume de 0 à 100 :

```javascript
function map(x, in_min, in_max, out_min, out_max) {
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

volume = map(pvol.volume, pvol.lowest, pvol.highest, 0, 100);
```

## `meta`

Déclenché une fois, au début de la lecture.

obj. | description
-----|--------
meta.asar | Artiste
meta.minm | Titre track
meta.asal | Album
meta.asyr | Année de l'album
meta.astm | Durée track, en millisecondes

Pour voir la signification de tous les codes : [DAAP - Content Codes](http://daap.sourceforge.net/docs/content-codes.html).

## `PICT`

Déclenché une fois, au début de la lecture après `meta`.

Buffer avec l'image en hexadécimal, PNG ou JPEG.

### PNG file signature

[Source](http://www.libpng.org/pub/png/spec/1.2/PNG-Rationale.html#R.PNG-file-signature)

The first eight bytes of a PNG file always contain the following values:

```
89  50  4e  47  0d  0a  1a  0a
```

### JPEG file signature

[Source](http://www.ntfs.com/jpeg-signature-format.htm)

JPEG files (compressed images) start with an image marker that always contains the tag code hex values :

```
FF D8 FF
```
