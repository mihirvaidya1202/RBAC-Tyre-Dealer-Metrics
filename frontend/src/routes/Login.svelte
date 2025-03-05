<script>
  import { authApi } from '../lib/api.js';
  import { navigate } from 'svelte-routing';

  let username = '';
  let password = '';
  let error = '';

  const handleLogin = async () => {
    try {
      const credentials = { username, password };
      const response = await authApi.login(credentials);

      const role = response.role.toLowerCase();

      localStorage.setItem('token', response.token);

      if (role === 'admin') {
        navigate('/admin/landing');
      } else if (role === 'customer') {
        navigate('/customer');
      } else if (role === 'dealer') {
        navigate('/dealer/landing');
      }
    } catch (err) {
      error = err.message;
    }
  };
</script>

<form on:submit|preventDefault={handleLogin}>
  <input type="text" bind:value={username} placeholder="Username" required />
  <input type="password" bind:value={password} placeholder="Password" required />
  <button type="submit">Login</button>
  {#if error}<p class="error">{error}</p>{/if}
</form>

<style>
  .error {
    color: red;
  }
</style>