import { supabase } from '../config/supabase.js';
import { normalizeText } from '../utils/normalizeText.js';

export async function findPersonByName(name) {
  const normalizedName = normalizeText(name);

  const { data, error } = await supabase
    .from('people')
    .select('*')
    .eq('name', normalizedName)
    .maybeSingle();

  if (error) {
    throw new Error(`Erro ao buscar pessoa: ${error.message}`);
  }

  return data;
}

export async function createPerson(name) {
  const normalizedName = normalizeText(name);

  const { data, error } = await supabase
    .from('people')
    .insert([{ name: normalizedName }])
    .select()
    .single();

  if (error) {
    throw new Error(`Erro ao criar pessoa: ${error.message}`);
  }

  return data;
}

export async function findOrCreatePerson(name) {
  const existingPerson = await findPersonByName(name);

  if (existingPerson) {
    return existingPerson;
  }

  return createPerson(name);
}