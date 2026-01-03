// Utility functions for calculating interview metrics

/**
 * Calculate communication score based on analysis feedback
 * Looks for keywords indicating communication quality
 */
export const calculateCommunicationScore = (analysisText: string): number => {
  if (!analysisText) return 0;

  const text = analysisText.toLowerCase();
  let score = 50; // Base score

  // Positive indicators
  const positiveKeywords = [
    'clear', 'concise', 'well-structured', 'articulate', 'coherent',
    'organized', 'well-explained', 'effective', 'good communication',
    'well-communicated', 'professional', 'confident tone', 'engaging'
  ];

  // Negative indicators
  const negativeKeywords = [
    'unclear', 'vague', 'rambling', 'confusing', 'disorganized',
    'poor structure', 'lacks clarity', 'unfocused', 'verbose',
    'difficult to follow', 'needs improvement'
  ];

  // Count positive indicators
  positiveKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      score += 5;
    }
  });

  // Count negative indicators
  negativeKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      score -= 5;
    }
  });

  // Adjust based on answer length and structure
  const wordCount = analysisText.split(' ').length;
  if (wordCount > 100 && wordCount < 300) {
    score += 5; // Good length
  }

  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, score));
};

/**
 * Calculate confidence score based on analysis feedback
 * Looks for keywords indicating confidence and decisiveness
 */
export const calculateConfidenceScore = (analysisText: string, answerText: string): number => {
  if (!analysisText || !answerText) return 0;

  const analysisLower = analysisText.toLowerCase();
  const answerLower = answerText.toLowerCase();
  let score = 50; // Base score

  // Positive confidence indicators
  const confidencePositive = [
    'confident', 'decisive', 'strong', 'assertive', 'definitive',
    'clear stance', 'demonstrates expertise', 'shows knowledge',
    'well-prepared', 'competent', 'assured'
  ];

  // Negative confidence indicators
  const confidenceNegative = [
    'hesitant', 'uncertain', 'lacks confidence', 'unsure', 'vague',
    'tentative', 'weak', 'needs more detail', 'superficial',
    'lacks depth', 'unconvincing'
  ];

  // Check analysis for confidence indicators
  confidencePositive.forEach(keyword => {
    if (analysisLower.includes(keyword)) {
      score += 5;
    }
  });

  confidenceNegative.forEach(keyword => {
    if (analysisLower.includes(keyword)) {
      score -= 5;
    }
  });

  // Check answer for filler words (reduces confidence)
  const fillerWords = ['um', 'uh', 'like', 'you know', 'kind of', 'sort of', 'i think', 'maybe', 'probably'];
  let fillerCount = 0;
  fillerWords.forEach(filler => {
    const matches = answerLower.match(new RegExp(filler, 'g'));
    if (matches) fillerCount += matches.length;
  });

  // Penalize excessive filler words
  if (fillerCount > 5) {
    score -= Math.min(20, fillerCount * 2);
  }

  // Bonus for using strong action verbs
  const strongVerbs = ['achieved', 'implemented', 'led', 'managed', 'developed', 'created', 'improved'];
  strongVerbs.forEach(verb => {
    if (answerLower.includes(verb)) {
      score += 3;
    }
  });

  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, score));
};

/**
 * Calculate overall scores from all responses
 */
export const calculateOverallScores = (responses: any[]) => {
  if (!responses || responses.length === 0) {
    return {
      overallScore: 0,
      communicationScore: 0,
      confidenceScore: 0,
    };
  }

  let totalCommunication = 0;
  let totalConfidence = 0;
  let validResponses = 0;

  responses.forEach((response) => {
    if (response.answer && response.analysis?.analysis) {
      const commScore = calculateCommunicationScore(response.analysis.analysis);
      const confScore = calculateConfidenceScore(response.analysis.analysis, response.answer);

      totalCommunication += commScore;
      totalConfidence += confScore;
      validResponses++;
    }
  });

  const avgCommunication = validResponses > 0 ? Math.round(totalCommunication / validResponses) : 0;
  const avgConfidence = validResponses > 0 ? Math.round(totalConfidence / validResponses) : 0;
  const overallScore = Math.round((validResponses / responses.length) * 100);

  return {
    overallScore,
    communicationScore: avgCommunication,
    confidenceScore: avgConfidence,
  };
};
