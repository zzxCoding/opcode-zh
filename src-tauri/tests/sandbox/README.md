# Sandbox Test Suite

This directory contains a comprehensive test suite for the sandbox functionality in Claudia. The tests are designed to verify that the sandboxing operations work correctly across different platforms (Linux, macOS, FreeBSD).

## Test Structure

```
sandbox/
├── common/           # Shared test utilities
│   ├── fixtures.rs   # Test data and environment setup
│   └── helpers.rs    # Helper functions and assertions
├── unit/            # Unit tests for individual components
│   ├── profile_builder.rs  # ProfileBuilder tests
│   ├── platform.rs        # Platform capability tests
│   └── executor.rs        # SandboxExecutor tests
├── integration/     # Integration tests for sandbox operations
│   ├── file_operations.rs    # File access control tests
│   ├── network_operations.rs # Network access control tests
│   ├── system_info.rs       # System info access tests
│   ├── process_isolation.rs # Process spawning tests
│   └── violations.rs        # Violation detection tests
└── e2e/            # End-to-end tests
    ├── agent_sandbox.rs    # Agent execution with sandbox
    └── claude_sandbox.rs   # Claude command with sandbox
```

## Running Tests

### Run all sandbox tests:
```bash
cargo test --test sandbox_tests
```

### Run specific test categories:
```bash
# Unit tests only
cargo test --test sandbox_tests unit::

# Integration tests only
cargo test --test sandbox_tests integration::

# End-to-end tests only (requires Claude to be installed)
cargo test --test sandbox_tests e2e:: -- --ignored
```

### Run tests with output:
```bash
cargo test --test sandbox_tests -- --nocapture
```

### Run tests serially (required for some integration tests):
```bash
cargo test --test sandbox_tests -- --test-threads=1
```

## Test Coverage

### Unit Tests

1. **ProfileBuilder Tests** (`unit/profile_builder.rs`)
   - Profile creation and validation
   - Rule parsing and platform filtering
   - Template variable expansion
   - Invalid operation handling

2. **Platform Tests** (`unit/platform.rs`)
   - Platform capability detection
   - Operation support levels
   - Cross-platform compatibility

3. **Executor Tests** (`unit/executor.rs`)
   - Sandbox executor creation
   - Command preparation
   - Environment variable handling

### Integration Tests

1. **File Operations** (`integration/file_operations.rs`)
   - ✅ Allowed file reads succeed
   - ❌ Forbidden file reads fail
   - ❌ File writes always fail
   - 📊 Metadata operations respect permissions
   - 🔄 Template variable expansion works

2. **Network Operations** (`integration/network_operations.rs`)
   - ✅ Allowed network connections succeed
   - ❌ Forbidden network connections fail
   - 🎯 Port-specific rules (macOS only)
   - 🔌 Local socket connections

3. **System Information** (`integration/system_info.rs`)
   - 🍎 macOS: Can be allowed/forbidden
   - 🐧 Linux: Never allowed
   - 👹 FreeBSD: Always allowed

4. **Process Isolation** (`integration/process_isolation.rs`)
   - ❌ Process spawning forbidden
   - ❌ Fork/exec operations blocked
   - ✅ Thread creation allowed

5. **Violations** (`integration/violations.rs`)
   - 🚨 Violation detection
   - 📝 Violation patterns
   - 🔢 Multiple violations handling

### End-to-End Tests

1. **Agent Sandbox** (`e2e/agent_sandbox.rs`)
   - Agent execution with profiles
   - Profile switching
   - Violation logging

2. **Claude Sandbox** (`e2e/claude_sandbox.rs`)
   - Claude command sandboxing
   - Settings integration
   - Session management

## Platform Support

| Feature | Linux | macOS | FreeBSD |
|---------|-------|-------|---------|
| File Read Control | ✅ | ✅ | ❌ |
| Metadata Read | 🟡¹ | ✅ | ❌ |
| Network All | ✅ | ✅ | ❌ |
| Network TCP Port | ❌ | ✅ | ❌ |
| Network Local Socket | ❌ | ✅ | ❌ |
| System Info Read | ❌ | ✅ | ✅² |

¹ Cannot be precisely controlled on Linux (allowed if file read is allowed)
² Always allowed on FreeBSD (cannot be restricted)

## Important Notes

1. **Serial Execution**: Many integration tests are marked with `#[serial]` and must run one at a time to avoid conflicts.

2. **Platform Dependencies**: Some tests will be skipped on unsupported platforms. The test suite handles this gracefully.

3. **Privilege Requirements**: Sandbox tests generally don't require elevated privileges, but some operations may fail in restricted environments (e.g., CI).

4. **Claude Dependency**: E2E tests that actually execute Claude are marked with `#[ignore]` by default. Run with `--ignored` flag when Claude is installed.

## Debugging Failed Tests

1. **Enable Logging**: Set `RUST_LOG=debug` to see detailed sandbox operations
2. **Check Platform**: Verify the test is supported on your platform
3. **Check Permissions**: Ensure test binaries can be created and executed
4. **Inspect Output**: Use `--nocapture` to see all test output

## Adding New Tests

1. Choose the appropriate category (unit/integration/e2e)
2. Use the test helpers from `common/`
3. Mark with `#[serial]` if the test modifies global state
4. Use `skip_if_unsupported!()` macro for platform-specific tests
5. Document any special requirements or limitations 