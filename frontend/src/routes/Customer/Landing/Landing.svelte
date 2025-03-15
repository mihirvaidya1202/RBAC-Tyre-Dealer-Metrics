<script>
    import { onMount } from "svelte";
    import { tyresApi } from "../../../lib/api";

    let tyres = [];
    let filteredTyres = [];
    let searchQuery = "";
    let tyreRefs = {};
    let showDropdown = false;
    let loading = true;
    let errorMessage = "";

    async function fetchTyres() {
        try {
            const data = await tyresApi.getAllTyres();

            if (data && Array.isArray(data)) {
                tyres = data.filter(t => t.dealerId && t.dealerId.dealerStock.length > 0);
                filteredTyres = [...tyres];
            } else {
                errorMessage = "Invalid data received.";
                console.error("Invalid data:", data);
            }
        } catch (err) {
            console.error("Error fetching tyres:", err);
            errorMessage = "Failed to load tyres.";
        }
        loading = false;
    }

    function updateSearchResults(event) {
        searchQuery = event.target.value.toLowerCase();
        filteredTyres = tyres.filter(tyre =>
            tyre.tyreModel.toLowerCase().includes(searchQuery) ||
            tyre.tyreSize.toLowerCase().includes(searchQuery)
        );
        showDropdown = filteredTyres.length > 0;
    }

    function scrollToTyre(tyre) {
        searchQuery = `${tyre.tyreModel} (${tyre.tyreSize})`;
        showDropdown = false;

        const key = `${tyre.tyreModel}-${tyre.tyreSize}`;
        const el = tyreRefs[key];

        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
        } else {
            console.warn("Tyre ref not found:", key);
        }
    }

    function goToTyrePage(tyre) {
        window.location.href = `/customer/${encodeURIComponent(tyre.tyreModel)}/${encodeURIComponent(tyre.tyreSize)}`;
    }

    onMount(async () => {
        await fetchTyres();
    });
</script>

<style>
    /* Your existing styles */
</style>

<div class="landing-page">
    <h1>Find Your Tyre</h1>

    <div class="search-container">
        <input
            type="text"
            bind:value={searchQuery}
            placeholder="Search tyres by model or size..."
            on:input={updateSearchResults}
            on:focus={() => showDropdown = true}
        />
        <button class="search-btn">🔍</button>

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
    {:else if tyres.length === 0}
        <p>No tyres available from dealers.</p>
    {:else}
        <div class="tyre-list">
            {#each tyres as tyre (tyre.tyreModel + '-' + tyre.tyreSize)}
                {@const key = `${tyre.tyreModel}-${tyre.tyreSize}`}
                <div
                    class="tyre-card"
                    on:click={() => goToTyrePage(tyre)}
                    on:keydown={(e) => e.key === "Enter" && goToTyrePage(tyre)}
                    bind:this={tyreRefs[key]}
                    role="button"
                    tabindex="0"
                >
                    <h2>{tyre.tyreModel}</h2>
                    <p>Size: {tyre.tyreSize}</p>
                    <p>Price: ${tyre.price}</p>
                    <p>Stock: {tyre.dealerId.dealerStock.reduce((sum, d) => sum + d.quantity, 0)}</p>
                </div>
            {/each}
        </div>
    {/if}
</div>