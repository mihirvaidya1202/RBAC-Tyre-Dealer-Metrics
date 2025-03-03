<script>
    import { Router, Route } from 'svelte-routing';
    import Landing from './Landing/Landing.svelte';
  
    console.log('Admin.svelte loaded');
  </script>
  
  <Router>
    <Route path="/admin/landing" component={Landing} />
  </Router>