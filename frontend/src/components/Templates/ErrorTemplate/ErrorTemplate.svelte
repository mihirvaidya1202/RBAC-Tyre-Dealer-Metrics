<script lang="ts">
    export let error: string = 'Not Found'
</script>

<nav class="error-template">
    <h1>{error}</h1>
</nav>
  
<style lang="scss">
    @use './_errorTemplate.scss' as *;
</style>