import { supabase } from '../config/supabase.js';

async function getOrCreatePerson(name) {
  const { data: existing } = await supabase
    .from("people")
    .select("*")
    .eq("name", name)
    .single();

  if (existing) return existing;

  const { data, error } = await supabase
    .from("people")
    .insert([{ name }])
    .select()
    .single();

  if (error) throw error;

  return data;
}

export { getOrCreatePerson };