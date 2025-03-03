<script>
    import { onMount } from 'svelte';
    import { tyreStocks, dealerStockStore, loadTyreStocks, addToDealerStock, loadDealerStockFromLocalStorage } from '../../../lib/stores';
    import { tyreStockApi } from '../../../lib/api';
  
    let error = null;
  
    onMount(async () => {
      try {
        await loadTyreStocks();
        loadDealerStockFromLocalStorage();
      } catch (err) {
        error = err.message;
      }
    });
  
    const handleBuy = async (id, quantity) => {
        try {
            console.log("Buying stock ID:", id, "Quantity:", quantity);

            if (!id || !quantity || isNaN(quantity)) {
            console.error("Invalid stock ID or quantity:", { id, quantity });
            return;
            }

            const updatedStock = await tyreStockApi.buyTyreStock(id, quantity);
            console.log("API Response (updatedStock):", updatedStock);

            const fullStock = $tyreStocks.find(stock => stock._id === id);
            console.log("Found full stock details:", fullStock);

            if (!fullStock) {
            console.error("Stock details not found for ID:", id);
            return;
            }

            const purchasedStock = {
            ...fullStock,
            quantity,
            };

            console.log("Final Purchased Stock:", purchasedStock);

            await loadTyreStocks();

            addToDealerStock(purchasedStock);

            console.log('Purchase successful:', purchasedStock);
        } catch (err) {
            console.error("Error in handleBuy:", err);
            error = err.message;
        }
        };

  </script>
  
  <!-- <style lang="scss">
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 2rem;
  
      th, td {
        padding: 1rem;
        border: 1px solid #ddd;
        text-align: left;
      }
  
      th {
        background-color: #f4f4f4;
      }
  
      input {
        width: 60px;
        padding: 0.5rem;
        margin-right: 0.5rem;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
  
      button {
        padding: 0.5rem 1rem;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
  
        &:hover {
          background-color: #0056b3;
        }
  
        &:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
      }
    }
  
    .error {
      color: red;
      margin-bottom: 1rem;
    }
  </style> -->
  
<h1>Dealer Dashboard</h1>

{#if error}
<p class="error">{error}</p>
{/if}

<h2>Available Tyre Stocks</h2>
<table>
<thead>
    <tr>
    <th>Tyre Model</th>
    <th>Tyre Size</th>
    <th>Quantity</th>
    <th>Price</th>
    <th>Action</th>
    </tr>
</thead>
<tbody>
    {#each $tyreStocks as stock}
    <tr>
        <td>{stock.tyreModel}</td>
        <td>{stock.tyreSize}</td>
        <td>{stock.quantity}</td>
        <td>${stock.price}</td>
        <td>
        <input
            type="number"
            min="1"
            max={stock.quantity}
            bind:value={stock.selectedQuantity}
            placeholder="Qty"
        />
        <button
            on:click={() => handleBuy(stock._id, stock.selectedQuantity)}
            disabled={!stock.selectedQuantity || stock.selectedQuantity > stock.quantity}
        >
            Buy
        </button>
        </td>
    </tr>
    {/each}
</tbody>
</table>

<h2>Your Purchased Tyre Stocks</h2>
<table>
  <thead>
    <tr>
      <th>Tyre Model</th>
      <th>Tyre Size</th>
      <th>Quantity</th>
      <th>Price</th>
    </tr>
  </thead>
  <tbody>
    {#each $dealerStockStore as stock}
      <tr>
        <td>{stock.tyreModel}</td>
        <td>{stock.tyreSize}</td>
        <td>{stock.quantity}</td>
        <td>${stock.price}</td>
      </tr>
    {/each}
  </tbody>
</table>