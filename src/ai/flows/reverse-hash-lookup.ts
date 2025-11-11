'use server';

/**
 * @fileOverview This is the server-side entry point for the reverse hash lookup feature.
 * It exports a single async function `reverseHashLookup` that can be called from client components.
 */

import { reverseHashLookupFlow, type ReverseHashLookupInput, type ReverseHashLookupOutput } from './reverse-hash-lookup-flow';

export async function reverseHashLookup(input: ReverseHashLookupInput): Promise<ReverseHashLookupOutput> {
    return await reverseHashLookupFlow(input);
}
