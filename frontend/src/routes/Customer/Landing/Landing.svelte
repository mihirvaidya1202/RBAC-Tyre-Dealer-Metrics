<script>
    import { onMount } from "svelte";
    import { navigate } from 'svelte-routing';
    import { tyresApi } from "../../../lib/api";
    import Navbar from '../../../components/Navbar/Navbar.svelte';
    import ErrorTemplate from '../../../components/Templates/ErrorTemplate/ErrorTemplate.svelte';

    let tyres = [];
    let filteredTyres = [];
    let searchQuery = "";
    let tyreRefs = {};
    let showDropdown = false;
    let isLoading = false;
    let error = { message: null, code: null };

    const navbarItems = [
        { label: 'Dashboard', url: '#' },
        { label: 'Purchase History', url: '/customer/purchase-history' },
    ];

    const landingPage = '/customer/landing';

    function debugToken() {
        console.group('Token Debugging');
        const token = localStorage.getItem('token');
        
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
            } catch (e) {
                console.error('Token parsing error:', e);
            }
        }
        console.groupEnd();
    }

    const handleApiError = (err) => {
        console.group('API Error Handling');
        console.error('Raw error:', err);
        
        if (err.response) {            
            error = {
                message: err.response.data?.message || 'API request failed',
                code: err.response.data?.code || 'API_ERROR'
            };
            
            if (err.response.status === 401 || err.response.status === 403) {
                error.message = err.response.data?.message || 'Session expired. Please login again.';
                localStorage.removeItem('token');
                navigate('/login');
            }
        } else {
            error = {
                message: err.message || 'An unexpected error occurred',
                code: 'NETWORK_ERROR'
            };
        }
        console.groupEnd();
    };

    async function fetchTyres() {
        console.group('Fetching Tyres');
        const token = localStorage.getItem('token');
        
        if (!token) {
            error = {
                message: 'You must be logged in to access this page',
                code: 'UNAUTHORIZED'
            };
            navigate('/login');
            console.groupEnd();
            return;
        }

        try {
            isLoading = true;
            error = { message: null, code: null };

            const data = await tyresApi.getAllTyres(token);
            
            if (!data) {
                console.warn('Empty response from API');
                throw new Error('No data received from server');
            }

            tyres = data;
            filteredTyres = [...data];
        } catch (err) {
            console.error('Error in fetchTyres:', err);
            handleApiError(err);
        } finally {
            isLoading = false;
            console.groupEnd();
        }
    }

    function updateSearchResults(event) {
        searchQuery = event.target.value;
        const query = searchQuery.toLowerCase().trim();

        filteredTyres = tyres.filter(tyre => {
            const searchWords = query.split(/\s+/);
            const modelWords = tyre.tyreModel.toLowerCase().split(/\s+/);
            return searchWords.every(word => 
                modelWords.some(modelWord => modelWord.includes(word))
            );
        });

        showDropdown = filteredTyres.length > 0;
    }

    function handleSearch() {
        if (!searchQuery.trim()) {
            filteredTyres = [...tyres];
            showDropdown = false;
            return;
        }

        const query = searchQuery.toLowerCase();
        const sizeMatch = query.match(/\((\d+)\)/);
        const searchSize = sizeMatch ? sizeMatch[1] : null;
        const searchModel = query.replace(/\(\d+\)/g, '').trim();

        filteredTyres = tyres.filter(tyre => {
            const modelMatch = tyre.tyreModel.toLowerCase().includes(searchModel);
            const sizeMatch = searchSize 
                ? tyre.tyreSize.toLowerCase().includes(searchSize)
                : true;
            return modelMatch && sizeMatch;
        });
    }

    function scrollToTyre(tyre) {
        searchQuery = `${tyre.tyreModel} (${tyre.tyreSize})`;
        showDropdown = false;

        const key = `${tyre.tyreModel}-${tyre.tyreSize}`;
        const el = tyreRefs[key];

        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }

    function goToTyrePage(tyre) {
        navigate(`/customer/${encodeURIComponent(tyre.tyreModel)}/${encodeURIComponent(tyre.tyreSize)}`);
    }

    onMount(async () => {
        debugToken();
        await fetchTyres();
    });
</script>

{#if !error.message}
    <Navbar {navbarItems} {landingPage} />
{/if}

<div class="landing-page">
    <div class="page-content">
        {#if error.message}
            <ErrorTemplate {...error} />
        {:else}
            <h1 class="page-title">Dealer list</h1>
            
            <div class="search-container">
                <h2>Find Your Tyre</h2>

                <div class="search-block">
                    <input
                        type="text"
                        bind:value={searchQuery}
                        placeholder="Search tyres by model or size..."
                        on:input={updateSearchResults}
                        on:focus={() => showDropdown = true}
                        on:keydown={(e) => e.key === 'Enter' && handleSearch()}
                        disabled={isLoading}
                    />
                    <button 
                        class="search-btn" 
                        on:click={handleSearch}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Searching...' : 'Search'}
                    </button>
    
                    {#if showDropdown && filteredTyres.length > 0}
                        <ul class="dropdown">
                            {#each filteredTyres as tyre}
                                <li>
                                    <button
                                        type="button"
                                        class="dropdown-item"
                                        on:click={() => scrollToTyre(tyre)}
                                        on:keydown={(e) => e.key === "Enter" && scrollToTyre(tyre)}
                                        disabled={isLoading}
                                    >
                                        {tyre.tyreModel} ({tyre.tyreSize})
                                    </button>
                                </li>
                            {/each}
                        </ul>
                    {/if}
                </div>
            </div>
    
            {#if isLoading}
                <div class="loading-indicator">
                    <p>Loading tyres...</p>
                </div>
            {:else if filteredTyres.length === 0}
                <p class="error">No matching tyres found.</p>
            {:else}
                <div class="tyre-list">
                    {#each filteredTyres as filteredTyre (filteredTyre.tyreModel + '-' + filteredTyre.tyreSize)}
                        {@const key = `${filteredTyre.tyreModel}-${filteredTyre.tyreSize}`}
                        <div
                            class="tyre-card"
                            on:click={() => !isLoading && goToTyrePage(filteredTyre)}
                            on:keydown={(e) => !isLoading && e.key === "Enter" && goToTyrePage(filteredTyre)}
                            bind:this={tyreRefs[key]}
                            role="button"
                            tabindex="0"
                        >
                            <h2>{filteredTyre.tyreModel}</h2>
                            <p>Size: {filteredTyre.tyreSize} inches</p>
                            <p>Price: ${filteredTyre.price}</p>
                        </div>
                    {/each}
                </div>
            {/if}

        {/if}
    </div>
</div>

<style lang="scss">
    @use './_landing.scss' as *;
</style>