module ninja_rush::ninja_token {
    use std::signer;
    use aptos_framework::coin::{Self, Coin, BurnCapability, FreezeCapability, MintCapability};
    use aptos_framework::account;
    use std::string;

    /// Error codes
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_ALREADY_INITIALIZED: u64 = 2;
    const E_NOT_INITIALIZED: u64 = 3;

    /// NINJA token coin type
    struct NinjaCoin has key {}

    /// Capabilities holder for admin
    struct Capabilities has key {
        mint_cap: MintCapability<NinjaCoin>,
        burn_cap: BurnCapability<NinjaCoin>,
        freeze_cap: FreezeCapability<NinjaCoin>,
    }

    /// Player's NINJA token balance and stats
    struct PlayerStats has key {
        total_earned: u64,
        total_exchanged: u64,
        games_played: u64,
    }

    /// Initialize the NINJA token
    /// Can only be called once by the module deployer
    public entry fun initialize(admin: &signer) {
        assert!(!exists<Capabilities>(signer::address_of(admin)), E_ALREADY_INITIALIZED);

        let (burn_cap, freeze_cap, mint_cap) = coin::initialize<NinjaCoin>(
            admin,
            string::utf8(b"Ninja Token"),
            string::utf8(b"NINJA"),
            6, // decimals
            true, // monitor supply
        );

        move_to(admin, Capabilities {
            mint_cap,
            burn_cap,
            freeze_cap,
        });

        // Register the admin account to receive NINJA tokens
        coin::register<NinjaCoin>(admin);
    }

    /// Award NINJA tokens to player after game
    /// Called by backend/oracle after score verification
    public entry fun award_tokens(
        admin: &signer,
        player_addr: address,
        amount: u64
    ) acquires Capabilities, PlayerStats {
        let admin_addr = signer::address_of(admin);
        assert!(exists<Capabilities>(admin_addr), E_NOT_INITIALIZED);

        // Mint tokens
        let caps = borrow_global<Capabilities>(admin_addr);
        let coins = coin::mint(amount, &caps.mint_cap);

        // Register player if not already registered
        if (!coin::is_account_registered<NinjaCoin>(player_addr)) {
            // Note: In production, player should register themselves
            // This is simplified for hackathon demo
            coin::register<NinjaCoin>(admin);
        };

        // Deposit to player
        coin::deposit(player_addr, coins);

        // Update player stats
        if (!exists<PlayerStats>(player_addr)) {
            move_to(admin, PlayerStats {
                total_earned: amount,
                total_exchanged: 0,
                games_played: 1,
            });
        } else {
            let stats = borrow_global_mut<PlayerStats>(player_addr);
            stats.total_earned = stats.total_earned + amount;
            stats.games_played = stats.games_played + 1;
        };
    }

    /// Register player to receive NINJA tokens
    public entry fun register_player(player: &signer) {
        coin::register<NinjaCoin>(player);
        
        let player_addr = signer::address_of(player);
        if (!exists<PlayerStats>(player_addr)) {
            move_to(player, PlayerStats {
                total_earned: 0,
                total_exchanged: 0,
                games_played: 0,
            });
        };
    }

    /// Burn NINJA tokens (used during exchange to OCT)
    /// Called by exchange module
    public fun burn_tokens(admin: &signer, coins: Coin<NinjaCoin>) acquires Capabilities {
        let admin_addr = signer::address_of(admin);
        assert!(exists<Capabilities>(admin_addr), E_NOT_AUTHORIZED);

        let caps = borrow_global<Capabilities>(admin_addr);
        coin::burn(coins, &caps.burn_cap);
    }

    /// Get player's NINJA token balance
    #[view]
    public fun get_balance(player_addr: address): u64 {
        if (coin::is_account_registered<NinjaCoin>(player_addr)) {
            coin::balance<NinjaCoin>(player_addr)
        } else {
            0
        }
    }

    /// Get player stats
    #[view]
    public fun get_player_stats(player_addr: address): (u64, u64, u64) acquires PlayerStats {
        if (exists<PlayerStats>(player_addr)) {
            let stats = borrow_global<PlayerStats>(player_addr);
            (stats.total_earned, stats.total_exchanged, stats.games_played)
        } else {
            (0, 0, 0)
        }
    }

    #[test_only]
    public fun initialize_for_test(admin: &signer) {
        initialize(admin);
    }
}
