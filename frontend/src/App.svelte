<script>
  import { Router, Route } from 'svelte-routing';
  import Login from './routes/Login.svelte';
  import Signup from './routes/Signup.svelte';
  import AdminLanding from './routes/Admin/Landing/Landing.svelte';
  import AdminAnalytics from './routes/Admin/Analytics/Analytics.svelte';
  import CustomerLanding from './routes/Customer/Landing/Landing.svelte';
  import TyreDetails from "./routes/Customer/TyreDetails/TyreDetails.svelte";
  import OrderDetails from "./routes/Customer/OrderDetails/OrderDetails.svelte"
  import DealerLanding from './routes/Dealer/Landing/Landing.svelte';
  import DealerAnalytics from './routes/Dealer/Analytics/Analytics.svelte'
  import '../styles/global.scss';
</script>

<Router>
  <Route path="/login" component={Login} />
  <Route path="/signup" component={Signup} />
  <Route path="/admin/landing" component={AdminLanding} />
  <Route path="/admin/analytics" component={AdminAnalytics} />
  <Route path="/customer/landing" component={CustomerLanding} />
  <Route path="/customer/:tyreModel/:tyreSize" component={TyreDetails} />
  <Route path="/customer/purchase-history" component={OrderDetails} />
  <Route path="/dealer/landing" component={DealerLanding} />
  <Route path="/dealer/analytics" component={DealerAnalytics} />
</Router>
