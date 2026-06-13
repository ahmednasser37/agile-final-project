import type { } from '../core/model/types';

export async function mockAIPropose(promptStr: string): Promise<any> {
    console.log("MOCK AI CALL", promptStr);
    return {
        ratePerCrewDay: 20000, // 20 units
        crew: [{trade: 'Plumber', count: 1}],
        confidence: 90,
        basis: "Mocked from logic bank"
    };
}
