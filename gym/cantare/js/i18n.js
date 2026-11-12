/* Interface languages: English is the source text; every other language is a table from English to the translation. */
export const LANGS = [['en', 'EN', 'English'], ['de', 'DE', 'Deutsch'], ['fr', 'FR', 'Français'], ['cs', 'CS', 'Čeština']];
let lang = 'en';
export const getLang = () => lang;
export const setLang = l => { lang = LANGS.some(x => x[0] === l) ? l : 'en'; document.documentElement.lang = lang; };
export const guessLang = () => { const n = (navigator.language || 'en').slice(0, 2).toLowerCase(); return LANGS.some(x => x[0] === n) ? n : 'en'; };

const D = {
  de: {
    'Open in a full page': 'Als eigene Seite öffnen',
    'Press Play: your voice is recorded together with the music. Use headphones, so the organ does not leak into the recording.': 'Auf „Abspielen“ drücken: Deine Stimme wird zusammen mit der Musik aufgenommen. Kopfhörer verwenden, damit die Orgel nicht in die Aufnahme gelangt.',
    'Library': 'Bibliothek', 'Studio': 'Studio', 'Edit': 'Bearbeiten', 'Transform': 'Verwandeln', 'Search the library': 'Bibliothek durchsuchen',
    'Light / dark': 'Hell / dunkel', 'Edit the melody': 'Melodie bearbeiten', 'Transform the melody': 'Melodie verwandeln', 'Tactus': 'Tactus',
    'Previous leaf': 'Vorherige Seite', 'Next leaf': 'Nächste Seite', 'Close': 'Schließen', 'Play': 'Abspielen', 'Stop': 'Stopp', 'Language': 'Sprache',
    'improvise this voice': 'diese Stimme improvisieren', 'Voice': 'Stimme', 'Mute': 'Stumm', 'Hide': 'Verbergen',
    'Seen, not heard: sing it from the notation': 'Gesehen, nicht gehört: aus dem Notentext singen', 'Neither seen nor heard: improvise it': 'Weder gesehen noch gehört: improvisieren',
    'Clef and staff': 'Schlüssel und Linien', 'Clef': 'Schlüssel', 'Lines': 'Linien', 'Auto': 'Automatisch',
    'Plainchant stands on four lines, everything mensural on five; Auto follows that rule.': 'Choral steht auf vier Linien, alles Mensurale auf fünf; „Automatisch“ folgt dieser Regel.',
    'Pitch': 'Tonhöhe', 'Step': 'Stufe', 'Octave': 'Oktave', 'Reset': 'Zurücksetzen', 'Mensuration': 'Mensur', 'Tempus': 'Tempus', 'Imperfectum': 'Imperfectum', 'Perfectum': 'Perfectum',
    'In tempus perfectum a brevis holds three semibreves.': 'Im Tempus perfectum umfasst eine Brevis drei Semibreven.',
    'Talea': 'Talea', 'None': 'Keine', 'Shown as': 'Dargestellt als', 'Chant notation': 'Choralnotation', 'Mensural notation': 'Mensuralnotation',
    'Sound': 'Klang', 'Timbre': 'Klangfarbe', 'Volume': 'Lautstärke', 'Click': 'Klick', 'Hand': 'Hand', 'View': 'Ansicht', 'Notation': 'Notation', 'Manuscript': 'Handschrift', 'Engraved': 'Gestochen',
    'Layout': 'Anordnung', 'Score': 'Partitur', 'Choir book': 'Chorbuch', 'Size': 'Größe', 'Fit to screen': 'An den Bildschirm anpassen', 'Collapse the library': 'Bibliothek einklappen', 'Show the library': 'Bibliothek zeigen', 'Theme': 'Farbschema', 'Dark': 'Dunkel', 'Light': 'Hell',
    'Share': 'Teilen', 'Copy link': 'Link kopieren', 'Print': 'Drucken', 'Link copied': 'Link kopiert',
    'Organ': 'Orgel', 'Sackbut': 'Posaune', 'Chalumeau': 'Chalumeau',
    'Undo': 'Rückgängig', 'Redo': 'Wiederholen', 'Previous note': 'Vorherige Note', 'Next note': 'Nächste Note', 'Higher': 'Höher', 'Lower': 'Tiefer', 'Rest': 'Pause', 'Dot': 'Punkt',
    'Flat': 'B', 'Natural': 'Auflösungszeichen', 'Sharp': 'Kreuz', 'Add a note after this one': 'Note danach einfügen', 'Delete': 'Löschen', 'Tap a note to select it.': 'Note antippen, um sie auszuwählen.',
    'Nothing found.': 'Nichts gefunden.', 'Loading…': 'Lädt …', 'Open to load.': 'Zum Laden öffnen.', 'Could not load this part of the collection (offline?).': 'Dieser Teil der Sammlung konnte nicht geladen werden (offline?).',
    'Could not load that piece (offline?).': 'Das Stück konnte nicht geladen werden (offline?).', 'Josquin Research Project': 'Josquin Research Project', 'Canons from the Josquin Research Project': 'Kanons aus dem Josquin Research Project',
    'Buy me a coffee': 'Spendiere mir einen Kaffee', 'Feedback': 'Rückmeldung', 'Microphone': 'Mikrofon', 'Record me': 'Mich aufnehmen', 'Recording…': 'Aufnahme läuft …',
    'Play back': 'Wiedergeben', 'Download': 'Herunterladen', 'Your recording': 'Deine Aufnahme', 'Sing along': 'Mitsingen', 'Pitch you sing': 'Gesungener Ton',
    'This browser cannot use the microphone here.': 'Dieser Browser kann das Mikrofon hier nicht nutzen.', 'The microphone is blocked: allow it in the browser settings.': 'Das Mikrofon ist blockiert: in den Browsereinstellungen erlauben.',
    'This browser cannot record.': 'Dieser Browser kann nicht aufnehmen.', 'Recording saved': 'Aufnahme gespeichert', 'Open the microphone': 'Mikrofon öffnen', 'Close the microphone': 'Mikrofon schließen',
    'Guidonian hand': 'Guidonische Hand', 'Start the camera': 'Kamera starten', 'Stop the camera': 'Kamera stoppen', 'Right hand': 'Rechte Hand', 'Left hand': 'Linke Hand', 'No hand in sight': 'Keine Hand zu sehen',
    'Show one or two hands to the camera. Each fingertip joint is a note of the hexachord; point to a joint to hear it.': 'Zeige der Kamera eine oder zwei Hände. Jedes Fingerglied ist ein Ton des Hexachords; zeige auf ein Glied, um ihn zu hören.',
    'The camera is not available here.': 'Die Kamera ist hier nicht verfügbar.', 'Loading the hand reader…': 'Handerkennung wird geladen …', 'Open the Guidonian hand': 'Guidonische Hand öffnen',
  },
  fr: {
    'Open in a full page': 'Ouvrir en pleine page',
    'Press Play: your voice is recorded together with the music. Use headphones, so the organ does not leak into the recording.': 'Appuyez sur Lecture : votre voix est enregistrée avec la musique. Utilisez un casque, pour que l’orgue ne passe pas dans l’enregistrement.',
    'Library': 'Bibliothèque', 'Studio': 'Studio', 'Edit': 'Modifier', 'Transform': 'Transformer', 'Search the library': 'Chercher dans la bibliothèque',
    'Light / dark': 'Clair / sombre', 'Edit the melody': 'Modifier la mélodie', 'Transform the melody': 'Transformer la mélodie', 'Tactus': 'Tactus',
    'Previous leaf': 'Page précédente', 'Next leaf': 'Page suivante', 'Close': 'Fermer', 'Play': 'Lecture', 'Stop': 'Arrêt', 'Language': 'Langue',
    'improvise this voice': 'improvisez cette voix', 'Voice': 'Voix', 'Mute': 'Muet', 'Hide': 'Masquer',
    'Seen, not heard: sing it from the notation': 'Vue, non entendue : à chanter d’après la notation', 'Neither seen nor heard: improvise it': 'Ni vue ni entendue : à improviser',
    'Clef and staff': 'Clef et portée', 'Clef': 'Clef', 'Lines': 'Lignes', 'Auto': 'Auto',
    'Plainchant stands on four lines, everything mensural on five; Auto follows that rule.': 'Le plain-chant se note sur quatre lignes, tout le mensural sur cinq ; « Auto » suit cette règle.',
    'Pitch': 'Hauteur', 'Step': 'Degré', 'Octave': 'Octave', 'Reset': 'Réinitialiser', 'Mensuration': 'Mensuration', 'Tempus': 'Tempus', 'Imperfectum': 'Imparfait', 'Perfectum': 'Parfait',
    'In tempus perfectum a brevis holds three semibreves.': 'Au tempus perfectum, une brève vaut trois semibrèves.',
    'Talea': 'Talea', 'None': 'Aucune', 'Shown as': 'Affichée en', 'Chant notation': 'Notation grégorienne', 'Mensural notation': 'Notation mensurale',
    'Sound': 'Son', 'Timbre': 'Timbre', 'Volume': 'Volume', 'Click': 'Clic', 'Hand': 'Main', 'View': 'Affichage', 'Notation': 'Notation', 'Manuscript': 'Manuscrite', 'Engraved': 'Gravée',
    'Layout': 'Mise en page', 'Score': 'Partition', 'Choir book': 'Livre de chœur', 'Size': 'Taille', 'Fit to screen': 'Adapter à l’écran', 'Collapse the library': 'Replier la bibliothèque', 'Show the library': 'Afficher la bibliothèque', 'Theme': 'Thème', 'Dark': 'Sombre', 'Light': 'Clair',
    'Share': 'Partager', 'Copy link': 'Copier le lien', 'Print': 'Imprimer', 'Link copied': 'Lien copié',
    'Organ': 'Orgue', 'Sackbut': 'Sacqueboute', 'Chalumeau': 'Chalumeau',
    'Undo': 'Annuler', 'Redo': 'Rétablir', 'Previous note': 'Note précédente', 'Next note': 'Note suivante', 'Higher': 'Plus haut', 'Lower': 'Plus bas', 'Rest': 'Silence', 'Dot': 'Point',
    'Flat': 'Bémol', 'Natural': 'Bécarre', 'Sharp': 'Dièse', 'Add a note after this one': 'Ajouter une note après celle-ci', 'Delete': 'Supprimer', 'Tap a note to select it.': 'Touchez une note pour la sélectionner.',
    'Nothing found.': 'Rien trouvé.', 'Loading…': 'Chargement…', 'Open to load.': 'Ouvrir pour charger.', 'Could not load this part of the collection (offline?).': 'Impossible de charger cette partie de la collection (hors ligne ?).',
    'Could not load that piece (offline?).': 'Impossible de charger cette pièce (hors ligne ?).', 'Josquin Research Project': 'Josquin Research Project', 'Canons from the Josquin Research Project': 'Canons du Josquin Research Project',
    'Buy me a coffee': 'Offrez-moi un café', 'Feedback': 'Commentaires', 'Microphone': 'Microphone', 'Record me': 'M’enregistrer', 'Recording…': 'Enregistrement…',
    'Play back': 'Réécouter', 'Download': 'Télécharger', 'Your recording': 'Votre enregistrement', 'Sing along': 'Chanter avec', 'Pitch you sing': 'Note chantée',
    'This browser cannot use the microphone here.': 'Ce navigateur ne peut pas utiliser le microphone ici.', 'The microphone is blocked: allow it in the browser settings.': 'Le microphone est bloqué : autorisez-le dans les réglages du navigateur.',
    'This browser cannot record.': 'Ce navigateur ne peut pas enregistrer.', 'Recording saved': 'Enregistrement sauvegardé', 'Open the microphone': 'Ouvrir le microphone', 'Close the microphone': 'Fermer le microphone',
    'Guidonian hand': 'Main guidonienne', 'Start the camera': 'Démarrer la caméra', 'Stop the camera': 'Arrêter la caméra', 'Right hand': 'Main droite', 'Left hand': 'Main gauche', 'No hand in sight': 'Aucune main en vue',
    'Show one or two hands to the camera. Each fingertip joint is a note of the hexachord; point to a joint to hear it.': 'Montrez une ou deux mains à la caméra. Chaque articulation est une note de l’hexacorde ; pointez-en une pour l’entendre.',
    'The camera is not available here.': 'La caméra n’est pas disponible ici.', 'Loading the hand reader…': 'Chargement du lecteur de main…', 'Open the Guidonian hand': 'Ouvrir la main guidonienne',
  },
  cs: {
    'Open in a full page': 'Otevřít na celou stránku',
    'Press Play: your voice is recorded together with the music. Use headphones, so the organ does not leak into the recording.': 'Stiskni Přehrát: tvůj hlas se nahrává spolu s hudbou. Použij sluchátka, aby varhany neprosakovaly do nahrávky.',
    'Library': 'Knihovna', 'Studio': 'Studio', 'Edit': 'Upravit', 'Transform': 'Proměnit', 'Search the library': 'Hledat v knihovně',
    'Light / dark': 'Světlý / tmavý', 'Edit the melody': 'Upravit melodii', 'Transform the melody': 'Proměnit melodii', 'Tactus': 'Tactus',
    'Previous leaf': 'Předchozí list', 'Next leaf': 'Další list', 'Close': 'Zavřít', 'Play': 'Přehrát', 'Stop': 'Zastavit', 'Language': 'Jazyk',
    'improvise this voice': 'zaimprovizuj tento hlas', 'Voice': 'Hlas', 'Mute': 'Ztlumit', 'Hide': 'Skrýt',
    'Seen, not heard: sing it from the notation': 'Vidět, neslyšet: zpívej z notového zápisu', 'Neither seen nor heard: improvise it': 'Ani vidět, ani slyšet: improvizuj',
    'Clef and staff': 'Klíč a osnova', 'Clef': 'Klíč', 'Lines': 'Linky', 'Auto': 'Automaticky',
    'Plainchant stands on four lines, everything mensural on five; Auto follows that rule.': 'Gregoriánský chorál stojí na čtyřech linkách, vše mensurální na pěti; „Automaticky“ se řídí tímto pravidlem.',
    'Pitch': 'Výška', 'Step': 'Stupeň', 'Octave': 'Oktáva', 'Reset': 'Obnovit', 'Mensuration': 'Mensura', 'Tempus': 'Tempus', 'Imperfectum': 'Imperfektní', 'Perfectum': 'Perfektní',
    'In tempus perfectum a brevis holds three semibreves.': 'V tempus perfectum má brevis hodnotu tří semibrevis.',
    'Talea': 'Talea', 'None': 'Žádná', 'Shown as': 'Zobrazit jako', 'Chant notation': 'Chorální notace', 'Mensural notation': 'Mensurální notace',
    'Sound': 'Zvuk', 'Timbre': 'Barva zvuku', 'Volume': 'Hlasitost', 'Click': 'Klik', 'Hand': 'Ruka', 'View': 'Zobrazení', 'Notation': 'Notace', 'Manuscript': 'Rukopisná', 'Engraved': 'Rytá',
    'Layout': 'Rozvržení', 'Score': 'Partitura', 'Choir book': 'Chórová kniha', 'Size': 'Velikost', 'Fit to screen': 'Přizpůsobit obrazovce', 'Collapse the library': 'Sbalit knihovnu', 'Show the library': 'Ukázat knihovnu', 'Theme': 'Vzhled', 'Dark': 'Tmavý', 'Light': 'Světlý',
    'Share': 'Sdílet', 'Copy link': 'Zkopírovat odkaz', 'Print': 'Tisk', 'Link copied': 'Odkaz zkopírován',
    'Organ': 'Varhany', 'Sackbut': 'Pozoun', 'Chalumeau': 'Chalumeau',
    'Undo': 'Zpět', 'Redo': 'Znovu', 'Previous note': 'Předchozí nota', 'Next note': 'Další nota', 'Higher': 'Výš', 'Lower': 'Níž', 'Rest': 'Pomlka', 'Dot': 'Tečka',
    'Flat': 'Béčko', 'Natural': 'Odrážka', 'Sharp': 'Křížek', 'Add a note after this one': 'Přidat notu za tuto', 'Delete': 'Smazat', 'Tap a note to select it.': 'Klepni na notu, abys ji vybral.',
    'Nothing found.': 'Nic nenalezeno.', 'Loading…': 'Načítání…', 'Open to load.': 'Otevři k načtení.', 'Could not load this part of the collection (offline?).': 'Tuto část sbírky se nepodařilo načíst (offline?).',
    'Could not load that piece (offline?).': 'Skladbu se nepodařilo načíst (offline?).', 'Josquin Research Project': 'Josquin Research Project', 'Canons from the Josquin Research Project': 'Kánony z Josquin Research Project',
    'Buy me a coffee': 'Kup mi kávu', 'Feedback': 'Zpětná vazba', 'Microphone': 'Mikrofon', 'Record me': 'Nahrát mě', 'Recording…': 'Nahrávání…',
    'Play back': 'Přehrát', 'Download': 'Stáhnout', 'Your recording': 'Tvoje nahrávka', 'Sing along': 'Zpívat s notami', 'Pitch you sing': 'Zpívaný tón',
    'This browser cannot use the microphone here.': 'Tento prohlížeč zde nemůže použít mikrofon.', 'The microphone is blocked: allow it in the browser settings.': 'Mikrofon je zablokovaný: povol ho v nastavení prohlížeče.',
    'This browser cannot record.': 'Tento prohlížeč neumí nahrávat.', 'Recording saved': 'Nahrávka uložena', 'Open the microphone': 'Zapnout mikrofon', 'Close the microphone': 'Vypnout mikrofon',
    'Guidonian hand': 'Guidonská ruka', 'Start the camera': 'Spustit kameru', 'Stop the camera': 'Zastavit kameru', 'Right hand': 'Pravá ruka', 'Left hand': 'Levá ruka', 'No hand in sight': 'Žádná ruka v záběru',
    'Show one or two hands to the camera. Each fingertip joint is a note of the hexachord; point to a joint to hear it.': 'Ukaž kameře jednu nebo dvě ruce. Každý článek prstu je tónem hexachordu; ukaž na něj a uslyšíš ho.',
    'The camera is not available here.': 'Kamera zde není dostupná.', 'Loading the hand reader…': 'Načítání čtečky ruky…', 'Open the Guidonian hand': 'Otevřít guidonskou ruku',
  },
};
D.de['Voice'] = 'Stimme'; /* timbre and voice share the word */
export const tr = s => (lang === 'en' ? s : (D[lang] && D[lang][s]) || s);
/* translate the static page: elements carry the English text in data-i18n (text), data-i18n-title, data-i18n-ph (placeholder) */
export function translatePage(root = document) {
  root.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = tr(e.dataset.i18n); });
  root.querySelectorAll('[data-i18n-title]').forEach(e => { const v = tr(e.dataset.i18nTitle); e.title = v; if (e.hasAttribute('aria-label')) e.setAttribute('aria-label', v); });
  root.querySelectorAll('[data-i18n-ph]').forEach(e => { e.placeholder = tr(e.dataset.i18nPh); });
}
