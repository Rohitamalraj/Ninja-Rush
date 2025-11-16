module ninja_rush::token_exchange {
    use one::coin::{Self, Coin};
    use one::object::{Self, UID};
    use one::tx_context::{Self, TxContext};
    use one::transfer;
    use one::balance::{Self, Balance};
    use one::table::{Self, Table};
    use one::oct::OCT;
    use ninja_rush::ninja_token::{Self, NINJA_TOKEN};

    /// Error codes
    const E_NOT_ADMIN: u64 = 1;
    const E_INSUFFICIENT_NINJA: u64 = 2;
    const E_INSUFFICIENT_OCT: u64 = 3;
    const E_MILESTONE_ALREADY_CLAIMED: u64 = 4;
    const E_INVALID_MILESTONE: u64 = 5;

    /// Milestone tiers
    const BRONZE_MILESTONE: u64 = 100;  // 100 NINJA
    const SILVER_MILESTONE: u64 = 300;  // 300 NINJA
    const GOLD_MILESTONE: u64 = 1000;   // 1000 NINJA

    /// OCT rewards (in full tokens, will be multiplied by 10^9 for decimals)
    const BRONZE_REWARD: u64 = 5;    // 5 OCT
    const SILVER_REWARD: u64 = 15;   // 15 OCT
    const GOLD_REWARD: u64 = 50;     // 50 OCT

    /// Exchange treasury holding OCT for rewards
    public struct ExchangeTreasury has key {
        id: UID,
        oct_balance: Balance<OCT>,
        total_exchanged: u64,
        total_ninja_burned: u64,
        admin: address,
        milestone_claims: Table<address, MilestoneClaims>,
    }

    /// Track which milestones a player has claimed
    public struct MilestoneClaims has store {
        bronze_claimed: bool,
        silver_claimed: bool,
        gold_claimed: bool,
    }

    /// Initialize exchange treasury
    fun init(ctx: &mut TxContext) {
        let treasury = ExchangeTreasury {
            id: object::new(ctx),
            oct_balance: balance::zero(),
            total_exchanged: 0,
            total_ninja_burned: 0,
            admin: tx_context::sender(ctx),
            milestone_claims: table::new(ctx),
        };

        transfer::share_object(treasury);
    }

    /// Fund the treasury with OCT (admin only)
    public entry fun fund_treasury(
        treasury: &mut ExchangeTreasury,
        payment: Coin<OCT>,
        ctx: &TxContext
    ) {
        assert!(tx_context::sender(ctx) == treasury.admin, E_NOT_ADMIN);
        let coin_balance = coin::into_balance(payment);
        balance::join(&mut treasury.oct_balance, coin_balance);
    }

    /// Exchange NINJA for OCT at milestone
    /// milestone: 1 = Bronze, 2 = Silver, 3 = Gold
    public entry fun exchange_at_milestone(
        treasury: &mut ExchangeTreasury,
        ninja_state: &mut ninja_token::NinjaTokenState,
        ninja_payment: Coin<NINJA_TOKEN>,
        milestone: u8,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Determine required NINJA and OCT reward
        let (required_ninja, oct_reward) = if (milestone == 1) {
            (BRONZE_MILESTONE * 1000000, BRONZE_REWARD * 1000000000) // Account for decimals
        } else if (milestone == 2) {
            (SILVER_MILESTONE * 1000000, SILVER_REWARD * 1000000000)
        } else if (milestone == 3) {
            (GOLD_MILESTONE * 1000000, GOLD_REWARD * 1000000000)
        } else {
            abort E_INVALID_MILESTONE
        };

        // Check if already claimed
        if (!table::contains(&treasury.milestone_claims, sender)) {
            table::add(&mut treasury.milestone_claims, sender, MilestoneClaims {
                bronze_claimed: false,
                silver_claimed: false,
                gold_claimed: false,
            });
        };

        let claims = table::borrow_mut(&mut treasury.milestone_claims, sender);
        
        if (milestone == 1) {
            assert!(!claims.bronze_claimed, E_MILESTONE_ALREADY_CLAIMED);
            claims.bronze_claimed = true;
        } else if (milestone == 2) {
            assert!(!claims.silver_claimed, E_MILESTONE_ALREADY_CLAIMED);
            claims.silver_claimed = true;
        } else if (milestone == 3) {
            assert!(!claims.gold_claimed, E_MILESTONE_ALREADY_CLAIMED);
            claims.gold_claimed = true;
        };

        // Verify NINJA payment
        assert!(coin::value(&ninja_payment) >= required_ninja, E_INSUFFICIENT_NINJA);

        // Burn NINJA tokens
        let burned = ninja_token::burn_tokens(ninja_state, ninja_payment);
        treasury.total_ninja_burned = treasury.total_ninja_burned + burned;

        // Check treasury has enough OCT
        assert!(balance::value(&treasury.oct_balance) >= oct_reward, E_INSUFFICIENT_OCT);

        // Send OCT to player
        let oct_coin = coin::from_balance(
            balance::split(&mut treasury.oct_balance, oct_reward),
            ctx
        );
        transfer::public_transfer(oct_coin, sender);

        treasury.total_exchanged = treasury.total_exchanged + oct_reward;
    }

    /// Check milestone status for a player
    public fun get_milestone_status(
        treasury: &ExchangeTreasury,
        player: address
    ): (bool, bool, bool) {
        if (table::contains(&treasury.milestone_claims, player)) {
            let claims = table::borrow(&treasury.milestone_claims, player);
            (claims.bronze_claimed, claims.silver_claimed, claims.gold_claimed)
        } else {
            (false, false, false)
        }
    }

    /// Get treasury stats
    public fun get_treasury_stats(treasury: &ExchangeTreasury): (u64, u64, u64) {
        (
            balance::value(&treasury.oct_balance),
            treasury.total_exchanged,
            treasury.total_ninja_burned
        )
    }

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx);
    }
}
