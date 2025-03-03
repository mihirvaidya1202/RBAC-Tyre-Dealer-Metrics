import { writable } from 'svelte/store';
import { tyreStockApi } from './api';

// Store for all tyre stocks
export const tyreStocks = writable([]);

// Store for dealer's purchased stock
export const dealerStockStore = writable([]);

// Function to load tyre stocks
export async function loadTyreStocks() {
  const stocks = await tyreStockApi.fetchTyreStocks();
  tyreStocks.set(stocks);
}

// Function to add purchased stock to the dealer's stock
export function addToDealerStock(stock) {
  dealerStockStore.update((stocks) => {
    const existingStock = stocks.find((s) => s._id === stock._id);
    console.log("EXISTING STOCK>>>>>>", existingStock)

    if (existingStock) {
      // Update quantity if the stock already exists
      existingStock.quantity += stock.quantity;
      return stocks;
    } else {
      // Add new stock to the dealer's stock
      return [...stocks, stock];
    }
  });

  // Save the dealer's stock to localStorage for persistence
  saveDealerStockToLocalStorage();
}

// Function to save dealer's stock to localStorage
function saveDealerStockToLocalStorage() {
  dealerStockStore.subscribe((stocks) => {
    localStorage.setItem('dealerStock', JSON.stringify(stocks));
  });
}

// Function to load dealer's stock from localStorage
export function loadDealerStockFromLocalStorage() {
  const dealerStock = localStorage.getItem('dealerStock');
  if (dealerStock) {
    dealerStockStore.set(JSON.parse(dealerStock));
  }
}