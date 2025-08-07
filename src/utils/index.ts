import { mainLogger } from '../core/logger';
import fs from 'fs';

export async function handleError(error: any, currentApiKeyIndex: number, schema: any, prompt: string, runAgentFunction: Function): Promise<void> {
    if (error.message?.includes('quota') || error.message?.includes('limit')) {
        const nextIndex = (currentApiKeyIndex + 1) % 10;
        mainLogger.warn(`Switching to API key ${nextIndex + 1}`);
        
        if (nextIndex === 0) {
            mainLogger.error("All API keys exhausted");
            return;
        }
        
        return runAgentFunction(schema, prompt);
    }
    throw error;
}

export async function Instagram_cookiesExist(): Promise<boolean> {
    try {
        return fs.existsSync("./cache/instagram/automation_cookies.json");
    } catch {
        return false;
    }
}

export async function loadCookies(cookiesPath: string): Promise<any[]> {
    const data = fs.readFileSync(cookiesPath, 'utf8');
    return JSON.parse(data);
}

export async function saveCookies(cookiesPath: string, cookies: any[]): Promise<void> {
    const path = await import('path');
    
    const dir = path.dirname(cookiesPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(cookiesPath, JSON.stringify(cookies));
}

export function setup_HandleError(error: unknown, context: string): void {
    mainLogger.error(`${context}:`, error);
}
