<script>
  import { Router, Route } from 'svelte-routing';
  import Login from './routes/Login.svelte';
  import Signup from './routes/Signup.svelte';
  import AdminLanding from './routes/Admin/Landing/Landing.svelte';
  import Customer from './routes/Customer.svelte';
  import DealerLanding from './routes/Dealer/Landing/Landing.svelte';
  import '../styles/global.scss';
</script>

<Router>
  <Route path="/login" component={Login} />
  <Route path="/signup" component={Signup} />
  <Route path="/admin/landing" component={AdminLanding} />
  <Route path="/customer" component={Customer} />
  <Route path="/dealer/landing" component={DealerLanding} />
</Router>
