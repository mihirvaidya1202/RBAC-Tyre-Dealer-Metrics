<script>
  import { authApi } from '../../lib/api';
  import { navigate } from 'svelte-routing';
  import { onMount } from 'svelte';
  import Navbar from '../../components/Navbar/Navbar.svelte';

  let email = '';
  let username = '';
  let password = '';
  let role = 'customer';
  let error = '';
  let isSubmitting = false;

  const landingPage = '/login'

  const handleSignup = async () => {
    error = '';
    isSubmitting = true;

    try {
      const userData = { 
        email: email.trim(), 
        username: username.trim(), 
        password, 
        role: role.toLowerCase()
      };

      const response = await authApi.register(userData);
      navigate('/login');
    } catch (err) {
      error = err.message || "Registration failed. Please try again.";
      console.error("Signup error:", err);
    } finally {
      isSubmitting = false;
    }
  };

  onMount(() => {
    if (localStorage.getItem('token')) {
      localStorage.removeItem('token');
    }
  })
</script>

<div class="signup-page">
  <Navbar {landingPage} />

  <div class="signup-container">
    <span class="logo-container">
      Your App logo
    </span>

    <form on:submit|preventDefault={handleSignup}>
      <div class="form-item">
        <span> Email </span>
        <input type="email" bind:value={email} placeholder="Email" required />
      </div>

      <div class="form-item">
        <span> Username </span>
        <input type="text" bind:value={username} placeholder="Username" required />  
      </div>

      <div class="form-item">
        <span> Password </span>
        <input type="password" bind:value={password} placeholder="Password" required />
      </div>

      <div class="form-item">
        <span> Role </span>
        <select bind:value={role}>
          <option value="customer">Customer</option>
          <option value="dealer">Dealer</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div class="button-list">
        <button type="submit">
          {isSubmitting ? "Signing Up..." : "Signup"}
        </button>
      </div>
  
      {#if error}<p class="error">{error}</p>{/if}
    </form>
  </div>
</div>

<style lang="scss">
  @use './_signup.scss' as *;
</style>