import { clearedSportsImages } from '../lib/mediaRights'
export function MediaCredits() {
  return <details className="mt-4 text-xs text-ink/60"><summary className="cursor-pointer">Data & image credits</summary>
    <p className="mt-2">Fixture data: <a href="https://www.thesportsdb.com/" className="underline">TheSportsDB</a>, <a href="https://openf1.org/" className="underline">OpenF1</a> and <a href="https://www.pandascore.co/" className="underline">PandaScore</a>. Sports artwork is original Silbo artwork.</p>
    {clearedSportsImages.map(image=><p key={image.name} className="mt-2"><a href={image.source} className="underline">{image.name} photograph</a> — {image.creator}. <a href={image.licenseUrl} className="underline">{image.license}</a>. {image.changes}</p>)}
  </details>
}
