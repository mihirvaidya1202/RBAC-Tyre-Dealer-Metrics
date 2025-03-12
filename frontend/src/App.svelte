<script>
  import { Router, Route } from 'svelte-routing';
  import Login from './routes/Login.svelte';
  import Signup from './routes/Signup.svelte';
  import AdminLanding from './routes/Admin/Landing/Landing.svelte';
  import AdminAnalytics from './routes/Admin/Analytics/Analytics.svelte';
  import CustomerLanding from './routes/Customer/Landing/Landing.svelte';
  import DealerLanding from './routes/Dealer/Landing/Landing.svelte';
  import '../styles/global.scss';
</script>

<Router>
  <Route path="/login" component={Login} />
  <Route path="/signup" component={Signup} />
  <Route path="/admin/landing" component={AdminLanding} />
  <Route path="/admin/analytics" component={AdminAnalytics} />  
  <Route path="/customer/landing" component={CustomerLanding} />
  <Route path="/dealer/landing" component={DealerLanding} />
</Router>
