/**
 * @fileOverview This file defines the Genkit flow for the reverse hash lookup feature.
 * It includes the Zod schemas for input and output, and the flow logic that calls the external API.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const ReverseHashLookupInputSchema = z.object({
    hash: z.string().describe('The hash to look up.'),
    email: z.string().email().describe('The email for the API.'),
    code: z.string().describe('The API code.'),
    hashType: z.string().describe('The type of hash (e.g., md5, sha256).'),
});

export type ReverseHashLookupInput = z.infer<typeof ReverseHashLookupInputSchema>;

export const ReverseHashLookupOutputSchema = z.string().describe('The result from the hash lookup.');

export type ReverseHashLookupOutput = z.infer<typeof ReverseHashLookupOutputSchema>;

async function doLookup(input: ReverseHashLookupInput): Promise<ReverseHashLookupOutput> {
    const url = `https://md5decrypt.net/Api/api.php?hash=${input.hash}&hash_type=${input.hashType}&email=${input.email}&code=${input.code}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            return "Error: Network response was not ok.";
        }
        const text = await response.text();
        if (text.startsWith("ERROR")) {
            const [, errorMessage] = text.split(' : ');
            if (errorMessage === "HASH NOT FOUND") {
                return "Hash not found in the database.";
            }
            return `An API error occurred: ${errorMessage}`;
        }
        return text;
    } catch (error: any) {
        console.error("Failed to fetch reverse hash lookup:", error);
        return `Error: ${error.message || "An unknown error occurred"}`;
    }
}

export const reverseHashLookupFlow = ai.defineFlow(
    {
        name: 'reverseHashLookupFlow',
        inputSchema: ReverseHashLookupInputSchema,
        outputSchema: ReverseHashLookupOutputSchema,
    },
    async (input) => {
        return await doLookup(input);
    }
);
