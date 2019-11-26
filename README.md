Please find the english version below.

# Das "S" in "HTTPS" – Eine freundliche Einführung in die Kryptographie
## Abstract
Die Sicherheit unserer digitalen Kommunikation basiert auf mathematischen Konzepten, 
die im Allgemeinen nicht besonders zugänglich dargestellt werden. 
Das führt dazu, dass selbst so grundlegende Ideen wie der Diffie-Hellman Key Exchange nicht gut verstanden werden – 
teils nicht einmal von den Technikern, die täglich damit Umgang haben. 

Ich bin der festen Überzeugung, dass es auch anders geht und wir werden gemeinsam den Beweis dazu antreten.

In diesem Workshop werfen wir einen genauen Blick auf die mathematischen Mechanismen des Diffie-Hellman Key Exchange, 
ohne uns mit Gruppentheorie zu beschäftigen. 
Statt dessen werden wir die Mechanismen von ersten Prinzipien aus selbst erarbeiten und mit einer einfachen 
Pen-And-Paper-Implementierung durchspielen. 
Sollte die Zeit reichen, gibt es zum Abschluss noch einen Überblick zur Implementierung mit Elliptischen Kurven.

Der Anspruch ist, die mathematischen Mechanismen beim Key Exchange verständlich und erlebbar zu machen, 
ohne eine Grundvorlesung in Algebra zu werden. 
Ich bin zuversichtlich, dass für Techniker und Nicht-Techniker gleichermaßen neue und interessante Erkenntnisse dabei sind.

## Materialien
Um den Workshop vernünftig durchführen zu können brauchst du:

- Die Präsentation: 
  - https://halfdane.github.io/diffie_hellman/ 
  - https://tinyurl.com/y6hxpvnv
- DH-Rechner: 
  - https://halfdane.github.io/diffie_hellman/calc.html
  - https://tinyurl.com/y4mua3o8
- Formulare für den Workshop zum Ausdrucken
  - https://halfdane.github.io/diffie_hellman/resources/img/DH-Form.odt
- 10 bis 20 W10
- kleine Zettel, die als Plaintext-Protokoll benutzt werden können
- Stifte, um die verschlüsselten Nachrichten aufs Plaintext-Protokoll zu schreiben

Die Teilnehmer müssen während des Workshops auf den Taschenrechner bei https://halfdane.github.io/diffie_hellman/calc.html zugreifen, Internet-Zugang ist also nötig.

## Referenzen
- Die Präsentation
  - https://halfdane.github.io/diffie_hellman
  - https://tinyurl.com/yyobmbo8
- Github Repo
  - https://github.com/halfdane/diffie_hellman
  - https://tinyurl.com/y6hxpvnv
- RFCs
  - [2409: The Internet Key Exchange](https://tools.ietf.org/html/rfc2409)
  - [3526: More Modular Exponential Diffie-Hellman groups](https://tools.ietf.org/html/rfc3526)
- Mehr
  - https://arstechnica.com/information-technology/2013/10/a-relatively-easy-to-understand-primer-on-elliptic-curve-cryptography/
  - https://www.golem.de/news/dsa-diffie-hellman-primzahlen-koennen-hintertuer-enthalten-1610-123778.html

## Lizenz

[![Creative Commons Lizenzvertrag](https://i.creativecommons.org/l/by/4.0/88x31.png "Creative Commons Lizenzvertrag")
](http://creativecommons.org/licenses/by/4.0/)
*"[Das "S" in "HTTPS" – Eine freundliche Einführung in die Kryptographie](https://github.com/halfdane/diffie_hellman)" 
von [HalfDane](https://github.com/halfdane) steht unter einer [CC BY](https://creativecommons.org/licenses/by/4.0/) Lizenz*

Durch die [CC BY](https://creativecommons.org/licenses/by/4.0/) Lizenz ist es dir erlaubt, dieses Werk zu verbreiten, 
zu remixen, zu verbessern und darauf aufzubauen, auch kommerziell, solange [HalfDane](https://github.com/halfdane) 
als Urheber des Originals genannt wird. 

Empfohlene Urheber-Nennung: 
> "[Das "S" in "HTTPS" – Eine freundliche Einführung in die Kryptographie](https://github.com/halfdane/diffie_hellman)"
> von [HalfDane](https://github.com/halfdane). Verfügbar unter https://github.com/halfdane/diffie_hellman


# The "S" in "HTTPS" – A friendly introduction into Cryptography
## Abstract

The security of our digital communications is based upon mathematical concepts that are often presented in a less than digestible form. 
As a result even fundamental ideas such as the Diffie-Hellman Key Exchange are poorly understood. 
More often than not even the engineers that deal with them on a daily basis fail to understand them fully.

I am convinced that there is another way, and together we are going to prove it.

In this workshop, we will take a close look at the mathematical mechanisms of the Diffie-Hellman Key Exchange without delving into Group Theory. 
Instead we will take a look at the mechanisms deduced from first principles and then walk through in a simple pen-and-paper implementation. 
If we have enough time we will also try to generalise our learnings and take a look at an alternative implementation with elliptic curves.

My hope is that without giving a lecture on algebra I can bring the mathematical mechanisms of Key Exchange alive in an understandable and fun way. 
I am confident that not only engineers, but also non-engineers will gain many valuable insights from this workshop!
