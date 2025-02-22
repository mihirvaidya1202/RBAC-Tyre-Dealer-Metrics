<script>
    import { Router, Route } from 'svelte-routing';
    import Login from './routes/Login.svelte';
    import Signup from './routes/Signup.svelte';
    import Admin from './routes/Admin.svelte';
    import Customer from './routes/Customer.svelte';
    import Dealer from './routes/Dealer.svelte';
  </script>
  
  <Router>
    <Route path="/login" component={Login} />
    <Route path="/signup" component={Signup} />
    <Route path="/admin" component={Admin} />
    <Route path="/customer" component={Customer} />
    <Route path="/dealer" component={Dealer} />
  </Router>