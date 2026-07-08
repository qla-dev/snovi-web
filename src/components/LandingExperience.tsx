import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  BookOpen,
  Gift,
  Heart,
  LoaderCircle,
  Lock,
  Pause,
  Play,
  Radio,
  RotateCcw,
  RotateCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  User,
} from 'lucide-react';
import type { Language } from '../translations';

type Category = {
  id: number;
  slug: string;
  label: string;
};

type Subcategory = {
  id: number;
  slug: string;
  label: string;
  categoryId: number | null;
};

export const AMBIENT_EFFECT_IDS = [
  'ocean',
  'rain',
  'fire',
  'leaves',
  'river',
  'birds',
  'fan',
  'snow',
  'train',
  'crickets',
] as const;

export type AmbientEffectId = (typeof AMBIENT_EFFECT_IDS)[number];
export type MixerLevelId = AmbientEffectId | 'music';
export type MixerLevels = Record<MixerLevelId, number>;

type StoryEffects = Partial<Record<AmbientEffectId, number>>;

type Story = {
  id: string;
  slug: string;
  title: string;
  narrator: string;
  duration: string;
  durationSeconds: number | null;
  image: string;
  description: string;
  categoryId: number | null;
  categoryLabel: string;
  subcategoryId: number | null;
  subcategoryLabel: string;
  locked: boolean;
  favorite: boolean;
  sound: string | null;
  musicFile: string | null;
  effects: StoryEffects;
  publishedAt: string | null;
};

type MainTabId = number | 'LIBRARY_ALL';
type SubTabId = number | 'ALL';
type BottomTabId = 'home' | 'library' | 'profile' | 'offer';

type LibraryFetchPayload = {
  baseUrl: string;
  categories: Category[];
  subcategories: Subcategory[];
  stories: Story[];
};

type HeroDeviceShowcaseProps = {
  lang: Language;
  experience: LandingExperienceState;
};

type LandingLibrarySectionProps = {
  lang: Language;
  experience: LandingExperienceState;
  badgeLabel: string;
  title: string;
  safeLabel: string;
  viewAllLabel: string;
  popularLabel: string;
  publishedLabel: string;
  comingSoonLabel: string;
};

type FixedMiniPlayerBarProps = {
  lang: Language;
  experience: LandingExperienceState;
};

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=1200';
const ALL_MAIN_TAB_ID = 'LIBRARY_ALL';
const ALL_SUB_TAB_ID = 'ALL';
const DEFAULT_MUSIC_LEVEL = 2;
const AMBIENT_EFFECT_FILE_PATHS: Record<AmbientEffectId, string> = {
  ocean: 'sounds/filter-sounds/ocean.mp3',
  rain: 'sounds/filter-sounds/storm.mp3',
  fire: 'sounds/filter-sounds/fire.mp3',
  leaves: 'sounds/filter-sounds/leaves.mp3',
  river: 'sounds/filter-sounds/river.mp3',
  birds: 'sounds/filter-sounds/birds.mp3',
  fan: 'sounds/filter-sounds/ventilator.mp3',
  snow: 'sounds/filter-sounds/polar_snow.mp3',
  train: 'sounds/filter-sounds/train.mp3',
  crickets: 'sounds/filter-sounds/crickets.mp3',
};

const BOTTOM_TABS: Array<{
  id: BottomTabId;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: Record<Language, string>;
}> = [
  { id: 'home', icon: Radio, label: { bs: 'LIVE', en: 'LIVE' } },
  { id: 'library', icon: BookOpen, label: { bs: 'BIBLIOTEKA', en: 'LIBRARY' } },
  { id: 'profile', icon: User, label: { bs: 'PROFIL', en: 'PROFILE' } },
  { id: 'offer', icon: Gift, label: { bs: 'PONUDA', en: 'OFFER' } },
];

const UI_COPY = {
  bs: {
    all: 'SVE',
    favorites: 'OMILJENO',
    searchPlaceholder: 'Pretraži naslove i naratore',
    loading: 'Učitavanje biblioteke...',
    loadFailed: 'Biblioteka trenutno nije dostupna.',
    empty: 'Nema pronađenih rezultata za odabrane filtere.',
    deviceHomeKicker: 'VEČERAS U SNOVIMA',
    deviceLibraryTitle: 'Biblioteka SNOVA',
    deviceLibraryHint: 'Filteri i kartice koriste iste podatke kao frontend.',
    deviceQueue: 'Brzi izbor',
    nowPlaying: 'TRENUTNO PUŠTENO',
    selected: 'U PLAYERU',
    previewResults: 'rezultata',
    resetFilters: 'Resetuj filtere',
    selectedStory: 'Odabrana priča',
    searchLabel: 'Pretraga',
    filterLabel: 'Filter biblioteke',
    noAudio: 'Bez audio fajla',
    openLibrary: 'Biblioteka',
  },
  en: {
    all: 'ALL',
    favorites: 'FAVORITES',
    searchPlaceholder: 'Search titles and narrators',
    loading: 'Loading library...',
    loadFailed: 'The library is currently unavailable.',
    empty: 'No stories match the selected filters.',
    deviceHomeKicker: 'TONIGHT IN SNOVI',
    deviceLibraryTitle: 'Dream Library',
    deviceLibraryHint: 'Filters and cards are using the same data as the frontend app.',
    deviceQueue: 'Quick picks',
    nowPlaying: 'NOW PLAYING',
    selected: 'IN PLAYER',
    previewResults: 'results',
    resetFilters: 'Reset filters',
    selectedStory: 'Selected story',
    searchLabel: 'Search',
    filterLabel: 'Library filter',
    noAudio: 'No audio file',
    openLibrary: 'Library',
  },
} as const;

const PRIMARY_STORY_SEARCH_KEY = 'cvrcak i mrav';

function normalizeComparableText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/gi, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function isPrimaryStory(story: Story | null | undefined) {
  if (!story) {
    return false;
  }

  return normalizeComparableText(`${story.title} ${story.slug}`).includes(PRIMARY_STORY_SEARCH_KEY);
}

function prioritizeStories<T extends Story>(stories: T[]) {
  const primaryStories: T[] = [];
  const remainingStories: T[] = [];

  stories.forEach((story) => {
    if (isPrimaryStory(story)) {
      primaryStories.push(story);
      return;
    }

    remainingStories.push(story);
  });

  return [...primaryStories, ...remainingStories];
}

function isStoryPlayable(story: Story | null | undefined) {
  return Boolean(story?.sound) && isPrimaryStory(story);
}

function uniqueStrings(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))));
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

function clampMixerLevel(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.max(0, Math.min(10, parsed));
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function toInt(value: unknown) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function resolvePublicAssetUrl(relativePath: string) {
  if (typeof document === 'undefined') {
    return relativePath;
  }

  return new URL(relativePath, document.baseURI).toString();
}

function createEmptyMixerLevels(): MixerLevels {
  return {
    music: 0,
    ocean: 0,
    rain: 0,
    fire: 0,
    leaves: 0,
    river: 0,
    birds: 0,
    fan: 0,
    snow: 0,
    train: 0,
    crickets: 0,
  };
}

function createStartedMixerFlags(): Record<MixerLevelId, boolean> {
  return {
    music: false,
    ocean: false,
    rain: false,
    fire: false,
    leaves: false,
    river: false,
    birds: false,
    fan: false,
    snow: false,
    train: false,
    crickets: false,
  };
}

function normalizeStoryEffects(rawEffects: unknown): StoryEffects {
  if (!rawEffects || typeof rawEffects !== 'object') {
    return {};
  }

  const source = rawEffects as Record<string, unknown>;

  return AMBIENT_EFFECT_IDS.reduce<StoryEffects>((accumulator, effectId) => {
    const level = clampMixerLevel(source[effectId]);
    if (level > 0) {
      accumulator[effectId] = level;
    }
    return accumulator;
  }, {});
}

function resolveStoryMusicFile(raw: Record<string, unknown>) {
  const directSource =
    raw.music_file ??
    raw.music_url ??
    raw.music_uri; 

  if (typeof directSource === 'string' && directSource) {
    return directSource;
  }

  if (!raw.music || typeof raw.music !== 'object') {
    return null;
  }

  const music = raw.music as Record<string, unknown>;
  const nestedSource = music.file ?? music.uri ?? music.url;

  return typeof nestedSource === 'string' && nestedSource ? nestedSource : null;
}

function defaultsForStory(story: Story | null): MixerLevels {
  const defaults = createEmptyMixerLevels();

  AMBIENT_EFFECT_IDS.forEach((effectId) => {
    defaults[effectId] = clampMixerLevel(story?.effects?.[effectId] ?? 0);
  });

  defaults.music = story?.musicFile ? DEFAULT_MUSIC_LEVEL : 0;

  return defaults;
}

function parseDurationSeconds(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== 'string') {
    return null;
  }

  const hhmmss = value.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (hhmmss) {
    const hoursOrMinutes = Number(hhmmss[1]);
    const minutesOrSeconds = Number(hhmmss[2]);
    const seconds = hhmmss[3] ? Number(hhmmss[3]) : minutesOrSeconds;
    const minutes = hhmmss[3] ? minutesOrSeconds : hoursOrMinutes;
    const hours = hhmmss[3] ? hoursOrMinutes : 0;
    return hours * 3600 + minutes * 60 + seconds;
  }

  const digits = value.match(/(\d+)/);
  return digits ? Number(digits[1]) * 60 : null;
}

function normalizeStory(raw: Record<string, unknown>): Story {
  return {
    id: String(raw.id ?? raw.slug ?? 'story'),
    slug: String(raw.slug ?? raw.id ?? ''),
    title: String(raw.title ?? 'SNOVI'),
    narrator: String(raw.narrator ?? 'SNOVI'),
    duration: String(raw.duration ?? '--:--'),
    durationSeconds:
      toInt(raw.duration_seconds) ??
      parseDurationSeconds(raw.duration) ??
      parseDurationSeconds(raw.duration_label),
    image: typeof raw.image === 'string' && raw.image ? raw.image : FALLBACK_IMAGE,
    description: String(raw.description ?? ''),
    categoryId: toInt(raw.category_id),
    categoryLabel: String(raw.category_label ?? raw.category ?? ''),
    subcategoryId: toInt(raw.subcategory_id),
    subcategoryLabel: String(raw.subcategory ?? raw.subcategory_label ?? ''),
    locked: Boolean(raw.locked),
    favorite: Boolean(raw.favorite),
    sound: typeof raw.sound === 'string' && raw.sound ? raw.sound : null,
    musicFile: resolveStoryMusicFile(raw),
    effects: normalizeStoryEffects(raw.effects),
    publishedAt: typeof raw.published_at === 'string' ? raw.published_at : null,
  };
}

function normalizeCategory(raw: Record<string, unknown>): Category | null {
  const id = toInt(raw.id);
  if (!id) {
    return null;
  }

  return {
    id,
    slug: String(raw.slug ?? id),
    label: String(raw.label ?? raw.slug ?? id),
  };
}

function normalizeSubcategory(raw: Record<string, unknown>): Subcategory | null {
  const id = toInt(raw.id);
  if (!id) {
    return null;
  }

  return {
    id,
    slug: String(raw.slug ?? id),
    label: String(raw.label ?? raw.slug ?? id),
    categoryId: toInt(raw.category_id),
  };
}

function deriveApiBaseCandidates() {
  const viteEnv = (import.meta as ImportMeta & { env: Record<string, string | undefined> }).env;
  return [trimTrailingSlash(viteEnv.VITE_API_BASE_URL || 'https://snovi.qla.dev')];
}

async function requestJson<T>(baseUrl: string, path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      Accept: 'application/json',
    },
    cache: 'no-store',
    signal,
  });

  if (!response.ok) {
    throw new Error(`Request failed for ${baseUrl}${path} (${response.status})`);
  }

  const payload = await response.json();
  return (payload?.data ?? payload) as T;
}

async function loadLibraryPayload(signal?: AbortSignal): Promise<LibraryFetchPayload> {
  const candidates = deriveApiBaseCandidates();
  let lastError: unknown = null;

  for (const baseUrl of candidates) {
    try {
      const [categories, subcategories, stories] = await Promise.all([
        requestJson<Array<Record<string, unknown>>>(baseUrl, '/api/categories', signal),
        requestJson<Array<Record<string, unknown>>>(baseUrl, '/api/subcategories', signal),
        requestJson<Array<Record<string, unknown>>>(baseUrl, '/api/stories?limit=1000', signal),
      ]);

      return {
        baseUrl,
        categories: categories.map(normalizeCategory).filter((item): item is Category => item !== null),
        subcategories: subcategories
          .map(normalizeSubcategory)
          .filter((item): item is Subcategory => item !== null),
        stories: prioritizeStories(stories.map(normalizeStory)),
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error('Unable to resolve a working API base URL.');
}

function getProgressRatio(currentTime: number, duration: number | null) {
  if (!duration || duration <= 0) {
    return 0;
  }

  return Math.max(0, Math.min(1, currentTime / duration));
}

export function useLandingExperience() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [apiBaseUrl, setApiBaseUrl] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [mainTab, setMainTab] = useState<MainTabId>(ALL_MAIN_TAB_ID);
  const [subTab, setSubTab] = useState<SubTabId>(ALL_SUB_TAB_ID);
  const [search, setSearch] = useState('');
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [isWaitlistModalOpen, setIsWaitlistModalOpen] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [progressRatio, setProgressRatio] = useState(0);
  const [effectLevels, setEffectLevelsState] = useState<MixerLevels>(() => createEmptyMixerLevels());
  const pendingResumeRef = useRef(false);
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);
  const effectAudioElementsRef = useRef<Partial<Record<AmbientEffectId, HTMLAudioElement>>>({});
  const startedMixerRef = useRef<Record<MixerLevelId, boolean>>(createStartedMixerFlags());
  const loadedMusicSourceRef = useRef<string | null>(null);
  const selectedStoryRef = useRef<Story | null>(null);
  const effectLevelsRef = useRef<MixerLevels>(createEmptyMixerLevels());
  const pendingStoryDefaultsOnPlayRef = useRef(false);

  const ensureAuxiliaryAudio = useCallback(() => {
    if (typeof Audio === 'undefined') {
      return;
    }

    if (musicAudioRef.current) {
      return;
    }

    const musicAudio = new Audio();
    musicAudio.preload = 'none';
    musicAudio.loop = true;
    musicAudio.volume = 0;
    musicAudioRef.current = musicAudio;

    const effectAudios: Partial<Record<AmbientEffectId, HTMLAudioElement>> = {};
    AMBIENT_EFFECT_IDS.forEach((effectId) => {
      const effectAudio = new Audio(resolvePublicAssetUrl(AMBIENT_EFFECT_FILE_PATHS[effectId]));
      effectAudio.preload = 'none';
      effectAudio.loop = true;
      effectAudio.volume = 0;
      effectAudios[effectId] = effectAudio;
    });
    effectAudioElementsRef.current = effectAudios;
  }, []);

  useEffect(() => {
    return () => {
      const musicAudio = musicAudioRef.current;
      const effectAudios = effectAudioElementsRef.current;

      AMBIENT_EFFECT_IDS.forEach((effectId) => {
        const effectAudio = effectAudios[effectId];
        if (!effectAudio) {
          return;
        }

        effectAudio.pause();
        effectAudio.removeAttribute('src');
        effectAudio.load();
      });

      if (musicAudio) {
        musicAudio.pause();
        musicAudio.removeAttribute('src');
        musicAudio.load();
      }
      musicAudioRef.current = null;
      effectAudioElementsRef.current = {};
      startedMixerRef.current = createStartedMixerFlags();
      loadedMusicSourceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      setStatus('loading');
      setErrorMessage('');
      window.__SNOVI_BOOT_MARK__?.('Library API started', 'fetching categories, subcategories, stories');
      const startedAt = performance.now();

      try {
        const payload = await loadLibraryPayload(controller.signal);
        setApiBaseUrl(payload.baseUrl);
        setCategories(payload.categories);
        setSubcategories(payload.subcategories);
        setStories(payload.stories);
        setStatus('ready');
        window.__SNOVI_BOOT_MARK__?.(
          'Library API ready',
          `${Math.round(performance.now() - startedAt)}ms, ${payload.stories.length} stories`,
        );
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        const message = error instanceof Error ? error.message : 'Unknown error';
        setErrorMessage(message);
        setStatus('error');
        window.__SNOVI_BOOT_MARK__?.(
          'Library API failed',
          `${Math.round(performance.now() - startedAt)}ms, ${message}`,
        );
      }
    };

    void load();

    return () => controller.abort();
  }, []);

  const subcategoriesByCategory = useMemo(() => {
    const map = new Map<number, Subcategory[]>();

    subcategories.forEach((subcategory) => {
      if (!subcategory.categoryId) {
        return;
      }

      const existing = map.get(subcategory.categoryId) ?? [];
      existing.push(subcategory);
      map.set(subcategory.categoryId, existing);
    });

    return map;
  }, [subcategories]);

  const filteredStories = useMemo(() => {
    const normalizedSearch = normalizeComparableText(search.trim());
    const searchMatches = (story: Story) => {
      if (!normalizedSearch) {
        return true;
      }

      return normalizeComparableText([story.title, story.narrator, story.categoryLabel, story.subcategoryLabel].join(' '))
        .includes(normalizedSearch);
    };

    let visibleStories = stories;

    if (mainTab !== ALL_MAIN_TAB_ID) {
      visibleStories = visibleStories.filter((story) => story.categoryId === mainTab);
    }

    if (typeof mainTab === 'number' && subTab !== ALL_SUB_TAB_ID) {
      visibleStories = visibleStories.filter((story) => story.subcategoryId === subTab);
    }

    return prioritizeStories(visibleStories.filter(searchMatches));
  }, [mainTab, search, stories, subTab]);

  const currentSubcategories = useMemo(() => {
    if (typeof mainTab !== 'number') {
      return [];
    }

    return subcategoriesByCategory.get(mainTab) ?? [];
  }, [mainTab, subcategoriesByCategory]);

  const selectedStory = useMemo(() => {
    if (!stories.length) {
      return null;
    }

    return stories.find((story) => story.id === selectedStoryId) ?? null;
  }, [selectedStoryId, stories]);

  const hasActiveMixerLevels = useCallback((levels: MixerLevels) => {
    return Object.values(levels).some((level) => clampMixerLevel(level) > 0);
  }, []);

  const applyCurrentEffectLevels = useCallback((nextLevels: MixerLevels) => {
    effectLevelsRef.current = nextLevels;
    setEffectLevelsState(nextLevels);
  }, []);

  const clearEffectLevels = useCallback(() => {
    applyCurrentEffectLevels(createEmptyMixerLevels());
  }, [applyCurrentEffectLevels]);

  const pauseAuxiliaryPlayback = useCallback(() => {
    const musicAudio = musicAudioRef.current;
    if (musicAudio) {
      musicAudio.pause();
      musicAudio.volume = 0;
      try {
        musicAudio.currentTime = 0;
      } catch {
        // Ignore currentTime assignment failures on not-yet-loaded media.
      }
    }

    startedMixerRef.current.music = false;

    AMBIENT_EFFECT_IDS.forEach((effectId) => {
      const effectAudio = effectAudioElementsRef.current[effectId];
      if (!effectAudio) {
        return;
      }

      effectAudio.pause();
      effectAudio.volume = 0;
      try {
        effectAudio.currentTime = 0;
      } catch {
        // Ignore currentTime assignment failures on not-yet-loaded media.
      }
      startedMixerRef.current[effectId] = false;
    });
  }, []);

  const prepareMusicAudio = useCallback((story: Story | null) => {
    const musicAudio = musicAudioRef.current;
    if (!musicAudio) {
      return false;
    }

    const nextSource = story?.musicFile ?? null;
    if (!nextSource) {
      loadedMusicSourceRef.current = null;
      musicAudio.pause();
      musicAudio.volume = 0;
      musicAudio.removeAttribute('src');
      musicAudio.load();
      startedMixerRef.current.music = false;
      return false;
    }

    if (loadedMusicSourceRef.current !== nextSource) {
      loadedMusicSourceRef.current = nextSource;
      startedMixerRef.current.music = false;
      musicAudio.pause();
      musicAudio.src = nextSource;
      musicAudio.load();
    }

    musicAudio.loop = true;
    return true;
  }, []);

  const syncAuxiliaryPlayback = useCallback(
    async (playing: boolean, story = selectedStoryRef.current, levels = effectLevelsRef.current) => {
      const hasActiveLevels = hasActiveMixerLevels(levels);

      if (!story || (!playing && !hasActiveLevels)) {
        prepareMusicAudio(story);
        pauseAuxiliaryPlayback();
        return;
      }

      ensureAuxiliaryAudio();

      await Promise.all(
        AMBIENT_EFFECT_IDS.map(async (effectId) => {
          const effectAudio = effectAudioElementsRef.current[effectId];
          if (!effectAudio) {
            return;
          }

          const level = clampMixerLevel(levels[effectId]);
          const volume = clamp01(level / 10);
          effectAudio.volume = volume;

          if (volume > 0) {
            if (!startedMixerRef.current[effectId]) {
              try {
                effectAudio.currentTime = 0;
              } catch {
                // Ignore currentTime assignment failures on not-yet-loaded media.
              }
              startedMixerRef.current[effectId] = true;
            }

            try {
              await effectAudio.play();
            } catch {
              // Ignore autoplay/load failures and retry on the next playback sync.
            }
            return;
          }

          effectAudio.pause();
          try {
            effectAudio.currentTime = 0;
          } catch {
            // Ignore currentTime assignment failures on not-yet-loaded media.
          }
          startedMixerRef.current[effectId] = false;
        }),
      );

      const musicAudio = musicAudioRef.current;
      const hasMusic = prepareMusicAudio(story);
      const musicLevel = clampMixerLevel(levels.music);

      if (!musicAudio || !hasMusic || musicLevel <= 0) {
        if (musicAudio) {
          musicAudio.pause();
          musicAudio.volume = 0;
          try {
            musicAudio.currentTime = 0;
          } catch {
            // Ignore currentTime assignment failures on not-yet-loaded media.
          }
        }
        startedMixerRef.current.music = false;
        return;
      }

      musicAudio.volume = clamp01(musicLevel / 10);
      if (!startedMixerRef.current.music) {
        try {
          musicAudio.currentTime = 0;
        } catch {
          // Ignore currentTime assignment failures on not-yet-loaded media.
        }
        startedMixerRef.current.music = true;
      }

      try {
        await musicAudio.play();
      } catch {
        // Ignore autoplay/load failures and retry on the next playback sync.
      }
    },
    [ensureAuxiliaryAudio, hasActiveMixerLevels, pauseAuxiliaryPlayback, prepareMusicAudio],
  );

  useEffect(() => {
    if (!stories.length) {
      return;
    }

    if (selectedStoryId && stories.some((story) => story.id === selectedStoryId)) {
      return;
    }

    const initialStory = stories.find((story) => isStoryPlayable(story)) ?? stories.find((story) => story.sound) ?? stories[0];
    setSelectedStoryId(initialStory.id);
  }, [selectedStoryId, stories]);

  useEffect(() => {
    selectedStoryRef.current = selectedStory;
  }, [selectedStory]);

  useEffect(() => {
    if (audioElement) {
      audioElement.pause();
      audioElement.removeAttribute('src');
      audioElement.load();
    }

    pauseAuxiliaryPlayback();
    prepareMusicAudio(selectedStory);

    const nextLevels = pendingResumeRef.current
      ? defaultsForStory(selectedStory)
      : createEmptyMixerLevels();
    applyCurrentEffectLevels(nextLevels);
  }, [applyCurrentEffectLevels, audioElement, pauseAuxiliaryPlayback, prepareMusicAudio, selectedStory]);

  useEffect(() => {
    if (!audioElement) {
      return;
    }

    const handleTimeUpdate = () => {
      const duration = Number.isFinite(audioElement.duration)
        ? audioElement.duration
        : selectedStory?.durationSeconds ?? null;
      setProgressRatio(getProgressRatio(audioElement.currentTime, duration));
    };

    const handleLoadStart = () => setIsAudioLoading(true);
    const handleCanPlay = () => setIsAudioLoading(false);
    const handlePlaying = () => {
      setIsAudioLoading(false);
      setIsPlaying(true);

      if (pendingStoryDefaultsOnPlayRef.current) {
        pendingStoryDefaultsOnPlayRef.current = false;
        const nextLevels = defaultsForStory(selectedStoryRef.current);
        applyCurrentEffectLevels(nextLevels);
        void syncAuxiliaryPlayback(true, selectedStoryRef.current, nextLevels);
        return;
      }

      void syncAuxiliaryPlayback(true);
    };
    const handlePause = () => {
      setIsPlaying(false);
      pendingStoryDefaultsOnPlayRef.current = false;
      pauseAuxiliaryPlayback();
      clearEffectLevels();
    };
    const handleWaiting = () => setIsAudioLoading(true);
    const handleEnded = () => {
      setIsPlaying(false);
      setProgressRatio(0);
      pendingStoryDefaultsOnPlayRef.current = false;
      pauseAuxiliaryPlayback();
      clearEffectLevels();
    };
    const handleError = () => {
      setIsPlaying(false);
      setIsAudioLoading(false);
      pendingStoryDefaultsOnPlayRef.current = false;
      pauseAuxiliaryPlayback();
      clearEffectLevels();
    };

    audioElement.addEventListener('timeupdate', handleTimeUpdate);
    audioElement.addEventListener('loadedmetadata', handleTimeUpdate);
    audioElement.addEventListener('durationchange', handleTimeUpdate);
    audioElement.addEventListener('loadstart', handleLoadStart);
    audioElement.addEventListener('canplay', handleCanPlay);
    audioElement.addEventListener('playing', handlePlaying);
    audioElement.addEventListener('pause', handlePause);
    audioElement.addEventListener('waiting', handleWaiting);
    audioElement.addEventListener('ended', handleEnded);
    audioElement.addEventListener('error', handleError);

    return () => {
      audioElement.removeEventListener('timeupdate', handleTimeUpdate);
      audioElement.removeEventListener('loadedmetadata', handleTimeUpdate);
      audioElement.removeEventListener('durationchange', handleTimeUpdate);
      audioElement.removeEventListener('loadstart', handleLoadStart);
      audioElement.removeEventListener('canplay', handleCanPlay);
      audioElement.removeEventListener('playing', handlePlaying);
      audioElement.removeEventListener('pause', handlePause);
      audioElement.removeEventListener('waiting', handleWaiting);
      audioElement.removeEventListener('ended', handleEnded);
      audioElement.removeEventListener('error', handleError);
    };
  }, [applyCurrentEffectLevels, audioElement, clearEffectLevels, pauseAuxiliaryPlayback, selectedStory?.durationSeconds, syncAuxiliaryPlayback]);

  useEffect(() => {
    if (!audioElement) {
      return;
    }

    if (!selectedStory?.sound) {
      pauseAuxiliaryPlayback();
      audioElement.pause();
      audioElement.removeAttribute('src');
      audioElement.load();
      pendingStoryDefaultsOnPlayRef.current = false;
      setIsPlaying(false);
      setIsAudioLoading(false);
      setProgressRatio(0);
      clearEffectLevels();
      return;
    }

    pendingResumeRef.current = false;

    pauseAuxiliaryPlayback();
    audioElement.pause();
    setProgressRatio(0);
    setIsPlaying(false);
    setIsAudioLoading(false);
  }, [audioElement, clearEffectLevels, pauseAuxiliaryPlayback, selectedStory?.id, selectedStory?.sound]);

  useEffect(() => {
    effectLevelsRef.current = effectLevels;
    void syncAuxiliaryPlayback(Boolean(audioElement && !audioElement.paused), selectedStoryRef.current, effectLevels);
  }, [audioElement, effectLevels, syncAuxiliaryPlayback]);

  const closeWaitlistModal = useCallback(() => {
    setIsWaitlistModalOpen(false);
  }, []);

  const setAudioRef = useCallback((node: HTMLAudioElement | null) => {
    setAudioElement(node);
  }, []);

  const selectStory = useCallback(
    (story: Story) => {
      pendingResumeRef.current = false;
      setSelectedStoryId(story.id);
    },
    [],
  );

  const togglePlayPause = useCallback(async () => {
    if (!audioElement || !selectedStory) {
      return;
    }

    if (!selectedStory.sound) {
      return;
    }

    if (!isStoryPlayable(selectedStory)) {
      setIsWaitlistModalOpen(true);
      return;
    }

    if (audioElement.paused) {
      ensureAuxiliaryAudio();
      pendingStoryDefaultsOnPlayRef.current = true;
      setIsAudioLoading(true);
      try {
        if (audioElement.getAttribute('src') !== selectedStory.sound) {
          audioElement.src = selectedStory.sound;
          audioElement.load();
        }
        await audioElement.play();
      } catch {
        pendingStoryDefaultsOnPlayRef.current = false;
        setIsAudioLoading(false);
        setIsPlaying(false);
      }
      return;
    }

    audioElement.pause();
  }, [audioElement, ensureAuxiliaryAudio, selectedStory]);

  const toggleStoryPlayback = useCallback(
    async (story: Story) => {
      if (selectedStory?.id === story.id) {
        await togglePlayPause();
        return;
      }

      if (!isStoryPlayable(story)) {
        pendingResumeRef.current = false;
        setSelectedStoryId(story.id);
        if (story.sound) {
          setIsWaitlistModalOpen(true);
        }
        return;
      }

      pendingResumeRef.current = false;
      setSelectedStoryId(story.id);
    },
    [selectedStory?.id, togglePlayPause],
  );

  const seekBy = useCallback(
    (deltaSeconds: number) => {
      if (!audioElement) {
        return;
      }

      const duration = Number.isFinite(audioElement.duration)
        ? audioElement.duration
        : selectedStory?.durationSeconds ?? 0;
      const nextTime = Math.max(0, Math.min(duration, audioElement.currentTime + deltaSeconds));
      audioElement.currentTime = nextTime;
      setProgressRatio(getProgressRatio(nextTime, duration || null));
    },
    [audioElement, selectedStory?.durationSeconds],
  );

  const setEffectLevel = useCallback((id: MixerLevelId, value: number) => {
    const nextLevel = clampMixerLevel(value);
    let nextLevels: MixerLevels | null = null;

    setEffectLevelsState((previous) => {
      nextLevels = { ...previous, [id]: nextLevel };
      effectLevelsRef.current = nextLevels;
      return nextLevels;
    });

    if (!audioElement || audioElement.paused) {
      if (nextLevels) {
        void syncAuxiliaryPlayback(false, selectedStoryRef.current, nextLevels);
      }
      return;
    }

    if (nextLevels) {
      void syncAuxiliaryPlayback(true, selectedStoryRef.current, nextLevels);
    }
  }, [audioElement, syncAuxiliaryPlayback]);

  const resetFilters = useCallback(() => {
    setMainTab(ALL_MAIN_TAB_ID);
    setSubTab(ALL_SUB_TAB_ID);
    setSearch('');
  }, []);

  const changeMainTab = useCallback(
    (nextTab: MainTabId) => {
      setMainTab(nextTab);
      setSubTab(ALL_SUB_TAB_ID);
    },
    [],
  );

  useEffect(() => {
    if (typeof mainTab !== 'number') {
      if (subTab !== ALL_SUB_TAB_ID) {
        setSubTab(ALL_SUB_TAB_ID);
      }
      return;
    }

    const validSubcategories = subcategoriesByCategory.get(mainTab) ?? [];
    if (!validSubcategories.length) {
      if (subTab !== ALL_SUB_TAB_ID) {
        setSubTab(ALL_SUB_TAB_ID);
      }
      return;
    }

    if (subTab === ALL_SUB_TAB_ID) {
      return;
    }

    const isStillValid = validSubcategories.some((subcategory) => subcategory.id === subTab);
    if (!isStillValid) {
      setSubTab(ALL_SUB_TAB_ID);
    }
  }, [mainTab, subTab, subcategoriesByCategory]);

  return {
    status,
    errorMessage,
    apiBaseUrl,
    categories,
    currentSubcategories,
    filteredStories,
    mainTab,
    progressRatio,
    resetFilters,
    search,
    seekBy,
    selectedStory,
    selectedStoryId,
    selectStory,
    setAudioRef,
    setEffectLevel,
    setSearch,
    setSubTab,
    stories,
    subTab,
    togglePlayPause,
    toggleStoryPlayback,
    changeMainTab,
    effectLevels,
    hasStoryMusic: Boolean(selectedStory?.musicFile),
    isAudioLoading,
    isPlaying,
    isWaitlistModalOpen,
    closeWaitlistModal,
  };
}

type LandingExperienceState = ReturnType<typeof useLandingExperience>;

function useUiCopy(lang: Language) {
  return UI_COPY[lang] ?? UI_COPY.bs;
}

function DeviceMiniPlayer({
  lang,
  story,
  isPlaying,
  isLoading,
  progressRatio,
  onPlayPause,
  onSeekForward,
  onSeekBackward,
}: {
  lang: Language;
  story: Story | null;
  isPlaying: boolean;
  isLoading: boolean;
  progressRatio: number;
  onPlayPause: () => void;
  onSeekForward: () => void;
  onSeekBackward: () => void;
}) {
  const copy = useUiCopy(lang);
  const title = story?.title || 'SNOVI';
  const image = story?.image || FALLBACK_IMAGE;
  const controlsDisabled = !story?.sound;

  return (
    <div className="relative overflow-hidden border-t border-white/5 bg-[#071728]/95 backdrop-blur-xl">
      <div className="flex min-h-[72px] items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-[#111827]">
            <img
              src={image}
              alt={title}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
              loading="lazy"
              decoding="async"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate whitespace-nowrap text-[8px] font-black uppercase leading-none tracking-[0.22em] text-violet-400 sm:text-[9px]">
              {copy.nowPlaying}
            </p>
            <p className="truncate pt-1 text-sm font-semibold leading-none text-white">{title}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 text-white">
          <button
            type="button"
            onClick={onSeekBackward}
            disabled={controlsDisabled || isLoading}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-200 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40 sm:h-10 sm:w-10"
            aria-label="Seek backward 30 seconds"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="pointer-events-none absolute mt-5 text-[7px] font-black">30</span>
          </button>

          <button
            type="button"
            onClick={onPlayPause}
            disabled={controlsDisabled}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-slate-500 sm:h-11 sm:w-11"
            aria-label={isPlaying ? 'Pause story' : 'Play story'}
          >
            {isLoading ? (
              <LoaderCircle className="h-5 w-5 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-5 w-5 fill-current" />
            ) : (
              <Play className="ml-0.5 h-5 w-5 fill-current" />
            )}
          </button>

          <button
            type="button"
            onClick={onSeekForward}
            disabled={controlsDisabled || isLoading}
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-200 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40 sm:h-10 sm:w-10"
            aria-label="Seek forward 30 seconds"
          >
            <RotateCw className="h-4 w-4" />
            <span className="pointer-events-none absolute mt-5 text-[7px] font-black">30</span>
          </button>
        </div>
      </div>

      <div className="h-[3px] w-full bg-white/10">
        <div
          className="h-full bg-violet-500 transition-[width] duration-300"
          style={{ width: `${Math.max(0, Math.min(1, progressRatio)) * 100}%` }}
        />
      </div>
    </div>
  );
}

function DeviceBottomNav({
  lang,
  activeTab,
}: {
  lang: Language;
  activeTab: BottomTabId;
}) {
  return (
    <div className="flex items-center justify-around border-t border-white/5 bg-[#041221] px-2 py-2 pb-5">
      {BOTTOM_TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.id === activeTab;
        return (
          <div key={tab.id} className="relative flex min-w-[58px] flex-col items-center justify-center gap-1 py-1">
            <Icon className={`h-5 w-5 ${isActive ? 'text-violet-400' : 'text-slate-500'}`} />
            <span
              className={`text-[8px] font-black uppercase tracking-[0.18em] ${
                isActive ? 'text-violet-400' : 'text-slate-500'
              }`}
            >
              {tab.label[lang]}
            </span>
            {tab.id === 'offer' ? (
              <span className="absolute right-2 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-black text-white">
                1
              </span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function SearchField({
  lang,
  value,
  onChange,
  compact = false,
}: {
  lang: Language;
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
}) {
  const copy = useUiCopy(lang);

  return (
    <label className="relative block">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={copy.searchPlaceholder}
        className={`w-full rounded-full border border-white/5 bg-[#0f2032] pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-violet-500/40 focus:bg-[#13263a] ${
          compact ? 'py-2.5 pl-11' : 'py-3.5 pl-12'
        }`}
        aria-label={copy.searchLabel}
      />
    </label>
  );
}

function StoryTile({
  story,
  selected,
  playing,
  loading,
  onSelect,
  onTogglePlay,
  popularLabel,
  publishedLabel,
  comingSoonLabel,
  compact = false,
}: {
  story: Story;
  selected: boolean;
  playing: boolean;
  loading: boolean;
  onSelect: (story: Story) => void;
  onTogglePlay: (story: Story) => void;
  popularLabel: string;
  publishedLabel: string;
  comingSoonLabel: string;
  compact?: boolean;
}) {
  const canPlay = Boolean(story.sound);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className={`group overflow-hidden rounded-[1.8rem] border text-left ${
        selected ? 'border-violet-500/70 bg-white/[0.04]' : 'border-white/5 bg-white/[0.02]'
      }`}
    >
      <div
        className={`relative cursor-pointer ${compact ? 'aspect-[3/4] md:aspect-[6/5]' : 'aspect-[3/5] md:aspect-[4/5]'}`}
        onClick={() => onSelect(story)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onSelect(story);
          }
        }}
        role="button"
        tabIndex={0}
      >
        <img
          src={story.image}
          alt={story.title}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
          referrerPolicy="no-referrer"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-transparent" />

        <div className="absolute left-4 top-4 flex items-center gap-2">
          {story.favorite ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/45 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white">
              <Heart className="h-3 w-3 text-violet-400" />
              {popularLabel}
            </span>
          ) : null}
          {selected ? (
            <span className="inline-flex items-center rounded-full bg-violet-500 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-white">
              Player
            </span>
          ) : null}
        </div>

        <div className="absolute right-4 top-4">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${
              story.locked ? 'bg-amber-400 text-black' : 'border border-white/10 bg-black/45 text-white'
            }`}
          >
            {story.locked ? <Lock className="h-3 w-3" /> : null}
            {story.locked ? comingSoonLabel : publishedLabel}
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-4">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p
                className={`font-serif font-bold text-white ${
                  compact ? 'text-base leading-5 md:text-2xl md:leading-7' : 'text-lg leading-5 md:text-2xl md:leading-7'
                }`}
              >
                {story.title}
              </p>
              <p className="mt-2 text-[9px] font-black uppercase tracking-[0.18em] text-slate-300 md:text-[11px]">
                {story.duration} - {story.narrator}
              </p>
            </div>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                void onTogglePlay(story);
              }}
              disabled={!canPlay}
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition ${
                selected && playing
                  ? 'bg-white text-black'
                  : 'bg-violet-500 text-white'
              } disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-slate-500`}
              aria-label={selected && playing ? 'Pause story' : 'Play story'}
            >
              {loading && selected ? (
                <LoaderCircle className="h-5 w-5 animate-spin" />
              ) : selected && playing ? (
                <Pause className="h-5 w-5 fill-current" />
              ) : (
                <Play className="ml-0.5 h-5 w-5 fill-current" />
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function DeviceLibraryPreview({
  lang,
  experience,
}: HeroDeviceShowcaseProps) {
  const copy = useUiCopy(lang);
  const previewStories = (experience.filteredStories.length ? experience.filteredStories : experience.stories).slice(0, 4);

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#041221] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(147,51,234,0.16),_transparent_52%)]" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/30 to-transparent" />

      <div className="relative flex-1 px-5 pb-32 pt-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-violet-400">{copy.deviceLibraryTitle}</p>
            <h4 className="mt-2 text-2xl font-serif font-bold text-white">
              {lang === 'bs' ? 'Svijet Mašte' : 'World of Imagination'}
            </h4>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/35 px-3 py-2 text-[9px] font-black uppercase tracking-[0.18em] text-emerald-300">
            {experience.filteredStories.length || experience.stories.length} {copy.previewResults}
          </div>
        </div>

        <SearchField lang={lang} value={experience.search} onChange={experience.setSearch} compact />

        <div className="hide-scrollbar mt-4 overflow-x-auto pb-1">
          <div className="flex w-max gap-2 pr-2">
            <button
              type="button"
              onClick={() => experience.changeMainTab(ALL_MAIN_TAB_ID)}
              className={`shrink-0 cursor-pointer rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] transition ${
                experience.mainTab === ALL_MAIN_TAB_ID
                  ? 'bg-violet-500 text-white'
                  : 'border border-white/8 bg-white/[0.03] text-slate-400'
              }`}
            >
              {copy.all}
            </button>
            {experience.categories.slice(0, 4).map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => experience.changeMainTab(category.id)}
                className={`shrink-0 cursor-pointer rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] transition ${
                  experience.mainTab === category.id
                    ? 'bg-violet-500 text-white'
                    : 'border border-white/8 bg-white/[0.03] text-slate-400'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {experience.currentSubcategories.length ? (
          <div className="hide-scrollbar mt-3 overflow-x-auto pb-1">
            <div className="flex w-max gap-2 pr-2">
              <button
                type="button"
                onClick={() => experience.setSubTab(ALL_SUB_TAB_ID)}
                className={`shrink-0 cursor-pointer rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] transition ${
                  experience.subTab === ALL_SUB_TAB_ID
                    ? 'bg-white text-black'
                    : 'border border-white/8 bg-white/[0.03] text-slate-400'
                }`}
              >
                {copy.all}
              </button>
              {experience.currentSubcategories.slice(0, 4).map((subcategory) => (
                <button
                  key={subcategory.id}
                  type="button"
                  onClick={() => experience.setSubTab(subcategory.id)}
                  className={`shrink-0 cursor-pointer rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] transition ${
                    experience.subTab === subcategory.id
                      ? 'bg-white text-black'
                      : 'border border-white/8 bg-white/[0.03] text-slate-400'
                  }`}
                >
                  {subcategory.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-4 grid grid-cols-2 gap-3">
          {previewStories.map((story) => (
            <button
              key={story.id}
              type="button"
              onClick={() => experience.selectStory(story)}
              className={`overflow-hidden rounded-[1.2rem] border text-left ${
                experience.selectedStory?.id === story.id ? 'border-violet-500/80' : 'border-white/5'
              }`}
            >
              <div className="relative aspect-[4/5]">
                <img
                  src={story.image}
                  alt={story.title}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <p className="line-clamp-2 text-sm font-bold text-white">{story.title}</p>
                  <p className="mt-1 text-[9px] font-black uppercase tracking-[0.18em] text-slate-300">{story.duration}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <p className="mt-4 text-[10px] font-medium leading-4 text-slate-400">{copy.deviceLibraryHint}</p>
      </div>

      <div className="absolute inset-x-0 bottom-0">
        <DeviceMiniPlayer
          lang={lang}
          story={experience.selectedStory}
          isPlaying={experience.isPlaying}
          isLoading={experience.isAudioLoading}
          progressRatio={experience.progressRatio}
          onPlayPause={experience.togglePlayPause}
          onSeekForward={() => experience.seekBy(30)}
          onSeekBackward={() => experience.seekBy(-30)}
        />
        <DeviceBottomNav lang={lang} activeTab="library" />
      </div>
    </div>
  );
}

function DeviceHomePreview({
  lang,
  experience,
}: HeroDeviceShowcaseProps) {
  const copy = useUiCopy(lang);
  const currentStory = experience.selectedStory;
  const quickPicks = experience.stories
    .filter((story) => story.id !== currentStory?.id)
    .slice(0, 3);

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#041221] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(147,51,234,0.2),_transparent_52%)]" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/30 to-transparent" />

      <div className="relative flex-1 px-4 pb-32 pt-5">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-violet-400">{copy.deviceHomeKicker}</p>
        <div className="mt-4 overflow-hidden rounded-[2rem] border border-white/8 bg-white/[0.04]">
          <div className="relative aspect-[4/5]">
            <img
              src={currentStory?.image || FALLBACK_IMAGE}
              alt={currentStory?.title || 'SNOVI'}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-slate-200">
                <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                {copy.selectedStory}
              </div>
              <h4 className="mt-4 text-3xl font-serif font-bold leading-[1.02] text-white">{currentStory?.title || 'SNOVI'}</h4>
              <p className="mt-2 text-[11px] font-black uppercase tracking-[0.18em] text-slate-300">
                {currentStory?.duration || '--:--'} - {currentStory?.narrator || 'SNOVI'}
              </p>
            </div>
          </div>
        </div>

        <div className="hide-scrollbar mt-4 overflow-x-auto pb-1">
          <div className="flex w-max gap-2 pr-2">
            {[currentStory?.categoryLabel, currentStory?.subcategoryLabel, currentStory?.sound ? 'Audio' : copy.noAudio]
              .filter(Boolean)
              .map((label) => (
                <span
                  key={label}
                  className="shrink-0 rounded-full border border-white/8 bg-white/[0.03] px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-300"
                >
                  {label}
                </span>
              ))}
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{copy.deviceQueue}</p>
            <span className="rounded-full border border-white/8 bg-white/[0.03] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-violet-300">
              {experience.apiBaseUrl ? 'API' : 'SYNC'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {quickPicks.map((story) => (
              <button
                key={story.id}
                type="button"
                onClick={() => experience.selectStory(story)}
                className="overflow-hidden rounded-[1rem] border border-white/5 bg-white/[0.03] text-left"
              >
                <div className="aspect-square">
                  <img
                    src={story.image}
                    alt={story.title}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="p-2">
                  <p className="line-clamp-2 text-[10px] font-bold leading-3.5 text-white">{story.title}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0">
        <DeviceMiniPlayer
          lang={lang}
          story={experience.selectedStory}
          isPlaying={experience.isPlaying}
          isLoading={experience.isAudioLoading}
          progressRatio={experience.progressRatio}
          onPlayPause={experience.togglePlayPause}
          onSeekForward={() => experience.seekBy(30)}
          onSeekBackward={() => experience.seekBy(-30)}
        />
        <DeviceBottomNav lang={lang} activeTab="home" />
      </div>
    </div>
  );
}

export function HeroDeviceShowcase({ lang, experience }: HeroDeviceShowcaseProps) {
  return (
    <div className="relative z-10 flex flex-col items-center justify-center gap-20 md:flex-row md:gap-0">
      <div className="relative z-20 h-[540px] w-[272px] -translate-x-[22%] overflow-hidden rounded-[3rem] border-[8px] border-[#1a1a1a] bg-[#0a0a0a] shadow-[0_80px_150px_-30px_rgba(0,0,0,0.8)] md:h-[580px] md:w-[280px] md:-translate-x-[40px] md:rotate-[-5deg] md:border-[10px]">
        <DeviceHomePreview lang={lang} experience={experience} />
      </div>

      <div className="relative z-10 aspect-[4/3] w-[320px] translate-x-[12%] overflow-hidden rounded-[2.5rem] border-[12px] border-[#1a1a1a] bg-[#0a0a0a] shadow-[0_80px_150px_-30px_rgba(0,0,0,0.8)] md:w-full md:max-w-[550px] md:translate-x-[40px] md:-translate-y-10 md:rotate-[3deg] md:rounded-[3rem] md:border-[14px]">
        <DeviceLibraryPreview lang={lang} experience={experience} />
      </div>
    </div>
  );
}

export function FixedMiniPlayerBar({ lang, experience }: FixedMiniPlayerBarProps) {
  const copy = useUiCopy(lang);
  const story = experience.selectedStory;

  if (!story) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[140] md:px-6 md:pb-5">
      <div className="pointer-events-auto overflow-hidden border-t border-white/8 bg-[rgba(11,27,45,0.96)] shadow-none backdrop-blur-2xl md:mx-auto md:max-w-5xl md:rounded-[1.75rem] md:border md:shadow-[0_25px_80px_-20px_rgba(0,0,0,0.85)]">
        <div
          className="flex min-h-[76px] items-center justify-between gap-3 px-3 py-3 sm:px-4 md:min-h-[84px] md:px-5"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.75rem)' }}
        >
          <button
            type="button"
            onClick={() => document.getElementById('stories')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="flex min-w-0 flex-1 items-center gap-3 text-left"
          >
            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-[#111827] sm:h-12 sm:w-12">
              <img
                src={story.image}
                alt={story.title}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate whitespace-nowrap text-[8px] font-black uppercase leading-none tracking-[0.22em] text-violet-400 sm:text-[9px]">
                {copy.nowPlaying}
              </p>
              <p className="truncate pt-1 text-sm font-semibold leading-none text-white md:text-base">{story.title}</p>
              <p className="hidden truncate text-[10px] font-black uppercase tracking-[0.16em] text-slate-400 md:block">
                {story.duration} - {story.narrator}
              </p>
            </div>
          </button>

          <div className="flex shrink-0 items-center gap-1 sm:gap-1.5 md:gap-3">
            <button
              type="button"
              onClick={() => experience.seekBy(-30)}
              disabled={experience.isAudioLoading || !story.sound}
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-200 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40 sm:h-10 sm:w-10"
              aria-label="Seek backward 30 seconds"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="pointer-events-none absolute mt-5 text-[7px] font-black">30</span>
            </button>

            <button
              type="button"
              onClick={() => void experience.togglePlayPause()}
              disabled={!story.sound}
              className={`flex h-10 w-10 items-center justify-center rounded-full transition sm:h-11 sm:w-11 md:h-12 md:w-12 ${
                experience.isPlaying ? 'bg-white text-black' : 'bg-violet-500 text-white'
              } disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-slate-500`}
              aria-label={experience.isPlaying ? 'Pause story' : 'Play story'}
            >
              {experience.isAudioLoading ? (
                <LoaderCircle className="h-5 w-5 animate-spin" />
              ) : experience.isPlaying ? (
                <Pause className="h-5 w-5 fill-current" />
              ) : (
                <Play className="ml-0.5 h-5 w-5 fill-current" />
              )}
            </button>

            <button
              type="button"
              onClick={() => experience.seekBy(30)}
              disabled={experience.isAudioLoading || !story.sound}
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-slate-200 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40 sm:h-10 sm:w-10"
              aria-label="Seek forward 30 seconds"
            >
              <RotateCw className="h-4 w-4" />
              <span className="pointer-events-none absolute mt-5 text-[7px] font-black">30</span>
            </button>
          </div>
        </div>

        <div className="h-[3px] w-full bg-white/10">
          <div
            className="h-full bg-violet-500 transition-[width] duration-300"
            style={{ width: `${Math.max(0, Math.min(1, experience.progressRatio)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function LibrarySectionSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={`library-skeleton-${index}`}
          className="aspect-[3/4] animate-pulse rounded-[2rem] border border-white/5 bg-white/[0.03] md:aspect-[6/5]"
        />
      ))}
    </div>
  );
}

export function LandingLibrarySection({
  lang,
  experience,
  badgeLabel,
  title,
  safeLabel,
  viewAllLabel,
  popularLabel,
  publishedLabel,
  comingSoonLabel,
}: LandingLibrarySectionProps) {
  const copy = useUiCopy(lang);
  const currentCount = experience.filteredStories.length;

  return (
    <section id="stories" className="py-20 px-6 md:py-40">
      <div className="max-w-7xl mx-auto">
        <div className="relative mb-12 flex flex-col gap-10 md:mb-16 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <h2 className="mb-6 text-[11px] font-black uppercase tracking-[0.4em] text-violet-500">{badgeLabel}</h2>
            <h3 className="text-5xl font-serif font-bold leading-[0.9] md:text-7xl">{title}</h3>
          </div>

          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-10 right-0 hidden items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-6 py-3 shadow-3xl backdrop-blur-2xl md:flex"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
              <Heart className="h-5 w-5 text-emerald-400" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white">{safeLabel}</p>
          </motion.div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex h-12 items-center rounded-full border border-white/8 bg-white/[0.03] px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              {currentCount} {copy.previewResults}
            </div>
            <button
              type="button"
              onClick={experience.resetFilters}
              className="inline-flex h-12 items-center rounded-full border border-white/10 bg-white/[0.02] px-8 text-xs font-black uppercase tracking-widest text-white transition hover:bg-white hover:text-black"
            >
              {viewAllLabel}
            </button>
          </div>
        </div>

        <div>
          <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <SearchField lang={lang} value={experience.search} onChange={experience.setSearch} />
            <div className="flex items-center justify-between gap-3 px-1 py-1">
              <div className="flex items-center gap-3">
                <SlidersHorizontal className="h-4 w-4 text-violet-400" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">{copy.filterLabel}</p>
                  <p className="text-sm font-semibold text-white">{currentCount} {copy.previewResults}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={experience.resetFilters}
                className="rounded-full border border-white/8 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-300 transition hover:border-violet-500/40 hover:text-white"
              >
                {copy.resetFilters}
              </button>
            </div>
          </div>

          <div className="hide-scrollbar mb-5 overflow-x-auto pb-1">
            <div className="flex w-max gap-2 pr-2">
              <button
                type="button"
                onClick={() => experience.changeMainTab(ALL_MAIN_TAB_ID)}
                className={`inline-flex h-12 shrink-0 cursor-pointer items-center rounded-full px-4 text-[11px] font-black uppercase tracking-[0.2em] transition ${
                  experience.mainTab === ALL_MAIN_TAB_ID
                    ? 'bg-violet-500 text-white'
                    : 'border border-white/8 bg-white/[0.02] text-slate-400'
                }`}
              >
                {copy.all}
              </button>
              {experience.categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => experience.changeMainTab(category.id)}
                  className={`inline-flex h-12 shrink-0 cursor-pointer items-center rounded-full px-4 text-[11px] font-black uppercase tracking-[0.2em] transition ${
                    experience.mainTab === category.id
                      ? 'bg-violet-500 text-white'
                      : 'border border-white/8 bg-white/[0.02] text-slate-400'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {experience.currentSubcategories.length ? (
            <div className="hide-scrollbar mb-8 overflow-x-auto pb-1">
              <div className="flex w-max gap-2 pr-2">
                <button
                  type="button"
                  onClick={() => experience.setSubTab(ALL_SUB_TAB_ID)}
                  className={`inline-flex h-12 shrink-0 cursor-pointer items-center rounded-full px-4 text-[10px] font-black uppercase tracking-[0.18em] transition ${
                    experience.subTab === ALL_SUB_TAB_ID
                      ? 'bg-white text-black'
                      : 'border border-white/8 bg-[#0c1827] text-slate-400'
                  }`}
                >
                  {copy.all}
                </button>
                {experience.currentSubcategories.map((subcategory) => (
                  <button
                    key={subcategory.id}
                    type="button"
                    onClick={() => experience.setSubTab(subcategory.id)}
                    className={`inline-flex h-12 shrink-0 cursor-pointer items-center rounded-full px-4 text-[10px] font-black uppercase tracking-[0.18em] transition ${
                      experience.subTab === subcategory.id
                        ? 'bg-white text-black'
                        : 'border border-white/8 bg-[#0c1827] text-slate-400'
                    }`}
                  >
                    {subcategory.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {experience.status === 'loading' ? (
            <LibrarySectionSkeleton />
          ) : experience.status === 'error' && !experience.stories.length ? (
            <div className="rounded-[2rem] border border-amber-400/20 bg-amber-400/5 px-6 py-8 text-center">
              <p className="text-lg font-semibold text-white">{copy.loadFailed}</p>
              <p className="mt-2 text-sm text-slate-400">{experience.errorMessage}</p>
            </div>
          ) : experience.filteredStories.length ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
              {experience.filteredStories.map((story) => (
                <React.Fragment key={story.id}>
                  <StoryTile
                    story={story}
                    selected={experience.selectedStory?.id === story.id}
                    playing={experience.selectedStoryId === story.id && experience.isPlaying}
                    loading={experience.selectedStoryId === story.id && experience.isAudioLoading}
                    onSelect={experience.selectStory}
                    onTogglePlay={experience.toggleStoryPlayback}
                    popularLabel={story.favorite ? copy.favorites : popularLabel}
                    publishedLabel={publishedLabel}
                    comingSoonLabel={comingSoonLabel}
                    compact
                  />
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-white/5 bg-[#0c1827] px-6 py-12 text-center">
              <p className="text-lg font-semibold text-white">{copy.empty}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
