import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: process.env.PORT || 3000,

  // SUPABASE
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseSecretKey: process.env.SUPABASE_ANON_KEY || '',

  // EVOLUTION API
  evolutionApiUrl: process.env.EVOLUTION_API_URL || '',
  evolutionApiKey: process.env.EVOLUTION_API_KEY || '',
  evolutionInstance: process.env.EVOLUTION_INSTANCE || '',

  // SEGURANÇA (OPCIONAL)
  allowedNumbers: process.env.ALLOWED_NUMBERS
    ? process.env.ALLOWED_NUMBERS.split(',').map((item) => item.trim())
    : []
};
