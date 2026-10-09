type Artwork = { banner: string; icon: string }

// Versioned local assets preserve the original artwork and permit independent review.
export const sportArtwork: Record<string, { broadcast: Artwork; program: Artwork }> = {
  basketball: {
    broadcast: { banner: '/assets/sport-banners/studio/basketball-broadcast-concept-v2.webp', icon: '/assets/sport-icons/studio/basketball-broadcast.webp' },
    program: { banner: '/assets/sport-banners/studio/basketball-program-clean-v8.webp', icon: '/assets/sport-icons/studio/basketball-program-v1.webp' },
  },
  ...Object.fromEntries(['football', 'hockey', 'motorsport', 'combat', 'track', 'olympic', 'custom'].map((sport) => [sport, {
    broadcast: { banner: `/assets/sport-banners/studio/${sport}-broadcast-${sport === 'football' ? 'v15' : sport === 'combat' ? 'v12' : sport === 'hockey' ? 'v7' : 'v6'}.webp`, icon: `/assets/sport-icons/studio/${sport}-broadcast-${sport === 'football' ? 'v15' : sport === 'hockey' ? 'v7' : 'v6'}.webp` },
    program: { banner: `/assets/sport-banners/studio/${sport}-program-${sport === 'football' ? 'v14' : ['combat', 'olympic', 'custom'].includes(sport) ? 'v8' : sport === 'hockey' ? 'v7' : 'v6'}.webp`, icon: `/assets/sport-icons/studio/${sport}-program-${sport === 'football' ? 'v14' : sport === 'combat' ? 'v8' : sport === 'hockey' ? 'v7' : 'v6'}.webp` },
  }])),
  ...Object.fromEntries(['baseball', 'soccer', 'golf', 'tennis'].map((sport) => {
    const iconRevision = sport === 'soccer' ? 'v1' : 'v2'
    const bannerRevision = sport === 'tennis' ? 'v4' : sport === 'golf' ? 'v3' : 'v2'
    return [sport, {
      broadcast: { banner: `/assets/sport-banners/studio/${sport}-broadcast-${bannerRevision}.webp`, icon: `/assets/sport-icons/studio/${sport}-broadcast-${iconRevision}.webp` },
      program: { banner: `/assets/sport-banners/studio/${sport}-program-${sport === 'tennis' ? 'v5' : sport === 'soccer' ? 'v1' : bannerRevision}.webp`, icon: `/assets/sport-icons/studio/${sport}-program-${iconRevision}.webp` },
    }]
  })),
}




