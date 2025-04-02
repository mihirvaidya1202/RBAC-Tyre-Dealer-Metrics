<script lang="ts">
    import { onMount, tick } from 'svelte';

    let isLoggedIn = false;

    export let navbarItems: Array<{ label: string; url: string }> = [];
    export let landingPage: string = '/login'
    export let showLoginButton = true;

  
    onMount(() => {
      const token = localStorage.getItem('token');

      isLoggedIn = !!token;
    });
  
    const handleLogout = async () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    isLoggedIn = false;
    
    await tick();
    
    window.location.href = '/login';
  };
</script>

<nav class="navbar">
  <div class="navbar-brand">
    <a href={landingPage} class="navbar-logo">Your App Logo</a>
  </div>

  <div class="navbar-links">
    {#each navbarItems as navbarItem}
      <a href={navbarItem.url} class="navbar-link">{navbarItem.label}</a>
    {/each}

    {#if showLoginButton}
      {#if isLoggedIn }
        <button on:click={handleLogout} class="navbar-button">Log Out</button>
      {:else}
        <a href="/login" class="navbar-link">Login</a>
      {/if}
    {/if}
  </div>
</nav>
  
<style lang="scss">
  @use './_navbar.scss' as *;
</style>