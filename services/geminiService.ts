import { GoogleGenAI, Type } from "@google/genai";
// FIX: Add missing types to import to resolve errors in unused components.
import type { EsgPlaybookCategory, ResourceItem, Initiative, SustainabilityData, AssessmentScores, SustainabilityTrend, LibraryCategory, LibraryItem, Challenge } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const model = 'gemini-2.5-flash';

const resourceSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: 'A professional and descriptive title for the resource, based on the provided ESG guide.',
      },
      description: {
        type: Type.STRING,
        description: 'A detailed summary of the resource, outlining its strategic value for an organization. Should be at least 2-3 paragraphs long and reflect concepts from the ESG guide.',
      },
    },
    required: ["title", "description"],
  },
};

export const getEsgPlaybookContent = async (category: EsgPlaybookCategory): Promise<ResourceItem[]> => {
  let prompt = '';
  switch (category) {
    case 'ESG Value Drivers':
      prompt = "Based on 'The Leader's Guide to Sustainable Business Transformation', generate 4 detailed articles explaining the key strategic business values driven by ESG data. Cover topics like Cost Savings, Competitive Advantage, Business Resilience, and Risk Management.";
      break;
    case 'Overcoming Challenges':
      prompt = "Based on the guide, generate 4 articles on the shared challenges in transforming a business with ESG data. Cover Siloed Data, Resourcing Constraints, Scope & Complexity, and Lack of a Common Language.";
      break;
    case 'Data Readiness Framework':
       prompt = "Based on the guide, generate 4 articles explaining the framework for advancing ESG data readiness. Detail the stages (Data Gathering, Data Insights, Data Action) and key dimensions like Reporting Process, Technology, and People & Culture.";
      break;
    case 'Industry Use Cases':
      prompt = "Based on the guide, generate 4 articles summarizing ESG use cases and strategic opportunities for different industries. Cover Financial Services, Manufacturing, Retail, and Energy.";
      break;
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: resourceSchema,
      },
    });
    const jsonString = response.text;
    const parsed = JSON.parse(jsonString) as ResourceItem[];
    if (parsed.length === 0) {
        throw new Error("API returned empty array");
    }
    return parsed;
  } catch (error) {
    console.error(`Error fetching ESG playbook content for ${category}:`, error);
    // Return an empty array to be handled by the component's fallback logic
    return [];
  }
};

const initiativesSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
          description: "The name of the ESG initiative.",
        },
        description: {
          type: Type.STRING,
          description: "A detailed explanation of the initiative, its strategic value, and potential implementation steps, inspired by concepts in the ESG guide. Should be at least 2-3 paragraphs long.",
        },
        difficulty: {
          type: Type.STRING,
          enum: ['Low', 'Medium', 'High'],
          description: 'The resource intensity level of the initiative (Low, Medium, or High).'
        },
      },
      required: ["title", "description", "difficulty"],
    },
};

export const getEsgInitiatives = async (): Promise<Initiative[]> => {
    try {
        const response = await ai.models.generateContent({
            model,
            contents: "Generate 3 high-impact quarterly ESG (Environmental, Social, Governance) initiatives for a forward-thinking organization, inspired by 'The Leader's Guide to Sustainable Business Transformation'. Each should have a title, a detailed description of its strategic value, and a resource intensity level ('Low', 'Medium', 'High').",
            config: {
                responseMimeType: "application/json",
                responseSchema: initiativesSchema,
            },
        });
        const jsonString = response.text;
        const parsed = JSON.parse(jsonString) as Initiative[];
        if (parsed.length === 0) {
            throw new Error("API returned empty array");
        }
        return parsed;
    } catch (error) {
        console.error("Error fetching ESG initiatives:", error);
        // Return an empty array to be handled by the component's fallback logic
        return [];
    }
};

export const getReportSummary = async (data: SustainabilityData): Promise<string> => {
  const { businessName, ...metrics } = data;
  const prompt = `The following data represents the latest sustainability report for the organization "${businessName}": ${JSON.stringify(metrics)}. Generate a brief executive summary (2-3 paragraphs) specifically for "${businessName}". The summary should highlight key achievements, areas for improvement, and the overall sustainability posture. The tone should be professional and suitable for a stakeholder report.`;
  try {
    const response = await ai.models.generateContent({ model, contents: prompt });
    return response.text;
  } catch (error) {
    console.error("Error fetching report summary:", error);
    return "Could not generate summary. Review the data to identify key trends and formulate an executive overview.";
  }
}

export const getAssessmentRecommendations = async (scores: AssessmentScores): Promise<string> => {
    const scoresString = Object.entries(scores)
        .map(([category, score]) => `- ${category}: ${score.toFixed(0)}/100`)
        .join('\n');

    const lowestCategory = Object.entries(scores).sort((a, b) => a[1] - b[1])[0][0];

    const prompt = `An organization performed an ESG maturity assessment based on "The Leader's Guide to Sustainable Business Transformation." Here are their maturity scores (out of 100) for each key category:\n${scoresString}\n\n
Act as a top-tier ESG strategy consultant providing feedback to their leadership team. 
1.  First, provide a brief, high-level summary of their current ESG maturity stage (e.g., Foundational, Developing, Strategic, Transformational) based on the overall scores.
2.  Then, provide 3 concise, actionable, and prioritized recommendations to help them advance. The recommendations should be strategic and focus on their weakest area, which appears to be "${lowestCategory}". Frame the advice for C-level executives.`;

    try {
        const response = await ai.models.generateContent({ model, contents: prompt });
        return response.text;
    } catch (error) {
        console.error("Error fetching assessment recommendations:", error);
        return "Could not generate recommendations. A good first step is to analyze your lowest-scoring category and identify 'quick wins' that can build momentum for your ESG strategy.";
    }
};

const trendsSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        name: {
          type: Type.STRING,
          description: "The name of the global sustainability metric (e.g., 'Global Renewable Energy Investment').",
        },
        value: {
          type: Type.STRING,
          description: "The current value of the metric, including units (e.g., '$1.7T', '421 ppm').",
        },
        change: {
            type: Type.NUMBER,
            description: "The recent percentage change (positive for increase, negative for decrease). E.g., 15 for +15%, -5 for -5%."
        },
        insight: {
          type: Type.STRING,
          description: "A very brief, one-sentence insight about this trend.",
        },
      },
      required: ["name", "value", "change", "insight"],
    },
};

export const getSustainabilityTrends = async (): Promise<SustainabilityTrend[]> => {
    const prompt = "Generate a list of 6 current, impactful global sustainability and economic trends. For each trend, provide its name, its current value with units, its recent percentage change (positive for increase, negative for decrease), and a very brief one-sentence insight. The trends should cover diverse areas like renewable energy investment, carbon pricing, EV market share, corporate ESG reporting rates, circular economy growth, and global plastic waste generation.";
    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: trendsSchema,
            },
        });
        const jsonString = response.text;
        const parsed = JSON.parse(jsonString) as SustainabilityTrend[];
         if (parsed.length === 0) {
            throw new Error("API returned empty array");
        }
        return parsed;
    } catch (error) {
        console.error("Error fetching sustainability trends:", error);
        // Return an empty array to be handled by the component's fallback logic
        return [];
    }
};

// FIX: Add getDailyRecommendation function for Recommendations component.
export const getDailyRecommendation = async (): Promise<string> => {
  const prompt = "Generate a concise, actionable, and inspiring daily recommendation for living a more sustainable lifestyle. It should be a single sentence.";
  try {
    const response = await ai.models.generateContent({ model, contents: prompt });
    return response.text.trim();
  } catch (error) {
    console.error("Error fetching daily recommendation:", error);
    return "Check your local community board for recycling events this week!";
  }
};

// FIX: Add schema for getLibraryContent function.
const libraryItemSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: 'A catchy and descriptive title for the library item.',
      },
      description: {
        type: Type.STRING,
        description: 'A detailed description of the tip, recipe, or DIY project. Should be a few paragraphs long.',
      },
    },
    required: ["title", "description"],
  },
};

// FIX: Add getLibraryContent function for Library component.
export const getLibraryContent = async (category: LibraryCategory): Promise<LibraryItem[]> => {
  let prompt = '';
  switch (category) {
    case 'Tips':
      prompt = "Generate 4 detailed and practical tips for reducing household waste. Each tip should have a title and a detailed description.";
      break;
    case 'Recipes':
      prompt = "Generate 4 simple and delicious plant-based recipes that are beginner-friendly. Each recipe should have a title and a detailed description including ingredients and steps.";
      break;
    case 'DIY Projects':
       prompt = "Generate 4 creative DIY projects for upcycling common household items. Each project should have a title and a detailed description of the materials and instructions.";
      break;
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: libraryItemSchema,
      },
    });
    const jsonString = response.text;
    const parsed = JSON.parse(jsonString) as LibraryItem[];
    if (parsed.length === 0) {
        throw new Error("API returned empty array");
    }
    return parsed;
  } catch (error) {
    console.error(`Error fetching library content for ${category}:`, error);
    return [];
  }
};

// FIX: Add schema for getWeeklyChallenges function.
const challengesSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
          description: "The name of the weekly sustainability challenge.",
        },
        description: {
          type: Type.STRING,
          description: "A detailed explanation of the challenge, what it involves, and why it's impactful.",
        },
        difficulty: {
          type: Type.STRING,
          enum: ['Easy', 'Medium', 'Hard'],
          description: 'The difficulty level of the challenge (Easy, Medium, or Hard).'
        },
      },
      required: ["title", "description", "difficulty"],
    },
};

// FIX: Add getWeeklyChallenges function for Challenges component.
export const getWeeklyChallenges = async (): Promise<Challenge[]> => {
    try {
        const response = await ai.models.generateContent({
            model,
            contents: "Generate 3 engaging weekly sustainability challenges for individuals. Each challenge should have a title, a detailed description, and a difficulty level ('Easy', 'Medium', 'Hard').",
            config: {
                responseMimeType: "application/json",
                responseSchema: challengesSchema,
            },
        });
        const jsonString = response.text;
        const parsed = JSON.parse(jsonString) as Challenge[];
        if (parsed.length === 0) {
            throw new Error("API returned empty array");
        }
        return parsed;
    } catch (error) {
        console.error("Error fetching weekly challenges:", error);
        return [];
    }
};

// FIX: Add getStrategicInsight function for StrategicInsight component.
export const getStrategicInsight = async (): Promise<string> => {
  const prompt = "Generate a single, thought-provoking strategic insight related to corporate ESG, sustainability, or the green economy. The insight should be concise and suitable for a business leader. Frame it as a single sentence.";
  try {
    const response = await ai.models.generateContent({ model, contents: prompt });
    return response.text.trim();
  } catch (error) {
    console.error("Error fetching strategic insight:", error);
    return "Integrating ESG metrics into executive compensation is a key driver for accountability.";
  }
};
