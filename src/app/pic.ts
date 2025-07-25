import { SogniClient } from '@sogni-ai/sogni-client';
import { env } from 'process';

const USERNAME = process.env.SOGNI_USERNAME || 'operator';
const PASSWORD = process.env.SOGNI_PASSWORD || env.PASSWORD;

function generateStory(word1: string, word2: string, word3: string): string {
    const storyTemplates: string[] = [
        `A magical ${word1} discovers a hidden ${word2} that transforms into a beautiful ${word3}`,
        `In a mystical forest, a ${word1} meets a wise ${word2} who teaches them about the power of ${word3}`,
        `A brave ${word1} embarks on a quest to find the legendary ${word2} and restore peace to the ${word3}`,
        `Deep in an enchanted castle, a ${word1} unlocks the secrets of an ancient ${word2} to save the ${word3}`,
        `A curious ${word1} stumbles upon a magical ${word2} that holds the key to understanding ${word3}`
    ];
    
    const randomTemplate = storyTemplates[Math.floor(Math.random() * storyTemplates.length)];
    return randomTemplate;
}

export async function generateImages(word1: string, word2: string, word3: string): Promise<string[]> {
    try {
        const client = await SogniClient.createInstance({
            appId: `${USERNAME}-image-generator`,
            network: 'fast'
        });
        
        await client.account.login(USERNAME, PASSWORD);
        
        await client.projects.waitForModels();
        const mostPopularModel = client.projects.availableModels.reduce((a, b) =>
            a.workerCount > b.workerCount ? a : b
        );
        
        const story = generateStory(word1, word2, word3);
        
        const project = await client.projects.create({
            modelId: mostPopularModel.id,
            positivePrompt: story,
            negativePrompt: 'malformation, bad anatomy, bad hands, missing fingers, cropped, low quality, bad quality, jpeg artifacts, watermark',
            stylePrompt: 'fantasy art, detailed, beautiful',
            steps: 20,
            guidance: 7.5,
            numberOfImages: 4
        });
        
        const imageUrls: string[] = await project.waitForCompletion();
        return imageUrls;
        
    } catch (error: any) {
        throw new Error(`Image generation failed: ${error.message}`);
    }
}