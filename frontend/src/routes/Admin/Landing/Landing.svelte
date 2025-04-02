<script>
  import { onMount } from 'svelte';
  import { tyreStocks, loadTyreStocks } from '../../../lib/stores';
  import { tyreStockApi } from '../../../lib/api';
  import Navbar from '../../../components/Navbar/Navbar.svelte';
  import ErrorTemplate from '../../../components/Templates/ErrorTemplate/ErrorTemplate.svelte';

  let tyreModel = '';
  let tyreSize = 0;
  let quantity = 0;
  let price = 0;
  let error = null;

  const navbarItems = [
      {
          label: 'Analytics',
          url: '/admin/analytics'
      }
  ]
  
  const landingPage = '/admin/landing'

  onMount(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        error = 'You must be logged in to view tyre stocks.';
        return;
      }
      await loadTyreStocks(token);
    } catch (err) {
      error = err.message;
    }
  });

  const handleAddStock = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    error = 'You must be logged in to add stock.';
    return;
  }

  if (!tyreModel || !tyreSize || quantity <= 0 || price <= 0) {
    error = 'Please fill in all fields with valid values.';
    return;
  }

  const newStock = { tyreModel, tyreSize, quantity, price };

  try {
    const stock = await tyreStockApi.addTyreStock(newStock, token);

    await loadTyreStocks(token);

    tyreModel = '';
    tyreSize = 0;
    quantity = 0;
    price = 0;
    error = null;
  } catch (err) {
    error = err.message || 'Failed to add tyre stock. Please try again.';
    console.error('Failed to add tyre stock:', err);
  }
};

  const handleDeleteStock = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      error = 'You must be logged in to delete stock.';
      return;
    }

    try {
      await tyreStockApi.deleteTyreStock(id, token);
      await loadTyreStocks(token);
      error = null;
    } catch (err) {
      error = err.message;
      console.error('Failed to delete tyre stock:', err);
    }
  };
</script>

{#if error}
  <ErrorTemplate {error} />
{:else}
  <div class="landing-page">
    <Navbar {navbarItems} {landingPage} />

    <div class="page-content">
      <h1 class="page-title">Admin Dashboard - Tyre Stock Management</h1>

      <div class="add-tyre-container">
        <h2>Add Tyre Stocks</h2>
        <form on:submit|preventDefault={handleAddStock}>
          <div class="input-field">
            <span>Tyre Model</span>
            <input type="text" bind:value={tyreModel} placeholder="Tyre Model" required />
          </div>
          <div class="input-field">
            <span>Tyre Size</span>
            <select bind:value={tyreSize} required>
                <option value="" disabled selected>Select Tyre Size</option>
                <option value="13">13</option>
                <option value="15">15</option>
                <option value="17">17</option>
            </select>
          </div>
          <div class="input-field">
            <span>Tyre Quantity</span>
            <input type="number" bind:value={quantity} placeholder="Quantity" required />
          </div>
          <div class="input-field">
            <span>Price</span>
            <input type="number" bind:value={price} placeholder="Price" required />
          </div>
    
          <button type="submit">Add Stock</button>
        </form>
      </div>
    
      <div class="view-stock-container">
        {#if $tyreStocks.length}
          <h2>Current Tyre Stocks</h2>
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
                  <td>${stock.price}</td>
                  <td>
                    <button on:click={() => handleDeleteStock(stock._id)}>Delete</button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  @use './_landing.scss' as *;
</style>