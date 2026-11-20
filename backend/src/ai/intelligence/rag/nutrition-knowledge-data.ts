/**
 * CalTrack Intelligence Engine (CIE) — Curated Nutrition Knowledge Base
 *
 * Reputable, verifiable nutrition reference passages covering:
 * - Protein and muscle gain (ISSN, NIH)
 * - Calorie balance and weight management (CDC, WHO, ACSM)
 * - Macronutrients (USDA, Dietary Guidelines for Americans)
 * - Balanced diets (Harvard T.H. Chan, WHO)
 * - Meal planning and hydration (NASEM, JISSN)
 *
 * Respects source licensing: summarizes consensus scientific evidence with high factual density.
 */

import { NutritionKnowledgeItem } from './nutrition-rag.types';

export const CURATED_NUTRITION_KNOWLEDGE: NutritionKnowledgeItem[] = [
  // 1. Protein and Muscle Gain
  {
    topic: 'protein',
    title: 'Optimal Daily Protein Intake for Muscle Protein Synthesis and Hypertrophy',
    content:
      'For active individuals seeking to maximize muscle protein synthesis and promote muscle hypertrophy, the International Society of Sports Nutrition recommends an overall daily protein intake in the range of 1.4 to 2.0 grams per kilogram of body weight per day (g/kg/day). Doses of 20 to 40 grams of high-quality complete protein evenly distributed across meals every 3 to 4 hours optimize anabolic response and muscle recovery.',
    sourceTitle: 'International Society of Sports Nutrition Position Stand: Protein and Exercise',
    sourceUrl: 'https://jissn.biomedcentral.com/articles/10.1186/s12970-017-0177-8',
    provenance: 'Jäger et al., Journal of the International Society of Sports Nutrition (JISSN), 2017',
  },
  {
    topic: 'protein',
    title: 'Protein Quality, Leucine Threshold, and Essential Amino Acids',
    content:
      'Consuming complete proteins that supply all nine essential amino acids is critical for skeletal muscle maintenance. In particular, the branched-chain amino acid leucine acts as the primary trigger for the mammalian target of rapamycin (mTOR) pathway. Consuming approximately 2.5 to 3.0 grams of leucine per meal (abundant in eggs, dairy whey, chicken, fish, and combined soy/legumes) achieves the leucine threshold for maximal protein synthesis.',
    sourceTitle: 'Dietary Protein and Muscle Mass: Translating Science to Application',
    sourceUrl: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6566799/',
    provenance: 'Phillips et al., Nutrients, 2019',
  },

  // 2. Calorie Balance and Weight Management
  {
    topic: 'calories',
    title: 'Energy Balance Principle for Weight Loss and Fat Reduction',
    content:
      'Weight loss requires a sustained negative energy balance (calorie deficit), wherein energy expenditure exceeds total energy intake. A moderate calorie deficit of 300 to 500 kcal per day below Total Daily Energy Expenditure (TDEE) promotes a gradual, sustainable fat loss rate of 0.25 to 0.5 kg (0.5 to 1.0 lb) per week. Severe caloric restriction below basal metabolic rate is counterproductive as it accelerates muscle loss and causes metabolic adaptation.',
    sourceTitle: 'CDC: Healthy Weight, Nutrition, and Physical Activity - Losing Weight',
    sourceUrl: 'https://www.cdc.gov/healthy-weight-growth/losing-weight/index.html',
    provenance: 'U.S. Centers for Disease Control and Prevention (CDC) Clinical Guidelines',
  },
  {
    topic: 'calories',
    title: 'Calorie Surplus for Muscle Hypertrophy and Mass Gain',
    content:
      'Hypertrophy and lean tissue accrual are substantially enhanced by a controlled hypercaloric state (energy surplus). A conservative daily surplus of 250 to 500 kcal above maintenance energy requirements provides the necessary fuel and substrate for muscle protein accretion while limiting excess subcutaneous fat accumulation. Consistent resistance training alongside an energy surplus directs partitioned calories toward skeletal muscle remodeling.',
    sourceTitle: 'American College of Sports Medicine: Nutrition and Athletic Performance',
    sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/26891141/',
    provenance: 'Thomas, Erdman & Burke, ACSM Position Stand, 2016',
  },

  // 3. Macronutrients
  {
    topic: 'macronutrients',
    title: 'Acceptable Macronutrient Distribution Ranges (AMDR)',
    content:
      'The National Academies of Sciences, Engineering, and Medicine and the USDA establish the Acceptable Macronutrient Distribution Ranges (AMDR) for healthy adults: Carbohydrates should comprise 45% to 65% of daily energy, Fat 20% to 35% of daily energy, and Protein 10% to 35% of daily energy. Carbohydrates and protein provide 4 kcal per gram, while dietary fat provides 9 kcal per gram.',
    sourceTitle: 'Dietary Guidelines for Americans 2020-2025',
    sourceUrl: 'https://www.dietaryguidelines.gov/resources/2020-2025-dietary-guidelines-online-materials',
    provenance: 'U.S. Department of Agriculture (USDA) & Department of Health and Human Services (HHS)',
  },
  {
    topic: 'macronutrients',
    title: 'Complex Carbohydrates and Dietary Fiber Requirements',
    content:
      'Complex carbohydrates including whole grains, legumes, and starchy vegetables supply sustained glucose for glycogen replenishment in liver and skeletal muscle. The World Health Organization (WHO) recommends consuming at least 25 to 30 grams of dietary fiber daily from whole foods. Adequate dietary fiber improves gastrointestinal motility, enhances satiety to aid calorie control, and lowers circulating LDL cholesterol.',
    sourceTitle: 'World Health Organization: Healthy Diet Fact Sheet No. 394',
    sourceUrl: 'https://www.who.int/news-room/fact-sheets/detail/healthy-diet',
    provenance: 'WHO Nutrition and Food Safety Department Guidelines',
  },
  {
    topic: 'macronutrients',
    title: 'Dietary Fats: Unsaturated vs. Saturated and Trans Fatty Acids',
    content:
      'Dietary fats are indispensable for hormone production (including testosterone), cell membrane structural integrity, and absorption of fat-soluble vitamins (A, D, E, K). Unsaturated fatty acids—both monounsaturated (olive oil, avocados, nuts) and polyunsaturated omega-3 and omega-6 fatty acids (fatty fish, flaxseed, walnuts)—should form the majority of fat intake. Saturated fats should be limited to less than 10% of total daily calories, and industrial trans fats eliminated.',
    sourceTitle: 'World Health Organization: Saturated and Trans-Fatty Acid Guidelines',
    sourceUrl: 'https://www.who.int/publications/i/item/9789240073630',
    provenance: 'WHO Executive Guidelines on Dietary Fats, 2023',
  },

  // 4. Balanced Diets and Micronutrients
  {
    topic: 'balanced_diet',
    title: 'The Healthy Plate Model and Micronutrient Density',
    content:
      'A balanced, nutrient-dense diet is structured around whole, minimally refined ingredients: half of the plate filled with colorful vegetables and whole fruits, one quarter with whole intact grains (brown rice, oats, quinoa), and one quarter with lean proteins (legumes, poultry, fish, tofu). Micronutrients such as iron, zinc, magnesium, calcium, and B-complex vitamins act as cofactors in energy metabolism and are most bioavailable from diverse dietary sources.',
    sourceTitle: 'The Healthy Eating Plate - Harvard T.H. Chan School of Public Health',
    sourceUrl: 'https://www.hsph.harvard.edu/nutritionsource/healthy-eating-plate/',
    provenance: 'Harvard T.H. Chan Department of Nutrition, Harvard University',
  },

  // 5. Meal Planning and Hydration
  {
    topic: 'hydration',
    title: 'Daily Fluid Requirements and Electrolyte Balance',
    content:
      'Adequate fluid intake is essential for cellular homeostasis, thermoregulation, nutrient transport, and cognitive performance. The National Academies of Sciences, Engineering, and Medicine recommends a total daily fluid intake of approximately 2.7 liters (91 oz) for adult women and 3.7 liters (125 oz) for adult men from all water, beverages, and moisture-rich foods. During endurance or high-intensity exercise, sodium and potassium electrolytes should be replenished alongside fluids.',
    sourceTitle: 'Dietary Reference Intakes for Water, Potassium, Sodium, Chloride, and Sulfate',
    sourceUrl: 'https://nap.nationalacademies.org/catalog/10925/dietary-reference-intakes-for-water-potassium-sodium-chloride-and-sulfate',
    provenance: 'National Academies of Sciences, Engineering, and Medicine (NASEM)',
  },
  {
    topic: 'meal_planning',
    title: 'Pre- and Post-Workout Nutrition Timing and Meal Planning',
    content:
      'Meal planning ensures structured adherence to daily calorie and macronutrient targets. Consuming a balanced meal containing easily digestible carbohydrates and 20 to 30 grams of protein 2 to 3 hours before resistance exercise ensures adequate circulating amino acids and muscle glycogen stores. Post-workout nutrition within 1 to 2 hours with combined carbohydrates and protein facilitates rapid glycogen re-synthesis and initiates muscle repair.',
    sourceTitle: 'Timing and Composition of Nutritional Supplements in Strength and Endurance Training',
    sourceUrl: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC7400877/',
    provenance: 'Kerksick et al., Journal of the International Society of Sports Nutrition (JISSN)',
  },
];
