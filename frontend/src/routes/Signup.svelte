<script>
  import { authApi } from '../lib/api.js';
  import { navigate } from 'svelte-routing';

  let email = '';
  let username = '';
  let password = '';
  let role = 'customer';
  let error = '';
  let isSubmitting = false;

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

  <button type="submit" disabled={isSubmitting}>
    {isSubmitting ? "Signing Up..." : "Signup"}
  </button>

  {#if error}<p class="error">{error}</p>{/if}
</form>

<style>
  .error {
    color: red;
  }
</style>
