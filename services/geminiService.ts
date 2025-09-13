import { GoogleGenAI, Type } from "@google/genai";
// FIX: Added missing types to the import.
import type { EsgPlaybookCategory, ResourceItem, Initiative, SustainabilityData, AssessmentScores, Challenge, LibraryCategory, LibraryItem, SustainabilityTrend } from '../types';

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
    return JSON.parse(jsonString) as ResourceItem[];
  } catch (error) {
    console.error(`Error fetching ESG playbook content for ${category}:`, error);
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
        return JSON.parse(jsonString) as Initiative[];
    } catch (error) {
        console.error("Error fetching ESG initiatives:", error);
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
        return JSON.parse(jsonString) as SustainabilityTrend[];
    } catch (error) {
        console.error("Error fetching sustainability trends:", error);
        return [];
    }
};

// FIX: Added missing function getDailyRecommendation for Recommendations component.
export const getDailyRecommendation = async (): Promise<string> => {
    const prompt = "Generate a short, actionable, and inspiring eco-friendly tip for the day. It should be a single sentence and easy for anyone to implement.";
    try {
        const response = await ai.models.generateContent({ model, contents: prompt });
        return response.text;
    } catch (error) {
        console.error("Error fetching daily recommendation:", error);
        return "Could not fetch a tip. Try reducing single-use plastics today!";
    }
};

// FIX: Added missing function getLibraryContent for Library component.
const librarySchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
          description: "A short, engaging title for the item.",
        },
        description: {
          type: Type.STRING,
          description: "A detailed description or instructions, 2-3 paragraphs long.",
        },
      },
      required: ["title", "description"],
    },
};

export const getLibraryContent = async (category: LibraryCategory): Promise<LibraryItem[]> => {
    let prompt = '';
    switch (category) {
        case 'Tips':
            prompt = "Generate 4 actionable tips for sustainable living. For each tip, provide a title and a detailed description explaining its impact and how to implement it.";
            break;
        case 'Recipes':
            prompt = "Generate 4 simple, eco-friendly (e.g., plant-based, low-waste) recipes. For each recipe, provide a title and a detailed description including ingredients and steps.";
            break;
        case 'DIY Projects':
            prompt = "Generate 4 easy DIY projects for upcycling common household items. For each project, provide a title and a detailed description of the materials needed and the steps to complete it.";
            break;
    }

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: librarySchema,
            },
        });
        const jsonString = response.text;
        return JSON.parse(jsonString) as LibraryItem[];
    } catch (error) {
        console.error(`Error fetching library content for ${category}:`, error);
        return [];
    }
};

// FIX: Added missing function getWeeklyChallenges for Challenges component.
const weeklyChallengesSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
          description: "The name of the weekly challenge.",
        },
        description: {
          type: Type.STRING,
          description: "A short, motivational explanation of the challenge.",
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

export const getWeeklyChallenges = async (): Promise<Challenge[]> => {
    try {
        const response = await ai.models.generateContent({
            model,
            contents: "Generate 3 unique and engaging weekly eco-challenges. Each challenge should have a title, a short description, and a difficulty level ('Easy', 'Medium', or 'Hard').",
            config: {
                responseMimeType: "application/json",
                responseSchema: weeklyChallengesSchema,
            },
        });
        const jsonString = response.text;
        return JSON.parse(jsonString) as Challenge[];
    } catch (error) {
        console.error("Error fetching weekly challenges:", error);
        return [];
    }
};

// FIX: Added missing function getStrategicInsight for StrategicInsight component.
export const getStrategicInsight = async (): Promise<string> => {
    const prompt = `Generate a concise, high-level strategic insight related to ESG (Environmental, Social, and Governance) for a business leader. The insight should be a single, thought-provoking sentence that could inspire a new initiative or shift in perspective. Focus on topics like sustainable innovation, supply chain resilience, stakeholder engagement, or long-term value creation.`;
    try {
        const response = await ai.models.generateContent({ model, contents: prompt });
        return response.text;
    } catch (error) {
        console.error("Error fetching strategic insight:", error);
        return "Could not fetch an insight. Focus on integrating ESG data into core business strategy to unlock long-term value.";
    }
};
