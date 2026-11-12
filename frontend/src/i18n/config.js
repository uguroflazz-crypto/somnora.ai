import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "welcome": "Welcome to Somnora",
      "analyze_dream": "Analyze Dream",
      "set_intention": "Set Intention",
      "symbol_map": "Personal Symbol Map",
      "placeholder_dream": "Describe your dream in detail...",
      "physical_layer": "Physical Layer",
      "mental_layer": "Mental Layer",
      "spiritual_layer": "Spiritual Layer",
      "synthesis": "Synthesis",
      "incubation_title": "Dream Incubation",
      "intention_label": "What do you wish to uncover tonight?",
      "save_intention": "Seal Intention",
      "auth_login": "Enter the Sanctuary",
      "auth_signup": "Begin Journey",
      "logout": "Leave Sanctuary",
      "unveil_hidden": "Unveil the hidden architectures of your psyche.",
      "decoding": "Decoding...",
      "synthesize": "Synthesize",
      "error_analysis": "Analysis failed. Please try again.",
      "voice_narration": "Listen to Insight",
      "nav_analyze": "Analyze",
      "nav_incubation": "Incubation",
      "nav_symbols": "Symbols",
      "awakening": "Awakening...",
      "auth_tagline": "A sanctuary for the language of your dreams.",
      "auth_email": "Email",
      "auth_password": "Password",
      "auth_switch_to_signup": "New here? Begin your journey",
      "auth_switch_to_login": "Already a dreamer? Enter the sanctuary",
      "auth_check_email": "Check your inbox to confirm your email, then sign in.",
      "auth_error": "Authentication failed. Please check your details.",
      "auth_not_configured": "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
      "incubation_subtitle": "Plant the seed of inquiry before the veil drops. Tonight, your mind shall seek answers.",
      "intention_sealed": "Sealed Into Spirit",
      "error_intention": "Could not seal your intention. Please try again.",
      "link_intention": "Link to an intention (optional)",
      "no_intention": "No intention",
      "symbol_resonance": "Symbol Resonance",
      "symbol_subtitle": "Visualizing the recurring geometry of your unconscious.",
      "symbols_empty": "No symbols yet. Analyze a dream to begin mapping your inner landscape.",
      "error_symbols": "Could not load your symbols.",
      "error_narration": "Narration is unavailable right now.",
      "stop": "Stop",
      "language": "Language"
    }
  },
  tr: {
    translation: {
      "welcome": "Somnora'ya Hoş Geldiniz",
      "analyze_dream": "Rüyayı Analiz Et",
      "set_intention": "Niyet Belirle",
      "symbol_map": "Kişisel Sembol Haritası",
      "placeholder_dream": "Rüyanızı detaylıca anlatın...",
      "physical_layer": "Fiziksel Katman",
      "mental_layer": "Zihinsel Katman",
      "spiritual_layer": "Ruhsal Katman",
      "synthesis": "Sentez",
      "incubation_title": "Rüya Kuluçka",
      "intention_label": "Bu gece neyi keşfetmek istiyorsunuz?",
      "save_intention": "Niyeti Mühürle",
      "auth_login": "Sığınağa Gir",
      "auth_signup": "Yolculuğa Başla",
      "logout": "Sığınaktan Ayrıl",
      "unveil_hidden": "Psişenin gizli mimarilerini ortaya çıkar.",
      "decoding": "Çözülüyor...",
      "synthesize": "Sentezle",
      "error_analysis": "Analiz başarısız oldu. Lütfen tekrar deneyin.",
      "voice_narration": "Bilgelik Sesini Dinle",
      "nav_analyze": "Analiz",
      "nav_incubation": "Kuluçka",
      "nav_symbols": "Semboller",
      "awakening": "Uyanılıyor...",
      "auth_tagline": "Rüyalarının dili için bir sığınak.",
      "auth_email": "E-posta",
      "auth_password": "Şifre",
      "auth_switch_to_signup": "Yeni misin? Yolculuğuna başla",
      "auth_switch_to_login": "Zaten bir rüyacı mısın? Sığınağa gir",
      "auth_check_email": "E-postanı doğrulamak için gelen kutunu kontrol et, sonra giriş yap.",
      "auth_error": "Kimlik doğrulama başarısız. Bilgilerini kontrol et.",
      "auth_not_configured": "Supabase yapılandırılmamış. VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY değerlerini girin.",
      "incubation_subtitle": "Perde inmeden önce sorgunun tohumunu ek. Bu gece zihnin cevapları arayacak.",
      "intention_sealed": "Ruha Mühürlendi",
      "error_intention": "Niyet mühürlenemedi. Lütfen tekrar deneyin.",
      "link_intention": "Bir niyete bağla (isteğe bağlı)",
      "no_intention": "Niyet yok",
      "symbol_resonance": "Sembol Rezonansı",
      "symbol_subtitle": "Bilinçaltının tekrar eden geometrisini görselleştir.",
      "symbols_empty": "Henüz sembol yok. İç dünyanı haritalamak için bir rüya analiz et.",
      "error_symbols": "Sembollerin yüklenemedi.",
      "error_narration": "Seslendirme şu anda kullanılamıyor.",
      "stop": "Durdur",
      "language": "Dil"
    }
  }
};

const LANGUAGE_KEY = 'somnora.language';
const SUPPORTED = ['en', 'tr'];

const storedLanguage = typeof window !== 'undefined' ? window.localStorage.getItem(LANGUAGE_KEY) : null;
const browserLanguage = typeof navigator !== 'undefined' ? navigator.language?.slice(0, 2) : null;
const initialLanguage = [storedLanguage, browserLanguage].find((lng) => SUPPORTED.includes(lng)) ?? 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') window.localStorage.setItem(LANGUAGE_KEY, lng);
  if (typeof document !== 'undefined') document.documentElement.lang = lng;
});

export const SUPPORTED_LANGUAGES = SUPPORTED;
export default i18n;
