<script>
  import { authApi } from '../lib/api.js';
  import { navigate } from 'svelte-routing';

  let email = '';
  let username = '';
  let password = '';
  let role = 'customer';
  let error = '';

  const handleSignup = async () => {
    try {
      const data = await authApi.register(email, username, password, role);
      console.log('Signup successful:', data);
      navigate('/login');
    } catch (err) {
      error = err.message;
    }
  };
</script>

<form on:submit|preventDefault={handleSignup}>
  <input type="email" bind:value={email} placeholder="Email" required />
  <input type="text" bind:value={username} placeholder="Username" required />
  <input type="password" bind:value={password} placeholder="Password" required />
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