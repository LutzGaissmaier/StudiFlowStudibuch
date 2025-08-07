import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { mainLogger } from '../../core/logger';
import fs from 'fs';
import path from 'path';
import * as readlineSync from 'readline-sync';

export interface InstagramCommentSchema {
    description: string;
    type: SchemaType;
    items: {
        type: SchemaType;
        properties: {
            comment: {
                type: SchemaType;
                description: string;
                nullable: boolean;
            };
            viralRate: {
                type: SchemaType;
                description: string;
                nullable: boolean;
            };
            commentTokenCount: {
                type: SchemaType;
                description: string;
                nullable: boolean;
            };
        };
        required: string[];
    };
}

export class AIAgentService {
    private geminiApiKeys: string[];
    private currentApiKeyIndex: number = 0;
    private isInitialized = false;

    constructor(geminiApiKeys: string[]) {
        this.geminiApiKeys = geminiApiKeys.filter(key => key && key !== 'API_KEY_1');
    }

    async initialize(): Promise<void> {
        try {
            console.log('🤖 Initializing AI Agent Service...');
            
            if (this.geminiApiKeys.length === 0) {
                console.warn('⚠️ No Gemini API keys provided - AI Agent Service will run in mock mode');
            }
            
            this.isInitialized = true;
            console.log('✅ AI Agent Service initialized');
        } catch (error) {
            console.error('❌ Failed to initialize AI Agent Service', error);
            throw error;
        }
    }

    async shutdown(): Promise<void> {
        this.isInitialized = false;
        console.log('🤖 AI Agent Service shutdown');
    }

    async runAgent(schema: InstagramCommentSchema, prompt: string): Promise<any> {
        let geminiApiKey = this.geminiApiKeys[this.currentApiKeyIndex];

        if (!geminiApiKey) {
            mainLogger.error("No Gemini API key available.");
            return "No API key available.";
        }

        const generationConfig = {
            responseMimeType: "application/json",
            responseSchema: schema,
        };

        const googleAI = new GoogleGenerativeAI(geminiApiKey);
        const model = googleAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig,
        });

        try {
            const result = await model.generateContent(prompt);

            if (!result || !result.response) {
                mainLogger.info("No response received from the AI model. || Service Unavailable");
                return "Service unavailable!";
            }

            const responseText = result.response.text();
            const data = JSON.parse(responseText);

            return data;
        } catch (error) {
            mainLogger.error("Error in AI agent:", error);
            await this.handleError(error, schema, prompt);
        }
    }

    private async handleError(error: any, schema: InstagramCommentSchema, prompt: string): Promise<void> {
        if (error.message?.includes('quota') || error.message?.includes('limit')) {
            this.currentApiKeyIndex = (this.currentApiKeyIndex + 1) % this.geminiApiKeys.length;
            mainLogger.warn(`Switching to API key ${this.currentApiKeyIndex + 1}`);
            
            if (this.currentApiKeyIndex === 0) {
                mainLogger.error("All API keys exhausted");
                return;
            }
            
            return this.runAgent(schema, prompt);
        }
        throw error;
    }

    chooseCharacter(): any {
        const charactersDir = (() => {
            const buildPath = path.join(__dirname, "../Agent/characters");
            if (fs.existsSync(buildPath)) {
                return buildPath;
            } else {
                return path.join(process.cwd(), "src", "Agent", "characters");
            }
        })();

        if (!fs.existsSync(charactersDir)) {
            mainLogger.warn("Characters directory not found, creating default character");
            return this.getDefaultCharacter();
        }

        const files = fs.readdirSync(charactersDir);
        const jsonFiles = files.filter(file => file.endsWith(".json"));
        
        if (jsonFiles.length === 0) {
            mainLogger.warn("No character JSON files found, using default character");
            return this.getDefaultCharacter();
        }

        console.log("Select a character:");
        jsonFiles.forEach((file, index) => {
            console.log(`${index + 1}: ${file}`);
        });

        const answer = readlineSync.question("Enter the number of your choice: ");
        const selection = parseInt(answer);
        
        if (isNaN(selection) || selection < 1 || selection > jsonFiles.length) {
            mainLogger.warn("Invalid selection, using default character");
            return this.getDefaultCharacter();
        }

        const chosenFile = path.join(charactersDir, jsonFiles[selection - 1]);
        const data = fs.readFileSync(chosenFile, "utf8");
        const characterConfig = JSON.parse(data);
        
        return characterConfig;
    }

    private getDefaultCharacter(): any {
        return {
            name: "StudiFlow AI Assistant",
            personality: "Educational, helpful, and engaging",
            tone: "Professional yet friendly",
            expertise: ["Education", "Social Media", "Content Creation"]
        };
    }

    getInstagramCommentSchema(): InstagramCommentSchema {
        return {
            description: `Lists comments that are engaging and have the potential to attract more likes and go viral.`,
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    comment: {
                        type: SchemaType.STRING,
                        description: "A comment between 150 and 250 characters.",
                        nullable: false,
                    },
                    viralRate: {
                        type: SchemaType.NUMBER,
                        description: "The viral rate, measured on a scale of 0 to 100.",
                        nullable: false,
                    },
                    commentTokenCount: {
                        type: SchemaType.NUMBER,
                        description: "The total number of tokens in the comment.",
                        nullable: false,
                    },
                },
                required: [
                    "comment",
                    "viralRate",
                    "commentTokenCount"
                ],
            },
        };
    }

    getStatus(): any {
        try {
            console.log('🤖 AI Agent getStatus() called');
            const status = {
                service: 'AI Agent Service',
                initialized: this.isInitialized,
                gemini: {
                    status: this.geminiApiKeys.length > 0 ? 'connected' : 'no-keys',
                    keysAvailable: this.geminiApiKeys.length,
                    currentKeyIndex: this.currentApiKeyIndex,
                    model: 'gemini-2.0-flash'
                },
                features: ['Content Generation', 'Character Selection', 'Instagram Comments'],
                lastActivity: new Date().toISOString()
            };
            console.log('🤖 AI Agent status:', JSON.stringify(status, null, 2));
            return status;
        } catch (error) {
            console.error('🤖 AI Agent getStatus() error:', error);
            throw error;
        }
    }

    async generateContent(prompt: string, type: string = 'instagram', style: string = 'casual'): Promise<any> {
        try {
            console.log('🤖 AI Agent generateContent() called with:', { prompt, type, style });
            
            if (!this.isInitialized) {
                throw new Error('AI Agent Service not initialized');
            }

            if (this.geminiApiKeys.length === 0) {
                console.log('🤖 No Gemini API keys, returning mock content');
                return {
                    content: `Mock ${type} content for: ${prompt}`,
                    style,
                    generated: new Date().toISOString(),
                    mock: true
                };
            }

            const schema = this.getInstagramCommentSchema();
            const enhancedPrompt = `Generate ${type} content in ${style} style: ${prompt}`;
            
            try {
                const result = await this.runAgent(schema, enhancedPrompt);
                console.log('🤖 AI Agent generated content successfully');
                return {
                    content: result,
                    style,
                    generated: new Date().toISOString(),
                    mock: false
                };
            } catch (error) {
                console.error('🤖 Content generation failed:', error);
                return {
                    content: `Fallback ${type} content for: ${prompt}`,
                    style,
                    generated: new Date().toISOString(),
                    mock: true,
                    error: (error as Error).message
                };
            }
        } catch (error) {
            console.error('🤖 AI Agent generateContent() error:', error);
            throw error;
        }
    }

    initAgent(): any {
        try {
            const character = this.chooseCharacter();
            mainLogger.info("Character selected:", character);
            return character;
        } catch (error) {
            mainLogger.error("Error selecting character:", error);
            return this.getDefaultCharacter();
        }
    }
}
