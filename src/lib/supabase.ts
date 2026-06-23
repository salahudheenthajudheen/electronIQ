import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const warnOnce = (() => {
  let warned = false
  return () => { if (!warned) { warned = true; console.warn('Supabase not configured — set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env') } }
})()

const result = { data: null, error: new Error('Supabase not configured') }

function makeBuilder(): any {
  const builder = function () { return builder }
  builder.select = builder
  builder.insert = builder
  builder.update = builder
  builder.upsert = builder
  builder.delete = builder
  builder.eq = builder
  builder.neq = builder
  builder.gt = builder
  builder.gte = builder
  builder.lt = builder
  builder.lte = builder
  builder.like = builder
  builder.ilike = builder
  builder.is = builder
  builder.in = builder
  builder.order = builder
  builder.limit = builder
  builder.range = builder
  builder.single = () => {
    warnOnce()
    return Promise.resolve(result)
  }
  builder.maybeSingle = builder.single
  builder.then = (resolve: any) => {
    warnOnce()
    return Promise.resolve(result).then(resolve)
  }
  return builder
}

const auth = {
  getUser: () => Promise.resolve({ data: { user: null }, error: null }),
  signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
  signUp: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
  signOut: () => Promise.resolve({ error: null }),
  onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : ({
      auth,
      from: () => makeBuilder(),
      channel: () => ({ on: () => ({ subscribe: () => {}, send: () => {} }) }),
      functions: { invoke: () => Promise.resolve(result) },
      storage: { from: () => ({ upload: () => Promise.resolve(result), getPublicUrl: () => ({ data: { publicUrl: '' } }) }) },
      removeChannel: () => {},
    } as any)
