# Sandbox Test Suite Summary

## Overview

A comprehensive test suite has been created for the sandbox functionality in Claudia. The test suite validates that the sandboxing operations using the `gaol` crate work correctly across different platforms (Linux, macOS, FreeBSD).

## Test Structure Created

### 1. **Test Organization** (`tests/sandbox_tests.rs`)
- Main entry point for all sandbox tests
- Integrates all test modules

### 2. **Common Test Utilities** (`tests/sandbox/common/`)
- **fixtures.rs**: Test data, database setup, file system creation, and standard profiles
- **helpers.rs**: Helper functions, platform detection, test command execution, and code generation

### 3. **Unit Tests** (`tests/sandbox/unit/`)
- **profile_builder.rs**: Tests for ProfileBuilder including rule parsing, platform filtering, and template expansion
- **platform.rs**: Tests for platform capability detection and operation support levels
- **executor.rs**: Tests for SandboxExecutor creation and command preparation

### 4. **Integration Tests** (`tests/sandbox/integration/`)
- **file_operations.rs**: Tests file access control (allowed/forbidden reads, writes, metadata)
- **network_operations.rs**: Tests network access control (TCP, local sockets, port filtering)
- **system_info.rs**: Tests system information access (platform-specific)
- **process_isolation.rs**: Tests process spawning restrictions (fork, exec, threads)
- **violations.rs**: Tests violation detection and patterns

### 5. **End-to-End Tests** (`tests/sandbox/e2e/`)
- **agent_sandbox.rs**: Tests agent execution with sandbox profiles
- **claude_sandbox.rs**: Tests Claude command execution with sandboxing

## Key Features

### Platform Support
- **Cross-platform testing**: Tests adapt to platform capabilities
- **Skip unsupported**: Tests gracefully skip on unsupported platforms
- **Platform-specific tests**: Special tests for platform-specific features

### Test Helpers
- **Test binary creation**: Dynamically compiles test programs
- **Mock file systems**: Creates temporary test environments
- **Database fixtures**: Sets up test databases with profiles
- **Assertion helpers**: Specialized assertions for sandbox behavior

### Safety Features
- **Serial execution**: Tests run serially to avoid conflicts
- **Timeout handling**: Commands have timeout protection
- **Resource cleanup**: Temporary files and resources are cleaned up

## Running the Tests

```bash
# Run all sandbox tests
cargo test --test sandbox_tests

# Run specific categories
cargo test --test sandbox_tests unit::
cargo test --test sandbox_tests integration::
cargo test --test sandbox_tests e2e:: -- --ignored

# Run with output
cargo test --test sandbox_tests -- --nocapture

# Run serially (required for some tests)
cargo test --test sandbox_tests -- --test-threads=1
```

## Test Coverage

The test suite covers:

1. **Profile Management**
   - Profile creation and validation
   - Rule parsing and conflicts
   - Template variable expansion
   - Platform compatibility

2. **File Operations**
   - Allowed file reads
   - Forbidden file access
   - File write prevention
   - Metadata operations

3. **Network Operations**
   - Network access control
   - Port-specific rules (macOS)
   - Local socket connections

4. **Process Isolation**
   - Process spawn prevention
   - Fork/exec blocking
   - Thread creation (allowed)

5. **System Information**
   - Platform-specific access control
   - macOS sysctl operations

6. **Violation Tracking**
   - Violation detection
   - Pattern matching
   - Multiple violations

## Platform-Specific Behavior

| Feature | Linux | macOS | FreeBSD |
|---------|-------|-------|---------|
| File Read Control | ✅ | ✅ | ❌ |
| Metadata Read | 🟡¹ | ✅ | ❌ |
| Network All | ✅ | ✅ | ❌ |
| Network TCP Port | ❌ | ✅ | ❌ |
| Network Local Socket | ❌ | ✅ | ❌ |
| System Info Read | ❌ | ✅ | ✅² |

¹ Cannot be precisely controlled on Linux
² Always allowed on FreeBSD

## Dependencies Added

```toml
[dev-dependencies]
tempfile = "3"
serial_test = "3"
test-case = "3"
once_cell = "1"
proptest = "1"
pretty_assertions = "1"
```

## Next Steps

1. **CI Integration**: Configure CI to run sandbox tests on multiple platforms
2. **Performance Tests**: Add benchmarks for sandbox overhead
3. **Stress Tests**: Test with many simultaneous sandboxed processes
4. **Mock Claude**: Create mock Claude command for E2E tests without dependencies
5. **Coverage Report**: Generate test coverage reports

## Notes

- Some E2E tests are marked `#[ignore]` as they require Claude to be installed
- Integration tests use `serial_test` to prevent conflicts
- Test binaries are compiled on-demand for realistic testing
- The test suite gracefully handles platform limitations 