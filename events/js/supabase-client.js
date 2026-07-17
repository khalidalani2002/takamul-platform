// Shared Supabase client used by every page.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { SUPABASE_URL, SUPABASE_ANON_KEY, MEDIA_BUCKET } from "../config.js";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export { MEDIA_BUCKET };

// True until the user edits config.js with real values.
export const NOT_CONFIGURED = SUPABASE_URL.includes("YOUR-PROJECT-ref");
