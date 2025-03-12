<script>
    import { onMount } from "svelte";
    import { tyresApi } from "../../../lib/api";

    let tyres = [];
    let searchQuery = "";
    let filteredTyres = [];
    let tyreRefs = [];
    let loading = true;
    let errorMessage = "";
    let showDropdown = false;

    async function fetchTyres() {
        try {
            const data = await tyresApi.getAllTyres();
            tyres = data.map(t => ({
                ...t,
                dealerCount: t.dealerStock ? t.dealerStock.length : 0
            }));
            filteredTyres = [...tyres];
        } catch (err) {
            console.error("Error fetching tyres:", err);
            errorMessage = "Failed to load tyres.";
        }
        loading = false;
    }

    $: {
        const query = searchQuery.toLowerCase();
        filteredTyres = tyres.filter(t => {
            const modelMatch = t.tyreModel.toLowerCase().includes(query);
            const sizeMatch = t.tyreSize.toLowerCase().includes(query);
            return modelMatch || sizeMatch || `${t.tyreModel} ${t.tyreSize}`.toLowerCase().includes(query);
        });

        showDropdown = searchQuery.length > 0 && filteredTyres.length > 0;
    }

    function scrollToTyre(index) {
        searchQuery = `${filteredTyres[index].tyreModel} (${filteredTyres[index].tyreSize})`;
        showDropdown = false;

        if (tyreRefs[index]) {
            tyreRefs[index].scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }

    function goToTyrePage(tyre) {
        window.location.href = `/customer/${encodeURIComponent(tyre.tyreModel)}/${encodeURIComponent(tyre.tyreSize)}`;
    }

    onMount(fetchTyres);
</script>

<div class="landing-page">
    <h1>Find Your Tyre</h1>

    <input
        type="text"
        bind:value={searchQuery}
        placeholder="Search tyres..."
        on:focus={() => showDropdown = true}
    />

    {#if showDropdown}
        <ul class="dropdown">
            {#each filteredTyres as tyre, index}
                <li on:click={() => scrollToTyre(index)}>
                    {tyre.tyreModel} ({tyre.tyreSize}) - {tyre.dealerCount} Dealers
                </li>
            {/each}
        </ul>
    {/if}

    {#if loading}
        <p>Loading tyres...</p>
    {:else if errorMessage}
        <p style="color: red;">⚠️ {errorMessage}</p>
    {:else if filteredTyres.length === 0}
        <p>No tyres found.</p>
    {:else}
        <div class="tyre-list">
            {#each filteredTyres as tyre, index}
                <div
                    bind:this={tyreRefs[index]}
                    class="tyre-card"
                    on:click={() => goToTyrePage(tyre)}
                >
                    <h2>{tyre.tyreModel}</h2>
                    <p>Size: {tyre.tyreSize}</p>
                    <p>Price: ${tyre.price}</p>
                    <p>Dealers Available: {tyre.dealerCount}</p>
                </div>
            {/each}
        </div>
    {/if}
</div>

<style>
    .landing-page { text-align: center; padding: 20px; }
    input { width: 80%; padding: 10px; margin-bottom: 10px; font-size: 16px; }
    .dropdown {
        position: absolute; width: 80%; background: white; border: 1px solid #ddd;
        list-style: none; padding: 0; max-height: 200px; overflow-y: auto; z-index: 10;
    }
    .dropdown li { padding: 10px; cursor: pointer; }
    .dropdown li:hover { background: #eee; }
    .tyre-list { display: flex; flex-wrap: wrap; justify-content: center; gap: 15px; margin-top: 20px; }
    .tyre-card {
        width: 200px; padding: 15px; border: 1px solid #ddd;
        cursor: pointer; transition: 0.2s; background: #f9f9f9;
    }
    .tyre-card:hover { background: #eaeaea; }
</style>
