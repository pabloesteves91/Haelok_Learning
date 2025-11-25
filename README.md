# Learningmodule App (Prototyp)

Erster Entwurf einer Trainings- / Zertifikats-Webapp.

## Struktur

- `index.html` – Einstieg, Views für Auth, Consent, Verifikation, Dashboard, Test, Admin
- `styles.css` – schlichtes Design in Weiß, Grau und Rot
- `app.js` – Logik (Dummy-Auth, Tests, i18n, Feedback, Admin-Übersicht)
- `firebase.js` – Platzhalter für Firebase-Initialisierung und Firestore-Calls
- `firestore.rules` – Beispiel-Sicherheitsregeln
- `manifest.json` & `manifest.webmanifest` – PWA-Konfiguration
- `_redirects` – Netlify Routing
- `assets/` – Platz für Lernbilder
- `icons/` – App-Icons (hier noch hinzufügen)
- `functions/` – Platzhalter für spätere Cloud Functions
- `tools/` – Platz für Hilfsskripte

## Lokale Demo

Einfach mit einem beliebigen Static-Server (oder über Netlify) ausliefern.
Login/Registrierung, Verifikation und Firestore sind aktuell nur simuliert.
