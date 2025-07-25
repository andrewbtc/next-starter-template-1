import express, { Request, Response } from 'express';
import { generateImages } from './pic';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

interface GenerateImagesRequest {
    word1: string;
    word2: string;
    word3: string;
}

interface GenerateImagesResponse {
    success: boolean;
    words: {
        word1: string;
        word2: string;
        word3: string;
    };
    imageUrls: string[];
}

interface ErrorResponse {
    error: string;
    message?: string;
}

app.post('/generate-images', async (req: Request<object, GenerateImagesResponse | ErrorResponse, GenerateImagesRequest>, res: Response<GenerateImagesResponse | ErrorResponse>) => {
    try {
        const { word1, word2, word3 } = req.body;
        
        if (!word1 || !word2 || !word3) {
            return res.status(400).json({
                error: 'Missing required parameters. Please provide word1, word2, and word3.'
            });
        }
        
        if (word1.split(' ').length > 1 || word2.split(' ').length > 1 || word3.split(' ').length > 1) {
            return res.status(400).json({
                error: 'Each parameter must be a single word only.'
            });
        }
        
        const imageUrls = await generateImages(word1, word2, word3);
        
        res.json({
            success: true,
            words: { word1, word2, word3 },
            imageUrls: imageUrls
        });
        
    } catch (error: unknown) {
        console.error('Error generating images:', error);
        let message = 'Unknown error';
        if (error instanceof Error) {
            message = error.message;
        }
        res.status(500).json({
            error: 'Failed to generate images',
            message: error.message
        });
    }
});

app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'OK', message: 'Image generation API is running' });
});

app.listen(PORT, () => {
    console.log(`🚀 Image generation API server running on port ${PORT}`);
    console.log(`POST /generate-images - Generate images from 3 words`);
    console.log(`GET /health - Health check`);
});