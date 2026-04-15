import { supabase } from '../config/supabase.js';

export async function createEntry({
  personId,
  description,
  amount,
  entryDate
}) {
  const { data, error } = await supabase
    .from('entries')
    .insert([
      {
        person_id: personId,
        description: description.trim(),
        amount,
        entry_date: entryDate
      }
    ])
    .select()
    .single();

  if (error) {
    throw new Error(`Erro ao criar lançamento: ${error.message}`);
  }

  return data;
}

export async function listEntriesByPerson(personId) {
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .eq('person_id', personId)
    .order('entry_date', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Erro ao listar lançamentos: ${error.message}`);
  }

  return data ?? [];
}

export async function sumEntriesByPerson(personId) {
  const entries = await listEntriesByPerson(personId);

  return entries.reduce((sum, item) => {
    return sum + Number(item.amount);
  }, 0);
}