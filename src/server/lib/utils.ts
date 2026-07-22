/**
 * Server-side utilities.
 *
 * Re-exported from the shared utils module to avoid duplication.
 * Previously this file duplicated formatDate/getEra/normalizeUrl with a bug
 * in normalizeUrl (missing ^ anchor on www. strip).
 *
 * Spec reference: DEV (Development Standards) — single source of truth.
 */
export { formatDate, getEra, normalizeUrl, getWaybackEmbedUrl } from "@/utils";
