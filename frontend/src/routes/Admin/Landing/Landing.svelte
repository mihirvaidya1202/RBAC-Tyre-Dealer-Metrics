<script>
  import { onMount } from 'svelte';
  import { tyreStocks, loadTyreStocks } from '../../../lib/stores';
  import { tyreStockApi } from '../../../lib/api';

  let tyreModel = '';
  let tyreSize = '';
  let quantity = 0;
  let price = 0;

  onMount(() => {
    loadTyreStocks();
  });

  const handleAddStock = async () => {
    const newStock = { tyreModel, tyreSize, quantity, price };
    try {
      const stock = await tyreStockApi.addTyreStock(newStock);
      await loadTyreStocks();

      tyreModel = '';
      tyreSize = '';
      quantity = 0;
      price = 0;
    } catch (error) {
      console.error('Failed to add tyre stock:', error.message);
    }
  };

  const handleDeleteStock = async (id) => {
    try {
      const response = await tyreStockApi.deleteTyreStock(id);
      console.log('Deleted stock:', response);
      await loadTyreStocks();

    } catch (error) {
      console.error('Failed to delete tyre stock:', error.message);
    }
  };
</script>

<style lang="scss">
  @import './_landing.scss';
</style>

<h1 class="page-title">Admin Dashboard - Tyre Stock Management</h1>

<h2 class="area-title">Add Tyre Stocks</h2>
<form on:submit|preventDefault={handleAddStock}>
  <div class="input-field">
    <span> Tyre Model </span>
    <input type="text" bind:value={tyreModel} placeholder="Tyre Model" required />
  </div>
  <div class="input-field">
    <span> Tyre Size </span>
    <input type="text" bind:value={tyreSize} placeholder="Tyre Size" required />
  </div>
  <div class="input-field">
    <span> Tyre Quantity </span>
    <input type="number" bind:value={quantity} placeholder="Quantity" required />
  </div>
  <div class="input-field">
    <span>Price</span>
    <input type="number" bind:value={price} placeholder="Price" required />
  </div>

  <button type="submit">Add Stock</button>
</form>

{#if $tyreStocks.length}
<h2 class="area-title">Current Tyre Stocks</h2>
<table>
  <thead>
    <tr>
      <th>Tyre Model</th>
      <th>Tyre Size</th>
      <th>Quantity</th>
      <th>Price</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
    {#each $tyreStocks as stock}
      <tr>
        <td>{stock.tyreModel}</td>
        <td>{stock.tyreSize}</td>
        <td>{stock.quantity}</td>
        <td>{stock.price}</td>
        <td>
          <button on:click={() => handleDeleteStock(stock._id)}>Delete</button>
        </td>
      </tr>
    {/each}
  </tbody>
</table>
{/if}