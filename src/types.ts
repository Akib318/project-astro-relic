export type PlanetId = 'moon' | 'mars';
export type Language = 'en' | 'bn';

export interface ChatMessage {
  id: string;
  role: 'user' | 'relic' | 'assistant';
  text: string;
  timestamp: number;
}

export interface RelicComponent {
  id: string;
  name: string;
  nameBn: string;
  category: string;
  kidMetaphor: string;
  kidMetaphorBn: string;
  description: string;
  descriptionBn: string;
}

export interface RelicGalleryImage {
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
  category: string;
  credit: string;
}

export interface RelicQuestion {
  en: string;
  bn: string;
}

export interface RelicData {
  id: string;
  name: string;
  nameBn: string;
  codeName: string;
  coordinates: string;
  planet: PlanetId;
  landingDate: string;
  landingDateBn: string;
  activeDuration: string;
  activeDurationBn: string;
  finalMessage: string;
  finalMessageBn: string;
  audioTrackName: string;
  audioTrackDescription: string;
  audioTrackDescriptionBn: string;
  fairyTaleIntro: string;
  fairyTaleIntroBn: string;
  heroicStory: string;
  heroicStoryBn: string;
  badgeIcon: string;
  badgeTitle: string;
  badgeTitleBn: string;
  components: RelicComponent[];
  suggestedQuestions: RelicQuestion[];
  galleryImages: RelicGalleryImage[];
}
