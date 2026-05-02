import { supabase } from '../config/supabase.js';
import { getOrCreatePerson } from './people.service.js';
import { formatarDataUTC } from '../utils/normalizeDate.js';

async function createEntry(data) {
  // console.log("📦 SERVICE RECEBEU:", data);

  if (!data.amount || isNaN(data.amount)) {
    throw new Error("Valor inválido no service");
  }

  if (!data.description) {
    throw new Error("Descrição obrigatória");
  }

  const person = await getOrCreatePerson(data.name);

  // console.log("👤 DATA:", data);
  // console.log("👤 Pessoa:", person);

  const entryData = {
    name: data.name,
    description: data.description,
    amount: data.amount,
    date: formatarDataUTC(data.date),
    person_id: person.id,
    entry_date: new Date().toISOString()
  };

  // console.log("📤 Enviando para Supabase:", entryData);

  const { data: result, error } = await supabase
    .from("entries")
    .insert({
      name: entryData.name,
      description: entryData.description,
      value: entryData.amount,
      person_id: entryData.person_id,
      date: entryData.date,
      entry_date: entryData.entry_date,
      amount: entryData.amount, 
    })
    .select();

  if (error) {
    // console.log("❌ ERRO SUPABASE:", error);
    throw error;
  }

  // console.log("✅ SALVO NO BANCO:", result);

  return result;
}

export { createEntry };