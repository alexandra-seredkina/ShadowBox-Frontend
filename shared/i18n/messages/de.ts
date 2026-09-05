import type { Messages } from "./ru";

export const de: Messages = {
  common: {
    loading: "Wird geladen",
    copy: "Kopieren",
    copied: "Kopiert",
    copyFailed: "Fehlgeschlagen",
    showPassword: "Zeigen",
    hidePassword: "Verbergen",
  },
  notFound: {
    title: "Seite nicht gefunden",
    text: "Diese Seite gibt es nicht. Vielleicht ist der Link veraltet.",
    home: "Zur Startseite",
  },
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
  auth: {
    homeLabel: "ShadowBox, zur Startseite",
    fields: {
      login: "Login",
      loginHint: "3–32 Zeichen: lateinische Buchstaben, Ziffern, Punkt, Bindestrich, Unterstrich. Er dient nur zur Anmeldung, niemand sonst sieht ihn.",
      password: "Passwort",
      passwordHint: "Mindestens 12 Zeichen. Der Server bekommt es nie, deshalb lässt es sich nicht zurücksetzen.",
      passwordConfirm: "Passwort wiederholen",
    },
    loginIssues: {
      too_short: "Der Login ist zu kurz: mindestens 3 Zeichen.",
      too_long: "Der Login ist zu lang: höchstens 32 Zeichen.",
      invalid_format: "Nur lateinische Buchstaben, Ziffern, Punkt, Bindestrich und Unterstrich. Punkt und Bindestrich nicht am Anfang oder Ende.",
    },
    passwordIssues: {
      too_short: "Das Passwort ist zu kurz: mindestens 12 Zeichen.",
      too_long: "Das Passwort ist zu lang: höchstens 256 Byte.",
      mismatch: "Die Passwörter stimmen nicht überein.",
    },
    errors: {
      codes: {
        VALIDATION_FAILED: "Der Server hat die Daten nicht angenommen. Prüf deinen Login und versuch es noch einmal.",
        POW_INVALID: "Die Browser-Prüfung ist abgelaufen. Versuch es noch einmal.",
        POW_REQUIRED: "Zu viele Anmeldeversuche. Dein Browser muss zuerst eine Rechenaufgabe lösen.",
        LOGIN_TAKEN: "Dieser Login ist schon vergeben. Wähl einen anderen.",
        LOGIN_RESERVED: "Dieser Login ist reserviert oder sieht einem Systemnamen zu ähnlich. Wähl einen anderen.",
        IDEMPOTENCY_CONFLICT: "Diese Anfrage wurde schon mit anderen Daten gesendet. Beginn die Registrierung neu.",
        INVALID_CREDENTIALS: "Login oder Passwort ist falsch.",
        ACCOUNT_LOCKED: "Zu viele Fehlversuche. Die Anmeldung ist vorübergehend gesperrt, versuch es in {minutes} Min. wieder.",
        UNAUTHENTICATED: "Deine Sitzung ist abgelaufen. Melde dich erneut an.",
        ORIGIN_MISMATCH: "Die Anfrage kam nicht von unserer Website. Öffne ShadowBox unter seiner eigenen Adresse und versuch es noch einmal.",
        PAYLOAD_TOO_LARGE: "Die Anfrage ist zu groß.",
        RATE_LIMITED: "Zu viele Anfragen. Versuch es in {minutes} Min. wieder.",
        INTERNAL: "Auf dem Server ist etwas kaputtgegangen. Versuch es etwas später noch einmal.",
        NETWORK_ERROR: "Keine Verbindung zum Server. Prüf deine Internetverbindung und versuch es noch einmal.",
        UNEXPECTED_RESPONSE: "Der Server hat unerwartet geantwortet. Versuch es etwas später noch einmal.",
      },
      wrongPassword: "Falsches Passwort.",
      powFailed: "Dein Browser konnte die Rechenaufgabe nicht lösen. Lade die Seite neu und versuch es noch einmal.",
      unknown: "Etwas ist schiefgelaufen. Versuch es noch einmal.",
    },
    register: {
      metaTitle: "Registrierung",
      title: "Postfach erstellen",
      lede: "Login und Passwort. Kein Telefon, keine E-Mail, kein Name.",
      stepOf: "Schritt {current} von {total}",
      steps: ["Login und Passwort", "Schlüssel", "Recovery-Phrase"],
      submitCredentials: "Weiter",
      haveAccount: "Schon ein Postfach?",
      signInLink: "Anmelden",
      keys: {
        title: "Wir bereiten deine Schlüssel vor",
        text: "Statt eines Captchas löst dein Browser eine kleine Rechenaufgabe und erzeugt deine Schlüssel. Meist ein paar Sekunden, auf langsamen Geräten länger.",
        progressLabel: "Browser-Prüfung",
      },
      phrase: {
        title: "Speichere deine Recovery-Phrase",
        text: "Diese 24 Wörter öffnen eine Kopie deines Schlüssels. Wir zeigen sie einmal und speichern sie nicht. Schreib sie auf Papier oder in einen Passwortmanager.",
        warning: "Wenn du dein Passwort vergisst und die Phrase verlierst, kann niemand deine Post zurückholen, auch wir nicht. Wiederherstellung mit der Phrase kommt in einer späteren Version.",
        listLabel: "Recovery-Phrase",
        saved: "Die Phrase ist aufgeschrieben und sicher aufbewahrt",
        continue: "Prüfen",
      },
      confirm: {
        title: "Kurze Prüfung",
        text: "Gib die Wörter mit diesen Nummern ein.",
        wordLabel: "Wort Nr. {number}",
        mismatch: "Die Wörter stimmen nicht. Prüf deine Notiz oder geh zurück zur Phrase.",
        back: "Phrase noch einmal zeigen",
        submit: "Postfach erstellen",
        submitting: "Postfach wird erstellt…",
      },
    },
    login: {
      metaTitle: "Anmelden",
      title: "Anmelden",
      lede: "Dein Passwort erreicht den Server nie: Der Browser leitet die Schlüssel selbst daraus ab.",
      submit: "Anmelden",
      submitting: "Anmeldung läuft…",
      pow: "Zu viele Anmeldeversuche. Dein Browser löst eine Rechenaufgabe…",
      noAccount: "Noch kein Postfach?",
      registerLink: "Erstellen",
    },
    unlock: {
      metaTitle: "Entsperren",
      title: "Entsperr dein Postfach",
      lede: "Schlüssel leben nur im Speicher dieses Tabs, deshalb braucht es nach einem Neuladen wieder das Passwort.",
      signedInAs: "Angemeldet als {login}",
      checking: "Sitzung wird geprüft…",
      submit: "Entsperren",
      submitting: "Schlüssel wird geöffnet…",
      otherAccount: "Abmelden und anderes Postfach nutzen",
    },
    app: {
      title: "Dein Postfach ist bereit",
      text: "Nachrichten, Adressen und Ordner erscheinen hier in den nächsten Versionen. Dein Schlüssel ist entsperrt und lebt nur in diesem Tab.",
      checking: "Sitzung wird geprüft…",
      signOut: "Abmelden",
    },
  },
  securityPage: {
    meta: {
      title: "Sicherheit",
      description:
        "Wie ShadowBox Post verschlüsselt, was der Server sieht und wo der Schutz endet. Ein ehrliches Bedrohungsmodell.",
    },
    intro: {
      eyebrow: "Sicherheit",
      title: "So funktioniert der Schutz",
      lede: "Wie eine Nachricht zu dir kommt, wer unterwegs was sehen kann und wo unser Schutz endet. Ohne große Versprechen.",
    },
    flow: {
      eyebrow: "Der Weg einer Nachricht",
      title: "Vom Absender bis auf deinen Bildschirm",
      lede: "Den Klartext einer Nachricht gibt es beim Absender und in deinem Browser. Und für einen Moment im Speicher unseres Servers, während er sie annimmt.",
      steps: [
        {
          title: "Absender",
          text: "Die Nachricht kommt per SMTP zu uns, wie jede E-Mail. Die Verbindung ist mit TLS geschützt, die Nachricht selbst kommt aber im Klartext an: So funktioniert das Protokoll.",
        },
        {
          title: "Empfang auf dem Server",
          text: "Der Server prüft SPF, DKIM und DMARC, sucht nach Anzeichen von Phishing und verschlüsselt die Nachricht sofort mit deinem öffentlichen Schlüssel. Klartext gibt es nur im Arbeitsspeicher, nie auf der Festplatte oder in Logs.",
        },
        {
          title: "Speicher",
          text: "In der Datenbank liegt Chiffretext: Absender, Betreff, Text und Anhänge. Öffnen kann ihn nur dein privater Schlüssel, und den hat der Server nicht.",
        },
        {
          title: "Dein Browser",
          text: "Nach Eingabe deines Passworts entsperrt der Browser deinen privaten Schlüssel und entschlüsselt deine Post. Der Schlüssel lebt nur im Speicher des Tabs und ist nach einem Neuladen weg.",
        },
      ],
      diagram: {
        smtp: "SMTP",
        captions: ["Klartext", "nur im Speicher", "nur Chiffretext", "hier entschlüsselt"],
      },
    },
    keys: {
      eyebrow: "Passwort und Schlüssel",
      title: "Dein Passwort erreicht den Server nie",
      items: [
        {
          title: "Zwei Schlüssel aus einem Passwort",
          text: "Dein Browser schickt das Passwort durch Argon2id und leitet daraus einen Anmeldeschlüssel und einen Verschlüsselungsschlüssel ab. Der Server bekommt nur den Anmeldeschlüssel, und daraus lässt sich das Passwort nicht zurückgewinnen.",
        },
        {
          title: "Dein privater Schlüssel bleibt verschlossen",
          text: "Bei der Registrierung erzeugt dein Browser ein X25519-Schlüsselpaar. Mit dem öffentlichen Schlüssel verschlüsselt der Server eingehende Post. Der private wird nur verschlüsselt mit deinem Verschlüsselungsschlüssel gespeichert.",
        },
        {
          title: "Recovery-Phrase",
          text: "24 Wörter, die eine zweite Kopie deines privaten Schlüssels öffnen. Wir zeigen die Phrase einmal, und sie erreicht den Server nie. Wiederherstellung damit kommt später, speichern musst du sie aber schon jetzt.",
        },
        {
          title: "Statt Captcha",
          text: "Gegen Massenregistrierungen löst dein Browser ein paar Sekunden lang eine Rechenaufgabe. Keine Captchas von Dritten und keine ihrer Skripte.",
        },
      ],
    },
    model: {
      eyebrow: "Bedrohungsmodell",
      title: "Was wir schützen und was nicht",
      lede: "Wir gehen vom Schlimmsten aus: Angreifer kann jeder sein, der einen vollständigen Dump von Datenbank, Logs und Festplatte hat. Auch wir selbst.",
      protectsTitle: "Wir schützen",
      protects: [
        "Den Inhalt deiner Post, wenn Datenbank oder Backup geleakt werden: Dort liegt nur Chiffretext.",
        "Dein Passwort: Der Server bekommt es weder bei der Registrierung noch bei der Anmeldung.",
        "Die Verbindung zwischen deinen Adressen: Sie sind zufällig und verraten weder deinen Login noch einander.",
        "Ob du eine Nachricht geöffnet hast: Externe Bilder und Tracking-Pixel sind ausgeblendet.",
        "Adressbezeichnungen und Ordnernamen: Sie werden in deinem Browser verschlüsselt.",
        "Sitzungen: Das Cookie ist für Skripte unerreichbar, jede Sitzung lässt sich beenden, und standardmäßig ist sie an deine IP gebunden.",
      ],
      limitsTitle: "Wir schützen nicht",
      limits: [
        "Eine Nachricht im Moment des Empfangs. Gewöhnliche Post kommt im Klartext an, und ein kompromittierter Server könnte neue Nachrichten vor der Verschlüsselung lesen. Bereits gespeicherte bleiben verschlossen.",
        "Metadaten. Der Server sieht, wann und an welche Adresse eine Nachricht kam, ihre Größe und die Absenderprüfungen.",
        "Manipulierten Website-Code. Die App wird von unserem Server geladen. Ist der Server kompromittiert, könnte dein Browser Code bekommen, der dein Passwort abgreift.",
        "Ein infiziertes Gerät. Malware oder eine Browser-Erweiterung, die den offenen Tab sieht, sieht auch deine Post.",
        "Ein schwaches Passwort. Mit einem Datenbank-Dump lässt sich das Passwort offline erraten. Argon2id macht jeden Versuch teuer, wirklich hilft aber nur ein langes, einzigartiges Passwort.",
        "Deine IP während der Verbindung. Der Server sieht sie, auch wenn er sie nicht speichert. Wenn dir das wichtig ist, verbinde dich über Tor oder ein VPN.",
        "Ein vergessenes Passwort zusammen mit einer verlorenen Phrase. Ohne beides kann niemand Zugang und Post wiederherstellen, auch wir nicht.",
      ],
    },
    adversaries: {
      title: "Wer angreifen könnte und was er bekommt",
      whoLabel: "Wer",
      getsLabel: "Was er bekommt",
      rows: [
        {
          who: "Angreifer von außen",
          gets: "Ausprobieren und Phishing stoßen auf Anfragelimits, Proof-of-Work und Warnmarkierungen. HTML aus Nachrichten wird in einem isolierten Rahmen ohne Skripte angezeigt.",
        },
        {
          who: "Inhaber eines anderen Kontos",
          gets: "Nichts. Jede Anfrage prüft, dass die Ressource dir gehört, und eine fremde sieht aus, als gäbe es sie nicht.",
        },
        {
          who: "Sitzungsdieb",
          gets: "Das Cookie ist für Skripte unerreichbar und enthält keine Schlüssel. Konto oder dauerhafte Adresse löschen verlangt erneut das Passwort.",
        },
        {
          who: "Leak von Datenbank oder Backup",
          gets: "Verschlüsselte Post, verschlüsselte Schlüssel, IP-Hashes und Metadaten. Ohne dein Passwort bleibt die Post unlesbar, ein schwaches Passwort lässt sich aber erraten.",
        },
        {
          who: "Server-Betreiber",
          gets: "Metadaten und neue Nachrichten im Moment des Empfangs. Gespeicherte Post bleibt auch für ihn ohne dein Passwort verschlossen.",
        },
        {
          who: "Spammer",
          gets: "Jede Registrierung kostet Rechenzeit und stößt an Limits.",
        },
      ],
    },
    data: {
      title: "Was wir über dich speichern",
      storedTitle: "Gespeichert",
      stored: [
        "Dein Login. Er dient nur zur Anmeldung und wird niemandem gezeigt.",
        "Ein Hash deines Anmeldeschlüssels und das Salt zur Schlüsselableitung.",
        "Dein öffentlicher Schlüssel und zwei verschlüsselte Kopien des privaten.",
        "Deine Adressen, ihre verschlüsselten Bezeichnungen und Ordner.",
        "Nachrichten als Chiffretext, dazu Empfangszeit, Größe und Ergebnisse der Absenderprüfung.",
        "Sitzungen: Browser und Betriebssystem ohne Details, Daten auf den Tag genau, ein IP-Hash höchstens 30 Tage.",
      ],
      neverTitle: "Nie gespeichert",
      never: [
        "Telefonnummer, Ersatz-E-Mail, Name.",
        "Dein Passwort und deine Recovery-Phrase.",
        "Deine IP-Adresse im Klartext und der vollständige User-Agent.",
        "Analytics, Tracker, Skripte und Schriften von Dritten.",
      ],
    },
  },
};
