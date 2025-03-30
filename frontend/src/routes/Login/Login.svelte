<script>
  import { authApi } from '../../lib/api';
  import { navigate } from 'svelte-routing';
  import { onMount } from 'svelte';
  import Navbar from '../../components/Navbar/Navbar.svelte';

  let username = '';
  let password = '';
  let error = '';

  const showLoginButton = false;

  const handleLogin = async () => {
    try {
      const credentials = { username, password };
      const response = await authApi.login(credentials);

      const role = response.role.toLowerCase();

      localStorage.setItem('token', response.token);

      if (role === 'admin') {
        navigate('/admin/landing');
      } else if (role === 'customer') {
        navigate('/customer/landing');
      } else if (role === 'dealer') {
        navigate('/dealer/landing');
      }
    } catch (err) {
      error = err.message;
    }
  };

  const handleSignup = () => {
    navigate('/signup');
  };

  onMount(() => {
    if (localStorage.getItem('token')) {
      localStorage.removeItem('token');
    }
  })
</script>

<div class="login-page">
  <Navbar {showLoginButton} />

  <div class="login-container">
    <span class="logo-container">
      Your App logo
    </span>
  
    <form on:submit|preventDefault={handleLogin}>
      <div class="form-item">
        <span>Username</span>
        <input type="text" bind:value={username} placeholder="Username" required />
      </div>

      <div class="form-item">
        <span div class="form-item">Password</span>
        <input type="password" bind:value={password} placeholder="Password" required />
      </div>
  
      <div class="button-list">
        <button type="submit">Login</button>
        <button type="button" on:click={handleSignup}>Sign Up</button>
      </div>
      {#if error}<p class="error">{error}</p>{/if}
    </form>  
  </div>
</div>

<style lang="scss">
  @use './_login.scss' as *;
</style>