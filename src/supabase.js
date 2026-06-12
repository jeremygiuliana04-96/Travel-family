import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ogdzxvlanlcbtyjcaodd.supabase.co'

const supabaseAnonKey = 'sb_publishable_ojku3TAwLAV0u2yJLt9PLA_Zztpr9D-'

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)