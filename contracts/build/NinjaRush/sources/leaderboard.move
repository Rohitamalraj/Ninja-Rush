module ninja_rush::leaderboard {
    use std::signer;
    use std::vector;
    use aptos_framework::timestamp;
    use std::string::{Self, String};

    /// Error codes
    const E_NOT_INITIALIZED: u64 = 1;
    const E_INVALID_SCORE: u64 = 2;
    const E_NAME_TOO_LONG: u64 = 3;
    const E_NOT_AUTHORIZED: u64 = 4;

    /// Maximum name length
    const MAX_NAME_LENGTH: u64 = 20;

    /// Leaderboard entry
    struct LeaderboardEntry has store, drop, copy {
        player: address,
        player_name: String,
        score: u64,
        timestamp: u64,
        enemies_killed: u64,
        power_ups_collected: u64,
    }

    /// Global leaderboard (top 100)
    struct GlobalLeaderboard has key {
        entries: vector<LeaderboardEntry>,
        total_submissions: u64,
        admin: address,
    }

    /// Player's personal best scores
    struct PersonalBest has key {
        best_score: u64,
        total_games: u64,
        total_enemies_killed: u64,
        total_power_ups: u64,
        first_played: u64,
        last_played: u64,
    }

    /// Daily leaderboard (resets every 24 hours)
    struct DailyLeaderboard has key {
        entries: vector<LeaderboardEntry>,
        day_start: u64,
        admin: address,
    }

    /// Initialize leaderboard system
    public entry fun initialize(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        assert!(!exists<GlobalLeaderboard>(admin_addr), E_NOT_INITIALIZED);

        move_to(admin, GlobalLeaderboard {
            entries: vector::empty<LeaderboardEntry>(),
            total_submissions: 0,
            admin: admin_addr,
        });

        let current_time = timestamp::now_seconds();
        move_to(admin, DailyLeaderboard {
            entries: vector::empty<LeaderboardEntry>(),
            day_start: current_time,
            admin: admin_addr,
        });
    }

    /// Submit score to leaderboard
    public entry fun submit_score(
        player: &signer,
        leaderboard_addr: address,
        player_name: String,
        score: u64,
        enemies_killed: u64,
        power_ups_collected: u64,
    ) acquires GlobalLeaderboard, PersonalBest, DailyLeaderboard {
        let player_addr = signer::address_of(player);
        
        // Validate input
        assert!(score > 0, E_INVALID_SCORE);
        assert!(string::length(&player_name) <= MAX_NAME_LENGTH, E_NAME_TOO_LONG);

        let current_time = timestamp::now_seconds();

        // Create entry
        let entry = LeaderboardEntry {
            player: player_addr,
            player_name,
            score,
            timestamp: current_time,
            enemies_killed,
            power_ups_collected,
        };

        // Update global leaderboard
        let global = borrow_global_mut<GlobalLeaderboard>(leaderboard_addr);
        insert_entry(&mut global.entries, entry, 100); // Keep top 100
        global.total_submissions = global.total_submissions + 1;

        // Update daily leaderboard
        let daily = borrow_global_mut<DailyLeaderboard>(leaderboard_addr);
        let one_day = 86400; // 24 hours in seconds
        if (current_time - daily.day_start >= one_day) {
            // Reset daily leaderboard
            daily.entries = vector::empty<LeaderboardEntry>();
            daily.day_start = current_time;
        };
        insert_entry(&mut daily.entries, entry, 50); // Keep top 50 daily

        // Update personal best
        if (!exists<PersonalBest>(player_addr)) {
            move_to(player, PersonalBest {
                best_score: score,
                total_games: 1,
                total_enemies_killed: enemies_killed,
                total_power_ups: power_ups_collected,
                first_played: current_time,
                last_played: current_time,
            });
        } else {
            let personal = borrow_global_mut<PersonalBest>(player_addr);
            if (score > personal.best_score) {
                personal.best_score = score;
            };
            personal.total_games = personal.total_games + 1;
            personal.total_enemies_killed = personal.total_enemies_killed + enemies_killed;
            personal.total_power_ups = personal.total_power_ups + power_ups_collected;
            personal.last_played = current_time;
        };
    }

    /// Insert entry into sorted leaderboard (descending by score)
    fun insert_entry(entries: &mut vector<LeaderboardEntry>, new_entry: LeaderboardEntry, max_size: u64) {
        let len = vector::length(entries);
        let insert_pos = len;

        // Find insertion position
        let i = 0;
        while (i < len) {
            let entry = vector::borrow(entries, i);
            if (new_entry.score > entry.score) {
                insert_pos = i;
                break
            };
            i = i + 1;
        };

        // Insert entry
        if (insert_pos < max_size) {
            if (insert_pos == len) {
                vector::push_back(entries, new_entry);
            } else {
                vector::insert(entries, insert_pos, new_entry);
            };

            // Trim to max size
            while (vector::length(entries) > max_size) {
                vector::pop_back(entries);
            };
        };
    }

    /// Get top N entries from global leaderboard
    #[view]
    public fun get_top_scores(leaderboard_addr: address, count: u64): vector<LeaderboardEntry> acquires GlobalLeaderboard {
        if (!exists<GlobalLeaderboard>(leaderboard_addr)) {
            return vector::empty<LeaderboardEntry>()
        };

        let global = borrow_global<GlobalLeaderboard>(leaderboard_addr);
        let len = vector::length(&global.entries);
        let max_count = if (count > len) { len } else { count };

        let result = vector::empty<LeaderboardEntry>();
        let i = 0;
        while (i < max_count) {
            let entry = *vector::borrow(&global.entries, i);
            vector::push_back(&mut result, entry);
            i = i + 1;
        };

        result
    }

    /// Get daily leaderboard
    #[view]
    public fun get_daily_leaderboard(leaderboard_addr: address): vector<LeaderboardEntry> acquires DailyLeaderboard {
        if (!exists<DailyLeaderboard>(leaderboard_addr)) {
            return vector::empty<LeaderboardEntry>()
        };

        let daily = borrow_global<DailyLeaderboard>(leaderboard_addr);
        daily.entries
    }

    /// Get player's rank in global leaderboard
    #[view]
    public fun get_player_rank(leaderboard_addr: address, player_addr: address): u64 acquires GlobalLeaderboard {
        if (!exists<GlobalLeaderboard>(leaderboard_addr)) {
            return 0
        };

        let global = borrow_global<GlobalLeaderboard>(leaderboard_addr);
        let len = vector::length(&global.entries);
        
        let i = 0;
        while (i < len) {
            let entry = vector::borrow(&global.entries, i);
            if (entry.player == player_addr) {
                return i + 1 // Rank is 1-indexed
            };
            i = i + 1;
        };

        0 // Not in top 100
    }

    /// Get player's personal best
    #[view]
    public fun get_personal_best(player_addr: address): (u64, u64, u64, u64) acquires PersonalBest {
        if (exists<PersonalBest>(player_addr)) {
            let personal = borrow_global<PersonalBest>(player_addr);
            (
                personal.best_score,
                personal.total_games,
                personal.total_enemies_killed,
                personal.total_power_ups
            )
        } else {
            (0, 0, 0, 0)
        }
    }

    /// Get total submissions count
    #[view]
    public fun get_total_submissions(leaderboard_addr: address): u64 acquires GlobalLeaderboard {
        if (exists<GlobalLeaderboard>(leaderboard_addr)) {
            let global = borrow_global<GlobalLeaderboard>(leaderboard_addr);
            global.total_submissions
        } else {
            0
        }
    }

    #[test_only]
    public fun initialize_for_test(admin: &signer) {
        initialize(admin);
    }
}
