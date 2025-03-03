<script>
  import { authApi } from '../lib/api.js';
  import { navigate } from 'svelte-routing';

  let username = '';
  let password = '';
  let error = '';

  const handleLogin = async () => {
    try {
      const data = await authApi.login(username, password);
      localStorage.setItem('token', data.token);
      if (data.role === 'admin') {
        navigate('/admin/landing');
      } else if (data.role === 'customer') {
        navigate('/customer');
      } else if (data.role === 'dealer') {
        navigate('/dealer/landing');
      }
    } catch (err) {
      error = err.message;
    }
  };
</script>

<form on:submit|preventDefault={handleLogin}>
  <input type="text" bind:value={username} placeholder="Username" />
  <input type="password" bind:value={password} placeholder="Password" />
  <button type="submit">Login</button>
  {#if error}<p class="error">{error}</p>{/if}
</form>

<style>
  .error {
    color: red;
  }
</style>