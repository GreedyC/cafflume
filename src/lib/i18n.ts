export const locales = ["en", "tr", "es", "de", "no", "ja", "ko"] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: "English",
  tr: "Türkçe",
  es: "Español",
  de: "Deutsch",
  no: "Norsk",
  ja: "日本語",
  ko: "한국어"
};

export function isLocale(value: string | undefined): value is Locale {
  return locales.includes(value as Locale);
}

export type CopyKey = keyof typeof copy.en;

const copy = {
  en: {
    overview: "Overview", beans: "Beans", brews: "Brews", cupping: "Cupping", play: "Play", settings: "Settings", team: "Team",
    newBrew: "New brew", language: "Language", logout: "Sign out", liveBrew: "Live brew", repeatLast: "Repeat last brew",
    startBrew: "Start brew", pause: "Pause", resume: "Resume", finishRate: "Finish & rate", saveDraft: "Save draft",
    activeBean: "Active bean", recipe: "Recipe", timer: "Timer", recentBrews: "Recent brews", activeBeans: "Active beans",
    viewAll: "View all", newCupping: "New cupping", cuppingSessions: "Cupping sessions", noCuppings: "No cupping sessions yet", workspace:"Workspace", account:"Account", tagline:"Measure · brew · learn", admin:"Admin", member:"Member", primaryNav:"Primary navigation", accountNav:"Account navigation", mobileNav:"Mobile navigation",
    personalScore: "Personal score", ready: "Ready", dose: "Dose", water: "Water", temperature: "Water temperature", grind: "Grind",
    ratio: "Ratio", method: "Method", result: "Result", notes: "Notes", save: "Save", cancel: "Cancel",
    liveHint: "Repeat a proven recipe or change one variable at a time.", noActiveCoffee: "No active coffee", addCoffeeBegin: "Add a coffee to begin",
    newCoffeeComparison: "New coffee selected · comparison starts after its first brew.", baselineRecipe: "Baseline recipe · change one field to run a controlled comparison.", variablesChanged: "variables changed · return to one change for a clean comparison.", reset: "Reset",
    roastAgeAction: "Roast age and next action", latestChanges: "Your latest recipe changes", sensorySessions: "Structured sensory sessions", brew: "Brew", cup: "Cup", repeat: "Repeat", addOne: "Add one", noActiveCoffees: "No active coffees.", noBrews: "No brews recorded yet.", noSessions: "No sessions yet.", createFirstCupping: "Create the first cupping", daysAgo: "days ago"
  },
  tr: {
    overview: "Genel bakış", beans: "Çekirdekler", brews: "Demlemeler", cupping: "Cupping", play: "Oyun", settings: "Ayarlar", team: "Ekip",
    newBrew: "Yeni demleme", language: "Dil", logout: "Çıkış yap", liveBrew: "Canlı demleme", repeatLast: "Son demlemeyi tekrarla",
    startBrew: "Demlemeyi başlat", pause: "Duraklat", resume: "Devam et", finishRate: "Bitir ve puanla", saveDraft: "Taslağı kaydet",
    activeBean: "Aktif çekirdek", recipe: "Reçete", timer: "Sayaç", recentBrews: "Son demlemeler", activeBeans: "Aktif çekirdekler",
    viewAll: "Tümünü gör", newCupping: "Yeni cupping", cuppingSessions: "Cupping oturumları", noCuppings: "Henüz cupping oturumu yok", workspace:"Çalışma alanı", account:"Hesap", tagline:"Ölç · demle · öğren", admin:"Yönetici", member:"Üye", primaryNav:"Ana navigasyon", accountNav:"Hesap navigasyonu", mobileNav:"Mobil navigasyon",
    personalScore: "Kişisel puan", ready: "Hazır", dose: "Doz", water: "Su", temperature: "Su sıcaklığı", grind: "Öğütüm",
    ratio: "Oran", method: "Yöntem", result: "Sonuç", notes: "Notlar", save: "Kaydet", cancel: "İptal",
    liveHint: "Kanıtlanmış bir reçeteyi tekrarla veya her seferinde tek değişkeni değiştir.", noActiveCoffee: "Aktif çekirdek yok", addCoffeeBegin: "Başlamak için çekirdek ekle",
    newCoffeeComparison: "Yeni çekirdek seçildi · karşılaştırma ilk demlemeden sonra başlayacak.", baselineRecipe: "Temel reçete · kontrollü karşılaştırma için tek alanı değiştir.", variablesChanged: "değişken değişti · temiz karşılaştırma için tek değişkene dön.", reset: "Sıfırla",
    roastAgeAction: "Kavrum yaşı ve sıradaki işlem", latestChanges: "Son reçete değişikliklerin", sensorySessions: "Yapılandırılmış duyusal oturumlar", brew: "Demle", cup: "Cupping", repeat: "Tekrarla", addOne: "Ekle", noActiveCoffees: "Aktif çekirdek yok.", noBrews: "Henüz demleme kaydı yok.", noSessions: "Henüz oturum yok.", createFirstCupping: "İlk cupping kaydını oluştur", daysAgo: "gün önce"
  },
  es: {
    overview: "Resumen", beans: "Cafés", brews: "Preparaciones", cupping: "Cata", play: "Jugar", settings: "Ajustes", team: "Equipo",
    newBrew: "Nueva preparación", language: "Idioma", logout: "Cerrar sesión", liveBrew: "Preparación en vivo", repeatLast: "Repetir la última",
    startBrew: "Iniciar", pause: "Pausar", resume: "Continuar", finishRate: "Finalizar y puntuar", saveDraft: "Guardar borrador",
    activeBean: "Café activo", recipe: "Receta", timer: "Temporizador", recentBrews: "Preparaciones recientes", activeBeans: "Cafés activos",
    viewAll: "Ver todo", newCupping: "Nueva cata", cuppingSessions: "Sesiones de cata", noCuppings: "Aún no hay catas", workspace:"Espacio de trabajo", account:"Cuenta", tagline:"Mide · prepara · aprende", admin:"Administrador", member:"Miembro", primaryNav:"Navegación principal", accountNav:"Navegación de cuenta", mobileNav:"Navegación móvil",
    personalScore: "Puntuación personal", ready: "Listo", dose: "Dosis", water: "Agua", temperature: "Temperatura", grind: "Molienda",
    ratio: "Proporción", method: "Método", result: "Resultado", notes: "Notas", save: "Guardar", cancel: "Cancelar",
    liveHint: "Repite una receta probada o cambia una variable cada vez.", noActiveCoffee: "Sin café activo", addCoffeeBegin: "Añade un café para empezar", newCoffeeComparison: "Nuevo café seleccionado · la comparación comienza tras su primera preparación.", baselineRecipe: "Receta base · cambia un campo para una comparación controlada.", variablesChanged: "variables cambiadas · vuelve a un solo cambio para comparar bien.", reset: "Restablecer", roastAgeAction: "Edad del tueste y siguiente acción", latestChanges: "Tus últimos cambios de receta", sensorySessions: "Sesiones sensoriales estructuradas", brew: "Preparar", cup: "Catar", repeat: "Repetir", addOne: "Añadir", noActiveCoffees: "No hay cafés activos.", noBrews: "Aún no hay preparaciones.", noSessions: "Aún no hay sesiones.", createFirstCupping: "Crear la primera cata", daysAgo: "días"
  },
  de: {
    overview: "Übersicht", beans: "Bohnen", brews: "Brühungen", cupping: "Cupping", play: "Spiel", settings: "Einstellungen", team: "Team",
    newBrew: "Neue Brühung", language: "Sprache", logout: "Abmelden", liveBrew: "Live-Brühung", repeatLast: "Letzte wiederholen",
    startBrew: "Brühung starten", pause: "Pause", resume: "Fortsetzen", finishRate: "Beenden & bewerten", saveDraft: "Entwurf speichern",
    activeBean: "Aktive Bohne", recipe: "Rezept", timer: "Timer", recentBrews: "Letzte Brühungen", activeBeans: "Aktive Bohnen",
    viewAll: "Alle anzeigen", newCupping: "Neues Cupping", cuppingSessions: "Cupping-Sitzungen", noCuppings: "Noch keine Cuppings", workspace:"Arbeitsbereich", account:"Konto", tagline:"Messen · brühen · lernen", admin:"Admin", member:"Mitglied", primaryNav:"Hauptnavigation", accountNav:"Kontonavigation", mobileNav:"Mobile Navigation",
    personalScore: "Persönliche Wertung", ready: "Bereit", dose: "Dosis", water: "Wasser", temperature: "Wassertemperatur", grind: "Mahlgrad",
    ratio: "Verhältnis", method: "Methode", result: "Ergebnis", notes: "Notizen", save: "Speichern", cancel: "Abbrechen", liveHint: "Bewährtes Rezept wiederholen oder jeweils nur eine Variable ändern.", noActiveCoffee: "Kein aktiver Kaffee", addCoffeeBegin: "Kaffee hinzufügen, um zu beginnen", newCoffeeComparison: "Neuer Kaffee gewählt · Vergleich beginnt nach der ersten Brühung.", baselineRecipe: "Basisrezept · ein Feld für einen kontrollierten Vergleich ändern.", variablesChanged: "Variablen geändert · für einen klaren Vergleich auf eine Änderung zurückkehren.", reset: "Zurücksetzen", roastAgeAction: "Röstalter und nächste Aktion", latestChanges: "Deine letzten Rezeptänderungen", sensorySessions: "Strukturierte sensorische Sitzungen", brew: "Brühen", cup: "Verkosten", repeat: "Wiederholen", addOne: "Hinzufügen", noActiveCoffees: "Keine aktiven Kaffees.", noBrews: "Noch keine Brühungen.", noSessions: "Noch keine Sitzungen.", createFirstCupping: "Erstes Cupping erstellen", daysAgo: "Tage"
  },
  no: {
    overview: "Oversikt", beans: "Bønner", brews: "Brygg", cupping: "Cupping", play: "Spill", settings: "Innstillinger", team: "Team",
    newBrew: "Nytt brygg", language: "Språk", logout: "Logg ut", liveBrew: "Aktivt brygg", repeatLast: "Gjenta siste brygg",
    startBrew: "Start brygg", pause: "Pause", resume: "Fortsett", finishRate: "Avslutt og vurder", saveDraft: "Lagre utkast",
    activeBean: "Aktiv bønne", recipe: "Oppskrift", timer: "Timer", recentBrews: "Nylige brygg", activeBeans: "Aktive bønner",
    viewAll: "Vis alle", newCupping: "Ny cupping", cuppingSessions: "Cuppingøkter", noCuppings: "Ingen cuppingøkter ennå", workspace:"Arbeidsområde", account:"Konto", tagline:"Mål · brygg · lær", admin:"Administrator", member:"Medlem", primaryNav:"Hovednavigasjon", accountNav:"Kontonavigasjon", mobileNav:"Mobilnavigasjon",
    personalScore: "Personlig poeng", ready: "Klar", dose: "Dose", water: "Vann", temperature: "Vanntemperatur", grind: "Kverningsgrad",
    ratio: "Forhold", method: "Metode", result: "Resultat", notes: "Notater", save: "Lagre", cancel: "Avbryt", liveHint: "Gjenta en velprøvd oppskrift eller endre én variabel om gangen.", noActiveCoffee: "Ingen aktiv kaffe", addCoffeeBegin: "Legg til kaffe for å begynne", newCoffeeComparison: "Ny kaffe valgt · sammenligningen starter etter første brygg.", baselineRecipe: "Grunnoppskrift · endre ett felt for en kontrollert sammenligning.", variablesChanged: "variabler endret · gå tilbake til én endring for en ren sammenligning.", reset: "Nullstill", roastAgeAction: "Brenningsalder og neste handling", latestChanges: "Dine siste oppskriftsendringer", sensorySessions: "Strukturerte sensoriske økter", brew: "Brygg", cup: "Smak", repeat: "Gjenta", addOne: "Legg til", noActiveCoffees: "Ingen aktive kaffer.", noBrews: "Ingen brygg registrert ennå.", noSessions: "Ingen økter ennå.", createFirstCupping: "Opprett første cupping", daysAgo: "dager siden"
  },
  ja: {
    overview: "概要", beans: "豆", brews: "抽出記録", cupping: "カッピング", play: "ゲーム", settings: "設定", team: "チーム",
    newBrew: "新しい抽出", language: "言語", logout: "ログアウト", liveBrew: "ライブ抽出", repeatLast: "前回を再現",
    startBrew: "抽出開始", pause: "一時停止", resume: "再開", finishRate: "終了して評価", saveDraft: "下書き保存",
    activeBean: "使用中の豆", recipe: "レシピ", timer: "タイマー", recentBrews: "最近の抽出", activeBeans: "使用中の豆",
    viewAll: "すべて表示", newCupping: "新規カッピング", cuppingSessions: "カッピング記録", noCuppings: "カッピング記録はありません", workspace:"ワークスペース", account:"アカウント", tagline:"計測 · 抽出 · 学習", admin:"管理者", member:"メンバー", primaryNav:"メインナビゲーション", accountNav:"アカウントナビゲーション", mobileNav:"モバイルナビゲーション",
    personalScore: "個人スコア", ready: "準備完了", dose: "豆量", water: "湯量", temperature: "湯温", grind: "挽き目",
    ratio: "比率", method: "方法", result: "結果", notes: "メモ", save: "保存", cancel: "キャンセル", liveHint: "実績のあるレシピを再現するか、一度に一つの変数だけ変更します。", noActiveCoffee: "使用中のコーヒーはありません", addCoffeeBegin: "開始するにはコーヒーを追加してください", newCoffeeComparison: "新しいコーヒーを選択しました · 初回抽出後に比較を開始します。", baselineRecipe: "基準レシピ · 管理された比較のため一項目だけ変更してください。", variablesChanged: "項目が変更されています · 正確な比較には一項目だけ変更してください。", reset: "リセット", roastAgeAction: "焙煎日数と次の操作", latestChanges: "最近のレシピ変更", sensorySessions: "構造化された官能評価", brew: "抽出", cup: "カッピング", repeat: "再現", addOne: "追加", noActiveCoffees: "使用中のコーヒーはありません。", noBrews: "抽出記録はまだありません。", noSessions: "セッションはまだありません。", createFirstCupping: "最初のカッピングを作成", daysAgo: "日前"
  },
  ko: {
    overview: "개요", beans: "원두", brews: "브루 기록", cupping: "커핑", play: "게임", settings: "설정", team: "팀",
    newBrew: "새 브루", language: "언어", logout: "로그아웃", liveBrew: "라이브 브루", repeatLast: "마지막 브루 반복",
    startBrew: "브루 시작", pause: "일시정지", resume: "계속", finishRate: "완료 및 평가", saveDraft: "임시 저장",
    activeBean: "활성 원두", recipe: "레시피", timer: "타이머", recentBrews: "최근 브루", activeBeans: "활성 원두",
    viewAll: "모두 보기", newCupping: "새 커핑", cuppingSessions: "커핑 세션", noCuppings: "아직 커핑 기록이 없습니다", workspace:"작업 공간", account:"계정", tagline:"측정 · 추출 · 학습", admin:"관리자", member:"멤버", primaryNav:"기본 탐색", accountNav:"계정 탐색", mobileNav:"모바일 탐색",
    personalScore: "개인 점수", ready: "준비됨", dose: "도징", water: "물", temperature: "물 온도", grind: "분쇄도",
    ratio: "비율", method: "방식", result: "결과", notes: "메모", save: "저장", cancel: "취소", liveHint: "검증된 레시피를 반복하거나 한 번에 변수 하나만 변경하세요.", noActiveCoffee: "활성 원두 없음", addCoffeeBegin: "시작하려면 원두를 추가하세요", newCoffeeComparison: "새 원두 선택됨 · 첫 추출 후 비교가 시작됩니다.", baselineRecipe: "기준 레시피 · 통제된 비교를 위해 한 항목만 변경하세요.", variablesChanged: "개 변수가 변경됨 · 정확한 비교를 위해 하나만 변경하세요.", reset: "초기화", roastAgeAction: "로스팅 경과와 다음 작업", latestChanges: "최근 레시피 변경", sensorySessions: "구조화된 관능 세션", brew: "추출", cup: "커핑", repeat: "반복", addOne: "추가", noActiveCoffees: "활성 원두가 없습니다.", noBrews: "아직 추출 기록이 없습니다.", noSessions: "아직 세션이 없습니다.", createFirstCupping: "첫 커핑 만들기", daysAgo: "일 전"
  }
} satisfies Record<Locale, Record<string, string>>;

export function translator(locale: Locale) {
  return (key: CopyKey) => copy[locale][key] ?? copy.en[key];
}
