import { supabaseAdmin } from '../config/supabase.js';

const indianSources = [
  { name: 'The Hindu',            domain: 'thehindu.com',      credibility_score: 90,  category: 'Newspaper',          description: 'Indian English-language daily newspaper',                  is_verified: true },
  { name: 'Indian Express',       domain: 'indianexpress.com', credibility_score: 88,  category: 'Newspaper',          description: 'Indian English-language daily newspaper',                 is_verified: true },
  { name: 'Times of India',       domain: 'timesofindia.indiatimes.com', credibility_score: 80, category: 'Newspaper',    description: 'Indian English-language daily newspaper',                  is_verified: true },
  { name: 'NDTV',                 domain: 'ndtv.com',          credibility_score: 82,  category: 'Cable News',         description: 'Indian news media company',                               is_verified: true },
  { name: 'Hindustan Times',      domain: 'hindustantimes.com',credibility_score: 82,  category: 'Newspaper',          description: 'Indian daily newspaper',                                  is_verified: true },
  { name: 'Livemint',             domain: 'livemint.com',      credibility_score: 88,  category: 'Newspaper',          description: 'Indian financial daily newspaper',                         is_verified: true },
  { name: 'Press Trust of India', domain: 'ptinews.com',       credibility_score: 95,  category: 'Wire Service',       description: 'Largest news agency in India',                            is_verified: true },
  { name: 'Press Information Bureau', domain: 'pib.gov.in',    credibility_score: 97,  category: 'Government',         description: 'Official press release agency of the Indian Government',   is_verified: true }
];

async function seed() {
  console.log('Starting seed of Indian news sources...');
  
  for (const source of indianSources) {
    try {
      // Check if source with the same name exists
      const { data: existing, error: findError } = await supabaseAdmin
        .from('sources')
        .select('id')
        .eq('name', source.name)
        .maybeSingle();
        
      if (findError) {
        console.error(`Error looking up ${source.name}:`, findError.message);
        continue;
      }
      
      if (existing) {
        console.log(`Source "${source.name}" already exists. Updating credibility_score...`);
        const { error: updateError } = await supabaseAdmin
          .from('sources')
          .update({
            domain: source.domain,
            credibility_score: source.credibility_score,
            category: source.category,
            description: source.description,
            is_verified: source.is_verified
          })
          .eq('id', existing.id);
          
        if (updateError) {
          console.error(`Error updating ${source.name}:`, updateError.message);
        } else {
          console.log(`Updated ${source.name} successfully.`);
        }
      } else {
        console.log(`Inserting new source "${source.name}"...`);
        const { error: insertError } = await supabaseAdmin
          .from('sources')
          .insert(source);
          
        if (insertError) {
          console.error(`Error inserting ${source.name}:`, insertError.message);
        } else {
          console.log(`Inserted ${source.name} successfully.`);
        }
      }
    } catch (err) {
      console.error(`Unexpected error seeding ${source.name}:`, err.message);
    }
  }
  
  console.log('Seeding completed.');
}

seed().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
