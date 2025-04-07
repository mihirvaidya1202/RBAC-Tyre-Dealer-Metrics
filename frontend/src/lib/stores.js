import { writable } from 'svelte/store';
import { tyreStockApi } from './api';

export const tyreStocks = writable([]);
export const dealerStockStore = writable([]);

export async function loadTyreStocks(token) {
  try {
    const stocks = await tyreStockApi.fetchTyreStocks(token);
    tyreStocks.set(stocks);
    return { success: true, data: stocks };
  } catch (error) {
    console.error('Error loading tyre stocks:', error);
    throw {
      message: error.response?.message || 'Failed to load tyre stocks',
      code: error.response?.code || 'LOAD_ERROR'
    };
  }
}

export async function addToDealerStock(stock, quantity, token) {  
  try {
    await tyreStockApi.addToDealerStock(stock._id, quantity, token);

    const [updatedDealerStock, updatedAdminStock] = await Promise.all([
      tyreStockApi.getDealerStock(token),
      tyreStockApi.fetchTyreStocks(token)
    ]);

    dealerStockStore.set(updatedDealerStock);
    tyreStocks.set(updatedAdminStock);
    saveDealerStockToLocalStorage();

    return { success: true, data: updatedDealerStock };
  } catch (error) {
    console.error("Error adding stock to dealer:", error);
    throw {
      message: error.response?.message || 'Failed to add stock to dealer',
      code: error.response?.code || 'ADD_ERROR'
    };
  }
}

function saveDealerStockToLocalStorage() {
  const unsubscribe = dealerStockStore.subscribe(stocks => {
    try {
      localStorage.setItem('dealerStock', JSON.stringify(stocks));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  });
  unsubscribe();
}

export function loadDealerStockFromLocalStorage() {
  try {
    const dealerStock = localStorage.getItem('dealerStock');
    if (dealerStock) {
      const parsedStock = JSON.parse(dealerStock);
      dealerStockStore.set(parsedStock);
      return parsedStock;
    }
    return null;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return null;
  }
}