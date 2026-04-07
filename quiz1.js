import {createClient} from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = 'https://jvynfvwolycspwxaiafc.supabase.co'
const supabaseAnonKey = 'sb_publishable_dTBrLVYRBAJvUAYn7yyAcA__OtK7b_o'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function pokaz1() {
    console.log('Funkcja pokaz() została wywołana');
}