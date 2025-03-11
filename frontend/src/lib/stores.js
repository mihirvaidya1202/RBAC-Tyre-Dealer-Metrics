import { writable } from 'svelte/store';
import { tyreStockApi } from './api';

export const tyreStocks = writable([]);

export const dealerStockStore = writable([]);

export async function loadTyreStocks(token) {
    try {
      const stocks = await tyreStockApi.fetchTyreStocks(token);
      tyreStocks.set(stocks);
    } catch (error) {
      console.error('Error loading tyre stocks:', error.message);
      throw new Error('Failed to load tyre stocks. Please try again later.');
    }
}

export async function addToDealerStock(stock, quantity, token) {  
  try {
      await tyreStockApi.addToDealerStock(stock._id, quantity, token);

      const updatedDealerStock = await tyreStockApi.getDealerStock(token);
      dealerStockStore.set(updatedDealerStock);

      const updatedAdminStock = await tyreStockApi.fetchTyreStocks(token);
      tyreStocks.set(updatedAdminStock);

      saveDealerStockToLocalStorage();

  } catch (error) {
      console.error("Error adding stock to dealer:", error);
      throw new Error("Failed to add stock.");
  }
}

export function removeFromDealerStock(id) {
  dealerStockStore.update((stocks) => {
    const updatedStocks = stocks.filter((stock) => stock._id !== id);
    return updatedStocks;
  });

  saveDealerStockToLocalStorage();
}

function saveDealerStockToLocalStorage() {
  dealerStockStore.subscribe((stocks) => {
    localStorage.setItem('dealerStock', JSON.stringify(stocks));
  });
}

export function loadDealerStockFromLocalStorage() {
  const dealerStock = localStorage.getItem('dealerStock');
  if (dealerStock) {
    dealerStockStore.set(JSON.parse(dealerStock));
  }
}