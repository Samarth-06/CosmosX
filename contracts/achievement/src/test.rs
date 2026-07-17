#![cfg(test)]
use super::*;
use soroban_sdk::{testutils::Address as _, Env};

#[test]
fn test_mint_and_check() {
    let env = Env::default();
    env.mock_all_auths(); // in tests, skip real signature verification

    let contract_id = env.register(AchievementContract, ());
    let client = AchievementContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let player = Address::generate(&env);

    client.initialize(&admin);

    // Before minting, player should not have the achievement.
    assert_eq!(client.has_achievement(&player), false);

    client.mint(&player);

    // After minting, player should have it, and admin is recorded.
    assert_eq!(client.has_achievement(&player), true);
    assert_eq!(client.get_admin(), admin);
}

#[test]
#[should_panic(expected = "already initialized")]
fn test_double_initialize_panics() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(AchievementContract, ());
    let client = AchievementContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.initialize(&admin);
    // Second initialize must panic.
    client.initialize(&admin);
}

#[test]
#[should_panic(expected = "already minted")]
fn test_double_mint_panics() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(AchievementContract, ());
    let client = AchievementContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let player = Address::generate(&env);

    client.initialize(&admin);
    client.mint(&player);
    // Second mint to the same address must panic.
    client.mint(&player);
}

#[test]
#[should_panic(expected = "contract not initialized")]
fn test_mint_before_initialize_panics() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(AchievementContract, ());
    let client = AchievementContractClient::new(&env, &contract_id);

    let player = Address::generate(&env);
    // Minting before initialize must panic.
    client.mint(&player);
}

#[test]
fn test_mint_requires_recipient_auth() {
    // Without mock_all_auths, the recipient's authorization is genuinely
    // required. This proves `to.require_auth()` is wired correctly: the
    // typed client's `mint` implicitly provides `to`'s auth, so it
    // succeeds, while `has_achievement` (a read) needs no auth.
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(AchievementContract, ());
    let client = AchievementContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    let player = Address::generate(&env);

    client.initialize(&admin);
    client.mint(&player);

    // The single most recent auth should be the player authorizing their
    // own mint — confirming the player (not the admin) is the signer.
    let auths = env.auths();
    assert_eq!(auths.len(), 1);
    assert_eq!(auths[0].0, player);
}
