module ninja_rush::leaderboard {
    use one::object::{Self, UID};
    use one::tx_context::{Self, TxContext};
    use one::transfer;
    use one::table::{Self, Table};
    use std::vector;

    /// Error codes
    const E_NOT_ADMIN: u64 = 1;
    const E_INVALID_SCORE: u64 = 2;
    const E_LEADERBOARD_FULL: u64 = 3;

    /// Maximum entries in leaderboards
    const MAX_GLOBAL_ENTRIES: u64 = 100;
    const MAX_DAILY_ENTRIES: u64 = 50;

    /// Leaderboard entry
    public struct ScoreEntry has store, copy, drop {
        player: address,
        score: u64,
        enemies_killed: u64,
        power_ups_collected: u64,
        timestamp: u64,
    }

    /// Global leaderboard state
    public struct GlobalLeaderboard has key {
        id: UID,
        top_scores: vector<ScoreEntry>,
        daily_scores: vector<ScoreEntry>,
        daily_reset_epoch: u64,
        player_best: Table<address, PlayerBest>,
        admin: address,
    }

    /// Player's personal best and stats
    public struct PlayerBest has store {
        best_score: u64,
        total_games: u64,
        total_kills: u64,
        total_powerups: u64,
    }

    /// Initialize the leaderboard
    fun init(ctx: &mut TxContext) {
        let leaderboard = GlobalLeaderboard {
            id: object::new(ctx),
            top_scores: vector::empty(),
            daily_scores: vector::empty(),
            daily_reset_epoch: tx_context::epoch(ctx),
            player_best: table::new(ctx),
            admin: tx_context::sender(ctx),
        };

        transfer::share_object(leaderboard);
    }

    /// Submit a game score
    public entry fun submit_score(
        leaderboard: &mut GlobalLeaderboard,
        score: u64,
        enemies_killed: u64,
        power_ups_collected: u64,
        ctx: &mut TxContext
    ) {
        assert!(score > 0, E_INVALID_SCORE);

        let player = tx_context::sender(ctx);
        let timestamp = tx_context::epoch(ctx);

        // Reset daily leaderboard if needed (every 1 epoch ~24 hours)
        if (timestamp > leaderboard.daily_reset_epoch) {
            leaderboard.daily_scores = vector::empty();
            leaderboard.daily_reset_epoch = timestamp;
        };

        let entry = ScoreEntry {
            player,
            score,
            enemies_killed,
            power_ups_collected,
            timestamp,
        };

        // Update global leaderboard
        insert_score(&mut leaderboard.top_scores, entry, MAX_GLOBAL_ENTRIES);

        // Update daily leaderboard
        insert_score(&mut leaderboard.daily_scores, entry, MAX_DAILY_ENTRIES);

        // Update player's personal best
        if (!table::contains(&leaderboard.player_best, player)) {
            table::add(&mut leaderboard.player_best, player, PlayerBest {
                best_score: score,
                total_games: 1,
                total_kills: enemies_killed,
                total_powerups: power_ups_collected,
            });
        } else {
            let best = table::borrow_mut(&mut leaderboard.player_best, player);
            if (score > best.best_score) {
                best.best_score = score;
            };
            best.total_games = best.total_games + 1;
            best.total_kills = best.total_kills + enemies_killed;
            best.total_powerups = best.total_powerups + power_ups_collected;
        };
    }

    /// Insert score into leaderboard (sorted by score descending)
    fun insert_score(scores: &mut vector<ScoreEntry>, entry: ScoreEntry, max_size: u64) {
        let len = vector::length(scores);
        
        // Find insertion position
        let mut i = 0;
        let mut insert_pos = len;
        
        while (i < len) {
            let existing = vector::borrow(scores, i);
            if (entry.score > existing.score) {
                insert_pos = i;
                break
            };
            i = i + 1;
        };

        // Insert at position
        if (insert_pos < max_size) {
            vector::insert(scores, entry, insert_pos);
            
            // Remove last if exceeded max size
            if (vector::length(scores) > max_size) {
                vector::pop_back(scores);
            };
        };
    }

    /// Get top N scores from global leaderboard
    public fun get_top_scores(leaderboard: &GlobalLeaderboard, limit: u64): vector<ScoreEntry> {
        let len = vector::length(&leaderboard.top_scores);
        let mut result = vector::empty<ScoreEntry>();
        
        let count = if (limit < len) { limit } else { len };
        let mut i = 0;
        
        while (i < count) {
            vector::push_back(&mut result, *vector::borrow(&leaderboard.top_scores, i));
            i = i + 1;
        };
        
        result
    }

    /// Get top N scores from daily leaderboard
    public fun get_daily_scores(leaderboard: &GlobalLeaderboard, limit: u64): vector<ScoreEntry> {
        let len = vector::length(&leaderboard.daily_scores);
        let mut result = vector::empty<ScoreEntry>();
        
        let count = if (limit < len) { limit } else { len };
        let mut i = 0;
        
        while (i < count) {
            vector::push_back(&mut result, *vector::borrow(&leaderboard.daily_scores, i));
            i = i + 1;
        };
        
        result
    }

    /// Get player's rank in global leaderboard (1-indexed, 0 if not ranked)
    public fun get_player_rank(leaderboard: &GlobalLeaderboard, player: address): u64 {
        let len = vector::length(&leaderboard.top_scores);
        let mut i = 0;
        
        while (i < len) {
            let entry = vector::borrow(&leaderboard.top_scores, i);
            if (entry.player == player) {
                return i + 1
            };
            i = i + 1;
        };
        
        0 // Not ranked
    }

    /// Get player's personal best
    public fun get_player_best(leaderboard: &GlobalLeaderboard, player: address): (u64, u64, u64, u64) {
        if (table::contains(&leaderboard.player_best, player)) {
            let best = table::borrow(&leaderboard.player_best, player);
            (best.best_score, best.total_games, best.total_kills, best.total_powerups)
        } else {
            (0, 0, 0, 0)
        }
    }

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx);
    }
}
