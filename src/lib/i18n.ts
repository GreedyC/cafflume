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
    viewAll: "View all", newCupping: "New cupping", cuppingSessions: "Cupping sessions", noCuppings: "No cupping sessions yet",
    personalScore: "Personal score", ready: "Ready", dose: "Dose", water: "Water", temperature: "Water temperature", grind: "Grind",
    ratio: "Ratio", method: "Method", result: "Result", notes: "Notes", save: "Save", cancel: "Cancel"
  },
  tr: {
    overview: "Genel bakış", beans: "Çekirdekler", brews: "Demlemeler", cupping: "Cupping", play: "Oyun", settings: "Ayarlar", team: "Ekip",
    newBrew: "Yeni demleme", language: "Dil", logout: "Çıkış yap", liveBrew: "Canlı demleme", repeatLast: "Son demlemeyi tekrarla",
    startBrew: "Demlemeyi başlat", pause: "Duraklat", resume: "Devam et", finishRate: "Bitir ve puanla", saveDraft: "Taslağı kaydet",
    activeBean: "Aktif çekirdek", recipe: "Reçete", timer: "Sayaç", recentBrews: "Son demlemeler", activeBeans: "Aktif çekirdekler",
    viewAll: "Tümünü gör", newCupping: "Yeni cupping", cuppingSessions: "Cupping oturumları", noCuppings: "Henüz cupping oturumu yok",
    personalScore: "Kişisel puan", ready: "Hazır", dose: "Doz", water: "Su", temperature: "Su sıcaklığı", grind: "Öğütüm",
    ratio: "Oran", method: "Yöntem", result: "Sonuç", notes: "Notlar", save: "Kaydet", cancel: "İptal"
  },
  es: {
    overview: "Resumen", beans: "Cafés", brews: "Preparaciones", cupping: "Cata", play: "Jugar", settings: "Ajustes", team: "Equipo",
    newBrew: "Nueva preparación", language: "Idioma", logout: "Cerrar sesión", liveBrew: "Preparación en vivo", repeatLast: "Repetir la última",
    startBrew: "Iniciar", pause: "Pausar", resume: "Continuar", finishRate: "Finalizar y puntuar", saveDraft: "Guardar borrador",
    activeBean: "Café activo", recipe: "Receta", timer: "Temporizador", recentBrews: "Preparaciones recientes", activeBeans: "Cafés activos",
    viewAll: "Ver todo", newCupping: "Nueva cata", cuppingSessions: "Sesiones de cata", noCuppings: "Aún no hay catas",
    personalScore: "Puntuación personal", ready: "Listo", dose: "Dosis", water: "Agua", temperature: "Temperatura", grind: "Molienda",
    ratio: "Proporción", method: "Método", result: "Resultado", notes: "Notas", save: "Guardar", cancel: "Cancelar"
  },
  de: {
    overview: "Übersicht", beans: "Bohnen", brews: "Brühungen", cupping: "Cupping", play: "Spiel", settings: "Einstellungen", team: "Team",
    newBrew: "Neue Brühung", language: "Sprache", logout: "Abmelden", liveBrew: "Live-Brühung", repeatLast: "Letzte wiederholen",
    startBrew: "Brühung starten", pause: "Pause", resume: "Fortsetzen", finishRate: "Beenden & bewerten", saveDraft: "Entwurf speichern",
    activeBean: "Aktive Bohne", recipe: "Rezept", timer: "Timer", recentBrews: "Letzte Brühungen", activeBeans: "Aktive Bohnen",
    viewAll: "Alle anzeigen", newCupping: "Neues Cupping", cuppingSessions: "Cupping-Sitzungen", noCuppings: "Noch keine Cuppings",
    personalScore: "Persönliche Wertung", ready: "Bereit", dose: "Dosis", water: "Wasser", temperature: "Wassertemperatur", grind: "Mahlgrad",
    ratio: "Verhältnis", method: "Methode", result: "Ergebnis", notes: "Notizen", save: "Speichern", cancel: "Abbrechen"
  },
  no: {
    overview: "Oversikt", beans: "Bønner", brews: "Brygg", cupping: "Cupping", play: "Spill", settings: "Innstillinger", team: "Team",
    newBrew: "Nytt brygg", language: "Språk", logout: "Logg ut", liveBrew: "Aktivt brygg", repeatLast: "Gjenta siste brygg",
    startBrew: "Start brygg", pause: "Pause", resume: "Fortsett", finishRate: "Avslutt og vurder", saveDraft: "Lagre utkast",
    activeBean: "Aktiv bønne", recipe: "Oppskrift", timer: "Timer", recentBrews: "Nylige brygg", activeBeans: "Aktive bønner",
    viewAll: "Vis alle", newCupping: "Ny cupping", cuppingSessions: "Cuppingøkter", noCuppings: "Ingen cuppingøkter ennå",
    personalScore: "Personlig poeng", ready: "Klar", dose: "Dose", water: "Vann", temperature: "Vanntemperatur", grind: "Kverningsgrad",
    ratio: "Forhold", method: "Metode", result: "Resultat", notes: "Notater", save: "Lagre", cancel: "Avbryt"
  },
  ja: {
    overview: "概要", beans: "豆", brews: "抽出記録", cupping: "カッピング", play: "ゲーム", settings: "設定", team: "チーム",
    newBrew: "新しい抽出", language: "言語", logout: "ログアウト", liveBrew: "ライブ抽出", repeatLast: "前回を再現",
    startBrew: "抽出開始", pause: "一時停止", resume: "再開", finishRate: "終了して評価", saveDraft: "下書き保存",
    activeBean: "使用中の豆", recipe: "レシピ", timer: "タイマー", recentBrews: "最近の抽出", activeBeans: "使用中の豆",
    viewAll: "すべて表示", newCupping: "新規カッピング", cuppingSessions: "カッピング記録", noCuppings: "カッピング記録はありません",
    personalScore: "個人スコア", ready: "準備完了", dose: "豆量", water: "湯量", temperature: "湯温", grind: "挽き目",
    ratio: "比率", method: "方法", result: "結果", notes: "メモ", save: "保存", cancel: "キャンセル"
  },
  ko: {
    overview: "개요", beans: "원두", brews: "브루 기록", cupping: "커핑", play: "게임", settings: "설정", team: "팀",
    newBrew: "새 브루", language: "언어", logout: "로그아웃", liveBrew: "라이브 브루", repeatLast: "마지막 브루 반복",
    startBrew: "브루 시작", pause: "일시정지", resume: "계속", finishRate: "완료 및 평가", saveDraft: "임시 저장",
    activeBean: "활성 원두", recipe: "레시피", timer: "타이머", recentBrews: "최근 브루", activeBeans: "활성 원두",
    viewAll: "모두 보기", newCupping: "새 커핑", cuppingSessions: "커핑 세션", noCuppings: "아직 커핑 기록이 없습니다",
    personalScore: "개인 점수", ready: "준비됨", dose: "도징", water: "물", temperature: "물 온도", grind: "분쇄도",
    ratio: "비율", method: "방식", result: "결과", notes: "메모", save: "저장", cancel: "취소"
  }
} satisfies Record<Locale, Record<string, string>>;

export function translator(locale: Locale) {
  return (key: CopyKey) => copy[locale][key] ?? copy.en[key];
}
