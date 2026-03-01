/**
 * Rewrites Supabase Storage URLs to go through the Vercel proxy
 * so they are never blocked by ISP-level filters on supabase.co.
 *
 * In production:  https://xxx.supabase.co/storage/v1/...
 *              →  /supabase/storage/v1/...
 *
 * In development: URL is returned unchanged.
 */
export function proxiedStorageUrl(url: string | null | undefined): string | undefined {
    if (!url) return undefined;

    if (import.meta.env.PROD) {
        // Replace the origin (https://xxx.supabase.co) with our proxy prefix
        return url.replace(/^https:\/\/[^/]+\.supabase\.co/, '/supabase');
    }

    return url;
}
