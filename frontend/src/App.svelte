<script>
  import { Router, Route } from 'svelte-routing';
  import Login from './routes/Login.svelte';
  import Signup from './routes/Signup.svelte';
  import Landing from './routes/Admin/Landing/Landing.svelte';
  import Customer from './routes/Customer.svelte';
  import Dealer from './routes/Dealer.svelte';
  import '../styles/global.scss';
</script>

<Router>
  <Route path="/login" component={Login} />
  <Route path="/signup" component={Signup} />
  <Route path="/admin/landing" component={Landing} />
  <Route path="/customer" component={Customer} />
  <Route path="/dealer" component={Dealer} />
</Router>
