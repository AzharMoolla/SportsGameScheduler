import { finalResultText } from '../lib/eventLifecycle'

export function FinalResult({ status, metadata }: { status: string; metadata?: Record<string, unknown> | null }) {
  const result = finalResultText(status, metadata)
  return result ? <p className="px-3 py-2 text-sm font-semibold" aria-label="Final result">{result}</p> : null
}
