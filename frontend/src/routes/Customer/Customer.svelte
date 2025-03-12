<script>
    import { Router, Route } from 'svelte-routing';
    import Landing from './Landing/Landing.svelte';
</script>

<Router>
    <Route path="/customer/landing" component={Landing} />
</Router>