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
      "voice_narration": "Listen to Insight"
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
      "voice_narration": "Bilgelik Sesini Dinle"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
