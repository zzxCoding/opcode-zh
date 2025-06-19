#[allow(unused)]
pub mod profile;
#[allow(unused)]
pub mod executor;
#[allow(unused)]
pub mod platform;
#[allow(unused)]
pub mod defaults;

// These are used in agents.rs and claude.rs via direct module paths
#[allow(unused)]
pub use profile::{SandboxProfile, SandboxRule, ProfileBuilder};
// These are used in main.rs and sandbox.rs
#[allow(unused)]
pub use executor::{SandboxExecutor, should_activate_sandbox};
// These are used in sandbox.rs
#[allow(unused)]
pub use platform::{PlatformCapabilities, get_platform_capabilities};
// Used for initial setup
#[allow(unused)]
pub use defaults::create_default_profiles; 