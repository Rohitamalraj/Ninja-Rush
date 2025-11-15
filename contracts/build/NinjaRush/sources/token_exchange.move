module ninja_rush::token_exchange {
    use std::signer;
    use aptos_framework::coin::{Self, Coin};
    use aptos_framework::aptos_coin::AptosCoin;
    use ninja_rush::ninja_token::{Self, NinjaCoin};
    use aptos_framework::timestamp;

    /// Error codes
    const E_NOT_INITIALIZED: u64 = 1;
    const E_INSUFFICIENT_BALANCE: u64 = 2;
    const E_MILESTONE_NOT_REACHED: u64 = 3;
    const E_MILESTONE_ALREADY_CLAIMED: u64 = 4;
    const E_INSUFFICIENT_TREASURY: u64 = 5;
    const E_NOT_AUTHORIZED: u64 = 6;

    /// Milestone tiers
    const MILESTONE_BRONZE: u64 = 100_000000; // 100 NINJA (6 decimals)
    const MILESTONE_SILVER: u64 = 300_000000; // 300 NINJA
    const MILESTONE_GOLD: u64 = 1000_000000; // 1000 NINJA

    /// OCT rewards for each milestone
    const REWARD_BRONZE: u64 = 5_00000000; // 5 OCT (8 decimals for AptosCoin)
    const REWARD_SILVER: u64 = 15_00000000; // 15 OCT
    const REWARD_GOLD: u64 = 50_00000000; // 50 OCT

    /// Treasury holding OCT rewards
    struct Treasury has key {
        oct_coins: Coin<AptosCoin>,
        total_distributed: u64,
        admin: address,
    }

    /// Player milestone tracking
    struct MilestoneTracker has key {
        bronze_claimed: bool,
        silver_claimed: bool,
        gold_claimed: bool,
        total_ninja_exchanged: u64,
        last_exchange_time: u64,
    }

    /// Exchange statistics
    struct ExchangeStats has key {
        total_exchanges: u64,
        total_ninja_burned: u64,
        total_oct_distributed: u64,
        unique_players: u64,
    }

    /// Initialize exchange system
    public entry fun initialize(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        assert!(!exists<Treasury>(admin_addr), E_NOT_INITIALIZED);

        // Create empty treasury
        move_to(admin, Treasury {
            oct_coins: coin::zero<AptosCoin>(),
            total_distributed: 0,
            admin: admin_addr,
        });

        // Initialize stats
        move_to(admin, ExchangeStats {
            total_exchanges: 0,
            total_ninja_burned: 0,
            total_oct_distributed: 0,
            unique_players: 0,
        });
    }

    /// Fund treasury with OCT tokens
    public entry fun fund_treasury(admin: &signer, amount: u64) acquires Treasury {
        let admin_addr = signer::address_of(admin);
        assert!(exists<Treasury>(admin_addr), E_NOT_INITIALIZED);

        let treasury = borrow_global_mut<Treasury>(admin_addr);
        assert!(treasury.admin == admin_addr, E_NOT_AUTHORIZED);

        let coins = coin::withdraw<AptosCoin>(admin, amount);
        coin::merge(&mut treasury.oct_coins, coins);
    }

    /// Exchange NINJA for OCT at milestone
    public entry fun exchange_at_milestone(
        player: &signer,
        treasury_addr: address,
        milestone: u8, // 1 = Bronze, 2 = Silver, 3 = Gold
    ) acquires Treasury, MilestoneTracker, ExchangeStats {
        let player_addr = signer::address_of(player);
        
        // Initialize tracker if needed
        if (!exists<MilestoneTracker>(player_addr)) {
            move_to(player, MilestoneTracker {
                bronze_claimed: false,
                silver_claimed: false,
                gold_claimed: false,
                total_ninja_exchanged: 0,
                last_exchange_time: 0,
            });
        };

        let tracker = borrow_global_mut<MilestoneTracker>(player_addr);
        let ninja_balance = ninja_token::get_balance(player_addr);

        // Determine milestone requirements
        let (required_ninja, oct_reward, already_claimed) = if (milestone == 1) {
            (MILESTONE_BRONZE, REWARD_BRONZE, tracker.bronze_claimed)
        } else if (milestone == 2) {
            (MILESTONE_SILVER, REWARD_SILVER, tracker.silver_claimed)
        } else if (milestone == 3) {
            (MILESTONE_GOLD, REWARD_GOLD, tracker.gold_claimed)
        } else {
            abort E_MILESTONE_NOT_REACHED
        };

        // Validate exchange
        assert!(!already_claimed, E_MILESTONE_ALREADY_CLAIMED);
        assert!(ninja_balance >= required_ninja, E_INSUFFICIENT_BALANCE);

        // Get treasury
        let treasury = borrow_global_mut<Treasury>(treasury_addr);
        assert!(coin::value(&treasury.oct_coins) >= oct_reward, E_INSUFFICIENT_TREASURY);

        // Withdraw NINJA tokens from player
        let ninja_coins = coin::withdraw<NinjaCoin>(player, required_ninja);
        
        // Transfer to treasury admin for burning (simplified for hackathon)
        // In production, implement proper burn capability delegation
        coin::deposit(treasury_addr, ninja_coins);

        // Extract OCT reward from treasury
        let oct_reward_coins = coin::extract(&mut treasury.oct_coins, oct_reward);
        coin::deposit(player_addr, oct_reward_coins);

        // Update tracker
        if (milestone == 1) {
            tracker.bronze_claimed = true;
        } else if (milestone == 2) {
            tracker.silver_claimed = true;
        } else {
            tracker.gold_claimed = true;
        };
        tracker.total_ninja_exchanged = tracker.total_ninja_exchanged + required_ninja;
        tracker.last_exchange_time = timestamp::now_seconds();

        // Update treasury stats
        treasury.total_distributed = treasury.total_distributed + oct_reward;

        // Update exchange stats
        let stats = borrow_global_mut<ExchangeStats>(treasury_addr);
        stats.total_exchanges = stats.total_exchanges + 1;
        stats.total_ninja_burned = stats.total_ninja_burned + required_ninja;
        stats.total_oct_distributed = stats.total_oct_distributed + oct_reward;
    }

    /// Get player's milestone status
    #[view]
    public fun get_milestone_status(player_addr: address): (bool, bool, bool, u64) acquires MilestoneTracker {
        if (exists<MilestoneTracker>(player_addr)) {
            let tracker = borrow_global<MilestoneTracker>(player_addr);
            (
                tracker.bronze_claimed,
                tracker.silver_claimed,
                tracker.gold_claimed,
                tracker.total_ninja_exchanged
            )
        } else {
            (false, false, false, 0)
        }
    }

    /// Get next available milestone for player
    #[view]
    public fun get_next_milestone(player_addr: address): (u8, u64, u64) acquires MilestoneTracker {
        let ninja_balance = ninja_token::get_balance(player_addr);
        
        if (!exists<MilestoneTracker>(player_addr)) {
            return (1, MILESTONE_BRONZE, REWARD_BRONZE)
        };

        let tracker = borrow_global<MilestoneTracker>(player_addr);

        if (!tracker.bronze_claimed && ninja_balance >= MILESTONE_BRONZE) {
            (1, MILESTONE_BRONZE, REWARD_BRONZE)
        } else if (!tracker.silver_claimed && ninja_balance >= MILESTONE_SILVER) {
            (2, MILESTONE_SILVER, REWARD_SILVER)
        } else if (!tracker.gold_claimed && ninja_balance >= MILESTONE_GOLD) {
            (3, MILESTONE_GOLD, REWARD_GOLD)
        } else if (!tracker.bronze_claimed) {
            (1, MILESTONE_BRONZE, REWARD_BRONZE)
        } else if (!tracker.silver_claimed) {
            (2, MILESTONE_SILVER, REWARD_SILVER)
        } else {
            (3, MILESTONE_GOLD, REWARD_GOLD)
        }
    }

    /// Get treasury balance
    #[view]
    public fun get_treasury_balance(treasury_addr: address): u64 acquires Treasury {
        if (exists<Treasury>(treasury_addr)) {
            let treasury = borrow_global<Treasury>(treasury_addr);
            coin::value(&treasury.oct_coins)
        } else {
            0
        }
    }

    /// Get exchange statistics
    #[view]
    public fun get_exchange_stats(treasury_addr: address): (u64, u64, u64) acquires ExchangeStats {
        if (exists<ExchangeStats>(treasury_addr)) {
            let stats = borrow_global<ExchangeStats>(treasury_addr);
            (
                stats.total_exchanges,
                stats.total_ninja_burned,
                stats.total_oct_distributed
            )
        } else {
            (0, 0, 0)
        }
    }

    #[test_only]
    public fun initialize_for_test(admin: &signer) {
        initialize(admin);
    }
}
