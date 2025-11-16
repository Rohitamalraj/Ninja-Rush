module ninja_rush::ninja_token {
    use one::coin::{Self, Coin, TreasuryCap};
    use one::object::{Self, UID};
    use one::tx_context::{Self, TxContext};
    use one::transfer;
    use one::table::{Self, Table};
    use std::option;

    /// Error codes
    const E_NOT_ADMIN: u64 = 1;
    const E_INVALID_SCORE: u64 = 2;
    const E_INSUFFICIENT_BALANCE: u64 = 3;

    /// NINJA token witness (one-time witness pattern)
    public struct NINJA_TOKEN has drop {}

    /// Global state for NINJA token system
    public struct NinjaTokenState has key {
        id: UID,
        treasury_cap: TreasuryCap<NINJA_TOKEN>,
        player_stats: Table<address, PlayerStats>,
        admin: address,
    }

    /// Player statistics
    public struct PlayerStats has store {
        total_earned: u64,
        games_played: u64,
        last_claim: u64,
    }

    /// Initialize the NINJA token (called once at deployment)
    fun init(witness: NINJA_TOKEN, ctx: &mut TxContext) {
        // Create the NINJA coin
        let (treasury_cap, metadata) = coin::create_currency(
            witness,
            6, // decimals
            b"NINJA",
            b"Ninja Rush Token",
            b"Token earned by playing Ninja Rush game",
            option::none(),
            ctx
        );

        // Freeze metadata so it can't be changed
        transfer::public_freeze_object(metadata);

        // Create global state
        let state = NinjaTokenState {
            id: object::new(ctx),
            treasury_cap,
            player_stats: table::new(ctx),
            admin: tx_context::sender(ctx),
        };

        // Share the state object
        transfer::share_object(state);
    }

    /// Award NINJA tokens based on game score (1 score = 1 NINJA)
    public entry fun award_tokens(
        state: &mut NinjaTokenState,
        player: address,
        score: u64,
        ctx: &mut TxContext
    ) {
        assert!(score > 0, E_INVALID_SCORE);

        // Mint tokens (score * 10^6 to account for 6 decimals)
        let amount = score * 1000000;
        let coins = coin::mint(&mut state.treasury_cap, amount, ctx);
        
        // Transfer to player
        transfer::public_transfer(coins, player);

        // Update or create player stats
        let sender = tx_context::sender(ctx);
        if (table::contains(&state.player_stats, sender)) {
            let stats = table::borrow_mut(&mut state.player_stats, sender);
            stats.total_earned = stats.total_earned + score;
            stats.games_played = stats.games_played + 1;
            stats.last_claim = tx_context::epoch(ctx);
        } else {
            table::add(&mut state.player_stats, sender, PlayerStats {
                total_earned: score,
                games_played: 1,
                last_claim: tx_context::epoch(ctx),
            });
        };
    }

    /// Get player statistics
    public fun get_player_stats(state: &NinjaTokenState, player: address): (u64, u64, u64) {
        if (table::contains(&state.player_stats, player)) {
            let stats = table::borrow(&state.player_stats, player);
            (stats.total_earned, stats.games_played, stats.last_claim)
        } else {
            (0, 0, 0)
        }
    }

    /// Burn tokens (used by exchange contract)
    public fun burn_tokens(
        state: &mut NinjaTokenState,
        coins: Coin<NINJA_TOKEN>,
    ): u64 {
        let amount = coin::value(&coins);
        coin::burn(&mut state.treasury_cap, coins);
        amount
    }

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(NINJA_TOKEN {}, ctx);
    }
}
