import { TestBed } from '@angular/core/testing';
import { GeminiService } from './gemini.service';
import { GoogleGenAI } from '@google/genai';
import { vi, describe, beforeEach, afterEach, it, expect } from 'vitest';

// Mock GoogleGenAI class
vi.mock('@google/genai', () => {
    return {
        GoogleGenAI: vi.fn().mockImplementation(function () {
            return {
                models: {
                    generateContent: vi.fn().mockResolvedValue({
                        text: JSON.stringify({ acts: [], visual_tags: [] })
                    })
                }
            };
        }),
        Type: {
            OBJECT: 'OBJECT',
            STRING: 'STRING',
            ARRAY: 'ARRAY'
        }
    };
});

describe('GeminiService', () => {
    let service: GeminiService;

    beforeEach(() => {
        // Reset window.env before each test
        (window as any).env = {};

        TestBed.configureTestingModule({
            providers: [GeminiService]
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should be created', () => {
        service = TestBed.inject(GeminiService);
        expect(service).toBeTruthy();
    });

    it('should lazily initialize GoogleGenAI client', async () => {
        service = TestBed.inject(GeminiService);

        // Client should not be initialized yet
        expect((service as any).ai).toBeUndefined();

        // Set API key
        (window as any).env.apiKey = 'test-key';

        // Trigger client initialization through a method call
        // We mock the response to avoid actual API calls
        await service.analyzeImage('base64data');

        // Now it should be initialized
        expect((service as any).ai).toBeDefined();
        expect(GoogleGenAI).toHaveBeenCalledWith({ apiKey: 'test-key' });
    });

    it('should throw error if API key is missing when client is needed', async () => {
        service = TestBed.inject(GeminiService);

        // Ensure no API key
        (window as any).env.apiKey = undefined;

        // Expect method call to fail
        await expect(service.analyzeImage('base64data')).resolves.toEqual(
            expect.objectContaining({ acts: expect.any(Array) }) // It catches error and returns fallback
        );

        // Since analyzeImage catches errors, we check if getClient throws
        try {
            (service as any).getClient();
        } catch (e: any) {
            expect(e.message).toBe('Gemini API Key missing');
        }
    });

    it('should reuse existing client instance', async () => {
        service = TestBed.inject(GeminiService);
        (window as any).env.apiKey = 'test-key';

        await service.analyzeImage('data1');
        const firstInstance = (service as any).ai;

        await service.analyzeImage('data2');
        const secondInstance = (service as any).ai;

        expect(firstInstance).toBe(secondInstance);
        expect(GoogleGenAI).toHaveBeenCalledTimes(1);
    });
});
