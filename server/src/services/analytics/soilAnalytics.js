/**
 * Transparent agronomic rule engine for soil health interpretation
 */

export const analyzeSoilMeasurements = (measurements, cropName = 'General') => {
  const recommendations = [];
  const { ph, nitrogen, phosphorus, potassium, moisture, organicMatter } = measurements;

  // 1. pH Evaluation
  if (ph < 5.8) {
    recommendations.push({
      parameter: 'pH',
      status: 'low',
      advisory: `Soil is acidic (pH ${ph}). Micronutrient availability (P, Ca, Mg) may be hindered.`,
      action: 'Apply agricultural lime (calcium carbonate) or dolomite to raise soil pH.'
    });
  } else if (ph > 7.8) {
    recommendations.push({
      parameter: 'pH',
      status: 'high',
      advisory: `Soil is alkaline (pH ${ph}). Iron, zinc, and manganese deficiencies may occur.`,
      action: 'Incorporate agricultural gypsum, elemental sulfur, or organic compost to buffer pH.'
    });
  } else {
    recommendations.push({
      parameter: 'pH',
      status: 'optimal',
      advisory: `pH level (${ph}) is within the optimal range (6.0 - 7.5) for nutrient uptake.`,
      action: 'Maintain current organic matter management.'
    });
  }

  // 2. Nitrogen (N)
  if (nitrogen < 140) {
    recommendations.push({
      parameter: 'Nitrogen',
      status: 'low',
      advisory: `Available Nitrogen (${nitrogen} kg/ha) is low. Risk of stunted vegetative growth and yellowing leaves.`,
      action: 'Apply balanced nitrogenous fertilizer (such as split-application urea or neem-coated urea) or green manure.'
    });
  } else if (nitrogen > 280) {
    recommendations.push({
      parameter: 'Nitrogen',
      status: 'high',
      advisory: `Nitrogen level (${nitrogen} kg/ha) is excessive. Risk of lodging, pest vulnerability, and delayed maturity.`,
      action: 'Withhold further nitrogen top-dressing; flush excess with regulated irrigation if feasible.'
    });
  } else {
    recommendations.push({
      parameter: 'Nitrogen',
      status: 'optimal',
      advisory: `Nitrogen level (${nitrogen} kg/ha) is balanced for standard growth cycles.`,
      action: 'Continue scheduled fertilization program.'
    });
  }

  // 3. Phosphorus (P)
  if (phosphorus < 20) {
    recommendations.push({
      parameter: 'Phosphorus',
      status: 'low',
      advisory: `Phosphorus (${phosphorus} kg/ha) is below recommended levels. May restrict root development and tillering.`,
      action: 'Apply Single Super Phosphate (SSP) or Diammonium Phosphate (DAP) close to root zones.'
    });
  } else if (phosphorus > 60) {
    recommendations.push({
      parameter: 'Phosphorus',
      status: 'high',
      advisory: `Phosphorus (${phosphorus} kg/ha) is high. May suppress zinc and iron uptake.`,
      action: 'Pause phosphorus application for the upcoming season.'
    });
  } else {
    recommendations.push({
      parameter: 'Phosphorus',
      status: 'optimal',
      advisory: `Phosphorus (${phosphorus} kg/ha) supports vigorous root development.`,
      action: 'Standard maintenance dosage.'
    });
  }

  // 4. Potassium (K)
  if (potassium < 140) {
    recommendations.push({
      parameter: 'Potassium',
      status: 'low',
      advisory: `Potassium (${potassium} kg/ha) is low. Weakens drought resistance and grain filling.`,
      action: 'Apply Muriate of Potash (MOP) or Sulfate of Potash (SOP).'
    });
  } else {
    recommendations.push({
      parameter: 'Potassium',
      status: 'optimal',
      advisory: `Potassium level (${potassium} kg/ha) is sufficient for disease resistance and osmotic regulation.`,
      action: 'Maintain regular agronomic schedule.'
    });
  }

  // 5. Moisture (%)
  if (moisture < 35) {
    recommendations.push({
      parameter: 'Moisture',
      status: 'critical',
      advisory: `Soil moisture (${moisture}%) is deficient. Crop is entering moisture stress.`,
      action: 'Immediate irrigation required. Consider mulching to conserve moisture.'
    });
  } else if (moisture > 80) {
    recommendations.push({
      parameter: 'Moisture',
      status: 'high',
      advisory: `Soil moisture (${moisture}%) is near saturation. Aeration is restricted, risking root rot.`,
      action: 'Inspect field drainage channels and pause scheduled irrigation.'
    });
  } else {
    recommendations.push({
      parameter: 'Moisture',
      status: 'optimal',
      advisory: `Soil moisture (${moisture}%) is well within field capacity.`,
      action: 'Monitor against impending weather forecast.'
    });
  }

  return recommendations;
};
