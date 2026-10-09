# Pre-launch gate — 2026-10-07

Latest evidence: [design and workflow audit](design-review/WORKFLOW-AUDIT.md). Local UI and deployed subscription checks improved; the full application is not publicly deployed and this gate is not complete.

This is an initial conservative assessment of every Section 7 check. BLOCKED means evidence or implementation remains; it does not assert that a defect has already been confirmed. This is not certification or permission to deploy.

Local evidence: lint passed, TypeScript passed, 103 unit tests passed and core desktop route checks and ten desktop/mobile refresh checks passed. Production compilation and SEO generation passed with `SILBO_SKIP_LIVE_DATA_VERIFY=1`; strict live-data verification was run and failed baseball (21 upcoming versus 100 required) and Olympic detailed fixtures (zero). The browser subset includes automated accessibility checks but does not prove full WCAG conformance. Schema/configuration restored. Public REST reads and rollback-based ownership/share authorization tests passed; 2,426 public fixtures were rehydrated, while real login/deletion, delivery and recovery remain unverified.

The original project was mothballed. The new Supabase connector and database now work. CLI secret access still fails for the saved login. External fan notifications remain disabled. On 2026-10-08 the user explicitly authorized recurring data hydration; bounded server-side jobs are now enabled after source, authorization and budget verification.

2026-10-08 backend update: [hydration and backend review](data/hydration-backend-review-2026-10-08.md). 9,012 public fixtures / 7,231 upcoming; 41 public tables with RLS; ownership/share checks, lint, TypeScript, 117 unit tests and two viewing-country browser tests pass. Strict live-data gate still fails baseball (12 < 100) and Olympic detailed fixtures (0 < 1). Authenticated account lifecycle, notifications, complete recovery and public deployment evidence remain blockers. This update does not convert the general launch gate to PASS.

## Product truthfulness

Fight-timing follow-up: [implementation and data limits](data/fight-timing-2026-10-08.md). 122 unit tests and desktop/mobile fight-timing tests pass. The model and foreground opt-in alerts are implemented; full real-card/live-history coverage, calibration and background delivery remain unavailable pending provider integration and delivery verification. Public claims must preserve those limits.

2026-10-08 lifecycle follow-up: [event lifecycle](data/event-lifecycle-2026-10-08.md) records 48-hour completed-event listing, available final-score display, protected 90-day retention and active cleanup. 119 unit tests and two desktop/mobile lifecycle browser tests pass; rollback-only database retention checks pass. This does not resolve the remaining coverage, authenticated lifecycle, delivery or recovery blockers.

| Check | Status | Evidence / remaining work |
| --- | --- | --- |
| Real product behavior matches landing-page claims. | BLOCKED | 2,426 public events restored; stale World Cup live labels removed. Alerts and subscription behavior still require verification. |
| No fake testimonial/logo/customer/metric/award/certification. | BLOCKED | Verify against the restored application before public release. |
| AI claims have evidence and limitations are not hidden. | NOT APPLICABLE | No runtime AI feature or AI capability claim introduced. |
| Concept/mockup material is not presented as shipped functionality. | BLOCKED | Verify against the restored application before public release. |

## Legal/privacy

| Check | Status | Evidence / remaining work |
| --- | --- | --- |
| Terms page exists if the product needs one and matches actual behavior. | BLOCKED | Verify against the restored application before public release. |
| Privacy Policy exists if personal information is processed and matches actual data flows. | BLOCKED | Verify against the restored application before public release. |
| Cookie/tracking disclosure and consent behavior match the trackers actually loaded. | BLOCKED | Ads and consent UI removed locally. Verify restored production network/storage behavior and privacy disclosure. |
| Marketing consent/identification/unsubscribe flow is appropriate to target jurisdictions. | BLOCKED | Verify against the restored application before public release. |
| UGC/copyright/DMCA workflow is addressed if users can publish or host content. | BLOCKED | Verify against the restored application before public release. |
| Child/minor handling has been reviewed if relevant. | BLOCKED | Verify against the restored application before public release. |
| Biometric handling has been reviewed if relevant. | NOT APPLICABLE | No biometric collection identified in current restoration scope. |
| Refund/subscription/cancellation language matches billing behavior. | NOT APPLICABLE | No payment/subscription feature implemented; reassess before adding Stripe. |
| Legal pages contain no placeholders or fabricated entity/contact information. | BLOCKED | Verify against the restored application before public release. |

## Security/data

| Check | Status | Evidence / remaining work |
| --- | --- | --- |
| No secrets in client bundle, source control, logs, or screenshots. | BLOCKED | Verify against the restored application before public release. |
| Protected actions enforce server-side authorization. | BLOCKED | Verify against the restored application before public release. |
| Sensitive traffic uses TLS. | BLOCKED | Verify against the restored application before public release. |
| Passwords are properly hashed. | BLOCKED | Verify against the restored application before public release. |
| Personal/sensitive data retention and deletion are defined. | BLOCKED | Categories documented in DATA_INVENTORY.md; retention periods and verified deletion remain unresolved. |
| Third-party processors are inventoried. | PASS | Initial source-grounded inventory in THIRD_PARTIES.md; operational regions/retention remain separate blockers. |
| Backups/recovery are appropriate for important data. | BLOCKED | Schema/config snapshots preserved; old user accounts unrecoverable. Define and test recovery for the new free project. |
| Basic OWASP-style security review completed. | BLOCKED | Verify against the restored application before public release. |

## Accessibility/UX

| Check | Status | Evidence / remaining work |
| --- | --- | --- |
| Keyboard-only navigation works. | BLOCKED | Verify against the restored application before public release. |
| Focus is visible and logical. | BLOCKED | Verify against the restored application before public release. |
| Informative images have useful alt text. | BLOCKED | Verify against the restored application before public release. |
| Forms have labels and accessible validation/error messages. | BLOCKED | Verify against the restored application before public release. |
| Contrast is acceptable. | BLOCKED | Verify against the restored application before public release. |
| Reduced motion is respected. | BLOCKED | Verify against the restored application before public release. |
| Dialogs/menus/custom controls have appropriate semantics. | BLOCKED | Verify against the restored application before public release. |
| Mobile, zoom/reflow, and loading/error/empty states have been tested. | BLOCKED | Verify against the restored application before public release. |
| Automated accessibility checks completed plus manual spot checks. | BLOCKED | Desktop/mobile automated home/schedule checks and new keyboard/reflow checks passed. Visual spot checks performed at desktop and 390px. Automated contrast is excluded; full accessibility review remains. |

## Design quality

| Check | Status | Evidence / remaining work |
| --- | --- | --- |
| UI is based on the product/brand, not a generic AI landing-page template. | BLOCKED | Verify against the restored application before public release. |
| Real product/demo is visible where appropriate. | BLOCKED | Verify against the restored application before public release. |
| Animation/decorative effects have a purpose and acceptable performance. | BLOCKED | Verify against the restored application before public release. |
| No gratuitous bento/three-card/purple-gradient/glass/orb/dot-grid pattern stacking. | BLOCKED | Verify against the restored application before public release. |
| Typography/iconography are intentional rather than defaults chosen by the agent. | BLOCKED | Verify against the restored application before public release. |

## Tool/dependency hygiene

| Check | Status | Evidence / remaining work |
| --- | --- | --- |
| New dependencies are actually needed. | NOT APPLICABLE | No application dependency, package installation or executable plugin hook introduced by this adoption. |
| Official package/repository identity verified. | NOT APPLICABLE | No application dependency, package installation or executable plugin hook introduced by this adoption. |
| Licenses are acceptable. | NOT APPLICABLE | No application dependency, package installation or executable plugin hook introduced by this adoption. |
| Lockfile reviewed/updated intentionally. | NOT APPLICABLE | No application dependency, package installation or executable plugin hook introduced by this adoption. |
| Executable plugin hooks/scripts were reviewed before trust/enablement. | NOT APPLICABLE | No application dependency, package installation or executable plugin hook introduced by this adoption. |
| External AI/data providers are documented and approved. | BLOCKED | Verify against the restored application before public release. |

## Refresh evidence

See [design review](design-review/REFRESH.md) and [restoration status](RESTORE-STATUS.md). This gate remains BLOCKED for public launch: incomplete fixture coverage, unverified account/calendar/notification flows, recovery, retention and final product/legal review. The local design is reviewable and is not the public production release.

## 2026-10-09 public beta release

Owner authorized publication and Cloudflare deployment. Normal production build and revised seasonal live-data check pass; Olympics are optional while no active programme exists, and baseball's postseason minimum is one actual upcoming fixture rather than 100. Baseball near-term API-Sports hydration is now connected. Saved archives, accessible poster groups and unavailable Google sign-in were corrected. This supersedes the earlier coverage-only release blockers; the complete gate still has unverified account delivery/lifecycle, recovery and owner legal review. See [current release assessment](releases/2026-10-09.md).
