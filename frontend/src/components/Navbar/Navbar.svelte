<script lang="ts">
    import { onMount } from 'svelte';

    let isLoggedIn = false;

    export let navbarItems: Array<{ label: string; url: string }> = [];
    export let landingPage: string = '#'
  
    onMount(() => {
      const token = localStorage.getItem('token');
      isLoggedIn = !!token;
    });
  
    const handleLogout = () => {
      localStorage.removeItem('authToken');
      isLoggedIn = false;
      window.location.href = '/login';
    };
  </script>
  
  <nav class="navbar">
    <div class="navbar-brand">
      <a href={landingPage} class="navbar-logo">Your App</a>
    </div>
  
    <div class="navbar-links">
      {#each navbarItems as navbarItem}
        <a href={navbarItem.url} class="navbar-link">{navbarItem.label}</a>
      {/each}
  
      {#if isLoggedIn}
        <button on:click={handleLogout} class="navbar-button">Log Out</button>
      {:else}
        <a href="/login" class="navbar-link">Login</a>
      {/if}
    </div>
  </nav>
  
  <style>
    /* Same styles as before */
    .navbar {
      font-size: 1.6rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      background-color: #27509b;
      color: white;
    }
  
    .navbar-brand {
      font-size: 1.5rem;
      font-weight: bold;
    }
  
    .navbar-logo {
      color: white;
      text-decoration: none;
    }
  
    .navbar-links {
      display: flex;
      gap: 1.5rem;
      align-items: center;
    }
  
    .navbar-link {
      color: white;
      text-decoration: none;
      transition: opacity 0.2s;
    }
  
    .navbar-link:hover {
      opacity: 0.8;
    }
  
    .navbar-button {
      background: #f44336;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
    }
  
    .navbar-button:hover {
      background-color: #d32f2f;
    }
  </style>