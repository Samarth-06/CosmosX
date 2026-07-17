#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, Map};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Admin,
    Achievements,
}

#[contract]
pub struct AchievementContract;

#[contractimpl]
impl AchievementContract {
    /// Runs once, right after deployment, to record who deployed/owns this
    /// contract. Panics if called a second time so the admin can't be
    /// silently reassigned after setup.
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
    }

    /// Grants the achievement to `to`.
    ///
    /// Design choice (CosmosX): we require `to.require_auth()`, NOT the
    /// admin's. This means the *player's own connected wallet* must sign
    /// their own claim — the on-stage demo flow where the player presses
    /// "Claim" and approves it in Freighter. Nobody can mint an achievement
    /// to an address that didn't itself authorize the call.
    pub fn mint(env: Env, to: Address) {
        // Guard: contract must have been initialized first.
        if !env.storage().instance().has(&DataKey::Admin) {
            panic!("contract not initialized");
        }

        // Access control: the recipient must have authorized this call.
        to.require_auth();

        let mut achievements: Map<Address, bool> = env
            .storage()
            .instance()
            .get(&DataKey::Achievements)
            .unwrap_or(Map::new(&env));

        // Prevent a second mint to the same address (idempotency guard).
        if achievements.get(to.clone()).unwrap_or(false) {
            panic!("already minted");
        }

        achievements.set(to.clone(), true);
        env.storage()
            .instance()
            .set(&DataKey::Achievements, &achievements);

        // Emit an event so off-chain code (the frontend) can react to the
        // mint without re-reading storage.
        env.events().publish((symbol_short!("mint"),), to);
    }

    /// Read-only: does `who` have the achievement?
    pub fn has_achievement(env: Env, who: Address) -> bool {
        let achievements: Map<Address, bool> = env
            .storage()
            .instance()
            .get(&DataKey::Achievements)
            .unwrap_or(Map::new(&env));

        achievements.get(who).unwrap_or(false)
    }

    /// Read-only: who is the admin (deployer/owner) of this contract?
    pub fn get_admin(env: Env) -> Address {
        env.storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("contract not initialized")
    }
}

mod test;
