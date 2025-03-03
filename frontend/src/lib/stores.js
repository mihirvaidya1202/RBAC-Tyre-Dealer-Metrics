import { writable } from 'svelte/store';
import { tyreStockApi } from './api';

export const tyreStocks = writable([]);

export async function loadTyreStocks() {
    const stocks = await tyreStockApi.fetchTyreStocks();
    tyreStocks.set(stocks);
}