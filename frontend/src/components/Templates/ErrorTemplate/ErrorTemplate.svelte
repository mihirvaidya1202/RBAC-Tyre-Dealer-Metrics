<script lang="ts">
    import { navigate } from 'svelte-routing';

    export let code: string = null
    export let message: string = null
</script>

<div class="error-container">
    <div class="error-template">
        <div class="error-notification {code}">
            {#if code === 'FORBIDDEN'}
                <h2 class="error-title">Access Denied</h2>
                <p class="error-message">{message}</p>
                <button on:click={() => navigate('/login')}>Go to Login</button>
            {:else if code === 'NOT_FOUND'}
                <h2 class="error-title">Not Found</h2>
                <p class="error-message">{message}</p>
            {:else}
                <h2 class="error-title">Error</h2>
                <p class="error-message">{message}</p>
                {#if code !== 'UNAUTHORIZED'}
                    <button on:click={() => navigate('/login')}>Go to Login</button>
                {/if}
            {/if}
        </div>
    </div>    
</div>

<style lang="scss">
    @use './_errorTemplate.scss' as *;
</style>