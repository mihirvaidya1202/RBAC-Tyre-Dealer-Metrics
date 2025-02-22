<script>
  import { authApi } from '../lib/api.js';
  import { navigate } from 'svelte-routing';

  let username = '';
  let password = '';
  let role = 'customer';
  let error = '';

  const handleSignup = async () => {
    try {
      const data = await authApi.register(username, password, role);
      console.log('Signup successful:', data);
      navigate('/login');
    } catch (err) {
      error = err.message;
    }
  };
</script>

<form on:submit|preventDefault={handleSignup}>
  <input type="text" bind:value={username} placeholder="Username" />
  <input type="password" bind:value={password} placeholder="Password" />
  <select bind:value={role}>
    <option value="customer">Customer</option>
    <option value="dealer">Dealer</option>
    <option value="admin">Admin</option>
  </select>
  <button type="submit">Signup</button>
  {#if error}<p class="error">{error}</p>{/if}
</form>

<style>
  .error {
    color: red;
  }
</style>