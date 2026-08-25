import type { Messages } from "./ru";

export const de: Messages = {
  meta: {
    title: "ShadowBox — anonyme verschlüsselte E-Mail",
    description:
      "E-Mail ohne Telefonnummer und ohne Namen: eine eigene Adresse für jede Website, Nachrichten werden beim Empfang verschlüsselt und nur in deinem Browser gelesen.",
    ogImageAlt: "ShadowBox — anonyme verschlüsselte E-Mail",
    ogLocale: "de_DE",
  },
  header: {
    homeLabel: "ShadowBox, zur Startseite",
    navLabel: "Bereiche",
    nav: { how: "So funktioniert’s", aliases: "Adressen", phishing: "Anti-Phishing", security: "Sicherheit" },
    signIn: "Anmelden",
    signUp: "Postfach erstellen",
    languageLabel: "Sprache",
  },
  footer: { security: "Sicherheit", source: "Quellcode" },
  hero: {
    eyebrow: "Anonyme E-Mail",
    titleStart: "Deine Post verschwindet im",
    titleAccent: "Schatten",
    lede: "Ein Postfach ohne Telefonnummer und ohne Namen. Nutze für jede Website eine eigene Adresse: Nachrichten werden beim Eintreffen verschlüsselt, und nur du kannst sie lesen.",
    primary: "Postfach erstellen",
    secondary: "So schützen wir dich",
    facts: ["Ohne Telefon", "Ohne Namen", "Verschlüsselt beim Empfang"],
    imageAlt:
      "Eine junge Frau mit rotem Bob steht auf einem Steg in einem Serverraum, über ihrer Hand zerfällt ein Umschlag in Pixel",
  },
  how: {
    eyebrow: "So funktioniert’s",
    title: "Drei Schritte zum ruhigen Postfach",
    steps: [
      {
        title: "Ohne Namen und Telefon",
        text: "Wähle Login und Passwort. Statt eines Captchas löst dein Browser ein paar Sekunden lang eine kleine Rechenaufgabe, und das Postfach ist bereit.",
      },
      {
        title: "Eine Adresse pro Website",
        text: "Eine Adresse für den Shop, eine für soziale Netzwerke, eine für die Bank. Ein Leak verrät nichts über die anderen.",
      },
      {
        title: "Nur du kannst sie lesen",
        text: "Jede Nachricht wird beim Eintreffen mit deinem Schlüssel verschlüsselt. Der Schlüssel öffnet sich nur in deinem Browser nach Eingabe des Passworts.",
      },
    ],
    illustration: {
      login: "Login",
      password: "Passwort",
      addresses: ["Shop", "Social", "News", "Bank"],
    },
  },
  security: {
    eyebrow: "Sicherheit",
    title: "Der Server speichert nur verschlüsselte Post",
    lede: "Lesen kannst sie nur du. Selbst wir haben keinen Schlüssel, um hineinzuschauen.",
    guarantees: [
      {
        title: "Dein Passwort verlässt den Browser nicht",
        text: "Der Browser leitet daraus zwei Schlüssel ab: einen zum Anmelden, der andere öffnet deinen privaten Schlüssel. Der Server bekommt nur den ersten.",
      },
      {
        title: "In der Datenbank nur Chiffretext",
        text: "Nachrichten, Betreffzeilen, Adressbezeichnungen und Ordnernamen sind verschlüsselt. Ein geleakter Datenbank-Dump verrät sie nicht.",
      },
      {
        title: "Keine IP-Adressen",
        text: "Statt der Adresse liegt ein Hash mit rotierendem Schlüssel in der Datenbank, höchstens 30 Tage lang. Deine Sitzungen siehst du selbst und kannst jede beenden.",
      },
    ],
    limitsTitle: "Was wir nicht versprechen",
    limits: [
      "Post von gewöhnlichen Anbietern kommt per SMTP im Klartext an. Der Server sieht sie beim Empfang, vor der Verschlüsselung.",
      "Metadaten sind für den Server sichtbar: Empfangszeit, Zieladresse und Größe der Nachricht.",
      "Das Passwort lässt sich nicht zurücksetzen: Wir haben keinen Schlüssel zu deiner Post. Bewahre die Recovery-Phrase auf, die wir dir bei der Registrierung zeigen.",
      "Vorerst empfängt das Postfach nur Nachrichten. Senden kommt in einer späteren Version.",
    ],
    more: "Mehr zum Bedrohungsmodell →",
  },
  aliases: {
    eyebrow: "Adressen",
    title: "Eine Adresse für jeden Zweck",
    ledeStart: "Dein Postfach sieht niemand. Nach außen gehen nur zufällige Adressen wie",
    ledeEnd: ", weder mit deinem Login noch untereinander verknüpft.",
    facts: [
      { title: "Dauerhaft", text: "für die Bank und Dienste, die du jahrelang nutzt." },
      { title: "Temporär", text: "für 1 Stunde, 24 Stunden, 7 oder 30 Tage. Danach schaltet sie sich selbst ab." },
      {
        title: "Bezeichnung und Ordner",
        text: "Post an deine Adresse „Shopping“ landet direkt im passenden Ordner. Bezeichnungen sind verschlüsselt.",
      },
      {
        title: "Geleakt?",
        text: "lösch die Adresse. Dein Postfach bleibt unberührt, und eine gelöschte Adresse wird nie an jemand anderen vergeben.",
      },
    ],
    imageAlt:
      "Eine junge Frau sitzt mit einem Laptop im Weltraum, rote Umschlag-Adressen strahlen davon aus, einer zerfällt in Pixel",
  },
  phishing: {
    eyebrow: "Anti-Phishing",
    title: "Verdächtige Post fällt sofort auf",
    lede: "Jede eingehende Nachricht prüfen wir mit SPF, DKIM und DMARC und suchen nach typischen Phishing-Tricks. Daneben stehen eine Markierung und eine Erklärung in einfachen Worten.",
    badgesLabel: "Beispiele für Markierungen",
    badges: {
      safe: "Bekannter Absender",
      caution: "Erste Nachricht",
      danger: "Sieht nach Phishing aus",
      alias: "Temporäre Adresse",
    },
    note: "Externe Bilder in Nachrichten sind ausgeblendet, damit ein Tracking-Pixel nicht erfährt, dass du die Mail geöffnet hast. Eine Markierung ist ein Hinweis, keine Garantie: Die Entscheidung liegt bei dir.",
    checks: [
      "Absender hat die DMARC-Prüfung nicht bestanden",
      "Absendername gibt sich als andere Adresse aus",
      "Domain aus ähnlich aussehenden Buchstaben anderer Alphabete",
      "Linktext stimmt nicht mit der echten Adresse überein",
      "Ausführbare Anhänge und Dokumente mit Makros",
    ],
    imageAlt: "Eine junge Frau hält Phishing-Mails mit einem roten Schild auf",
  },
  cta: {
    title: "Dein Postfach in einer Minute",
    text: "Login und Passwort. Mehr braucht es nicht.",
    button: "Postfach erstellen",
  },
};
