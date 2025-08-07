import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import AdblockerPlugin from "puppeteer-extra-plugin-adblocker";
import { Browser, DEFAULT_INTERCEPT_RESOLUTION_PRIORITY } from "puppeteer";
import { Server } from "proxy-chain";
import { mainLogger } from '../core/logger';
import { AIAgentService } from '../services/ai/agent';

puppeteer.use(StealthPlugin());
puppeteer.use(
    AdblockerPlugin({
        interceptResolutionPriority: DEFAULT_INTERCEPT_RESOLUTION_PRIORITY,
    })
);

export class InstagramClient {
    private browser: Browser | null = null;
    private page: any = null;
    private proxyServer: Server | null = null;
    private aiAgent: AIAgentService;
    private credentials: { username: string; password: string };

    constructor(credentials: { username: string; password: string }, aiAgent: AIAgentService) {
        this.credentials = credentials;
        this.aiAgent = aiAgent;
    }

    async initialize(): Promise<void> {
        try {
            this.proxyServer = new Server({ port: 8000 });
            await this.proxyServer.listen();
            
            const proxyUrl = `http://localhost:8000`;
            this.browser = await puppeteer.launch({
                headless: true,
                args: [`--proxy-server=${proxyUrl}`, '--no-sandbox', '--disable-setuid-sandbox'],
            });

            this.page = await this.browser.newPage();
            await this.loginToInstagram();
        } catch (error) {
            mainLogger.error('Failed to initialize Instagram client:', error);
            throw error;
        }
    }

    private async loginToInstagram(): Promise<void> {
        try {
            const cookiesPath = "./cache/instagram/automation_cookies.json";
            
            const cookiesExist = await this.checkCookiesExist(cookiesPath);
            if (cookiesExist) {
                const cookies = await this.loadCookies(cookiesPath);
                await this.page.setCookie(...cookies);
                
                await this.page.goto("https://www.instagram.com/", { waitUntil: 'networkidle2' });
                
                const isLoggedIn = await this.page.$("a[href='/direct/inbox/']");
                if (isLoggedIn) {
                    mainLogger.info("Login verified with cookies.");
                    return;
                }
            }

            await this.loginWithCredentials();
        } catch (error) {
            mainLogger.error("Error during Instagram login:", error);
            throw error;
        }
    }

    private async loginWithCredentials(): Promise<void> {
        try {
            await this.page.goto("https://www.instagram.com/accounts/login/");
            await this.page.waitForSelector('input[name="username"]', { timeout: 10000 });

            await this.page.type('input[name="username"]', this.credentials.username);
            await this.page.type('input[name="password"]', this.credentials.password);
            await this.page.click('button[type="submit"]');

            await this.page.waitForNavigation({ timeout: 15000 });

            const cookies = await this.browser!.cookies();
            await this.saveCookies("./cache/instagram/automation_cookies.json", cookies);
            
            mainLogger.info("Successfully logged in to Instagram");
        } catch (error) {
            mainLogger.error("Error logging in with credentials:", error);
            throw error;
        }
    }

    async interactWithPosts(): Promise<void> {
        let postIndex = 1;
        const maxPosts = 10;

        while (postIndex <= maxPosts) {
            try {
                const postSelector = `article:nth-of-type(${postIndex})`;

                if (!(await this.page.$(postSelector))) {
                    mainLogger.info("No more posts found. Ending iteration...");
                    return;
                }

                await this.likePost(postSelector, postIndex);
                await this.commentOnPost(postSelector, postIndex);

                const waitTime = Math.floor(Math.random() * 5000) + 5000;
                await this.delay(waitTime);

                await this.page.evaluate(() => {
                    window.scrollBy(0, window.innerHeight);
                });

                postIndex++;
            } catch (error) {
                mainLogger.error(`Error interacting with post ${postIndex}:`, error);
                break;
            }
        }
    }

    private async likePost(postSelector: string, postIndex: number): Promise<void> {
        try {
            const likeButtonSelector = `${postSelector} svg[aria-label="Like"]`;
            const likeButton = await this.page.$(likeButtonSelector);
            
            if (likeButton) {
                const ariaLabel = await likeButton.evaluate((el: Element) =>
                    el.getAttribute("aria-label")
                );

                if (ariaLabel === "Like") {
                    await likeButton.click();
                    await this.page.keyboard.press("Enter");
                    mainLogger.info(`Post ${postIndex} liked.`);
                }
            }
        } catch (error) {
            mainLogger.error(`Error liking post ${postIndex}:`, error);
        }
    }

    private async commentOnPost(postSelector: string, postIndex: number): Promise<void> {
        try {
            const captionSelector = `${postSelector} div.x9f619 span._ap3a div span._ap3a`;
            const captionElement = await this.page.$(captionSelector);

            let caption = "";
            if (captionElement) {
                caption = await captionElement.evaluate((el: HTMLElement) => el.innerText);
            }

            const commentBoxSelector = `${postSelector} textarea`;
            const commentBox = await this.page.$(commentBoxSelector);
            
            if (commentBox && caption) {
                const prompt = `Craft a thoughtful, engaging, and mature reply to the following post: "${caption}". Ensure the reply is relevant, insightful, and adds value to the conversation.`;
                
                const schema = this.aiAgent.getInstagramCommentSchema();
                const result = await this.aiAgent.runAgent(schema, prompt);
                
                if (result && result[0]?.comment) {
                    const comment = result[0].comment;
                    await commentBox.type(comment);

                    const postButton = await this.page.evaluateHandle(() => {
                        const buttons = Array.from(document.querySelectorAll('div[role="button"]'));
                        return buttons.find(button => button.textContent === 'Post' && !button.hasAttribute('disabled'));
                    });

                    if (postButton) {
                        await postButton.click();
                        mainLogger.info(`Comment posted on post ${postIndex}.`);
                    }
                }
            }
        } catch (error) {
            mainLogger.error(`Error commenting on post ${postIndex}:`, error);
        }
    }

    private async checkCookiesExist(cookiesPath: string): Promise<boolean> {
        try {
            const fs = await import('fs');
            return fs.existsSync(cookiesPath);
        } catch {
            return false;
        }
    }

    private async loadCookies(cookiesPath: string): Promise<any[]> {
        const fs = await import('fs');
        const data = fs.readFileSync(cookiesPath, 'utf8');
        return JSON.parse(data);
    }

    private async saveCookies(cookiesPath: string, cookies: any[]): Promise<void> {
        const fs = await import('fs');
        const path = await import('path');
        
        const dir = path.dirname(cookiesPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(cookiesPath, JSON.stringify(cookies));
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async shutdown(): Promise<void> {
        try {
            if (this.page) {
                await this.page.close();
                this.page = null;
            }
            
            if (this.browser) {
                await this.browser.close();
                this.browser = null;
            }
            
            if (this.proxyServer) {
                await this.proxyServer.close();
                this.proxyServer = null;
            }
        } catch (error) {
            mainLogger.error('Error during Instagram client shutdown:', error);
        }
    }
}
