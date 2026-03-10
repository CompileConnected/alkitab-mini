export const CACHE_POLICIES = {
  BIBLE_PASSAGE: {
    name: 'bible-api-v1',
    sw_strategy: 'stale-while-revalidate',
    cdn_maxage: 86400,
    cdn_swr: 43200,
  },
  BIBLE_VOTD: {
    name: 'bible-api-v1',
    sw_strategy: 'stale-while-revalidate',
    cdn_maxage: 21600,
    cdn_swr: 3600,
  },
  KOKORO_VOICE: {
    name: 'kokoro-v1',
    sw_strategy: 'cache-first',
    match: 'huggingface.co',
  },
};
