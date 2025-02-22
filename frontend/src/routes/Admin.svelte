<script>
    import { onMount } from 'svelte';
    import { userApi } from '../lib/api';
  
    let users = [];
  
    onMount(async () => {
      const response = await userApi.request('/users', 'GET');
      users = response;
    });
  </script>
  
  <h1>Admin Dashboard</h1>
  <ul>
    {#each users as user}
      <li>{user.username} - {user.role}</li>
    {/each}
  </ul>