<script>
    import { onMount } from "svelte";
    import { tyresApi } from "../../../lib/api";
    import Navbar from '../../../components/Navbar/Navbar.svelte';

    let tyres = [];
    let filteredTyres = [];
    let searchQuery = "";
    let tyreRefs = {};
    let showDropdown = false;
    let loading = true;
    let errorMessage = "";

    const navbarItems = [
        {
            label: 'Dashboard',
            url: '#'
        },
        {
            label: 'Purchase History',
            url: '/customer/purchase-history'
        },
    ];

    const landingPage = '/customer/landing';

    async function fetchTyres() {
        try {
            const data = await tyresApi.getAllTyres();
            tyres = data;
            filteredTyres = [...data];
        } catch (err) {
            console.error("Error fetching tyres:", err);
            errorMessage = "Failed to load tyres.";
        }
        loading = false;
    }

    function updateSearchResults(event) {
        searchQuery = event.target.value;
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
        window.location.href = `/customer/${encodeURIComponent(tyre.tyreModel)}/${encodeURIComponent(tyre.tyreSize)}`;
    }

    onMount(async () => {
        await fetchTyres();
    });
</script>

<div class="landing-page">
    <Navbar {navbarItems} {landingPage} />

    <div class="page-content">
        <h1>Find Your Tyre</h1>

        <div class="search-container">
            <input
                type="text"
                bind:value={searchQuery}
                placeholder="Search tyres by model or size..."
                on:input={updateSearchResults}
                on:focus={() => showDropdown = true}
                on:keydown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button class="search-btn" on:click={handleSearch}>
                Search
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
                            >
                                {tyre.tyreModel} ({tyre.tyreSize})
                            </button>
                        </li>
                    {/each}
                </ul>
            {/if}
        </div>

        {#if loading}
            <p>Loading tyres...</p>
        {:else if errorMessage}
            <p style="color: red;">⚠️ {errorMessage}</p>
        {:else if filteredTyres.length === 0}
            <p>No matching tyres found.</p>
        {:else}
            <div class="tyre-list">
                {#each filteredTyres as filteredTyre (filteredTyre.tyreModel + '-' + filteredTyre.tyreSize)}
                    {@const key = `${filteredTyre.tyreModel}-${filteredTyre.tyreSize}`}
                    <div
                        class="tyre-card"
                        on:click={() => goToTyrePage(filteredTyre)}
                        on:keydown={(e) => e.key === "Enter" && goToTyrePage(filteredTyre)}
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
    </div>
</div>

<style lang="scss">
    @use './_landing.scss' as *;
</style>